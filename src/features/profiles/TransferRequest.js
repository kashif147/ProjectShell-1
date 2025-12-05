import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ GET Transfer Request by ID
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
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTransferRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransferRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getTransferRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transferRequestSlice.reducer;
