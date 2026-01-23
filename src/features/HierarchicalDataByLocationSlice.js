// hierarchicalDataByLocationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch hierarchical data by location ID (lookupId)
export const getHierarchicalDataByLocation = createAsyncThunk(
    'hierarchicalDataByLocation/fetchHierarchicalDataByLocation',
    async (lookupId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_POLICY_SERVICE_URL}/lookup/by-type/68d036e2662428d1c504b3ad/hierarchy/${lookupId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                lookupId,
                data: response.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || `Failed to fetch hierarchical data for location ${lookupId}`);
        }
    }
);

// Create the slice
const hierarchicalDataByLocationSlice = createSlice({
    name: 'hierarchicalDataByLocation',
    initialState: {
        hierarchicalData: {}, // Object to store multiple location data by lookupId
        hierarchicalDataLoading: false,
        hierarchicalDataError: null,
    },
    reducers: {
        // Clear specific location data
        clearLocationData: (state, action) => {
            const lookupId = action.payload;
            delete state.hierarchicalData[lookupId];
        },
        // Clear all location data
        clearAllLocationData: (state) => {
            state.hierarchicalData = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getHierarchicalDataByLocation.pending, (state) => {
                state.hierarchicalDataLoading = true;
                state.hierarchicalDataError = null;
            })
            .addCase(getHierarchicalDataByLocation.fulfilled, (state, action) => {
                state.hierarchicalDataLoading = false;
                state.hierarchicalDataError = null;
                // Store data by lookupId for easy access
                state.hierarchicalData[action.payload.lookupId] = action.payload.data;
            })
            .addCase(getHierarchicalDataByLocation.rejected, (state, action) => {
                state.hierarchicalDataLoading = false;
                state.hierarchicalDataError = action.payload;
            });
    },
});

export const { clearLocationData, clearAllLocationData } = hierarchicalDataByLocationSlice.actions;
export default hierarchicalDataByLocationSlice.reducer;