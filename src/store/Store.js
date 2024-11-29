// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/AuthSlice'; // Auth slice
import regionReducer from '../features/RegionSlice'; // Region slice
// import lookupsTypeReducer from '../features/RegionSlice'; 
import lookupsTypeReducer from '../features/LookupTypeSlice'
import lookupsReducer from '../features/LookupsSlice'
const store = configureStore({
    reducer: {
        auth: authReducer,          // Authentication state
        regions: regionReducer,      // Regions state
        // lookupsTypes: lookupsTypeReducer, 
        lookups: lookupsReducer, 
        lookupsTypes: lookupsTypeReducer

    },
});

if (process.env.NODE_ENV !== 'production') {
    store.subscribe(() => {
        console.log('Current State:', store.getState());
    });
}

export default store;
