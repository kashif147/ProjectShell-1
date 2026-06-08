import { buildMembershipDashboardFilters } from "../pages/membership/executive/executiveDashboardUtils";
import { buildMembershipListingRequest } from "./membershipListingReportWorkspace";

const RELOAD_EVENT = "membership-statistics-report-reload";

export const STATISTICS_DIMENSION_LABEL_TO_API = {
  Grade: "grades",
  "Section (Primary Section)": "sections",
  Region: "regions",
  Branch: "branches",
  "Work Location": "workLocations",
  "Payment Type": "paymentTypes",
  "Membership Category": "membershipCategories",
};

const FILTER_API_KEYS = [
  "membershipCategories",
  "grades",
  "sections",
  "regions",
  "branches",
  "workLocations",
  "paymentTypes",
  "paymentFrequencies",
  "membershipStatuses",
  "membershipMovements",
];

/** Toolbar == selections only (!= chips are student/honorary exclusions, not API includes). */
export function readPositiveFilterSelections(filtersState = {}, label) {
  const filter = filtersState?.[label];
  if (!filter) return [];
  const operator = filter.operator || "==";
  if (operator !== "==") return [];
  return (filter.selectedValues || [])
    .map((v) => String(v).trim())
    .filter(Boolean);
}

function readManualMembershipCategories(header = {}) {
  const manual = header.manualMembershipCategories;
  if (!manual || manual.operator !== "==") return [];
  return (manual.selectedValues || [])
    .map((v) => String(v).trim())
    .filter(Boolean);
}

/** True when the statistics API request includes toolbar dimension/status filters. */
export function statisticsRequestHasActiveFilters(body = {}, header = {}) {
  if (header.includeStudents === false || header.includeHonorary === false) {
    return true;
  }
  if (FILTER_API_KEYS.some((key) => body[key]?.length > 0)) {
    return true;
  }
  return Object.keys(STATISTICS_DIMENSION_LABEL_TO_API).some(
    (label) => body[label]?.length > 0,
  );
}

/**
 * Build POST body for reporting-service membership statistics.
 * Executive dashboard dimensions + header (year, through month, student/honorary).
 * Listing-style keys (work location, payment type, status, movement) when set.
 */
export function buildMembershipStatisticsRequest(
  filtersState = {},
  header = {},
  categoryLabels = [],
  { ensureSnapshots = false } = {},
) {
  const dashboard = buildMembershipDashboardFilters(
    filtersState,
    header,
    categoryLabels,
  );

  const now = new Date();
  const year =
    Number(dashboard.year) ||
    Number(header.year) ||
    now.getUTCFullYear();
  const throughMonth = Math.min(
    Math.max(
      Number(dashboard.month) ||
        Number(header.month) ||
        (year === now.getUTCFullYear() ? now.getUTCMonth() + 1 : 12),
      1,
    ),
    12,
  );

  const body = {
    year,
    throughMonth,
    includeStudents: header.includeStudents !== false,
    includeHonorary: header.includeHonorary !== false,
    ...(ensureSnapshots ? { ensureSnapshots: true } : {}),
  };

  Object.entries(STATISTICS_DIMENSION_LABEL_TO_API).forEach(([label, apiKey]) => {
    const values = readPositiveFilterSelections(filtersState, label);
    if (values.length) {
      body[apiKey] = values;
    }
  });

  const manualCategories = readManualMembershipCategories(header);
  if (manualCategories.length) {
    body.membershipCategories = manualCategories;
  }

  const listingExtras = buildMembershipListingRequest(filtersState, {
    limit: 1,
  });
  delete listingExtras.membershipCategories;

  [
    "grades",
    "sections",
    "regions",
    "branches",
    "workLocations",
    "paymentTypes",
    "paymentFrequencies",
    "membershipStatuses",
    "membershipMovements",
  ].forEach((key) => {
    if (!body[key]?.length && listingExtras[key]?.length) {
      body[key] = listingExtras[key];
    }
  });

  return body;
}

export function bumpMembershipStatisticsReportReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeMembershipStatisticsReportReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
