// features/applicationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications`;

// 🔹 Normalizer: make local drafts look like API applications
const mapLocalDraftToApplication = (draft) => ({
  id: draft.id || `draft-${Date.now()}`,
  status: 'draft',
  type: draft.type || 'draft',
  surname: draft.surname || '',
  forename: draft.forename || '',
  createdAt: draft.createdAt || new Date().toISOString(),
  updatedAt: draft.updatedAt || new Date().toISOString(),

  personalInfo: {
    surname: draft.surname || '',
    forename: draft.forename || '',
    dateOfBirth: draft.dateOfBirth || '',
    title: draft.title || '',
    countryPrimaryQualification: draft.countryPrimaryQualification || '',
    ...draft.personalInfo,
  },
  contactInfo: {
    email: draft.email || '',
    phone: draft.phone || '',
    address: draft.address || '',
    ...draft.contactInfo,
  },
  approvalDetails: {
    approvedBy: draft.approvedBy || null,
    approvedAt: draft.approvedAt || null,
    ...draft.approvalDetails,
  },
  meta: {
    isLocalDraft: true,
  },
  ...draft,
});

export const getAllApplications = createAsyncThunk(
  'applications/getAllApplications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const localDraftsRaw = localStorage.getItem('gardaApplicationDrafts');
      const localDrafts = localDraftsRaw ? JSON.parse(localDraftsRaw) : [];
      const normalizedDrafts = localDrafts.map(mapLocalDraftToApplication);
      let apiApplications = [];

      console.log('🎯 Filters received in slice:', filters);

      // ✅ Extract Application Status from filters
      const applicationStatusFilter = filters['Application Status'];
      const statusValues = applicationStatusFilter?.selectedValues || [];
      const operator = applicationStatusFilter?.operator || '==';

      console.log('📊 Processing Application Status:', {
        statusValues,
        operator,
        filterKeys: Object.keys(filters)
      });

      // ✅ Status normalization
      const normalizeStatus = (statusValue) => {
        if (!statusValue) return '';
        const value = statusValue.toLowerCase();
        const statusMap = {
          'inprogress': 'in-progress',
          'in-progress': 'in-progress',
          'approved': 'approved',
          'rejected': 'rejected',
          'submitted': 'submitted',
          'draft': 'draft'
        };
        return statusMap[value] || value;
      };

      // ✅ Handle Application Status filtering
      if (Array.isArray(statusValues) && statusValues.length > 0) {
        const normalizedStatus = statusValues.map(normalizeStatus);
        console.log('📊 Status mapping:', { input: statusValues, output: normalizedStatus });

        const includesDraft = normalizedStatus.includes('draft');
        const filteredStatus = normalizedStatus.filter((s) => s !== 'draft');

        // If operator is "not equal" (!=)
        if (operator === '!=') {
          console.log('🔍 Using NOT EQUAL operator');
          
          // Define all possible status values
          const allStatusValues = ['in-progress', 'approved', 'rejected', 'submitted'];
          
          // For "!=" operator, we want statuses that are NOT in the selected values
          const excludedStatuses = filteredStatus;
          const includedStatuses = allStatusValues.filter(status => 
            !excludedStatuses.includes(status)
          );

          console.log('🚫 Excluded statuses:', excludedStatuses);
          console.log('✅ Included statuses:', includedStatuses);

          // If only draft is selected with != operator, we want all API applications
          if (includesDraft && filteredStatus.length === 0) {
            console.log('📝 != operator with only draft selected - returning all API apps + drafts');
            const response = await axios.get(api, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            apiApplications = response.data?.data?.applications || [];
            return [...apiApplications, ...normalizedDrafts];
          }

          // If there are API statuses to exclude
          if (includedStatuses.length > 0) {
            const queryParams = includedStatuses.map((s) => `type=${s}`).join('&');
            const url = `${api}?${queryParams}`;
            
            console.log('🔗 Final API URL for != operator:', url);
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            apiApplications = response.data?.data?.applications || [];
            
            // For != operator with draft included, we want to EXCLUDE drafts from the result
            if (includesDraft) {
              console.log('🚫 Excluding drafts from results due to != operator');
              return apiApplications; // Return only API applications, exclude drafts
            } else {
              return [...apiApplications, ...normalizedDrafts];
            }
          } else {
            // If all statuses are excluded, return empty array for API applications
            console.log('📭 All API statuses excluded - returning only drafts if applicable');
            return includesDraft ? [] : normalizedDrafts;
          }
        } 
        // Original logic for "equal" operator (==)
        else {
          console.log('🔍 Using EQUAL operator');

          // If only draft is selected
          if (includesDraft && filteredStatus.length === 0) {
            return normalizedDrafts;
          }

          // If API statuses are selected
          if (filteredStatus.length > 0) {
            const queryParams = filteredStatus.map((s) => `type=${s}`).join('&');
            const url = `${api}?${queryParams}`;
            
            console.log('🔗 Final API URL for == operator:', url);
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            apiApplications = response.data?.data?.applications || [];
            
            return includesDraft
              ? [...apiApplications, ...normalizedDrafts]
              : apiApplications;
          }
        }
      }

      // ✅ Get all applications when no filters or empty filters
      console.log('🔄 No Application Status filter - fetching all applications');
      const response = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      apiApplications = response.data?.data?.applications || [];

      return [...apiApplications, ...normalizedDrafts];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch applications'
      );
    }
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    applicationsLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllApplications.pending, (state) => {
        state.applicationsLoading = true;
        state.error = null;
      })
      .addCase(getAllApplications.fulfilled, (state, action) => {
        state.applicationsLoading = false;
        state.applications = action.payload;
      })
      .addCase(getAllApplications.rejected, (state, action) => {
        state.applicationsLoading = false;
        state.error = action.payload;
      });
  },
});

export default applicationSlice.reducer;