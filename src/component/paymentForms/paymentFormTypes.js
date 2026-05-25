export const PAYMENT_FORM_TYPE_OPTIONS = [
  { key: "STANDING_ORDER", label: "Standing Order (SBO)" },
  { key: "SALARY_DEDUCTION", label: "Salary Deduction (SD19)" },
  { key: "DD_MANDATE", label: "Direct Debit (SEPA Mandate)" },
];

export const PAYMENT_FORM_TYPE_LABELS = Object.fromEntries(
  PAYMENT_FORM_TYPE_OPTIONS.map((o) => [o.key, o.label])
);

export const PAYMENT_TYPE_BY_FORM = {
  STANDING_ORDER: "Standing Order",
  SALARY_DEDUCTION: "Salary Deduction",
  DD_MANDATE: "Direct Debit",
};

export const FORM_TYPE_SELECT_OPTIONS = PAYMENT_FORM_TYPE_OPTIONS.map((o) => ({
  value: o.key,
  label: o.label,
}));
