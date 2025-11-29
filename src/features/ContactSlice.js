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
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    contacts: [],
    contactsLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getContacts.pending, (state) => {
        state.contactsLoading = true;
        state.error = null;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.contactsLoading = false;
        state.contacts = action.payload.data;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.error = action.payload;
      });
  },
});

export default contactSlice.reducer;
