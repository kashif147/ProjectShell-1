import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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
        `${process.env.REACT_APP_SUBSCRIPTION}/subscriptions`, // ✅ NO extra /subscriptions
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
