import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:3500/auth";

// 🔹 Refresh Token API Call
export const refreshAccessToken = createAsyncThunk(
    "auth/refresh",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${baseURL}/refresh`, {
                withCredentials: true,  // Required for cookies
            });

            return response.data;  // { accessToken: "newTokenHere" }
        } catch (error) {
            return rejectWithValue(error.response?.data || "Token refresh failed");
        }
    }
);

// 🔹 Redux Slice
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: localStorage.getItem("token") || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(refreshAccessToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.accessToken;
                localStorage.setItem("token", action.payload.accessToken);
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
