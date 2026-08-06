import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchIssues, fetchIssueById } from "../../services/issuesApi";

/* ===========================
   THUNKS
=========================== */

// Mirrors subscriptionSlice.js's shape (getAllSubscription) - the closest
// existing simple domain slice, since events-service data is kept in local
// component state (EventsSummary.js) rather than Redux and has no slice of
// its own to copy.
export const getAllIssues = createAsyncThunk(
  "issues/getAllIssues",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchIssues(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch issues",
      );
    }
  },
  {
    condition: (_, { getState }) => !getState().issues.loading,
  },
);

// Not consumed by the Issues grid (this task) - needed by the CasesDetails.js
// rewrite (a separate, later task). Included now since the slice shape is
// specified up front by the plan.
export const getIssueById = createAsyncThunk(
  "issues/getIssueById",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchIssueById(id);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch issue",
      );
    }
  },
);

/* ===========================
   SLICE
=========================== */
const issuesSlice = createSlice({
  name: "issues",
  initialState: {
    issues: [],
    activeIssue: null,
    activities: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetIssuesState: (state) => {
      state.issues = [];
      state.activeIssue = null;
      state.activities = [];
      state.loading = false;
      state.error = null;
    },
    clearActiveIssue: (state) => {
      state.activeIssue = null;
      state.activities = [];
    },
    setActivities: (state, action) => {
      state.activities = Array.isArray(action.payload) ? action.payload : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
      })
      .addCase(getAllIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getIssueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIssueById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeIssue = action.payload;
      })
      .addCase(getIssueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetIssuesState, clearActiveIssue, setActivities } =
  issuesSlice.actions;
export default issuesSlice.reducer;
