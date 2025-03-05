/** @format */

// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/AuthSlice"; // Auth slice
import regionReducer from "../features/RegionSlice"; // Region slice
// import lookupsTypeReducer from '../features/RegionSlice';
import lookupsTypeReducer from "../features/LookupTypeSlice";
import lookupsReducer from "../features/LookupsSlice";
import regionTypeReducer from "../features/RegionTypeSlice";
import partnerReducer from "../features/PartnersSlice";
import childrenReducer from "../features/ChildrenSlice";
import refreshReducer from '../features/RefreshSlice';
import contactTypeReducer from "../features/ContactTypeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Authentication state
    regions: regionReducer, // Regions state
    lookups: lookupsReducer,
    lookupsTypes: lookupsTypeReducer,
    regionTypes: regionTypeReducer,
    partner: partnerReducer,
    children: childrenReducer, 
    refresh: refreshReducer,
    contactType: contactTypeReducer,
  },
});

if (process.env.NODE_ENV !== "production") {
  store.subscribe(() => {
    console.log("Current State:", store.getState());
  });
}

export default store;


