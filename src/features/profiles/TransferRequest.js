import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createTransferRequest = createAsyncThunk(
  "transferRequest/create",
  async (requestData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/transfer-request`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getTransferRequest = createAsyncThunk(
  "transferRequest/getTransferRequest",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/transfer-request`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API RESPONSE", response.data);

      return response.data;
    } catch (error) {
      console.log("API ERROR", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// NEW: Get transfer request by ID from API
export const getTransferRequestById = createAsyncThunk(
  "transferRequest/getById",
  async (transferRequestId, { rejectWithValue }) => {

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/transfer-request/${transferRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API RESPONSE by ID", response.data);
      return response.data;
    } catch (error) {
      console.log("API ERROR by ID", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const transferRequestSlice = createSlice({
  name: "transferRequest",
  initialState: {
    data: null, // All transfer requests
    getLoading: false,
    getError: null,
    createLoading: false,
    createError: null,

    // NEW: State for single transfer request by ID
    singleData: null,
    singleLoading: false,
    singleError: null,
  },
  reducers: {
    // NEW: Clear single transfer request data
    clearSingleTransferRequest: (state) => {
      state.singleData = null;
      state.singleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransferRequest.pending, (state) => {
        state.getLoading = true;
        state.getError = null;
      })
      .addCase(getTransferRequest.fulfilled, (state, action) => {
        state.getLoading = false;
        state.data = action.payload;
      })
      .addCase(getTransferRequest.rejected, (state, action) => {
        state.getLoading = false;
        state.getError = action.payload;
      })
      .addCase(createTransferRequest.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createTransferRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        // Optionally update the list if needed
      })
      .addCase(createTransferRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // NEW: Cases for getTransferRequestById
      .addCase(getTransferRequestById.pending, (state) => {
        state.singleLoading = true;
        state.singleError = null;
      })
      .addCase(getTransferRequestById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleData = action.payload;
      })
      .addCase(getTransferRequestById.rejected, (state, action) => {
        state.singleLoading = false;
        state.singleError = action.payload;
      });
  },
});

// Export the new action
export const { clearSingleTransferRequest } = transferRequestSlice.actions;

export default transferRequestSlice.reducer;