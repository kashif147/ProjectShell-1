// features/profiles/batchMemberSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching batches by type
export const fetchBatchesByType = createAsyncThunk(
  'batchMember/fetchBatchesByType',
  async ({ type = 'new', page = 1, limit = 500 }, { rejectWithValue }) => {
    try {
      console.log('Fetching batches with params:', { type, page, limit });
      
      // Get token from storage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      // Build URL - use environment variable
      const baseUrl = process.env.REACT_APP_PROFILE_SERVICE_URL;
      const url = `${baseUrl}/batches`;
      console.log('API URL:', url);
      
      const response = await fetch(
        `${url}?type=${type}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchBatchesByType:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const batchMemberSlice = createSlice({
  name: 'batchMember',
  initialState: {
    loadingBatches: false,
    batchesData: [],
    batchesError: null,
    currentType: 'new',
    currentPage: 1,
  },
  reducers: {
    clearBatchesError: (state) => {
      state.batchesError = null;
    },
    resetBatches: (state) => {
      state.batchesData = [];
      state.batchesError = null;
      state.loadingBatches = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatchesByType.pending, (state) => {
        state.loadingBatches = true;
        state.batchesError = null;
      })
      .addCase(fetchBatchesByType.fulfilled, (state, action) => {
        state.loadingBatches = false;
        state.batchesData = action.payload;
        state.batchesError = null;
      })
      .addCase(fetchBatchesByType.rejected, (state, action) => {
        state.loadingBatches = false;
        state.batchesError = action.payload;
        state.batchesData = [];
      });
  },
});

export const { clearBatchesError, resetBatches } = batchMemberSlice.actions;
export default batchMemberSlice.reducer;