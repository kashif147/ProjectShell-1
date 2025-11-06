// lookupsSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
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

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState: {
    lookups: [],
    lookupsLoading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearLookupsError: (state) => {
      state.error = null;
    },
    resetLookups: (state) => {
      state.lookups = [];
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getAllLookups
      .addCase(getAllLookups.pending, (state) => {
        state.lookupsLoading = true;
        state.error = null;
      })
      .addCase(getAllLookups.fulfilled, (state, action) => {
        state.lookupsLoading = false;
        state.lookups = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(getAllLookups.rejected, (state, action) => {
        state.lookupsLoading = false;
        state.error = action.payload;
      })
      // addLookup
      .addCase(addLookup.pending, (state) => {
        state.lookupsLoading = true;
        state.error = null;
      })
      .addCase(addLookup.fulfilled, (state, action) => {
        state.lookupsLoading = false;
        state.lookups.push(action.payload);
      })
      .addCase(addLookup.rejected, (state, action) => {
        state.lookupsLoading = false;
        state.error = action.payload;
      })
      // updateLookup
      .addCase(updateLookup.pending, (state) => {
        state.lookupsLoading = true;
        state.error = null;
      })
      .addCase(updateLookup.fulfilled, (state, action) => {
        state.lookupsLoading = false;
        const index = state.lookups.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.lookups[index] = action.payload;
        }
      })
      .addCase(updateLookup.rejected, (state, action) => {
        state.lookupsLoading = false;
        state.error = action.payload;
      })
      // deleteLookup
      .addCase(deleteLookup.pending, (state) => {
        state.lookupsLoading = true;
        state.error = null;
      })
      .addCase(deleteLookup.fulfilled, (state, action) => {
        state.lookupsLoading = false;
        state.lookups = state.lookups.filter(item => item._id !== action.payload);
      })
      .addCase(deleteLookup.rejected, (state, action) => {
        state.lookupsLoading = false;
        state.error = action.payload;
      });
  },
});

// ==============================
// OPTIMIZED SELECTORS - BOTH INDIVIDUAL AND GROUPED
// ==============================

// Base selectors
export const selectLookups = (state) => state.lookups.lookups;
export const selectLookupsLoading = (state) => state.lookups.lookupsLoading;
export const selectLookupsError = (state) => state.lookups.error;
export const selectLastFetched = (state) => state.lookups.lastFetched;

// Helper function for lookup filtering and transformation
const getLookupsByType = (lookups, lookupType) => {
  if (!lookups || lookups.length === 0) return [];
  
  return lookups
    .filter(item => {
      const itemLookupType = item.lookuptypeId?.lookuptype || item.lookuptype;
      return itemLookupType === lookupType;
    })
    .map(item => ({
      value: item._id,
      label: item.lookupname,
      ...item // Include all original properties
    }));
};

// 🎯 INDIVIDUAL SELECTORS - For High Performance Forms
export const selectTitleOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Title')
);

export const selectGenderOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Gender')
);

export const selectWorkLocationOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'workLocation')
);

export const selectGradeOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Grade')
);

export const selectSectionOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Section')
);

export const selectCountryOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Country')
);

export const selectSecondarySectionOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Secondary Section')
);

export const selectMembershipCategoryOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'MembershipCategory')
);

export const selectPaymentTypeOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'PaymentType')
);

export const selectBranchOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Branch')
);

export const selectRegionOptions = createSelector(
  [selectLookups],
  (lookups) => getLookupsByType(lookups, 'Region')
);

// 🔄 BACKWARD COMPATIBILITY - Keep existing grouped selectors
export const selectGroupedLookups = createSelector(
  [selectLookups],
  (lookups) => {
    if (!lookups || lookups.length === 0) return [];
    
    return lookups.map(item => ({
      id: item._id,
      name: item.lookupname,
      type: item.lookuptypeId?.lookuptype || item.lookuptype,
      description: item.description || '',
      status: item.status || 'active',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }
);

export const selectGroupedLookupsByType = createSelector(
  [selectLookups],
  (lookups) => {
    if (!lookups || lookups.length === 0) return {};
    
    const grouped = {};
    
    // Use for loop for better performance with large datasets
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
  }
);

// Dynamic selector factory for less common lookup types
export const makeSelectLookupsByType = (lookupType) => 
  createSelector(
    [selectLookups],
    (lookups) => getLookupsByType(lookups, lookupType)
  );

// Lookup by ID selector
export const makeSelectLookupById = (lookupId) => 
  createSelector(
    [selectLookups],
    (lookups) => lookups.find(item => item._id === lookupId)
  );

// Lookups by multiple IDs selector
export const makeSelectLookupsByIds = (lookupIds) => 
  createSelector(
    [selectLookups],
    (lookups) => lookups.filter(item => lookupIds.includes(item._id))
  );

// Search lookups by name
export const makeSelectLookupsByName = (searchTerm) => 
  createSelector(
    [selectLookups],
    (lookups) => {
      if (!searchTerm) return [];
      return lookups.filter(item => 
        item.lookupname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

// Selector for lookup statistics
export const selectLookupsStats = createSelector(
  [selectLookups],
  (lookups) => {
    if (!lookups || lookups.length === 0) {
      return {
        total: 0,
        byType: {},
        active: 0,
        inactive: 0
      };
    }
    
    const stats = {
      total: lookups.length,
      byType: {},
      active: 0,
      inactive: 0
    };
    
    for (let i = 0; i < lookups.length; i++) {
      const item = lookups[i];
      const type = item.lookuptypeId?.lookuptype || item.lookuptype || 'Unknown';
      
      // Count by type
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Count by status
      if (item.status === 'active') {
        stats.active++;
      } else if (item.status === 'inactive') {
        stats.inactive++;
      }
    }
    
    return stats;
  }
);

// Check if lookups need refreshing (based on time)
export const selectShouldRefreshLookups = createSelector(
  [selectLastFetched],
  (lastFetched) => {
    if (!lastFetched) return true;
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastFetched > FIVE_MINUTES;
  }
);

// Export actions
export const { clearLookupsError, resetLookups } = lookupsSlice.actions;

export default lookupsSlice.reducer;