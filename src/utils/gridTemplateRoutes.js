import { GRID_SYSTEM_DEFAULT_PAGES } from "../config/gridColumnDefaults";

/** Route segment (lowercase) → grid templateType for Save View / Toolbar. */
export const GRID_SCREEN_PATH_TO_TEMPLATE_TYPE = {
  applications: "application",
  paymentforms: "payment forms",
  members: "members",
  membership: "members",
  summary: "profile",
  eventsdashboard: "eventsdashboard",
  creditnotes: "creditnotes",
  journaladjustments: "journaladjustments",
  onlinepayment: "onlinepayment",
  refunds: "refunds",
  "write-offs": "writeoffs",
  writeoffs: "writeoffs",
  generalledger: "generalledger",
  reconciliation: "reconciliation",
  membershiplistingreport: "membershiplisting",
  statisticsreport: "statisticsreport",
  workplacebreakdownreport: "workplacebreakdownreport",
  creditorslistreport: "creditorslistreport",
  debtorslistreport: "debtorslistreport",
  correspondencesummary: "notification",
  correspondencedashboard: "notification",
  communication: "notification",
  communicationbatchdetail: "notification",
  inappnotifications: "notification",
  audithistory: "audithistory",
  historybyid: "audithistory",
};

export function resolveGridTemplateTypeFromPath(pathname = "") {
  const segment =
    String(pathname || "")
      .split("/")
      .filter(Boolean)
      .pop() || "";
  const key = segment.toLowerCase();
  return GRID_SCREEN_PATH_TO_TEMPLATE_TYPE[key] || key;
}

/** True when the route uses grid Save View / template list APIs. */
export function isGridTemplateRoute(pathname = "") {
  const segment =
    String(pathname || "")
      .split("/")
      .filter(Boolean)
      .pop() || "";
  const key = segment.toLowerCase();
  if (GRID_SCREEN_PATH_TO_TEMPLATE_TYPE[key]) return true;
  const templateType = GRID_SCREEN_PATH_TO_TEMPLATE_TYPE[key] || key;
  return Boolean(GRID_SYSTEM_DEFAULT_PAGES[templateType]);
}

/** Routes that should not render Toolbar / SaveViewMenu (admin, config, hubs). */
export const NON_GRID_TOOLBAR_PATHS = new Set([
  "/configuration",
  "/settings",
  "/templatesummary",
  "/templateconfig",
  "/reports",
  "/accountsreports",
  "/membershipdashboard",
  "/worklocation",
  "/region",
  "/branch",
]);

export function isNonGridToolbarRoute(pathname = "") {
  const normalized = String(pathname || "")
    .replace(/\/$/, "")
    .toLowerCase();
  return NON_GRID_TOOLBAR_PATHS.has(normalized);
}
