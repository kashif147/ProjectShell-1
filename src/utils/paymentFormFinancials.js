export const PERIODS_BY_FREQUENCY = {
  Weekly: 52,
  Fortnightly: 26,
  Monthly: 12,
  Quarterly: 4,
  Annually: 1,
};

export function installmentFromAnnual(annualEur, paymentFrequency = "Monthly") {
  const annual = Number(annualEur);
  if (!Number.isFinite(annual) || annual <= 0) return null;
  const periods = PERIODS_BY_FREQUENCY[paymentFrequency] || 12;
  return Math.round((annual / periods) * 100) / 100;
}

export function parseInstallmentAmountEur(section = {}) {
  const eur = Number(section.installmentAmountEur);
  if (Number.isFinite(eur) && eur > 0) return eur;
  const display = String(section.installmentAmountDisplay || "").trim();
  if (!display) return undefined;
  const normalized = display.replace(/[^\d.,]/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function resolveStandingOrderAnnualFee(record) {
  const safe = record || {};
  const so = safe.standingOrder || {};
  const sub = safe.subscription || {};
  const fromSo = Number(so.annualMembershipFeeEur);
  if (Number.isFinite(fromSo) && fromSo > 0) return fromSo;
  const fromSub = Number(sub.annualMembershipFee);
  if (Number.isFinite(fromSub) && fromSub > 0) return fromSub;
  return null;
}
