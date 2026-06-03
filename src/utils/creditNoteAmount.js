/** Credit note amount in EUR (API stores cents). */
export function resolveCreditNoteAmountEuro(row) {
  const raw = row?.amount;
  if (raw === "-" || raw == null || raw === "") return null;
  const cents = Number(raw);
  return Number.isFinite(cents) ? cents / 100 : null;
}
