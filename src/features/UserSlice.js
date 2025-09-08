import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { insertDataFtn, deleteFtn, baseURL } from "../utils/Utilities";

// Async thunks
export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      // For now, return sample data since API might not be available
      const { getAllUsersList } = await import("../constants/Users");
      return getAllUsersList();

      // Uncomment below when API is ready
      // const token = localStorage.getItem("token");
      // const response = await fetch(`${baseURL}/api/users`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to fetch users");
      // }

      // const data = await response.json();
      // return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignRolesToUser = createAsyncThunk(
  "users/assignRoles",
  async ({ userId, roleIds }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/users/${userId}/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign roles");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserDetails = createAsyncThunk(
  "users/getUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  usersLoading: false,
  error: null,
  searchQuery: "",
  selectedTenant: "all",
  selectedUserType: "all",
  selectedStatus: "all",
  selectedRole: "all",
  userDetails: null,
  userDetailsLoading: false,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedTenant: (state, action) => {
      state.selectedTenant = action.payload;
    },
    setSelectedUserType: (state, action) => {
      state.selectedUserType = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.usersLoading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Assign roles to user
      .addCase(assignRolesToUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(assignRolesToUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(assignRolesToUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Get user details
      .addCase(getUserDetails.pending, (state) => {
        state.userDetailsLoading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetails = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.userDetailsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setSelectedTenant,
  setSelectedUserType,
  setSelectedStatus,
  setSelectedRole,
  clearError,
  clearUserDetails,
} = userSlice.actions;
export default userSlice.reducer;
