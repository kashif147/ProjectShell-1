import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";

/* ===========================
   API
=========================== */

/* ===========================
   THUNK
=========================== */
export const getAllSubscription = createAsyncThunk(
  "subscription/getAllSubscription",
  async (_, { rejectWithValue }) => {
    try {
const token = localStorage.getItem("token")

      const res = await axios.get(
        `${getSubscriptionServiceBaseUrl()}/subscriptions`, // ✅ NO extra /subscriptions
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 👈 match product pattern (unwrap data)
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  },
  {
    condition: (_, { getState }) =>
      !getState().subscription.subscriptionLoading,
  }
);

export const getSubscriptionsWithTemplate = createAsyncThunk(
  "subscription/getSubscriptionsWithTemplate",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${getSubscriptionServiceBaseUrl()}/subscriptions/filter`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data?.data || {};
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch filtered subscriptions"
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
        subscriptionsTemplateMeta: null,
        subscriptionLoading: false,
        subscriptionErrors: null,
    },
    reducers: {
        resetSubscriptionState: (state) => {
            state.subscriptionsData = [];
            state.subscriptionsTemplateMeta = null;
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
            })
            .addCase(getSubscriptionsWithTemplate.pending, (state) => {
                state.subscriptionLoading = true;
                state.subscriptionErrors = null;
            })
            .addCase(getSubscriptionsWithTemplate.fulfilled, (state, action) => {
                state.subscriptionLoading = false;
                state.subscriptionsTemplateMeta = action.payload || null;
                state.subscriptionsData = {
                  data: action.payload?.data || [],
                  count: action.payload?.count || 0,
                  pagination: action.payload?.pagination || null,
                };
            })
            .addCase(getSubscriptionsWithTemplate.rejected, (state, action) => {
                state.subscriptionLoading = false;
                state.subscriptionErrors = action.payload;
            });
    },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
