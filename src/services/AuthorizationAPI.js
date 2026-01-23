// API service for authorization-related calls using existing JWT and policy endpoints
const API_BASE_URL = process.env.REACT_APP_POLICY_SERVICE_URL;

class AuthorizationAPI {
  // Decode JWT token to extract user data
  static decodeToken(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Extract permissions and roles from JWT token
  static extractUserData(token) {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      return { permissions: [], roles: [], user: null };
    }

    const rawRoles = decodedToken.roles || [];
    const rawPermissions = decodedToken.permissions || [];

    // Convert role objects to role codes
    const roles = rawRoles.map((role) => {
      if (typeof role === "string") return role;
      return role.code || role.name || role;
    });

    return {
      permissions: rawPermissions,
      roles: roles,
      user: {
        id: decodedToken.sub || decodedToken.id,
        email: decodedToken.email,
        userType: decodedToken.userType,
        tenantId: decodedToken.tenantId,
      },
    };
  }

  // Fetch all permission definitions from the API (using policy endpoint)
  static async fetchPermissionDefinitions(token) {
    try {
      // Use policy endpoint to get effective permissions for a general resource
      const response = await fetch(
        `${API_BASE_URL}/policy/permissions/system`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const data = await response.json();
      return data.permissions || data.definitions || []; // Handle different response formats
    } catch (error) {
      console.error("Error fetching permission definitions:", error);
      // Fallback: return empty array if policy endpoint fails
      return [];
    }
  }

  // Fetch all role definitions from the API (using policy endpoint)
  static async fetchRoleDefinitions(token) {
    try {
      // Use policy endpoint to get role information
      const response = await fetch(`${API_BASE_URL}/policy/permissions/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data = await response.json();
      return data.roles || data.definitions || []; // Handle different response formats
    } catch (error) {
      console.error("Error fetching role definitions:", error);
      // Fallback: return empty array if policy endpoint fails
      return [];
    }
  }

  // Fetch user's specific permissions and roles (from JWT token)
  static async fetchUserPermissions(token) {
    try {
      // Extract data directly from JWT token instead of making API call
      const userData = this.extractUserData(token);
      return userData;
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      return { permissions: [], roles: [], user: null };
    }
  }

  // Check if user has specific permission (using policy endpoint)
  static async checkPermission(token, permission) {
    try {
      // Parse permission format (e.g., "users:read" -> resource="users", action="read")
      const [resource, action] = permission.includes(":")
        ? permission.split(":")
        : [permission, "read"];

      const response = await fetch(
        `${API_BASE_URL}/policy/check/${resource}/${action}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check permission: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  // Check if user has specific role (from JWT token)
  static async checkRole(token, role) {
    try {
      // Extract roles from JWT token
      const userData = this.extractUserData(token);
      return userData.roles.includes(role);
    } catch (error) {
      console.error("Error checking role:", error);
      return false;
    }
  }

  // Fetch route permissions configuration from API (using policy endpoint)
  static async fetchRoutePermissions(token) {
    try {
      // Use policy endpoint to get route-specific permissions
      const response = await fetch(
        `${API_BASE_URL}/policy/permissions/routes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch route permissions: ${response.status}`
        );
      }

      const data = await response.json();
      return data.routePermissions || data.permissions || {}; // Handle different response formats
    } catch (error) {
      console.error("Error fetching route permissions:", error);
      // Fallback: return empty object if policy endpoint fails
      return {};
    }
  }

  // Consolidated API call to fetch all authorization data
  static async fetchAllAuthorizationData(token) {
    try {
      // Extract user data from JWT token
      const userData = this.extractUserData(token);

      // Fetch permission and role definitions using policy endpoints
      const [permissionDefinitions, roleDefinitions, routePermissions] =
        await Promise.allSettled([
          this.fetchPermissionDefinitions(token),
          this.fetchRoleDefinitions(token),
          this.fetchRoutePermissions(token),
        ]);

      return {
        permissions: userData.permissions || [],
        roles: userData.roles || [],
        permissionDefinitions:
          permissionDefinitions.status === "fulfilled"
            ? permissionDefinitions.value
            : [],
        roleDefinitions:
          roleDefinitions.status === "fulfilled" ? roleDefinitions.value : [],
        routePermissions:
          routePermissions.status === "fulfilled" ? routePermissions.value : {},
        user: userData.user || null,
      };
    } catch (error) {
      console.error("Error fetching all authorization data:", error);
      // Return minimal data structure on error
      const userData = this.extractUserData(token);
      return {
        permissions: userData.permissions || [],
        roles: userData.roles || [],
        permissionDefinitions: [],
        roleDefinitions: [],
        routePermissions: {},
        user: userData.user || null,
      };
    }
  }

  // Refresh user's permissions (useful after role changes)
  static async refreshUserPermissions(token) {
    try {
      // Since permissions are in JWT token, we just need to re-extract them
      // In a real scenario, you might need to refresh the token itself
      const userData = this.extractUserData(token);
      return {
        permissions: userData.permissions || [],
        roles: userData.roles || [],
        user: userData.user || null,
      };
    } catch (error) {
      console.error("Error refreshing user permissions:", error);
      return { permissions: [], roles: [], user: null };
    }
  }

  // Policy evaluation method using existing policy endpoint
  static async evaluatePolicy(token, resource, action, context = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/policy/evaluate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, resource, action, context }),
      });

      if (!response.ok) {
        throw new Error(`Failed to evaluate policy: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error evaluating policy:", error);
      return {
        success: false,
        decision: "DENY",
        reason: "NETWORK_ERROR",
        error: error.message,
      };
    }
  }
}

export default AuthorizationAPI;
