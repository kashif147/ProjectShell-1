import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// -----------------------------------------------------
// Thunk: Fetch Profile Applications By ID
// -----------------------------------------------------
export const getProfileApplications = createAsyncThunk(
    "profileApplications/getProfileApplications",
    async ({ profileId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/profile/${profileId}?type=application`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // API format based on screenshot: { status: "success", data: { applications: [...] } }
            if (response.data.status === "success") {
                return response.data.data.applications;
            } else {
                return rejectWithValue("Failed to fetch profile applications");
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// -----------------------------------------------------
// Slice
// -----------------------------------------------------
const profileApplicationsSlice = createSlice({
    name: "profileApplications",
    initialState: {
        profileApplications: [],
        loading: false,
        error: null,
    },

    reducers: {
        clearProfileApplications: (state) => {
            state.profileApplications = [];
            state.loading = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getProfileApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfileApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.profileApplications = action.payload;
            })
            .addCase(getProfileApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch profile applications";
            });
    },
});

export const { clearProfileApplications } = profileApplicationsSlice.actions;
export default profileApplicationsSlice.reducer;
