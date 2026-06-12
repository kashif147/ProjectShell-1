const RELOAD_EVENT = "debtors-list-report-reload";

function toApiDate(value) {
  if (value == null || value === "") return null;
  const normalized = String(value).trim();
  return normalized.slice(0, 10);
}

export function getDefaultReportingPeriodValues() {
  const now = new Date();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  const year =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const endOfMonth = new Date(year, month, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const dateTo = `${endOfMonth.getFullYear()}-${pad(endOfMonth.getMonth() + 1)}-${pad(endOfMonth.getDate())} 23:59:59`;
  const dateFrom = `${year}-${pad(month)}-01 00:00:00`;
  return [dateFrom, dateTo];
}

export function getReportingPeriodRange(filtersState = {}) {
  const selectedValues = filtersState["Reporting Period"]?.selectedValues || [];
  const from = toApiDate(selectedValues[0]);
  const to = toApiDate(selectedValues[1]);
  if (!from || !to) return null;
  return { from, to };
}

export function buildDebtorsListRequest(
  filtersState = {},
  { offset = 0, limit = 5000, search } = {},
) {
  const reportingPeriod =
    getReportingPeriodRange(filtersState) ||
    (() => {
      const [from, to] = getDefaultReportingPeriodValues();
      return { from: toApiDate(from), to: toApiDate(to) };
    })();

  const body = {
    offset: Number(offset) || 0,
    limit: Math.min(Number(limit) || 5000, 5000),
    dateFrom: reportingPeriod.from,
    dateTo: reportingPeriod.to,
    reportingPeriod,
  };

  const searchTerm = String(search ?? "").trim();
  if (searchTerm) body.search = searchTerm;

  return body;
}

export function formatDebtorsReportPeriodLabel(filtersState = {}, meta = {}) {
  const reportingPeriod = getReportingPeriodRange(filtersState);
  if (reportingPeriod) {
    return `${reportingPeriod.from} to ${reportingPeriod.to} (balance as at ${reportingPeriod.to})`;
  }
  if (meta.asOfDate) {
    return `As at ${meta.asOfDate}`;
  }
  return "";
}

export function bumpDebtorsListReportReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeDebtorsListReportReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
