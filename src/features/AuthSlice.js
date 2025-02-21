// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import MyAlert from '../component/common/MyAlert';
// import { useNavigate } from 'react-router-dom';

const baseURL = "http://localhost:3500/auth";

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${baseURL}`, credentials, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.data; 
        } catch (error) {
            if (error) {
                console.log(error,"55")
                return MyAlert('error','Login failed Please Try Again.')
            }
            return rejectWithValue(error.message); 
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
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null; 
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action?.payload;

                // Set the accessToken in localStorage
                if (action.payload?.accessToken) {
                    localStorage.setItem('token', action.payload.accessToken);

                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; 
            });
    },
});

export default authSlice.reducer;
