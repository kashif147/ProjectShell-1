// lookupsTypeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../utils/Utilities";
import {
  extractLookupTypesArray,
  normalizeLookupTypes,
} from "../utils/lookupHierarchy";

// Fetch all lookup types
export const getLookupTypes = createAsyncThunk(
  "lookupsType/fetchLookupTypes",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = process.env.REACT_APP_POLICY_SERVICE_URL || baseURL;

      if (!apiBaseUrl) {
        return rejectWithValue("API base URL is not configured");
      }

      const response = await axios.get(`${apiBaseUrl}/lookuptype`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.warn("Lookup types service temporarily unavailable");
        return [];
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lookup types",
      );
    }
  },
  {
    condition: (forceRefresh, { getState }) => {
      if (forceRefresh === true) return true;

      const { lookupsTypes } = getState();
      if (lookupsTypes.lookupsTypesloading) return false;
      if (lookupsTypes.lookupsTypesFetched) return false;

      return true;
    },
  },
);

const lookupsTypeSlice = createSlice({
  name: "lookupsType",
  initialState: {
    lookupsTypes: [],
    lookupsTypesloading: false,
    lookupsTypesFetched: false,
    lookupsTypeerror: null,
  },
  reducers: {
    clearLookupTypes: (state) => {
      state.lookupsTypes = [];
      state.lookupsTypeerror = null;
      state.lookupsTypesFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLookupTypes.pending, (state) => {
        state.lookupsTypesloading = true;
        state.lookupsTypeerror = null;
      })
      .addCase(getLookupTypes.fulfilled, (state, action) => {
        state.lookupsTypeerror = null;
        state.lookupsTypesloading = false;
        state.lookupsTypesFetched = true;
        state.lookupsTypes = normalizeLookupTypes(
          extractLookupTypesArray(action.payload),
        );
      })
      .addCase(getLookupTypes.rejected, (state, action) => {
        state.lookupsTypesloading = false;
        state.lookupsTypesFetched = true;
        state.lookupsTypeerror = action.payload;
        state.lookupsTypes = [];
      });
  },
});

export const { clearLookupTypes } = lookupsTypeSlice.actions;
export default lookupsTypeSlice.reducer;
