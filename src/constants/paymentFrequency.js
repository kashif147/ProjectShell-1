/** Matches backend profile/subscription `PAYMENT_FREQUENCY` display strings */

export const CRM_PAYMENT_FREQUENCY_OPTIONS = [
  { value: "Weekly", label: "Weekly" },
  { value: "Fortnightly", label: "Fortnightly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
];

const ALLOWED = new Set(CRM_PAYMENT_FREQUENCY_OPTIONS.map((o) => o.value));

export function isCreditCardPaymentType(paymentType) {
  const s = String(paymentType ?? "").trim().toLowerCase();
  return s === "credit card" || s === "card payment";
}

export function isAllowedPaymentFrequency(freq) {
  const t = String(freq ?? "").trim();
  return t !== "" && ALLOWED.has(t);
}
