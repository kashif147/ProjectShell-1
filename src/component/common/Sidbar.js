import React, { useEffect, useMemo } from "react";
import { Menu } from "antd";
import {
  subscriptionItems,
  financeItems,
  correspondenceItems,
  configurationItems,
  profileItems,
  reportItems,
  issuesItems,
  eventsItems,
} from "../../constants/SideNav";
import { useSelector } from "react-redux";
import "../../styles/Sidbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";

const Sidbar = () => {
  // state
  const menuLblState = useSelector((state) => state.menuLbl);
  const location = useLocation();
  const navigate = useNavigate();

  // Used to determine which module is currently active.
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);

  // These are the menu links for various modules, imported from a constants file
  const itemsMap = {
    "Subscriptions & Rewards": subscriptionItems,
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
    "/TenantManagement": "Tenant Management",
    "/RoleManagement": "Role Management",
    "/UserManagement": "User Management",
    "/PermissionManagement": "Permission Management",
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
      default:
        navigate("/NotDesignedYet");
    }
  };

  useEffect(() => {
    if (menuLblState["Subscriptions & Rewards"]) {
      navigate("/Applications", { state: { search: "Applications" } });
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

  const sideBarWidth = showProfileHeaderRoutes.includes(location.pathname)
    ? "19vw"
    : "7vw";

  return (
    <div className="d-flex" style={{ width: sideBarWidth }}>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ width: "7vw", borderRight: 0 }}
        items={menuItems}
        className="sidebar-menu"
        onClick={handleClick}
      />
      {/* {showProfileHeaderRoutes.includes(location.pathname) && <ProfileHeader />} */}
    </div>
  );
};

export default Sidbar;
