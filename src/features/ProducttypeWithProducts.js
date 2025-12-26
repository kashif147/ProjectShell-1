
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Thunk: Fetch product types with products
export const getProductTypesWithProducts = createAsyncThunk(
  "productTypesWithProducts/getProductTypesWithProducts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/product-types/with-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productTypesWithProductsSlice = createSlice({
  name: "productTypesWithProducts",
  initialState: {
    data: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductTypesWithProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductTypesWithProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || [];
      })
      .addCase(getProductTypesWithProducts.rejected, (state) => {
        state.loading = false;
        state.data = [];
      });
  },
});

export default productTypesWithProductsSlice.reducer;

