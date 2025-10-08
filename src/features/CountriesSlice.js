import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk using fetch (no axios instance)
// export const fetchCountries = createAsyncThunk(
//   "countries/fetchCountries",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/countries`);
//       if (!response.ok) throw new Error("Failed to fetch countries");
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const fetchCountries = createAsyncThunk(
    "countries/fetchCountries",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/countries`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookups');
        }
    }
);

const countriesSlice = createSlice({
  name: "countries",
  initialState: {
    loadingC: false,
    errorC: null,
    countriesData: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loadingC = true;
        state.errorC = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loadingC = false;
        state.countriesData = action.payload;
        state.countriesData = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loadingC = false;
        state.errorC = action.payload;
      });
  },
});

export default countriesSlice.reducer;
