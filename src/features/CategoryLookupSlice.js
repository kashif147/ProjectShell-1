// slices/categoryLookupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/products/by-type`;

export const getCategoryLookup = createAsyncThunk(
  'categoryLookup/getCategoryLookup',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${api}/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Transform the API response to [{label: "name", value: "_id"}]
      const transformedData = response.data.data.products.map(product => ({
        label: product.name,
        value: product._id
      }));

      return {
        originalData: response.data, // Keep original data if needed
        transformedData: transformedData, // Transformed data for dropdowns
        productType: response.data.data.productType,
        count: response.data.data.count
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category lookup'
      );
    }
  }
);

const categoryLookupSlice = createSlice({
  name: 'categoryLookup',
  initialState: {
    categoryData: [], // This will now contain [{label: "name", value: "_id"}]
    originalData: null, // Store original API response
    productType: null,
    count: 0,
    categoryLoading: false,
    error: null,
    currentCategoryId: null,
    lastFetched: null,
  },
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    clearCategoryData: (state) => {
      state.categoryData = [];
      state.originalData = null;
      state.productType = null;
      state.count = 0;
      state.currentCategoryId = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategoryLookup.pending, (state) => {
        state.categoryLoading = true;
        state.error = null;
      })
      .addCase(getCategoryLookup.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categoryData = action.payload.transformedData; // Transformed data for dropdowns
        state.originalData = action.payload.originalData; // Original API response
        state.productType = action.payload.productType;
        state.count = action.payload.count;
        state.currentCategoryId = action.meta.arg;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(getCategoryLookup.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError, clearCategoryData } = categoryLookupSlice.actions;
export default categoryLookupSlice.reducer;