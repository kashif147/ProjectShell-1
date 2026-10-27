// slices/categoryLookupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { filterMembershipCategoryOptionsForPortalUser } from '../utils/membershipCategoryLabels';

import { sessionTenantId } from '../utils/tenantStorage';

/**
 * Phase A / A12: membership categories are the products of the product type with stable code MEM,
 * for the signed-in session's tenant (the server takes the tenant from the token; nothing here
 * sends one). Behaviour keys off product codes (4080 Retired Associate, 4090 Undergraduate
 * Student), never ids or labels, so each option keeps its `code`.
 */
export const MEMBERSHIP_PRODUCT_TYPE_CODE = 'MEM';
export const RETIRED_ASSOCIATE_PRODUCT_CODE = '4080';
export const UNDERGRADUATE_STUDENT_PRODUCT_CODE = '4090';

const api = `${process.env.REACT_APP_POLICY_SERVICE_URL}/products/by-type-code`;

/** Redux cache identity for a product-type code: tenant + code (never reused across tenants). */
export const categoryCacheKey = (typeCode = MEMBERSHIP_PRODUCT_TYPE_CODE, tenantId = sessionTenantId()) =>
  tenantId ? `${tenantId}:${typeCode}` : null;

export const toCategoryOptions = (products = []) =>
  filterMembershipCategoryOptionsForPortalUser(
    products.map(product => ({
      label: product.name,
      value: product._id,
      key: product._id,
      code: product.code,
    })),
  );

export const getCategoryLookup = createAsyncThunk(
  'categoryLookup/getCategoryLookup',
  async (typeCode = MEMBERSHIP_PRODUCT_TYPE_CODE, { rejectWithValue }) => {
    const cacheKey = categoryCacheKey(typeCode);
    if (!cacheKey) return rejectWithValue('Tenant context required');
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${api}/${encodeURIComponent(typeCode)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Transform the API response to [{label: "name", value: "_id", key: "_id", code}]
      const transformedData = toCategoryOptions(response.data.data.products);

      return {
        originalData: response.data, // Keep original data if needed
        transformedData: transformedData, // Transformed data for dropdowns
        productType: response.data.data.productType,
        count: response.data.data.count,
        cacheKey,
      };
    } catch (error) {
      // The tenant has no such product type (e.g. no MEM yet): a not-configured, empty state -
      // never another tenant's categories.
      if (error.response?.status === 404) {
        return { originalData: null, transformedData: [], productType: null, count: 0, cacheKey, notConfigured: true };
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category lookup'
      );
    }
  },
  {
    condition: (typeCode = MEMBERSHIP_PRODUCT_TYPE_CODE, { getState }) => {
      const cacheKey = categoryCacheKey(typeCode);
      if (!cacheKey) return false;
      const { categoryLoading, currentCategoryId } = getState().categoryLookup;
      if (categoryLoading) return false;
      if (currentCategoryId === cacheKey) return false;
      return true;
    },
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
    currentCategoryId: null, // tenant:code cache key of categoryData
    notConfigured: false,
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
      .addCase(getCategoryLookup.pending, (state, action) => {
        state.categoryLoading = true;
        state.error = null;
        // Another tenant's (or another type's) categories are never kept while the new ones load.
        if (state.currentCategoryId !== categoryCacheKey(action.meta.arg)) {
          state.categoryData = [];
          state.originalData = null;
          state.productType = null;
          state.count = 0;
          state.currentCategoryId = null;
        }
      })
      .addCase(getCategoryLookup.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categoryData = action.payload.transformedData; // Transformed data for dropdowns
        state.originalData = action.payload.originalData; // Original API response
        state.productType = action.payload.productType;
        state.count = action.payload.count;
        state.currentCategoryId = action.payload.cacheKey; // tenant:code of the data held
        state.notConfigured = !!action.payload.notConfigured;
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