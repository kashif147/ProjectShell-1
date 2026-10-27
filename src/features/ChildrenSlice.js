/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Fetch all children
export const getChildren = createAsyncThunk(
  "children/getChildren",
  async (profileId, { rejectWithValue }) => {
    // Phase A / A12: no hardcoded profile id - nothing to fetch without the caller's profile.
    if (!profileId) return [];
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseURL}/children/profile/${encodeURIComponent(profileId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "Children API Response");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch children"
      );
    }
  }
);

const childrenSlice = createSlice({
  name: "children",
  initialState: {
    children: [],
    childrenLoading: false,
    childrenError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getChildren.pending, (state) => {
        state.childrenLoading = true;
        state.error = null;
      })
      .addCase(getChildren.fulfilled, (state, action) => {
        state.childrenLoading = false;
        state.children = action.payload;
      })
      .addCase(getChildren.rejected, (state, action) => {
        state.childrenLoading = false;
        state.error = action.payload;
      });
  },
});

export default childrenSlice.reducer;
