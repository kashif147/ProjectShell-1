import { buildMembershipListingRequest } from "./membershipListingReportWorkspace";
import { readPositiveFilterSelections } from "./membershipStatisticsReportWorkspace";

const RELOAD_EVENT = "workplace-breakdown-report-reload";

/** Set by bumpWorkplaceBreakdownReportReload; consumed once per fetch. */
let pendingEnsureSnapshots = false;

export const WORKPLACE_BREAKDOWN_DIMENSION_LABEL_TO_API = {
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

export const WORKPLACE_BREAKDOWN_REPORT_TITLE =
  "Workplace Membership Breakdown Report";

export function workplaceBreakdownRequestHasActiveFilters(body = {}, header = {}) {
  if (header.includeStudents === false || header.includeHonorary === false) {
    return true;
  }
  if (header.audienceScope && header.audienceScope !== "full") return true;
  if (FILTER_API_KEYS.some((key) => body[key]?.length > 0)) return true;
  return Object.keys(WORKPLACE_BREAKDOWN_DIMENSION_LABEL_TO_API).some(
    (label) => body[label]?.length > 0,
  );
}

export function buildWorkplaceBreakdownRequest(
  filtersState = {},
  header = {},
  { ensureSnapshots = false, user = null } = {},
) {
  const now = new Date();
  const endYear =
    Number(header.year) || now.getUTCFullYear();
  const endMonth = Math.min(
    Math.max(Number(header.month) || now.getUTCMonth() + 1, 1),
    12,
  );

  const body = {
    endYear,
    endMonth,
    rollingMonths: Number(header.rollingMonths) || 12,
    includeStudents: header.includeStudents === true,
    includeHonorary: header.includeHonorary === true,
    includeEmptyRows: header.includeEmptyRows === true,
    audienceScope: header.audienceScope || "full",
    scopeUserId: header.scopeUserId || null,
    ...(ensureSnapshots ? { ensureSnapshots: true } : {}),
  };

  const scope = String(header.audienceScope || "full").toLowerCase();
  const scopeUserId = user?.id || user?.sub || user?.userId;
  if ((scope === "official" || scope === "manager") && scopeUserId) {
    body.scopeUserId = String(scopeUserId);
  }

  Object.entries(WORKPLACE_BREAKDOWN_DIMENSION_LABEL_TO_API).forEach(
    ([label, apiKey]) => {
      const values = readPositiveFilterSelections(filtersState, label);
      if (values.length) body[apiKey] = values;
    },
  );

  const listingExtras = buildMembershipListingRequest(filtersState, { limit: 1 });
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
    "membershipCategories",
  ].forEach((key) => {
    if (!body[key]?.length && listingExtras[key]?.length) {
      body[key] = listingExtras[key];
    }
  });

  if (!body.membershipStatuses?.length) {
    body.membershipStatuses = ["Active"];
  }

  return body;
}

export function bumpWorkplaceBreakdownReportReload({ ensureSnapshots = false } = {}) {
  if (ensureSnapshots) pendingEnsureSnapshots = true;
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function consumeWorkplaceBreakdownEnsureSnapshots() {
  const flag = pendingEnsureSnapshots;
  pendingEnsureSnapshots = false;
  return flag;
}

export function subscribeWorkplaceBreakdownReportReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}

export { readPositiveFilterSelections };
