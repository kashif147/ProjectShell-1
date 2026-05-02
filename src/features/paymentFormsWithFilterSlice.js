import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_PAYMENT_FORMS_FILTER_URL ||
  `${process.env.REACT_APP_PROFILE_SERVICE_URL}/payment-forms/filter`;

export const getPaymentFormsWithFilter = createAsyncThunk(
  "paymentFormsWithFilter/getPaymentFormsWithFilter",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return (
        response.data?.data?.paymentForms ||
        response.data?.paymentForms ||
        response.data?.data ||
        []
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch filtered payment forms",
      );
    }
  },
);

const paymentFormsWithFilterSlice = createSlice({
  name: "paymentFormsWithFilter",
  initialState: {
    paymentForms: [],
    currentTemplateId: "",
    activeTemplateId: "",
    isInitialized: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentForms: (state) => {
      state.paymentForms = [];
    },
    setPaymentFormsFromExternal: (state, action) => {
      state.paymentForms = Array.isArray(action.payload) ? action.payload : [];
    },
    setPaymentFormsTemplateId: (state, action) => {
      state.currentTemplateId = action.payload;
      state.activeTemplateId = action.payload;
    },
    setPaymentFormsInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    initializePaymentFormsWithTemplate: (state, action) => {
      state.currentTemplateId = action.payload;
      state.activeTemplateId = action.payload;
      state.isInitialized = true;
    },
    resetPaymentFormsInitialization: (state) => {
      state.currentTemplateId = "";
      state.activeTemplateId = "";
      state.isInitialized = false;
      state.paymentForms = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentFormsWithFilter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentFormsWithFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentForms = action.payload;
        if (action.meta.arg && action.meta.arg.templateId !== undefined) {
          state.currentTemplateId = action.meta.arg.templateId;
          state.activeTemplateId = action.meta.arg.templateId;
        }
      })
      .addCase(getPaymentFormsWithFilter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentForms,
  setPaymentFormsFromExternal,
  setPaymentFormsTemplateId,
  setPaymentFormsInitialized,
  initializePaymentFormsWithTemplate,
  resetPaymentFormsInitialization,
} = paymentFormsWithFilterSlice.actions;

export default paymentFormsWithFilterSlice.reducer;
