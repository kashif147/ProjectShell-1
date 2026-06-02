const MEMBERSHIP_DIMENSION_LABEL_TO_API = {
  "Membership Category": "membershipCategories",
  Grade: "grades",
  "Section (Primary Section)": "sections",
  Region: "regions",
  Branch: "branches",
};

const RELOAD_EVENT = "membership-listing-report-reload";

function pickSelected(filtersState, label) {
  const raw = filtersState?.[label]?.selectedValues;
  return Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter(Boolean)
    : [];
}

function readDateRange(filtersState) {
  const dateFilter = filtersState?.["Date Range"];
  const values = dateFilter?.selectedValues;
  if (!Array.isArray(values) || values.length < 2) return null;

  const from = String(values[0] || "").trim();
  const to = String(values[1] || "").trim();
  if (!from || !to) return null;

  return { field: "startDate", from, to };
}

/** Build POST body for reporting-service membership listing. */
export function buildMembershipListingRequest(
  filtersState = {},
  { offset = 0, limit = 500 } = {},
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

  const dateRange = readDateRange(filtersState);
  if (dateRange) body.dateRange = dateRange;

  return body;
}

export function bumpMembershipListingReportReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeMembershipListingReportReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
