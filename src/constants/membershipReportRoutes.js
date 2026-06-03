/** Paths that use the membership report grid (no row select / attachment / ⋮ menu). */
export const MEMBERSHIP_REPORT_GRID_PATHS = new Set([
  "/MembershipListingReport",
  "/CancelledMembersReport",
  "/NewMembersReport",
  "/JoinersReport",
  "/ResignedMembersReport",
  "/LeaversReport",
  "/SuspendedMembersReport",
  "/ComparisonReport",
]);

/** Report screens: no Create action in HeaderDetails. */
export const REPORT_HEADER_PATHS = new Set([
  "/Reports",
  "/ReportsDashboard",
  "/ReportViewerDemo",
  "/LiveStatsReport",
  ...MEMBERSHIP_REPORT_GRID_PATHS,
]);

export function normalizeReportPath(pathname = "") {
  return String(pathname || "").replace(/\/$/, "") || "/";
}

export function isMembershipReportGridPath(pathname = "") {
  return MEMBERSHIP_REPORT_GRID_PATHS.has(normalizeReportPath(pathname));
}

export function isReportHeaderPath(pathname = "") {
  return REPORT_HEADER_PATHS.has(normalizeReportPath(pathname));
}
