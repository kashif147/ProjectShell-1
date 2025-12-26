// src/store/lookupHierarchySlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Adjust baseURL if needed
const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL || '' });

/**
 * Fetch hierarchy lookups for a regionTypeId.
 * We store results keyed by regionTypeId, so multiple types are cached.
 */
export const fetchLookupHierarchy = createAsyncThunk(
  'lookupHierarchy/fetchByRegionType',
  async ({ regionTypeId }, { rejectWithValue }) => {
    try {
      const resp = await api.get(`/lookup/by-type/${regionTypeId}/hierarchy`);
      return { regionTypeId, data: resp.data };
    } catch (err) {
      // Normalize error
      const message = err.response?.data?.message || err.message || 'Network error';
      return rejectWithValue({ regionTypeId, message });
    }
  },
  {
    // Optional: condition to avoid duplicate inflight requests for same id
    condition: ({ regionTypeId }, { getState }) => {
      const state = getState().lookupHierarchy;
      const entry = state.byId[regionTypeId];
      // if already loading, skip
      if (entry?.status === 'loading') return false;
      return true;
    }
  }
);

const initialState = {
  byId: {
    // [regionTypeId]: { status: 'idle'|'loading'|'succeeded'|'failed', data: [], error: null, lastFetched: 0 }
  }
};

const lookupHierarchySlice = createSlice({
  name: 'lookupHierarchy',
  initialState,
  reducers: {
    // Optional helper to clear cache or reset particular id
    clearLookup: (state, action) => {
      const id = action.payload;
      if (id) delete state.byId[id];
      else state.byId = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLookupHierarchy.pending, (state, action) => {
        const id = action.meta.arg.regionTypeId;
        state.byId[id] = state.byId[id] || {};
        state.byId[id].status = 'loading';
        state.byId[id].error = null;
      })
      .addCase(fetchLookupHierarchy.fulfilled, (state, action) => {
        const { regionTypeId, data } = action.payload;
        state.byId[regionTypeId] = {
          status: 'succeeded',
          data,
          error: null,
          lastFetched: Date.now()
        };
      })
      .addCase(fetchLookupHierarchy.rejected, (state, action) => {
        const id = action.payload?.regionTypeId || action.meta.arg.regionTypeId;
        const message = action.payload?.message || action.error?.message || 'Failed';
        state.byId[id] = state.byId[id] || {};
        state.byId[id].status = 'failed';
        state.byId[id].error = message;
      });
  }
});

export const { clearLookup } = lookupHierarchySlice.actions;

export default lookupHierarchySlice.reducer;

// Selectors
export const selectLookupEntry = (state, regionTypeId) => state.lookupHierarchy.byId[regionTypeId] || { status: 'idle', data: null, error: null };
export const selectLookupData = (state, regionTypeId) => state.lookupHierarchy.byId[regionTypeId]?.data || null;
