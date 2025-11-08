// lookupsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
      const response = await axios.post(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup`, newLookup, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
      const response = await axios.put(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup/${id}`, updatedLookup, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
      await axios.delete(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lookup');
    }
  }
);

// Helper function to group lookups by type
const groupLookupsByType = (lookups) => {
  if (!lookups || lookups.length === 0) return {};
  
  const grouped = {};
  
  for (let i = 0; i < lookups.length; i++) {
    const item = lookups[i];
    const lookuptype = item.lookuptypeId?.lookuptype || item.lookuptype || 'Unknown';
    
    if (!grouped[lookuptype]) {
      grouped[lookuptype] = [];
    }
    
    grouped[lookuptype].push({
      value: item._id,
      label: item.lookupname,
      ...item
    });
  }
  
  return grouped;
};

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState: {
    lookups: [], // Raw response data
    groupedLookups: {}, // Lookups grouped by type
  },
  reducers: {
    clearLookupsError: (state) => {
      state.error = null;
    },
    resetLookups: (state) => {
      state.lookups = [];
      state.groupedLookups = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // getAllLookups
      .addCase(getAllLookups.fulfilled, (state, action) => {
        state.lookups = action.payload;
        state.groupedLookups = groupLookupsByType(action.payload);
      })
      // addLookup
      .addCase(addLookup.fulfilled, (state, action) => {
        const newLookup = action.payload;
        state.lookups.push(newLookup);
        state.groupedLookups = groupLookupsByType(state.lookups);
      })
      // updateLookup
      .addCase(updateLookup.fulfilled, (state, action) => {
        const updatedLookup = action.payload;
        const index = state.lookups.findIndex(item => item._id === updatedLookup._id);
        if (index !== -1) {
          state.lookups[index] = updatedLookup;
        }
        state.groupedLookups = groupLookupsByType(state.lookups);
      })
      // deleteLookup
      .addCase(deleteLookup.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.lookups = state.lookups.filter(item => item._id !== deletedId);
        state.groupedLookups = groupLookupsByType(state.lookups);
      });
  },
});

export const { clearLookupsError, resetLookups } = lookupsSlice.actions;

export default lookupsSlice.reducer;