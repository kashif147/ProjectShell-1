// productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities"; // adjust path if needed

// ✅ Fetch ALL products (grouped by productType)
// productsSlice.js
// getAllProducts thunk
export const getAllProducts = createAsyncThunk(
  "products/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // or getState().auth.token
      const res = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // unwrap the nested array
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch all products"
      );
    }
  }
);



// ✅ Fetch products by type
export const getProductsByType = createAsyncThunk(
  "products/getProductsByType",
  async (productTypeId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${baseURL}/api/products/by-type/${productTypeId}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products by type"
      );
    }
  }
);

// ✅ Helper function to group products by productType
const groupByProductType = (data) => {
  return Object.values(
    data.reduce((acc, item) => {
      const type = item.productType;

      if (!acc[type._id]) {
        acc[type._id] = {
          _id: type._id,
          name: type.name,
          code: type.code,
          description: type.description,
          products: [],
        };
      }

      // exclude productType field in child object
      const { productType, ...productData } = item;
      acc[type._id].products.push(productData);

      return acc;
    }, {})
  );
};

const productsSlice = createSlice({
  name: "products",
  initialState: {
    allProducts: [], // grouped by type
    productsByType: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ all products (grouped)
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = groupByProductType(action.payload);
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ products by type (keep flat or group again if needed)
      .addCase(getProductsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.productsByType = action.payload;
      })
      .addCase(getProductsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;
