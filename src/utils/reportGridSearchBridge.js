/** Toolbar search box ↔ report page grid (Membership No / Name). */
let searchQuery = "";
const listeners = new Set();

export function getReportGridSearchQuery() {
  return searchQuery;
}

export function setReportGridSearchQuery(next) {
  const value = String(next ?? "");
  if (value === searchQuery) return;
  searchQuery = value;
  listeners.forEach((fn) => fn(searchQuery));
}

export function clearReportGridSearchQuery() {
  setReportGridSearchQuery("");
}

export function subscribeReportGridSearch(handler) {
  listeners.add(handler);
  handler(searchQuery);
  return () => listeners.delete(handler);
}

/** Client filter: membership number or full name (case-insensitive). */
export function filterRowsByMembershipNoOrName(rows, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q || !Array.isArray(rows)) return rows || [];
  return rows.filter((row) => {
    const no = String(row?.membershipNo ?? "").toLowerCase();
    const name = String(row?.fullName ?? "").toLowerCase();
    return no.includes(q) || name.includes(q);
  });
}
