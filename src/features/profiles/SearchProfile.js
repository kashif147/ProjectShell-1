// src/redux/slices/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const searchProfiles = createAsyncThunk(
  'searchProfile/searchProfiles',
  async (query, { rejectWithValue }) => {
    try {
      const baseUrl = process.env.REACT_APP_PROFILE_SERVICE_URL;
      const que = String(query).trim();
      
      if (!que) {
        return rejectWithValue('Search query cannot be empty');
      }
      
      const response = await axios.get(`${baseUrl}/profile/search?q=${que}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Network error'
      );
    }
  }
);

const initialState = {
  profileSearchData: [],
  loading: false,
  error: null,
};

const searchProfileSlice = createSlice({
  name: 'searchProfile',  // ← ONLY THIS LINE CHANGED
  initialState,
  reducers: {
    clearResults: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profileSearchData = action.payload;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResults } = searchProfileSlice.actions;
export default searchProfileSlice.reducer;