// features/applicationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = `${process.env.REACT_APP_PORTAL_SERVICE}/applications`;

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

      if (Array.isArray(status)) {
        const includesDraft = status.includes('draft');
        const filteredStatus = status.filter((s) => s !== 'draft');

        // ✅ Case 1: only draft
        if (includesDraft && filteredStatus.length === 0) {
          return normalizedDrafts;
        }

        // ✅ Case 2: draft + others
        if (filteredStatus.length > 0) {
          const queryParams = filteredStatus.map((s) => `type=${s}`).join('&');
          const url = `${api}?${queryParams}`;
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

      // ✅ Case 3: single string
      if (typeof status === 'string' && status !== '') {
        if (status === 'draft') {
          return normalizedDrafts;
        } else {
          const url = `${api}?type=${status}`;
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

      // ✅ Case 4: no status
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
