import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

const FilterContext = createContext();

// 🔹 Common filters that should appear on all screens (will appear AFTER screen-specific filters)
const COMMON_FILTERS = ["Grade","Work Location",  "Region", "Branch"];

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

  // 🔹 Visible filters and saved states
  const [visibleFilters, setVisibleFilters] = useState(
    defaultVisibleFilters["Applications"]
  );
  const location = useLocation();
  const activeScreenName = location?.pathname;
  const [filtersState, setFiltersState] = useState(
    defaultFilterValues["Applications"] || {}
  );

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

  useEffect(() => {
    setActivePage(activeScreen);
  }, [activeScreen]);

  // 🔹 Reset filters when changing page
  useEffect(() => {
    console.log("Switching to page:", activeScreen);
    console.log("Default visible filters for", activeScreen, ":", getDefaultVisibleFilters(activeScreen));
    
    const newVisibleFilters = getDefaultVisibleFilters(activeScreen);
    const newFilterValues = defaultFilterValues[activeScreen] || {};
    
    console.log("Setting visible filters:", newVisibleFilters);
    console.log("Setting filter values:", newFilterValues);
    
    setVisibleFilters(newVisibleFilters);
    setFiltersState(newFilterValues);
  }, [activeScreen]);

  // 🔹 Helper functions
  const toggleFilter = (filter, checked) => {
    setVisibleFilters((prev) =>
      checked ? [...prev, filter] : prev.filter((f) => f !== filter)
    );
  };

  const resetFilters = () => {
    console.log("Resetting filters for:", activePage);
    const resetVisibleFilters = getDefaultVisibleFilters(activePage);
    const resetFilterValues = defaultFilterValues[activePage] || {};
    
    console.log("Reset visible filters:", resetVisibleFilters);
    console.log("Reset filter values:", resetFilterValues);
    
    setVisibleFilters(resetVisibleFilters);
    setFiltersState(resetFilterValues);
  };

  const updateFilterValues = (filter, values) => {
    setFiltersState((prev) => ({
      ...prev,
      [filter]: {
        ...(prev[filter] || { operator: "==" }),
        selectedValues: values,
      },
    }));
  };

  const updateFilterOperator = (filter, operator) => {
    setFiltersState((prev) => ({
      ...prev,
      [filter]: {
        ...(prev[filter] || { selectedValues: [] }),
        operator,
      },
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