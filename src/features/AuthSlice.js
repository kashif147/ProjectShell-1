// authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import MyAlert from "../component/common/MyAlert";
import { updateMenuLbl } from "./MenuLblSlice";

const baseURL = `${process.env.REACT_APP_BASE_URL_DEV}/auth`;
console.log("API Base URL (ENV):", process.env.REACT_APP_BASE_URL_DEV);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}`, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (error) {
        return MyAlert("error", "Login failed Please Try Again.");
      }
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    roles: [],
    permissions: [],
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload.user;
      state.roles = action.payload.roles || [];
      state.permissions = action.payload.permissions || [];
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.roles = [];
      state.permissions = [];
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      sessionStorage.removeItem("userInitialized"); // Clear the user initialization flag
      sessionStorage.removeItem("menuManualSelection"); // Clear menu manual selection flag
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action?.payload;
        state.isAuthenticated = true;

        let token = action.payload?.accessToken;
        let roles = [];
        let permissions = [];

        if (token) {
          if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s/, "");
          }
          localStorage.setItem("token", token);

          // Decode token to extract roles and permissions
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
            );
            const decodedToken = JSON.parse(jsonPayload);

            const rawRoles = decodedToken?.roles || action.payload?.roles || [];
            const rawPermissions =
              decodedToken?.permissions || action.payload?.permissions || [];

            // Convert role objects to role codes for authorization
            roles = rawRoles.map((role) => {
              if (typeof role === "string") return role;
              return role.code || role.name || role;
            });

            permissions = rawPermissions;
          } catch (e) {
            console.error("Error decoding token:", e);
            // Fallback to response data
            roles = action.payload?.roles || [];
            permissions = action.payload?.permissions || [];
          }
        } else {
          // Fallback to response data if no token
          roles = action.payload?.roles || [];
          permissions = action.payload?.permissions || [];
        }

        state.roles = roles;
        state.permissions = permissions;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { setUserData, clearAuth, setLoading, setError } =
  authSlice.actions;
export default authSlice.reducer;
