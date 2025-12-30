import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

const FilterContext = createContext();

// 🔹 Common filters that should appear on all screens (will appear AFTER screen-specific filters)
const COMMON_FILTERS = ["Grade", "Work Location", "Region", "Branch"];

export const FilterProvider = ({ children }) => {
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

  // 🔹 Dropdown options per filter
  const filterOptions = useMemo(
    () => ({
      "Application Status": ["In-Progress", "Approved", "Rejected", "Submitted", "Draft"],
      "Membership Category": ["Student", "Full", "Associate", "Retired"],
      "Membership Status": ["Active", "Inactive", "Pending", "Cancelled"],
      "Subscription Status": ["Active", "Cancelled", "Expired", "Pending"],
      "Payment Type": ["Payroll Deduction", "Credit Card", "Bank Transfer"],
      "Gender": ["Male", "Female", "Other"],
      "Region": ["North", "South", "East", "West", "Central"],
      "Branch": ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Belfast"],
      "Grade": ["Staff Nurse", "Clinical Nurse Manager 1", "Clinical Nurse Manager 2", 
                "Clinical Nurse Manager 3", "Advanced Nurse Practitioner", 
                "Director of Nursing", "Student Nurse", "Midwife"],
      "Work Location": ["Hospital", "Community", "Private Practice", "Academic", 
                        "Administrative", "Other"],
      "Email": [], // Will be text input
      "Membership No": [], // Will be text input
    }),
    []
  );

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
        visibleFilters: orderedVisibleFilters, // Return ordered filters
        rawVisibleFilters: visibleFilters, // Original unordered for internal use
        toggleFilter,
        resetFilters,
        filterOptions,
        filtersState,
        updateFilterValues,
        updateFilterOperator,
        updateFilter, // Add this new function
        COMMON_FILTERS,
        getDefaultVisibleFilters,
        screenSpecificDefaultFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);