import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
import authReducer from '../features/AuthSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export default store;