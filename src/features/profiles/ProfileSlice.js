import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/profile`;

// -----------------------------
// Thunk: Get All Profiles
// -----------------------------
export const getAllProfiles = createAsyncThunk(
  'profile/getAllProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const profileData = response.data.data; // Safe extraction

      return {
        originalData: response.data,     // Full response
        results: profileData.results || [], // Array of profiles
        count: profileData.count || 0,
        total: profileData.total || 0,
        page: profileData.page || 1,
        limit: profileData.limit || 0,
        totalPages: profileData.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profiles'
      );
    }
  }
);

// -----------------------------
// Slice
// -----------------------------
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    results: [],          // Array of profiles
    originalData: null,   // Full API response
    count: 0,
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0,

    loading: false,
    error: null,

    lastFetched: null,
  },

  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileData: (state) => {
      state.results = [];
      state.originalData = null;
      state.count = 0;
      state.total = 0;
      state.page = 1;
      state.limit = 0;
      state.totalPages = 0;
      state.lastFetched = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllProfiles.fulfilled, (state, action) => {
        state.loading = false;

        state.results = action.payload.results;
        state.originalData = action.payload.originalData;

        state.count = action.payload.count;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;

        state.lastFetched = new Date().toISOString();
        state.error = null;
      })

      .addCase(getAllProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, clearProfileData } = profileSlice.actions;
export default profileSlice.reducer;
