import { useNavigate, Link } from "react-router-dom";
import { Avatar, Divider } from "antd";
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  SafetyCertificateOutlined 
} from "@ant-design/icons";
import "../../styles/UserProfilePopover.css";

const UserProfilePopover = ({ onLogout, onClose }) => {
  // Read directly from localStorage as requested
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
  
  const userRolesRaw = localStorage.getItem("userRoles");
  const userRolesArr = userRolesRaw ? JSON.parse(userRolesRaw) : [];

  // Get initial from name or email
  const getInitial = () => {
    const name =
      userData?.name ||
      userData?.unique_name ||
      userData?.preferred_username ||
      "User";
    return name.charAt(0).toUpperCase();
  };

  const displayName = userData?.name || userData?.unique_name || "User";
  const displayEmail =
    userData?.email || userData?.preferred_username || userData?.upn || "";

  // Format roles for display
  // Based on the screenshot, userData has a roles array of objects or userRoles is an array of strings
  const displayRole =
    userData && Array.isArray(userData.roles) && userData.roles.length > 0
      ? userData.roles[0].name || userData.roles[0].code
      : userRolesArr && userRolesArr.length > 0
      ? userRolesArr[0]
      : "Member";

  return (
    <div className="profile-popover-container">
      <div className="profile-header-enhanced">
        <div className="profile-avatar-wrapper">
          <Avatar
            size={64}
            style={{
              backgroundColor: "#1e3a5f",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              border: "2px solid #fff"
            }}
          >
            {getInitial()}
          </Avatar>
          <div className="profile-status-indicator" />
        </div>
        <div className="profile-info-enhanced">
          <div className="profile-name-main">{displayName}</div>
          <div className="profile-email-sub">{displayEmail}</div>
          <div className="profile-role-badge">
            <SafetyCertificateOutlined style={{ marginRight: "4px" }} />
            {displayRole}
          </div>
        </div>
      </div>

      <div className="profile-menu-section">
        <Link to="/Settings" className="profile-menu-item" onClick={onClose}>
          <div className="menu-item-icon profile-icon">
            <UserOutlined />
          </div>
          <div className="menu-item-text">
            <span className="menu-title">My Profile</span>
            <span className="menu-desc">Account settings and more</span>
          </div>
        </Link>

        <Link to="/Settings" className="profile-menu-item" onClick={onClose}>
          <div className="menu-item-icon settings-icon">
            <SettingOutlined />
          </div>
          <div className="menu-item-text">
            <span className="menu-title">Settings</span>
            <span className="menu-desc">Preferences and security</span>
          </div>
        </Link>

        <Divider style={{ margin: "8px 0" }} />

        <div
          className="profile-menu-item logout-item"
          onClick={() => {
            onLogout();
            onClose();
          }}
        >
          <div className="menu-item-icon logout-icon">
            <LogoutOutlined />
          </div>
          <div className="menu-item-text">
            <span className="menu-title">Sign Out</span>
            <span className="menu-desc">Safely leave your session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePopover;
