// regionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../utils/Utilities';

let token; 
 

export const fetchRegions = createAsyncThunk(
    'regions/fetchRegions',
    async (_, { rejectWithValue }) => {
        try { 
            token = localStorage.getItem('token')
            const response = await axios.get(`${baseURL}/regiontype`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in headers
                    'Content-Type': 'application/json',
                },
            });
            return response.data; // Assuming the API returns an array of regions
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to fetch regions');
        }
    }
);

export const addRegion = createAsyncThunk(
    'regions/addRegion',
    async (newRegion, { rejectWithValue }) => {
        try {
            const response = await axios.post(baseURL, newRegion, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in headers
                },
            });
            return response.data; // Return the added region
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to add region');
        }
    }
);

export const updateRegion = createAsyncThunk(
    'regions/updateRegion',
    async ({ id, updatedRegion }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${baseURL}/${id}`, updatedRegion, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in headers
                },
            });
            return response.data; // Return the updated region
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to update region');
        }
    }
);

export const deleteRegion = createAsyncThunk(
    'regions/deleteRegion',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            // Make DELETE request to delete the region
            await axios.delete(`${baseURL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in headers
                },
            });
            
            // Dispatch the action to fetch all regions after deletion
            dispatch(fetchRegions()); // Ensure you call the correct function to refresh regions
            
            return id; // Return the id of the deleted region
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to delete region');
        }
    }
);


const regionSlice = createSlice({
    name: 'regions',
    initialState: {
        regions: [],
        loading: false,
        error: null,
    },
    reducers: {}, // You can define synchronous actions if needed
    extraReducers: (builder) => {
        builder
            // Fetching regions
            .addCase(fetchRegions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.loading = false;
                state.regions = action.payload;
            })
            .addCase(fetchRegions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Adding a region
            .addCase(addRegion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addRegion.fulfilled, (state, action) => {
                state.loading = false;
                state.regions.push(action.payload); // Add the new region to the list
            })
            .addCase(addRegion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Updating a region
            .addCase(updateRegion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRegion.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.regions.findIndex(region => region.id === action.payload.id);
                if (index !== -1) {
                    state.regions[index] = action.payload; // Update the region in the list
                }
            })
            .addCase(updateRegion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Deleting a region
            .addCase(deleteRegion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRegion.fulfilled, (state, action) => {
                state.loading = false;
                state.regions = state.regions.filter(region => region.id !== action.payload); // Remove the deleted region
            })
            .addCase(deleteRegion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default regionSlice.reducer;
