// lookupsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../utils/Utilities';
import axiosInstance from "../utils/AxiosInstance";

// Fetch all lookups
export const getAllLookups = createAsyncThunk(
    'lookups/getAllLookups',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get(`${baseURL}/lookup`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookups');
        }
    }
);

// Add new lookup
export const addLookup = createAsyncThunk(
    'lookups/addLookup',
    async (newLookup, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${baseURL}/lookups`, newLookup, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add lookup');
        }
    }
);

// Update existing lookup
export const updateLookup = createAsyncThunk(
    'lookups/updateLookup',
    async ({ id, updatedLookup }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${baseURL}/lookups/${id}`, updatedLookup, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update lookup');
        }
    }
);

// Delete lookup
export const deleteLookup = createAsyncThunk(
    'lookups/deleteLookup',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${baseURL}/lookups/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id; // returning the id for filtering in the reducer
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete lookup');
        }
    }
);

const lookupsSlice = createSlice({
    name: 'lookups',
    initialState: {
        lookups: [],
        lookupsloading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllLookups.pending, (state) => {
                state.lookupsloading = true;
                state.error = null;
            })
            .addCase(getAllLookups.fulfilled, (state, action) => {
            
                state.lookupsloading = false;
                state.lookups = action.payload;
            })
            .addCase(getAllLookups.rejected, (state, action) => {
                state.lookupsloading = false;
                state.error = action.payload;
            })
            .addCase(addLookup.pending, (state) => {
                state.lookupsloading = true;
                state.error = null;
            })
            .addCase(addLookup.fulfilled, (state, action) => {
                state.lookupsloading = false;
                state.lookups.push(action.payload);
            })
            .addCase(addLookup.rejected, (state, action) => {
                state.lookupsloading = false;
                state.error = action.payload;
            })
            .addCase(updateLookup.pending, (state) => {
                state.lookupsloading = true;
                state.error = null;
            })
            .addCase(updateLookup.fulfilled, (state, action) => {
                state.lookupsloading = false;
                const index = state.lookups.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.lookups[index] = action.payload;
                }
            })
            .addCase(updateLookup.rejected, (state, action) => {
                state.lookupsloading = false;
                state.error = action.payload;
            })
            .addCase(deleteLookup.pending, (state) => {
                state.lookupsloading = true;
                state.error = null;
            })
            .addCase(deleteLookup.fulfilled, (state, action) => {
                state.lookupsloading = false;
                state.lookups = state.lookups.filter(item => item._id !== action.payload);
            })
            .addCase(deleteLookup.rejected, (state, action) => {
                state.lookupsloading = false;
                state.error = action.payload;
            });
    },
});

export default lookupsSlice.reducer;
