import React from "react";
import { useAuthorization } from "../context/AuthorizationContext";

// Component wrapper for permission-based rendering
export const PermissionWrapper = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    useAuthorization();

  // If single permission is provided
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback;
    }
  }

  // If multiple permissions are provided
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return fallback;
    }
  }

  return children;
};

// Component wrapper for role-based rendering
export const RoleWrapper = ({
  children,
  role,
  roles = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuthorization();

  // If single role is provided
  if (role) {
    if (!hasRole(role)) {
      return fallback;
    }
  }

  // If multiple roles are provided
  if (roles.length > 0) {
    const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);

    if (!hasAccess) {
      return fallback;
    }
  }

  return children;
};

// Higher-order component for permission-based access
export const withPermission = (
  WrappedComponent,
  requiredPermission,
  fallback = null
) => {
  return function PermissionHOC(props) {
    return (
      <PermissionWrapper permission={requiredPermission} fallback={fallback}>
        <WrappedComponent {...props} />
      </PermissionWrapper>
    );
  };
};

// Higher-order component for role-based access
export const withRole = (WrappedComponent, requiredRole, fallback = null) => {
  return function RoleHOC(props) {
    return (
      <RoleWrapper role={requiredRole} fallback={fallback}>
        <WrappedComponent {...props} />
      </RoleWrapper>
    );
  };
};

// Hook for conditional rendering based on permissions
export const usePermissionCheck = (
  permission,
  permissions = [],
  requireAll = false
) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    useAuthorization();

  if (permission) {
    return hasPermission(permission);
  }

  if (permissions.length > 0) {
    return requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return false;
};

// Hook for conditional rendering based on roles
export const useRoleCheck = (role, roles = [], requireAll = false) => {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuthorization();

  if (role) {
    return hasRole(role);
  }

  if (roles.length > 0) {
    return requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  return false;
};

export default PermissionWrapper;
