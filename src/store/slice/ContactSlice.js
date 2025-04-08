/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../utils/Utilities";

// Fetch all contacts
export const getContacts = createAsyncThunk(
  "contact/getContacts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // console.log(response.data, "Contact API Response");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        // error.response?.data?.message || "Failed to fetch contacts"
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
        state.contacts = action.payload;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.error = action.payload;
      });
  },
});

export default contactSlice.reducer;
