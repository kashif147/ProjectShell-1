import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchStripePayments = createAsyncThunk(
    "account/fetchStripePayments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_ACCOUNT_SERVICE_URL}/journal/stripe-payments`,
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

const initialState = {
    stripePayments: [],
    loading: false,
    error: null,
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
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
            });
    },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;
