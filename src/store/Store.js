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
import lookupsWorkLocationReducer from '../features/LookupsWorkLocationSlice';
import categoryLookupReducer from '../features/CategoryLookupSlice';
// import lookupHierarchyReducer from '../features/lookupHierarchySlice';
import hierarchicalLookupsReducer from '../features/lookupHierarchySlice';
import hierarchicalDataByLocationReducer from '../features/HierarchicalDataByLocationSlice';
import countriesReducer from "../features/CountriesSlice"; // Countries slice
import batchReducer from '../features/BatchesSlice'
import bookmarkReducer from "../features/templete/BookmarkActions";
import profileReducer from "../features/profiles/ProfileSlice";
import profileDetailsReducer from "../features/profiles/ProfileDetailsSlice";
import searchProfileReducer from '../features/profiles/SearchProfile';
import getTemplateReducer from "../features/templete/GetTemplateSlice";
import templeteDetailsReducer from "../features/templete/templeteDetailsSlice"; 
import transferRequestReducer from '../features/profiles/TransferRequest';

const store = configureStore({
  reducer: {
    auth: authReducer, // Authentication state
    regions: regionReducer, // Regions state
    lookups: lookupsReducer,
    lookupsTypes: lookupsTypeReducer,
    searchProfile: searchProfileReducer,
    regionTypes: regionTypeReducer,
    categoryLookup: categoryLookupReducer,
    partner: partnerReducer,
    children: childrenReducer,
    hierarchicalLookups: hierarchicalLookupsReducer,
    refresh: refreshReducer,
    contactType: contactTypeReducer,
    profile: profileReducer,
    contact: contactReducer,
    menuLbl: menuLblReducer,
    applications: applicationReducer,
    applicationDetails: applicationDetailsReducer,
    hierarchicalDataByLocation: hierarchicalDataByLocationReducer,
    tenants: tenantReducer,
    profileDetails: profileDetailsReducer,
    users: userReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    roleById: roleByIdReducer,
    transferRequest: transferRequestReducer,
    productTypes: productTypesReducer,
    products: productsReducer,
    productTypesWithProducts: productTypesWithProductsReducer,
    countries: countriesReducer,
    batches: batchReducer,
    lookupsWorkLocation: lookupsWorkLocationReducer,
    bookmarks: bookmarkReducer,
    getTemplate: getTemplateReducer,
    templeteDetails: templeteDetailsReducer,
    
  },
});

export default store;
