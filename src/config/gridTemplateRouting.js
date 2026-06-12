import {
  getAccountServiceBaseUrl,
  getAuditFilterTemplatesBaseUrl,
  getNotificationFilterTemplatesBaseUrl,
  getProfileServiceBaseUrl,
  getReportingServiceBaseUrl,
  getSubscriptionFilterTemplatesBaseUrl,
} from "./serviceUrls";
import { GRID_SYSTEM_DEFAULT_PAGES } from "./gridColumnDefaults";

/** Domain ownership for grid filter/column templates (Save View). */
export const GRID_TEMPLATE_SERVICE_OWNERS = {
  "profile-service": "Applications, profiles, payment forms",
  "subscription-service": "Members / subscriptions",
  "account-service": "Finance grids (credit notes, journals, reconciliation, etc.)",
  "reporting-service": "Reporting grids",
  "notification-service":
    "Correspondence grids (comms history, notification admin lists, etc.)",
  "audit-service": "Audit history grids",
  "communication-service":
    "Not used for grid Save View — letter/email/SMS content templates only (see contentTemplateRouting.js)",
};

const LEGACY_TEMPLATE_TYPE_SERVICE = {
  application: "profile-service",
  profile: "profile-service",
  members: "subscription-service",
  member: "subscription-service",
  creditnotes: "account-service",
  journaladjustments: "account-service",
  onlinepayment: "account-service",
  refunds: "account-service",
  writeoffs: "account-service",
  generalledger: "account-service",
  reconciliation: "account-service",
  membershiplisting: "reporting-service",
  statisticsreport: "reporting-service",
  workplacebreakdownreport: "reporting-service",
  creditorslistreport: "reporting-service",
  debtorslistreport: "reporting-service",
  /** Correspondence / comms admin grids */
  correspondence: "notification-service",
  correspondences: "notification-service",
  correspondencesummary: "notification-service",
  communication: "notification-service",
  notification: "notification-service",
  notifications: "notification-service",
  inappnotifications: "notification-service",
  /** Audit history grids */
  audithistory: "audit-service",
  audit: "audit-service",
  auditlog: "audit-service",
  auditlogs: "audit-service",
  historybyid: "audit-service",
};

/**
 * Resolve owning microservice from manifest (grid-column-defaults.json) or legacy map.
 * @param {string} templateType
 * @returns {"profile-service"|"subscription-service"|"account-service"|"reporting-service"|"notification-service"|"audit-service"}
 */
export function resolveGridTemplateService(templateType) {
  const normalized = String(templateType || "").trim().toLowerCase();
  if (!normalized) return "profile-service";

  for (const page of Object.values(GRID_SYSTEM_DEFAULT_PAGES)) {
    if (String(page.templateType || "").trim().toLowerCase() === normalized) {
      return page.service || "profile-service";
    }
  }

  return LEGACY_TEMPLATE_TYPE_SERVICE[normalized] || "profile-service";
}

/** REST base URL for grid filter/column template CRUD for a given templateType. */
export function resolveTemplatesApiUrl(templateType) {
  const service = resolveGridTemplateService(templateType);

  switch (service) {
    case "account-service":
      return `${getAccountServiceBaseUrl()}/templates`;
    case "subscription-service":
      return getSubscriptionFilterTemplatesBaseUrl();
    case "reporting-service":
      return `${getReportingServiceBaseUrl()}/templates`;
    case "notification-service":
      return getNotificationFilterTemplatesBaseUrl();
    case "audit-service":
      return getAuditFilterTemplatesBaseUrl();
    case "profile-service":
    default:
      return `${getProfileServiceBaseUrl()}/templates`;
  }
}
