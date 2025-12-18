import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ===========================
   API
=========================== */
const API_URL =
  "https://subscriptionserviceshell-ambyf5dsa8c9dhcg.northeurope-01.azurewebsites.net/api/v1/subscriptions";

/* ===========================
   THUNK
=========================== */
export const getAllSubscription = createAsyncThunk(
  "subscription/getAllSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch subscriptions"
      );
    }
  }
);

/* ===========================
   SLICE
=========================== */
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptionsData: [],
    subscriptionLoading: false,
    subscriptionErrors: null,
  },
  reducers: {
    resetSubscriptionState: (state) => {
      state.subscriptionsData = [];
      state.subscriptionLoading = false;
      state.subscriptionErrors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(getAllSubscription.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionErrors = null;
      })
      .addCase(getAllSubscription.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionsData = action.payload;
      })
      .addCase(getAllSubscription.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionErrors = action.payload;
      });
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
