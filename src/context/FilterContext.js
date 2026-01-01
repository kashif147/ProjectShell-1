import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "../features/LookupsSlice";
import { getCategoryLookup } from "../features/CategoryLookupSlice";
import { 
    getHierarchicalDataByLocation, 
    clearLocationData 
} from "../features/HierarchicalDataByLocationSlice";
import { getWorkLocationHierarchy } from "../features/LookupsWorkLocationSlice";

const FilterContext = createContext();

// 🔹 Common filters that should appear on all screens (will appear AFTER screen-specific filters)
const COMMON_FILTERS = ["Grade", "Work Location", "Region", "Branch"];

export const FilterProvider = ({ children }) => {
  const dispatch = useDispatch();

  // 🔹 Get lookups from Redux store
  const {
    gradeOptions,
    workLocationOptions,
    regionOptions,
    branchOptions,
    membershipCategoryOptions,
    paymentTypeOptions,
    genderOptions,
    sectionOptions,
  } = useSelector((state) => state.lookups);

  // 🔹 Get category data from categoryLookup slice
  const { categoryData, error, currentCategoryId } = useSelector(
    (state) => state.categoryLookup
  );

  // 🔹 Get hierarchical data
  const { 
    hierarchicalData, 
    hierarchicalDataLoading 
  } = useSelector((state) => state.hierarchicalDataByLocation);

  // 🔹 Track selected work location for hierarchical loading
  const [selectedWorkLocationId, setSelectedWorkLocationId] = useState(null);

  // 🔹 Fetch lookups and categories on mount
  useEffect(() => {
    dispatch(getAllLookups());
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, [dispatch]);

  // 🔹 Helper to convert lookup options to filter format
  const getLookupOptions = (lookupArray) => {
    if (!lookupArray || !Array.isArray(lookupArray)) {
      return [""];
    }
    
    const options = lookupArray.map(item => item.label);
    return ["", ...options];
  };

  // 🔹 Helper to get hierarchical region options based on selected work location
  const getHierarchicalRegionOptions = () => {
    // If no work location selected, return warning message
    if (!selectedWorkLocationId) {
      return ["⚠️ Please select Work Location first"];
    }

    // Check if we have hierarchical data for this location
    const locationData = hierarchicalData[selectedWorkLocationId];
    
    if (!locationData) {
      // Data not loaded yet, return loading message
      if (hierarchicalDataLoading) {
        return ["Loading..."];
      }
      return [""]; // Empty response - waiting for data or no data
    }

    // Check if regions array exists and has data
    if (!locationData.regions || !Array.isArray(locationData.regions)) {
      return [""]; // No regions data
    }

    // Check if there are regions
    if (locationData.regions.length === 0) {
      return [""]; // Empty response - no regions available
    }

    // Return region options from hierarchical data
    const regionOptions = locationData.regions.map(region => region.label || region.name);
    return ["", ...regionOptions];
  };

  // 🔹 Helper to get hierarchical branch options based on selected region
  const getHierarchicalBranchOptions = (selectedRegion) => {
    // If no work location selected, return warning message
    if (!selectedWorkLocationId) {
      return ["⚠️ Please select Work Location first"];
    }

    // If no region selected, return empty options
    if (!selectedRegion || selectedRegion === "") {
      return [""];
    }

    // Check if we have hierarchical data for this location
    const locationData = hierarchicalData[selectedWorkLocationId];
    
    if (!locationData || !Array.isArray(locationData.regions)) {
      return [""]; // No data available
    }

    // Find the selected region
    const selectedRegionData = locationData.regions.find(
      region => (region.label || region.name) === selectedRegion
    );

    // Check if region data exists and has branches
    if (!selectedRegionData) {
      return [""]; // Region not found
    }

    if (!selectedRegionData.branches || !Array.isArray(selectedRegionData.branches)) {
      return [""]; // No branches data
    }

    // Check if there are branches
    if (selectedRegionData.branches.length === 0) {
      return [""]; // Empty response - no branches available
    }

    // Return branch options from the selected region
    const branchOptions = selectedRegionData.branches.map(branch => branch.label || branch.name);
    return ["", ...branchOptions];
  };

  // 🔹 Helper to convert category data to filter format
  const getCategoryOptions = () => {
    if (!categoryData || !Array.isArray(categoryData)) {
      return [""];
    }
    
    const options = categoryData.map(item => {
      return item.label || item.name || item.lookupname || "";
    }).filter(label => label);
    
    return ["", ...options];
  };

  // 🔹 All possible filters per screen
  const viewFilters = useMemo(
    () => ({
      Applications: [
        "Membership Category",
        "Application Status",
        "Submission Date",
        "Email (Preferred)",
        "Mobile No",
        "Grade",
        "Section (Primary Section)",
        "Work Location",
        "Branch",
        "Region",
        "Payment Type",
        "Payroll No",
      ],
      Profile: [
        "Membership No",
        "Email",
        "Mobile No",
        "Date of Birth",
        "Gender",
        "Address",
        "Membership Category",
        "Work Location",
        "Branch",
        "Region",
        "Grade",
        "Section (Primary)",
        "Retired Date",
        "Pension Number",
        "Payroll No",
        "NMBI No",
        "Speciality",
        "Another Union Member",
        "Consent",
        "Income Protection",
        "INMO Rewards",
        "Partner Consent",
      ],
      Membership: [
        "Membership No",
        "Email",
        "Mobile No",
        "Membership Status",
        "Membership Category",
        "Work Location",
        "Branch",
        "Region",
        "Grade",
        "Section (Primary)",
        "Joining Date",
        "Expiry Date",
        "Last Payment Amount",
        "Last Payment Date",
        "Membership Fee",
        "Outstanding Balance",
        "Reminder No",
        "Reminder Date",
        "Cancellation Flag",
      ],
      Members: [
        "Subscription Status",
        "Membership Category",
        "Payment Type",
        "Payment Frequency",
        "Subscription Year",
        "Start Date",
        "End Date",
        "Rollover Date",
        "Membership Movement",
        "Payroll No",
        "Consent",
        "Created At",
        "Updated At",
        "Cancellation/Reinstated",
        "Work Location",
        "Grade",
        "Branch",
        "Region",
      ],
    }),
    []
  );

  // 🔹 Screen-specific default filters
  const screenSpecificDefaultFilters = {
    Applications: ["Application Status", "Membership Category"],
    Profile: ["Email", "Membership Category"],
    Membership: ["Membership Status", "Membership Category"],
    Members: ["Subscription Status", "Membership Category"],
  };

  // 🔹 Helper to get default visible filters for a screen
  const getDefaultVisibleFilters = (screen) => {
    const screenSpecific = screenSpecificDefaultFilters[screen] || [];
    const availableCommonFilters = COMMON_FILTERS.filter(filter =>
      viewFilters[screen]?.includes(filter)
    );
    return [...screenSpecific, ...availableCommonFilters];
  };

  // 🔹 Default visible filters for each screen
  const defaultVisibleFilters = useMemo(() => ({
    Applications: getDefaultVisibleFilters("Applications"),
    Profile: getDefaultVisibleFilters("Profile"),
    Membership: getDefaultVisibleFilters("Membership"),
    Members: getDefaultVisibleFilters("Members"),
  }), []);

  // 🔹 Default filter VALUES for each screen
  const defaultFilterValues = useMemo(() => ({
    Applications: {
      "Application Status": {
        operator: "==",
        selectedValues: ["Draft", "Submitted"]
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    Profile: {
      "Email": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    Membership: {
      "Membership Status": {
        operator: "==",
        selectedValues: ["Active"]
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    Members: {
      "Subscription Status": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    }
  }), []);

  // 🔹 Active page
  const [activePage, setActivePage] = useState("Applications");

  // 🔹 Store filter states for each screen
  const [screenFilterStates, setScreenFilterStates] = useState({
    Applications: {
      visibleFilters: defaultVisibleFilters["Applications"],
      filtersState: defaultFilterValues["Applications"] || {}
    },
    Profile: {
      visibleFilters: defaultVisibleFilters["Profile"],
      filtersState: defaultFilterValues["Profile"] || {}
    },
    Membership: {
      visibleFilters: defaultVisibleFilters["Membership"],
      filtersState: defaultFilterValues["Membership"] || {}
    },
    Members: {
      visibleFilters: defaultVisibleFilters["Members"],
      filtersState: defaultFilterValues["Members"] || {}
    }
  });

  // 🔹 Current screen's states - use the activePage to get the correct state
  const currentScreenState = screenFilterStates[activePage] || {
    visibleFilters: defaultVisibleFilters[activePage] || [],
    filtersState: defaultFilterValues[activePage] || {}
  };

  const [visibleFilters, setVisibleFilters] = useState(currentScreenState.visibleFilters);
  const [filtersState, setFiltersState] = useState(currentScreenState.filtersState);

  const location = useLocation();
  const activeScreenName = location?.pathname;

  const getScreenFromPath = () => {
    const pathMap = {
      '/applications': 'Applications',
      '/Summary': 'Profile',
      '/membership': 'Membership',
      "/Members": "Members"
    };
    return pathMap[activeScreenName] || 'Applications';
  };

  const activeScreen = getScreenFromPath();

  // 🔹 When screen changes, save current state and load new screen's state
  useEffect(() => {
    if (activeScreen === activePage) return;

    console.log("Switching from:", activePage, "to:", activeScreen);

    // Save current screen's state
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        visibleFilters: [...visibleFilters],
        filtersState: { ...filtersState }
      }
    }));

    // Switch to new screen
    setActivePage(activeScreen);

    // Load new screen's saved state
    const savedState = screenFilterStates[activeScreen];
    if (savedState) {
      setVisibleFilters(savedState.visibleFilters);
      setFiltersState(savedState.filtersState);
    } else {
      // If no saved state, use defaults
      setVisibleFilters(defaultVisibleFilters[activeScreen] || []);
      setFiltersState(defaultFilterValues[activeScreen] || {});
    }
  }, [activeScreen]);

  // 🔹 Effect to handle Work Location selection changes
  useEffect(() => {
    const currentWorkLocation = filtersState["Work Location"]?.selectedValues?.[0];
    
    if (currentWorkLocation) {
      // Get the lookup ID for the selected work location
      const workLocationId = getLookupIdFromLabel("Work Location", currentWorkLocation);
      
      if (workLocationId && workLocationId !== selectedWorkLocationId) {
        console.log(`Loading hierarchical data for Work Location: ${currentWorkLocation} (ID: ${workLocationId})`);
        setSelectedWorkLocationId(workLocationId);
        
        // Clear previous hierarchical data for this location if it exists
        if (selectedWorkLocationId) {
          // dispatch(clearLocationData(selectedWorkLocationId));
        }
        
        // Fetch hierarchical data for the selected work location
        dispatch(getWorkLocationHierarchy(workLocationId));
      }
    } else {
      // No work location selected, clear the hierarchical data
      if (selectedWorkLocationId) {
        // dispatch(clearLocationData(selectedWorkLocationId));
      }
      setSelectedWorkLocationId(null);
    }
  }, [filtersState["Work Location"], workLocationOptions]);

  // 🔹 Effect to clear Region and Branch when Work Location changes
  useEffect(() => {
    if (selectedWorkLocationId && filtersState["Work Location"]?.selectedValues?.[0]) {
      // Keep current region if it exists in hierarchical data
      const locationData = hierarchicalData[selectedWorkLocationId];
      const currentRegion = filtersState["Region"]?.selectedValues?.[0];
      
      if (currentRegion && locationData) {
        const regionExists = locationData.regions?.some(
          region => (region.label || region.name) === currentRegion
        );
        
        if (!regionExists) {
          // Region doesn't exist in new hierarchical data, clear it
          console.log("Clearing region as it doesn't exist in new hierarchical data");
          updateFilter("Region", "==", []);
          updateFilter("Branch", "==", []);
        }
      }
    }
  }, [selectedWorkLocationId, hierarchicalData]);

  // 🔹 Helper to get lookup ID from label for Work Location
  const getLookupIdFromLabel = (filterName, label) => {
    if (filterName === "Work Location" && workLocationOptions) {
      const found = workLocationOptions.find(item => item.label === label);
      return found ? found.value : null;
    }

    if (filterName === "Membership Category" && categoryData) {
      const found = categoryData.find(item => {
        const itemLabel = item.label || item.name || item.lookupname;
        return itemLabel === label;
      });
      return found ? found._id || found.value || found.id : null;
    }

    const lookupMap = {
      "Grade": gradeOptions,
      "Region": regionOptions,
      "Branch": branchOptions,
      "Payment Type": paymentTypeOptions,
      "Gender": genderOptions,
      "Section (Primary)": sectionOptions,
      "Section (Primary Section)": sectionOptions,
    };

    const lookupArray = lookupMap[filterName];
    if (!lookupArray) return null;

    const found = lookupArray.find(item => item.label === label);
    return found ? found.value : null;
  };

  // 🔹 Dynamic filter options from lookups - UPDATED FOR HIERARCHICAL LOADING
  const filterOptions = useMemo(
    () => {
      // Get the currently selected region value
      const selectedRegion = filtersState["Region"]?.selectedValues?.[0] || "";
      
      return {
        // 🔹 CUSTOM FILTERS
        "Application Status": ["", "In-Progress", "Approved", "Rejected", "Submitted", "Draft"],
        "Membership Status": ["", "Active", "Inactive", "Pending", "Cancelled"],
        "Subscription Status": ["", "Active", "Cancelled", "Expired", "Pending"],
        
        // 🔹 CATEGORY FILTER
        "Membership Category": getCategoryOptions(),
        
        // 🔹 WORK LOCATION - from Redux lookups
        "Work Location": getLookupOptions(workLocationOptions || []),
        
        // 🔹 REGION - hierarchical or warning message
        "Region": getHierarchicalRegionOptions(),
        
        // 🔹 BRANCH - hierarchical based on selected region
        "Branch": getHierarchicalBranchOptions(selectedRegion),
        
        // 🔹 OTHER REDUX LOOKUP FILTERS
        "Payment Type": getLookupOptions(paymentTypeOptions || []),
        "Grade": getLookupOptions(gradeOptions || []),
        "Section (Primary)": getLookupOptions(sectionOptions || []),
        "Section (Primary Section)": getLookupOptions(sectionOptions || []),
        "Gender": getLookupOptions(genderOptions || []),

        // 🔹 More custom filters
        "Another Union Member": ["", "Yes", "No"],
        "Consent": ["", "Yes", "No"],
        "Income Protection": ["", "Yes", "No"],
        "INMO Rewards": ["", "Yes", "No"],
        "Partner Consent": ["", "Yes", "No"],
        "Cancellation Flag": ["", "Yes", "No"],
        "Cancellation/Reinstated": ["", "Yes", "No"],
        "Payment Frequency": ["", "Monthly", "Quarterly", "Yearly"],
        "Membership Movement": ["", "New", "Renewal", "Upgrade", "Downgrade"],

        // 🔹 Text input filters
        "Email": [],
        "Membership No": [],
        "Mobile No": [],
        "Email (Preferred)": [],
        "Payroll No": [],
        "Address": [],
        "NMBI No": [],
        "Speciality": [],
        "Pension Number": [],
        "Outstanding Balance": [],
        "Membership Fee": [],
        "Last Payment Amount": [],
        "Reminder No": [],
        "Subscription Year": [],

        // 🔹 Date filters
        "Submission Date": [],
        "Date of Birth": [],
        "Retired Date": [],
        "Joining Date": [],
        "Expiry Date": [],
        "Last Payment Date": [],
        "Reminder Date": [],
        "Start Date": [],
        "End Date": [],
        "Rollover Date": [],
        "Created At": [],
        "Updated At": [],
      };
    },
    [
      workLocationOptions,
      gradeOptions,
      categoryData,
      paymentTypeOptions,
      genderOptions,
      sectionOptions,
      hierarchicalData,
      hierarchicalDataLoading,
      selectedWorkLocationId,
      filtersState, // This is needed for the selected region
    ]
  );

  // 🔹 Helper functions - update both current state and saved state
  const toggleFilter = (filter, checked) => {
    const newVisibleFilters = checked
      ? [...visibleFilters, filter]
      : visibleFilters.filter((f) => f !== filter);

    setVisibleFilters(newVisibleFilters);

    // Update saved state
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        visibleFilters: newVisibleFilters
      }
    }));
  };

  const resetFilters = () => {
    console.log("Resetting filters for:", activePage);
    const resetVisibleFilters = getDefaultVisibleFilters(activePage);
    const resetFilterValues = defaultFilterValues[activePage] || {};

    setVisibleFilters(resetVisibleFilters);
    setFiltersState(resetFilterValues);
    
    // Clear selected work location
    if (selectedWorkLocationId) {
      dispatch(clearLocationData(selectedWorkLocationId));
    }
    setSelectedWorkLocationId(null);

    // Update saved state to defaults
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        visibleFilters: resetVisibleFilters,
        filtersState: resetFilterValues
      }
    }));
  };

  const updateFilterValues = (filter, values) => {
    console.log(`📝 Updating filter "${filter}" with values:`, values);

    const newFilterState = {
      ...filtersState,
      [filter]: {
        ...(filtersState[filter] || { operator: "==" }),
        selectedValues: values,
      },
    };

    console.log(`✅ New filter state for "${filter}":`, newFilterState[filter]);
    
    // If Work Location is being cleared, also clear Region and Branch
    if (filter === "Work Location" && (!values || values.length === 0)) {
      newFilterState["Region"] = { operator: "==", selectedValues: [] };
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
      if (selectedWorkLocationId) {
        dispatch(clearLocationData(selectedWorkLocationId));
      }
      setSelectedWorkLocationId(null);
    }

    // If Region is being cleared, also clear Branch
    if (filter === "Region" && (!values || values.length === 0)) {
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
    }

    setFiltersState(newFilterState);

    // Update saved state
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        filtersState: newFilterState
      }
    }));
  };

  const updateFilterOperator = (filter, operator) => {
    console.log(`📝 Updating filter "${filter}" operator to:`, operator);

    const newFilterState = {
      ...filtersState,
      [filter]: {
        ...(filtersState[filter] || { selectedValues: [] }),
        operator,
      },
    };

    setFiltersState(newFilterState);

    // Update saved state
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        filtersState: newFilterState
      }
    }));
  };

  // 🔹 Combined update function that updates both values and operator at once
  const updateFilter = (filter, operator, selectedValues) => {
    console.log(`🎯 Combined update for "${filter}":`, {
      operator,
      selectedValues
    });

    const newFilterState = {
      ...filtersState,
      [filter]: {
        operator,
        selectedValues,
      },
    };

    // If Work Location is being cleared, also clear Region and Branch
    if (filter === "Work Location" && (!selectedValues || selectedValues.length === 0)) {
      newFilterState["Region"] = { operator: "==", selectedValues: [] };
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
      if (selectedWorkLocationId) {
        dispatch(clearLocationData(selectedWorkLocationId));
      }
      setSelectedWorkLocationId(null);
    }

    // If Region is being cleared, also clear Branch
    if (filter === "Region" && (!selectedValues || selectedValues.length === 0)) {
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
    }

    setFiltersState(newFilterState);

    // Update saved state
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        filtersState: newFilterState
      }
    }));
  };

  const currentPageFilters = useMemo(
    () => viewFilters[activePage] || [],
    [activePage, viewFilters]
  );

  // 🔹 Function to get filters in correct order (screen-specific first, then common)
  const getOrderedVisibleFilters = () => {
    const screenSpecific = screenSpecificDefaultFilters[activePage] || [];
    const visibleCommonFilters = COMMON_FILTERS.filter(filter =>
      visibleFilters.includes(filter)
    );
    const otherFilters = visibleFilters.filter(filter =>
      !screenSpecific.includes(filter) && !COMMON_FILTERS.includes(filter)
    );

    return [...screenSpecific, ...visibleCommonFilters, ...otherFilters];
  };

  const orderedVisibleFilters = getOrderedVisibleFilters();

  return (
    <FilterContext.Provider
      value={{
        activePage,
        setActivePage,
        currentPageFilters,
        visibleFilters: orderedVisibleFilters,
        rawVisibleFilters: visibleFilters,
        toggleFilter,
        resetFilters,
        filterOptions,
        filtersState,
        updateFilterValues,
        updateFilterOperator,
        updateFilter,
        COMMON_FILTERS,
        getDefaultVisibleFilters,
        screenSpecificDefaultFilters,
        // Additional helper functions for lookup integration
        getLookupIdFromLabel,
        // Add hierarchical loading states
        hierarchicalDataLoading,
        selectedWorkLocationId,
        // Add categoryData for direct access if needed
        categoryData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);