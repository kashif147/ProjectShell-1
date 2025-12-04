// features/roleByIdSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/roles`;

// 🔹 Get Role by ID
export const getRoleById = createAsyncThunk(
  "roleById/getRoleById",
  async (roleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${api}/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle both wrapped and direct API responses
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch role"
      );
    }
  }
);

const roleByIdSlice = createSlice({
  name: "roleById",
  initialState: {
    role1: null,
    roleLoading: false,
    error: null,
  },
  reducers: {
    clearRole: (state) => {
      state.role1 = null;
      state.error = null;
      state.roleLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRoleById.pending, (state) => {
        state.roleLoading = true;
        state.error = null;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.roleLoading = false;
        state.role1 = action.payload;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.roleLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRole } = roleByIdSlice.actions;
export default roleByIdSlice.reducer;
