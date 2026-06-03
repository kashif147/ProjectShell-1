/** Paid amount (EUR) from Stripe receipt GL lines — account 1220 debit. */
export function resolvePaidAmountEuro(row) {
  const entries = Array.isArray(row?.entries) ? row.entries : [];
  const bankEntry = entries.find(
    (e) => e.accountCode === "1220" && e.dc === "D",
  );
  if (bankEntry && Number.isFinite(Number(bankEntry.amount))) {
    return Number(bankEntry.amount) / 100;
  }
  const direct = Number(row?.paidAmount);
  return Number.isFinite(direct) ? direct : null;
}
