import { React, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import {
  FaRegUserCircle,
  FaRegMoneyBillAlt,
  FaCalendarAlt,
  FaRegClipboard,
  FaCogs,
  FaCalendarCheck,
} from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineWork } from "react-icons/md";
import { Popover, Badge } from "antd";
import NotificationPopover from "./NotificationPopover";
import UserProfilePopover from "./UserProfilePopover";
import { PiDotsNineLight } from "react-icons/pi";
import { updateMenuLbl } from "../../features/MenuLblSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuthorization } from "../../context/AuthorizationContext";
import { clearAuth } from "../../features/AuthSlice";
import "../../styles/AppLauncher.css";
import axios from "axios";
import MemberSearch from "../profile/MemberSearch";
import { useNotifications } from "../../context/NotificationContext";
import { useTenantBranding } from "../../context/TenantBrandingContext";

const AppLauncherMenu = ({ closeDropdown }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuLbl = useSelector((state) => state.menuLbl);
  let userdata = localStorage.getItem("userdata");
  userdata = JSON.parse(userdata);
  const permission = userdata?.permissions;

  const handleUpdate = (key, value, appName) => {
    const routeMap = {
      Membership: "/MembershipDashboard",
      Finance: "/onlinePayment",
      Correspondence: "/CorrespondenceDashboard",
      Configuration: "/Configuration",
      Events: "/EventsDashboard",
      Reports: "/Reports",
      Settings: "/Settings",
      "Issues Management": "/CasesSummary",
      "Year-End Renewal": "/YearEndRenewal",
    };

    dispatch(updateMenuLbl({ key, value }));

    if (routeMap[appName]) {
      navigate(routeMap[appName]);
    }

    closeDropdown();
  };

  const appItems = [
    {
      name: "Membership",
      icon: FaRegUserCircle,
      bgColor: "#4CAF50",
      permissions: ["menu:membership:access"],
      route: "/MembershipDashboard",
    },
    {
      name: "Finance",
      icon: FaRegMoneyBillAlt,
      bgColor: "#4CAF50",
      permissions: ["menu:finance:access"],
      route: "/onlinePayment",
    },
    {
      name: "Correspondence",
      icon: FaRegClipboard,
      bgColor: "#FF7043",
      permissions: ["menu:correspondence:access"],
      route: "/CorrespondenceDashboard",
    },
    {
      name: "Events",
      icon: FaCalendarAlt,
      bgColor: "#EF5350",
      permissions: ["menu:events:access"],
      route: "/EventsDashboard",
    },
    {
      name: "Issues Management",
      icon: MdOutlineWork,
      bgColor: "#3F51B5",
      permissions: ["menu:issues_management:access"],
      route: "/CasesSummary",
    },
    {
      name: "Configuration",
      icon: FaCogs,
      bgColor: "#5E35B1",
      permissions: ["menu:configuration:access"],
      route: "/Configuration",
    },
    {
      name: "Reports",
      icon: TbReportAnalytics,
      bgColor: "#A63D2F",
      permissions: ["menu:reports:access"],
      route: "/Reports",
    },
    {
      name: "Year-End Renewal",
      icon: FaCalendarCheck,
      bgColor: "#2E7D32",
      permissions: ["subscriptions:write", "payments:write"],
      roles: ["SU"],
      route: "/YearEndRenewal",
    },
  ];

  const { hasPermission, hasAnyRole } = useAuthorization();

  const accessibleApps = appItems.filter((app) => {
    if (
      (!app.permissions || app.permissions.length === 0) &&
      (!app.roles || app.roles.length === 0)
    ) {
      return true;
    }

    const hasRequiredPermission = (app.permissions || []).some((perm) =>
      hasPermission(perm),
    );
    const hasRequiredRole =
      Array.isArray(app.roles) && app.roles.length > 0 && hasAnyRole(app.roles);

    return hasRequiredPermission || hasRequiredRole;
  });

  return (
    <div className="lancher-div">
      <div className="app-launcher-menu">
        {accessibleApps.map((app) => {
          const menuLabelMap = {
            Membership: "Subscriptions & Rewards",
            Finance: "Finance",
            Correspondence: "Correspondence",
            Events: "Events",
            "Issues Management": "Issues Management",
            Configuration: "Configuration",
            Reports: "Reports",
            "Year-End Renewal": "Year-End Renewal",
          };

          const menuKey = menuLabelMap[app.name] || app.name;
          const isActive = menuLbl[menuKey];
          const Icon = app.icon;

          return (
            <div
              key={app.name}
              className={`app-item ${isActive ? "active-item" : ""}`}
              onClick={() => handleUpdate(menuKey, true, app.name)}
            >
              <div
                className="icon-circle"
                style={{ backgroundColor: app.bgColor }}
              >
                <Icon className="app-icon-size" />
              </div>
              <div className="app-name-blue">{app.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AppLauncher = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <div
        style={{
          cursor: "pointer",
          fontSize: "20px",
          padding: "8px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          backgroundColor: open ? "rgba(255, 255, 255, 0.1)" : "transparent",
        }}
        onClick={() => setOpen(!open)}
      >
        <PiDotsNineLight
          color={"#fff"}
          size={"30px"}
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            marginTop: "8px",
          }}
        >
          <AppLauncherMenu closeDropdown={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

function Header() {
  const dispatch = useDispatch();
  const isLoggingOutRef = useRef(false);
  const navigate = useNavigate();
  const { clearAuth: clearAuthContext, hasPermission } = useAuthorization();
  const { branding } = useTenantBranding();
  const headerLogo =
    String(branding?.onPrimaryColor || "").toLowerCase() === "#ffffff"
      ? branding?.logoDarkUrl || branding?.logoUrl
      : branding?.logoUrl || branding?.logoDarkUrl;
  const portalTitle = branding?.portalTitle;

  const { badge } = useNotifications();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Read directly from localStorage as requested
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : {};

  const getInitial = () => {
    const name =
      userData?.name ||
      userData?.unique_name ||
      userData?.preferred_username ||
      "U";
    return name.charAt(0).toUpperCase();
  };

  const logout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    const token = localStorage.getItem("token");

    // Clear auth state immediately for better UX
    clearAuthContext();
    dispatch(clearAuth());

    // Clear all localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRoles");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userdata");
    localStorage.removeItem("activeMenuModule");

    // Navigate immediately (don't wait for API)
    navigate("/");

    // Call logout API in background with timeout (non-blocking)
    if (token) {
      const logoutTimeout = 5000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), logoutTimeout);

      axios
        .post(
          `${process.env.REACT_APP_BASE_URL_DEV}/auth/logout`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            timeout: logoutTimeout,
          },
        )
        .then(() => {
          console.log("Logout API call successful");
        })
        .catch((error) => {
          if (error.name === "AbortError" || error.code === "ECONNABORTED") {
            console.warn("Logout API call timed out (non-critical)");
          } else {
            console.error("Logout API call failed (non-critical):", error);
          }
        })
        .finally(() => {
          clearTimeout(timeoutId);
          isLoggingOutRef.current = false;
        });
    } else {
      isLoggingOutRef.current = false;
    }
  };

  return (
    <div className="Header-border app-top-nav overflow-y-hidden bg pt-0 pb-0">
      <div className="app-top-nav__inner">
        <div className="app-top-nav__brand">
          <AppLauncher />
          <div className="tenant-header-brand-lockup">
            {headerLogo ? (
              <span className="tenant-header-logo-frame">
                <img
                  src={headerLogo}
                  alt={portalTitle || "Organisation logo"}
                  className="tenant-header-logo"
                />
              </span>
            ) : null}
            {portalTitle ? (
              <span className="tenant-header-title">{portalTitle}</span>
            ) : null}
          </div>
          <nav className="navbar navbar-expand-lg navbar-light">
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </nav>
        </div>
        <div className="app-top-nav__search">
          {/* <MemberSearch
            headerStyle={true}
            fullWidth={true}
            showAddButton={false}
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
            }}
          /> */}
          <MemberSearch
            headerStyle={true}
            showStatus={false}
            // onSelectBehavior="navigate" (default)
            // navigateTo="/Details" (default)
          />
        </div>

        <div className="app-top-nav__actions input-container">
          {hasPermission("issues:read") ? (
            <span
              className="top-icon"
              role="button"
              tabIndex={0}
              aria-label="Find Issues"
              title="Find Issues"
              onClick={() => navigate("/FindIssues")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/FindIssues");
              }}
              style={{ cursor: "pointer" }}
            >
              <FileSearchOutlined />
            </span>
          ) : null}

          <Popover
            content={
              <NotificationPopover
                isOpen={notificationOpen}
                onNavigateToAll={() => {
                  setNotificationOpen(false);
                  navigate("/UserNotifications");
                }}
                onClose={() => setNotificationOpen(false)}
              />
            }
            trigger="click"
            placement="bottomRight"
            open={notificationOpen}
            onOpenChange={(open) => setNotificationOpen(open)}
            styles={{ body: { padding: 0 } }}
          >
            <span className="notification-bell-wrap">
              <Badge count={badge} size="small" offset={[-2, 4]}>
                <BellOutlined className="top-icon notification-bell-icon" />
              </Badge>
            </span>
          </Popover>

          <Popover
            content={
              <UserProfilePopover
                onLogout={logout}
                onClose={() => setProfileOpen(false)}
              />
            }
            trigger="click"
            open={profileOpen}
            onOpenChange={(open) => setProfileOpen(open)}
            placement="bottomRight"
            styles={{ body: { padding: 0 } }}
          >
            <span
              className="top-icon top-icon-profile"
              aria-label="Open user profile"
            >
              <UserOutlined />
            </span>
          </Popover>
          <LogoutOutlined
            className="top-icon"
            style={{ marginRight: 0 }}
            onClick={logout}
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
