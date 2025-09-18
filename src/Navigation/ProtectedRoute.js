import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import IdleModal from "../component/common/IdleModal";
import { useAuthorization } from "../context/AuthorizationContext";
import { Spin, Result, Button } from "antd";

const ProtectedRoute = ({
  children,
  requiredPermission = null,
  requiredRole = null,
  requiredPermissions = [],
  requiredRoles = [],
  requireAllPermissions = false,
  requireAllRoles = false,
  redirectTo = "/",
  unauthorizedComponent = null,
}) => {
  const {
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    loading,
    isInitialized,
  } = useAuthorization();

  const location = useLocation();
  const token = localStorage.getItem("token");

  // Debug logging
  console.log("ProtectedRoute Debug - token:", token ? "exists" : "missing");
  console.log("ProtectedRoute Debug - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute Debug - loading:", loading);
  console.log("ProtectedRoute Debug - isInitialized:", isInitialized);

  // Wait for initialization to complete before checking authentication
  if (!isInitialized) {
    console.log("ProtectedRoute Debug - Waiting for initialization...");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Check authentication only after initialization is complete
  if (!token || !isAuthenticated) {
    console.log("ProtectedRoute Debug - Redirecting to:", redirectTo);
    console.log("ProtectedRoute Debug - Current pathname:", location.pathname);
    console.log("ProtectedRoute Debug - Token exists:", !!token);
    console.log("ProtectedRoute Debug - isAuthenticated:", isAuthenticated);
    return <Navigate to={redirectTo} replace />;
  }

  // Show loading spinner while checking permissions
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      unauthorizedComponent || (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this resource."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      )
    );
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return (
        unauthorizedComponent || (
          <Result
            status="403"
            title="Access Denied"
            subTitle="You don't have the required permissions to access this resource."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            }
          />
        )
      );
    }
  }

  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      unauthorizedComponent || (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have the required role to access this resource."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      )
    );
  }

  // Check multiple roles
  if (requiredRoles.length > 0) {
    const hasAccess = requireAllRoles
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);

    if (!hasAccess) {
      return (
        unauthorizedComponent || (
          <Result
            status="403"
            title="Access Denied"
            subTitle="You don't have the required roles to access this resource."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            }
          />
        )
      );
    }
  }

  return (
    <>
      <IdleModal />
      {children || <Outlet />}
    </>
  );
};

export default ProtectedRoute;
