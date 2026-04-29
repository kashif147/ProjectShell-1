import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";

// ===============================
// Thunk: Get Batch Details By ID
// ===============================
export const getBatchDetailsById = createAsyncThunk(
    "batchDetails/getById",
    async (batchId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${getAccountServiceBaseUrl()}/batch-details/${batchId}`,
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
    async (queryParams = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const params =
                queryParams && typeof queryParams === "object"
                    ? Object.fromEntries(
                          Object.entries(queryParams).filter(
                              ([, v]) => v !== undefined && v !== null && v !== ""
                          )
                      )
                    : {};
            const response = await axios.get(
                `${getAccountServiceBaseUrl()}/batch-details`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    ...(Object.keys(params).length ? { params } : {}),
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
// Thunk: Update Batch Details (multipart)
// ===============================
export const updateBatchDetail = createAsyncThunk(
    "batchDetails/update",
    async ({ batchDetailId, formData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                `${getAccountServiceBaseUrl()}/batch-details/${batchDetailId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response?.data;
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update batch";
            return rejectWithValue(msg);
        }
    }
);

// ===============================
// Thunk: Delete Batch Detail
// ===============================
export const deleteBatchDetail = createAsyncThunk(
    "batchDetails/delete",
    async (batchDetailId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `${getAccountServiceBaseUrl()}/batch-details/${batchDetailId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response?.data;
        } catch (error) {
            const data = error?.response?.data;
            const msg =
                data?.message ||
                error?.message ||
                "Failed to delete batch";
            return rejectWithValue(msg);
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
