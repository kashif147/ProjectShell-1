export const APPLICATION_MGT_PATH = "/applicationMgt";

/**
 * Build ?applicationId=… or ?draftId=… for application management (refresh-safe).
 */
export function buildApplicationMgtSearch({ applicationId, draftId, edit = true } = {}) {
  const p = new URLSearchParams();
  if (draftId != null && draftId !== "") {
    p.set("draftId", String(draftId));
  } else if (applicationId != null && applicationId !== "") {
    p.set("applicationId", String(applicationId));
  }
  if (edit && (p.has("draftId") || p.has("applicationId"))) {
    p.set("edit", "1");
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}
