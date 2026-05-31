/**
 * CRA public env vars (must be prefixed with REACT_APP_).
 * Trailing slashes are removed; paths should start with "/" (e.g. "/subscriptions").
 */

function trimTrailingSlashes(url) {
  return String(url || "").replace(/\/+$/, "");
}

/** Account service API base (e.g. https://host/account-service/api) */
export function getAccountServiceBaseUrl() {
  return trimTrailingSlashes(process.env.REACT_APP_ACCOUNT_SERVICE_URL);
}

/** Profile service API base (e.g. https://host/profile-service/api) */
export function getProfileServiceBaseUrl() {
  return trimTrailingSlashes(process.env.REACT_APP_PROFILE_SERVICE_URL);
}

/** Reporting service API base (e.g. https://host/reporting-service/api) */
export function getReportingServiceBaseUrl() {
  return trimTrailingSlashes(process.env.REACT_APP_REPORTING_SERVICE_URL);
}

/**
 * Communication service API base (letter / email / SMS content templates).
 * Prefer REACT_APP_COMMUNICATION_SERVICE_URL; falls back to REACT_APP_CUMM.
 */
export function getCommunicationServiceBaseUrl() {
  return trimTrailingSlashes(
    process.env.REACT_APP_COMMUNICATION_SERVICE_URL ||
      process.env.REACT_APP_CUMM ||
      "",
  );
}

/** Notification service API base (e.g. https://host/notification-service/api) */
export function getNotificationServiceBaseUrl() {
  return trimTrailingSlashes(process.env.REACT_APP_NOTIFICATION_SERVICE_URL);
}

/** Audit service API base (e.g. https://host/audit-service/api) */
export function getAuditServiceBaseUrl() {
  return trimTrailingSlashes(process.env.REACT_APP_AUDIT_SERVICE_URL);
}

/**
 * Letter, email, and SMS content templates (Word upload, SES HTML, etc.).
 * Mounted at .../communication-service/api/templates
 */
export function getCommunicationContentTemplatesBaseUrl() {
  return `${getCommunicationServiceBaseUrl()}/templates`;
}

/**
 * Correspondence grid filter/column templates (Save View on comms admin grids).
 * Mounted at .../notification-service/api/notifications/admin/templates
 */
export function getNotificationFilterTemplatesBaseUrl() {
  return `${getNotificationServiceBaseUrl()}/notifications/admin/templates`;
}

/**
 * Audit history grid filter/column templates (Save View on audit log grids).
 * Mounted at .../audit-service/api/templates (when implemented).
 */
export function getAuditFilterTemplatesBaseUrl() {
  return `${getAuditServiceBaseUrl()}/templates`;
}

/**
 * Subscription service API base (e.g. https://host/subscription-service/api/v1).
 * Prefer REACT_APP_SUBSCRIPTION_SERVICE_URL; falls back to REACT_APP_SUBSCRIPTION for existing .env files.
 */
export function getSubscriptionServiceBaseUrl() {
  return trimTrailingSlashes(
    process.env.REACT_APP_SUBSCRIPTION_SERVICE_URL ||
      process.env.REACT_APP_SUBSCRIPTION
  );
}

/**
 * CRM filter/column templates for subscriptions (members list).
 * Express mounts at GET/POST .../api/v1/subscriptions/templates (not .../api/templates).
 */
export function getSubscriptionFilterTemplatesBaseUrl() {
  return `${getSubscriptionServiceBaseUrl()}/subscriptions/templates`;
}
