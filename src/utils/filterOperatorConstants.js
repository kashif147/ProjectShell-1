/** Shared filter operator sets — no imports (safe for filter UI components). */

export const NUMERIC_COMPARISON_OPERATORS = new Set([
  "<",
  ">",
  "<=",
  ">=",
]);

export const NUMERIC_FILTER_OPERATORS = new Set([
  "==",
  "!=",
  "between",
  ...NUMERIC_COMPARISON_OPERATORS,
]);

export const STRING_FILTER_OPERATORS = new Set([
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "==",
  "!=",
]);
