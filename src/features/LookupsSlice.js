// lookupsSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../utils/Utilities';

// Fetch all lookups
export const getAllLookups = createAsyncThunk(
  'lookups/getAllLookups',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookups');
    }
  }
);

// Add new lookup
export const addLookup = createAsyncThunk(
  'lookups/addLookup',
  async (newLookup, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/lookups`, newLookup, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add lookup');
    }
  }
);

// Update existing lookup
export const updateLookup = createAsyncThunk(
  'lookups/updateLookup',
  async ({ id, updatedLookup }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${baseURL}/lookups/${id}`, updatedLookup, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lookup');
    }
  }
);

// Delete lookup
export const deleteLookup = createAsyncThunk(
  'lookups/deleteLookup',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}/lookups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lookup');
    }
  }
);

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState: {
    lookups: [],
    lookupsloading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllLookups.pending, (state) => {
        state.lookupsloading = true;
        state.error = null;
      })
      .addCase(getAllLookups.fulfilled, (state, action) => {
        state.lookupsloading = false;
        state.lookups = action.payload;
      })
      .addCase(getAllLookups.rejected, (state, action) => {
        state.lookupsloading = false;
        state.error = action.payload;
      })
      .addCase(addLookup.pending, (state) => {
        state.lookupsloading = true;
        state.error = null;
      })
      .addCase(addLookup.fulfilled, (state, action) => {
        state.lookupsloading = false;
        state.lookups.push(action.payload);
      })
      .addCase(addLookup.rejected, (state, action) => {
        state.lookupsloading = false;
        state.error = action.payload;
      })
      .addCase(updateLookup.pending, (state) => {
        state.lookupsloading = true;
        state.error = null;
      })
      .addCase(updateLookup.fulfilled, (state, action) => {
        state.lookupsloading = false;
        const index = state.lookups.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.lookups[index] = action.payload;
        }
      })
      .addCase(updateLookup.rejected, (state, action) => {
        state.lookupsloading = false;
        state.error = action.payload;
      })
      .addCase(deleteLookup.pending, (state) => {
        state.lookupsloading = true;
        state.error = null;
      })
      .addCase(deleteLookup.fulfilled, (state, action) => {
        state.lookupsloading = false;
        state.lookups = state.lookups.filter(item => item._id !== action.payload);
      })
      .addCase(deleteLookup.rejected, (state, action) => {
        state.lookupsloading = false;
        state.error = action.payload;
      });
  },
});

// ==============================
// Selectors
// ==============================
export const selectLookups = (state) => state.lookups.lookups;

export const selectGroupedLookups = createSelector(
  [selectLookups],
  (lookups) =>
    lookups.reduce((acc, item) => {
      const key = item.lookuptypeId?.lookuptype || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {})
);

// ✅ NEW SELECTOR: grouped by lookuptype name (like "Gender", "Provinces", etc.)
export const selectGroupedLookupsByType = createSelector(
  [selectLookups],
  (lookups) => {
    return lookups.reduce((acc, item) => {
      const lookuptype = item.lookuptypeId?.lookuptype || 'Unknown';
      if (!acc[lookuptype]) {
        acc[lookuptype] = [];
      }
      acc[lookuptype].push({
        value: item._id,
        label: item.lookupname,
      });
      return acc;
    }, {});
  }
);

export default lookupsSlice.reducer;
