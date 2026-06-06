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

/** Distinct subscription years for Members filters (GET meta/subscription-years). */
export const fetchSubscriptionYears = createAsyncThunk(
  "subscription/fetchSubscriptionYears",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${getSubscriptionServiceBaseUrl()}/subscriptions/meta/subscription-years`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const years = res.data?.data?.years;
      return Array.isArray(years) ? years : [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.data ||
          "Failed to fetch subscription years",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const s = getState().subscription;
      if (!localStorage.getItem("token")) return false;
      if (s.subscriptionYearsLoading || s.subscriptionYearsLoaded) return false;
      return true;
    },
  },
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
        subscriptionYears: [],
        subscriptionYearsLoaded: false,
        subscriptionYearsLoading: false,
        subscriptionYearsError: null,
    },
    reducers: {
        resetSubscriptionState: (state) => {
            state.subscriptionsData = [];
            state.subscriptionsTemplateMeta = null;
            state.subscriptionLoading = false;
            state.subscriptionErrors = null;
            state.subscriptionYears = [];
            state.subscriptionYearsLoaded = false;
            state.subscriptionYearsLoading = false;
            state.subscriptionYearsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscriptionYears.pending, (state) => {
                state.subscriptionYearsLoading = true;
                state.subscriptionYearsError = null;
            })
            .addCase(fetchSubscriptionYears.fulfilled, (state, action) => {
                state.subscriptionYearsLoading = false;
                state.subscriptionYearsLoaded = true;
                state.subscriptionYears = action.payload;
            })
            .addCase(fetchSubscriptionYears.rejected, (state, action) => {
                state.subscriptionYearsLoading = false;
                state.subscriptionYearsLoaded = true;
                state.subscriptionYearsError = action.payload;
                state.subscriptionYears = [];
            })
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
