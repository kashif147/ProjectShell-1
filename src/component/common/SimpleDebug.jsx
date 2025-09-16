import React from "react";

const SimpleDebug = () => {
  const allKeys = Object.keys(localStorage);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "lightgreen",
        border: "2px solid green",
        padding: "10px",
        borderRadius: "4px",
        zIndex: 99999,
        maxWidth: "400px",
        fontSize: "12px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <h4>Simple Debug (No Context)</h4>
      <p>
        <strong>Timestamp:</strong> {new Date().toLocaleTimeString()}
      </p>
      <p>
        <strong>All Keys:</strong> {allKeys.join(", ")}
      </p>

      <h5>Key Data:</h5>
      <p>
        <strong>Token:</strong> {localStorage.getItem("token") ? "✓" : "✗"}
      </p>
      <p>
        <strong>UserData:</strong>{" "}
        {localStorage.getItem("userData") ? "✓" : "✗"}
      </p>
      <p>
        <strong>UserRoles:</strong>{" "}
        {localStorage.getItem("userRoles") ? "✓" : "✗"}
      </p>
      <p>
        <strong>UserPermissions:</strong>{" "}
        {localStorage.getItem("userPermissions") ? "✓" : "✗"}
      </p>

      {localStorage.getItem("userData") && (
        <div>
          <h5>UserData Preview:</h5>
          <pre
            style={{
              fontSize: "10px",
              background: "#f5f5f5",
              padding: "5px",
              borderRadius: "3px",
            }}
          >
            {JSON.stringify(
              JSON.parse(localStorage.getItem("userData")),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimpleDebug;
