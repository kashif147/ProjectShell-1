import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { insertDataFtn, deleteFtn } from "../utils/Utilities";

const baseURL = process.env.REACT_APP_POLICY_SERVICE_URL;

// Async thunks
export const getAllRoles = createAsyncThunk(
  "roles/getAllRoles",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();

      // Debug: Log the API response
      console.log("API Response:", data);

      // Handle different response formats
      if (data.status === "success") {
        // If API returns success message but no actual data, return empty array
        // This will trigger the fallback to sample data in the component
        console.log("API returned success status, data:", data.data);
        return data.data && Array.isArray(data.data) ? data.data : [];
      } else if (Array.isArray(data)) {
        // If API returns roles array directly
        console.log("API returned roles array directly:", data);
        return data;
      } else {
        // Fallback for other response formats
        console.log("API returned unexpected format, using fallback");
        return [];
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const addRole = createAsyncThunk(
  "roles/addRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error("Failed to add role");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, updatedRole }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/roles/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRole),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (roleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      return roleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignPermissionsToRole = createAsyncThunk(
  "roles/assignPermissions",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseURL}/api/roles/${roleId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissionIds }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign permissions");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  roles: [],
  rolesLoading: false,
  error: null,
  searchQuery: "",
  selectedTenant: "all",
  selectedStatus: "all",
  selectedCategory: "all",
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedTenant: (state, action) => {
      state.selectedTenant = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all roles
      .addCase(getAllRoles.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
      })
      .addCase(getAllRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      })

      // Add role
      .addCase(addRole.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles.push(action.payload);
      })
      .addCase(addRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      })

      // Update role
      .addCase(updateRole.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.rolesLoading = false;
        const index = state.roles.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      })

      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = state.roles.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      })

      // Assign permissions
      .addCase(assignPermissionsToRole.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(assignPermissionsToRole.fulfilled, (state, action) => {
        state.rolesLoading = false;
        const index = state.roles.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(assignPermissionsToRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setSelectedTenant,
  setSelectedStatus,
  setSelectedCategory,
  clearError,
} = roleSlice.actions;
export default roleSlice.reducer;
