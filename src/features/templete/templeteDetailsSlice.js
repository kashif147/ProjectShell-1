// src/redux/templeteDetailsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Async thunk to fetch template details
export const loadtempletedetails = createAsyncThunk(
  "templeteDetails/loadtempletedetails",
  async (templateId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // if auth required
      const response = await axios.get(`${process.env.REACT_APP_CUMM}/templates/${templateId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      return response.data?.data?.template;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch template details" }
      );
    }
  }
);

const templeteDetailsSlice = createSlice({
  name: "templeteDetails",
  initialState: {
    templeteData: null,
    templetedetailsloading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadtempletedetails.pending, (state) => {
        state.templetedetailsloading = true;
        state.error = null;
      })
      .addCase(loadtempletedetails.fulfilled, (state, action) => {
        state.templetedetailsloading = false;
        state.templeteData = action.payload;
      })
      .addCase(loadtempletedetails.rejected, (state, action) => {
        state.templetedetailsloading = false;
        state.error = action.payload?.message || "Error loading template details";
      });
  },
});

export default templeteDetailsSlice.reducer;
