import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import AuthorizationAPI from "../services/AuthorizationAPI";

const AuthorizationContext = createContext();

// Action types
const AUTH_ACTIONS = {
  SET_USER_DATA: "SET_USER_DATA",
  SET_PERMISSIONS: "SET_PERMISSIONS",
  SET_ROLES: "SET_ROLES",
  SET_PERMISSION_DEFINITIONS: "SET_PERMISSION_DEFINITIONS",
  SET_ROLE_DEFINITIONS: "SET_ROLE_DEFINITIONS",
  SET_ROUTE_PERMISSIONS: "SET_ROUTE_PERMISSIONS",
  SET_ALL_AUTHORIZATION_DATA: "SET_ALL_AUTHORIZATION_DATA",
  CLEAR_AUTH: "CLEAR_AUTH",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_INITIALIZED: "SET_INITIALIZED",
};

// Initial state
const initialState = {
  user: null,
  roles: [],
  permissions: [],
  permissionDefinitions: [], // Dynamic permission definitions from API
  roleDefinitions: [], // Dynamic role definitions from API
  routePermissions: {}, // Dynamic route permissions from API
  loading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false, // Track if auth context has been initialized
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER_DATA:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ROLES:
      return {
        ...state,
        roles: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_PERMISSION_DEFINITIONS:
      return {
        ...state,
        permissionDefinitions: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ROLE_DEFINITIONS:
      return {
        ...state,
        roleDefinitions: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ROUTE_PERMISSIONS:
      return {
        ...state,
        routePermissions: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ALL_AUTHORIZATION_DATA:
      return {
        ...state,
        permissions: action.payload.permissions || [],
        roles: action.payload.roles || [],
        permissionDefinitions: action.payload.permissionDefinitions || [],
        roleDefinitions: action.payload.roleDefinitions || [],
        routePermissions: action.payload.routePermissions || {},
        user: action.payload.user || state.user,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_AUTH:
      return {
        ...initialState,
        isInitialized: true, // Keep initialized true even after clearing auth
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthorizationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load all authorization data from API in one call
  const loadAllAuthorizationData = useCallback(async (token) => {
    try {
      console.log(
        "AuthorizationContext - loadAllAuthorizationData called with token:",
        token ? "exists" : "missing"
      );
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      console.log(
        "AuthorizationContext - Fetching authorization data from API..."
      );
      const data = await AuthorizationAPI.fetchAllAuthorizationData(token);

      console.log("AuthorizationContext - API Response:", data);

      dispatch({
        type: AUTH_ACTIONS.SET_ALL_AUTHORIZATION_DATA,
        payload: data,
      });

      console.log("AuthorizationContext - API data loaded and dispatched");
    } catch (error) {
      console.error("Error loading authorization data:", error);
      // Fallback to individual calls if consolidated call fails
      try {
        await Promise.all([
          loadPermissionDefinitions(token),
          loadRoleDefinitions(token),
          loadRoutePermissions(token),
        ]);
      } catch (fallbackError) {
        console.error(
          "Error in fallback authorization loading:",
          fallbackError
        );
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      }
    }
  }, []);

  // Clear authentication
  const clearAuth = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_AUTH });
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRoles");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("refresh_token");
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log("AuthorizationContext - useEffect triggered");
    console.log("AuthorizationContext - Current state:", state);

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    const userRoles = localStorage.getItem("userRoles");
    const userPermissions = localStorage.getItem("userPermissions");
    const tokenExpiry = localStorage.getItem("token_expiry");

    console.log("AuthorizationContext - LocalStorage Debug:", {
      token: token ? "exists" : "missing",
      userData: userData ? "exists" : "missing",
      userRoles: userRoles ? "exists" : "missing",
      userPermissions: userPermissions ? "exists" : "missing",
      tokenExpiry: tokenExpiry ? "exists" : "missing",
      allKeys: Object.keys(localStorage),
      allLocalStorageData: Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {}),
    });

    // Check if token is expired
    if (tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      const currentTime = Date.now();
      if (currentTime >= expiryTime) {
        console.log("AuthorizationContext - Token expired, clearing auth");
        clearAuth();
        return;
      }
    }

    // Also check JWT token expiry as backup
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decodedToken = JSON.parse(jsonPayload);

        if (decodedToken.exp) {
          const tokenExpiryTime = decodedToken.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          if (currentTime >= tokenExpiryTime) {
            console.log(
              "AuthorizationContext - JWT token expired, clearing auth"
            );
            clearAuth();
            return;
          }
        }
      } catch (error) {
        console.error("AuthorizationContext - Error decoding token:", error);
        clearAuth();
        return;
      }
    }

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);

        // Try to get permissions and roles from multiple sources
        let finalPermissions = [];
        let finalRoles = [];

        // First try from userData
        console.log("Raw userData string:", userData);
        console.log("Parsed userData object:", parsedUserData);
        console.log("userData.permissions:", parsedUserData.permissions);
        console.log("userData.roles:", parsedUserData.roles);
        console.log("permissions length:", parsedUserData.permissions?.length);
        console.log("roles length:", parsedUserData.roles?.length);

        // Force extraction regardless of length check
        finalPermissions = parsedUserData.permissions || [];
        finalRoles = parsedUserData.roles || [];

        console.log("FORCED EXTRACTION - finalPermissions:", finalPermissions);
        console.log("FORCED EXTRACTION - finalRoles:", finalRoles);

        // If empty, try separate localStorage keys
        if (finalPermissions.length === 0 && userPermissions) {
          try {
            finalPermissions = JSON.parse(userPermissions);
          } catch (e) {
            console.log("Could not parse userPermissions:", e);
          }
        }

        if (finalRoles.length === 0 && userRoles) {
          try {
            finalRoles = JSON.parse(userRoles);
          } catch (e) {
            console.log("Could not parse userRoles:", e);
          }
        }

        // Convert roles array to role codes if needed
        const roleCodes = finalRoles.map((role) => {
          if (typeof role === "string") return role;
          const roleCode = role.code || role.name || role;
          console.log("Converting role:", role, "to code:", roleCode);
          return roleCode;
        });

        console.log("Final extracted data:", {
          finalPermissions,
          finalRoles,
          roleCodes,
        });

        console.log("AuthorizationContext Debug:", {
          rawUserData: userData,
          parsedUserData: parsedUserData,
          finalPermissions: finalPermissions,
          finalRoles: finalRoles,
          roleCodes: roleCodes,
        });

        console.log("AuthorizationContext - Dispatching actions...");

        dispatch({
          type: AUTH_ACTIONS.SET_USER_DATA,
          payload: parsedUserData,
        });

        dispatch({
          type: AUTH_ACTIONS.SET_PERMISSIONS,
          payload: finalPermissions,
        });

        dispatch({
          type: AUTH_ACTIONS.SET_ROLES,
          payload: roleCodes,
        });

        console.log(
          "AuthorizationContext - Actions dispatched, loading API data..."
        );

        // Fetch all authorization data in one call
        loadAllAuthorizationData(token);
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        clearAuth();
      }
    }

    // Mark initialization as complete
    dispatch({ type: AUTH_ACTIONS.SET_INITIALIZED, payload: true });
  }, [loadAllAuthorizationData]);

  // Load permission definitions from API (fallback)
  const loadPermissionDefinitions = async (token) => {
    try {
      const permissions = await AuthorizationAPI.fetchPermissionDefinitions(
        token
      );
      dispatch({
        type: AUTH_ACTIONS.SET_PERMISSION_DEFINITIONS,
        payload: permissions,
      });
    } catch (error) {
      console.error("Error loading permission definitions:", error);
      throw error;
    }
  };

  // Load role definitions from API (fallback)
  const loadRoleDefinitions = async (token) => {
    try {
      const roles = await AuthorizationAPI.fetchRoleDefinitions(token);
      dispatch({
        type: AUTH_ACTIONS.SET_ROLE_DEFINITIONS,
        payload: roles,
      });
    } catch (error) {
      console.error("Error loading role definitions:", error);
      throw error;
    }
  };

  // Load route permissions from API (fallback)
  const loadRoutePermissions = async (token) => {
    try {
      const routePermissions = await AuthorizationAPI.fetchRoutePermissions(
        token
      );
      dispatch({
        type: AUTH_ACTIONS.SET_ROUTE_PERMISSIONS,
        payload: routePermissions,
      });
    } catch (error) {
      console.error("Error loading route permissions:", error);
      throw error;
    }
  };

  // Set user data and permissions
  const setUserData = async (userData, roles = [], permissions = []) => {
    console.log("AuthorizationContext - setUserData called with:", {
      userData,
      roles,
      permissions,
    });

    dispatch({ type: AUTH_ACTIONS.SET_USER_DATA, payload: userData });
    dispatch({ type: AUTH_ACTIONS.SET_ROLES, payload: roles });
    dispatch({ type: AUTH_ACTIONS.SET_PERMISSIONS, payload: permissions });

    // Store in localStorage
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("userRoles", JSON.stringify(roles));
    localStorage.setItem("userPermissions", JSON.stringify(permissions));

    // Fetch all authorization data
    const token = localStorage.getItem("token");
    if (token) {
      await loadAllAuthorizationData(token);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!state.permissions || state.permissions.length === 0) return false;
    return state.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return hasPermission(permissions);
    return permissions.some((permission) => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return hasPermission(permissions);
    return permissions.every((permission) => hasPermission(permission));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!state.roles || state.roles.length === 0) return false;
    return state.roles.includes(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!Array.isArray(roles)) return hasRole(roles);
    return roles.some((role) => hasRole(role));
  };

  // Check if user has all of the specified roles
  const hasAllRoles = (roles) => {
    if (!Array.isArray(roles)) return hasRole(roles);
    return roles.every((role) => hasRole(role));
  };

  // Get user's permissions by category
  const getPermissionsByCategory = (category) => {
    if (!state.permissions) return [];
    return state.permissions.filter((permission) =>
      permission.startsWith(`${category}:`)
    );
  };

  // Check if user can access a specific resource
  const canAccess = (resource, action = "read") => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission) || hasPermission("read:all");
  };

  // Policy-based authorization check using existing policy endpoint
  const canAccessWithPolicy = async (
    resource,
    action = "read",
    context = {}
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const result = await AuthorizationAPI.evaluatePolicy(
        token,
        resource,
        action,
        context
      );
      return result.success || false;
    } catch (error) {
      console.error("Policy evaluation failed:", error);
      // Fallback to simple permission check
      return canAccess(resource, action);
    }
  };

  // Get permission definition by key
  const getPermissionDefinition = (permissionKey) => {
    return state.permissionDefinitions.find((p) => p.key === permissionKey);
  };

  // Get role definition by key
  const getRoleDefinition = (roleKey) => {
    return state.roleDefinitions.find((r) => r.key === roleKey);
  };

  // Get permissions by category (from dynamic definitions)
  const getPermissionsByCategoryFromAPI = (category) => {
    return state.permissionDefinitions.filter((p) => p.category === category);
  };

  // Refresh all authorization data
  const refreshDefinitions = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await loadAllAuthorizationData(token);
    }
  };

  // Get route permissions for a specific path
  const getRoutePermissions = (path) => {
    return (
      state.routePermissions[path] || {
        permissions: [],
        roles: [],
      }
    );
  };

  // Check if user can access a specific route
  const canAccessRoute = (path) => {
    const routeConfig = getRoutePermissions(path);

    // If no permissions/roles required, allow access
    if (
      routeConfig.permissions.length === 0 &&
      routeConfig.roles.length === 0
    ) {
      return true;
    }

    // Check permissions
    const hasRequiredPermission =
      routeConfig.permissions.length === 0 ||
      routeConfig.permissions.some((permission) =>
        state.permissions.includes(permission)
      );

    // Check roles
    const hasRequiredRole =
      routeConfig.roles.length === 0 ||
      routeConfig.roles.some((role) => state.roles.includes(role));

    return hasRequiredPermission && hasRequiredRole;
  };

  const value = {
    ...state,
    setUserData,
    clearAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getPermissionsByCategory,
    canAccess,
    canAccessWithPolicy,
    getPermissionDefinition,
    getRoleDefinition,
    getPermissionsByCategoryFromAPI,
    refreshDefinitions,
    getRoutePermissions,
    canAccessRoute,
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
};

// Custom hook to use authorization context
export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);
  if (!context) {
    throw new Error(
      "useAuthorization must be used within an AuthorizationProvider"
    );
  }
  return context;
};

// Higher-order component for permission-based rendering
export const withPermission = (WrappedComponent, requiredPermission) => {
  return function PermissionWrapper(props) {
    const { hasPermission } = useAuthorization();

    if (!hasPermission(requiredPermission)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

// Higher-order component for role-based rendering
export const withRole = (WrappedComponent, requiredRole) => {
  return function RoleWrapper(props) {
    const { hasRole } = useAuthorization();

    if (!hasRole(requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthorizationContext;
