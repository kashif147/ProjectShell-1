import { getCommunicationContentTemplatesBaseUrl } from "./serviceUrls";

/**
 * Content template domain ownership (letter, email, SMS — not grid Save View).
 * All content templates live in communication-service.
 */
export const CONTENT_TEMPLATE_SERVICE = "communication-service";

/** tempolateType / category values stored on communication-service Template documents. */
export const CONTENT_TEMPLATE_TYPES = new Set([
  "letter",
  "letters",
  "email",
  "sms",
  "text",
]);

export function isContentTemplateType(type) {
  const normalized = String(type || "").trim().toLowerCase();
  return CONTENT_TEMPLATE_TYPES.has(normalized);
}

/** REST base for letter / email / SMS template CRUD (upload, SES HTML, etc.). */
export function resolveContentTemplatesApiUrl() {
  return getCommunicationContentTemplatesBaseUrl();
}
