// features/applicationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = `${process.env.REACT_APP_PORTAL_SERVICE}/applications`

// Fetch all applications
export const getAllApplications = createAsyncThunk(
  'applications/getAllApplications',
  async (status = '', { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const url = status ? `${api}?type=${status}` : api;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data?.data?.applications || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
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
