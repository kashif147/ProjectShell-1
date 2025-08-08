// authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import MyAlert from "../component/common/MyAlert";

const baseURL = `${process.env.REACT_APP_BASE_URL_DEV}/auth`;
console.log("API Base URL (ENV):", process.env.REACT_APP_BASE_URL_DEV);

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${baseURL}`, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });

            return response.data;
        } catch (error) {
            if (error) {
                return MyAlert('error', 'Login failed Please Try Again.')
            }
            return rejectWithValue(error.message);
        }
});

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
                let token = action.payload?.accessToken;

                if (token) {
                    if (token.startsWith('Bearer ')) {
                        token = token.replace(/^Bearer\s/, '');
                    }
                   localStorage.setItem('token', token);
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default authSlice.reducer;
