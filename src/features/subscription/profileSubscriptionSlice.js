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

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        "Failed to fetch subscription by profile ID"
      );
    }
  }
);

// ✅ Fetch subscription history by profileId
export const getSubscriptionHistoryByProfileId = createAsyncThunk(
  "profileSubscription/getHistoryByProfileId",
  async ({ profileId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_SUBSCRIPTION}/subscriptions?profileId=${profileId}&isCurrent=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        "Failed to fetch subscription history by profile ID"
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

    ProfileSubHistory: [],
    ProfileSubHistoryLoading: false,
    ProfileSubHistoryError: null,
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
        state.ProfileSubData = action.payload || null;
      })

      // ❌ error
      .addCase(getSubscriptionByProfileId.rejected, (state, action) => {
        state.ProfileSubLoading = false;
        state.ProfileSubError = action.payload;
      })

      // ✅ history pending
      .addCase(getSubscriptionHistoryByProfileId.pending, (state) => {
        state.ProfileSubHistoryLoading = true;
        state.ProfileSubHistoryError = null;
      })

      // ✅ history success
      .addCase(getSubscriptionHistoryByProfileId.fulfilled, (state, action) => {
        state.ProfileSubHistoryLoading = false;
        state.ProfileSubHistory = action.payload || [];
      })

      // ❌ history error
      .addCase(getSubscriptionHistoryByProfileId.rejected, (state, action) => {
        state.ProfileSubHistoryLoading = false;
        state.ProfileSubHistoryError = action.payload;
      });
  },
});

export default profileSubscriptionSlice.reducer;
