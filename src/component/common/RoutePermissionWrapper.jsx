import React from "react";
import { useAuthorization } from "../../context/AuthorizationContext";

// Component to wrap routes with dynamic permission checking
const RoutePermissionWrapper = ({ path, children }) => {
  const { getRoutePermissions, loading } = useAuthorization();

  // Get route permissions from API
  const routePermissions = getRoutePermissions(path);

  // If still loading, show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <div>Loading permissions...</div>
      </div>
    );
  }

  // Clone children and pass route permissions as props
  return React.cloneElement(children, {
    ...children.props,
    routePermissions,
  });
};

export default RoutePermissionWrapper;
