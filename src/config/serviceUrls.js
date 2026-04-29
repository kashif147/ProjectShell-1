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
