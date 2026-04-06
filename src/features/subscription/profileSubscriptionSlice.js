// profileSubscriptionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * Unwraps list/detail responses so ProfileSubData is always { data: Subscription[] }.
 * Handles: { data: [...] }, { count, data: [...] }, { data: { data: [...] } }, single doc, etc.
 */
function normalizeSubscriptionResponse(res) {
  let node = res?.data;
  if (node == null) return { data: [] };

  for (let d = 0; d < 10; d++) {
    if (Array.isArray(node)) {
      return { data: node };
    }
    if (!node || typeof node !== "object") {
      return { data: [] };
    }
    if (Array.isArray(node.data)) {
      return { data: node.data };
    }
    if (node.data !== undefined && node.data !== null) {
      const inner = node.data;
      if (typeof inner === "object" && !Array.isArray(inner)) {
        if (Array.isArray(inner.data)) {
          return { data: inner.data };
        }
        if (
          inner._id ||
          inner.profileId ||
          inner.subscriptionStatus !== undefined
        ) {
          return { data: [inner] };
        }
      }
      node = inner;
      continue;
    }
    if (
      node._id ||
      node.profileId ||
      node.subscriptionStatus !== undefined
    ) {
      return { data: [node] };
    }
    break;
  }
  return { data: [] };
}

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

      return normalizeSubscriptionResponse(res);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        "Failed to fetch subscription by profile ID"
      );
    }
  }
);

export const getSubscriptionById = createAsyncThunk(
  "profileSubscription/getById",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_SUBSCRIPTION}/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return normalizeSubscriptionResponse(res);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch subscription by id"
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

      return normalizeSubscriptionResponse(res).data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        "Failed to fetch subscription history by profile ID"
      );
    }
  }
);

/** Current + non-current rows for the profile (deduped). Used for Activate Membership eligibility by startDate. */
export const getProfileSubscriptionsForActivateEligibility = createAsyncThunk(
  "profileSubscription/getForActivateEligibility",
  async ({ profileId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const base = `${process.env.REACT_APP_SUBSCRIPTION}/subscriptions?profileId=${profileId}`;
      const headers = { Authorization: `Bearer ${token}` };
      const [resCurrent, resPast] = await Promise.all([
        axios.get(`${base}&isCurrent=true`, { headers }),
        axios.get(`${base}&isCurrent=false`, { headers }),
      ]);
      const a = normalizeSubscriptionResponse(resCurrent).data;
      const b = normalizeSubscriptionResponse(resPast).data;
      const byId = new Map();
      [...a, ...b].forEach((s) => {
        if (s?._id) byId.set(s._id, s);
      });
      return [...byId.values()];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch profile subscriptions for eligibility"
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

    profileSubscriptionsForActivateEligibility: [],
    profileSubscriptionsForActivateEligibilityLoading: false,
    profileSubscriptionsForActivateEligibilityError: null,
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

      .addCase(getSubscriptionById.pending, (state) => {
        state.ProfileSubLoading = true;
        state.ProfileSubError = null;
      })
      .addCase(getSubscriptionById.fulfilled, (state, action) => {
        state.ProfileSubLoading = false;
        state.ProfileSubData = action.payload || null;
      })
      .addCase(getSubscriptionById.rejected, (state, action) => {
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
      })

      .addCase(getProfileSubscriptionsForActivateEligibility.pending, (state) => {
        state.profileSubscriptionsForActivateEligibilityLoading = true;
        state.profileSubscriptionsForActivateEligibilityError = null;
        state.profileSubscriptionsForActivateEligibility = [];
      })
      .addCase(
        getProfileSubscriptionsForActivateEligibility.fulfilled,
        (state, action) => {
          state.profileSubscriptionsForActivateEligibilityLoading = false;
          state.profileSubscriptionsForActivateEligibility =
            action.payload || [];
        }
      )
      .addCase(
        getProfileSubscriptionsForActivateEligibility.rejected,
        (state, action) => {
          state.profileSubscriptionsForActivateEligibilityLoading = false;
          state.profileSubscriptionsForActivateEligibilityError =
            action.payload;
          state.profileSubscriptionsForActivateEligibility = [];
        }
      );
  },
});

export default profileSubscriptionSlice.reducer;
