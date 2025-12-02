import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";

// Fetch all regions
export const fetchRegions = createAsyncThunk(
  "regions/fetchRegions",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch regions"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { regions, lookups } = getState();
      // Don't dispatch if already loading in either slice
      // Note: fetchRegions calls /api/lookup same as getAllLookups, but different slice
      if (regions.loading || lookups.loading) {
        return false; // Prevent duplicate request
      }
      // Allow fetch if data doesn't exist or is empty in both slices
      const hasRegionsData = regions.regions && regions.regions.length > 0;
      const hasLookupsData = lookups.lookups && lookups.lookups.length > 0;

      if (!hasRegionsData && !hasLookupsData) {
        return true; // Allow fetch
      }
      // Prevent if data already exists in either slice
      return false;
    },
  }
);

// Add a region
export const addRegion = createAsyncThunk(
  "regions/addRegion",
  async (newRegion, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${baseURL}`, newRegion, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add region"
      );
    }
  }
);

// Update a region
export const updateRegion = createAsyncThunk(
  "regions/updateRegion",
  async ({ id, updatedRegion }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${baseURL}/${id}`, updatedRegion, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update region"
      );
    }
  }
);

// Delete a region
export const deleteRegion = createAsyncThunk(
  "regions/deleteRegion",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dispatch(fetchRegions());
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete region"
      );
    }
  }
);

// Slice
const regionSlice = createSlice({
  name: "regions",
  initialState: {
    regions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRegions
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addRegion
      .addCase(addRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRegion.fulfilled, (state, action) => {
        state.loading = false;
        state.regions.push(action.payload);
      })
      .addCase(addRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateRegion
      .addCase(updateRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRegion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.regions.findIndex(
          (region) => region.id === action.payload.id
        );
        if (index !== -1) {
          state.regions[index] = action.payload;
        }
      })
      .addCase(updateRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteRegion
      .addCase(deleteRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRegion.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = state.regions.filter(
          (region) => region.id !== action.payload
        );
      })
      .addCase(deleteRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default regionSlice.reducer;
