import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // or your existing axios import

// ===============================
// Thunk: Get Corn Market Batch By ID
// ===============================
export const getCornMarketBatchById = createAsyncThunk(
    "cornMarketBatch/getById",
    async (batchId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_PROFILE_SERVICE_URL}/batches/${batchId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Failed to fetch batch detail"
            );
        }
    }
);

// ===============================
// Slice
// ===============================
const getCornMarketBatchByIdSlice = createSlice({
    name: "cornMarketBatchById",
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCornMarketBatchById: (state) => {
            state.data = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCornMarketBatchById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCornMarketBatchById.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getCornMarketBatchById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// ===============================
// Exports
// ===============================
export const { clearCornMarketBatchById } =
    getCornMarketBatchByIdSlice.actions;

export default getCornMarketBatchByIdSlice.reducer;
