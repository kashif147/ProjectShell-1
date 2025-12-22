import { React, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MyDrowpDown from "./MyDrowpDown";
import {
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  FaRegCircleUser,
  FaListCheck,
  FaDiagramProject,
} from "react-icons/fa6";
import {
  FaRegUserCircle,
  FaRegMoneyBillAlt,
  FaRegEnvelope,
  FaCalendarAlt,
  FaRegClipboard,
  FaRegChartBar,
  FaRegFileAlt,
  FaCogs,
  FaUsers,
  FaToolbox,
  FaListUl,
  FaUserCircle,
} from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { LuCalendarClock } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { TbGridDots } from "react-icons/tb";
import { MdOutlineWork } from "react-icons/md";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { Link, useLocation } from "react-router-dom";
import { Button, Input } from "antd";
import logo from "../../assets/images/gra_logo.png";
import { Dropdown } from "antd";
import { PiDotsNineLight } from "react-icons/pi";
import { updateMenuLbl } from "../../features/MenuLblSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuthorization } from "../../context/AuthorizationContext";
import { clearAuth } from "../../features/AuthSlice";
import "../../styles/AppLauncher.css";
import axios from "axios";
import { searchProfiles } from "../../features/profiles/SearchProfile";
const AppLauncherMenu = ({ closeDropdown }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add useNavigate
  const { permissions, roles } = useAuthorization();
  const menuLbl = useSelector((state) => state.menuLbl);
  const [searchTerm, setSearchTerm] = useState("");
  let userdata = localStorage.getItem("userdata");
  userdata = JSON.parse(userdata);
  const permission = userdata?.permissions;

  const handleUpdate = (key, value, appName) => {
    // Map app names to routes
    const routeMap = {
      "Membership": "/MembershipDashboard",
      "Finance": "/onlinePayment",
      "Correspondence": "/Email",
      "Configuration": "/Configuratin",
      // Add other mappings as needed
      "Events": "/Events", // or whatever your events route is
      "Reports": "/Reports",
      "Settings": "/Settings", // if you have a settings route
    };

    // Dispatch menu label update
    dispatch(updateMenuLbl({ key, value }));

    // Navigate to the corresponding route
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
      route: "/MembershipDashboard", // Add route property
    },
    {
      name: "Finance",
      icon: FaRegMoneyBillAlt,
      bgColor: "#4CAF50",
      permissions: ["USER_READ", "USER_WRITE"],
      roles: ["AM", "DAM", "GS", "DGS", "ASU", "SU"],
      route: "/onlinePayment",
    },
    {
      name: "Correspondence",
      icon: FaRegClipboard,
      bgColor: "#FF7043",
      permissions: ["crm:access"],
      roles: ["MO", "AMO", "GS", "DGS", "IRO", "SU"],
      route: "/Email",
    },
    {
      name: "Events",
      icon: FaCalendarAlt,
      bgColor: "#EF5350",
      permissions: ["crm:access"],
      roles: ["MO", "AMO", "GS", "DGS", "IRO", "SU"],
      route: "/Events", // Add your events route
    },
    {
      name: "Courses",
      icon: LuCalendarClock,
      bgColor: "#7E57C2",
      permissions: ["crm:access"],
      roles: ["MO", "AMO", "GS", "DGS", "IRO", "SU"],
      route: "/Courses", // Add your courses route
    },
    {
      name: "Professional Development",
      icon: MdOutlineWork,
      bgColor: "#3F51B5",
      permissions: ["crm:access"],
      roles: ["MO", "AMO", "GS", "DGS", "IRO", "SU"],
      route: "/ProfessionalDevelopment", // Add your route
    },
    {
      name: "Settings",
      icon: IoSettingsOutline,
      bgColor: "#3F51B5",
      permissions: ["portal:settings:read"],
      roles: ["MEMBER", "MO", "AMO", "GS", "DGS", "SU"],
      route: "/Settings", // Add your settings route
    },
    {
      name: "Configuration",
      icon: FaCogs,
      bgColor: "#5E35B1",
      permissions: ["user:read", "role:read"],
      roles: ["SU", "GS", "DGS"],
      route: "/Configuration",
    },
    {
      name: "Reports",
      icon: TbReportAnalytics,
      bgColor: "#A63D2F",
      permissions: ["crm:reports:read"],
      roles: ["MO", "AMO", "GS", "DGS", "IRO", "SU"],
      route: "/Reports",
    },
  ];

  // Filter app items based on user permissions and roles
  const accessibleApps = appItems.filter((app) => {
    // If no permissions/roles required, show the app
    if (!app.permissions?.length && !app.roles?.length) {
      return true;
    }

    // Check if user has wildcard permission (grants all permissions)
    const hasWildcardPermission = permissions.includes("*");

    // Check permissions
    const hasRequiredPermission =
      hasWildcardPermission ||
      !app.permissions?.length ||
      app.permissions.some((permission) => permissions.includes(permission));

    // Check roles
    const hasRequiredRole =
      !app.roles?.length || app.roles.some((role) => roles.includes(role));

    return hasRequiredPermission && hasRequiredRole;
  });

  const filteredItems = accessibleApps.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [debouncedRegNo, setDebouncedRegNo] = useState("");
  useEffect(() => {
  const autoSearch = async () => {
    try {
      // optional: minimum 3 characters
      if (debouncedRegNo.length < 3) return;

      const result = await dispatch(
        searchProfiles(debouncedRegNo)
      ).unwrap();

      navigate("/Details", {
        state: {
          name: result?.fullName,
          code: result?.regNo,
          search: "Profile",
        },
      });
    } catch (error) {
      console.error("Debounced profile search failed:", error);
    }
  };

  if (debouncedRegNo) {
    autoSearch();
  }
}, [debouncedRegNo, dispatch, navigate]);


  return (
    <div className="lancher-div">
      <input
        className="app-launcher-search"
        placeholder="Search applications..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="app-launcher-menu">
        {filteredItems.map((app) => {
          // Map app names to correct menu label keys that exist in sidebar itemsMap
          const menuLabelMap = {
            Membership: "Subscriptions & Rewards",
            Finance: "Finance",
            Correspondence: "Correspondence",
            Events: "Events",
            Courses: "Events", // Map Courses to Events for now
            "Professional Development": "Events", // Map Professional Development to Events for now
            Settings: "",
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
  const [token, settoken] = useState(null);
  const [regNo, setregNo] = useState("");
  const isLoggingOutRef = useRef(false);
  const navigate = useNavigate();
  const { clearAuth: clearAuthContext } = useAuthorization();

  // Debug logging
  console.log("Header Debug - Component rendered");
  const {
    filterByRegNo,
    topSearchData,
    ProfileDetails,
    ReportsTitle,
    updateMenuLbl,
    updateMeu,
  } = useTableColumns();
  const location = useLocation();
  const pathname = location?.pathname;
  const profile =
    Array.isArray(ProfileDetails) && ProfileDetails.length > 0
      ? ProfileDetails[0]
      : null;

  let arr = [];
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
    if (isLoggingOutRef.current) return; // Prevent multiple logout attempts
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
      const logoutTimeout = 5000; // 5 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), logoutTimeout);

      axios
        .post(
          `${process.env.REACT_APP_POLICY_SERVICE_URL}/auth/logout`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            timeout: logoutTimeout,
          }
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
          style={{ paddingLeft: "2.5%", width: "33%" }}
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
          <Input
            placeholder="Search by Membership Number, Name, Email or Mobile number"
            value={regNo}
            onChange={(e) => setregNo(e.target.value)}
            onPressEnter={async (e) => {
              try {
                const value = e.target.value;
                if (!value.trim()) return;

                // Wait for API success:
                const result = await dispatch(searchProfiles(value)).unwrap();

                // result = response.data from your thunk
                // Example: { fullName: "...", regNo: "..." }

                navigate("/Details", {
                  state: {
                    name: result?.fullName,
                    code: result?.regNo,
                    search: "Profile",
                  },
                });
              } catch (error) {
                console.error("Profile search failed:", error);
                // Optionally show error message
                // message.error("Profile not found");
              }
            }}
            suffix={
              <SearchOutlined
                onClick={async () => {
                  try {
                    if (!regNo.trim()) return;

                    // Wait for API success:
                    const result = await dispatch(
                      searchProfiles(regNo)
                    ).unwrap();

                    navigate("/Details", {
                      state: {
                        name: result?.fullName,
                        code: result?.regNo,
                        search: "Profile",
                      },
                    });
                  } catch (error) {
                    console.error("Profile search failed:", error);
                    // Optionally show error message
                    // message.error("Profile not found");
                  }
                }}
                style={{
                  cursor: "pointer",
                  paddingRight: "12px",
                  color: "#8c8c8c",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#1890ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8c8c8c";
                }}
              />
            }
            className="top-search"
            style={{ width: "100%", paddingLeft: "12px", borderRadius: "4px" }}
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
          <BellOutlined className="top-icon" />
          <QuestionCircleOutlined className="top-icon" />
          <SettingOutlined className="top-icon" />
          <UserOutlined className="top-icon" />
          <LogoutOutlined
            className="top-icon"
            style={{ marginRight: "30px" }}
            onClick={() => {
              // localStorage.removeItem("token");
              // navigate("/");
              logout();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
