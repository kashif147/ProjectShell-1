// P5 (profile-service #53): application decisions (duplicate-review decision, approve, reject,
// bulk approval) carry
//   - expectedReviewVersion: the duplicate-review version the user saw, so a review that changed
//     in the meantime is refused (409 REVIEW_VERSION_CONFLICT) instead of silently decided;
//   - idempotencyKey: one key per user action, reused when that same action is retried, so a
//     retry after a lost response replays the recorded outcome instead of deciding twice.
// The key is sent in the JSON body (`idempotencyKey`), which profile-service accepts as the
// equivalent of the Idempotency-Key header: the gateway's CORS allow-list for profile-service
// does not include that header, and a blocked preflight would fail every decision call.

export function newOperationKey() {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const b = new Uint8Array(16);
    c.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  return `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Per-action key store (keep one in a useRef). keyFor(action) returns the same key until the
 * action is settled: settle(action, error) clears it on success and on any outcome after which a
 * new click is a new decision; it keeps it when the same action may simply be retried
 * (network failure, 5xx, still in progress).
 */
export function createOperationKeyStore() {
  const keys = new Map();
  return {
    keyFor(action) {
      if (!keys.has(action)) keys.set(action, newOperationKey());
      return keys.get(action);
    },
    settle(action, error = null) {
      if (!error || !isRetryableDecisionError(error)) keys.delete(action);
    },
    clear() {
      keys.clear();
    },
  };
}

function asVersion(v) {
  return Number.isInteger(v) && v >= 0 ? v : undefined;
}

/** Duplicate-review version of an application payload (GET /applications/:id) or a review payload. */
export function reviewVersionOf(source) {
  if (!source) return undefined;
  return (
    asVersion(source.reviewVersion) ??
    asVersion(source.duplicateReview?.reviewVersion) ??
    asVersion(source.personalDetails?.duplicateReview?.reviewVersion) ??
    asVersion(source.duplicateReviewVersion)
  );
}

/** Adds expectedReviewVersion (only when known) and idempotencyKey to a decision body. */
export function withDecisionPreconditions(body, { reviewVersion, idempotencyKey } = {}) {
  const out = { ...(body || {}) };
  const v = asVersion(reviewVersion);
  if (v !== undefined) out.expectedReviewVersion = v;
  if (idempotencyKey) out.idempotencyKey = idempotencyKey;
  return out;
}

/** Bulk approval `items`: per selected row, the review version the grid showed (when known). */
export function buildBulkApprovalItems(gridRows, applicationIds) {
  const byId = new Map();
  for (const row of Array.isArray(gridRows) ? gridRows : []) {
    const id = row?.applicationId ?? row?.ApplicationId ?? row?._id ?? row?.id;
    if (id != null) byId.set(String(id), row);
  }
  const items = [];
  for (const id of applicationIds || []) {
    const v = reviewVersionOf(byId.get(String(id)));
    if (v !== undefined) items.push({ applicationId: String(id), expectedReviewVersion: v });
  }
  return items;
}

const REVIEW_CHANGED_CODES = new Set([
  "REVIEW_VERSION_CONFLICT",
  "REVIEW_CHANGED",
  "REVIEW_CHANGED_AFTER_CAPTURE",
  "REVIEW_VERSION_REQUIRED",
  "IDEMPOTENCY_KEY_REQUIRED",
  "MATCH_NOT_CURRENT",
  "MATCHED_PROFILE_NOT_FOUND",
  "MATCHED_PROFILE_MISSING",
]);

const MESSAGES = {
  REVIEW_VERSION_CONFLICT: {
    title: "Duplicate review changed",
    text: "The duplicate review changed since you loaded it. It has been reloaded - check it and try again.",
  },
  REVIEW_CHANGED: {
    title: "Duplicate review changed",
    text: "The duplicate review changed during approval. Nothing was charged. Review duplicates again, then approve.",
  },
  REVIEW_CHANGED_AFTER_CAPTURE: {
    title: "Duplicate review changed",
    text: "The duplicate review changed after the payment was captured. Review duplicates again, then approve again to complete this application - the payment will not be taken twice.",
  },
  REVIEW_VERSION_REQUIRED: {
    title: "Reload required",
    text: "This decision needs the current duplicate review. It has been reloaded - try again.",
  },
  IDEMPOTENCY_KEY_REQUIRED: {
    title: "Reload required",
    text: "This decision could not be identified. Reload and try again.",
  },
  DUPLICATE_REVIEW_REQUIRED: {
    title: "Duplicate review required",
    text: "Open Duplicate Profile Review before processing this application.",
  },
  DECISION_IN_PROGRESS: {
    title: "Already in progress",
    text: "This decision is already being processed. Wait a moment, then refresh.",
  },
  IDEMPOTENCY_IN_FLIGHT: {
    title: "Already in progress",
    text: "This decision is already being processed. Wait a moment, then refresh.",
  },
  PROFILE_EMAIL_EXISTS: {
    title: "Profile already exists",
    text: "A profile with this applicant's email already exists. Use Tag this Profile or Merge this Profile instead of Create New Profile.",
  },
  MATCH_NOT_CURRENT: {
    title: "Match no longer current",
    text: "The selected profile is no longer a current match for this application. The review has been reloaded.",
  },
  MATCHED_PROFILE_NOT_FOUND: {
    title: "Profile not found",
    text: "The selected profile was not found for this organisation. The review has been reloaded.",
  },
  MATCHED_PROFILE_MISSING: {
    title: "Profile not selected",
    text: "The duplicate review has no selected profile. Review duplicates again.",
  },
  PAYMENT_BINDING_MISSING: {
    title: "Payment could not be verified",
    text: "The payment for this application could not be verified as belonging to it. Nothing was charged or released - contact Finance.",
  },
  PAYMENT_APPLICATION_MISMATCH: {
    title: "Payment belongs to another application",
    text: "The payment found belongs to a different application. Nothing was charged or released - contact Finance.",
  },
  APPLICATION_ALREADY_DECIDED: {
    title: "Already decided",
    text: "This application has already been decided. Refresh to see its current status.",
  },
  PAYMENT_DECISION_CONFLICT: {
    title: "Another decision is in progress",
    text: "A different decision is already in progress for this application. Refresh to see its current status.",
  },
};

/** The error code of a profile-service decision failure (error envelope or legacy shapes). */
export function decisionErrorCode(error) {
  const data = error?.response?.data;
  return data?.error?.code || data?.code || null;
}

export function isRetryableDecisionError(error) {
  const status = error?.response?.status;
  if (!error?.response) return true; // network failure / timeout: same action, same key
  if (status >= 500) return true;
  const code = decisionErrorCode(error);
  return code === "DECISION_IN_PROGRESS" || code === "IDEMPOTENCY_IN_FLIGHT";
}

/**
 * User-facing description of a decision failure.
 * @returns {{code: string|null, title: string, text: string, reloadReview: boolean}}
 */
export function describeDecisionError(error, fallbackTitle = "Action failed") {
  const code = decisionErrorCode(error);
  const known = code ? MESSAGES[code] : null;
  const data = error?.response?.data;
  const serverText = data?.error?.message || data?.message || error?.message || "Unexpected error";
  return {
    code,
    title: known?.title || fallbackTitle,
    text: known?.text || serverText,
    reloadReview: REVIEW_CHANGED_CODES.has(code),
  };
}

/** Bulk approval result row -> short text for the summary. */
export function describeBulkRow(row) {
  const known = row?.code ? MESSAGES[row.code] : null;
  return `${row?.applicationId}: ${known?.title || row?.error || "failed"}`;
}
