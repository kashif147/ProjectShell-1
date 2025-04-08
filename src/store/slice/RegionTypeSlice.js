// regionTypeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../../utils/Utilities';

// Fetch all region types
export const getAllRegionTypes = createAsyncThunk(
    'regionTypes/getAllRegionTypes',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/regiontype`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            // return rejectWithValue(error.response?.data?.message || 'Failed to fetch region types');
        }
    }
);

// Add new region type
export const addRegionType = createAsyncThunk(
    'regionTypes/addRegionType',
    async (newRegionType, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${baseURL}/regiontypes`, newRegionType, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            // return rejectWithValue(error.response?.data?.message || 'Failed to add region type');
        }
    }
);

// Update existing region type
export const updateRegionType = createAsyncThunk(
    'regionTypes/updateRegionType',
    async ({ id, updatedRegionType }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${baseURL}/regiontypes/${id}`, updatedRegionType, {
                 headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            // return rejectWithValue(error.response?.data?.message || 'Failed to update region type');
        }
    }
);

// Delete region type
export const deleteRegionType = createAsyncThunk(
    'regionTypes/deleteRegionType',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${baseURL}/regiontypes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id; // returning the id for filtering in the reducer
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete region type');
        }
    }
);

const regionTypeSlice = createSlice({
    name: 'regionTypes',
    initialState: {
        regionTypes: [],
        regionTypesLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllRegionTypes.pending, (state) => {
                state.regionTypesLoading = true;
                state.error = null;
            })
            .addCase(getAllRegionTypes.fulfilled, (state, action) => {
                state.regionTypesLoading = false;
                state.regionTypes = action.payload;
            })
            .addCase(getAllRegionTypes.rejected, (state, action) => {
                state.regionTypesLoading = false;
                state.error = action.payload;
            })
            .addCase(addRegionType.pending, (state) => {
                state.regionTypesLoading = true;
                state.error = null;
            })
            .addCase(addRegionType.fulfilled, (state, action) => {
                state.regionTypesLoading = false;
                state.regionTypes.push(action.payload);
            })
            .addCase(addRegionType.rejected, (state, action) => {
                state.regionTypesLoading = false;
                state.error = action.payload;
            })
            .addCase(updateRegionType.pending, (state) => {
                state.regionTypesLoading = true;
                state.error = null;
            })
            .addCase(updateRegionType.fulfilled, (state, action) => {
                state.regionTypesLoading = false;
                const index = state.regionTypes.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.regionTypes[index] = action.payload;
                }
            })
            .addCase(updateRegionType.rejected, (state, action) => {
                state.regionTypesLoading = false;
                state.error = action.payload;
            })
            .addCase(deleteRegionType.pending, (state) => {
                state.regionTypesLoading = true;
                state.error = null;
            })
            .addCase(deleteRegionType.fulfilled, (state, action) => {
                state.regionTypesLoading = false;
                state.regionTypes = state.regionTypes.filter(item => item._id !== action.payload);
            })
            .addCase(deleteRegionType.rejected, (state, action) => {
                state.regionTypesLoading = false;
                state.error = action.payload;
            });
    },
});

export default regionTypeSlice.reducer;
