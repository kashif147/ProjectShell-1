import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { insertDataFtn, updateFtn, deleteFtn } from "../utils/Utilities";

// Async thunks for API calls
export const getAllProductTypes = createAsyncThunk(
  "productTypes/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/product-types`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Return the array directly
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product types"
      );
    }
  }
);

export const getProductTypeById = createAsyncThunk(
  "productTypes/getById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_POLICY_SERVICE_URL}/product-types/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product type"
      );
    }
  }
);

export const createProductType = createAsyncThunk(
  "productTypes/create",
  async (productTypeData, { rejectWithValue }) => {
    try {
      const response = await insertDataFtn(
        "/product-types",
        productTypeData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product type"
      );
    }
  }
);

export const updateProductType = createAsyncThunk(
  "productTypes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateFtn(`/product-types/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product type"
      );
    }
  }
);

export const deleteProductType = createAsyncThunk(
  "productTypes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteFtn(`/product-types/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product type"
      );
    }
  }
);

export const createPricing = createAsyncThunk(
  "productTypes/createPricing",
  async (pricingData, { rejectWithValue }) => {
    try {
      const response = await insertDataFtn(
        "/product-types/pricing",
        pricingData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create pricing"
      );
    }
  }
);

export const updatePricing = createAsyncThunk(
  "productTypes/updatePricing",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateFtn(
        `/product-types/pricing/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update pricing"
      );
    }
  }
);

export const getPricingHistory = createAsyncThunk(
  "productTypes/getPricingHistory",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/products/${productId}/pricing`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pricing history"
      );
    }
  }
);

// Initial state
const initialState = {
  // productTypes: [
  //   {
  //     id: 1,
  //     name: "Membership",
  //     code: "MEM",
  //     description: "Annual membership fees for different member categories",
  //     category: "MEMBERSHIP",
  //     isActive: true,
  //     createdAt: "2024-01-15T10:30:00Z",
  //     updatedAt: "2024-12-01T14:45:00Z",
  //     createdBy: "Sarah O'Brien",
  //     updatedBy: "Michael Murphy",
  //     products: [
  //       {
  //         id: 1,
  //         name: "General (all grades)",
  //         code: "MEM-GEN",
  //         description: "Standard membership for all nursing grades",
  //         memberPrice: 299,
  //         nonMemberPrice: 299,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 2,
  //         name: "Postgraduate Student",
  //         code: "MEM-PG",
  //         description: "Membership for postgraduate nursing students",
  //         memberPrice: 299,
  //         nonMemberPrice: 299,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 3,
  //         name: "Private nursing home",
  //         code: "MEM-PNH",
  //         description: "Membership for private nursing home staff",
  //         memberPrice: 228,
  //         nonMemberPrice: 228,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 4,
  //         name: "Short-term/Relief (under 12 hrs/wk average)",
  //         code: "MEM-STR",
  //         description: "Membership for part-time relief staff",
  //         memberPrice: 228,
  //         nonMemberPrice: 228,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 5,
  //         name: "Affiliate members (non-practicing)",
  //         code: "MEM-AFF",
  //         description: "Membership for non-practicing nurses",
  //         memberPrice: 116,
  //         nonMemberPrice: 116,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 6,
  //         name: "Lecturing (employed in universities and IT institutes)",
  //         code: "MEM-LEC",
  //         description: "Membership for academic nursing staff",
  //         memberPrice: 116,
  //         nonMemberPrice: 116,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 7,
  //         name: "Associate (not currently employed as a nurse/midwife)",
  //         code: "MEM-ASS",
  //         description: "Membership for unemployed nurses",
  //         memberPrice: 75,
  //         nonMemberPrice: 75,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 8,
  //         name: "Retired Associate",
  //         code: "MEM-RET",
  //         description: "Membership for retired nurses",
  //         memberPrice: 25,
  //         nonMemberPrice: 25,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 9,
  //         name: "Undergraduate Student",
  //         code: "MEM-UG",
  //         description: "Free membership for undergraduate nursing students",
  //         memberPrice: 0,
  //         nonMemberPrice: 0,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: "Continuing Professional Development",
  //     code: "CPD",
  //     description: "Professional development courses and training programs",
  //     category: "COURSES",
  //     isActive: true,
  //     createdAt: "2024-02-20T09:15:00Z",
  //     updatedAt: "2024-11-15T16:20:00Z",
  //     createdBy: "Emma Walsh",
  //     updatedBy: "David Kelly",
  //     products: [
  //       {
  //         id: 10,
  //         name: "Advanced Cardiac Life Support (ACLS)",
  //         code: "CPD-ACLS",
  //         description: "Advanced cardiac life support certification course",
  //         memberPrice: 150,
  //         nonMemberPrice: 200,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 11,
  //         name: "Infection Prevention and Control",
  //         code: "CPD-IPC",
  //         description: "Infection prevention and control training",
  //         memberPrice: 80,
  //         nonMemberPrice: 120,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 12,
  //         name: "Medication Management",
  //         code: "CPD-MED",
  //         description: "Safe medication management and administration",
  //         memberPrice: 100,
  //         nonMemberPrice: 150,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     name: "Professional Events",
  //     code: "EVENTS",
  //     description: "Conferences, seminars, and networking events",
  //     category: "EVENTS",
  //     isActive: true,
  //     createdAt: "2024-03-10T11:45:00Z",
  //     updatedAt: "2024-10-30T13:30:00Z",
  //     createdBy: "Lisa Fitzgerald",
  //     updatedBy: "Lisa Fitzgerald",
  //     products: [
  //       {
  //         id: 13,
  //         name: "Annual Nursing Conference 2025",
  //         code: "EVT-ANC2025",
  //         description: "Annual nursing conference with keynote speakers",
  //         memberPrice: 200,
  //         nonMemberPrice: 300,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 14,
  //         name: "Midwifery Symposium",
  //         code: "EVT-MS2025",
  //         description: "Midwifery practice symposium",
  //         memberPrice: 150,
  //         nonMemberPrice: 250,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 15,
  //         name: "Mental Health Nursing Workshop",
  //         code: "EVT-MHNW2025",
  //         description: "Workshop on mental health nursing practices",
  //         memberPrice: 120,
  //         nonMemberPrice: 180,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //     ],
  //   },
  //   {
  //     id: 4,
  //     name: "Professional Insurance",
  //     code: "INS",
  //     description: "Professional indemnity and liability insurance",
  //     category: "INSURANCE",
  //     isActive: true,
  //     createdAt: "2024-04-05T14:20:00Z",
  //     updatedAt: "2024-12-10T10:15:00Z",
  //     createdBy: "James O'Connor",
  //     updatedBy: "Sarah O'Brien",
  //     products: [
  //       {
  //         id: 16,
  //         name: "Professional Indemnity Insurance",
  //         code: "INS-PII",
  //         description: "Professional indemnity insurance coverage",
  //         memberPrice: 150,
  //         nonMemberPrice: 200,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //       {
  //         id: 17,
  //         name: "Public Liability Insurance",
  //         code: "INS-PLI",
  //         description: "Public liability insurance coverage",
  //         memberPrice: 100,
  //         nonMemberPrice: 150,
  //         effectiveFrom: "2025-01-01",
  //         effectiveTo: "2025-12-31",
  //         currency: "EUR",
  //         isActive: true,
  //       },
  //     ],
  //   },
  // ],
  productTypes: [],
  currentProductType: null,
  pricingHistory: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Product Types slice
const productTypesSlice = createSlice({
  name: "productTypes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProductType: (state) => {
      state.currentProductType = null;
    },
    clearPricingHistory: (state) => {
      state.pricingHistory = [];
    },
    updateProductTypeLocal: (state, action) => {
      const index = state.productTypes.findIndex(
        (pt) => pt.id === action.payload.id
      );
      if (index !== -1) {
        state.productTypes[index] = {
          ...state.productTypes[index],
          ...action.payload,
        };
      }
    },
    addProductTypeLocal: (state, action) => {
      state.productTypes.push(action.payload);
    },
    removeProductTypeLocal: (state, action) => {
      state.productTypes = state.productTypes.filter(
        (pt) => pt.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all product types
      .addCase(getAllProductTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProductTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getAllProductTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get product type by ID
      .addCase(getProductTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProductType = action.payload;
      })
      .addCase(getProductTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create product type
      .addCase(createProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductType.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes.push(action.payload);
      })
      .addCase(createProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product type
      .addCase(updateProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productTypes.findIndex(
          (pt) => pt.id === action.payload.id
        );
        if (index !== -1) {
          state.productTypes[index] = action.payload;
        }
        if (state.currentProductType?.id === action.payload.id) {
          state.currentProductType = action.payload;
        }
      })
      .addCase(updateProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product type
      .addCase(deleteProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductType.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes = state.productTypes.filter(
          (pt) => pt.id !== action.payload
        );
        if (state.currentProductType?.id === action.payload) {
          state.currentProductType = null;
        }
      })
      .addCase(deleteProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create pricing
      .addCase(createPricing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.pricingHistory.push(action.payload);
      })
      .addCase(createPricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update pricing
      .addCase(updatePricing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePricing.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pricingHistory.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.pricingHistory[index] = action.payload;
        }
      })
      .addCase(updatePricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get pricing history
      .addCase(getPricingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPricingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.pricingHistory = action.payload;
      })
      .addCase(getPricingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentProductType,
  clearPricingHistory,
  updateProductTypeLocal,
  addProductTypeLocal,
  removeProductTypeLocal,
} = productTypesSlice.actions;

export default productTypesSlice.reducer;
