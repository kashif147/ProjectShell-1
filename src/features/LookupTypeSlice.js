// lookupsTypeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../utils/Utilities';

// Fetch all lookup types
export const getLookupTypes = createAsyncThunk(
    'lookupsType/fetchLookupTypes',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token
            const apiBaseUrl = process.env.REACT_APP_POLICY_SERVICE_URL || baseURL;
            
            if (!apiBaseUrl) {
                return rejectWithValue("API base URL is not configured");
            }
            
            const response = await axios.get(`${apiBaseUrl}/api/lookuptype`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in headers
                    'Content-Type': 'application/json',
                },
            });
            return response.data; // Assuming the API returns an array of lookup types
        } catch (error) {
            // Silently handle 500 errors - backend may be temporarily unavailable
            if (error.response?.status === 500) {
                console.warn("Lookup types service temporarily unavailable");
                return [];
            }
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookup types');
        }
    }
);

// Create the slice
const lookupsTypeSlice = createSlice({
    name: 'lookupsType',
    initialState: {
        lookupsTypes: [],
        lookupsTypesloading: false,
        lookupsTypeerror: null,
    },
    reducers: {}, // Synchronous actions can be defined here if needed
    extraReducers: (builder) => {
        builder
            .addCase(getLookupTypes.pending, (state) => {
                state.lookupsTypesloading = true;
                state.lookupsTypeerror = null;
            })
            .addCase(getLookupTypes.fulfilled, (state, action) => {
                state.lookupsTypeerror = false;
                state.lookupsTypesloading = false;
                state.lookupsTypes = action.payload; // Set the fetched lookup types
            })
            .addCase(getLookupTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Set the error message
            });
    },
});

export default lookupsTypeSlice.reducer;
