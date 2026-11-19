import { getCommunicationContentTemplatesBaseUrl } from "./serviceUrls";

/**
 * Content template domain ownership (letter, email, SMS, In-App — not grid Save View).
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
  "in-app",
  "inapp",
]);

/** Channels that use subject + HTML/text body (no DOCX upload). */
export const HTML_BODY_TEMPLATE_TYPES = new Set([
  "email",
  "sms",
  "text",
  "in-app",
  "inapp",
]);

export function normalizeContentTemplateType(type) {
  return String(type || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

export function isContentTemplateType(type) {
  return CONTENT_TEMPLATE_TYPES.has(normalizeContentTemplateType(type));
}

/** Email / In-App / SMS — Quill editor path (not Word upload). */
export function isHtmlBodyTemplateType(type) {
  return HTML_BODY_TEMPLATE_TYPES.has(normalizeContentTemplateType(type));
}

/** Canonical type string for create/update payloads. */
export function canonicalHtmlTemplateType(type) {
  const t = normalizeContentTemplateType(type);
  if (t === "in-app" || t === "inapp") return "In-App";
  if (t === "sms" || t === "text") return "SMS";
  return "Email";
}

/** REST base for letter / email / SMS / In-App template CRUD. */
export function resolveContentTemplatesApiUrl() {
  return getCommunicationContentTemplatesBaseUrl();
}
