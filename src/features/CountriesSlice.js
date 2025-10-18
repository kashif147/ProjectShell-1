import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch countries');
        }
    }
);

// Helper function to transform countries data to label-value format
const transformCountriesData = (countriesData) => {
    if (!Array.isArray(countriesData)) {
        return [];
    }

    return countriesData.map(country => ({
        label: country.displayname || country.name || 'Unknown',
        value: country._id
    })).filter(item => item.value); // Remove items with null/undefined values
};

const countriesSlice = createSlice({
  name: "countries",
  initialState: {
    loadingC: false,
    errorC: null,
    countriesData: [], // Original API data
    countriesOptions: [], // Transformed label-value data
  },
  reducers: {
    // Optional: Add synchronous actions if needed
    clearCountriesError: (state) => {
        state.errorC = null;
    },
    clearCountriesData: (state) => {
        state.countriesData = [];
        state.countriesOptions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loadingC = true;
        state.errorC = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loadingC = false;
        state.countriesData = action.payload;
        
        // Transform and set the countries options data
        state.countriesOptions = transformCountriesData(action.payload);
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loadingC = false;
        state.errorC = action.payload;
        state.countriesOptions = []; // Clear options on error
      });
  },
});

// Export actions
export const { clearCountriesError, clearCountriesData } = countriesSlice.actions;

export default countriesSlice.reducer;