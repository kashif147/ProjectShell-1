/**
 * Lets report pages register export payload; HeaderDetails Export menu reads it.
 */
let activeRegistration = null;

export function registerReportExport(registration) {
  activeRegistration = registration;
}

export function unregisterReportExport() {
  activeRegistration = null;
}

export function getReportExportRegistration() {
  return activeRegistration;
}

export function resolveReportExportPayload() {
  const reg = activeRegistration;
  if (!reg) return null;
  const base = typeof reg.getPayload === "function" ? reg.getPayload() : reg;
  if (!base) return null;
  return {
    reportTitle: base.reportTitle || reg.reportTitle || "Report",
    data: base.data || [],
    screenCols: base.screenCols || [],
    filtersState: base.filtersState || {},
    disabled: Boolean(base.disabled ?? reg.disabled),
  };
}
