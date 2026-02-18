import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;

// Async thunk to fetch templates
export const getGridTemplates = createAsyncThunk(
    "templetefiltrsclumnapi/getGridTemplates",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data.templates; // Matches { systemDefault: {}, userTemplates: [] }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunk to delete a template
export const deleteGridTemplate = createAsyncThunk(
    "templetefiltrsclumnapi/deleteGridTemplate",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(getGridTemplates()); // Refresh list
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunk to save a template
export const saveGridTemplate = createAsyncThunk(
    "templetefiltrsclumnapi/saveGridTemplate",
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(getGridTemplates()); // Refresh list
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunk to update a template
export const updateGridTemplate = createAsyncThunk(
    "templetefiltrsclumnapi/updateGridTemplate",
    async ({ id, payload }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem("token");
            const URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates/${id}`;
            const response = await axios.put(URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(getGridTemplates()); // Refresh list
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunk to pin a template
export const pinGridTemplate = createAsyncThunk(
    "templetefiltrsclumnapi/pinGridTemplate",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem("token");
            const URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates/${id}`;
            await axios.put(
                URL,
                { pinned: true },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            dispatch(getGridTemplates()); // Refresh list
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const templetefiltrsclumnapi = createSlice({
    name: "templetefiltrsclumnapi",
    initialState: {
        templates: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getGridTemplates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getGridTemplates.fulfilled, (state, action) => {
                state.loading = false;
                state.templates = action.payload;
            })
            .addCase(getGridTemplates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteGridTemplate.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteGridTemplate.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteGridTemplate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(saveGridTemplate.pending, (state) => {
                state.loading = true;
            })
            .addCase(saveGridTemplate.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(saveGridTemplate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(pinGridTemplate.pending, (state) => {
                state.loading = true;
            })
            .addCase(pinGridTemplate.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(pinGridTemplate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateGridTemplate.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateGridTemplate.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateGridTemplate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default templetefiltrsclumnapi.reducer;
