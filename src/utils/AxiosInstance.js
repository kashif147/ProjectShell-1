import axios from "axios";
import { useDispatch } from 'react-redux'
import { refreshAccessToken, logout } from "../store/slice/RefreshSlice";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3500",
    withCredentials: true,  // Required for cookies
});

// 🔹 Attach Access Token from localStorage to Requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔹 Handle Token Expiry & Refresh Automatically
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const dispatch = useDispatch()
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 🔥 Call Redux to refresh token
                const result = await dispatch(refreshAccessToken());
                const newToken = result.payload?.accessToken;
                if (newToken) {
                    localStorage.setItem("token", newToken);  // Update token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);  // Retry failed request
                }
            } catch (refreshError) {
                dispatch(logout()); // If refresh fails, log out user
                localStorage.removeItem("token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
