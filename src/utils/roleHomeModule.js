/** Role → default app launcher / sidebar module (Redux menuLbl key). */

export const FINANCE_MENU_KEY = "Finance";
export const MEMBERSHIP_MENU_KEY = "Subscriptions & Rewards";

/** `location.state.search` values that mean the user is in the finance area. */
export const FINANCE_CONTEXT_SEARCHES = new Set([
  "Finance",
  "Imports",
  "Import",
  "Deductions",
  "Reconciliation",
  "Journal adjustments",
  "Standing Orders",
  "Cheques",
  "Cheque",
  "Refunds",
  "Write-offs",
  "Credit notes",
  "General ledger",
  "Direct Debit Authorization",
  "Direct Debit",
  "Online Payment",
  "Online Payments",
  "Batch Member Summary",
]);

export const MENU_MODULE_KEYS = [
  "Subscriptions & Rewards",
  "Finance",
  "Correspondence",
  "Issues Management",
  "Events",
  "Configuration",
  "Profiles",
  "Reports",
  "Cases",
  "Membership",
];

export function normalizeRoleCodes(roles = []) {
  return roles.map((role) => {
    if (typeof role === "string") return role;
    return role.code || role.name || role;
  });
}

export function getRoleCodesFromStorage() {
  try {
    const userDataRaw = localStorage.getItem("userData");
    if (!userDataRaw) return [];
    const parsed = JSON.parse(userDataRaw);
    return normalizeRoleCodes(parsed.roles || []);
  } catch {
    return [];
  }
}

/**
 * Default sidebar / app-launcher module for the user's primary role.
 * @param {string[]} roleCodes
 * @returns {string}
 */
export function getHomeMenuKeyFromRoles(roleCodes = []) {
  if (roleCodes.includes("SU") || roleCodes.includes("ASU")) {
    return "Configuration";
  }
  if (roleCodes.includes("GS") || roleCodes.includes("DGS")) {
    return "Configuration";
  }
  if (roleCodes.includes("MO") || roleCodes.includes("AMO")) {
    return MEMBERSHIP_MENU_KEY;
  }
  if (roleCodes.includes("AM") || roleCodes.includes("DAM")) {
    return FINANCE_MENU_KEY;
  }
  if (roleCodes.includes("IRO")) {
    return "Issues Management";
  }
  if (roleCodes.includes("IO")) {
    return "Correspondence";
  }
  if (roleCodes.includes("MEMBER")) {
    return MEMBERSHIP_MENU_KEY;
  }
  return MEMBERSHIP_MENU_KEY;
}

export function getHomeRouteFromMenuKey(menuKey) {
  const routes = {
    Configuration: "/Configuration",
    [MEMBERSHIP_MENU_KEY]: "/MembershipDashboard",
    [FINANCE_MENU_KEY]: "/onlinePayment",
    Correspondence: "/CorrespondenceDashboard",
    "Issues Management": "/IssuesManagementDashboard",
    Events: "/EventsDashboard",
    Reports: "/Reports",
  };
  return routes[menuKey] || "/MembershipDashboard";
}

export function getHomeRouteFromRoles(roleCodes = []) {
  return getHomeRouteFromMenuKey(getHomeMenuKeyFromRoles(roleCodes));
}

export function isFinanceContextSearch(search) {
  if (!search) return false;
  return FINANCE_CONTEXT_SEARCHES.has(String(search).trim());
}

export function isFinancePrimaryUser(roleCodes = []) {
  const home = getHomeMenuKeyFromRoles(roleCodes);
  return home === FINANCE_MENU_KEY;
}

export function shouldUseFinanceSidebarForPath(pathname, locationState, options = {}) {
  const { activeMenuKey, roleCodes = getRoleCodesFromStorage() } = options;

  if (pathname !== "/Details") {
    return false;
  }

  if (isFinanceContextSearch(locationState?.search)) {
    return true;
  }

  if (activeMenuKey === FINANCE_MENU_KEY) {
    return true;
  }

  const saved = localStorage.getItem("activeMenuModule");
  if (saved === FINANCE_MENU_KEY) {
    return true;
  }

  return isFinancePrimaryUser(roleCodes);
}
