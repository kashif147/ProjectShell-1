import React from "react";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import { Button, Input } from "antd";
import { useDispatch } from "react-redux";
import { getAllApplications } from "../../features/ApplicationSlice";

const Toolbar = () => {
  const dispatch = useDispatch();
  const { 
    visibleFilters, 
    filterOptions, 
    filtersState, 
    updateFilterValues, 
    updateFilterOperator,
    resetFilters 
  } = useFilters();

  // ✅ Convert filter state to API parameters
 const getApiParametersFromFilters = () => {
  debugger
  const apiParams = [];

  // Handle Application Status filter
  if (filtersState['Application Status']?.selectedValues?.length > 0) {
    const statusValues = filtersState['Application Status'].selectedValues;
    const apiStatusParams = statusValues.map(status => 
      status.toLowerCase() // ✅ JUST lowercase, KEEP THE HYPHEN
    );
    apiParams.push(...apiStatusParams);
    debugger
  }
  
  // Handle Membership Category filter
  // if (filtersState['Membership Category']?.selectedValues?.length > 0) {
  //   const categoryValues = filtersState['Membership Category'].selectedValues;
  //   const apiCategoryParams = categoryValues.map(category => 
  //     category.toLowerCase()
  //   );
  //   apiParams.push(...apiCategoryParams);
  // }
  
  return apiParams;
};

  // ✅ Call API with current filters
 // In Toolbar.js - FIX THIS FUNCTION
const callApplicationsWithFilters = () => {
  const apiParams = getApiParametersFromFilters();
  if (apiParams.length > 0) {
    dispatch(getAllApplications(apiParams)); 
  } else {
    // dispatch(getAllApplications(''));
  }
};

  const handleFilterApply = (filterData) => {
    const { label, operator, selectedValues } = filterData;
    updateFilterValues(label, selectedValues);
    updateFilterOperator(label, operator);
    debugger
    // ✅ Auto-call API when relevant filters are applied
    if (['Application Status', 'Membership Category'].includes(label)) {
      callApplicationsWithFilters();
    }
  };

  const handleSearch = () => {
    // ✅ Use current filters for search
    callApplicationsWithFilters();
  };

  const handleReset = () => {
    resetFilters();
    // ✅ Reset to all applications
    dispatch(getAllApplications());
  };
     const location = useLocation();
     const activeScreenName = location?.pathname
 const getScreenFromPath = (location) => {
    const pathMap = {
      '/applications': 'Applications',
      '/profile': 'Profile', 
      '/membership': 'Membership'
    };
    return pathMap[activeScreenName] || 'Applications';
  };
  const activeScreen = getScreenFromPath(activeScreenName)

  return (
    <div
      className="d-flex justify-content-between align-items-center flex-wrap mb-2"
      style={{ rowGap: "10px" }}
    >
      <div className="d-flex align-items-center flex-wrap gap-2">
        {/* Search input */}
        <div style={{ flex: "0 0 250px" }}>
          <Input
            className="my-input-field"
            placeholder="Reg No or Surname"
            style={{
              height: "30px",
              borderRadius:'4px',
              color: "gray",
            }}
          />
        </div>

        {/* Dynamic filters */}
        {visibleFilters.map((label) => (
          <MultiFilterDropdown
            key={label}
            label={label}
            options={filterOptions[label] || []}
            selectedValues={filtersState[label]?.selectedValues || []}
            operator={filtersState[label]?.operator || "=="}
            onApply={handleFilterApply}
          />
        ))}

        <SimpleMenu title="More" />

        <Button
          onClick={handleReset}
          style={{backgroundColor:'#091e420a', borderRadius:'4px',border:'none', height:'32px',fontWeight:'500'}}
        >
          Reset
        </Button>

        <Button
          onClick={handleSearch}
          style={{backgroundColor:'#091e420a', borderRadius:'4px',border:'none', height:'32px',fontWeight:'500'}}
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;