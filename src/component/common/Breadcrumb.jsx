import React from "react";
import { Breadcrumb as AntBreadcrumb } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateMenuLbl } from "../../features/MenuLblSlice";
import { useReminders } from "../../context/CampaignDetailsProvider";

function getOpenApplicationFullName(app) {
  if (!app) return "";
  const pi = app.personalDetails?.personalInfo ?? app.personalInfo;
  const fore = (pi?.forename != null ? String(pi.forename) : "").trim();
  const sur = (pi?.surname != null ? String(pi.surname) : "").trim();
  const combined = `${fore} ${sur}`.trim();
  if (combined) return combined;
  if (app.user?.userFullName) return String(app.user.userFullName).trim();
  if (app.fullName) return String(app.fullName).trim();
  return "";
}

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuLblState = useSelector((state) => state.menuLbl);
  const {
    selectedId: selectedReminderBatch,
    cancallationbyId: selectedCancellationBatch,
  } = useReminders();

  // Get the active module from Redux state
  const activeModule = Object.keys(menuLblState).find(
    (key) => menuLblState[key]
  );

  // App launcher items mapping - matches the actual app launcher menu items
  const appLauncherItems = {
    Membership: { icon: "👤", route: "/Summary" },
    Finance: { icon: "💰", route: "/Import" },
    Correspondence: { icon: "📧", route: "/CorrespondencesSummary" },
    Events: { icon: "📅", route: "/EventsDashboard" },
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
    "/EventsDashboard": {
      module: "Events",
      page: "Dashboard",
      moduleIcon: "📅",
      pageIcon: "📊",
    },
    "/EventsSummary": {
      module: "Events",
      page: "Events Summary",
      moduleIcon: "📅",
      pageIcon: "📅",
    },
    "/EventDetails": {
      module: "Events",
      page: "Event Details",
      moduleIcon: "📅",
      pageIcon: "📅",
      recordIdField: "eventId",
    },
    "/Attendees": {
      module: "Events",
      page: "Attendees",
      moduleIcon: "📅",
      pageIcon: "👥",
    },
    "/Reporting": {
      module: "Events",
      page: "Reporting",
      moduleIcon: "📅",
      pageIcon: "📈",
    },
    "/EventsSettings": {
      module: "Events",
      page: "Settings",
      moduleIcon: "📅",
      pageIcon: "⚙️",
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
      page: "Reminders",
      icon: "⏰",
    },

    // Cancellations
    "/Cancallation": {
      module: "Subscriptions & Rewards",
      page: "Cancellations",
      icon: "❌",
    },
    "/CancellationDetail": {
      module: "Subscriptions & Rewards",
      page: "Cancellations",
      icon: "❌",
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
    "/branch": {
      module: "Configuration",
      page: "Branch",
      icon: "📍",
    },
    "/region": {
      module: "Configuration",
      page: "Region",
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
      page: "Cancellations",
      icon: "❌",
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
      icon: "🤝",
    },
  };

  /** Sidebar module key used by Login / Sidebar for the membership area */
  const MEMBERSHIP_MENU_KEY = "Subscriptions & Rewards";

  /**
   * Membership tab: show "Membership > …" (no App Launcher).
   * Values align with Sidebar getNavLinkData `state.search` for each item.
   */
  const membershipSectionNav = {
    "/MembershipDashboard": {
      pageLabel: "Dashboard",
      listingPath: "/MembershipDashboard",
      listingSearch: "Membership Dashboard",
    },
    "/Summary": {
      pageLabel: "Profiles",
      listingPath: "/Summary",
      listingSearch: "Profile",
    },
    "/Members": {
      pageLabel: "Subscriptions",
      listingPath: "/Members",
      listingSearch: "Members",
    },
    "/members": {
      pageLabel: "Subscriptions",
      listingPath: "/members",
      listingSearch: "Members",
    },
    "/Applications": {
      pageLabel: "Applications",
      listingPath: "/Applications",
      listingSearch: "Applications",
    },
    "/applicationMgt": {
      pageLabel: "Applications",
      listingPath: "/Applications",
      listingSearch: "Applications",
    },
    "/AproveMembersip": {
      pageLabel: "Approve Membership",
      listingPath: "/Applications",
      listingSearch: "Applications",
    },
    "/AddNewProfile": {
      pageLabel: "Add New Profile",
      listingPath: "/Summary",
      listingSearch: "Profile",
    },
    "/Transfers": {
      pageLabel: "Transfer Requests",
      listingPath: "/Transfers",
      listingSearch: "Transfers",
    },
    "/RemindersSummary": {
      pageLabel: "Reminders",
      listingPath: "/RemindersSummary",
      listingSearch: "Reminders",
    },
    "/RemindersDetails": {
      pageLabel: "Reminders",
      listingPath: "/RemindersSummary",
      listingSearch: "Reminders",
    },
    "/Cancallation": {
      pageLabel: "Cancellations",
      listingPath: "/Cancallation",
      listingSearch: "Cancallation",
    },
    "/CancellationDetail": {
      pageLabel: "Cancellations",
      listingPath: "/Cancallation",
      listingSearch: "Cancallation",
    },
    "/CancellationBatch": {
      pageLabel: "Cancellations",
      listingPath: "/Cancallation",
      listingSearch: "Cancallation",
    },
    "/ChangCateSumm": {
      pageLabel: "Category Changes",
      listingPath: "/ChangCateSumm",
      listingSearch: "Change Category Summary",
    },
    "/ChangeCatById": {
      pageLabel: "Category Change",
      listingPath: "/ChangCateSumm",
      listingSearch: "Change Category Summary",
    },
    "/Doucmnets": {
      pageLabel: "Documents",
      listingPath: "/Summary",
      listingSearch: "Profile",
    },
    "/NewGraduate": {
      pageLabel: "New Graduates",
      listingPath: "/NewGraduate",
      listingSearch: "CornMarket New Graduate",
    },
    "/CornMarketRewards": {
      pageLabel: "Rewards",
      listingPath: "/CornMarketRewards",
      listingSearch: "CornMarket Rewards",
    },
    "/RecruitAFriend": {
      pageLabel: "Recruit Friends",
      listingPath: "/RecruitAFriend",
      listingSearch: "Recruit a Friend",
    },
  };

  const matchRoutePrefix = (currentPath, pathMap) => {
    const keys = Object.keys(pathMap);
    const matches = keys.filter(
      (p) => currentPath === p || currentPath.startsWith(`${p}/`)
    );
    if (matches.length === 0) return null;
    return matches.sort((a, b) => b.length - a.length)[0];
  };

  const { data: batchDetails } = useSelector((state) => state.batchDetails);
  const openApplication = useSelector(
    (state) => state.applicationDetails?.application
  );

  // Get breadcrumb data for current route
  const getBreadcrumbData = () => {
    const currentPath = location.pathname;
    const matchedPath =
      matchRoutePrefix(currentPath, routeBreadcrumbMap) || currentPath;

    const breadcrumbData = routeBreadcrumbMap[matchedPath];

    if (!breadcrumbData) {
      return null;
    }

    const simpleBatchSearch = location.state?.search;
    const onSimpleBatchMemberSummary =
      currentPath === "/SimpleBatchMemberSummary" ||
      currentPath.startsWith("/SimpleBatchMemberSummary/");
    const membershipSimpleBatchSearches = [
      "RecruitAFriend",
      "CornMarketRewards",
      "NewGraduate",
    ];
    const isMembershipSimpleBatch =
      onSimpleBatchMemberSummary &&
      membershipSimpleBatchSearches.includes(simpleBatchSearch);

    let membershipNav = membershipSectionNav[matchedPath] || null;
    let pageIcon = breadcrumbData.pageIcon || breadcrumbData.icon;
    let moduleIcon = breadcrumbData.moduleIcon || pageIcon;

    if (isMembershipSimpleBatch) {
      const listingKey =
        simpleBatchSearch === "RecruitAFriend"
          ? "/RecruitAFriend"
          : simpleBatchSearch === "CornMarketRewards"
            ? "/CornMarketRewards"
            : "/NewGraduate";
      membershipNav = membershipSectionNav[listingKey];
      pageIcon = routeBreadcrumbMap[listingKey]?.pageIcon || routeBreadcrumbMap[listingKey]?.icon || pageIcon;
      moduleIcon = routeBreadcrumbMap[listingKey]?.moduleIcon || moduleIcon;
    }

    // /Details: second crumb follows listing you came from (TableComponent state.search)
    if (matchedPath === "/Details") {
      const src = location.state?.search;
      if (src === "Members") {
        membershipNav = {
          pageLabel: "Subscriptions",
          listingPath: "/members",
          listingSearch: "Members",
        };
      } else if (src === "Applications") {
        membershipNav = { ...membershipSectionNav["/Applications"] };
      } else {
        membershipNav = { ...membershipSectionNav["/Summary"] };
      }
    }

    // Get the app launcher item for the current module
    const appLauncherItem = appLauncherItems[breadcrumbData.module];

    return {
      appLauncher: appLauncherItem,
      module: breadcrumbData.module,
      page: breadcrumbData.page,
      icon: pageIcon,
      pageIcon,
      moduleIcon,
      path: currentPath,
      matchedPath,
      recordIdField: breadcrumbData.recordIdField,
      membershipNav,
    };
  };

  const breadcrumbData = getBreadcrumbData();

  if (!breadcrumbData) {
    return null;
  }

  // Get record ID from location state or params
  const getRecordId = () => {
    const appMgtParams = new URLSearchParams(location.search);
    if (location.pathname === "/applicationMgt") {
      if (
        appMgtParams.get("applicationId") ||
        appMgtParams.get("id") ||
        appMgtParams.get("draftId")
      ) {
        return null;
      }
    }

    // Try to get from location state first
    if (location.state && breadcrumbData.recordIdField && location.state[breadcrumbData.recordIdField]) {
      return location.state[breadcrumbData.recordIdField];
    }

    // Finance /BatchMemberSummary only (not /SimpleBatchMemberSummary — pathname includes "BatchMemberSummary")
    const isFinanceBatchMemberSummary =
      location.pathname.startsWith("/BatchMemberSummary") &&
      !location.pathname.startsWith("/SimpleBatchMemberSummary");
    if (isFinanceBatchMemberSummary && batchDetails?.description) {
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
      Finance: "/Import",
      Reports: "/Reports",
      Events: "/EventsDashboard",
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

  const handleMembershipRootClick = () => {
    dispatch(updateMenuLbl({ key: MEMBERSHIP_MENU_KEY, value: true }));
    setTimeout(() => {
      navigate("/MembershipDashboard", {
        state: { search: "Membership Dashboard" },
      });
    }, 0);
  };

  const handleMembershipSectionClick = () => {
    const nav = breadcrumbData.membershipNav;
    if (!nav) return;
    dispatch(updateMenuLbl({ key: MEMBERSHIP_MENU_KEY, value: true }));
    setTimeout(() => {
      navigate(nav.listingPath, {
        state: { search: nav.listingSearch },
      });
    }, 0);
  };

  // Build breadcrumb items - avoid duplication between app launcher and module
  const breadcrumbItems = [];

  if (breadcrumbData.membershipNav) {
    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 4 }}>👤</span>
          Membership
        </span>
      ),
      onClick: handleMembershipRootClick,
    });

    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 4 }}>{breadcrumbData.icon}</span>
          {breadcrumbData.membershipNav.pageLabel}
        </span>
      ),
      onClick: handleMembershipSectionClick,
    });

    if (location.pathname === "/applicationMgt") {
      const p = new URLSearchParams(location.search);
      const urlAppId = p.get("applicationId") || p.get("id");
      const urlDraftId = p.get("draftId");
      if (urlAppId || urlDraftId) {
        const displayId = urlAppId || urlDraftId;
        const app = openApplication;
        const reduxSubmittedId = app?.applicationId || app?.ApplicationId;
        const matchesSubmitted =
          urlAppId &&
          reduxSubmittedId &&
          String(reduxSubmittedId) === String(urlAppId);
        const matchesDraft =
          urlDraftId &&
          app &&
          String(app.ApplicationId) === String(urlDraftId);
        const idMatches = matchesSubmitted || matchesDraft;
        const category =
          idMatches && app?.subscriptionDetails?.membershipCategory
            ? String(app.subscriptionDetails.membershipCategory).trim()
            : "";
        const fullName =
          idMatches ? getOpenApplicationFullName(app).trim() : "";
        const nameOrFallback = fullName || displayId;
        const openAppTitle = category
          ? `${category} - ${nameOrFallback}`
          : `Application - ${nameOrFallback}`;

        breadcrumbItems.push({
          title: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                maxWidth: "min(720px, 70vw)",
              }}
            >
              <span style={{ marginRight: 4 }}>📋</span>
              <span
                style={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={openAppTitle}
              >
                {openAppTitle}
              </span>
            </span>
          ),
          onClick: () => {},
        });
      }
    }

    if (location.pathname === "/RemindersDetails") {
      const reminderBatchTitle =
        location.state?.reminderBatchTitle ||
        selectedReminderBatch?.title ||
        "";
      if (reminderBatchTitle) {
        breadcrumbItems.push({
          title: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                maxWidth: "min(720px, 70vw)",
              }}
            >
              <span style={{ marginRight: 4 }}>⏰</span>
              <span
                style={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={reminderBatchTitle}
              >
                {reminderBatchTitle}
              </span>
            </span>
          ),
          onClick: () => {},
        });
      }
    }

    if (
      location.pathname === "/CancellationDetail" ||
      location.pathname === "/CancellationBatch"
    ) {
      const cancellationBatchTitle =
        location.state?.cancellationBatchTitle ||
        location.state?.batchName ||
        selectedCancellationBatch?.title ||
        "";
      if (cancellationBatchTitle) {
        breadcrumbItems.push({
          title: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                maxWidth: "min(720px, 70vw)",
              }}
            >
              <span style={{ marginRight: 4 }}>❌</span>
              <span
                style={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={cancellationBatchTitle}
              >
                {cancellationBatchTitle}
              </span>
            </span>
          ),
          onClick: () => {},
        });
      }
    }
  } else {
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
          <span style={{ marginRight: 4 }}>
            {breadcrumbData.moduleIcon || breadcrumbData.icon}
          </span>
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
            <span style={{ marginRight: 4 }}>
              {breadcrumbData.pageIcon || breadcrumbData.icon}
            </span>
            {breadcrumbData.page}
          </span>
        ),
        onClick: handlePageClick,
      });
    }
  }

  // Add record level if we have a record ID
  if (recordId) {
    const isFinanceBatchMemberSummary =
      location.pathname.startsWith("/BatchMemberSummary") &&
      !location.pathname.startsWith("/SimpleBatchMemberSummary");
    const isBatchPage =
      isFinanceBatchMemberSummary ||
      location.pathname.startsWith("/SimpleBatchMemberSummary") ||
      location.pathname.includes("DirectDebitBatchDetails");
    const batchId =
      location.state?.batchId ||
      (isFinanceBatchMemberSummary ? batchDetails?._id : null);

    breadcrumbItems.push({
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ marginRight: 4 }}>📄</span>
          <span style={{ fontWeight: 600 }}>{recordId}</span>
          {isBatchPage && batchId && (
            <span style={{ color: "#64748b", fontSize: "12px" }}>({batchId.slice(-6).toUpperCase()})</span>
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
    <div className="bred-cram-main" style={{ paddingTop: "5px" }}>
      <AntBreadcrumb
        items={breadcrumbItems}
        separator=">"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
};

export default Breadcrumb;
