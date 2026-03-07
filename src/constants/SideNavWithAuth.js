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
const createMenuItem = (key, icon, label, permissions = []) => ({
  key,
  icon: <div className="icon">{icon}</div>,
  label: <div className="sidebar-label">{label}</div>,
  permissions,
});

export const correspondenceItems = [
  createMenuItem(
    "Dashboard",
    <FaChartLine />,
    "Dashboard",
    ["menu:correspondence:access"]
  ),
  createMenuItem(
    "InAppNotifications",
    <FaBell />,
    "In-App Notifications",
    ["menu:correspondence:access"]
  ),
  createMenuItem(
    "Email",
    <FaEnvelope />,
    "Email",
    ["menu:correspondence:access"]
  ),
  createMenuItem(
    "SMS",
    <FaSms />,
    "SMS",
    ["menu:correspondence:access"]
  ),
  createMenuItem(
    "Notes & Letters",
    <FaStickyNote />,
    "Notes & Letters",
    ["menu:correspondence:access"]
  ),
  createMenuItem(
    "Communication History",
    <FaHistory />,
    "Communication History",
    ["menu:correspondence:access"]
  ),
];

export const financeItems = [
  createMenuItem(
    "Online Payments",
    <FaCreditCard />,
    "Online Payments",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Cheque",
    <FaMoneyCheckAlt />,
    "Cheque",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Deductions",
    <FaCoins />,
    "Deductions",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Standing Orders",
    <FaHandHoldingUsd />,
    "Standing Orders",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "DD Authorisations",
    <FaUserShield />,
    "DD Authorisation",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Direct Debit",
    <FaCreditCard />,
    "Direct Debit",
    ["menu:finance:access"]
  ),

  createMenuItem(
    "Refunds",
    <FaReceipt />,
    "Refunds",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Write-offs",
    <FaCommentDollar />,
    "Write-offs",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Imports",
    <FaFileImport />,
    "Imports",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Batches",
    <FaFileInvoiceDollar />,
    "Batches",
    ["menu:finance:access"]
  ),
  createMenuItem(
    "Reconciliations",
    <FaExchangeAlt />,
    "Reconciliations",
    ["menu:finance:access"]
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
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Membership",
    <FaUsers />,
    "Membership",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Leavers",
    <FaUserMinus />,
    "Leavers",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Joiners",
    <FaUserPlus />,
    "Joiners",
    ["menu:membership:access"]
  ),
];

export const subscriptionItems = [
  createMenuItem(
    "MembershipDashboard",
    <FaChartLine />,
    "Membership Dashboard",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Applications",
    <FaClipboardList />,
    "Applications",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Profiles",
    <FaUserCog />,
    "Profiles",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Membership",
    <FaIdCard />,
    "Membership",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Reminders",
    <FaRegClock />,
    "Reminders",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Cancellations",
    <FaBan />,
    "Cancellations",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Transfer Requests",
    <FaExchangeAlt />,
    "Transfer Requests",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Change Category",
    <FaTags />,
    "Change Category",
    ["menu:membership:access"]
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
    ["menu:membership:access"]
  ),
  createMenuItem(
    "CornMarket Rewards",
    <FaUserPlus />,
    "INMO Rewards",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "Recruit a Friend",
    <FaUserFriends />,
    "Recruit a Friend",
    ["menu:membership:access"]
  ),
  createMenuItem(
    "LandingPage",
    <FaGlobe />,
    "LandingPage",
    ["menu:membership:access"]
  ),
];

export const configurationItems = [
  createMenuItem(
    "Templetes",
    <FaFileCode />,
    "Templetes",
    ["menu:configuration:access"]
  ),

  createMenuItem(
    "System Configuration",
    <FaWrench />,
    "System Configuration",
    ["menu:configuration:access"]
  ),

  createMenuItem(
    "Permission Management",
    <FaKey />,
    "Permission Management",
    ["menu:configuration:access"]
  ),
  createMenuItem(
    "Role Management",
    <FaUserCog />,
    "Role Management",
    ["menu:configuration:access"]
  ),
  createMenuItem(
    "User Management",
    <FaUsers />,
    "User Management",
    ["menu:configuration:access"]
  ),
  createMenuItem(
    "Product Management",
    <FaBox />,
    "Product Management",
    ["menu:configuration:access"]
  ),
  createMenuItem(
    "Tenant Management",
    <FaServer />,
    "Tenant Management",
    ["menu:configuration:access"]
  ),

  createMenuItem(
    "Policy Client Example",
    <FaShieldAlt />,
    "Policy Client Example",
    ["menu:configuration:access"]
  ),
];

export const reportItems = [
  createMenuItem(
    "Cancelled Members Report",
    <FaUserTimes />,
    "Cancelled Members Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Comparison Report",
    <FaBalanceScale />,
    "Comparison Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Control Report",
    <FaClipboardCheck />,
    "Control Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Deferred Income",
    <FaFileInvoiceDollar />,
    "Deferred Income",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "End of Year Reports",
    <FaCalendarCheck />,
    "End of Year Reports",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Executive Council Report",
    <FaGavel />,
    "Executive Council Report + drill down listings",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Joiners Report",
    <FaUserPlus />,
    "Joiners Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Leavers Report",
    <FaUserMinus />,
    "Leavers Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Live Stats",
    <FaChartPie />,
    "Live Stats",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "New Members Report",
    <FaUserEdit />,
    "New Members Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Resigned Members Report",
    <FaUserSlash />,
    "Resigned Members Report",
    ["menu:reports:access"]
  ),
  createMenuItem(
    "Suspended Members Report",
    <FaUserLock />,
    "Suspended Members Report",
    ["menu:reports:access"]
  ),
];

export const casesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    ["menu:issues_management:access"]
  ),
  createMenuItem(
    "All cases",
    <FaFolderOpen />,
    "All cases",
    ["menu:issues_management:access"]
  ),
  createMenuItem(
    "Assigned to me",
    <FaUserShield />,
    "Assigned to me",
    ["menu:issues_management:access"]
  ),
  createMenuItem(
    "Reports setting",
    <FaWrench />,
    "Reports setting",
    ["menu:issues_management:access"]
  ),
];

export const issuesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    ["menu:issues_management:access"]
  ),
  createMenuItem(
    "All Issues",
    <FaFolderOpen />,
    "All Issues",
    ["menu:issues_management:access"]
  ),
  createMenuItem(
    "Assigned to me",
    <FaUserShield />,
    "Assigned to me",
    ["menu:issues_management:access"]
  ),
  createMenuItem(
    "Reports setting",
    <FaWrench />,
    "Reports setting",
    ["menu:issues_management:access"]
  ),
];

export const eventsItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    ["menu:events:access"]
  ),
  createMenuItem(
    "Events",
    <FaCalendarAlt />,
    "Events",
    ["menu:events:access"]
  ),
  createMenuItem(
    "Attendees",
    <FaUsers />,
    "Attendees",
    ["menu:events:access"]
  ),
  createMenuItem(
    "Reporting",
    <FaChartLine />,
    "Reporting",
    ["menu:events:access"]
  ),
  createMenuItem(
    "Settings",
    <FaWrench />,
    "Settings",
    ["menu:events:access"]
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
