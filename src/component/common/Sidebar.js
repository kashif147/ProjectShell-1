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
      "Issue Management": issuesItems,
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

  // Transform menu items for collapsed/expanded view
  const transformedMenuItems = useMemo(() => {

    const transformed = menuItems.map((item) => {
      if (isPinned) {
        // Collapsed view: show only icon with tooltip
        return {
          ...item,
          icon: (
            <Tooltip
              title={item.label.props.children}
              placement="right"
              // overlayClassName="sidebar-tooltip"
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
      "/Deductions": "Deductions",
      "/Reconciliation": "Reconciliation",
      "/StandingOrders": "Standing Orders",
      "/Cheque": "Cheques",
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
      "/NewGraduate": "CornMarket New Graduate",
      "/CornMarketRewards": "CornMarket Rewards",
      "/RecruitAFriend": "Recruit a Friend",
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
      case "Deductions":
        navigate("/Deductions", { state: { search: "Deductions" } });
        break;
      case "Reconciliation":
        navigate("/Reconciliation", { state: { search: "Reconciliation" } });
        break;
      case "Standing Orders":
        navigate("/StandingOrders", { state: { search: "Standing Orders" } });
        break;
      case "Cheque":
        navigate("/Cheque", { state: { search: "Cheques" } });
        break;
      case "Reconciliations":
        navigate("/Reconciliation", { state: { search: "Reconciliation" } });
        break;
      case "Online Payments":
        navigate("/onlinePayment", { state: { search: "onlinePayment" } });
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
      case "Templetes":
        navigate("/templeteSummary", {
          state: { search: "Templetes" },
        });
        break;
      case "Membership":
        navigate("/Members", {
          state: { search: "Membership" },
        });
        break;
      case "Templetes":
        navigate("/templeteSummary", {
          state: { search: "Templetes" },
        });
        break;
      case "CornMarket New Graduate":
        navigate("/NewGraduate", { state: { search: "CornMarket New Graduate" } });
        break;
      case "CornMarket Rewards":
        navigate("/CornMarketRewards", { state: { search: "CornMarket Rewards" } });
        break;
      case "Recruit a Friend":
        navigate("/RecruitAFriend", { state: { search: "Recruit a Friend" } });
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
