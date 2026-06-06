export const CLEARING_ACCOUNT_OPTIONS = [
  { value: "all", label: "All clearing accounts" },
  { value: "1210", label: "1210 — Cheque clearing" },
  { value: "1220", label: "1220 — Card clearing" },
  { value: "1230", label: "1230 — Salary deduction" },
  { value: "1240", label: "1240 — Standing order" },
  { value: "1250", label: "1250 — Direct debit" },
];

export const RECONCILIATION_STATUS_OPTIONS = [
  { value: "unmatched", label: "Unmatched" },
  { value: "auto_matched", label: "Auto matched" },
  { value: "manual_matched", label: "Manually matched" },
  { value: "suspense", label: "Suspense" },
  { value: "settled", label: "Settled" },
];

export const MATCH_CONFIDENCE_COLORS = {
  high: "green",
  medium: "blue",
  low: "orange",
  none: "default",
  complete: "green",
};

export const SUGGESTED_ACTION_LABELS = {
  auto_match: "Auto match",
  manual_match: "Manual match",
  settle: "Settle",
  suspense: "Move to suspense",
  review: "Review variance",
  none: "—",
};
