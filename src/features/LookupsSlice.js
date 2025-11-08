// lookupsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_POLICY_SERVICE_URL;
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// Only GET operation
export const getAllLookups = createAsyncThunk(
  'lookups/getAllLookups',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/lookup`, { 
        headers: getAuthHeaders() 
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookups');
    }
  }
);

const lookupsSlice = createSlice({
  name: 'lookups',
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLookups.fulfilled, (state, { payload }) => {
        // Store raw response
        state.lookups = payload;
        
        // Reset all arrays before populating
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
        
        // Manually populate each type with label-value format
        if (Array.isArray(payload)) {
          payload.forEach(item => {
            const lookuptype = item.lookuptypeId?.lookuptype;
            const optionItem = {
              value: item._id,
              key: item._id,
              label: item.lookupname
            };
            switch (lookuptype) {
              case 'Title':
                state.titleOptions.push(optionItem);
                
                break;
              case 'Gender':
                state.genderOptions.push(optionItem);
                break;
              case 'workLocation':
                state.workLocationOptions.push(optionItem);
                break;
              case 'Grade':
                state.gradeOptions.push(optionItem);
                break;
              case 'Section':
                state.sectionOptions.push(optionItem);
                break;
              case 'MembershipCategory':
                state.membershipCategoryOptions.push(optionItem);
                break;
              case 'PaymentType':
                state.paymentTypeOptions.push(optionItem);
                break;
              case 'Branch':
                state.branchOptions.push(optionItem);
                break;
              case 'Region':
                state.regionOptions.push(optionItem);
                break;
              case 'Secondary Section':
                state.secondarySectionOptions.push(optionItem);
                break;
              case 'Country':
                state.countryOptions.push(optionItem);
                break;
              default:
                break;
            }
          });
        }
      });
  },
});

export const { clearLookupsError, resetLookups } = lookupsSlice.actions;
export default lookupsSlice.reducer;