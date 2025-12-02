import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Async thunk to fetch all templates with token
export const getTemplates = createAsyncThunk(
  "getTemplate/getTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // get token from localStorage

      const response = await axios.get(`${process.env.REACT_APP_CUMM}/templates`, {
        headers: {
          Authorization: `Bearer ${token}`, // pass token in header
        },
      });

      return response.data.data.templates; // The templates array
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const getTemplateSlice = createSlice({
  name: "getTemplate",
  initialState: {
    templates: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(getTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default getTemplateSlice.reducer;
