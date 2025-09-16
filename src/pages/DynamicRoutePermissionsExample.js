import React from "react";
import { useAuthorization } from "../context/AuthorizationContext";

const DynamicRoutePermissionsExample = () => {
  const {
    routePermissions,
    loading,
    error,
    getRoutePermissions,
    canAccessRoute,
  } = useAuthorization();

  const testRoutes = [
    "/MembershipDashboard",
    "/UserManagement",
    "/RoleManagement",
    "/PermissionManagement",
    "/Details",
    "/Summary",
  ];

  if (loading) {
    return <div>Loading route permissions...</div>;
  }

  if (error) {
    return <div>Error loading route permissions: {error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dynamic Route Permissions Example</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Route Permissions from API:</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {JSON.stringify(routePermissions, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Route Access Check:</h3>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Route
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Permissions Required
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Roles Required
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Can Access
              </th>
            </tr>
          </thead>
          <tbody>
            {testRoutes.map((route) => {
              const routeConfig = getRoutePermissions(route);
              const canAccess = canAccessRoute(route);

              return (
                <tr key={route}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {route}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {routeConfig.permissions.join(", ") || "None"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {routeConfig.roles.join(", ") || "None"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      color: canAccess ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {canAccess ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>API Endpoints Used:</h3>
        <ul>
          <li>
            <code>/auth/all-permissions</code> - Consolidated endpoint for all
            authorization data
          </li>
          <li>
            <code>/route-permissions</code> - Individual route permissions
            endpoint
          </li>
          <li>
            <code>/permissions</code> - Permission definitions
          </li>
          <li>
            <code>/roles</code> - Role definitions
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Benefits:</h3>
        <ul>
          <li>
            ✅ Route permissions are now fetched from API instead of hardcoded
            constants
          </li>
          <li>
            ✅ All permission types (user permissions, roles, route permissions)
            in one API call
          </li>
          <li>✅ Fallback to static configuration if API fails</li>
          <li>✅ Dynamic updates without code changes</li>
          <li>✅ Centralized permission management</li>
        </ul>
      </div>
    </div>
  );
};

export default DynamicRoutePermissionsExample;
