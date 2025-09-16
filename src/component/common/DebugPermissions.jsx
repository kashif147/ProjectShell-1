import React from "react";
import { useAuthorization } from "../../context/AuthorizationContext";

const DebugPermissions = () => {
  // Always call the hook first, then handle errors
  const contextData = useAuthorization();

  // Manual localStorage check
  const localStorageData = {
    token: localStorage.getItem("token"),
    userData: localStorage.getItem("userData"),
    userRoles: localStorage.getItem("userRoles"),
    userPermissions: localStorage.getItem("userPermissions"),
    allKeys: Object.keys(localStorage),
  };

  // Check if context data is valid
  if (!contextData) {
    return (
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          background: "orange",
          border: "2px solid darkorange",
          padding: "10px",
          borderRadius: "4px",
          zIndex: 99999,
          maxWidth: "400px",
          fontSize: "12px",
        }}
      >
        <h4>No Context Data</h4>
        <p>AuthorizationContext returned null</p>
      </div>
    );
  }

  const { permissions, roles, user, loading, error } = contextData;

  if (loading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "yellow",
        border: "2px solid red",
        padding: "10px",
        borderRadius: "4px",
        zIndex: 99999,
        maxWidth: "400px",
        fontSize: "12px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <h4>Debug Permissions</h4>
      <p>
        <strong>User:</strong> {user?.name || user?.email || "Unknown"}
      </p>
      <p>
        <strong>Context Roles:</strong> {roles?.join(", ") || "None"}
      </p>
      <p>
        <strong>Context Permissions:</strong>
      </p>
      <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
        {permissions?.map((permission) => (
          <li key={permission}>{permission}</li>
        ))}
      </ul>

      <h5>LocalStorage Debug:</h5>
      <p>
        <strong>Token:</strong> {localStorageData.token ? "✓" : "✗"}
      </p>
      <p>
        <strong>UserData:</strong> {localStorageData.userData ? "✓" : "✗"}
      </p>
      <p>
        <strong>UserRoles:</strong> {localStorageData.userRoles ? "✓" : "✗"}
      </p>
      <p>
        <strong>UserPermissions:</strong>{" "}
        {localStorageData.userPermissions ? "✓" : "✗"}
      </p>
      <p>
        <strong>All Keys:</strong> {localStorageData.allKeys.join(", ")}
      </p>

      {localStorageData.userData && (
        <div>
          <h5>Raw UserData:</h5>
          <pre
            style={{
              fontSize: "10px",
              background: "#f5f5f5",
              padding: "5px",
              borderRadius: "3px",
            }}
          >
            {JSON.stringify(JSON.parse(localStorageData.userData), null, 2)}
          </pre>
        </div>
      )}

      {localStorageData.userRoles && (
        <div>
          <h5>Raw UserRoles:</h5>
          <pre
            style={{
              fontSize: "10px",
              background: "#f5f5f5",
              padding: "5px",
              borderRadius: "3px",
            }}
          >
            {JSON.stringify(JSON.parse(localStorageData.userRoles), null, 2)}
          </pre>
        </div>
      )}

      {localStorageData.userPermissions && (
        <div>
          <h5>Raw UserPermissions:</h5>
          <pre
            style={{
              fontSize: "10px",
              background: "#f5f5f5",
              padding: "5px",
              borderRadius: "3px",
            }}
          >
            {JSON.stringify(
              JSON.parse(localStorageData.userPermissions),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPermissions;
