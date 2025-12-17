import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for getting a single transfer request by ID
export const getTransferRequestById = createAsyncThunk(
  "transferRequestDetails/getById",
  async (transferRequestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/transfer-request/${transferRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API RESPONSE for ID:", transferRequestId, response.data);
      return response.data;
    } catch (error) {
      console.log("API ERROR for ID:", transferRequestId, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const transferRequestDetailsSlice = createSlice({
  name: "transferRequestDetails",
  initialState: {
    transferRequestDetail: null,  // Changed from 'data' to 'transferRequestDetail'
    loading: false,
    error: null,
  },
  reducers: {
    // Clear data when component unmounts
    clearTransferRequestDetails: (state) => {
      state.transferRequestDetail = null;  // Updated
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get single transfer request by ID
      .addCase(getTransferRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransferRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.transferRequestDetail = action.payload;  // Updated
      })
      .addCase(getTransferRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearTransferRequestDetails } = transferRequestDetailsSlice.actions;

export default transferRequestDetailsSlice.reducer;