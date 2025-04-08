import authReducer from "./slice/AuthSlice"; // Auth slice
// import AuthReducer from './slice/auth.slice';
import regionReducer from './slice/RegionSlice'; // Region slice
// import lookupsTypeReducer from '../features/RegionSlice';
import lookupsTypeReducer from "./slice/LookupTypeSlice";
import lookupsReducer from "./slice/LookupsSlice";
import regionTypeReducer from "./slice/RegionTypeSlice";
import partnerReducer from "./slice/PartnersSlice";
import childrenReducer from "./slice/ChildrenSlice";
import refreshReducer from './slice/RefreshSlice';
import contactTypeReducer from "./slice/ContactTypeSlice";
import contactReducer from "./slice/ContactSlice"


export const rootReducer = {
  // auth: AuthReducer,
  auth: authReducer,
  regions: regionReducer,
  lookups: lookupsReducer,
  lookupsTypes: lookupsTypeReducer,
  regionTypes: regionTypeReducer,
  partner: partnerReducer,
  children: childrenReducer,
  refresh: refreshReducer,
  contactType: contactTypeReducer,
  contact: contactReducer,
};
