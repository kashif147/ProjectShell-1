/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Fetch all contacts
export const getContacts = createAsyncThunk(
  "contact/getContacts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = baseURL || process.env.REACT_APP_POLICY_SERVICE_URL;

      if (!apiBaseUrl) {
        return rejectWithValue("API base URL is not configured");
      }

      const response = await axios.get(`${apiBaseUrl}/api/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // console.log(response.data, "Contact API Response");
      return response.data;
    } catch (error) {
      // Silently handle 500 errors - backend may be temporarily unavailable
      if (error.response?.status === 500) {
        console.warn("Contacts service temporarily unavailable");
        return { data: [] };
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contacts"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { contact } = getState();
      // Don't dispatch if already loading
      if (contact.contactsLoading) {
        return false; // Prevent duplicate request
      }
      // Don't retry if there's a recent error (within last 30 seconds) - prevents infinite loops on CORS errors
      if (contact.error && contact.lastErrorTime) {
        const timeSinceError = Date.now() - contact.lastErrorTime;
        if (timeSinceError < 30000) {
          return false; // Prevent retry on recent error
        }
      }
      // Allow fetch if data doesn't exist or is empty
      if (!contact.contacts || contact.contacts.length === 0) {
        return true; // Allow fetch
      }
      // Prevent if data already exists
      return false;
    },
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    contacts: [],
    contactsLoading: false,
    error: null,
    lastErrorTime: null,
  },
  reducers: {
    resetContacts: (state) => {
      state.contacts = [];
      state.contactsLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getContacts.pending, (state) => {
        state.contactsLoading = true;
        // Don't clear error on pending - keep it to prevent retries
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.contactsLoading = false;
        state.contacts = action.payload.data;
        state.error = null;
        state.lastErrorTime = null;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.error = action.payload;
        state.lastErrorTime = Date.now();
      });
  },
});

export const { resetContacts } = contactSlice.actions;
export default contactSlice.reducer;
