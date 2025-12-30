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
    updateFilter, // Use the new combined update function
    resetFilters,
  } = useFilters();

  const handleFilterApply = (filterData) => {
    const { label, operator, selectedValues } = filterData;
    console.log("🔄 Applying filter:", {
      filter: label,
      values: selectedValues,
      operator: operator,
      count: selectedValues.length
    });
    
    // ✅ Use the new combined update function
    updateFilter(label, operator, selectedValues);
  };

  const handleSearch = () => {
    // ✅ Clean filtersState before dispatching
    const cleanedFilters = {};
    Object.keys(filtersState).forEach(key => {
      if (filtersState[key]?.selectedValues?.length > 0) {
        cleanedFilters[key] = filtersState[key];
      }
    });
    
    console.log("🔍 Dispatching with cleaned filters:", cleanedFilters);
    
    if (Object.keys(cleanedFilters).length > 0) {
      dispatch(getAllApplications(cleanedFilters));
    } else {
      console.log("⚠️ No filters selected, fetching all applications");
      dispatch(getAllApplications({}));
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting all filters");
    // ✅ Reset filters in context
    resetFilters();
    // Fetch all applications (pass empty object)
    dispatch(getAllApplications({}));
  };

  const location = useLocation();
  const activeScreenName = location?.pathname;

  const getScreenFromPath = () => {
    const pathMap = {
      "/applications": "Applications",
      "/Summary": "Profile",
      "/membership": "Membership",
      "/Members": "Members",
    };
    return pathMap[activeScreenName] || "Applications";
  };

  const activeScreen = getScreenFromPath();

  // Debug: Log current filter states
  React.useEffect(() => {
    console.log("📊 Current filtersState:", filtersState);
    console.log("👁️ Visible filters:", visibleFilters);
  }, [filtersState, visibleFilters]);

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
              borderRadius: "4px",
              color: "gray",
            }}
          />
        </div>

        {/* Dynamic filters */}
        {visibleFilters.map((label) => {
          const filterState = filtersState[label];
          const selectedValues = filterState?.selectedValues || [];
          const operator = filterState?.operator || "==";
          const options = filterOptions[label] || [];
          
          // Only show filter if it has options or is a text filter
          if (options.length === 0 && !["Email", "Membership No"].includes(label)) {
            return null;
          }

          console.log(`📋 Rendering filter "${label}":`, {
            selectedValues,
            operator,
            optionCount: options.length,
            badgeCount: selectedValues.length
          });
          
          return (
            <MultiFilterDropdown
              key={label}
              label={label}
              options={options}
              selectedValues={selectedValues}
              operator={operator}
              onApply={handleFilterApply}
            />
          );
        })}

        <SimpleMenu title="More" />

        <Button
          onClick={handleReset}
          style={{
            backgroundColor: "#091e420a",
            borderRadius: "4px",
            border: "none",
            height: "32px",
            fontWeight: "500",
            color: "#42526e",
          }}
        >
          Reset
        </Button>

        <Button
          onClick={handleSearch}
          style={{
            backgroundColor: "#0c66e4",
            borderRadius: "4px",
            border: "none",
            height: "32px",
            fontWeight: "500",
            color: "white",
          }}
        >
          Search
        </Button>
      </div>

      {/* Debug panel - remove in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '5px',
          padding: '5px',
          backgroundColor: '#f5f5f5',
          borderRadius: '3px'
        }}>
          <strong>Debug:</strong> Active screen: {activeScreen} | 
          Active filters: {Object.keys(filtersState).filter(key => 
            filtersState[key]?.selectedValues?.length > 0
          ).length}
        </div>
      )} */}
    </div>
  );
};

export default Toolbar;