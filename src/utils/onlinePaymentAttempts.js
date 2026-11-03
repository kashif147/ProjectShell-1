// Online Payments grid <- account-service GET /payments/attempts (one row per persisted Payment
// attempt: pending / authorised / captured / cancelled / failed / refunded). Pure helpers only:
// query building, response unwrapping, row mapping, status labels and action gating. The server's
// `actions.canRefund` is the only refund gate here; POST /payments/refunds re-checks everything.
import dayjs from "dayjs";
import { parseFlexibleDate } from "./filterUtils";

export const ATTEMPT_QUERY_KEYS = Object.freeze([
  "status",
  "purpose",
  "mode",
  "applicationId",
  "registrationId",
  "from",
  "to",
  "limit",
  "cursor",
]);

export const ATTEMPTS_MAX_LIMIT = 200;
export const ATTEMPTS_PAGE_SIZE = 200;

/** Server lifecycleStatus -> grid label. An authorised hold is never labelled paid/captured. */
export const LIFECYCLE_STATUS_LABELS = Object.freeze({
  pending: "Pending",
  authorised: "Authorised (not captured)",
  captured: "Captured",
  cancelled: "Cancelled",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  unknown: "Unknown",
});

export const LIFECYCLE_STATUSES = Object.freeze(Object.keys(LIFECYCLE_STATUS_LABELS));

/** Filter dropdown options for "Payment Status" on the Online Payments screen. */
export const ONLINE_PAYMENT_STATUS_FILTER_OPTIONS = Object.freeze(
  LIFECYCLE_STATUSES.map((s) => LIFECYCLE_STATUS_LABELS[s]),
);

const LABEL_TO_LIFECYCLE = new Map(
  LIFECYCLE_STATUSES.map((s) => [LIFECYCLE_STATUS_LABELS[s].toLowerCase(), s]),
);
// Codes typed/stored directly, plus labels saved by views made against the old receipts grid
// (its static options were Paid / Pending / Failed / Refunded).
LIFECYCLE_STATUSES.forEach((s) => LABEL_TO_LIFECYCLE.set(s, s));
LABEL_TO_LIFECYCLE.set("authorised", "authorised");
LABEL_TO_LIFECYCLE.set("partially refunded", "partially_refunded");
LABEL_TO_LIFECYCLE.set("paid", "captured");

export function lifecycleLabel(status) {
  return LIFECYCLE_STATUS_LABELS[status] || LIFECYCLE_STATUS_LABELS.unknown;
}

/** Selected "Payment Status" filter labels -> lifecycle codes (unrecognised values dropped). */
export function statusLabelsToLifecycle(values = []) {
  const out = [];
  (Array.isArray(values) ? values : []).forEach((v) => {
    const code = LABEL_TO_LIFECYCLE.get(String(v ?? "").trim().toLowerCase());
    if (code && !out.includes(code)) out.push(code);
  });
  return out;
}

const nonEmpty = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === "number") return Number.isFinite(v);
  return String(v).trim() !== "";
};

/**
 * "Payment Status" filter state -> lifecycle codes to send as `status`, or null for no server
 * status filter. "!=" sends the complement (the API has no exclusion operator).
 */
export function statusFilterToServerStatuses(config) {
  const selected = (config?.selectedValues || []).filter(nonEmpty);
  if (!selected.length) return null;
  const codes = statusLabelsToLifecycle(selected);
  if (config?.operator === "!=") {
    const rest = LIFECYCLE_STATUSES.filter((s) => !codes.includes(s));
    return rest.length === LIFECYCLE_STATUSES.length ? null : rest;
  }
  // Only unrecognised values selected: nothing can match them.
  return codes.length ? codes : [];
}

const isoDay = (d) => d.format("YYYY-MM-DD");

/**
 * "Payment Date" filter state -> { from, to } (attempt createdAt, whole days). Operators the API
 * can't express ("!=") return {} and stay client-side only.
 */
export function dateFilterToServerRange(config, now = dayjs()) {
  const values = (config?.selectedValues || []).filter(nonEmpty);
  if (!values.length) return {};
  const op = config?.operator || "between";
  if (op === "between") {
    const start = parseFlexibleDate(values[0]);
    const end = parseFlexibleDate(values[1]);
    if (!start || !end) return {};
    return { from: isoDay(start), to: isoDay(end) };
  }
  if (op === "within" || op === "more_than") {
    const amount = Number(values[0]);
    if (!Number.isFinite(amount)) return {};
    const threshold = dayjs(now).subtract(amount, values[1] || "days");
    return op === "within" ? { from: isoDay(threshold) } : { to: isoDay(threshold) };
  }
  if (op === "==" || op === "equal_to") {
    const day = parseFlexibleDate(values[0]);
    return day ? { from: isoDay(day), to: isoDay(day) } : {};
  }
  return {};
}

/** filtersState (label-keyed) -> server-side attempt filters. */
export function serverFiltersFromFiltersState(filtersState = {}) {
  const out = {};
  const statuses = statusFilterToServerStatuses(filtersState?.["Payment Status"]);
  if (statuses) out.statuses = statuses;
  Object.assign(out, dateFilterToServerRange(filtersState?.["Payment Date"]));
  return out;
}

/** Labels evaluated server-side; removed before the client-side filter pass. */
export const SERVER_SIDE_FILTER_LABELS = Object.freeze(["Payment Status"]);

export function withoutServerSideFilters(filtersState = {}) {
  const next = { ...(filtersState || {}) };
  SERVER_SIDE_FILTER_LABELS.forEach((label) => delete next[label]);
  return next;
}

/**
 * Query params for GET /payments/attempts. Only the endpoint's allowed keys are ever emitted
 * (an unknown key is a 400); mode is always "stripe" (the grid's existing Stripe-only scope);
 * limit is clamped to 1..200; the cursor is passed through unchanged.
 */
export function buildAttemptsQuery({ statuses, from, to, limit, cursor } = {}) {
  const params = new URLSearchParams();
  if (Array.isArray(statuses)) {
    const valid = statuses.filter((s) => LIFECYCLE_STATUSES.includes(s));
    if (valid.length) params.set("status", valid.join(","));
  }
  params.set("mode", "stripe");
  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));
  const n = Math.trunc(Number(limit));
  const safeLimit = Number.isFinite(n) && n >= 1 ? Math.min(n, ATTEMPTS_MAX_LIMIT) : ATTEMPTS_PAGE_SIZE;
  params.set("limit", String(safeLimit));
  if (cursor) params.set("cursor", String(cursor));
  return params;
}

/** True when a server status filter excludes everything (no request needed). */
export function isEmptyStatusSelection(serverFilters = {}) {
  return Array.isArray(serverFilters.statuses) && serverFilters.statuses.length === 0;
}

/** `res.success` envelope -> { items, nextCursor, total, limit }. */
export function unwrapAttemptsResponse(body) {
  const data = body && typeof body === "object" && body.data && typeof body.data === "object" ? body.data : body;
  const items = Array.isArray(data?.items) ? data.items : [];
  return {
    items,
    nextCursor: typeof data?.nextCursor === "string" && data.nextCursor ? data.nextCursor : null,
    total: Number.isFinite(Number(data?.total)) ? Number(data.total) : items.length,
    limit: Number.isFinite(Number(data?.limit)) ? Number(data.limit) : null,
  };
}

const centsToEuro = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n / 100 : null;
};

const text = (v) => {
  const s = v === null || v === undefined ? "" : String(v).trim();
  return s || null;
};

export function canRefundAttempt(row) {
  return row?.actions?.canRefund === true;
}

export function hasReceipt(row) {
  return Boolean(row?.receipt && (text(row.receipt.id) || text(row.receipt.docNo)));
}

const APPROVED_MEMBERSHIP_STATUSES = new Set(["active", "resigned", "cancelled", "suspended", "archived"]);

const PURPOSE_LABELS = {
  applicationFee: "Application fee",
  subscriptionFee: "Subscription fee",
  eventRegistration: "Event registration",
  courseRegistration: "Course registration",
};

/** One attempt item -> grid row (dataIndexes kept stable for saved views). */
export function normalizeAttemptRow(item, index = 0) {
  const row = item && typeof item === "object" ? item : {};
  const id = text(row.id);
  const membershipNumber = text(row.membershipNumber);
  const memberId = text(row.memberId);
  const applicationId = text(row.applicationId);
  // Same rule as the receipts grid: a membership number, or a post-approval membership status.
  const approved =
    Boolean(membershipNumber || memberId) ||
    APPROVED_MEMBERSHIP_STATUSES.has(String(row.membershipStatus || "").trim().toLowerCase());
  const lifecycleStatus = LIFECYCLE_STATUSES.includes(row.lifecycleStatus) ? row.lifecycleStatus : "unknown";
  const receipt = hasReceipt(row) ? row.receipt : null;
  const capturedEuro = centsToEuro(row.amountCaptured);
  const refundedEuro = centsToEuro(row.amountRefunded);
  const amountEuro = centsToEuro(row.amount);
  return {
    ...row,
    key: id || `online-payment-attempt-${index}`,
    isApproved: approved,
    lifecycleStatus,
    receipt,
    applicationId,
    memberId,
    memberNo: approved ? membershipNumber || memberId || "-" : applicationId || "-",
    category: text(row.membershipCategory) || "-",
    membershipCategory: text(row.membershipCategory) || "-",
    membershipStatus: text(row.membershipStatus) || "-",
    fullName: text(row.fullName) || "-",
    billingCycle: text(row.billingCycle) || "-",
    paymentMethod: text(row.paymentMethod) || (row.mode === "stripe" ? "Card (Stripe)" : text(row.mode) || "-"),
    paymentStatus: lifecycleLabel(lifecycleStatus),
    purposeLabel: PURPOSE_LABELS[row.purpose] || text(row.purpose) || "-",
    // Receipt identity (only when a GL Receipt exists): docNo is what ledger links highlight
    // and what the member finance tab matches on (FinanceByID: docNo / reference / id / _id).
    docNo: receipt ? text(receipt.docNo) : null,
    transactionId: receipt ? text(receipt.docNo) || text(receipt.id) : null,
    // Attempt date (the server's from/to filter is on createdAt).
    date: row.createdAt || null,
    amountEuro,
    paidAmount: capturedEuro,
    paidAmountEuro: capturedEuro,
    amountRefundedEuro: refundedEuro,
    paymentIntentId: text(row.paymentIntentId),
  };
}

/** Prefill for the refund drawer: what is still refundable on this attempt, in EUR. */
export function refundablePrefillEuro(row) {
  const captured = Number(row?.amountCaptured);
  if (!Number.isFinite(captured) || captured <= 0) return null;
  const refunded = Number(row?.amountRefunded);
  const remaining = captured - (Number.isFinite(refunded) ? refunded : 0);
  return remaining > 0 ? Math.round(remaining) / 100 : null;
}
