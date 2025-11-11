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

  // 👇 match API shape fields
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
    isLocalDraft: true, // 🔹 helps UI distinguish
  },
  ...draft, // keep everything else
});

export const getAllApplications = createAsyncThunk(
  'applications/getAllApplications',
  async (status = '', { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const localDraftsRaw = localStorage.getItem('gardaApplicationDrafts');
      const localDrafts = localDraftsRaw ? JSON.parse(localDraftsRaw) : [];
      const normalizedDrafts = localDrafts.map(mapLocalDraftToApplication);

      let apiApplications = [];

      // ✅ COMPREHENSIVE FIX: Map all status values to API format
      const normalizeStatus = (statusValue) => {
        const statusMap = {
          'inprogress': 'in-progress',
          'in-progress': 'in-progress', // already correct
          'approved': 'approved',
          'rejected': 'rejected',
          'submitted': 'submitted',
          'draft': 'draft'
        };
        return statusMap[statusValue] || statusValue;
      };

      if (Array.isArray(status)) {
        const normalizedStatus = status.map(normalizeStatus);
        console.log('📊 Status mapping:', { input: status, output: normalizedStatus });
        
        const includesDraft = normalizedStatus.includes('draft');
        const filteredStatus = normalizedStatus.filter((s) => s !== 'draft');

        // ... rest of the code remains the same
        if (includesDraft && filteredStatus.length === 0) {
          return normalizedDrafts;
        }

        if (filteredStatus.length > 0) {
          const queryParams = filteredStatus.map((s) => `type=${s}`).join('&');
          const url = `${api}?${queryParams}`;
          console.log('🔄 Final API URL:', url);
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

      // ... rest of the cases remain the same
      if (typeof status === 'string' && status !== '') {
        const normalizedStatus = normalizeStatus(status);
        console.log('📊 Single status mapping:', { input: status, output: normalizedStatus });
        
        if (normalizedStatus === 'draft') {
          return normalizedDrafts;
        } else {
          const url = `${api}?type=${normalizedStatus}`;
          console.log('🔄 Final API URL:', url);
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          apiApplications = response.data?.data?.applications || [];
          return apiApplications;
        }
      }

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
