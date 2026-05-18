const CLEARING_ACCOUNT_CODES = new Set([
  "1100",
  "1200",
  "1210",
  "1220",
  "1230",
  "1240",
  "1250",
]);

function ledgerRowUsesClearingSettlement(record) {
  const dt = String(record?.docType || "").toLowerCase();
  if (!["receipt", "claim", "refund"].includes(dt)) return false;
  if (record?.settlement?.provider) return true;
  const gl = record?.glTransaction ?? record?.glTransactions?.[0];
  if (
    (gl?.entries || record?.entries || []).some((e) =>
      CLEARING_ACCOUNT_CODES.has(e.accountCode),
    )
  ) {
    return true;
  }
  const pay = String(record?.paymentType || "").toLowerCase();
  return /clearing|cheque|card|direct debit|standing order|salary|deduction|stripe|gateway|batch/i.test(
    pay,
  );
}

/**
 * Row-specific ledger badges (not member-level summary flags).
 * @param {object} record — ledger row
 * @param {string} status — from resolveLedgerRowStatus
 */
export function deriveRowBadges(record, status) {
  const badges = [];
  const st = String(status || "");

  if (st === "Draft") badges.push("PENDING APPROVAL");
  if (st === "Refunded") badges.push("REFUNDED");
  if (st === "Written Off") badges.push("WRITTEN OFF");

  if (ledgerRowUsesClearingSettlement(record)) {
    const settlementStatus =
      record?.settlement?.status || record?.settlementStatus || "";
    if (settlementStatus !== "SETTLED") {
      badges.push("CLEARING PENDING");
    }
  }

  return badges;
}
