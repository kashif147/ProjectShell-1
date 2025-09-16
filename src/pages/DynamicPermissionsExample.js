import React, { useState, useEffect } from "react";
import { Card, Space, Typography, Button, Table, Tag, Spin, Alert } from "antd";
import { useAuthorization } from "../context/AuthorizationContext";
import AuthorizationAPI from "../services/AuthorizationAPI";

const { Title, Text, Paragraph } = Typography;

const DynamicPermissionsExample = () => {
  const {
    user,
    roles,
    permissions,
    permissionDefinitions,
    roleDefinitions,
    hasPermission,
    hasRole,
    getPermissionDefinition,
    getRoleDefinition,
    refreshDefinitions,
    loading,
  } = useAuthorization();

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Test API permission check
  const testApiPermissionCheck = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const hasUserRead = await AuthorizationAPI.checkPermission(
        token,
        "user:read"
      );
      alert(
        `API Permission Check - user:read: ${
          hasUserRead ? "GRANTED" : "DENIED"
        }`
      );
    } catch (error) {
      setApiError(error.message);
    } finally {
      setApiLoading(false);
    }
  };

  // Test API role check
  const testApiRoleCheck = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const hasSuperUserRole = await AuthorizationAPI.checkRole(token, "SU");
      alert(`API Role Check - SU: ${hasSuperUserRole ? "GRANTED" : "DENIED"}`);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setApiLoading(false);
    }
  };

  // Refresh permissions from API
  const handleRefreshPermissions = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      await refreshDefinitions();
      alert("Permissions and roles refreshed successfully!");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setApiLoading(false);
    }
  };

  // Table columns for permission definitions
  const permissionColumns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "User Has",
      key: "userHas",
      render: (_, record) => (
        <Tag color={hasPermission(record.key) ? "green" : "red"}>
          {hasPermission(record.key) ? "YES" : "NO"}
        </Tag>
      ),
    },
  ];

  // Table columns for role definitions
  const roleColumns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "User Has",
      key: "userHas",
      render: (_, record) => (
        <Tag color={hasRole(record.key) ? "green" : "red"}>
          {hasRole(record.key) ? "YES" : "NO"}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title level={2}>Dynamic Permissions & Roles Demo</Title>

      {apiError && (
        <Alert
          message="API Error"
          description={apiError}
          type="error"
          style={{ marginBottom: "24px" }}
          closable
          onClose={() => setApiError(null)}
        />
      )}

      {/* Current User Info */}
      <Card title="Current User Information" style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="small">
          <Text>
            <strong>User:</strong>{" "}
            {user?.name || user?.email || "Not logged in"}
          </Text>
          <Text>
            <strong>User Roles:</strong> {roles.join(", ") || "None"}
          </Text>
          <Text>
            <strong>User Permissions:</strong>{" "}
            {permissions.slice(0, 5).join(", ")}
            {permissions.length > 5 ? "..." : ""}
          </Text>
          <Text>
            <strong>Total Permission Definitions:</strong>{" "}
            {permissionDefinitions.length}
          </Text>
          <Text>
            <strong>Total Role Definitions:</strong> {roleDefinitions.length}
          </Text>
        </Space>
      </Card>

      {/* API Testing */}
      <Card title="API Testing" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <Button
            type="primary"
            onClick={testApiPermissionCheck}
            loading={apiLoading}
          >
            Test API Permission Check
          </Button>

          <Button
            type="primary"
            onClick={testApiRoleCheck}
            loading={apiLoading}
          >
            Test API Role Check
          </Button>

          <Button onClick={handleRefreshPermissions} loading={apiLoading}>
            Refresh Definitions
          </Button>
        </Space>
      </Card>

      {/* Dynamic Permission Definitions */}
      <Card
        title="Dynamic Permission Definitions (from API)"
        style={{ marginBottom: "24px" }}
        extra={
          <Text type="secondary">
            {permissionDefinitions.length} permissions loaded
          </Text>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Loading permission definitions...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={permissionColumns}
            dataSource={permissionDefinitions}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        )}
      </Card>

      {/* Dynamic Role Definitions */}
      <Card
        title="Dynamic Role Definitions (from API)"
        style={{ marginBottom: "24px" }}
        extra={
          <Text type="secondary">{roleDefinitions.length} roles loaded</Text>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Loading role definitions...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={roleColumns}
            dataSource={roleDefinitions}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        )}
      </Card>

      {/* Usage Examples */}
      <Card title="Usage Examples">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Title level={4}>1. Get Permission Definition</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`const permissionDef = getPermissionDefinition('user:read');
console.log(permissionDef);
// Returns: { key: 'user:read', name: 'Read Users', category: 'user', description: '...' }`}
            </pre>
          </div>

          <div>
            <Title level={4}>2. Get Role Definition</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`const roleDef = getRoleDefinition('SU');
console.log(roleDef);
// Returns: { key: 'SU', name: 'Super User', category: 'SYSTEM', description: '...' }`}
            </pre>
          </div>

          <div>
            <Title level={4}>3. Check Permissions Dynamically</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`// Client-side check (fast)
const canRead = hasPermission('user:read');

// Server-side check (secure)
const canReadFromAPI = await AuthorizationAPI.checkPermission(token, 'user:read');`}
            </pre>
          </div>

          <div>
            <Title level={4}>4. Refresh Definitions</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`// Refresh permission and role definitions from API
await refreshDefinitions();

// Or refresh user's specific permissions
const userData = await AuthorizationAPI.refreshUserPermissions(token);`}
            </pre>
          </div>
        </Space>
      </Card>

      {/* Benefits */}
      <Card
        title="Benefits of Dynamic Permissions"
        style={{ marginTop: "24px" }}
      >
        <Space direction="vertical" size="small">
          <Text>
            ✅ <strong>Security:</strong> Permissions are controlled server-side
          </Text>
          <Text>
            ✅ <strong>Flexibility:</strong> Add/modify permissions without code
            changes
          </Text>
          <Text>
            ✅ <strong>Consistency:</strong> Frontend and backend permissions
            stay in sync
          </Text>
          <Text>
            ✅ <strong>Maintainability:</strong> No hardcoded permission
            constants
          </Text>
          <Text>
            ✅ <strong>Scalability:</strong> Easy to add new permissions and
            roles
          </Text>
          <Text>
            ✅ <strong>Audit Trail:</strong> All permission changes tracked on
            server
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default DynamicPermissionsExample;
