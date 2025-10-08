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
import refreshReducer from "../features/RefreshSlice";
import contactTypeReducer from "../features/ContactTypeSlice";
import contactReducer from "../features/ContactSlice";
// import countriesReducer from './countrySlice';
// import countriesReducer from "../features/CountrySlice";
import menuLblReducer from "../features/MenuLblSlice";
import applicationReducer from "../features/ApplicationSlice";
import applicationDetailsReducer from "../features/ApplicationDetailsSlice";
import tenantReducer from "../features/TenantSlice";
import userReducer from "../features/UserSlice";
import roleReducer from "../features/RoleSlice";
import permissionReducer from "../features/PermissionSlice";
import roleByIdReducer from "../features/PermissionSlice";
import productTypesReducer from "../features/ProductTypesSlice";
import productsReducer from "../features/ProductsSlice";
import productTypesWithProductsReducer from "../features/ProducttypeWithProducts";
import countriesReducer from "../features/CountriesSlice"; // Countries slice

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
    contact: contactReducer,
    menuLbl: menuLblReducer,
    // countries: countriesReducer,
    applications: applicationReducer,
    applicationDetails: applicationDetailsReducer,
    tenants: tenantReducer,
    users: userReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    roleById: roleByIdReducer,
    productTypes: productTypesReducer,
    products: productsReducer,
    productTypesWithProducts: productTypesWithProductsReducer,
    countries: countriesReducer,
  },
});

export default store;
