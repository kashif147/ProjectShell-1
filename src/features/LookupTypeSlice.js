// regionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../utils/Utilities';

// Fetch all lookups type
export const getAllLookupsType = createAsyncThunk(
    'lookupsType/getAllLookupsType',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Moved token initialization here
            const response = await axios.get(`${baseURL}/regiontype`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('API response:', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookups');
        }
    }
);

// Add new lookups type
export const addLookupsType = createAsyncThunk(
    'lookupsType/addLookupsType',
    async (newLookupsType, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Moved token initialization here
            const response = await axios.post(`${baseURL}/regiontype`, newLookupsType, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add lookups type');
        }
    }
);

// Update existing lookups type
export const updateLookupsType = createAsyncThunk(
    'lookupsType/updateLookupsType',
    async ({ id, updatedLookupsType }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Moved token initialization here
            const response = await axios.put(`${baseURL}/regiontype/${id}`, updatedLookupsType, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update lookups type');
        }
    }
);

// Delete lookups type
export const deleteLookupsType = createAsyncThunk(
    'lookupsType/deleteLookupsType',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Moved token initialization here
            await axios.delete(`${baseURL}/regiontype/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id; // returning the id for filtering in the reducer
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete lookups type');
        }
    }
);

const lookupsTypeSlice = createSlice({
    name: 'lookupsTypes',
    initialState: {
        lookupsType: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllLookupsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllLookupsType.fulfilled, (state, action) => {
                state.loading = false;
                state.lookupsType = action.payload;
                console.log('Lookups type updated:', action.payload);
            })
            .addCase(getAllLookupsType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addLookupsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addLookupsType.fulfilled, (state, action) => {
                state.loading = false;
                state.lookupsType.push(action.payload);
            })
            .addCase(addLookupsType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateLookupsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLookupsType.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.lookupsType.findIndex(item => item._id === action.payload._id); // Use _id here
                if (index !== -1) {
                    state.lookupsType[index] = action.payload;
                }
            })
            .addCase(updateLookupsType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteLookupsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLookupsType.fulfilled, (state, action) => {
                state.loading = false;
                state.lookupsType = state.lookupsType.filter(item => item._id !== action.payload); // Use _id here
            })
            .addCase(deleteLookupsType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default lookupsTypeSlice.reducer;
