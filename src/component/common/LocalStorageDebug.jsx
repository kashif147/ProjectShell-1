import React from "react";

const LocalStorageDebug = () => {
  const allKeys = Object.keys(localStorage);
  const allData = allKeys.reduce((acc, key) => {
    try {
      acc[key] = localStorage.getItem(key);
    } catch (e) {
      acc[key] = "Error reading key";
    }
    return acc;
  }, {});

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "420px", // Move to the right, leaving space for other debug components
        background: "white",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "4px",
        zIndex: 9999,
        maxWidth: "500px",
        fontSize: "12px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <h4>LocalStorage Debug</h4>
      <p>
        <strong>All Keys:</strong> {allKeys.join(", ")}
      </p>

      <h5>All Data:</h5>
      <pre
        style={{
          fontSize: "10px",
          background: "#f5f5f5",
          padding: "5px",
          borderRadius: "3px",
        }}
      >
        {JSON.stringify(allData, null, 2)}
      </pre>
    </div>
  );
};

export default LocalStorageDebug;
