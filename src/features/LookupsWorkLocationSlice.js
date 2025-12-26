// lookupsWorkLocationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch work location hierarchy
export const getWorkLocationHierarchy = createAsyncThunk(
    'lookupsWorkLocation/fetchWorkLocationHierarchy',
    async (sampleWorkLocationId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_POLICY_SERVICE_URL}/lookup/${sampleWorkLocationId}/hierarchy`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch work location hierarchy');
        }
    }
);

// Helper function to transform hierarchy data
const transformHierarchyData = (apiData) => {
    const hierarchyData = {
        branch: "",
        region: ""
    };
    
    if (!apiData) return hierarchyData;
    
    // Process individual region and branch objects
    if (apiData.region && apiData.region._id) {
        hierarchyData.region = apiData.region._id;
    }
    
    if (apiData.branch && apiData.branch._id) {
        hierarchyData.branch = apiData.branch._id;
    }

    return hierarchyData;
};

// Create the slice
const lookupsWorkLocationSlice = createSlice({
    name: 'lookupsWorkLocation',
    initialState: {
        workLocationHierarchy: null,
        hierarchyData: { branch: "", region: "" }, // Changed to object structure
        workLocationLoading: false,
        workLocationError: null,
    },
    reducers: {
        clearWorkLocationHierarchy: (state) => {
            state.workLocationHierarchy = null;
            state.hierarchyData = { branch: "", region: "" };
            state.workLocationError = null;
        },
        clearWorkLocationError: (state) => {
            state.workLocationError = null;
        },
        setHierarchyData: (state, action) => {
            state.hierarchyData = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWorkLocationHierarchy.pending, (state) => {
                state.workLocationLoading = true;
                state.workLocationError = null;
            })
            .addCase(getWorkLocationHierarchy.fulfilled, (state, action) => {
                state.workLocationLoading = false;
                state.workLocationError = null;
                state.workLocationHierarchy = action.payload;
                
                // Transform and set the hierarchy data
                state.hierarchyData = transformHierarchyData(action.payload);
            })
            .addCase(getWorkLocationHierarchy.rejected, (state, action) => {
                state.workLocationLoading = false;
                state.workLocationError = action.payload;
                state.hierarchyData = { branch: "", region: "" };
            });
    },
});

// Export actions
export const { 
    clearWorkLocationHierarchy, 
    clearWorkLocationError,
    setHierarchyData 
} = lookupsWorkLocationSlice.actions;

// Export the async thunk

// Export the reducer as default
export default lookupsWorkLocationSlice.reducer;