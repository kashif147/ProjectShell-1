import React from "react";
import { Button, Tooltip } from "antd";
import { useAuthorization } from "../../context/AuthorizationContext";

// Authorized Button Component
export const AuthorizedButton = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAllPermissions = false,
  requireAllRoles = false,
  disabled = false,
  tooltip = "You don't have permission to perform this action",
  onClick,
  ...buttonProps
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  } = useAuthorization();

  // Check permissions
  let hasRequiredPermission = true;
  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasRequiredPermission = requireAllPermissions
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Check roles
  let hasRequiredRole = true;
  if (role) {
    hasRequiredRole = hasRole(role);
  } else if (roles.length > 0) {
    hasRequiredRole = requireAllRoles ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  const isAuthorized = hasRequiredPermission && hasRequiredRole;
  const isDisabled = disabled || !isAuthorized;

  const buttonElement = (
    <Button
      {...buttonProps}
      disabled={isDisabled}
      onClick={isAuthorized ? onClick : undefined}
    >
      {children}
    </Button>
  );

  if (!isAuthorized && tooltip) {
    return <Tooltip title={tooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
};

// Authorized Action Component (for any clickable element)
export const AuthorizedAction = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAllPermissions = false,
  requireAllRoles = false,
  disabled = false,
  tooltip = "You don't have permission to perform this action",
  onClick,
  fallback = null,
  ...props
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  } = useAuthorization();

  // Check permissions
  let hasRequiredPermission = true;
  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasRequiredPermission = requireAllPermissions
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Check roles
  let hasRequiredRole = true;
  if (role) {
    hasRequiredRole = hasRole(role);
  } else if (roles.length > 0) {
    hasRequiredRole = requireAllRoles ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  const isAuthorized = hasRequiredPermission && hasRequiredRole;

  if (!isAuthorized) {
    return fallback;
  }

  return (
    <div
      {...props}
      onClick={disabled ? undefined : onClick}
      style={{
        ...props.style,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </div>
  );
};

// Authorized Link Component
export const AuthorizedLink = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAllPermissions = false,
  requireAllRoles = false,
  disabled = false,
  tooltip = "You don't have permission to access this link",
  onClick,
  href,
  ...linkProps
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  } = useAuthorization();

  // Check permissions
  let hasRequiredPermission = true;
  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasRequiredPermission = requireAllPermissions
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Check roles
  let hasRequiredRole = true;
  if (role) {
    hasRequiredRole = hasRole(role);
  } else if (roles.length > 0) {
    hasRequiredRole = requireAllRoles ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  const isAuthorized = hasRequiredPermission && hasRequiredRole;
  const isDisabled = disabled || !isAuthorized;

  const linkElement = (
    <a
      {...linkProps}
      href={isAuthorized && !disabled ? href : undefined}
      onClick={isAuthorized && !disabled ? onClick : undefined}
      style={{
        ...linkProps.style,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        textDecoration: isDisabled ? "none" : linkProps.style?.textDecoration,
      }}
    >
      {children}
    </a>
  );

  if (!isAuthorized && tooltip) {
    return <Tooltip title={tooltip}>{linkElement}</Tooltip>;
  }

  return linkElement;
};

// Higher-order component for wrapping any component with authorization
export const withAuthorization = (WrappedComponent, authConfig = {}) => {
  return function AuthorizedComponent(props) {
    const {
      permission,
      permissions = [],
      role,
      roles = [],
      requireAllPermissions = false,
      requireAllRoles = false,
      fallback = null,
      ...otherProps
    } = authConfig;

    const {
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      hasAllRoles,
    } = useAuthorization();

    // Check permissions
    let hasRequiredPermission = true;
    if (permission) {
      hasRequiredPermission = hasPermission(permission);
    } else if (permissions.length > 0) {
      hasRequiredPermission = requireAllPermissions
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    // Check roles
    let hasRequiredRole = true;
    if (role) {
      hasRequiredRole = hasRole(role);
    } else if (roles.length > 0) {
      hasRequiredRole = requireAllRoles
        ? hasAllRoles(roles)
        : hasAnyRole(roles);
    }

    const isAuthorized = hasRequiredPermission && hasRequiredRole;

    if (!isAuthorized) {
      return fallback;
    }

    return <WrappedComponent {...props} {...otherProps} />;
  };
};

// Higher-order component for permission-based rendering
export const PermissionWrapper = (WrappedComponent, requiredPermission) => {
  return function PermissionWrapperComponent(props) {
    const { hasPermission } = useAuthorization();

    if (!hasPermission(requiredPermission)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

// Higher-order component for role-based rendering
export const RoleWrapper = (WrappedComponent, requiredRole) => {
  return function RoleWrapperComponent(props) {
    const { hasRole } = useAuthorization();

    if (!hasRole(requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthorizedButton;
