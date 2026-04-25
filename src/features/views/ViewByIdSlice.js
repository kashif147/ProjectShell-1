import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSubscriptionFilterTemplatesBaseUrl } from "../../config/serviceUrls";

const PROFILE_TEMPLATES_API_URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;
const SUBSCRIPTION_TEMPLATES_API_URL = getSubscriptionFilterTemplatesBaseUrl();

const resolveTemplatesApiUrl = (type) => {
    const normalizedType = String(type || "").trim().toLowerCase();
    if (normalizedType === "member" || normalizedType === "members") {
        return SUBSCRIPTION_TEMPLATES_API_URL;
    }
    return PROFILE_TEMPLATES_API_URL;
};

// Async thunk to fetch a specific template by ID
export const getViewById = createAsyncThunk(
    'viewById/getViewById',
    async (arg, { rejectWithValue }) => {
        try {
            const id = typeof arg === "object" ? arg?.id : arg;
            const type = typeof arg === "object" ? arg?.type : undefined;
            const token = localStorage.getItem('token');
            const apiUrl = resolveTemplatesApiUrl(type);
            const response = await axios.get(`${apiUrl}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch template by ID'
            );
        }
    }
);

const viewByIdSlice = createSlice({
    name: 'viewById',
    initialState: {
        selectedView: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearSelectedView: (state) => {
            state.selectedView = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getViewById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getViewById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedView = action.payload;
            })
            .addCase(getViewById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedView } = viewByIdSlice.actions;
export default viewByIdSlice.reducer;
