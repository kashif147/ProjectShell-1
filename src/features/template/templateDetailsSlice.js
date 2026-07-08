import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { communicationServicePath } from "../../utils/communicationServiceUrl";

// ✅ Async thunk to fetch template details
export const loadTemplateDetails = createAsyncThunk(
  "templateDetails/loadTemplateDetails",
  async (templateId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // if auth required
      const response = await axios.get(
        communicationServicePath(`templates/${templateId}`),
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        },
      );
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch template details" },
      );
    }
  },
);

const templateDetailsSlice = createSlice({
  name: "templateDetails",
  initialState: {
    templateData: null,
    templateDetailsLoading: false,
    error: null,
  },
  reducers: {
    resetTemplateDetails: (state) => {
      state.templateData = null;
      state.templateDetailsLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTemplateDetails.pending, (state) => {
        state.templateDetailsLoading = true;
        state.error = null;
      })
      .addCase(loadTemplateDetails.fulfilled, (state, action) => {
        state.templateDetailsLoading = false;
        state.templateData = action.payload;
      })
      .addCase(loadTemplateDetails.rejected, (state, action) => {
        state.templateDetailsLoading = false;
        state.error =
          action.payload?.message || "Error loading template details";
      });
  },
});

export const { resetTemplateDetails } = templateDetailsSlice.actions;
export default templateDetailsSlice.reducer;
