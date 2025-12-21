// In your Toolbar component
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

  const handleFilterApply = (filterData) => {
    const { label, operator, selectedValues } = filterData;
    
    // ✅ Update filter state in context
    updateFilterValues(label, selectedValues);
    updateFilterOperator(label, operator);
  };

  const handleSearch = () => {
    // ✅ Pass the entire filtersState from context to the slice
    console.log("🔍 Dispatching with filters:", filtersState);
    dispatch(getAllApplications(filtersState)); // ✅ Pass filters as parameter
  };

  const handleReset = () => {
    // ✅ Reset filters in context
    resetFilters();
    console.log("🔄 Filters reset");
    // Fetch all applications (pass empty object)
    dispatch(getAllApplications({}));
  };

  const location = useLocation();
  const activeScreenName = location?.pathname;
  
  const getScreenFromPath = () => {
    const pathMap = {
      '/applications': 'Applications',
      '/profile': 'Profile', 
      '/membership': 'Membership',
        "/Members": "Members"
    };
    return pathMap[activeScreenName] || 'Applications';
  };
  
  const activeScreen = getScreenFromPath();

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
            placeholder="Membership No or Surname"
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
          style={{
            backgroundColor: '#091e420a', 
            borderRadius: '4px',
            border: 'none', 
            height: '32px',
            fontWeight: '500'
          }}
        >
          Reset
        </Button>

        <Button
          onClick={handleSearch}
          style={{
            backgroundColor: '#091e420a', 
            borderRadius: '4px',
            border: 'none', 
            height: '32px',
            fontWeight: '500'
          }}
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;