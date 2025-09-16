import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { insertDataFtn, deleteFtn, baseURL } from "../utils/Utilities";

// Async thunks
export const getAllPermissions = createAsyncThunk(
  "permissions/getAllPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPermission = createAsyncThunk(
  "permissions/addPermission",
  async (permissionData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(permissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to add permission");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePermission = createAsyncThunk(
  "permissions/updatePermission",
  async ({ id, updatedPermission }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/permissions/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPermission),
      });

      if (!response.ok) {
        throw new Error("Failed to update permission");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePermission = createAsyncThunk(
  "permissions/deletePermission",
  async (permissionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseURL}/api/permissions/${permissionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete permission");
      }

      return permissionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  permissions: [],
  permissionsLoading: false,
  error: null,
  searchQuery: "",
  selectedCategory: "all",
  selectedAction: "all",
  selectedLevel: "all",
  selectedStatus: "all",
};

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedAction: (state, action) => {
      state.selectedAction = action.payload;
    },
    setSelectedLevel: (state, action) => {
      state.selectedLevel = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all permissions
      .addCase(getAllPermissions.pending, (state) => {
        state.permissionsLoading = true;
        state.error = null;
      })
      .addCase(getAllPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = action.payload;
      })
      .addCase(getAllPermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload;
      })

      // Add permission
      .addCase(addPermission.pending, (state) => {
        state.permissionsLoading = true;
        state.error = null;
      })
      .addCase(addPermission.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions.push(action.payload);
      })
      .addCase(addPermission.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload;
      })

      // Update permission
      .addCase(updatePermission.pending, (state) => {
        state.permissionsLoading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        const index = state.permissions.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload;
      })

      // Delete permission
      .addCase(deletePermission.pending, (state) => {
        state.permissionsLoading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = state.permissions.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSelectedAction,
  setSelectedLevel,
  setSelectedStatus,
  clearError,
} = permissionSlice.actions;
export default permissionSlice.reducer;
