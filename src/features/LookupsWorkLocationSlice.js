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
                `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/lookup/${sampleWorkLocationId}/hierarchy`,
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
    const hierarchyLookup = {};
    
    // Process hierarchy array and individual region/branch objects
    const allHierarchyItems = [
        ...apiData.hierarchy,
        apiData.region,
        apiData.branch
    ].filter(Boolean); // Remove any null/undefined values

    allHierarchyItems.forEach(item => {
        if (!item || !item.lookuptypeId) return;
        
        const lookupType = item.lookuptypeId.lookuptype;
        const formattedItem = {
            label: item.DisplayName || item.lookupname,
            value: item._id
        };

        if (!hierarchyLookup[lookupType]) {
            hierarchyLookup[lookupType] = [];
        }

        // Avoid duplicates by checking if item with same value already exists
        const exists = hierarchyLookup[lookupType].some(existingItem => 
            existingItem.value === formattedItem.value
        );
        
        if (!exists) {
            hierarchyLookup[lookupType].push(formattedItem);
        }
    });

    return hierarchyLookup;
};

// Create the slice
const lookupsWorkLocationSlice = createSlice({
    name: 'lookupsWorkLocation',
    initialState: {
        workLocationHierarchy: null,
        hierarchyLookup: {}, // New state for transformed data
        workLocationLoading: false,
        workLocationError: null,
    },
    reducers: {
        clearWorkLocationHierarchy: (state) => {
            state.workLocationHierarchy = null;
            state.hierarchyLookup = {};
            state.workLocationError = null;
        },
        clearWorkLocationError: (state) => {
            state.workLocationError = null;
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
                
                // Transform and set the hierarchy lookup data
                state.hierarchyLookup = transformHierarchyData(action.payload);
            })
            .addCase(getWorkLocationHierarchy.rejected, (state, action) => {
                state.workLocationLoading = false;
                state.workLocationError = action.payload;
                state.hierarchyLookup = {};
            });
    },
});

// Export actions
export const { clearWorkLocationHierarchy, clearWorkLocationError } = lookupsWorkLocationSlice.actions;

export default lookupsWorkLocationSlice.reducer;