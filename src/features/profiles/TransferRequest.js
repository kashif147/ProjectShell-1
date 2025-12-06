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


const transferRequestSlice = createSlice({
  name: "transferRequest",
  initialState: {
    data: null,
    getLoading: false, // Renamed for clarity
    getError: null,   // Renamed for clarity
    createLoading: false,
    createError: null,
  },
  reducers: {},
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
      })
      .addCase(createTransferRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export default transferRequestSlice.reducer;
