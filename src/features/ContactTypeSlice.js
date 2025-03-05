/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Fetch all contact types
export const getContactTypes = createAsyncThunk(
  "contactType/getContactTypes",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseURL}/contacttype`, // Update the API endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "ContactType API Response");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contact types"
      );
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getContactTypes.pending, (state) => {
        state.contactTypesloading = true;
        state.error = null;
      })
      .addCase(getContactTypes.fulfilled, (state, action) => {
        state.contactTypesloading = false;
        state.contactTypes = action.payload;
      })
      .addCase(getContactTypes.rejected, (state, action) => {
        state.contactTypesloading = false;
        state.error = action.payload;
      });
  },
});

export default contactTypeSlice.reducer;
