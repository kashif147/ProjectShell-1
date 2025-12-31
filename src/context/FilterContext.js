import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "../features/LookupsSlice";
import { getCategoryLookup } from "../features/CategoryLookupSlice"; // Add this import

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
    // Add other lookups as needed
  } = useSelector((state) => state.lookups);

  // 🔹 Get category data from categoryLookup slice (same as ApplicationMgtDrawer)
  const { categoryData, error, currentCategoryId } = useSelector(
    (state) => state.categoryLookup
  );

  // 🔹 Fetch lookups and categories on mount
  useEffect(() => {
    dispatch(getAllLookups());
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f")); // Same ID as in ApplicationMgtDrawer
  }, [dispatch]);

  // 🔹 Helper to convert lookup options to filter format (for Redux lookups)
  const getLookupOptions = (lookupArray) => {
    if (!lookupArray || !Array.isArray(lookupArray)) {
      return [""]; // Just return empty option if no data
    }
    
    const options = lookupArray.map(item => item.label);
    // Add empty option at the beginning for clearing selection
    return [ ...options];
  };

  // 🔹 Helper to convert category data to filter format
  const getCategoryOptions = () => {
    if (!categoryData || !Array.isArray(categoryData)) {
      return [""]; // Just return empty option if no data
    }
    
    const options = categoryData.map(item => {
      // Use the same field names as in ApplicationMgtDrawer
      return item.label || item.name || item.lookupname || "";
    }).filter(label => label); // Remove empty labels
    
    // Add empty option at the beginning for clearing selection
    return [ ...options];
  };

  // 🔹 All possible filters per screen (using lookups where available)
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

  // 🔹 Screen-specific default filters (appear FIRST)
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

  // 🔹 Dynamic filter options from lookups
  const filterOptions = useMemo(
    () => ({
      // 🔹 CUSTOM FILTERS - Already have empty option in array (first element)
      "Application Status": [ "In-Progress", "Approved", "Rejected", "Submitted", "Draft"],
      "Membership Status": [ "Active", "Inactive", "Pending", "Cancelled"],
      "Subscription Status": [ "Active", "Cancelled", "Expired", "Pending"],
      
      // 🔹 CATEGORY FILTER - Use categoryData from categoryLookup slice (same as ApplicationMgtDrawer)
      "Membership Category": getCategoryOptions(),
      
      // 🔹 OTHER REDUX LOOKUP FILTERS - Need empty option added
      "Payment Type": getLookupOptions(paymentTypeOptions || []),
      "Region": getLookupOptions(regionOptions || []),
      "Branch": getLookupOptions(branchOptions || []),
      "Grade": getLookupOptions(gradeOptions || []),
      "Work Location": getLookupOptions(workLocationOptions || []),
      "Section (Primary)": getLookupOptions(sectionOptions || []),
      "Section (Primary Section)": getLookupOptions(sectionOptions || []),
      "Gender": getLookupOptions(genderOptions || []),

      // 🔹 More custom filters with empty option already included
      "Another Union Member": ["", "Yes", "No"],
      "Consent": ["", "Yes", "No"],
      "Income Protection": ["", "Yes", "No"],
      "INMO Rewards": ["", "Yes", "No"],
      "Partner Consent": ["", "Yes", "No"],
      "Cancellation Flag": ["", "Yes", "No"],
      "Cancellation/Reinstated": ["", "Yes", "No"],
      "Payment Frequency": ["", "Monthly", "Quarterly", "Yearly"],
      "Membership Movement": ["", "New", "Renewal", "Upgrade", "Downgrade"],

      // 🔹 Text input filters (empty array - no dropdown options)
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

      // 🔹 Date filters (empty array - no dropdown options)
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
    }),
    [
      gradeOptions,
      workLocationOptions,
      regionOptions,
      branchOptions,
      categoryData, // Add categoryData to dependencies
      paymentTypeOptions,
      genderOptions,
      sectionOptions
    ]
  );

  // 🔹 Helper to get lookup ID from label for categories
  const getLookupIdFromLabel = (filterName, label) => {
    if (filterName === "Membership Category" && categoryData) {
      const found = categoryData.find(item => {
        // Check multiple possible field names
        const itemLabel = item.label || item.name || item.lookupname;
        return itemLabel === label;
      });
      return found ? found._id || found.value || found.id : null;
    }

    // For other filters, use the original lookup map
    const lookupMap = {
      "Grade": gradeOptions,
      "Work Location": workLocationOptions,
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

  // 🔹 Helper to get lookup values (for categories)
  const getLookupValues = (lookupName) => {
    if (lookupName === "Membership Category" && categoryData) {
      return categoryData.map(item => ({
        label: item.label || item.name || item.lookupname,
        value: item._id || item.value || item.id
      }));
    }
    
    // For other lookups, return empty array or handle as needed
    return [];
  };

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

  // 🔹 Current screen's states
  const [visibleFilters, setVisibleFilters] = useState(
    screenFilterStates["Applications"].visibleFilters
  );
  const [filtersState, setFiltersState] = useState(
    screenFilterStates["Applications"].filtersState
  );

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

  const activeScreen = getScreenFromPath(activeScreenName);

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
    }
  }, [activeScreen]);

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
        getLookupValues,
        // Add categoryData for direct access if needed
        categoryData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);