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
  }
);

const contactTypeSlice = createSlice({
  name: "contactType",
  initialState: {
    contactTypes: [],
    contactTypesloading: false,
    error: null,
  },
  reducers: {
    resetContactTypes: (state) => {
      state.contactTypes = [];
      state.contactTypesloading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getContactTypes.pending, (state) => {
        state.contactTypesloading = true;
        state.error = null;
      })
      .addCase(getContactTypes.fulfilled, (state, action) => {
        state.contactTypesloading = false;
        state.contactTypes = action.payload?.data;
      })
      .addCase(getContactTypes.rejected, (state, action) => {
        state.contactTypesloading = false;
        state.error = action.payload;
      });
  },
});

export const { resetContactTypes } = contactTypeSlice.actions;
export default contactTypeSlice.reducer;
