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
    Events: { icon: "📅", route: "/EventsSummary" },
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
      module: "Issues Management",
      page: "Issues Summary",
      icon: "📋",
    },
    "/CasesById": {
      module: "Issues Management",
      page: "Issue Details",
      icon: "📋",
      recordIdField: "code",
    },
    "/CasesDetails": {
      module: "Issues Management",
      page: "Case Details",
      icon: "📋",
      recordIdField: "caseId",
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
    "/CommunicationBatchDetail": {
      module: "Correspondence",
      page: "Batch Details",
      icon: "📧",
      recordIdField: "batchName",
    },
    "/InAppNotifications": {
      module: "Correspondence",
      page: "In-App Notifications",
      icon: "🔔",
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
    "/write-offs": {
      module: "Finance",
      page: "Write-offs",
      icon: "💰",
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

    // Events Pages
    "/EventsSummary": {
      module: "Events",
      page: "Events Summary",
      icon: "📅",
    },
    "/EventDetails": {
      module: "Events",
      page: "Event Details",
      icon: "📅",
      recordIdField: "eventId",
    },
    // Roster Pages (Legacy)
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
    "/worklocation": {
      module: "Configuration",
      page: "Work Location",
      icon: "📍",
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

  const { data: batchDetails } = useSelector((state) => state.batchDetails);

  // Get breadcrumb data for current route
  const getBreadcrumbData = () => {
    const currentPath = location.pathname;
    // Handle dynamic routes with IDs
    const matchedPath = Object.keys(routeBreadcrumbMap).find(path =>
      currentPath.startsWith(path)
    );

    const breadcrumbData = routeBreadcrumbMap[matchedPath || currentPath];

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
    // Try to get from location state first
    if (location.state && breadcrumbData.recordIdField && location.state[breadcrumbData.recordIdField]) {
      return location.state[breadcrumbData.recordIdField];
    }

    // Fallback for BatchMemberSummary from Redux
    if (location.pathname.includes("BatchMemberSummary") && batchDetails?.description) {
      return batchDetails.description;
    }

    // Try to get from location state with different field names
    const commonIdFields = [
      "id",
      "memberNo",
      "membershipNumber",
      "membershipNo",
      "memberId",
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

    // Try to get from URL params (last segment)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 1) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Simple check to see if it looks like an ID (not a word like "Summary")
      if (lastSegment && (lastSegment.length > 10 || /\d/.test(lastSegment))) {
        return lastSegment;
      }
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
      "Issues Management": "/CasesSummary",
      Correspondence: "/CorrespondencesSummary",
      Finance: "/Batches",
      Reports: "/Reports",
      Events: "/EventsSummary",
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

  // Add page item only if page title is present
  if (breadcrumbData.page) {
    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 4 }}>{breadcrumbData.icon}</span>
          {breadcrumbData.page}
        </span>
      ),
      onClick: handlePageClick,
    });
  }

  // Add record level if we have a record ID
  if (recordId) {
    const isBatchPage = location.pathname.includes("BatchMemberSummary") || location.pathname.includes("DirectDebitBatchDetails");
    const batchId = location.state?.batchId || (location.pathname.includes("BatchMemberSummary") ? batchDetails?._id : null);
    const batchStatus = location.state?.batchStatus || (location.pathname.includes("BatchMemberSummary") ? batchDetails?.batchStatus : null);

    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ marginRight: 4 }}>📄</span>
          <span style={{ fontWeight: 600 }}>{recordId}</span>
          {isBatchPage && batchId && (
            <span style={{ color: "#64748b", fontSize: "12px" }}>({batchId.slice(-6).toUpperCase()})</span>
          )}
          {isBatchPage && batchStatus && (
            <span style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "10px",
              backgroundColor: batchStatus === "Completed" || batchStatus === "Acknowledged" || batchStatus === "Done" ? "#f0fdf4" : "#eff6ff",
              color: batchStatus === "Completed" || batchStatus === "Acknowledged" || batchStatus === "Done" ? "#166534" : "#1e40af",
              border: "1px solid",
              borderColor: batchStatus === "Completed" || batchStatus === "Acknowledged" || batchStatus === "Done" ? "#bbf7d0" : "#bfdbfe",
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
    <div className="bred-cram-main" style={{ padding: "0" }}>
      <AntBreadcrumb
        items={breadcrumbItems}
        separator=">"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
};

export default Breadcrumb;
