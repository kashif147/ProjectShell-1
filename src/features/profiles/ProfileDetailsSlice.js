import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Async thunk to fetch profile by ID
export const getProfileDetailsById = createAsyncThunk(
  "profileDetails/getProfileDetailsById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_PROFILE_SERVICE_URL}/profile/${id}`);
      // assuming API returns { status, data }
      if (response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue("Failed to fetch profile details");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const profileDetailsSlice = createSlice({
  name: "profileDetails",
  initialState: {
    profileDetails: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfileDetails: (state) => {
      state.profileDetails = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfileDetailsById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.profileDetails = null;
      })
      .addCase(getProfileDetailsById.fulfilled, (state, action) => {
        state.loading = false;
        state.profileDetails = action.payload;
      })
      .addCase(getProfileDetailsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile details";
      });
  },
});

export const { clearProfileDetails } = profileDetailsSlice.actions;
export default profileDetailsSlice.reducer;
