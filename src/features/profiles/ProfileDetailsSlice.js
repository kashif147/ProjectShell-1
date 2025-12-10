import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// -----------------------------------------------------
// Thunk: Fetch Profile Details By ID
// -----------------------------------------------------
export const getProfileDetailsById = createAsyncThunk(
  "profileDetails/getProfileDetailsById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/profile/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // API format: { status: "success", data: {...} }
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

// -----------------------------------------------------
// Slice
// -----------------------------------------------------
const profileDetailsSlice = createSlice({
  name: "profileDetails",
  initialState: {
    profileDetails: null,
    loading: false,
    error: null,
  },

  reducers: {
    // -------------------------------------------------
    // CLEAR FUNCTION requested by you
    // -------------------------------------------------
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
        state.profileDetails = null; // reset before fetch
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
