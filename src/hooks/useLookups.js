// // hooks/useLookups.js
// import { useSelector, shallowEqual } from 'react-redux'; 
// import { selectAllFormLookups,selectRawLookups } from '../features/LookupsSlice';

// export const useLookups = () => {
//   return useSelector(state => ({
//     // Grouped data
//     titleOptions: selectAllFormLookups(state).titleOptions,
//     genderOptions: selectAllFormLookups(state).genderOptions,
//     workLocationOptions: selectAllFormLookups(state).workLocationOptions,
//     gradeOptions: selectAllFormLookups(state).gradeOptions,
//     sectionOptions: selectAllFormLookups(state).sectionOptions,
//     membershipCategoryOptions: selectAllFormLookups(state).membershipCategoryOptions,
//     paymentTypeOptions: selectAllFormLookups(state).paymentTypeOptions,
//     branchOptions: selectAllFormLookups(state).branchOptions,
//     regionOptions: selectAllFormLookups(state).regionOptions,
//     secondarySectionOptions: selectAllFormLookups(state).secondarySectionOptions,
//     countryOptions: selectAllFormLookups(state).countryOptions,
    
//     // Raw data
//     rawLookups: selectRawLookups(state),
//     areLookupsLoaded: selectRawLookups(state).length > 0
//   }), shallowEqual); // ✅ shallowEqual prevents unnecessary re-renders
// };