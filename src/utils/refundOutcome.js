// Outcome of POST /payments/refunds (account-service), shared by the Online Payments grid and the
// member Finance tab. A 200 is NOT always a completed refund:
//   200 data.status "pending"          -> submitted, pending with the provider (not refunded yet)
//   200 data.status "succeeded"/absent -> completed
//   503 REFUND_OUTCOME_UNCERTAIN       -> held for finance reconciliation; must not be retried
//   502 / REFUND_PROVIDER_*            -> provider failure
//   409 REFUND_*                       -> blocked by a server-side refund rule (clear message)
// Pure: no network, no UI imports. Callers pass their own notifier (antd message / notification).

export const REFUND_PENDING_TEXT = "Refund submitted, pending with provider";
export const REFUND_UNCERTAIN_TEXT =
  "Refund outcome uncertain — finance will reconcile; do not retry with a different amount";

const PENDING_STATUSES = new Set(["pending", "processing", "requires_action"]);
const FAILED_STATUSES = new Set(["failed", "canceled", "cancelled"]);

/** 409 refund codes (account-service #38) -> user-facing text. Prefix rules cover families. */
export const REFUND_CONFLICT_MESSAGES = Object.freeze({
  REFUND_FLOW_UNSUPPORTED: "This payment can't be refunded from here; this refund flow is not supported for it.",
  REFUND_PENDING_FINANCE_ALLOCATION:
    "This payment is still waiting for finance allocation. Refund it once finance has allocated it.",
  REFUND_CREDIT_PERIOD_UNRESOLVED:
    "The credit period for this refund could not be determined. Ask finance to resolve it before refunding.",
  REFUND_MEMBER_CREDIT_UNAVAILABLE:
    "The refund is more than the available refundable credit (or another refund is in progress).",
  REFUND_TARGET_MISMATCH: "The selected payment does not belong to this member/application. Refresh and try again.",
  REFUND_LINK_CONFLICT: "This payment is linked to a different member or application. Ask finance to review the link.",
});

const CONFLICT_PREFIX_MESSAGES = Object.freeze([
  [
    "REFUND_INCONSISTENT_",
    "The payment and ledger records are inconsistent for this refund. Finance needs to review it before it can be refunded.",
  ],
  [
    "REFUND_APPLICATION_STATE_",
    "The application's current state could not be confirmed for this refund. Refresh and try again, or ask finance to review.",
  ],
]);

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

/** Response body of a 2xx -> { outcome, providerStatus, operationId }. Reads the res.success `data`. */
export function interpretRefundSuccess(body) {
  const data = body && typeof body === "object" && body.data && typeof body.data === "object" ? body.data : {};
  const status = str(data.status).toLowerCase();
  const operationId = str(data.operationId) || null;
  if (data.pending === true || PENDING_STATUSES.has(status)) {
    return { outcome: "pending", status: status || "pending", operationId };
  }
  if (FAILED_STATUSES.has(status)) {
    return { outcome: "failed", status, operationId };
  }
  return { outcome: "succeeded", status: status || null, operationId };
}

/** axios error -> { outcome, code, httpStatus, message }. */
export function interpretRefundError(error) {
  const httpStatus = Number(error?.response?.status) || null;
  const body = error?.response?.data || {};
  const code = str(body.code || body?.details?.code || body?.error?.code) || null;
  const backendMessage =
    str(body.message) || (typeof body.error === "string" ? str(body.error) : "") || str(error?.message);

  if (code === "REFUND_OUTCOME_UNCERTAIN") {
    return { outcome: "uncertain", code, httpStatus, message: REFUND_UNCERTAIN_TEXT };
  }
  if ((code && code.startsWith("REFUND_PROVIDER_")) || httpStatus === 502) {
    return {
      outcome: "failed",
      code,
      httpStatus,
      message: `Refund failed at the payment provider${backendMessage ? `: ${backendMessage}` : "."}`,
    };
  }
  if (code && REFUND_CONFLICT_MESSAGES[code]) {
    return { outcome: "blocked", code, httpStatus, message: REFUND_CONFLICT_MESSAGES[code] };
  }
  const prefix = code ? CONFLICT_PREFIX_MESSAGES.find(([p]) => code.startsWith(p)) : null;
  if (prefix) {
    return { outcome: "blocked", code, httpStatus, message: prefix[1] };
  }
  return { outcome: "error", code, httpStatus, message: backendMessage || "Unable to process refund." };
}

/**
 * Run a refund request and report the outcome through `notify(level, text)`.
 * Hooks: onCompleted (refund done), onPending (submitted, not done), onUncertain (held for
 * reconciliation), onFailed (2xx carrying a failed provider status) - callers refresh their data
 * from these; none marks a row refunded.
 * `describeError(interpreted, error)` lets a caller append context to generic errors.
 * Returns the interpreted outcome; `ok` is true when the drawer should close (request accepted
 * or held - not retryable from the drawer).
 */
export async function runRefundRequest({
  request,
  notify,
  successText = "Refund processed successfully.",
  onCompleted,
  onPending,
  onUncertain,
  onFailed,
  describeError,
}) {
  let response;
  try {
    response = await request();
  } catch (error) {
    const interpreted = interpretRefundError(error);
    if (interpreted.outcome === "uncertain") {
      notify("warning", interpreted.message);
      if (onUncertain) await onUncertain(interpreted);
      return { ...interpreted, ok: true };
    }
    const text = describeError ? describeError(interpreted, error) : interpreted.message;
    notify("error", text);
    return { ...interpreted, ok: false };
  }
  const result = interpretRefundSuccess(response?.data);
  if (result.outcome === "pending") {
    notify("info", REFUND_PENDING_TEXT);
    if (onPending) await onPending(result);
    return { ...result, ok: true };
  }
  if (result.outcome === "failed") {
    notify("error", "Refund failed at the payment provider.");
    if (onFailed) await onFailed(result);
    return { ...result, ok: false };
  }
  notify("success", successText);
  if (onCompleted) await onCompleted(result);
  return { ...result, ok: true };
}

/** Generic error text plus the server's remainingRefundableCents hint (member Finance tab, as before). */
export function withRemainingRefundableHint(error, text) {
  const raw =
    error?.response?.data?.remainingRefundableCents ?? error?.response?.data?.data?.remainingRefundableCents;
  const cents = raw === null || raw === undefined || raw === "" ? NaN : Number(raw);
  const base = text || "Unable to submit refund request.";
  if (!Number.isFinite(cents)) return base;
  const euro = (cents / 100).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${base} Max refundable amount: €${euro}.`;
}

/** antd `message` adapter (Online Payments). */
export const notifyViaMessage = (messageApi) => (level, text) => {
  const fn = messageApi?.[level] || messageApi?.info;
  if (fn) fn(text);
};

/** antd `notification` adapter (member Finance tab). */
export const notifyViaNotification = (notificationApi, title = "Refund") => (level, text) => {
  const fn = notificationApi?.[level] || notificationApi?.info;
  const heading =
    level === "error"
      ? "Refund failed"
      : level === "warning"
        ? "Refund outcome uncertain"
        : level === "info"
          ? "Refund pending"
          : title;
  if (fn) fn({ message: heading, description: text, placement: "topRight" });
};
