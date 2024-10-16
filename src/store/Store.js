import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
import authReducer from '../features/AuthSlice';
import regionReducer from '../features/RegionSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        regions: regionReducer,
    },
});

export default store;