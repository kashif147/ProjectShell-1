// hierarchicalLookupsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  readTenantItem,
  removeTenantItem,
  sessionTenantId,
  writeTenantItem,
} from "../utils/tenantStorage";

/** Phase A / A12: the work-location hierarchy is resolved by the lookup type's stable code. */
export const WORK_LOCATION_TYPE_CODE = "WORKLOC";
export const HIERARCHICAL_LOOKUPS_KEY = "hierarchicalLookups";
export const workLocationHierarchyUrl = () =>
  `${process.env.REACT_APP_POLICY_SERVICE_URL}/lookup/by-type-code/${WORK_LOCATION_TYPE_CODE}/hierarchy`;

// One in-flight fetch per tenant (App bootstrap and sign-in may both ask).
const inflightByTenant = new Map();

// Fetch hierarchical lookup data for the signed-in session's tenant. Stored under
// hierarchicalLookups:v2:<tenantId> (utils/tenantStorage.js). An absent WORKLOC type (404) is a
// not-configured state: an empty list, never another tenant's or a global fallback.
export const getHierarchicalLookups = createAsyncThunk(
  "hierarchicalLookups/fetchHierarchicalLookups",
  async (_, { rejectWithValue }) => {
    const tenantId = sessionTenantId();
    if (!tenantId) return rejectWithValue("Tenant context required");
    if (inflightByTenant.has(tenantId)) return inflightByTenant.get(tenantId);
    const run = (async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token
        const response = await axios.get(workLocationHierarchyUrl(), {
          params: { format: "simple" },
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
            "Content-Type": "application/json",
          },
        });
        const results = response.data?.results || [];
        // The session may have changed while the request was in flight: store only for its tenant.
        if (sessionTenantId() === tenantId) {
          writeTenantItem(HIERARCHICAL_LOOKUPS_KEY, JSON.stringify(results));
        }
        return results;
      } catch (error) {
        if (error.response?.status === 404) {
          if (sessionTenantId() === tenantId) writeTenantItem(HIERARCHICAL_LOOKUPS_KEY, "[]");
          return [];
        }
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch hierarchical lookups"
        );
      } finally {
        inflightByTenant.delete(tenantId);
      }
    })();
    inflightByTenant.set(tenantId, run);
    return run;
  },
  {
    // No trusted session tenant: nothing to fetch for.
    condition: () => !!sessionTenantId(),
  }
);

/** Parsed hierarchy for the current session tenant ([] when absent / unparsable / no tenant). */
export const readStoredHierarchicalLookups = () => {
  try {
    const stored = readTenantItem(HIERARCHICAL_LOOKUPS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    removeTenantItem(HIERARCHICAL_LOOKUPS_KEY);
    return [];
  }
};

// Create the slice
const hierarchicalLookupsSlice = createSlice({
  name: "hierarchicalLookups",
  initialState: {
    hierarchicalLookups: readStoredHierarchicalLookups(),
    hierarchicalLookupsLoading: false,
    hierarchicalLookupsError: null,
    lastErrorTime: null,
  },
  reducers: {
    // Optional: Add a reducer to clear localStorage if needed
    clearHierarchicalLookupsStorage: (state) => {
      removeTenantItem(HIERARCHICAL_LOOKUPS_KEY);
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
