// profileSubscriptionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Fetch subscription by profileId
export const getSubscriptionByProfileId = createAsyncThunk(
  "profileSubscription/getByProfileId",
  async ({ profileId, isCurrent = "true" }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.REACT_APP_SUBSCRIPTION}/subscriptions?profileId=${profileId}&isCurrent=${isCurrent}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Adjust based on actual API response structure
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        "Failed to fetch subscription by profile ID"
      );
    }
  }
);

const profileSubscriptionSlice = createSlice({
  name: "profileSubscription",
  initialState: {
    ProfileSubData: null,
    ProfileSubLoading: false,
    ProfileSubError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ pending
      .addCase(getSubscriptionByProfileId.pending, (state) => {
        state.ProfileSubLoading = true;
        state.ProfileSubError = null;
      })

      // ✅ success
      .addCase(getSubscriptionByProfileId.fulfilled, (state, action) => {
        state.ProfileSubLoading = false;
        state.ProfileSubData = action.payload;
      })

      // ❌ error
      .addCase(getSubscriptionByProfileId.rejected, (state, action) => {
        state.ProfileSubLoading = false;
        state.ProfileSubError = action.payload;
      });
  },
});

export default profileSubscriptionSlice.reducer;
