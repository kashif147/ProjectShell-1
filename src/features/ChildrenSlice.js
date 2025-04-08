/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Fetch all children
export const getChildren = createAsyncThunk(
  "children/getChildren",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseURL}/children/profile/67a1b268a203d65ec4a553e2`, // Update this endpoint as needed
        // `http://localhost:3500/children/profile/67a1b268a203d65ec4a553e2`, // Update this endpoint as needed
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
