import React, { useMemo, useState } from "react";
import { Menu, Tooltip, Button } from "antd";
import {
  subscriptionItems,
  financeItems,
  correspondenceItems,
  configurationItems,
  profileItems,
  reportItems,
  issuesItems,
  eventsItems,
  filterMenuItemsByAuth,
} from "../../constants/SideNavWithAuth.js";
import { useSelector } from "react-redux";
import "../../styles/Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
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
  console.log("Sidebar Debug - menuLblState:", menuLblState);
  console.log("Sidebar Debug - location.pathname:", location.pathname);
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("sidebar-pinned");
    return saved ? JSON.parse(saved) : false;
  });

  // Used to determine which module is currently active.
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);

  // Debug: Log menu label state changes
  console.log("Sidebar Debug - menuLblState:", menuLblState);
  console.log("Sidebar Debug - activeKey:", activeKey);

  // Fallback: if no active key, default to first available key
  const fallbackActiveKey = activeKey || "Subscriptions & Rewards";
  console.log("Sidebar Debug - Using activeKey:", fallbackActiveKey);

  // These are the menu links for various modules, imported from a constants file
  const itemsMap = useMemo(
    () => ({
      "Subscriptions & Rewards": subscriptionItems,
      Membership: subscriptionItems, // Map Membership to subscriptionItems
      Finance: financeItems,
      Correspondence: correspondenceItems,
      Configuration: configurationItems,
      Settings: configurationItems, // Map Settings to same as Configuration
      Profiles: profileItems,
      Reports: reportItems,
      "Issue Management": issuesItems,
      Events: eventsItems,
    }),
    []
  );

  // Debug: Log available itemsMap keys
  console.log(
    "Sidebar Debug - Available itemsMap keys:",
    Object.keys(itemsMap)
  );

  // Filter menu items based on user permissions and roles
  const menuItems = useMemo(() => {
    // Get the base menu items for the active module
    const baseMenuItems = itemsMap[fallbackActiveKey] || [];
    // Debug: Log current permissions and roles
    console.log("Sidebar Debug - Current permissions:", permissions);
    console.log("Sidebar Debug - Current roles:", roles);
    console.log("Sidebar Debug - Active key:", fallbackActiveKey);
    console.log("Sidebar Debug - Base menu items:", baseMenuItems);
    console.log(
      "Sidebar Debug - Base menu items length:",
      baseMenuItems.length
    );

    // Debug each menu item's requirements
    console.log("Sidebar Debug - Checking each menu item:");
    baseMenuItems.forEach((item, index) => {
      console.log(`Item ${index}: ${item.key}`, {
        requiredPermissions: item.permissions,
        requiredRoles: item.roles,
        userPermissions: permissions,
        userRoles: roles,
        hasPermission:
          item.permissions?.some((p) => permissions.includes(p)) || true,
        hasRole: item.roles?.some((r) => roles.includes(r)) || true,
      });
    });

    const filtered = filterMenuItemsByAuth(baseMenuItems, permissions, roles);
    console.log("Sidebar Debug - Filtered menu items:", filtered);
    console.log("Sidebar Debug - Filtered menu items length:", filtered.length);

    return filtered;
  }, [itemsMap, fallbackActiveKey, permissions, roles]);

  // Transform menu items for collapsed/expanded view
  const transformedMenuItems = useMemo(() => {
    console.log("Sidebar Debug - Transforming menu items:", menuItems);
    console.log("Sidebar Debug - isPinned:", isPinned);

    const transformed = menuItems.map((item) => {
      if (isPinned) {
        // Collapsed view: show only icon with tooltip
        return {
          ...item,
          icon: (
            <Tooltip
              title={item.label.props.children}
              placement="right"
              overlayClassName="sidebar-tooltip"
            >
              <div className="icon-only-item">{item.icon}</div>
            </Tooltip>
          ),
          label: null, // Hide label in collapsed state
        };
      } else {
        // Expanded view: show icon with label
        return item;
      }
    });

    console.log("Sidebar Debug - Transformed menu items:", transformed);
    console.log(
      "Sidebar Debug - Transformed menu items length:",
      transformed.length
    );

    return transformed;
  }, [menuItems, isPinned]);

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
      "/Batches": "Batches",
      "/Applications": "Applications",
      "/RemindersSummary": "Reminders",
      "/Cancallation": "Cancellations",
      "/ChangCateSumm": "Change Category",
      "/Import": "Imports",
      "/Email": "Email",
      "/Sms": "SMS",
      "/Notes": "Notes & Letters",
      "/Letters": "Notes & Letters",
      "/CorspndncDetail": "Communication History",
      "/members": "Membership",
      "/MembershipDashboard": "MembershipDashboard",
      "/TenantManagement": "Tenant Management",
      "/RoleManagement": "Role Management",
      "/UserManagement": "User Management",
      "/PermissionManagement": "Permission Management",
      "/CancelledMembersReport": "Cancelled Members Report",
      "/PolicyClientExample": "Policy Client Example",
    };

    const currentPath = Object.keys(routeKeyMap).find((route) =>
      location.pathname.startsWith(route)
    );
    return routeKeyMap[currentPath] || "";
  }, [location.pathname]);

  const handleClick = ({ key }) => {
    switch (key) {
      case "Profiles":
        navigate("/Summary", { state: { search: "Profile" } });
        break;
      case "Claims":
        navigate("/ClaimSummary", { state: { search: "Claims" } });
        break;
      case "Cases":
        navigate("/CasesSummary", { state: { search: "Cases" } });
        break;
      case "Correspondences":
        navigate("/CorrespondencesSummary", { state: { search: "" } });
        break;
      case "Transfer Requests":
        navigate("/Transfers", { state: { search: "Transfers" } });
        break;
      case "System Configuration":
        navigate("/Configuratin", { state: { search: "" } });
        break;
      case "Roster":
        navigate("/RosterSummary", { state: { search: "Rosters" } });
        break;
      case "Batches":
        navigate("/Batches", { state: { search: "Batches" } });
        break;
      case "Applications":
        navigate("/Applications", { state: { search: "Applications" } });
        break;
      case "Membership":
        navigate("/members", { state: { search: "members" } });
        break;
      case "MembershipDashboard":
        navigate("/MembershipDashboard", {
          state: { search: "Membership Dashboard" },
        });
        break;
      case "Reminders":
        navigate("/RemindersSummary", { state: { search: "Reminders" } });
        break;
      case "Cancellations":
        navigate("/Cancallation", { state: { search: "Cancallation" } });
        break;
      case "Trainings":
        alert("Trainings clicked");
        break;
      case "Change Category":
        navigate("/ChangCateSumm", {
          state: { search: "Change Category Summary" },
        });
        break;
      case "Imports":
        navigate("/Import", { state: { search: "Imports" } });
        break;
      case "Email":
        navigate("/Email", { state: { search: "Email" } });
        break;
      case "SMS":
        navigate("/Sms", { state: { search: "Sms" } });
        break;
      case "Notes & Letters":
        navigate("/Notes", { state: { search: "Notes" } });
        break;
      case "Communication History":
        navigate("/CorrespondencesSummary", {
          state: { search: "CorrespondencesSummary" },
        });
        break;
      case "CornMarket":
        navigate("/CornMarket", { state: { search: "CornMarket" } });
        break;
      case "Tenant Management":
        navigate("/TenantManagement", {
          state: { search: "TenantManagement" },
        });
        break;
      case "Role Management":
        navigate("/RoleManagement", {
          state: { search: "RoleManagement" },
        });
        break;
      case "User Management":
        navigate("/UserManagement", {
          state: { search: "UserManagement" },
        });
        break;
      case "Permission Management":
        navigate("/PermissionManagement", {
          state: { search: "PermissionManagement" },
        });
        break;
      case "Product Management":
        navigate("/ProductTypesManagement", {
          state: { search: "Product Management" },
        });
        break;
      case "Cancelled Members Report":
        navigate("/CancelledMembersReport", {
          state: { search: "Cancelled Members Report" },
        });
        break;
      case "Policy Client Example":
        navigate("/PolicyClientExample", {
          state: { search: "Policy Client Example" },
        });
        break;
      default:
        navigate("/NotDesignedYet");
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

  console.log("Sidebar Debug - Rendering sidebar with:", {
    sideBarWidth,
    isPinned,
    transformedMenuItemsLength: transformedMenuItems.length,
    selectedKey,
  });

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
        className={`sidebar-menu hide-scroll-webkit ${
          isPinned ? "collapsed" : "expanded"
        }`}
        onClick={handleClick}
      />
    </div>
  );
};

export default Sidebar;
