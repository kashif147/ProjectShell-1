import React from "react";
import PolicyClient from "../../utils/node-policy-client";
import {
  usePolicyClient,
  useAuthorization,
  usePermissions,
} from "../../utils/react-policy-hooks";

/**
 * Example component showing proper PolicyClient integration
 * This demonstrates how to use the policy client with React hooks
 */
const PolicyExample = () => {
  // Get token from localStorage or context
  const token = localStorage.getItem("token");

  // Create policy client instance
  const policyClient = usePolicyClient(
    PolicyClient,
    process.env.REACT_APP_POLICY_SERVICE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://project-shell-crm.vercel.app"),
    {
      timeout: 5000,
      retries: 3,
      cacheTimeout: 300000, // 5 minutes
    }
  );

  // Example 1: Check if user can view dashboard
  const {
    loading: dashboardLoading,
    authorized: canViewDashboard,
    error: dashboardError,
  } = useAuthorization(policyClient, token, "dashboard", "view");

  // Example 2: Check if user can edit user management
  const {
    loading: userMgtLoading,
    authorized: canEditUsers,
    error: userMgtError,
  } = useAuthorization(policyClient, token, "user-management", "edit");

  // Example 3: Get all permissions for a resource
  const {
    loading: permissionsLoading,
    permissions,
    error: permissionsError,
  } = usePermissions(policyClient, token, "user-management");

  // Example 4: Quick check function
  const handleQuickCheck = async () => {
    try {
      const canDelete = await policyClient.check(
        token,
        "user-management",
        "delete"
      );
      
    } catch (error) {
      
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Policy Client Integration Example
      </h2>

      {/* Dashboard Access */}
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold">Dashboard Access</h3>
        {dashboardLoading ? (
          <p>Checking permissions...</p>
        ) : dashboardError ? (
          <p className="text-red-500">Error: {dashboardError}</p>
        ) : (
          <p className={canViewDashboard ? "text-green-500" : "text-red-500"}>
            {canViewDashboard
              ? "✓ Can view dashboard"
              : "✗ Cannot view dashboard"}
          </p>
        )}
      </div>

      {/* User Management Access */}
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold">User Management Edit Access</h3>
        {userMgtLoading ? (
          <p>Checking permissions...</p>
        ) : userMgtError ? (
          <p className="text-red-500">Error: {userMgtError}</p>
        ) : (
          <p className={canEditUsers ? "text-green-500" : "text-red-500"}>
            {canEditUsers ? "✓ Can edit users" : "✗ Cannot edit users"}
          </p>
        )}
      </div>

      {/* Resource Permissions */}
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold">User Management Permissions</h3>
        {permissionsLoading ? (
          <p>Loading permissions...</p>
        ) : permissionsError ? (
          <p className="text-red-500">Error: {permissionsError}</p>
        ) : (
          <div>
            <p>Available permissions:</p>
            <ul className="list-disc list-inside">
              {permissions.map((permission, index) => (
                <li key={index} className="text-green-500">
                  ✓ {permission}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Check Button */}
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold">Quick Check</h3>
        <button
          onClick={handleQuickCheck}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Delete Permission
        </button>
      </div>

      {/* Conditional Rendering Example */}
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold">Conditional Content</h3>
        {canViewDashboard && (
          <div className="bg-green-100 p-2 rounded">
            <p>This content is only visible to users with dashboard access!</p>
          </div>
        )}
        {!canViewDashboard && !dashboardLoading && (
          <div className="bg-red-100 p-2 rounded">
            <p>
              Access denied. You don't have permission to view this content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyExample;
