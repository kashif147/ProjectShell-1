/** @format */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Async thunk to fetch contact types
export const getContactTypes = createAsyncThunk(
  "contactType/getContactTypes",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/api/contact-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Make sure to adjust this if the API wraps the data
      return response.data; // Or response.data.data if needed
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
  {
    condition: (_, { getState }) => {
      const { contactType } = getState();
      // Don't dispatch if already loading
      if (contactType.contactTypesloading) {
        return false; // Prevent duplicate request
      }
      // Don't retry if there's a recent error (within last 30 seconds) - prevents infinite loops on CORS errors
      if (contactType.error && contactType.lastErrorTime) {
        const timeSinceError = Date.now() - contactType.lastErrorTime;
        if (timeSinceError < 30000) {
          return false; // Prevent retry on recent error
        }
      }
      // Allow fetch if data doesn't exist or is empty
      if (!contactType.contactTypes || contactType.contactTypes.length === 0) {
        return true; // Allow fetch
      }
      // Prevent if data already exists
      return false;
    },
  }
);

const contactTypeSlice = createSlice({
  name: "contactType",
  initialState: {
    contactTypes: [],
    contactTypesloading: false,
    error: null,
    lastErrorTime: null,
  },
  reducers: {
    resetContactTypes: (state) => {
      state.contactTypes = [];
      state.contactTypesloading = false;
      state.error = null;
      state.lastErrorTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getContactTypes.pending, (state) => {
        state.contactTypesloading = true;
        // Don't clear error on pending - keep it to prevent retries
      })
      .addCase(getContactTypes.fulfilled, (state, action) => {
        state.contactTypesloading = false;
        state.contactTypes = action.payload?.data;
        state.error = null;
        state.lastErrorTime = null;
      })
      .addCase(getContactTypes.rejected, (state, action) => {
        state.contactTypesloading = false;
        state.error = action.payload;
        state.lastErrorTime = Date.now();
      });
  },
});

export const { resetContactTypes } = contactTypeSlice.actions;
export default contactTypeSlice.reducer;
