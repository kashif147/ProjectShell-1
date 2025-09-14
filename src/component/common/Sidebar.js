import React, { useEffect, useMemo, useState } from "react";
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
} from "../../constants/SideNav.js";
import { useSelector } from "react-redux";
import "../../styles/Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader.js";
import PolicyClient from "../../utils/node-policy-client.js";
import {
  usePolicyClient,
  useAuthorization,
  usePermissions,
} from "../../utils/react-policy-hooks";
import {
  PushpinOutlined,
  PushpinFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
// import policy from "../../utils/react-policy-client";

const Sidebar = () => {
  // state
  const menuLblState = useSelector((state) => state.menuLbl);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Create policy client instance
  const policyClient = usePolicyClient(
    PolicyClient,
    process.env.REACT_APP_POLICY_SERVICE_URL || "http://localhost:3000"
  );

  // Check permissions
  const { loading, authorized: canRead } = useAuthorization(
    policyClient,
    token,
    "user",
    "read"
  );
  const { permissions } = usePermissions(policyClient, token, "user");
  const canEdit = permissions.includes("user:write");
  console.log(permissions, "testin");

  //  console.log(canDelete,"permission")
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("sidebar-pinned");
    return saved ? JSON.parse(saved) : false;
  });

  // Used to determine which module is currently active.
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);

  // These are the menu links for various modules, imported from a constants file
  const itemsMap = {
    "Subscriptions & Rewards": subscriptionItems,
    Membership: subscriptionItems, // Map Membership to subscriptionItems
    Finance: financeItems,
    Correspondence: correspondenceItems,
    Configuration: configurationItems,
    Profiles: profileItems,
    Reports: reportItems,
    "Issue Management": issuesItems,
    Events: eventsItems,
  };

  // Displays the currently active module selected from the top menu and passes it to the menu component and  make it ready to pass to the menu.
  const menuItems = itemsMap[activeKey] || [];

  // Transform menu items for collapsed/expanded view
  const transformedMenuItems = useMemo(() => {
    return menuItems.map((item) => {
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
  }, [menuItems, isPinned]);

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
  };

  const selectedKey = useMemo(() => {
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
      case "Cancelled Members Report":
        navigate("/CancelledMembersReport", {
          state: { search: "Cancelled Members Report" },
        });
        break;
      default:
        navigate("/NotDesignedYet");
    }
  };

  useEffect(() => {
    if (menuLblState["Subscriptions & Rewards"] || menuLblState["Membership"]) {
      navigate("/MembershipDashboard", {
        state: { search: "Membership Dashboard" },
      });
    } else if (menuLblState["Finance"]) {
      navigate("/Batches", { state: { search: "Batches" } });
    } else if (menuLblState["Correspondence"]) {
      navigate("/Email", { state: { search: "Email" } });
    } else if (menuLblState["Configuration"]) {
      navigate("/Configuratin", { state: { search: "" } });
    }
  }, [menuLblState]);

  const showProfileHeaderRoutes = [
    "/ClaimsDetails",
    "/CasesDetails",
    "/ClaimsById",
    "/CasesById",
    "/AddNewProfile",
    "/AddClaims",
    ,
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
        className={`sidebar-menu hide-scroll-webkit ${
          isPinned ? "collapsed" : "expanded"
        }`}
        onClick={handleClick}
      />
    </div>
  );
};

export default Sidebar;
