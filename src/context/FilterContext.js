import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "../features/LookupsSlice";
import { getCategoryLookup } from "../features/CategoryLookupSlice";
import { getWorkLocationHierarchy } from "../features/LookupsWorkLocationSlice";

const FilterContext = createContext();

// 🔹 Common filters that should appear on all screens
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
  const { categoryData } = useSelector((state) => state.categoryLookup);

  // 🔹 Get hierarchical data from lookupsWorkLocation slice
  const {
    hierarchyData,
    workLocationLoading,
    workLocationError
  } = useSelector((state) => state.lookupsWorkLocation);

  // 🔹 Store hierarchical data by work location ID
  const [hierarchicalData, setHierarchicalData] = useState({});
  const [selectedWorkLocationId, setSelectedWorkLocationId] = useState(null);
  const [regionOptionsForLocation, setRegionOptionsForLocation] = useState([]);
  const [branchOptionsForLocation, setBranchOptionsForLocation] = useState([]);

  // 🔹 Store filter states for each screen
  const [screenFilterStates, setScreenFilterStates] = useState({
    Applications: {
      visibleFilters: [],
      filtersState: {}
    },
    Profile: {
      visibleFilters: [],
      filtersState: {}
    },
    Membership: {
      visibleFilters: [],
      filtersState: {}
    },
    Members: {
      visibleFilters: [],
      filtersState: {}
    },
    OnlinePayment: {
      visibleFilters: [],
      filtersState: {}
    },
    Communication: {
      visibleFilters: [],
      filtersState: {}
    }
  });

  // 🔹 Current screen's states
  const [activePage, setActivePage] = useState("Applications");
  const [visibleFilters, setVisibleFilters] = useState([]);
  const [filtersState, setFiltersState] = useState({});

  const location = useLocation();
  const activeScreenName = location?.pathname;

  // 🔹 Fetch lookups and categories on mount (only if authenticated)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(getAllLookups());
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, [dispatch]);

  // 🔹 Extract region and branch from hierarchyData
  const extractRegionAndBranchFromHierarchy = useCallback((hierarchyData) => {
    console.log("Extracting from hierarchy data:", hierarchyData);

    let regions = [];
    let branches = [];

    // Method 1: Check if hierarchyData has hierarchy array
    if (hierarchyData?.hierarchy && Array.isArray(hierarchyData.hierarchy)) {
      hierarchyData.hierarchy.forEach((item) => {
        if (item.lookuptypeId?.lookuptype === "Region") {
          const regionName = item.DisplayName || item.lookupname;
          if (regionName) regions.push(regionName);
        }
        if (item.lookuptypeId?.lookuptype === "Branch") {
          const branchName = item.DisplayName || item.lookupname;
          if (branchName) branches.push(branchName);
        }
      });
    }

    // Method 2: Check for direct region/branch objects
    if (hierarchyData?.region) {
      const regionName = hierarchyData.region.DisplayName || hierarchyData.region.lookupname;
      if (regionName && !regions.includes(regionName)) regions.push(regionName);
    }

    if (hierarchyData?.branch) {
      const branchName = hierarchyData.branch.DisplayName || hierarchyData.branch.lookupname;
      if (branchName && !branches.includes(branchName)) branches.push(branchName);
    }

    // Method 3: Check if hierarchyData itself has region/branch properties
    if (hierarchyData?.region && typeof hierarchyData.region === "string") {
      if (!regions.includes(hierarchyData.region)) regions.push(hierarchyData.region);
    }

    if (hierarchyData?.branch && typeof hierarchyData.branch === "string") {
      if (!branches.includes(hierarchyData.branch)) branches.push(hierarchyData.branch);
    }

    console.log("Extracted regions:", regions, "branches:", branches);
    return { regions, branches };
  }, []);

  // 🔹 Function to load hierarchical data
  const loadWorkLocationHierarchy = useCallback(async (workLocationId, workLocationLabel, currentFilters) => {
    if (!workLocationId) {
      // Clear everything when no work location is selected
      setSelectedWorkLocationId(null);
      setRegionOptionsForLocation([]);
      setBranchOptionsForLocation([]);

      // Also clear region and branch filters
      updateFilter("Region", "==", [], currentFilters);
      updateFilter("Branch", "==", [], currentFilters);
      return;
    }

    console.log(`Loading hierarchical data for Work Location: ${workLocationLabel} (ID: ${workLocationId})`);
    setSelectedWorkLocationId(workLocationId);

    try {
      // Fetch hierarchical data from API
      const data = await dispatch(getWorkLocationHierarchy(workLocationId)).unwrap();

      // Store the hierarchical data
      setHierarchicalData(prev => ({
        ...prev,
        [workLocationId]: data
      }));

      // Extract region and branch options
      const { regions, branches } = extractRegionAndBranchFromHierarchy(data);

      // Update available options
      setRegionOptionsForLocation(regions);
      setBranchOptionsForLocation(branches);

      console.log("Successfully loaded hierarchical data:", {
        workLocationId,
        regions,
        branches,
        data
      });

      // Clear region and branch filters when work location changes
      updateFilter("Region", "==", [], currentFilters);
      updateFilter("Branch", "==", [], currentFilters);

    } catch (error) {
      console.error("Error loading work location hierarchy:", error);
      setRegionOptionsForLocation([]);
      setBranchOptionsForLocation([]);

      // Clear filters on error
      updateFilter("Region", "==", [], currentFilters);
      updateFilter("Branch", "==", [], currentFilters);
    }
  }, [dispatch, extractRegionAndBranchFromHierarchy]);

  // 🔹 Helper to get screen from path
  const getScreenFromPath = () => {
    const pathMap = {
      '/applications': 'Applications',
      '/Summary': 'Profile',
      '/membership': 'Membership',
      "/members": "Members",
      "/onlinePayment": "OnlinePayment",
      "/CommunicationBatchDetail": "Communication"
    };
    return pathMap[activeScreenName] || 'Applications';
  };

  const activeScreen = getScreenFromPath();

  // 🔹 View filters configuration
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
        "Joining Date",
        "Membership Fee",
        "Outstanding Balance",
        "Reminder No",
        "Reminder Date",
        "Cancellation Flag",
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
      OnlinePayment: [
        "Membership No",
        "Email",
        "Mobile No",
        "Joining Date",
        "Membership Category",
        "Membership Status",
        "Renewal Date",
        "Transaction ID",
        "Paid Amount",
        "Payment Date",
        "Payment Method",
        "Payment Status",
        "Billing Cycle",
      ],
      Communication: [
        "Membership No",
        "Email",
        "Mobile No",
        "Grade",
        "Work Location",
        "Region",
        "Branch",
        "Membership Category",
        "Payment Status",
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
    OnlinePayment: ["Membership Status", "Payment Status"],
    Communication: ["Grade", "Work Location"],
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
    OnlinePayment: getDefaultVisibleFilters("OnlinePayment"),
    Communication: getDefaultVisibleFilters("Communication"),
  }), [],);

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
    },
    OnlinePayment: {
      "Membership Status": {
        operator: "==",
        selectedValues: []
      },
      "Payment Status": {
        operator: "==",
        selectedValues: []
      },
      "Payment Method": {
        operator: "==",
        selectedValues: []
      },
      "Billing Cycle": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      }
    },
    Communication: {
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
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
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      }
    }
  }), []);

  // 🔹 When screen changes, save current state and load new screen's state
  useEffect(() => {
    if (activeScreen === activePage && Object.keys(filtersState).length > 0) return;

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
    if (savedState && Object.keys(savedState.filtersState).length > 0) {
      setVisibleFilters(savedState.visibleFilters);
      setFiltersState(savedState.filtersState);
    } else {
      // If no saved state, use defaults
      setVisibleFilters(defaultVisibleFilters[activeScreen] || []);
      setFiltersState(defaultFilterValues[activeScreen] || {});
    }
  }, [activeScreen]);

  // 🔹 Effect to handle Work Location filter changes
  useEffect(() => {
    const currentWorkLocation = filtersState["Work Location"]?.selectedValues?.[0];

    if (currentWorkLocation) {
      // Get the lookup ID for the selected work location
      const workLocationId = getLookupIdFromLabel("Work Location", currentWorkLocation);

      if (workLocationId && workLocationId !== selectedWorkLocationId) {
        // Load hierarchical data for the selected work location
        loadWorkLocationHierarchy(workLocationId, currentWorkLocation, filtersState);
      }
    } else {
      // No work location selected, clear everything
      loadWorkLocationHierarchy(null, null, filtersState);
    }
  }, [filtersState["Work Location"], workLocationOptions]);

  // 🔹 Helper to convert lookup options to filter format
  const getLookupOptions = (lookupArray) => {
    if (!lookupArray || !Array.isArray(lookupArray)) {
      return [""];
    }

    const options = lookupArray.map(item => item.label);
    return ["", ...options];
  };

  // 🔹 Helper to get hierarchical region options
  const getHierarchicalRegionOptions = () => {
    // If no work location selected, return warning message
    if (!selectedWorkLocationId) {
      return ["⚠️ Please select Work Location first"];
    }

    // If loading, show loading message
    if (workLocationLoading) {
      return ["Loading..."];
    }

    // Use cached region options
    if (regionOptionsForLocation.length === 0) {
      return ["No regions found for this location"];
    }

    return ["", ...regionOptionsForLocation];
  };

  // 🔹 Helper to get hierarchical branch options
  const getHierarchicalBranchOptions = () => {
    // If no work location selected, return warning message
    if (!selectedWorkLocationId) {
      return ["⚠️ Please select Work Location first"];
    }

    // If loading, show loading message
    if (workLocationLoading) {
      return ["Loading..."];
    }

    // Use cached branch options
    if (branchOptionsForLocation.length === 0) {
      return ["No branches found for this location"];
    }

    return ["", ...branchOptionsForLocation];
  };

  // 🔹 Helper to get category options
  const getCategoryOptions = () => {
    if (!categoryData || !Array.isArray(categoryData)) {
      return [""];
    }

    const options = categoryData.map(item => {
      return item.label || item.name || item.lookupname || "";
    }).filter(label => label);

    return ["", ...options];
  };

  // 🔹 Helper to get lookup ID from label
  const getLookupIdFromLabel = (filterName, label) => {
    if (!label) return null;

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

  // 🔹 Dynamic filter options from lookups
  const filterOptions = useMemo(() => {
    return {
      // 🔹 CUSTOM FILTERS
      "Application Status": ["", "In-Progress", "Approved", "Rejected", "Submitted", "Draft"],
      "Membership Status": ["", "Active", "Inactive", "Pending", "Cancelled"],
      "Subscription Status": ["", "Active", "Cancelled", "Expired", "Pending"],

      // 🔹 CATEGORY FILTER
      "Membership Category": getCategoryOptions(),

      // 🔹 WORK LOCATION - from Redux lookups
      "Work Location": getLookupOptions(workLocationOptions || []),

      // 🔹 REGION - hierarchical loading
      "Region": getHierarchicalRegionOptions(),

      // 🔹 BRANCH - hierarchical loading
      "Branch": getHierarchicalBranchOptions(),

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
      "Payment Method": ["", "Credit Card", "PayPal", "Debit Card", "Stripe"],
      "Payment Status": ["", "Paid", "Pending", "Failed", "Refunded"],
      "Billing Cycle": ["", "Annual", "Monthly"],

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
      "Transaction ID": [],
      "Paid Amount": [],

      // 🔹 Date filters
      "Submission Date": [],
      "Date of Birth": [],
      "Retired Date": [],
      "Joining Date": [],
      "Expiry Date": [],
      "Last Payment Date": [],
      "Reminder Date": [],
      "Renewal Date": [],
      "Payment Date": [],
      "Start Date": [],
      "End Date": [],
      "Rollover Date": [],
      "Created At": [],
      "Updated At": [],
    };
  }, [
    workLocationOptions,
    gradeOptions,
    categoryData,
    paymentTypeOptions,
    genderOptions,
    sectionOptions,
    selectedWorkLocationId,
    regionOptionsForLocation,
    branchOptionsForLocation,
    workLocationLoading,
  ]);

  // 🔹 Helper functions
  const toggleFilter = (filter, checked) => {
    const newVisibleFilters = checked
      ? [...visibleFilters, filter]
      : visibleFilters.filter((f) => f !== filter);

    setVisibleFilters(newVisibleFilters);

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

    // Clear hierarchical data
    setSelectedWorkLocationId(null);
    setRegionOptionsForLocation([]);
    setBranchOptionsForLocation([]);
    setHierarchicalData({});

    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        visibleFilters: resetVisibleFilters,
        filtersState: resetFilterValues
      }
    }));
  };

  // 🔹 Combined update function
  const updateFilter = (filter, operator, selectedValues, customFiltersState = null) => {
    const currentState = customFiltersState || filtersState;

    console.log(`🎯 Updating filter "${filter}":`, {
      operator,
      selectedValues,
      currentFilters: currentState
    });

    const newFilterState = {
      ...currentState,
      [filter]: {
        operator,
        selectedValues,
      },
    };

    // If Work Location is being cleared, also clear Region and Branch
    if (filter === "Work Location" && (!selectedValues || selectedValues.length === 0)) {
      newFilterState["Region"] = { operator: "==", selectedValues: [] };
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
      loadWorkLocationHierarchy(null, null, newFilterState);
    }

    // If Region is being cleared, also clear Branch
    if (filter === "Region" && (!selectedValues || selectedValues.length === 0)) {
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
    }

    // Only update state if we're not using a custom filters state
    if (!customFiltersState) {
      setFiltersState(newFilterState);

      setScreenFilterStates(prev => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          filtersState: newFilterState
        }
      }));
    }

    return newFilterState;
  };

  // 🔹 Individual update functions for backward compatibility
  const updateFilterValues = (filter, values) => {
    const operator = filtersState[filter]?.operator || "==";
    updateFilter(filter, operator, values);
  };

  const updateFilterOperator = (filter, operator) => {
    const selectedValues = filtersState[filter]?.selectedValues || [];
    updateFilter(filter, operator, selectedValues);
  };

  const currentPageFilters = useMemo(
    () => viewFilters[activePage] || [],
    [activePage, viewFilters]
  );

  // 🔹 Function to get filters in correct order
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
        updateFilter,
        updateFilterValues,
        updateFilterOperator,
        COMMON_FILTERS,
        getDefaultVisibleFilters,
        screenSpecificDefaultFilters,
        getLookupIdFromLabel,
        workLocationLoading,
        selectedWorkLocationId,
        regionOptionsForLocation,
        branchOptionsForLocation,
        loadWorkLocationHierarchy,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);