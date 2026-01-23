// tenantSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import MyAlert from "../component/common/MyAlert";
// import { baseURL } from "../utils/Utilities";
const baseURL = process.env.REACT_APP_POLICY_SERVICE_URL;

// Fetch all tenants
export const getAllTenants = createAsyncThunk(
  "tenants/getAllTenants",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // 🔹 assumes token is stored
      const response = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/tenants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data; // 🔹 API response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tenants"
      );
    }
  }
);
// Add new tenant
export const addTenant = createAsyncThunk(
  "tenants/addTenant",
  async (newTenant, { rejectWithValue }) => {
    try {
      // Simulate API call
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          const tenantWithId = {
            ...newTenant,
            _id: `tenant${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          resolve({ data: tenantWithId });
        }, 500)
      );
      return response.data;

      // Uncomment below when API is ready
      // const token = localStorage.getItem("token");
      // const response = await axios.post(`${baseURL}/tenants`, newTenant, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add tenant"
      );
    }
  }
);

// Update existing tenant
export const updateTenant = createAsyncThunk(
  "tenants/updateTenant",
  async ({ id, updatedTenant }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${baseURL}/tenants/${id}`,
        updatedTenant,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update tenant"
      );
    }
  }
);

// Delete tenant
export const deleteTenant = createAsyncThunk(
  "tenants/deleteTenant",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${baseURL}/tenants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        MyAlert("success", "You have successfully deleted.");
        getAllTenants();
      }
      return id; // returning the id for filtering in the reducer
    } catch (error) {
      return rejectWithValue(
        // error.response?.data?.message || "Failed to delete tenant"
        MyAlert("error", "Failed to delete. Please try again later")
      );
    }
  }
);

const tenantSlice = createSlice({
  name: "tenants",
  initialState: {
    tenants: [],
    tenantsLoading: false,
    error: null,
  },
  reducers: {
    clearTenantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTenants.pending, (state) => {
        state.tenantsLoading = true;
        state.error = null;
      })
      .addCase(getAllTenants.fulfilled, (state, action) => {
        state.tenantsLoading = false;
        state.tenants = action.payload.data;
      })
      .addCase(getAllTenants.rejected, (state, action) => {
        state.tenantsLoading = false;
        state.error = action.payload;
      })
      .addCase(addTenant.pending, (state) => {
        state.tenantsLoading = true;
        state.error = null;
      })
      .addCase(addTenant.fulfilled, (state, action) => {
        state.tenantsLoading = false;
        state.tenants.push(action.payload);
      })
      .addCase(addTenant.rejected, (state, action) => {
        state.tenantsLoading = false;
        state.error = action.payload;
      })
      .addCase(updateTenant.pending, (state) => {
        state.tenantsLoading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.tenantsLoading = false;
        const index = state.tenants.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.tenantsLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteTenant.pending, (state) => {
        state.tenantsLoading = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.tenantsLoading = false;
        state.tenants = state.tenants.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.tenantsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTenantError } = tenantSlice.actions;
export default tenantSlice.reducer;
