// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/AuthSlice'; // Auth slice
import regionReducer from '../features/RegionSlice'; // Region slice
import lookupsTypeReducer from '../features/RegionSlice'; // This should be the correct path for lookups type

const store = configureStore({
    reducer: {
        auth: authReducer,          // Authentication state
        regions: regionReducer,      // Regions state
        lookupsTypes: lookupsTypeReducer, // Ensure this is the correct lookups type reducer
    },
});

// Optional: Log Redux store state for debugging
if (process.env.NODE_ENV !== 'production') {
    store.subscribe(() => {
        console.log('Current State:', store.getState());
    });
}

export default store;
