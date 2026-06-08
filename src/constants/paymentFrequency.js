/** Matches backend profile/subscription `PAYMENT_FREQUENCY` display strings */

export const CRM_PAYMENT_FREQUENCY_OPTIONS = [
  { value: "Weekly", label: "Weekly" },
  { value: "Fortnightly", label: "Fortnightly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
];

const ALLOWED = new Set(CRM_PAYMENT_FREQUENCY_OPTIONS.map((o) => o.value));

const normalizePaymentMethodKey = (paymentType) =>
  String(paymentType ?? "").trim().toLowerCase();

/** Credit Card, Cheque, Cash → Annually */
const ANNUAL_DEFAULT_PAYMENT_METHODS = new Set([
  "credit card",
  "card payment",
  "cheque",
  "check",
  "cash",
]);

/** Standing Order, Salary Deduction, Direct Debit → Monthly */
const MONTHLY_DEFAULT_PAYMENT_METHODS = new Set([
  "standing order",
  "salary deduction",
  "payroll deduction",
  "direct debit",
]);

export function getDefaultPaymentFrequencyForPaymentMethod(paymentType) {
  const key = normalizePaymentMethodKey(paymentType);
  if (!key) return null;
  if (ANNUAL_DEFAULT_PAYMENT_METHODS.has(key)) return "Annually";
  if (MONTHLY_DEFAULT_PAYMENT_METHODS.has(key)) return "Monthly";
  return null;
}

export function isCreditCardPaymentType(paymentType) {
  const key = normalizePaymentMethodKey(paymentType);
  return key === "credit card" || key === "card payment";
}

export function isAllowedPaymentFrequency(freq) {
  const t = String(freq ?? "").trim();
  return t !== "" && ALLOWED.has(t);
}
