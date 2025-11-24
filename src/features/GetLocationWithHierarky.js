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
      localStorage.setItem(
        "hierarchicalLookups",
        JSON.stringify(response.data?.results)
      );

      return response.data; // Assuming the API returns hierarchical lookup data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hierarchical lookups"
      );
    }
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
        state.hierarchicalLookupsError = null;
      })
      .addCase(getHierarchicalLookups.fulfilled, (state, action) => {
        state.hierarchicalLookupsLoading = false;
        state.hierarchicalLookupsError = null;
        state.hierarchicalLookups = action.payload; // Set the fetched hierarchical lookups
        // Note: localStorage is already updated in the async thunk
      })
      .addCase(getHierarchicalLookups.rejected, (state, action) => {
        state.hierarchicalLookupsLoading = false;
        state.hierarchicalLookupsError = action.payload; // Set the error message
      });
  },
});

export const { clearHierarchicalLookupsStorage } =
  hierarchicalLookupsSlice.actions;
export default hierarchicalLookupsSlice.reducer;
