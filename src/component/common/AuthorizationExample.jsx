import React, { useState, useEffect } from "react";
import { useAuthorization } from "../../context/AuthorizationContext";
import AuthorizationAPI from "../../services/AuthorizationAPI";

const AuthorizationExample = () => {
  const {
    user,
    roles,
    permissions,
    hasPermission,
    hasRole,
    canAccess,
    canAccessWithPolicy,
  } = useAuthorization();

  const [policyResult, setPolicyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Example of using policy-based authorization
  const checkPolicyAccess = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPolicyResult({ error: "No token found" });
        return;
      }

      // Example: Check if user can access 'users' resource with 'read' action
      const result = await AuthorizationAPI.evaluatePolicy(
        token,
        "users",
        "read",
        {
          tenantId: user?.tenantId,
          userId: user?.id,
        }
      );

      setPolicyResult(result);
    } catch (error) {
      setPolicyResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Example of checking specific permission using policy endpoint
  const checkSpecificPermission = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPolicyResult({ error: "No token found" });
        return;
      }

      // Check specific permission using policy endpoint
      const hasAccess = await AuthorizationAPI.checkPermission(
        token,
        "users:write"
      );
      setPolicyResult({
        permission: "users:write",
        hasAccess,
        method: "policy_endpoint",
      });
    } catch (error) {
      setPolicyResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h3>Authorization Example</h3>

      {/* Display JWT token data */}
      <div style={{ marginBottom: "20px" }}>
        <h4>JWT Token Data:</h4>
        <p>
          <strong>User:</strong> {user?.email || "Not available"}
        </p>
        <p>
          <strong>Roles:</strong> {roles?.join(", ") || "None"}
        </p>
        <p>
          <strong>Permissions:</strong>{" "}
          {permissions?.slice(0, 5).join(", ") || "None"}
        </p>
        {permissions?.length > 5 && (
          <p>... and {permissions.length - 5} more</p>
        )}
      </div>

      {/* Simple authorization checks */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Simple Authorization Checks:</h4>
        <p>
          Has 'users:read' permission:{" "}
          {hasPermission("users:read") ? "✅" : "❌"}
        </p>
        <p>Has 'admin' role: {hasRole("admin") ? "✅" : "❌"}</p>
        <p>Can access 'users' resource: {canAccess("users") ? "✅" : "❌"}</p>
      </div>

      {/* Policy-based authorization */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Policy-Based Authorization:</h4>
        <button
          onClick={checkPolicyAccess}
          disabled={loading}
          style={{ marginRight: "10px", padding: "8px 16px" }}
        >
          Check Policy Access (users:read)
        </button>
        <button
          onClick={checkSpecificPermission}
          disabled={loading}
          style={{ padding: "8px 16px" }}
        >
          Check Specific Permission (users:write)
        </button>

        {policyResult && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
            }}
          >
            <pre>{JSON.stringify(policyResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Usage examples */}
      <div>
        <h4>Usage Examples:</h4>
        <div style={{ fontSize: "12px", fontFamily: "monospace" }}>
          <p>
            <strong>Simple permission check:</strong>
          </p>
          <p>const hasAccess = hasPermission('users:read');</p>

          <p>
            <strong>Role check:</strong>
          </p>
          <p>const isAdmin = hasRole('admin');</p>

          <p>
            <strong>Resource access check:</strong>
          </p>
          <p>const canReadUsers = canAccess('users', 'read');</p>

          <p>
            <strong>Policy-based check:</strong>
          </p>
          <p>
            const result = await canAccessWithPolicy('users', 'write', &#123;
            tenantId: '123' &#125;);
          </p>

          <p>
            <strong>Direct API call:</strong>
          </p>
          <p>
            const result = await AuthorizationAPI.evaluatePolicy(token, 'users',
            'read');
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationExample;
