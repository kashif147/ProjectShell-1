// features/applicationDetailsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseURL = `${process.env.REACT_APP_PORTAL_SERVICE}`
export const getApplicationById = createAsyncThunk(
  'applicationDetails/getApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data.data; // adjust if response shape differs
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch application details');
    }
  }
);

const applicationDetailsSlice = createSlice({
  name: 'applicationDetails',
  initialState: {
    application: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearApplicationDetails: (state) => {
      state.application = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearApplicationDetails } = applicationDetailsSlice.actions;
export default applicationDetailsSlice.reducer;
