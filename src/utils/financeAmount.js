/** Amount in EUR when API stores cents on a row field. */
export function resolveCentsAmountEuro(row, field = "amount") {
  const raw = row?.[field];
  if (raw === "-" || raw == null || raw === "") return null;
  const cents = Number(raw);
  return Number.isFinite(cents) ? cents / 100 : null;
}

/** Refund amount in EUR (refunds report stores euros on refundAmount). */
export function resolveRefundAmountEuro(row) {
  const raw = row?.refundAmount;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
