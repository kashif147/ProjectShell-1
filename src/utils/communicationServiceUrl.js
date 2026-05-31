import { getCommunicationServiceBaseUrl } from "../config/serviceUrls";

/**
 * Build URLs for communication-service (letter / email / SMS content templates).
 * Base typically ends with .../communication-service/api (no trailing slash).
 */
export function communicationServicePath(pathSegment) {
  const base = getCommunicationServiceBaseUrl();
  if (!base) return "";
  const seg = String(pathSegment || "").replace(/^\//, "");
  return seg ? `${base}/${seg}` : base;
}
