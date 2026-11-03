// Read-time compatibility for stored Online Payments Save View templates (templateType
// "onlinepayment", account-service) created against the old GL-receipts grid. Pure: inputs are
// never mutated and nothing is written back - stored views are reshaped only for this render.
//
// Stored views (including the seeded system default) still list `email` / `phone`, which the
// attempts endpoint does not return, and do not list the new attempt columns. applyTemplate shows
// a column only when the view lists it, so without this the new Amount / Refunded Amount columns
// would be hidden on every existing view.

export const ONLINE_PAYMENT_GRID_SCREEN = "OnlinePayment";

/** Columns dropped from this grid (no source on GET /payments/attempts). */
export const ONLINE_PAYMENT_REMOVED_COLUMNS = Object.freeze(["email", "phone"]);

/** New columns, each inserted right after its anchor (appended when the anchor is absent). */
const ADDED_COLUMNS = Object.freeze([
  { key: "amountEuro", after: "transactionId" },
  { key: "amountRefundedEuro", after: "paidAmount" },
  { key: "purposeLabel", after: "paymentStatus" },
]);

const keyOf = (k) => String(k || "").trim();
const removed = new Set(ONLINE_PAYMENT_REMOVED_COLUMNS);

export function withOnlinePaymentAttemptColumns(columns = []) {
  const out = (Array.isArray(columns) ? columns : [])
    .map(keyOf)
    .filter((k) => k && !removed.has(k));
  ADDED_COLUMNS.forEach(({ key, after }) => {
    if (out.includes(key)) return;
    const at = out.indexOf(after);
    if (at >= 0) out.splice(at + 1, 0, key);
    else out.push(key);
  });
  return out;
}

function withoutRemovedLabels(labels) {
  if (!labels || typeof labels !== "object") return {};
  return Object.fromEntries(Object.entries(labels).filter(([k]) => !removed.has(k)));
}

/**
 * Inputs for applyTemplate("OnlinePayment", ...) reshaped for read. An empty stored list falls
 * back to the master list, then to the built-in default columns (never "hide everything").
 */
export function normalizeOnlinePaymentTemplateForRead({
  templateColumns,
  masterColumns,
  templateColumnLabels,
  masterColumnLabels,
  fallbackColumns = [],
} = {}) {
  const stored = (Array.isArray(templateColumns) ? templateColumns : []).map(keyOf).filter(Boolean);
  const master = (Array.isArray(masterColumns) ? masterColumns : []).map(keyOf).filter(Boolean);
  const fallback = (Array.isArray(fallbackColumns) ? fallbackColumns : []).map(keyOf).filter(Boolean);
  const base = stored.length ? stored : master.length ? master : fallback;
  return {
    templateColumns: withOnlinePaymentAttemptColumns(base),
    masterColumns: master.length ? withOnlinePaymentAttemptColumns(master) : [],
    templateColumnLabels: withoutRemovedLabels(templateColumnLabels),
    masterColumnLabels: withoutRemovedLabels(masterColumnLabels),
  };
}
