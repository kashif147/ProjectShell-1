// Enhanced sidebar items with permission requirements
import {
  FaEnvelope,
  FaHistory,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaHandHoldingUsd,
  FaRegClock,
  FaShieldAlt,
  FaBan,
  FaBalanceScale,
  FaClipboardCheck,
  FaCalendarAlt,
  FaUserPlus,
  FaUserMinus,
  FaUserEdit,
  FaUserTimes,
  FaUserLock,
  FaSms,
  FaStickyNote,
  FaExchangeAlt,
  FaUserSlash,
  FaMapMarkerAlt,
  FaUsers,
  FaFileImport,
  FaFileAlt,
  FaClipboardList,
  FaExclamationTriangle,
  FaGavel,
  FaCalendarCheck,
  FaUserFriends,
  FaUserShield,
  FaChartLine,
  FaChartPie,
  FaReceipt,
  FaServer,
  FaKey,
  FaUserCog,
  FaLayerGroup,
  FaTags,
  FaBox,
  FaFileCode,
  FaIdCard,
  FaWrench,
  FaBriefcase,
  FaFlag,
  FaGraduationCap,
  FaFolderOpen,
  FaCoins,
  FaWallet,
  FaCommentDollar,
  FaBell
} from "react-icons/fa";

// Helper function to create menu item with permissions
const getSidebarIconTone = (key = "") => {
  const tones = [
    "blue",
    "green",
    "amber",
    "coral",
    "violet",
    "cyan",
    "rose",
    "indigo",
  ];
  const index = String(key)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[index % tones.length];
};

const createMenuItem = (key, icon, label, permissions = [], roles = []) => ({
  key,
  icon: (
    <div className={`icon sidebar-nav-icon sidebar-nav-icon--${getSidebarIconTone(key)}`}>
      {icon}
    </div>
  ),
  label: <div className="sidebar-label">{label}</div>,
  permissions,
  roles,
});

export const correspondenceItems = [
  createMenuItem(
    "Dashboard",
    <FaChartLine />,
    "Dashboard",
    []
  ),
  createMenuItem(
    "InAppNotifications",
    <FaBell />,
    "In-App Notifications",
    ["notifications:read"]
  ),
  createMenuItem(
    "Email",
    <FaEnvelope />,
    "Email",
    ["communication:write"]
  ),
  createMenuItem(
    "SMS",
    <FaSms />,
    "SMS",
    ["communication:write"]
  ),
  createMenuItem(
    "Notes & Letters",
    <FaStickyNote />,
    "Notes & Letters",
    ["communication:read"]
  ),
  createMenuItem(
    "Correspondence",
    <FaHistory />,
    "Correspondence",
    ["communication:read"]
  ),
];

export const financeItems = [
  createMenuItem(
    "Online Payments",
    <FaCreditCard />,
    "Online Payments",
    ["payments:read"]
  ),
  createMenuItem(
    "Cheque",
    <FaMoneyCheckAlt />,
    "Cheque",
    ["payments:read"]
  ),
  createMenuItem(
    "Deductions",
    <FaCoins />,
    "Deductions",
    ["payments:read"]
  ),
  createMenuItem(
    "Standing Orders",
    <FaHandHoldingUsd />,
    "Standing Orders",
    ["payments:read"]
  ),
  createMenuItem(
    "DD Authorisations",
    <FaUserShield />,
    "DD Authorisation",
    ["payments:read"]
  ),
  createMenuItem(
    "Direct Debit",
    <FaCreditCard />,
    "Direct Debit",
    ["payments:read"]
  ),

  createMenuItem(
    "Refunds",
    <FaReceipt />,
    "Refunds",
    ["payments:read"]
  ),
  createMenuItem(
    "Write-offs",
    <FaCommentDollar />,
    "Write-offs",
    ["payments:read"]
  ),
  createMenuItem(
    "Credit notes",
    <FaFileAlt />,
    "Credit notes",
    ["payments:read"]
  ),
  createMenuItem(
    "Imports",
    <FaFileImport />,
    "Imports",
    ["payments:read"]
  ),
  createMenuItem(
    "General ledger",
    <FaBalanceScale />,
    "General ledger",
    ["payments:read"]
  ),
  createMenuItem(
    "Journal adjustments",
    <FaCommentDollar />,
    "Journal adjustments",
    ["payments:read"]
  ),
  createMenuItem(
    "Reconciliations",
    <FaExchangeAlt />,
    "Reconciliations",
    ["payments:read"]
  ),
  // createMenuItem(
  //   "DD Batches",
  //   <FaCashRegister />,
  //   "DD Batches",
  //   ["USER_READ", "USER_WRITE"],
  //   ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  // ),
];

export const profileItems = [
  createMenuItem(
    "Non Members",
    <FaUserSlash />,
    "Non Members",
    ["portal:read"]
  ),
  createMenuItem(
    "Membership",
    <FaUsers />,
    "Membership",
    ["crm:member:read"]
  ),
  createMenuItem(
    "Leavers",
    <FaUserMinus />,
    "Leavers",
    ["crm:member:read"]
  ),
  createMenuItem(
    "Joiners",
    <FaUserPlus />,
    "Joiners",
    ["crm:member:read"]
  ),
];

export const subscriptionItems = [
  createMenuItem(
    "MembershipDashboard",
    <FaChartLine />,
    "Executive Dashboard",
    []
  ),
  createMenuItem(
    "Applications",
    <FaClipboardList />,
    "Applications",
    ["application:read"]
  ),
  createMenuItem(
    "Profiles",
    <FaUserCog />,
    "Profiles",
    ["profile:read"]
  ),
  createMenuItem(
    "Membership",
    <FaIdCard />,
    "Membership",
    ["crm:member:read"]
  ),
  createMenuItem(
    "Payment Forms",
    <FaWallet />,
    "Payment Forms",
    ["crm:member:read"]
  ),
  createMenuItem(
    "Reminders",
    <FaRegClock />,
    "Reminders",
    ["notifications:read"]
  ),
  createMenuItem(
    "Cancellations",
    <FaBan />,
    "Cancellations",
    ["subscriptions:read"]
  ),
  createMenuItem(
    "Transfer Requests",
    <FaExchangeAlt />,
    "Transfer Requests",
    ["transferrequests:read"]
  ),
  createMenuItem(
    "Category Changes",
    <FaTags />,
    "Category Changes",
    ["changeofcategory:read"]
  ),
  // createMenuItem(
  //   "CornMarket",
  //   <FaBuilding />,
  //   "CornMarket",
  //   ["menu:correspondence:access"],
  //   ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  // ),

  createMenuItem(
    "CornMarket New Graduate",
    <FaGraduationCap />,
    "New Graduate",
    ["corn:market:new:graduate:read"]
  ),
  createMenuItem(
    "CornMarket Rewards",
    <FaUserPlus />,
    "INMO Rewards",
    ["corn:market:rewards:read"]
  ),
  createMenuItem(
    "Recruit a Friend",
    <FaUserFriends />,
    "Recruit a Friend",
    ["recruit:friend:read"]
  ),
];

export const yearEndRenewalItems = [
  createMenuItem(
    "Year-End Renewal",
    <FaCalendarCheck />,
    "Year-End Renewal",
    ["subscriptions:write", "payments:write"],
    ["SU"]
  ),
];

export const configurationItems = [
  createMenuItem(
    "Templates",
    <FaFileCode />,
    "Templates",
    ["templates:read"]
  ),

  createMenuItem(
    "System Configuration",
    <FaWrench />,
    "System Configuration",
    ["portal:read"]
  ),

  createMenuItem(
    "Permission Management",
    <FaKey />,
    "Permission Management",
    ["role:permission:assign"]
  ),
  createMenuItem(
    "Role Management",
    <FaUserCog />,
    "Role Management",
    ["role:read"]
  ),
  createMenuItem(
    "User Management",
    <FaUsers />,
    "User Management",
    ["user:read"]
  ),
  createMenuItem(
    "Product Management",
    <FaBox />,
    "Product Management",
    ["portal:read"]
  ),
  createMenuItem(
    "Tenant Management",
    <FaServer />,
    "Tenant Management",
    ["tenant:read"]
  ),

  createMenuItem(
    "Policy Client Example",
    <FaShieldAlt />,
    "Policy Client Example",
    ["portal:read"]
  ),
];

export const reportItems = [
  createMenuItem(
    "Membership Reports",
    <FaFileAlt />,
    "Membership Reports",
    ["reporting:read"]
  ),
  createMenuItem(
    "Accounts Reports",
    <FaFileInvoiceDollar />,
    "Accounts Reports",
    ["reporting:read"]
  ),
  createMenuItem(
    "Comparison Report",
    <FaBalanceScale />,
    "Comparison Report",
    ["reporting:read"]
  ),
  createMenuItem(
    "Control Report",
    <FaClipboardCheck />,
    "Control Report",
    ["control:report:read"]
  ),
  createMenuItem(
    "Deferred Income",
    <FaFileInvoiceDollar />,
    "Deferred Income",
    ["deferred:income:report:read"]
  ),
  createMenuItem(
    "End of Year Reports",
    <FaCalendarCheck />,
    "End of Year Reports",
    ["end:of:year:report:read"]
  ),
  createMenuItem(
    "Executive Council Report",
    <FaGavel />,
    "Executive Council Report + drill down listings",
    ["executive:council:report:read"]
  ),
];

// Single source of truth for the Issue Management side nav - "Cases" and "Issues
// Management" previously rendered two independently-maintained, un-permission-gated
// (permissions: []) item lists that happened to route to the same pages
// (Sidebar.js's getNavLinkData resolves "Cases"/"All Issues"/"All cases" to the same
// /CasesSummary etc.). `casesItems` is kept as an alias, not a duplicate, so any other
// file still importing it (Sidebar.js's itemsMap.Cases) renders the identical,
// permission-gated list rather than a second, divergent one.
//
// Every item's `permissions` is the actual reachability gate for that nav entry
// (Sidebar.js filters menuItems by `hasPermission`) - the dedicated Complaints/Fitness to
// Practice/Industrial Relations/Data Protection entries below are gated on their own
// team resource (`issues-<team>:read`, matching `services/issue.service.js`'s
// `ISSUE_TYPE_PERMISSION_MAP` in issue-service) rather than the base "issues:read" every
// other entry uses - this is the nav-level half of "only authorised users have access to
// each section based on their roles" from the requirements doc; the real enforcement is
// still server-side (issue-service's `GET /issues` already scopes results to the caller's
// granted `issues-<team>:read` resources), this only stops a Complaints-only user from
// even seeing a working link to, say, Industrial Relations. See
// RoutePermissions.js/Entry.js for the matching route-level gate.
export const issuesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    ["issues:read"]
  ),
  createMenuItem(
    "Open Issues",
    <FaFolderOpen />,
    "Open Issues",
    ["issues:read"]
  ),
  createMenuItem(
    "Closed",
    <FaClipboardCheck />,
    "Closed",
    ["issues:read"]
  ),
  createMenuItem(
    "Complaints",
    <FaExclamationTriangle />,
    "Complaints",
    ["issues-complaints:read"]
  ),
  createMenuItem(
    "Fitness to Practice",
    <FaGraduationCap />,
    "Fitness to Practice",
    ["issues-ftp:read"]
  ),
  createMenuItem(
    "Industrial Relations",
    <FaBalanceScale />,
    "Industrial Relations",
    ["issues-ir:read"]
  ),
  createMenuItem(
    "Data Protection",
    <FaShieldAlt />,
    "Data Protection",
    ["issues-dataprotection:read"]
  ),
];

export const casesItems = issuesItems;

export const eventsItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    ["events:read"]
  ),
  createMenuItem(
    "Events",
    <FaCalendarAlt />,
    "Events",
    ["events:read"]
  ),
  createMenuItem(
    "Attendees",
    <FaUsers />,
    "Attendees",
    ["portal:read"]
  ),
  createMenuItem(
    "Reporting",
    <FaChartLine />,
    "Reporting",
    ["portal:read"]
  ),
  createMenuItem(
    "Settings",
    <FaWrench />,
    "Settings",
    ["portal:read"]
  ),
];

// Helper function to filter menu items based on user permissions and roles
export const filterMenuItemsByAuth = (
  menuItems,
  userPermissions = []
) => {
  return menuItems.filter((item) => {
    // If no permissions required, show the item
    if (!item.permissions?.length) {
      return true;
    }

    // Check if user has wildcard permission (grants all permissions)
    const hasWildcardPermission = userPermissions.includes("*");

    // Check permissions
    const hasRequiredPermission =
      hasWildcardPermission ||
      !item.permissions?.length ||
      item.permissions.some((permission) =>
        userPermissions.includes(permission)
      );

    console.log(`Filtering item ${item.key}:`, {
      hasWildcardPermission,
      hasRequiredPermission,
      userPermissions,
      itemPermissions: item.permissions,
    });

    return hasRequiredPermission;
  });
};

const SideNavWithAuth = {
  correspondenceItems,
  financeItems,
  profileItems,
  subscriptionItems,
  configurationItems,
  reportItems,
  casesItems,
  issuesItems,
  eventsItems,
  filterMenuItemsByAuth,
};

export default SideNavWithAuth;
