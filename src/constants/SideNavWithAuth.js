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
    "Imports",
    <FaFileImport />,
    "Imports",
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
    "Membership Dashboard",
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

export const configurationItems = [
  createMenuItem(
    "Templetes",
    <FaFileCode />,
    "Templetes",
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
    "Cancelled Members Report",
    <FaUserTimes />,
    "Cancelled Members Report",
    ["subscriptions:read"]
  ),
  createMenuItem(
    "Comparison Report",
    <FaBalanceScale />,
    "Comparison Report",
    ["comparison:report:read"]
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
  createMenuItem(
    "Joiners Report",
    <FaUserPlus />,
    "Joiners Report",
    []
  ),
  createMenuItem(
    "Leavers Report",
    <FaUserMinus />,
    "Leavers Report",
    []
  ),
  createMenuItem(
    "Live Stats",
    <FaChartPie />,
    "Live Stats",
    ["LIVE:STATS:REPORT:READ"]
  ),
  createMenuItem(
    "New Members Report",
    <FaUserEdit />,
    "New Members Report",
    []
  ),
  createMenuItem(
    "Resigned Members Report",
    <FaUserSlash />,
    "Resigned Members Report",
    []
  ),
  createMenuItem(
    "Suspended Members Report",
    <FaUserLock />,
    "Suspended Members Report",
    ["SUSPENDED:MEMBERS:REPORT:READ"]
  ),
];

export const casesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    []
  ),
  createMenuItem(
    "All cases",
    <FaFolderOpen />,
    "All cases",
    []
  ),
  createMenuItem(
    "Assigned to me",
    <FaUserShield />,
    "Assigned to me",
    []
  ),
  createMenuItem(
    "Reports setting",
    <FaWrench />,
    "Reports setting",
    []
  ),
];

export const issuesItems = [
  createMenuItem(
    "Dashboard",
    <FaChartPie />,
    "Dashboard",
    []
  ),
  createMenuItem(
    "All Issues",
    <FaFolderOpen />,
    "All Issues",
    []
  ),
  createMenuItem(
    "Assigned to me",
    <FaUserShield />,
    "Assigned to me",
    []
  ),
  createMenuItem(
    "Reports setting",
    <FaWrench />,
    "Reports setting",
    []
  ),
];

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
