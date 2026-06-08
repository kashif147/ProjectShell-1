const MEMBERSHIP_DIMENSION_LABEL_TO_API = {
  "Membership Category": "membershipCategories",
  Grade: "grades",
  "Work Location": "workLocations",
  "Section (Primary Section)": "sections",
  Region: "regions",
  Branch: "branches",
};

/** Dispatched when toolbar Filter / Reset / template apply should refetch from API. */
const RELOAD_EVENT = "membership-listing-report-reload";

/** Toolbar label → reporting-service dateRange.field */
const DATE_FILTER_LABEL_TO_FIELD = {
  "Membership Start Date": "startDate",
  "Expiry Date": "expiryDate",
  "Cancelled Date": "cancelledAt",
  "Resigned Date": "resignedAt",
  "Processed At Date": "processedAt",
};

/** Date filters applied client-side on loaded rows (and listed in FilterContext). */
export const MEMBERSHIP_LISTING_DATE_FILTER_LABELS = Object.keys(
  DATE_FILTER_LABEL_TO_FIELD,
);

function pickSelected(filtersState, label) {
  const raw = filtersState?.[label]?.selectedValues;
  return Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter(Boolean)
    : [];
}

function readDateRangeForLabel(filtersState, label) {
  const dateFilter = filtersState?.[label];
  const values = dateFilter?.selectedValues;
  if (!Array.isArray(values) || values.length < 2) return null;

  const from = String(values[0] || "").trim();
  const to = String(values[1] || "").trim();
  if (!from || !to) return null;

  const field = DATE_FILTER_LABEL_TO_FIELD[label];
  if (!field) return null;
  return { field, from, to };
}

/** At most one server dateRange; first active date filter wins. */
function readServerDateRange(filtersState) {
  for (const label of MEMBERSHIP_LISTING_DATE_FILTER_LABELS) {
    const dr = readDateRangeForLabel(filtersState, label);
    if (dr) return dr;
  }
  return null;
}

/** Build POST body for reporting-service membership listing. */
export function buildMembershipListingRequest(
  filtersState = {},
  { offset = 0, limit = 500, search } = {},
) {
  const body = {
    offset: Number(offset) || 0,
    limit: Math.min(Number(limit) || 500, 5000),
  };

  Object.entries(MEMBERSHIP_DIMENSION_LABEL_TO_API).forEach(([label, apiKey]) => {
    const sel = pickSelected(filtersState, label);
    if (sel.length) body[apiKey] = sel;
  });

  const membershipStatuses = pickSelected(filtersState, "Membership Status");
  if (membershipStatuses.length) body.membershipStatuses = membershipStatuses;

  const membershipMovements = pickSelected(filtersState, "Membership Movement");
  if (membershipMovements.length) body.membershipMovements = membershipMovements;

  const paymentTypes = pickSelected(filtersState, "Payment Type");
  if (paymentTypes.length) body.paymentTypes = paymentTypes;

  const paymentFrequencies = pickSelected(filtersState, "Payment Frequency");
  if (paymentFrequencies.length) body.paymentFrequencies = paymentFrequencies;

  const dateRange = readServerDateRange(filtersState);
  if (dateRange) body.dateRange = dateRange;

  const searchTerm = String(search ?? "").trim();
  if (searchTerm) body.search = searchTerm;

  return body;
}

export function bumpMembershipListingReportReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeMembershipListingReportReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
