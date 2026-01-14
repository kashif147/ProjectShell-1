// filterTransferSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch main data first, then filter by ID
export const fetchAndFilterTransferById = createAsyncThunk(
  "filterTransfer/fetchAndFilterById",
  async (id, { rejectWithValue, getState }) => {
    debugger
    try {
      // Get current state
      const state = getState();
      
      // Check if we already have the filtered data for this ID
      if (state.filterTransfer.lastFilteredId === id && state.filterTransfer.filteredData) {
        return state.filterTransfer.filteredData;
      }
      
      // Access main data from the state
      const mainData = state.transferRequest?.data?.data || state.transferRequest?.data;
        debugger
      // Validate main data
      if (!mainData || !Array.isArray(mainData)) {
        throw new Error("Main data not available. Please ensure transfer requests are loaded first.");
      }
      
      // Filter the data by ID (checking multiple possible ID fields)
      const filteredItem = mainData.find(item => 
        item.id === id || 
        item._id === id || 
        item.transferId === id || 
        item.key === id
      );
        debugger
      if (!filteredItem) {
        throw new Error(`Transfer request with ID ${id} not found in the dataset`);
      }
      
      return filteredItem;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const filterTransferSlice = createSlice({
  name: "filterTransfer",
  initialState: {
    filteredData: null,
    loading: false,
    error: null,
    lastFilteredId: null,
  },
  reducers: {
    // Clear filtered data
    clearFilteredTransfer: (state) => {
      state.filteredData = null;
      state.error = null;
      state.lastFilteredId = null;
    },
    
    // Reset entire state
    resetFilterTransfer: (state) => {
      state.filteredData = null;
      state.loading = false;
      state.error = null;
      state.lastFilteredId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAndFilterTransferById lifecycle
      .addCase(fetchAndFilterTransferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAndFilterTransferById.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredData = action.payload;
        state.lastFilteredId = action.meta.arg; // Store the ID that was filtered
        state.error = null;
      })
      .addCase(fetchAndFilterTransferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to filter transfer request";
        state.filteredData = null;
        state.lastFilteredId = null;
      });
  },
});

// Export actions
export const { 
  clearFilteredTransfer, 
  resetFilterTransfer 
} = filterTransferSlice.actions;

// Export selectors
export const selectFilteredTransfer = (state) => state.filterTransfer.filteredData;
export const selectFilteredLoading = (state) => state.filterTransfer.loading;
export const selectFilteredError = (state) => state.filterTransfer.error;
export const selectLastFilteredId = (state) => state.filterTransfer.lastFilteredId;

export default filterTransferSlice.reducer;