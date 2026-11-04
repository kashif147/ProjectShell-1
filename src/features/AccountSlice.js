import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAccountServiceBaseUrl } from "../config/serviceUrls";
import {
    buildAttemptsQuery,
    unwrapAttemptsResponse,
} from "../utils/onlinePaymentAttempts";

export const fetchStripePayments = createAsyncThunk(
    "account/fetchStripePayments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${getAccountServiceBaseUrl()}/journal/stripe-payments`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch stripe payments");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Online Payments grid: GET /payments/attempts (one row per persisted payment attempt).
 * arg: { statuses?, from?, to?, cursor?, limit?, append?, requestId? } - `append` concatenates the
 * next cursor page onto the loaded rows; otherwise the rows are replaced.
 */
export const fetchPaymentAttempts = createAsyncThunk(
    "account/fetchPaymentAttempts",
    async (arg = {}, { rejectWithValue }) => {
        try {
            const params = buildAttemptsQuery(arg);
            const response = await fetch(
                `${getAccountServiceBaseUrl()}/payments/attempts?${params.toString()}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch payment attempts");
            }
            return unwrapAttemptsResponse(await response.json());
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    stripePayments: [],
    loading: false,
    error: null,
    paymentAttempts: [],
    paymentAttemptsNextCursor: null,
    paymentAttemptsTotal: 0,
    paymentAttemptsLoading: false,
    paymentAttemptsError: null,
    paymentAttemptsRequestId: null,
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetPaymentAttempts: (state) => {
            state.paymentAttempts = [];
            state.paymentAttemptsNextCursor = null;
            state.paymentAttemptsTotal = 0;
            state.paymentAttemptsError = null;
            state.paymentAttemptsRequestId = null;
            state.paymentAttemptsLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStripePayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStripePayments.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.stripePayments = action.payload;
                } else if (Array.isArray(action.payload?.data?.items)) {
                    state.stripePayments = action.payload.data.items;
                } else if (Array.isArray(action.payload?.data)) {
                    state.stripePayments = action.payload.data;
                } else {
                    state.stripePayments = [];
                    console.error("AccountSlice: Unexpected API response format", action.payload);
                }
            })
            .addCase(fetchStripePayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPaymentAttempts.pending, (state, action) => {
                // Latest request wins: a slower earlier response (old filters) is ignored.
                state.paymentAttemptsRequestId = action.meta.requestId;
                state.paymentAttemptsLoading = true;
                state.paymentAttemptsError = null;
            })
            .addCase(fetchPaymentAttempts.fulfilled, (state, action) => {
                if (state.paymentAttemptsRequestId !== action.meta.requestId) return;
                const { items, nextCursor, total } = action.payload;
                state.paymentAttemptsLoading = false;
                state.paymentAttempts = action.meta.arg?.append
                    ? [...state.paymentAttempts, ...items]
                    : items;
                state.paymentAttemptsNextCursor = nextCursor;
                state.paymentAttemptsTotal = total;
            })
            .addCase(fetchPaymentAttempts.rejected, (state, action) => {
                if (state.paymentAttemptsRequestId !== action.meta.requestId) return;
                state.paymentAttemptsLoading = false;
                state.paymentAttemptsError = action.payload || action.error?.message || "Error";
            });
    },
});

export const { clearError, resetPaymentAttempts } = accountSlice.actions;
export default accountSlice.reducer;
