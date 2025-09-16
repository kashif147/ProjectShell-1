// API service for authorization-related calls
const API_BASE_URL = process.env.REACT_APP_BASE_URL_DEV;

class AuthorizationAPI {
  // Fetch all permission definitions from the API
  static async fetchPermissionDefinitions(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const data = await response.json();
      return data.permissions || data; // Handle different response formats
    } catch (error) {
      console.error("Error fetching permission definitions:", error);
      throw error;
    }
  }

  // Fetch all role definitions from the API
  static async fetchRoleDefinitions(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data = await response.json();
      return data.roles || data; // Handle different response formats
    } catch (error) {
      console.error("Error fetching role definitions:", error);
      throw error;
    }
  }

  // Fetch user's specific permissions and roles
  static async fetchUserPermissions(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user permissions: ${response.status}`);
      }

      const data = await response.json();
      return {
        permissions: data.permissions || [],
        roles: data.roles || [],
        user: data.user || null,
      };
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  }

  // Check if user has specific permission
  static async checkPermission(token, permission) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-permission`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check permission: ${response.status}`);
      }

      const data = await response.json();
      return data.hasPermission || false;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  // Check if user has specific role
  static async checkRole(token, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check role: ${response.status}`);
      }

      const data = await response.json();
      return data.hasRole || false;
    } catch (error) {
      console.error("Error checking role:", error);
      return false;
    }
  }

  // Fetch route permissions configuration from API
  static async fetchRoutePermissions(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/route-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch route permissions: ${response.status}`
        );
      }

      const data = await response.json();
      return data.routePermissions || data; // Handle different response formats
    } catch (error) {
      console.error("Error fetching route permissions:", error);
      throw error;
    }
  }

  // Consolidated API call to fetch all authorization data
  static async fetchAllAuthorizationData(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/all-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch authorization data: ${response.status}`
        );
      }

      const data = await response.json();
      return {
        permissions: data.permissions || [],
        roles: data.roles || [],
        permissionDefinitions: data.permissionDefinitions || [],
        roleDefinitions: data.roleDefinitions || [],
        routePermissions: data.routePermissions || {},
        user: data.user || null,
      };
    } catch (error) {
      console.error("Error fetching all authorization data:", error);
      throw error;
    }
  }

  // Refresh user's permissions (useful after role changes)
  static async refreshUserPermissions(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh permissions: ${response.status}`);
      }

      const data = await response.json();
      return {
        permissions: data.permissions || [],
        roles: data.roles || [],
        user: data.user || null,
      };
    } catch (error) {
      console.error("Error refreshing user permissions:", error);
      throw error;
    }
  }
}

export default AuthorizationAPI;
