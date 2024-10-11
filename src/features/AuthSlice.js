// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseURL = "https://node-api-app-dxecgpajapacc4gs.northeurope-01.azurewebsites.net"
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${baseURL}/auth`, credentials, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.data; // Successful login data
        } catch (error) {
            // If the request was made but the server responded with an error
            if (error.response) {
                return rejectWithValue(error.response.data.message || 'Login failed');
            }
            // If the request was made but no response was received
            return rejectWithValue(error.message); // Handle network errors
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null; 
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; 
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; 
            });
    },
});

export default authSlice.reducer;
