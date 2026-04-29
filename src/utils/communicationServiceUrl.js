/**
 * Build URLs for communication-service using the same base as letter templates.
 * Prefer REACT_APP_COMMUNICATION_SERVICE_URL; fall back to REACT_APP_CUMM.
 * Base typically ends with .../communication-service/api (no trailing slash).
 */
export function communicationServicePath(pathSegment) {
  const base = (
    process.env.REACT_APP_COMMUNICATION_SERVICE_URL ||
    process.env.REACT_APP_CUMM ||
    ""
  ).replace(/\/$/, "");
  if (!base) return "";
  const seg = String(pathSegment || "").replace(/^\//, "");
  return seg ? `${base}/${seg}` : base;
}
