import { React, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  FaRegUserCircle,
  FaRegMoneyBillAlt,
  FaRegEnvelope,
  FaCalendarAlt,
  FaRegClipboard,
  FaRegFileAlt,
  FaCogs,
} from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineWork } from "react-icons/md";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { Link, useLocation } from "react-router-dom";
import { message, Popover, Badge, Avatar } from "antd";
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

const AppLauncherMenu = ({ closeDropdown }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { permissions, roles } = useAuthorization();
  const menuLbl = useSelector((state) => state.menuLbl);
  let userdata = localStorage.getItem("userdata");
  userdata = JSON.parse(userdata);
  const permission = userdata?.permissions;

  const handleUpdate = (key, value, appName) => {
    const routeMap = {
      Membership: "/MembershipDashboard",
      Finance: "/onlinePayment",
      Correspondence: "/CorrespondenceDashboard",
      Configuration: "/Configuratin",
      Events: "/EventsDashboard",
      Reports: "/Reports",
      Settings: "/Settings",
      "Issues Management": "/CasesSummary",
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
  ];

  const { hasPermission } = useAuthorization();

  const accessibleApps = appItems.filter((app) => {
    if (!app.permissions || app.permissions.length === 0) {
      return true;
    }

    return app.permissions.some((perm) => hasPermission(perm));
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
  const { clearAuth: clearAuthContext } = useAuthorization();

  const { ProfileDetails, ReportsTitle } = useTableColumns();
  const location = useLocation();

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

  const reportLink =
    ReportsTitle?.map((i, index) => {
      return {
        key: index,
        label: (
          <Link className="link" to="Reports" state={{ search: i, screen: i }}>
            {i}
          </Link>
        ),
      };
    }) || [];

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
    <div
      className="Header-border overflow-y-hidden bg pt-0 pb-0"
      style={{ borderBottom: "2px solid #dcdfe4", width: "100vw" }}
    >
      <div className="d-flex justify-content-between align-items-center ">
        <div
          className="d-flex flex-row align-items-center"
          style={{ paddingLeft: "1%", width: "33%" }}
        >
          <AppLauncher />
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
        <div style={{ width: "33%" }}>
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
          // onSelectBehavior="navigate" (default)
          // navigateTo="/Details" (default)
          />
        </div>

        <div
          style={{ width: "33%", justifyContent: "end" }}
          className="input-container d-flex align-items-center justify-content-end"
        >
          <PhoneOutlined
            className="top-icon"
            onClick={() =>
              navigate("/CorrespondencesSummary", {
                state: { search: "Correspondence" },
              })
            }
          />

          <Popover
            content={
              <NotificationPopover
                isOpen={notificationOpen}
                onNavigateToAll={() => {
                  setNotificationOpen(false);
                  navigate("/UserNotifications");
                }}
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

          <QuestionCircleOutlined className="top-icon" />
          <SettingOutlined className="top-icon" />
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
            <UserOutlined className="top-icon" />
          </Popover>
          <LogoutOutlined
            className="top-icon"
            style={{ marginRight: "30px" }}
            onClick={logout}
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
