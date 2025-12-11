// lookupsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_POLICY_SERVICE_URL;
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// Sort utility function
const sortArray = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    
    const comparison = String(aValue).toLowerCase()
      .localeCompare(String(bValue).toLowerCase());
    
    return order === 'desc' ? -comparison : comparison;
  });
};

// Only GET operation
export const getAllLookups = createAsyncThunk(
  "lookups/getAllLookups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/lookup`, {
        headers: getAuthHeaders(),
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lookups"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { lookups } = getState();
      // Don't dispatch if already loading
      if (lookups.loading) {
        return false; // Prevent duplicate request
      }
      // Don't retry if there's a recent error (within last 30 seconds) - prevents infinite loops on CORS errors
      if (lookups.error && lookups.lastErrorTime) {
        const timeSinceError = Date.now() - lookups.lastErrorTime;
        if (timeSinceError < 30000) {
          return false; // Prevent retry on recent error
        }
      }
      // Allow fetch if data doesn't exist or is empty
      if (!lookups.lookups || lookups.lookups.length === 0) {
        return true; // Allow fetch
      }
      // Prevent if data already exists
      return false;
    },
  }
);

const lookupsSlice = createSlice({
  name: "lookups",
  initialState: {
    // Separate states for each lookup type with label-value format
    titleOptions: [],
    genderOptions: [],
    workLocationOptions: [],
    gradeOptions: [],
    sectionOptions: [],
    membershipCategoryOptions: [],
    paymentTypeOptions: [],
    branchOptions: [],
    regionOptions: [],
    secondarySectionOptions: [],
    countryOptions: [],

    // Raw API response (optional - remove if not needed)
    lookups: [],
    loading: false,
    error: null,
    lastErrorTime: null,
  },
  reducers: {
    clearLookupsError: (state) => {
      state.error = null;
    },
    resetLookups: (state) => {
      // Reset all arrays to empty
      state.titleOptions = [];
      state.genderOptions = [];
      state.workLocationOptions = [];
      state.gradeOptions = [];
      state.sectionOptions = [];
      state.membershipCategoryOptions = [];
      state.paymentTypeOptions = [];
      state.branchOptions = [];
      state.regionOptions = [];
      state.secondarySectionOptions = [];
      state.countryOptions = [];
      state.lookups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLookups.pending, (state) => {
        state.loading = true;
        // Don't clear error on pending - keep it to prevent retries
      })
      .addCase(getAllLookups.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.lastErrorTime = null;
        state.lookups = payload;
        
        // Reset all arrays
        state.titleOptions = [];
        state.genderOptions = [];
        state.workLocationOptions = [];
        state.gradeOptions = [];
        state.sectionOptions = [];
        state.membershipCategoryOptions = [];
        state.paymentTypeOptions = [];
        state.branchOptions = [];
        state.regionOptions = [];
        state.secondarySectionOptions = [];
        state.countryOptions = [];

        if (Array.isArray(payload)) {
          payload.forEach((item) => {
            const lookuptype = item.lookuptypeId?.lookuptype;
            const optionItem = {
              value: item._id,
              key: item._id,
              label: item.lookupname,
            };
            switch (lookuptype) {
              case "Title":
                state.titleOptions.push(optionItem);
                break;
              case "Gender":
                state.genderOptions.push(optionItem);
                break;
              case "workLocation":
                state.workLocationOptions.push(optionItem);
                break;
              case "Grade":
                state.gradeOptions.push(optionItem);
                break;
              case "Section":
                state.sectionOptions.push(optionItem);
                break;
              case "MembershipCategory":
                state.membershipCategoryOptions.push(optionItem);
                break;
              case "PaymentType":
                state.paymentTypeOptions.push(optionItem);
                break;
              case "Branch":
                state.branchOptions.push(optionItem);
                break;
              case "Region":
                state.regionOptions.push(optionItem);
                break;
              case "Secondary Section":
                state.secondarySectionOptions.push(optionItem);
                break;
              case "Country":
                state.countryOptions.push(optionItem);
                break;
              default:
                break;
            }
          });
        }

        const otherOption = {
          id: "Other",
          value: "Other",
          label: "Other",
        };

        // Add "Other" to Secondary Section
        if (state.secondarySectionOptions.length > 0) {
          state.secondarySectionOptions.push(otherOption);
        }

        if (state.sectionOptions.length > 0) {
          state.sectionOptions.push(otherOption);
        }

        // Add "Other" to Grade
        if (state.gradeOptions.length > 0) {
          state.gradeOptions.push(otherOption);
        }

        // Add "Other" to Work Location
        if (state.workLocationOptions.length > 0) {
          state.workLocationOptions.push(otherOption);
        }

        // Sort all arrays in ascending order by label
        state.titleOptions = sortArray(state.titleOptions, 'label', 'asc');
        state.genderOptions = sortArray(state.genderOptions, 'label', 'asc');
        state.workLocationOptions = sortArray(state.workLocationOptions, 'label', 'asc');
        state.gradeOptions = sortArray(state.gradeOptions, 'label', 'asc');
        state.sectionOptions = sortArray(state.sectionOptions, 'label', 'asc');
        state.membershipCategoryOptions = sortArray(state.membershipCategoryOptions, 'label', 'asc');
        state.paymentTypeOptions = sortArray(state.paymentTypeOptions, 'label', 'asc');
        state.branchOptions = sortArray(state.branchOptions, 'label', 'asc');
        state.regionOptions = sortArray(state.regionOptions, 'label', 'asc');
        state.secondarySectionOptions = sortArray(state.secondarySectionOptions, 'label', 'asc');
        state.countryOptions = sortArray(state.countryOptions, 'label', 'asc');
      })
      .addCase(getAllLookups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.lastErrorTime = Date.now();
      });
  },
});

export const { clearLookupsError, resetLookups } = lookupsSlice.actions;
export default lookupsSlice.reducer;