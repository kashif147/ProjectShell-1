import React from "react";
import { Breadcrumb as AntBreadcrumb } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateMenuLbl } from "../../features/MenuLblSlice";

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuLblState = useSelector((state) => state.menuLbl);

  // Get the active module from Redux state
  const activeModule = Object.keys(menuLblState).find(
    (key) => menuLblState[key]
  );

  // App launcher items mapping - matches the actual app launcher menu items
  const appLauncherItems = {
    Membership: { icon: "👤", route: "/Summary" },
    Finance: { icon: "💰", route: "/Batches" },
    Correspondence: { icon: "📧", route: "/CorrespondencesSummary" },
    Events: { icon: "📅", route: "/RosterSummary" },
    Configuration: { icon: "⚙️", route: "/Configuratin" },
    Reports: { icon: "📊", route: "/Reports" },
    Settings: { icon: "⚙️", route: "/Configuratin" },
    Courses: { icon: "📚", route: "/Courses" },
    "Professional Development": {
      icon: "💼",
      route: "/ProfessionalDevelopment",
    },
  };

  // Route to breadcrumb mapping with record ID support
  const routeBreadcrumbMap = {
    // Management Pages
    "/UserManagement": {
      module: "Configuration",
      page: "User Management",
      icon: "👥",
    },
    "/TenantManagement": {
      module: "Configuration",
      page: "Tenant Management",
      icon: "🏢",
    },
    "/RoleManagement": {
      module: "Configuration",
      page: "Role Management",
      icon: "🔐",
    },
    "/PermissionManagement": {
      module: "Configuration",
      page: "Permission Management",
      icon: "🛡️",
    },

    // Profile Pages
    "/Summary": {
      module: "Subscriptions & Rewards",
      page: "Profile Summary",
      icon: "👤",
    },
    "/Members": {
      module: "Subscriptions & Rewards",
      page: "Membership",
      icon: "👤",
    },
    "/Details": {
      module: "Subscriptions & Rewards",
      page: "Profile Details",
      icon: "👤",
      recordIdField: "regNo",
    },
    "/AddNewProfile": {
      module: "Subscriptions & Rewards",
      page: "Add New Profile",
      icon: "➕",
    },

    // Cases Pages
    "/CasesSummary": {
      module: "Issue Management",
      page: "Cases Summary",
      icon: "📋",
    },
    "/CasesById": {
      module: "Issue Management",
      page: "Case Details",
      icon: "📋",
      recordIdField: "code",
    },

    // Claims Pages
    "/ClaimSummary": {
      module: "Issue Management",
      page: "Claims Summary",
      icon: "💰",
    },
    "/ClaimsById": {
      module: "Issue Management",
      page: "Claim Details",
      icon: "💰",
      recordIdField: "code",
    },
    "/AddClaims": {
      module: "Issue Management",
      page: "Add Claim",
      icon: "➕",
    },
    // Correspondence Pages
    "/CorrespondencesSummary": {
      module: "Correspondence",
      page: "Correspondence Summary",
      icon: "📧",
    },
    "/CorspndncDetail": {
      module: "Correspondence",
      page: "Communication History",
      icon: "📧",
      recordIdField: "code",
    },
    "/Email": {
      module: "Correspondence",
      page: "Email",
      icon: "📧",
    },
    "/Sms": {
      module: "Correspondence",
      page: "SMS",
      icon: "📱",
    },
    "/Notes": {
      module: "Correspondence",
      page: "Notes & Letters",
      icon: "📝",
    },
    // Finance Pages
    "/Batches": {
      module: "Finance",
      page: "Batches",
      icon: "💳",
    },
    "/DirectDebit": {
      module: "Finance",
      page: "Direct Debit",
      icon: "💳",
    },
    "/Refunds": {
      module: "Finance",
      page: "Refunds",
      icon: "💰",
    },
    "/DirectDebitAuthorization": {
      module: "Finance",
      page: "Direct Debit Authorization",
      icon: "💳",
    },
    "/Import": {
      module: "Finance",
      page: "Import",
      icon: "📥",
    },
    "/Deductions": {
      module: "Finance",
      page: "Deductions",
      icon: "📉",
    },
    "/Cheque": {
      module: "Finance",
      page: "Cheques",
      icon: "📥",
    },
    "/Reconciliation": {
      module: "Finance",
      page: "Reconciliation",
      icon: "📥",
    },
    "/StandingOrders": {
      module: "Finance",
      page: "Standing Orders",
      icon: "📥",
    },
    "/onlinePayment": {
      module: "Finance",
      page: "Online Payments",
      icon: "📥",
    },
    "/BatchMemberSummary": {
      module: "Finance",
      page: "Batch Member Summary",
      icon: "💳",
      recordIdField: "batchName",
    },
    "/SimpleBatchMemberSummary": {
      module: "Finance",
      page: "Batch Member Summary",
      icon: "💳",
      recordIdField: "batchName",
    },
    "/DirectDebitBatchDetails": {
      module: "Finance",
      page: "Direct Debit Batch Details",
      icon: "💳",
      recordIdField: "batchName",
    },

    // Reports Pages
    "/CancelledMembersReport": {
      module: "Reports",
      page: "Cancelled Members Report",
      icon: "📊",
    },
    "/SuspendedMembersReport": {
      module: "Reports",
      page: "Suspended Members Report",
      icon: "📊",
    },
    "/ResignedMembersReport": {
      module: "Reports",
      page: "Resigned Members Report",
      icon: "📊",
    },
    "/NewMembersReport": {
      module: "Reports",
      page: "New Members Report",
      icon: "📊",
    },
    "/LeaversReport": {
      module: "Reports",
      page: "Leavers Report",
      icon: "📊",
    },
    "/JoinersReport": {
      module: "Reports",
      page: "Joiners Report",
      icon: "📊",
    },
    "/Reports": {
      module: "Reports",
      page: "Reports",
      icon: "📊",
    },

    // Membership Pages
    "/members": {
      module: "Subscriptions & Rewards",
      page: "Membership",
      icon: "👥",
    },
    "/MembershipDashboard": {
      module: "Subscriptions & Rewards",
      page: "Membership Dashboard",
      icon: "📊",
    },
    "/Applications": {
      module: "Subscriptions & Rewards",
      page: "Applications",
      icon: "📋",
    },
    "/applicationMgt": {
      module: "Subscriptions & Rewards",
      page: "Applications Mangment",
      icon: "📋",
    },
    "/AproveMembersip": {
      module: "Subscriptions & Rewards",
      page: "Approve Membership",
      icon: "✅",
      recordIdField: "code",
    },

    // Roster Pages
    "/RosterSummary": {
      module: "Events",
      page: "Roster Summary",
      icon: "📅",
    },
    "/Roster": {
      module: "Events",
      page: "Roster Details",
      icon: "📅",
      recordIdField: "code",
    },

    // Transfers
    "/Transfers": {
      module: "Subscriptions & Rewards",
      page: "Transfer Requests",
      icon: "🔄",
    },

    // Reminders
    "/RemindersSummary": {
      module: "Subscriptions & Rewards",
      page: "Reminders Summary",
      icon: "⏰",
    },
    "/RemindersDetails": {
      module: "Subscriptions & Rewards",
      page: "Reminder Details",
      icon: "⏰",
      recordIdField: "code",
    },

    // Cancellations
    "/Cancallation": {
      module: "Subscriptions & Rewards",
      page: "Cancellations",
      icon: "❌",
    },
    "/CancellationDetail": {
      module: "Subscriptions & Rewards",
      page: "Cancellation Details",
      icon: "❌",
      recordIdField: "code",
    },

    // Category Changes
    "/ChangCateSumm": {
      module: "Subscriptions & Rewards",
      page: "Change Category Summary",
      icon: "🔄",
    },
    "/ChangeCatById": {
      module: "Subscriptions & Rewards",
      page: "Change Category Details",
      icon: "🔄",
      recordIdField: "code",
    },

    // Configuration
    "/Configuratin": {
      module: "Configuration",
      page: "System Configuration",
      icon: "⚙️",
    },
    "/templeteConfig": {
      module: "Configuration",
      page: "Templete Config",
      icon: "⚙️",
    },
    "/templeteSummary": {
      module: "Configuration",
      page: "Templete Summary",
      icon: "⚙️",
    },

    // Documents
    "/Doucmnets": {
      module: "Subscriptions & Rewards",
      page: "Documents",
      icon: "📄",
      recordIdField: "code",
    },

    // Corn Market
    "/CornMarket": {
      module: "Finance",
      page: "Corn Market",
      icon: "🌽",
    },

    // Additional Batch Routes
    "/CancellationBatch": {
      module: "Subscriptions & Rewards",
      page: "Cancellation Batch",
      icon: "❌",
      recordIdField: "code",
    },

    // New Graduate & Newly Joint
    "/NewGraduate": {
      module: "Subscriptions & Rewards",
      page: "Cornmarket New Graduate",
      icon: "🎓",
    },
    "/CornMarketRewards": {
      module: "Subscriptions & Rewards",
      page: "CornMarket Rewards",
      icon: "🤝",
    },
    "/RecruitAFriend": {
      module: "Subscriptions & Rewards",
      page: "Recruit a Friend",
      icon: "FaUserFriends",

    },
  };

  // Get breadcrumb data for current route
  const getBreadcrumbData = () => {
    const currentPath = location.pathname;
    const breadcrumbData = routeBreadcrumbMap[currentPath];

    if (!breadcrumbData) {
      return null;
    }

    // Get the app launcher item for the current module
    const appLauncherItem = appLauncherItems[breadcrumbData.module];

    return {
      appLauncher: appLauncherItem,
      module: breadcrumbData.module,
      page: breadcrumbData.page,
      icon: breadcrumbData.icon,
      path: currentPath,
      recordIdField: breadcrumbData.recordIdField,
    };
  };

  const breadcrumbData = getBreadcrumbData();

  if (!breadcrumbData) {
    return null;
  }

  // Get record ID from location state or params
  const getRecordId = () => {
    if (!breadcrumbData.recordIdField) return null;

    // Try to get from location state first
    if (location.state && location.state[breadcrumbData.recordIdField]) {
      return location.state[breadcrumbData.recordIdField];
    }

    // Try to get from location state with different field names
    const commonIdFields = [
      "id",
      "memberNo",
      "regNo",
      "code",
      "caseId",
      "claimId",
      "batchId",
      "batchName",
      "batchRefNo",
      "applicationId",
      "correspondenceId",
      "rosterId",
      "reminderId",
      "cancellationId",
      "categoryChangeId",
      "documentId",
    ];
    for (const field of commonIdFields) {
      if (location.state && location.state[field]) {
        return location.state[field];
      }
    }

    // Try to get from URL params
    const pathSegments = location.pathname.split("/");
    if (pathSegments.length > 1) {
      return pathSegments[pathSegments.length - 1];
    }

    return null;
  };

  const recordId = getRecordId();

  // Navigation handlers
  const handleAppLauncherClick = () => {
    if (breadcrumbData.appLauncher) {
      // Update the active module in Redux first
      dispatch(updateMenuLbl({ key: breadcrumbData.module, value: true }));

      // Use setTimeout to ensure Redux state is updated before navigation
      setTimeout(() => {
        navigate(breadcrumbData.appLauncher.route, {
          state: { search: breadcrumbData.module },
        });
      }, 0);
    }
  };

  const handleModuleClick = () => {
    // Update the active module in Redux first
    dispatch(updateMenuLbl({ key: breadcrumbData.module, value: true }));

    // Navigate to the module's main page or summary
    const moduleRoutes = {
      Configuration: "/Configuratin",
      "Subscriptions & Rewards": "/Summary",
      "Issue Management": "/CasesSummary",
      Correspondence: "/CorrespondencesSummary",
      Finance: "/Batches",
      Reports: "/Reports",
      Events: "/RosterSummary",
      Settings: "/Configuratin",
      Courses: "/Courses",
      "Professional Development": "/ProfessionalDevelopment",
    };

    const moduleRoute = moduleRoutes[breadcrumbData.module];
    if (moduleRoute) {
      // Use setTimeout to ensure Redux state is updated before navigation
      setTimeout(() => {
        navigate(moduleRoute, {
          state: { search: breadcrumbData.module },
        });
      }, 0);
    }
  };

  const handlePageClick = () => {
    // Navigate to the current page (refresh) while preserving state
    navigate(breadcrumbData.path, {
      state: location.state,
      replace: true,
    });
  };

  // Build breadcrumb items - avoid duplication between app launcher and module
  const breadcrumbItems = [];

  // Add app launcher item (only if different from module)
  const appLauncherName = breadcrumbData.appLauncher
    ? Object.keys(appLauncherItems).find(
      (key) => appLauncherItems[key] === breadcrumbData.appLauncher
    )
    : "App Launcher";

  if (appLauncherName !== breadcrumbData.module) {
    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 4 }}>
            {breadcrumbData.appLauncher?.icon || "🏠"}
          </span>
          {appLauncherName}
        </span>
      ),
      onClick: handleAppLauncherClick,
    });
  }

  // Add module item
  breadcrumbItems.push({
    title: (
      <span style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: 4 }}>{breadcrumbData.icon}</span>
        {breadcrumbData.module}
      </span>
    ),
    onClick: handleModuleClick,
  });

  // Add page item
  breadcrumbItems.push({
    title: (
      <span style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: 4 }}>{breadcrumbData.icon}</span>
        {breadcrumbData.page}
      </span>
    ),
    onClick: handlePageClick,
  });

  // Add record level if we have a record ID
  if (recordId) {
    const isBatchPage = location.pathname.includes("BatchMemberSummary") || location.pathname.includes("DirectDebitBatchDetails");
    const batchId = location.state?.batchId;
    const batchStatus = location.state?.batchStatus;

    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ marginRight: 4 }}>📄</span>
          <span style={{ fontWeight: 600 }}>{recordId}</span>
          {isBatchPage && batchId && (
            <span style={{ color: "#64748b", fontSize: "12px" }}>({batchId})</span>
          )}
          {isBatchPage && batchStatus && (
            <span style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "10px",
              backgroundColor: batchStatus === "Completed" || batchStatus === "Acknowledged" ? "#f0fdf4" : "#eff6ff",
              color: batchStatus === "Completed" || batchStatus === "Acknowledged" ? "#166534" : "#1e40af",
              border: "1px solid",
              borderColor: batchStatus === "Completed" || batchStatus === "Acknowledged" ? "#bbf7d0" : "#bfdbfe",
              textTransform: "uppercase",
              fontWeight: "700"
            }}>
              {batchStatus}
            </span>
          )}
        </span>
      ),
      onClick: () => {
        // Don't navigate for record ID - it's already the current page
        // Just prevent any default behavior
      },
    });
  }

  // Add record level if we have additional context from location state
  if (location.state?.recordName && !recordId) {
    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 4 }}>📄</span>
          {location.state.recordName}
        </span>
      ),
      onClick: () => {
        // Don't navigate for record name - it's already the current page
        // Just prevent any default behavior
      },
    });
  }

  return (
    <div className="bred-cram-main" style={{ padding: "8px 16px" }}>
      <AntBreadcrumb
        items={breadcrumbItems}
        separator=">"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
};

export default Breadcrumb;
