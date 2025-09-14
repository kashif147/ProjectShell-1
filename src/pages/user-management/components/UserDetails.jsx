import React from "react";
import {
  Drawer,
  Card,
  Row,
  Col,
  Tag,
  Badge,
  Avatar,
  Descriptions,
  Divider,
  Space,
  Button,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { formatLastLogin, getTenantsList } from "../../../constants/Users";

const UserDetails = ({ user, onClose }) => {
  if (!user) return null;

  const getUserInitials = (user) => {
    return `${user.userFirstName?.[0] || ""}${
      user.userLastName?.[0] || ""
    }`.toUpperCase();
  };

  const getUserTypeColor = (userType) => {
    return userType === "CRM" ? "blue" : "green";
  };

  const getUserStatusBadge = (isActive) => {
    return isActive
      ? { status: "success", text: "Active" }
      : { status: "error", text: "Inactive" };
  };

  const getRoleCategoryColor = (category) => {
    const colors = {
      SYSTEM: "red",
      PORTAL: "green",
      CRM_MANAGEMENT: "purple",
      CRM_OFFICERS: "blue",
      CRM_SPECIALIZED: "orange",
      CRM_ACCESS: "gray",
    };
    return colors[category] || "default";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatTokenTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Drawer
      title={`User Details - ${user.userFullName}`}
      width="40%"
      placement="right"
      onClose={onClose}
      open={true}
      className="user-details-drawer configuration-main"
      extra={<Button onClick={onClose}>Close</Button>}
    >
      <div className="drawer-main-cntainer">
        <div className="user-details-content">
          {/* User Profile Header */}
          <Card className="user-profile-card mb-4">
            <div className="user-profile-content">
              <div className="user-profile-left">
                <Avatar
                  size={60}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                >
                  {getUserInitials(user)}
                </Avatar>
                <div className="user-basic-info">
                  <h4 className="mb-1">{user.userFullName}</h4>
                  <p className="text-muted mb-1">{user.userEmail}</p>
                  <p className="text-muted mb-0">{user.userMemberNumber}</p>
                </div>
              </div>
              <div className="user-profile-right">
                <div className="user-status-info">
                  <Space>
                    <Tag
                      color={getUserTypeColor(user.userType)}
                      className="user-type-tag"
                    >
                      {user.userType}
                    </Tag>
                    <Badge
                      status={getUserStatusBadge(user.isActive).status}
                      text={getUserStatusBadge(user.isActive).text}
                    />
                  </Space>
                </div>
                <div className="user-additional-info">
                  <Tag color="blue" className="tenant-info-tag">
                    <TeamOutlined className="mr-1" />
                    {(() => {
                      const tenant = getTenantsList().find(
                        (t) => t.id === user.tenantId
                      );
                      return tenant ? tenant.name : user.tenantId;
                    })()}
                  </Tag>
                  <Tag color="green" className="last-login-tag">
                    <CalendarOutlined className="mr-1" />
                    {formatLastLogin(user.userLastLogin)}
                  </Tag>
                </div>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card title="Basic Information" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Mobile Phone" icon={<PhoneOutlined />}>
                {user.userMobilePhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="First Name">
                {user.userFirstName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {user.userLastName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {user.userFullName || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Roles Information */}
          <Card title="Roles & Permissions" className="mb-4">
            <div className="roles-section">
              <div className="d-flex align-items-center mb-3">
                <TeamOutlined className="mr-2" />
                <span className="fw-medium">
                  Assigned Roles ({user.roles?.length || 0})
                </span>
              </div>
              {user.roles && user.roles.length > 0 ? (
                <div className="roles-list">
                  {user.roles.map((role) => (
                    <div key={role._id} className="role-item mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <Tag
                            color={getRoleCategoryColor(role.category)}
                            className="role-category-tag"
                          >
                            {role.category}
                          </Tag>
                          <span className="role-name ml-2">{role.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No roles assigned</p>
              )}
            </div>
          </Card>

          {/* Authentication Information */}
          <Card title="Authentication Information" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Auth Provider">
                <Tag color="blue">{user.userAuthProvider || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Microsoft ID">
                <code>{user.userMicrosoftId || "N/A"}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Subject">
                <code>{user.userSubject || "N/A"}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Audience">
                <code>{user.userAudience || "N/A"}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Issuer">
                <code>{user.userIssuer || "N/A"}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Token Version">
                {user.userTokenVersion || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Policy">
                {user.userPolicy || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Token Information */}
          <Card title="Token Information" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Issued At">
                {formatTokenTime(user.userIssuedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Auth Time">
                {formatTokenTime(user.userAuthTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login" icon={<CalendarOutlined />}>
                {formatLastLogin(user.userLastLogin)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Audit Information */}
          <Card title="Audit Information" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Created By">
                {user.createdBy || "System"}
              </Descriptions.Item>
              <Descriptions.Item label="Updated By">
                {user.updatedBy || "System"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At" icon={<CalendarOutlined />}>
                {formatDate(user.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" icon={<CalendarOutlined />}>
                {formatDate(user.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Tenant Information */}
          <Card title="Tenant Information" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Tenant ID">
                <Tag color="blue">{user.tenantId}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </Drawer>
  );
};

export default UserDetails;
