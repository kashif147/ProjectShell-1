import React from "react";
import { Button, Card, Space, Typography, Divider } from "antd";
import {
  AuthorizedButton,
  AuthorizedAction,
  AuthorizedLink,
  PermissionWrapper,
  RoleWrapper,
} from "../component/common/AuthorizedComponents";
import { useAuthorization } from "../context/AuthorizationContext";

const { Title, Text, Paragraph } = Typography;

const AuthorizationExample = () => {
  const { user, roles, permissions, hasPermission, hasRole, canAccess } =
    useAuthorization();

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2}>Authorization System Demo</Title>

      {/* User Info */}
      <Card title="Current User Information" style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="small">
          <Text>
            <strong>User:</strong>{" "}
            {user?.name || user?.email || "Not logged in"}
          </Text>
          <Text>
            <strong>Roles:</strong> {roles.join(", ") || "None"}
          </Text>
          <Text>
            <strong>Permissions:</strong> {permissions.slice(0, 5).join(", ")}
            {permissions.length > 5 ? "..." : ""}
          </Text>
        </Space>
      </Card>

      {/* Permission-based Buttons */}
      <Card title="Permission-based Buttons" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <AuthorizedButton
            permission="user:read"
            type="primary"
            onClick={() => alert("User Read Permission Granted!")}
          >
            Read Users
          </AuthorizedButton>

          <AuthorizedButton
            permission="user:write"
            type="primary"
            onClick={() => alert("User Write Permission Granted!")}
          >
            Write Users
          </AuthorizedButton>

          <AuthorizedButton
            permission="user:delete"
            type="primary"
            danger
            onClick={() => alert("User Delete Permission Granted!")}
          >
            Delete Users
          </AuthorizedButton>

          <AuthorizedButton
            permissions={["crm:member:read", "crm:member:write"]}
            requireAllPermissions={false}
            type="default"
            onClick={() => alert("CRM Member Permission Granted!")}
          >
            CRM Member Access
          </AuthorizedButton>
        </Space>
      </Card>

      {/* Role-based Buttons */}
      <Card title="Role-based Buttons" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <AuthorizedButton
            role="SU"
            type="primary"
            onClick={() => alert("Super User Access!")}
          >
            Super User Only
          </AuthorizedButton>

          <AuthorizedButton
            roles={["GS", "DGS"]}
            type="primary"
            onClick={() => alert("Management Access!")}
          >
            Management Only
          </AuthorizedButton>

          <AuthorizedButton
            roles={["MO", "AMO"]}
            type="default"
            onClick={() => alert("Membership Officer Access!")}
          >
            Membership Officers
          </AuthorizedButton>
        </Space>
      </Card>

      {/* Permission Wrapper Examples */}
      <Card
        title="Permission Wrapper Examples"
        style={{ marginBottom: "24px" }}
      >
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>
              This section is only visible to users with 'user:read' permission:
            </Text>
            <PermissionWrapper
              permission="user:read"
              fallback={
                <Text type="secondary">
                  You don't have permission to see this content.
                </Text>
              }
            >
              <div
                style={{
                  padding: "12px",
                  background: "#f0f0f0",
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
              >
                <Text>
                  This is sensitive user data that only authorized users can
                  see!
                </Text>
              </div>
            </PermissionWrapper>
          </div>

          <Divider />

          <div>
            <Text strong>This section requires multiple permissions:</Text>
            <PermissionWrapper
              permissions={["crm:member:read", "crm:member:write"]}
              requireAllPermissions={true}
              fallback={
                <Text type="secondary">
                  You need both CRM member read and write permissions.
                </Text>
              }
            >
              <div
                style={{
                  padding: "12px",
                  background: "#e6f7ff",
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
              >
                <Text>
                  You have both CRM member read and write permissions!
                </Text>
              </div>
            </PermissionWrapper>
          </div>
        </Space>
      </Card>

      {/* Role Wrapper Examples */}
      <Card title="Role Wrapper Examples" style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>Super User Section:</Text>
            <RoleWrapper
              role="SU"
              fallback={
                <Text type="secondary">Only Super Users can see this.</Text>
              }
            >
              <div
                style={{
                  padding: "12px",
                  background: "#fff2e8",
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
              >
                <Text>
                  Welcome, Super User! You have access to all system features.
                </Text>
              </div>
            </RoleWrapper>
          </div>

          <Divider />

          <div>
            <Text strong>Management Section:</Text>
            <RoleWrapper
              roles={["GS", "DGS", "DIR"]}
              fallback={
                <Text type="secondary">
                  Only Management roles can see this.
                </Text>
              }
            >
              <div
                style={{
                  padding: "12px",
                  background: "#f6ffed",
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
              >
                <Text>Management dashboard with advanced features.</Text>
              </div>
            </RoleWrapper>
          </div>
        </Space>
      </Card>

      {/* Authorization Links */}
      <Card title="Authorization Links" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <AuthorizedLink
            permission="user:read"
            href="/UserManagement"
            onClick={() => alert("Navigating to User Management")}
          >
            User Management
          </AuthorizedLink>

          <AuthorizedLink
            permission="role:read"
            href="/RoleManagement"
            onClick={() => alert("Navigating to Role Management")}
          >
            Role Management
          </AuthorizedLink>

          <AuthorizedLink
            role="SU"
            href="/SystemSettings"
            onClick={() => alert("Navigating to System Settings")}
          >
            System Settings
          </AuthorizedLink>
        </Space>
      </Card>

      {/* Permission Check Examples */}
      <Card title="Permission Check Examples" style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="small">
          <Text>
            Can read users: {hasPermission("user:read") ? "✅ Yes" : "❌ No"}
          </Text>
          <Text>
            Can write users: {hasPermission("user:write") ? "✅ Yes" : "❌ No"}
          </Text>
          <Text>
            Can delete users:{" "}
            {hasPermission("user:delete") ? "✅ Yes" : "❌ No"}
          </Text>
          <Text>Is Super User: {hasRole("SU") ? "✅ Yes" : "❌ No"}</Text>
          <Text>
            Is Management:{" "}
            {hasRole("GS") || hasRole("DGS") ? "✅ Yes" : "❌ No"}
          </Text>
          <Text>
            Can access CRM: {canAccess("crm", "read") ? "✅ Yes" : "❌ No"}
          </Text>
        </Space>
      </Card>

      {/* Usage Instructions */}
      <Card title="How to Use Authorization in Your Components">
        <Space direction="vertical" size="middle">
          <div>
            <Title level={4}>1. Import Authorization Components</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`import { 
  AuthorizedButton, 
  PermissionWrapper, 
  RoleWrapper 
} from '../component/common/AuthorizedComponents';
import { useAuthorization } from '../context/AuthorizationContext';`}
            </pre>
          </div>

          <div>
            <Title level={4}>2. Use Authorization Hooks</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`const { hasPermission, hasRole, canAccess } = useAuthorization();

// Check permissions
if (hasPermission('user:read')) {
  // Show user data
}

// Check roles
if (hasRole('SU')) {
  // Show admin features
}`}
            </pre>
          </div>

          <div>
            <Title level={4}>3. Wrap Components with Authorization</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`<PermissionWrapper permission="user:write">
  <Button onClick={handleEdit}>Edit User</Button>
</PermissionWrapper>

<RoleWrapper roles={["GS", "DGS"]}>
  <AdminPanel />
</RoleWrapper>`}
            </pre>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AuthorizationExample;
