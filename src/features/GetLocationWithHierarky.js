// hierarchicalLookupsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch hierarchical lookup data
export const getHierarchicalLookups = createAsyncThunk(
  "hierarchicalLookups/fetchHierarchicalLookups",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token
      const response = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup/by-type/68d036e2662428d1c504b3ad/hierarchy`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
            "Content-Type": "application/json",
          },
        }
      );

      // Save the response data to localStorage
      const results = response.data?.results || [];
      localStorage.setItem("hierarchicalLookups", JSON.stringify(results));

      return results; // Return array to match localStorage and reducer expectations
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hierarchical lookups"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { hierarchicalLookups } = getState();
      // Don't dispatch if already loading
      if (hierarchicalLookups.hierarchicalLookupsLoading) {
        return false; // Prevent duplicate request
      }
      // Don't retry if there's a recent error (within last 30 seconds) - prevents infinite loops on CORS errors
      if (
        hierarchicalLookups.hierarchicalLookupsError &&
        hierarchicalLookups.lastErrorTime
      ) {
        const timeSinceError = Date.now() - hierarchicalLookups.lastErrorTime;
        if (timeSinceError < 30000) {
          return false; // Prevent retry on recent error
        }
      }
      // Allow fetch if data doesn't exist or is empty
      if (
        !hierarchicalLookups.hierarchicalLookups ||
        hierarchicalLookups.hierarchicalLookups.length === 0
      ) {
        return true; // Allow fetch
      }
      // Prevent if data already exists
      return false;
    },
  }
);

// Create the slice
const hierarchicalLookupsSlice = createSlice({
  name: "hierarchicalLookups",
  initialState: {
    hierarchicalLookups: (() => {
      try {
        const stored = localStorage.getItem("hierarchicalLookups");
        if (!stored || typeof stored !== "string") {
          return [];
        }
        const trimmed = stored.trim();
        if (
          trimmed === "" ||
          trimmed === "undefined" ||
          trimmed === "null" ||
          trimmed === "{}" ||
          trimmed === "[]"
        ) {
          return [];
        }
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn(
          "Failed to parse hierarchicalLookups from localStorage:",
          error
        );
        localStorage.removeItem("hierarchicalLookups");
        return [];
      }
    })(),
    hierarchicalLookupsLoading: false,
    hierarchicalLookupsError: null,
    lastErrorTime: null,
  },
  reducers: {
    // Optional: Add a reducer to clear localStorage if needed
    clearHierarchicalLookupsStorage: (state) => {
      localStorage.removeItem("hierarchicalLookups");
      state.hierarchicalLookups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHierarchicalLookups.pending, (state) => {
        state.hierarchicalLookupsLoading = true;
        // Don't clear error on pending - keep it to prevent retries
      })
      .addCase(getHierarchicalLookups.fulfilled, (state, action) => {
        state.hierarchicalLookupsLoading = false;
        state.hierarchicalLookupsError = null;
        state.lastErrorTime = null;
        state.hierarchicalLookups = action.payload; // Set the fetched hierarchical lookups
        // Note: localStorage is already updated in the async thunk
      })
      .addCase(getHierarchicalLookups.rejected, (state, action) => {
        state.hierarchicalLookupsLoading = false;
        state.hierarchicalLookupsError = action.payload; // Set the error message
        state.lastErrorTime = Date.now();
      });
  },
});

export const { clearHierarchicalLookupsStorage } =
  hierarchicalLookupsSlice.actions;
export default hierarchicalLookupsSlice.reducer;
