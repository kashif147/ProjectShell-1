import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";

const PROFILE_TEMPLATES_API_URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;
const SUBSCRIPTION_TEMPLATES_API_URL = `${getSubscriptionServiceBaseUrl().replace(/\/v1$/, "")}/templates`;

const resolveTemplatesApiUrl = (type) => {
    const normalizedType = String(type || "").trim().toLowerCase();
    if (normalizedType === "member" || normalizedType === "members") {
        return SUBSCRIPTION_TEMPLATES_API_URL;
    }
    return PROFILE_TEMPLATES_API_URL;
};

// Async thunk to fetch templates
export const getGridTemplates = createAsyncThunk(
    "templetefiltrsclumnapi/getGridTemplates",
    async (params = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = resolveTemplatesApiUrl(params?.type);
            const response = await axios.get(apiUrl, {
                params: params?.type ? { type: params.type } : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data.templates; // Matches { systemDefault: {}, userTemplates: [] }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
    {
        condition: (_, { getState }) =>
            !getState().templetefiltrsclumnapi.templatesFetching,
    }
);

// Async thunk to delete a template
export const deleteGridTemplate = createAsyncThunk(
    "templetefiltrsclumnapi/deleteGridTemplate",
    async ({ id, type }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = resolveTemplatesApiUrl(type);
            await axios.delete(`${apiUrl}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(getGridTemplates(type ? { type } : {})); // Refresh list
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
            const apiUrl = resolveTemplatesApiUrl(payload?.templateType);
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(
                getGridTemplates(
                    payload?.templateType ? { type: payload.templateType } : {}
                )
            ); // Refresh list
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
            const apiUrl = resolveTemplatesApiUrl(payload?.templateType);
            const URL = `${apiUrl}/${id}`;
            const response = await axios.put(URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(
                getGridTemplates(
                    payload?.templateType ? { type: payload.templateType } : {}
                )
            ); // Refresh list
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunk to set a template as default
export const setDefaultGridTemplate = createAsyncThunk(
    "templetefiltrsclumnapi/setDefaultGridTemplate",
    async ({ id, isDefault, type }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = resolveTemplatesApiUrl(type);
            const URL = `${apiUrl}/${id}`;
            await axios.put(
                URL,
                { isDefault },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            dispatch(getGridTemplates(type ? { type } : {})); // Refresh list
            return { id, isDefault };
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
        /** Only toggled by getGridTemplates — avoids blocking fetch while delete/save uses `loading`. */
        templatesFetching: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getGridTemplates.pending, (state) => {
                state.loading = true;
                state.templatesFetching = true;
                state.error = null;
            })
            .addCase(getGridTemplates.fulfilled, (state, action) => {
                state.loading = false;
                state.templatesFetching = false;
                state.templates = action.payload;
            })
            .addCase(getGridTemplates.rejected, (state, action) => {
                state.loading = false;
                state.templatesFetching = false;
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
            .addCase(setDefaultGridTemplate.pending, (state) => {
                state.loading = true;
            })
            .addCase(setDefaultGridTemplate.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(setDefaultGridTemplate.rejected, (state, action) => {
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
