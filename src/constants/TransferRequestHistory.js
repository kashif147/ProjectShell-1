import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to get transfer request history by profile ID
export const getTransferRequestHistoryById = createAsyncThunk(
  "transferRequestHistory/getById",
  async (profileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/transfer-request/${profileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response) {
        console.log("Transfer Request History API RESPONSE", response.data);
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch transfer history"
        );
      } 
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const transferRequestHistorySlice = createSlice({
  name: "transferRequestHistory",
  initialState: {
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTransferRequestHistoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransferRequestHistoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getTransferRequestHistoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transferRequestHistorySlice.reducer;