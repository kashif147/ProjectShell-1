import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;

// Async thunk to fetch a specific template by ID
export const getViewById = createAsyncThunk(
    'viewById/getViewById',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/${id}`, {
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
