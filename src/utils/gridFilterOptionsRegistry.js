import {
  getLabelToKeyMap,
  isDateFilterLabel,
  isNumericFilterLabel,
  isStringFilterLabel,
} from "./filterUtils";

/** Screens that filter client-side from loaded grid rows (account-service finance grids). */
export const CLIENT_SIDE_GRID_FILTER_SCREENS = new Set([
  "CreditNotes",
  "JournalAdjustments",
  "OnlinePayment",
  "Refunds",
  "WriteOffs",
  "GeneralLedger",
  "Reconciliation",
  "MembershipListingReport",
]);

const registry = new Map();
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

/**
 * Register loaded grid rows so Toolbar filter dropdowns can show distinct values.
 * @param {string} screenKey - FilterContext activePage (e.g. CreditNotes)
 * @param {object[]} rows
 * @param {object[]} screenCols - TableColumnsContext columns for label→dataIndex mapping
 */
export function registerGridFilterRows(screenKey, rows = [], screenCols = []) {
  if (!screenKey) return;
  registry.set(String(screenKey), {
    rows: Array.isArray(rows) ? rows : [],
    screenCols: Array.isArray(screenCols) ? screenCols : [],
  });
  notifyListeners();
}

export function clearGridFilterRows(screenKey) {
  if (!screenKey) return;
  registry.delete(String(screenKey));
  notifyListeners();
}

export function subscribeGridFilterRows(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function getRowFieldValue(row, key) {
  if (!row || !key) return undefined;
  const path = String(key);
  if (!path.includes(".")) return row[path];
  return path.split(".").reduce((acc, part) => acc?.[part], row);
}

function canonicalFilterOptionLabel(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (!text.includes(" ") && /^[a-zA-Z]+$/.test(text)) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  return text;
}

function dedupeFilterOptionsCaseInsensitive(options = [], preferredFirst = []) {
  const canonicalByKey = new Map();
  const add = (value) => {
    const text = canonicalFilterOptionLabel(value);
    if (!text) return;
    const key = text.toLowerCase();
    if (!canonicalByKey.has(key)) {
      canonicalByKey.set(key, text);
    }
  };

  preferredFirst.forEach(add);
  options.forEach(add);

  const values = Array.from(canonicalByKey.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  return values.length ? ["", ...values] : [];
}

function formatCellForFilterOption(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    if (!text || text === "—" || text === "-") return "";
    return canonicalFilterOptionLabel(text);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

export function buildDistinctOptionsFromRows(rows, label, screenCols = []) {
  if (!Array.isArray(rows) || !rows.length || !label) return null;
  if (isDateFilterLabel(label, screenCols)) return null;
  if (isNumericFilterLabel(label, screenCols)) return null;
  if (isStringFilterLabel(label, screenCols)) return null;

  const labelMap = getLabelToKeyMap(screenCols);
  const key = labelMap[label];
  if (!key) return null;

  const values = new Set();
  rows.forEach((row) => {
    const formatted = formatCellForFilterOption(getRowFieldValue(row, key));
    if (formatted) values.add(formatted);
  });

  if (!values.size) return null;
  return dedupeFilterOptionsCaseInsensitive(Array.from(values));
}

/**
 * Build filter label → options map from registered grid rows for one screen.
 */
export function buildDataDerivedFilterOptions(screenKey, filterLabels = []) {
  const entry = registry.get(String(screenKey));
  if (!entry?.rows?.length) return {};

  const derived = {};
  (filterLabels || []).forEach((label) => {
    const opts = buildDistinctOptionsFromRows(
      entry.rows,
      label,
      entry.screenCols,
    );
    if (opts?.length > 1) {
      derived[label] = opts;
    }
  });
  return derived;
}

export function hasRegisteredGridFilterRows(screenKey) {
  const entry = registry.get(String(screenKey));
  return Boolean(entry?.rows?.length);
}

/** Filters with a fixed enum in FilterContext — grid data must not add invalid values. */
const CLOSED_ENUM_FILTER_LABELS = new Set([
  "Membership Status",
  "Membership Movement",
  "Payment Method",
  "CN Status",
  "JA Status",
  "WO Status",
  "GL Status",
  "Rec Status",
  "Clearing Account",
  "Confidence",
  "Source",
]);

function filterDerivedToStaticAllowlist(derivedOpts = [], staticOpts = []) {
  const staticKeys = new Set(
    staticOpts
      .map((v) => String(v).trim().toLowerCase())
      .filter(Boolean),
  );
  if (!staticKeys.size) return derivedOpts;
  return derivedOpts.filter((v) => {
    const key = String(v).trim().toLowerCase();
    return !key || staticKeys.has(key);
  });
}

/**
 * Merge static enum options with distinct values from loaded grid data.
 * @param {string[]} staticOpts
 * @param {string[]} derivedOpts
 * @param {string} [filterLabel] - when set, applies closed-enum rules for known labels
 */
export function mergeStaticAndDerivedOptions(
  staticOpts = [],
  derivedOpts = [],
  filterLabel = "",
) {
  const staticList = Array.isArray(staticOpts) ? staticOpts : [];
  let derivedList = Array.isArray(derivedOpts) ? derivedOpts : [];

  if (
    filterLabel &&
    CLOSED_ENUM_FILTER_LABELS.has(filterLabel) &&
    staticList.some((v) => String(v).trim())
  ) {
    derivedList = filterDerivedToStaticAllowlist(derivedList, staticList);
  }

  if (!derivedList.length) {
    return dedupeFilterOptionsCaseInsensitive(staticList);
  }

  const hasStaticEnums = staticList.some((v) => String(v).trim());
  if (!hasStaticEnums) {
    return dedupeFilterOptionsCaseInsensitive(derivedList);
  }

  return dedupeFilterOptionsCaseInsensitive(derivedList, staticList);
}
