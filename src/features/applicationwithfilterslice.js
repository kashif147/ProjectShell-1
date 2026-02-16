import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/filter`;

export const getApplicationsWithFilter = createAsyncThunk(
    'applicationWithFilter/getApplicationsWithFilter',
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            // Assuming response.data.data.applications based on standard project patterns
            return response.data?.data?.applications || response.data?.applications || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch filtered applications'
            );
        }
    }
);

const applicationWithFilterSlice = createSlice({
    name: 'applicationWithFilter',
    initialState: {
        applications: [],
        currentTemplateId: "",
        isInitialized: false,
        loading: false,
        error: null,
    },
    reducers: {
        clearApplications: (state) => {
            state.applications = [];
        },
        setTemplateId: (state, action) => {
            state.currentTemplateId = action.payload;
        },
        setInitialized: (state, action) => {
            state.isInitialized = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getApplicationsWithFilter.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getApplicationsWithFilter.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload;
                // Update currentTemplateId from the arg passed to thunk if available
                if (action.meta.arg && action.meta.arg.templateId !== undefined) {
                    state.currentTemplateId = action.meta.arg.templateId;
                }
            })
            .addCase(getApplicationsWithFilter.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearApplications, setTemplateId, setInitialized } = applicationWithFilterSlice.actions;
export default applicationWithFilterSlice.reducer;
