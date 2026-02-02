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
  FaClipboardList,
  FaExclamationTriangle,
  FaGavel,
  FaCalendarCheck,
  FaUserFriends,
  FaUserShield,
  FaChartLine,
  FaChartPie,
  FaReceipt,
  FaGlobe,
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
const createMenuItem = (key, icon, label, permissions = [], roles = []) => ({
  key,
  icon: <div className="icon">{icon}</div>,
  label: <div className="sidebar-label">{label}</div>,
  permissions,
  roles,
});

export const correspondenceItems = [
  createMenuItem(
    "Dashboard",
    <FaChartLine />,
    "Dashboard",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "InAppNotifications",
    <FaBell />,
    "In-App Notifications",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Email",
    <FaEnvelope />,
    "Email",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "SMS",
    <FaSms />,
    "SMS",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Notes & Letters",
    <FaStickyNote />,
    "Notes & Letters",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Communication History",
    <FaHistory />,
    "Communication History",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
];

export const financeItems = [
  createMenuItem(
    "Online Payments",
    <FaCreditCard />,
    "Online Payments",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Cheque",
    <FaMoneyCheckAlt />,
    "Cheque",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Deductions",
    <FaCoins />,
    "Deductions",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Standing Orders",
    <FaHandHoldingUsd />,
    "Standing Orders",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "DD Authorisations",
    <FaUserShield />,
    "DD Authorisation",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Direct Debit",
    <FaCreditCard />,
    "Direct Debit",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),

  createMenuItem(
    "Refunds",
    <FaReceipt />,
    "Refunds",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Write-offs",
    <FaCommentDollar />,
    "Write-offs",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Imports",
    <FaFileImport />,
    "Imports",
    ["USER_WRITE", "USER_MANAGE_ROLES"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Batches",
    <FaFileInvoiceDollar />,
    "Batches",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
  ),
  createMenuItem(
    "Reconciliations",
    <FaExchangeAlt />,
    "Reconciliations",
    ["USER_READ", "USER_WRITE"],
    ["AM", "DAM", "GS", "DGS", "ASU", "SU"]
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
    ["crm:member:read", "crm:member:list"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Membership",
    <FaUsers />,
    "Membership",
    ["crm:member:read", "crm:member:list"],
    ["MEMBER", "MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Leavers",
    <FaUserMinus />,
    "Leavers",
    ["crm:member:read", "crm:member:list"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Joiners",
    <FaUserPlus />,
    "Joiners",
    ["crm:member:read", "crm:member:list"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
];

export const subscriptionItems = [
  createMenuItem(
    "MembershipDashboard",
    <FaChartLine />,
    "Membership Dashboard",
    ["portal:access", "crm:access"],
    ["MEMBER", "MO", "AMO", "GS", "DGS", "SU"]
  ),
  createMenuItem(
    "Applications",
    <FaClipboardList />,
    "Applications",
    ["crm:application:read", "crm:application:list"],
    ["MO", "AMO", "GS", "DGS", "SU"]
  ),
  createMenuItem(
    "Profiles",
    <FaUserCog />,
    "Profiles",
    ["crm:member:read", "crm:member:list"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Membership",
    <FaIdCard />,
    "Membership",
    ["user:read", "role:read"],
    ["SU", "GS", "DGS"]
  ),
  createMenuItem(
    "Reminders",
    <FaRegClock />,
    "Reminders",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Cancellations",
    <FaBan />,
    "Cancellations",
    ["crm:member:read", "crm:member:write"],
    ["MO", "AMO", "GS", "DGS", "SU"]
  ),
  createMenuItem(
    "Transfer Requests",
    <FaExchangeAlt />,
    "Transfer Requests",
    ["crm:member:read", "crm:member:write"],
    ["MO", "AMO", "GS", "DGS", "SU"]
  ),
  createMenuItem(
    "Change Category",
    <FaTags />,
    "Change Category",
    ["crm:member:read", "crm:member:write"],
    ["MO", "AMO", "GS", "DGS", "SU"]
  ),
  // createMenuItem(
  //   "CornMarket",
  //   <FaBuilding />,
  //   "CornMarket",
  //   ["crm:access"],
  //   ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  // ),

  createMenuItem(
    "CornMarket New Graduate",
    <FaGraduationCap />,
    "New Graduate",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "CornMarket Rewards",
    <FaUserPlus />,
    "INMO Rewards",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Recruit a Friend",
    <FaUserFriends />,
    "Recruit a Friend",
    ["crm:member:create"],
    ["MO", "AMO", "GS", "DGS", "SU"]
  ),
  createMenuItem(
    "LandingPage",
    <FaGlobe />,
    "LandingPage",
    ["portal:access"],
    ["MEMBER", "NON-MEMBER"]
  ),
];

export const configurationItems = [
  createMenuItem(
    "Templetes",
    <FaFileCode />,
    "Templetes",
    ["user:read", "role:read"],
    ["SU", "GS", "DGS"]
  ),

  createMenuItem(
    "System Configuration",
    <FaWrench />,
    "System Configuration",
    ["user:read", "role:read"],
    ["SU", "GS", "DGS"]
  ),

  createMenuItem(
    "Permission Management",
    <FaKey />,
    "Permission Management",
    ["role:read", "role:write"],
    ["SU", "GS"]
  ),
  createMenuItem(
    "Role Management",
    <FaUserCog />,
    "Role Management",
    ["role:read", "role:list"],
    ["SU", "GS", "DGS"]
  ),
  createMenuItem(
    "User Management",
    <FaUsers />,
    "User Management",
    ["user:read", "user:list"],
    ["SU", "GS", "DGS"]
  ),
  createMenuItem(
    "Product Management",
    <FaBox />,
    "Product Management",
    ["user:read", "user:write"],
    ["SU", "GS", "DGS"]
  ),
  createMenuItem(
    "Tenant Management",
    <FaServer />,
    "Tenant Management",
    ["user:read", "user:write"],
    ["SU", "GS", "DGS"]
  ),

  createMenuItem(
    "Policy Client Example",
    <FaShieldAlt />,
    "Policy Client Example",
    ["admin:read", "user:read"],
    ["SU", "GS", "DGS"]
  ),
];

export const reportItems = [
  createMenuItem(
    "Cancelled Members Report",
    <FaUserTimes />,
    "Cancelled Members Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Comparison Report",
    <FaBalanceScale />,
    "Comparison Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Control Report",
    <FaClipboardCheck />,
    "Control Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Deferred Income",
    <FaFileInvoiceDollar />,
    "Deferred Income",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "End of Year Reports",
    <FaCalendarCheck />,
    "End of Year Reports",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Executive Council Report",
    <FaGavel />,
    "Executive Council Report + drill down listings",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Joiners Report",
    <FaUserPlus />,
    "Joiners Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Leavers Report",
    <FaUserMinus />,
    "Leavers Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Live Stats",
    <FaChartPie />,
    "Live Stats",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "New Members Report",
    <FaUserEdit />,
    "New Members Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Resigned Members Report",
    <FaUserSlash />,
    "Resigned Members Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Suspended Members Report",
    <FaUserLock />,
    "Suspended Members Report",
    ["crm:reports:read"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
];

export const casesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "All cases",
    <FaFolderOpen />,
    "All cases",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Assigned to me",
    <FaUserShield />,
    "Assigned to me",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
  createMenuItem(
    "Reports setting",
    <FaWrench />,
    "Reports setting",
    ["role:read", "role:write"],
    ["SU", "GS"]
  ),
];

export const issuesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    [], // No permission restrictions
    [] // No role restrictions
  ),
  createMenuItem(
    "All Issues",
    <FaFolderOpen />,
    "All Issues",
    [], // No permission restrictions
    [] // No role restrictions
  ),
  createMenuItem(
    "Assigned to me",
    <FaUserShield />,
    "Assigned to me",
    [], // No permission restrictions
    [] // No role restrictions
  ),
  createMenuItem(
    "Reports setting",
    <FaWrench />,
    "Reports setting",
    [], // No permission restrictions
    [] // No role restrictions
  ),
];

export const eventsItems = [
  createMenuItem(
    "Manage Events",
    <FaCalendarAlt />,
    "Manage Events",
    ["crm:access"],
    ["MO", "AMO", "GS", "DGS", "IRO", "SU"]
  ),
];

// Helper function to filter menu items based on user permissions and roles
export const filterMenuItemsByAuth = (
  menuItems,
  userPermissions = [],
  userRoles = []
) => {
  return menuItems.filter((item) => {
    // If no permissions/roles required, show the item
    if (!item.permissions?.length && !item.roles?.length) {
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

    // Check roles
    const hasRequiredRole =
      !item.roles?.length ||
      item.roles.some((role) => userRoles.includes(role));

    console.log(`Filtering item ${item.key}:`, {
      hasWildcardPermission,
      hasRequiredPermission,
      hasRequiredRole,
      userPermissions,
      userRoles,
      itemPermissions: item.permissions,
      itemRoles: item.roles,
    });

    return hasRequiredPermission && hasRequiredRole;
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
