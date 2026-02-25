import React, { useMemo, useState } from "react";
import { Menu, Tooltip, Button } from "antd";
import {
  subscriptionItems,
  financeItems,
  correspondenceItems,
  configurationItems,
  casesItems,
  profileItems,
  reportItems,
  issuesItems,
  eventsItems,
  filterMenuItemsByAuth,
} from "../../constants/SideNavWithAuth.js";
import { useSelector } from "react-redux";
import "../../styles/Sidebar.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthorization } from "../../context/AuthorizationContext";
import { PushpinOutlined, PushpinFilled } from "@ant-design/icons";
// import policy from "../../utils/react-policy-client";

const Sidebar = () => {
  // state
  const menuLblState = useSelector((state) => state.menuLbl);
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, roles } = useAuthorization();

  // Debug logging
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("sidebar-pinned");
    return saved ? JSON.parse(saved) : false;
  });

  // Used to determine which module is currently active.
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);

  // These are the menu links for various modules, imported from a constants file
  const itemsMap = useMemo(
    () => ({
      "Subscriptions & Rewards": subscriptionItems,
      Membership: subscriptionItems, // Map Membership to subscriptionItems
      Finance: financeItems,
      Correspondence: correspondenceItems,
      Configuration: configurationItems,
      Profiles: profileItems,
      Reports: reportItems,
      "Issues Management": issuesItems,
      Cases: casesItems,
      Events: eventsItems,
    }),
    []
  );

  // Debug: Log available itemsMap keys

  // Filter menu items based on user permissions and roles
  const menuItems = useMemo(() => {
    // Get the base menu items for the active module
    const baseMenuItems = itemsMap[activeKey] || [];


    // Debug each menu item's requirements
    baseMenuItems.forEach((item, index) => {
      const hasPermission =
        item.permissions?.some((p) => permissions.includes(p)) || true;
      const hasRole = item.roles?.some((r) => roles.includes(r)) || true;

      // You can use hasPermission and hasRole for further logic if needed
    });


    const filtered = filterMenuItemsByAuth(baseMenuItems, permissions, roles);
    return filtered;
  }, [itemsMap, activeKey, permissions, roles]);

  const getNavLinkData = (key) => {
    switch (key) {
      case "Profiles":
        return { path: "/Summary", state: { search: "Profile" } };
      case "Claims":
        return { path: "/ClaimSummary", state: { search: "Claims" } };
      case "Cases":
      case "All Issues":
      case "All cases":
        return { path: "/CasesSummary", state: { search: "All Issues" } };
      case "Assigned to me":
        return { path: "/CasesSummary", state: { search: "Assigned to me" } };
      case "Correspondences":
        return { path: "/CorrespondenceDashboard", state: { search: "" } };
      case "Dashboard":
        if (activeKey === "Cases") {
          return { path: "/CasesSummary", state: { search: "" } };
        } else if (activeKey === "Events") {
          return { path: "/EventsSummary", state: { search: "" } };
        } else {
          return { path: "/CorrespondenceDashboard", state: { search: "" } };
        }
      case "Attendees":
        return { path: "/Attendees", state: { search: "Attendees" } };
      case "Reporting":
        return { path: "/Reporting", state: { search: "Reporting" } };
      case "Settings":
        if (activeKey === "Events") {
          return { path: "/EventsSettings", state: { search: "Settings" } };
        } else {
          return { path: "/Settings", state: { search: "Settings" } };
        }
      case "Transfer Requests":
        return { path: "/Transfers", state: { search: "Transfers" } };
      case "System Configuration":
        return { path: "/Configuratin", state: { search: "" } };
      case "Roster":
        return { path: "/RosterSummary", state: { search: "Rosters" } };
      case "Events":
        return { path: "/EventsSummary", state: { search: "Events" } };
      case "Batches":
        return { path: "/Batches", state: { search: "Batches" } };
      case "Applications":
        return { path: "/Applications", state: { search: "Applications" } };
      case "Membership":
        return { path: "/members", state: { search: "Members" } };
      case "MembershipDashboard":
        return {
          path: "/MembershipDashboard",
          state: { search: "Membership Dashboard" },
        };
      case "Reminders":
        return { path: "/RemindersSummary", state: { search: "Reminders" } };
      case "Cancellations":
        return { path: "/Cancallation", state: { search: "Cancallation" } };
      case "Change Category":
        return {
          path: "/ChangCateSumm",
          state: { search: "Change Category Summary" },
        };
      case "Imports":
        return { path: "/Import", state: { search: "Imports" } };
      case "Deductions":
        return { path: "/Deductions", state: { search: "Deductions" } };
      case "Reconciliation":
      case "Reconciliations":
        return { path: "/Reconciliation", state: { search: "Reconciliation" } };
      case "Standing Orders":
        return { path: "/StandingOrders", state: { search: "Standing Orders" } };
      case "Cheque":
        return { path: "/Cheque", state: { search: "Cheques" } };
      case "Refunds":
        return { path: "/Refunds", state: { search: "Refunds" } };
      case "Write-offs":
        return { path: "/write-offs", state: { search: "Write-offs" } };
      case "DD Authorisations":
        return {
          path: "/DirectDebitAuthorization",
          state: { search: "Direct Debit Authorization" },
        };
      case "Direct Debit":
        return { path: "/DirectDebit", state: { search: "Direct Debit" } };
      case "Online Payments":
        return { path: "/onlinePayment", state: { search: "Online Payment" } };
      case "Email":
        return { path: "/Email", state: { search: "Email" } };
      case "SMS":
        return { path: "/Sms", state: { search: "Sms" } };
      case "InAppNotifications":
        return {
          path: "/InAppNotifications",
          state: { search: "In-App Notifications" },
        };
      case "Notes & Letters":
        return { path: "/Notes", state: { search: "Notes" } };
      case "Communication History":
        return {
          path: "/CorrespondencesSummary",
          state: { search: "CorrespondencesSummary" },
        };
      case "CornMarket":
        return { path: "/CornMarket", state: { search: "CornMarket" } };
      case "Tenant Management":
        return {
          path: "/TenantManagement",
          state: { search: "TenantManagement" },
        };
      case "Role Management":
        return {
          path: "/RoleManagement",
          state: { search: "RoleManagement" },
        };
      case "User Management":
        return {
          path: "/UserManagement",
          state: { search: "UserManagement" },
        };
      case "Permission Management":
        return {
          path: "/PermissionManagement",
          state: { search: "PermissionManagement" },
        };
      case "Product Management":
        return {
          path: "/ProductTypesManagement",
          state: { search: "Product Management" },
        };
      case "Cancelled Members Report":
        return {
          path: "/CancelledMembersReport",
          state: { search: "Cancelled Members Report" },
        };
      case "Suspended Members Report":
        return {
          path: "/SuspendedMembersReport",
          state: { search: "Suspended Members Report" },
        };
      case "Resigned Members Report":
        return {
          path: "/ResignedMembersReport",
          state: { search: "Resigned Members Report" },
        };
      case "New Members Report":
        return {
          path: "/NewMembersReport",
          state: { search: "New Members Report" },
        };
      case "Leavers Report":
        return {
          path: "/LeaversReport",
          state: { search: "Leavers Report" },
        };
      case "Joiners Report":
        return {
          path: "/JoinersReport",
          state: { search: "Joiners Report" },
        };
      case "Policy Client Example":
        return {
          path: "/PolicyClientExample",
          state: { search: "Policy Client Example" },
        };
      case "Templetes":
        return {
          path: "/templeteSummary",
          state: { search: "Templetes" },
        };
      case "CornMarket New Graduate":
        return {
          path: "/NewGraduate",
          state: { search: "CornMarket New Graduate" },
        };
      case "CornMarket Rewards":
        return {
          path: "/CornMarketRewards",
          state: { search: "CornMarket Rewards" },
        };
      case "Recruit a Friend":
        return { path: "/RecruitAFriend", state: { search: "Recruit a Friend" } };
      case "Reports setting":
        return { path: "/ReportsSettings", state: { search: "Reports setting" } };
      default:
        return { path: "/NotDesignedYet" };
    }
  };

  // Transform menu items for collapsed/expanded view
  const transformedMenuItems = useMemo(() => {
    const transformed = menuItems.map((item) => {
      const navData = getNavLinkData(item.key);
      const labelText = item.label.props.children;

      if (isPinned) {
        // Collapsed view: show only icon with tooltip
        return {
          ...item,
          icon: (
            <Tooltip
              title={labelText}
              placement="right"
            >
              <Link
                to={navData.path}
                state={navData.state}
                className="sidebar-link-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="icon-only-item">{item.icon}</div>
              </Link>
            </Tooltip>
          ),
          label: null, // Hide label in collapsed state
        };
      } else {
        // Expanded view: show icon with label
        return {
          ...item,
          label: (
            <Link
              to={navData.path}
              state={navData.state}
              className="sidebar-link-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              {item.label}
            </Link>
          ),
          icon: (
            <Link
              to={navData.path}
              state={navData.state}
              className="sidebar-link-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="icon">{item.icon}</div>
            </Link>
          ),
        };
      }
    });

    return transformed;
  }, [menuItems, isPinned, activeKey]);

  const selectedKey = useMemo(() => {
    const routeKeyMap = {
      "/Summary": "Profiles",
      "/ClaimSummary": "Claims",
      "/ClaimsById": "Claims",
      "/CasesSummary": "Cases",
      "/CasesById": "Cases",
      "/CorrespondencesSummary": "Correspondences",
      "/Transfers": "Transfer Requests",
      "/Configuratin": "System Configuration",
      "/RosterSummary": "Roster",
      "/EventsSummary": "Events",
      "/Attendees": "Attendees",
      "/Reporting": "Reporting",
      "/EventsSettings": "Settings",
      "/Batches": "Batches",
      "/Applications": "Applications",
      "/RemindersSummary": "Reminders",
      "/Cancallation": "Cancellations",
      "/ChangCateSumm": "Change Category",
      "/Import": "Imports",
      "/Deductions": "Deductions",
      "/Reconciliation": "Reconciliations",
      "/StandingOrders": "Standing Orders",
      "/Cheque": "Cheque",
      "/Refunds": "Refunds",
      "/onlinePayment": "Online Payments",
      "/Email": "Email",
      "/Sms": "SMS",
      "/InAppNotifications": "InAppNotifications",
      "/Notes": "Notes & Letters",
      "/Letters": "Notes & Letters",
      "/CorspndncDetail": "Communication History",
      "/members": "Membership",
      "/MembershipDashboard": "MembershipDashboard",
      "/TenantManagement": "Tenant Management",
      "/RoleManagement": "Role Management",
      "/UserManagement": "User Management",
      "/PermissionManagement": "Permission Management",
      "/ProductTypesManagement": "Product Management",
      "/templeteSummary": "Templetes",
      "/templeteConfig": "Templetes",
      "/CancelledMembersReport": "Cancelled Members Report",
      "/PolicyClientExample": "Policy Client Example",
      "/NewGraduate": "CornMarket New Graduate",
      "/CornMarketRewards": "CornMarket Rewards",
      "/RecruitAFriend": "Recruit a Friend",
      "/DirectDebitAuthorization": "DD Authorisations",
      "/DirectDebit": "Direct Debit",
      "/write-offs": "Write-offs",
      "/SuspendedMembersReport": "Suspended Members Report",
      "/ResignedMembersReport": "Resigned Members Report",
      "/NewMembersReport": "New Members Report",
      "/LeaversReport": "Leavers Report",
      "/JoinersReport": "Joiners Report",
      "/CorrespondenceDashboard": "Dashboard",
      "/ReportsSettings": "Reports setting",
    };

    const currentPath = Object.keys(routeKeyMap).find((route) =>
      location.pathname.startsWith(route)
    );

    if (!currentPath) return "";

    // Handle context-specific mappings
    if (currentPath === "/EventsSummary" && activeKey === "Events") {
      return "Dashboard";
    }
    if (currentPath === "/CasesSummary" && activeKey === "Cases") {
      return "Dashboard";
    }
    if (currentPath === "/CasesSummary" && activeKey === "Issues Management") {
      // Check location state to determine if it's "All Issues" or "Assigned to me"
      const searchState = location.state?.search;
      if (searchState === "All Issues") {
        return "All Issues";
      }
      if (searchState === "Assigned to me") {
        return "Assigned to me";
      }
      // Default to "All Issues" for Issues Management context
      return "All Issues";
    }
    if (currentPath === "/CasesSummary" && activeKey === "Cases") {
      // Check location state for Cases context
      const searchState = location.state?.search;
      if (searchState === "Assigned to me") {
        return "Assigned to me";
      }
      if (searchState === "Reports setting") {
        return "Reports setting";
      }
    }

    return routeKeyMap[currentPath] || "";
  }, [location.pathname, activeKey, location.state]);

  const handleClick = ({ key }) => {
    // We can keep this for any special handling if needed, 
    // but the Link component will handle standard navigation.
    // However, since we're using Ant Design Menu, it still calls onClick.
    // If we want to prevent double navigation or issues, we can check if it's already handled.
    console.log("Menu item clicked:", key);
    // If we want to specifically handle training alert which was a special case
    if (key === "Trainings") {
      alert("Trainings clicked");
    }
  };

  // Remove the route-based menu setting logic
  // This was preventing users from switching between different app launcher modules
  // Users should be able to manually switch modules using the app launcher buttons

  const showProfileHeaderRoutes = [
    "/ClaimsDetails",
    "/CasesDetails",
    "/ClaimsById",
    "/CasesById",
    "/AddNewProfile",
    "/AddClaims",
    "/Doucmnets",
    "/Roster",
  ];

  // Handle pin/unpin toggle
  const handlePinToggle = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    localStorage.setItem("sidebar-pinned", JSON.stringify(newPinnedState));
  };

  const sideBarWidth = showProfileHeaderRoutes.includes(location.pathname)
    ? "19vw"
    : isPinned
      ? "80px"
      : "200px";

  return (
    <div
      className={`sidebar-container ${isPinned ? "pinned" : "unpinned"}`}
      style={{ width: sideBarWidth }}
    >
      {/* Pin/Unpin Toggle Button */}
      <div className="sidebar-toggle-container">
        <Tooltip
          title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          placement="right"
        >
          <Button
            type="text"
            icon={isPinned ? <PushpinFilled /> : <PushpinOutlined />}
            onClick={handlePinToggle}
            className="sidebar-toggle-btn"
            size="small"
          />
        </Tooltip>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          width: isPinned ? "80px" : "200px",
          borderRight: 0,
          maxHeight: "91vh",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
        items={transformedMenuItems}
        className={`sidebar-menu hide-scroll-webkit ${isPinned ? "collapsed" : "expanded"
          }`}
        onClick={handleClick}
      />
    </div>
  );
};

export default Sidebar;
