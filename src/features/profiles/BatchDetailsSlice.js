import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ===============================
// Thunk: Get Batch Details By ID
// ===============================
export const getBatchDetailsById = createAsyncThunk(
    "batchDetails/getById",
    async (batchId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_PROFILE_SERVICE_URL}/batch-details/${batchId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Failed to fetch batch details"
            );
        }
    }
);

// ===============================
// Thunk: Get All Batch Details
// ===============================
export const getAllBatchDetails = createAsyncThunk(
    "batchDetails/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_PROFILE_SERVICE_URL}/batch-details`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Failed to fetch all batches"
            );
        }
    }
);

// ===============================
// Slice
// ===============================
const batchDetailsSlice = createSlice({
    name: "batchDetails",
    initialState: {
        data: null,
        loading: false,
        error: null,
        allBatches: [],
        allBatchesLoading: false,
        allBatchesError: null,
    },
    reducers: {
        clearBatchDetails: (state) => {
            state.data = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Batch By ID
            .addCase(getBatchDetailsById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBatchDetailsById.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getBatchDetailsById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get All Batches
            .addCase(getAllBatchDetails.pending, (state) => {
                state.allBatchesLoading = true;
                state.allBatchesError = null;
            })
            .addCase(getAllBatchDetails.fulfilled, (state, action) => {
                state.allBatchesLoading = false;
                state.allBatches = action.payload?.data || [];
                state.allBatchesError = null;
            })
            .addCase(getAllBatchDetails.rejected, (state, action) => {
                state.allBatchesLoading = false;
                state.allBatchesError = action.payload;
            });
    },
});

export const { clearBatchDetails } = batchDetailsSlice.actions;
export default batchDetailsSlice.reducer;
