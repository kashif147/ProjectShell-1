/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Fetch all partners
export const getPartners = createAsyncThunk(
  "partner/getPartners",
  async (profileId, { rejectWithValue }) => {
    // Phase A / A12: no hardcoded profile id - nothing to fetch without the caller's profile.
    if (!profileId) return [];
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
       `${baseURL}/partner/profile/${encodeURIComponent(profileId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch partners"
      );
    }
  }
);

const partnerSlice = createSlice({
  name: "partner",
  initialState: {
    partner: [],
    partnerloading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPartners.pending, (state) => {
        state.partnerloading = true;
        state.error = null;
      })
      .addCase(getPartners.fulfilled, (state, action) => {
        state.partnerloading = false;
        state.partner = action.payload;
      })
      .addCase(getPartners.rejected, (state, action) => {
        state.partnerloading = false;
        state.error = action.payload;
      });
  },
});

export default partnerSlice.reducer;


