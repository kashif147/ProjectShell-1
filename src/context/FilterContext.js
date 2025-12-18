import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
const FilterContext = createContext();
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
        "Subscription Status",   // Active / Cancelled / Expired
        "Membership Category",   // membershipCategory
        "Payment Type",          // Payroll Deduction, Direct Debit, etc.
        "Payment Frequency",     // Monthly, Annually
        "Subscription Year",     // 2025, 2026
        "Start Date",            // subscription startDate
        "End Date",              // subscription endDate
        "Rollover Date",         // rolloverDate
        "Membership Movement",   // NewJoin / Renewal / Other
        "Payroll No",            // payrollNo
        "Consent",               // consent flag
        "Created At",            // subscription creation date
        "Updated At",            // last update
        "Cancellation/Reinstated" // cancellation.reinstated
      ],
    }),
    []
  );

  // 🔹 Default visible filters for each screen
  const defaultVisibleFilters = {
    Applications: ["Application Status", "Membership Category"],
    Profile: ["Email"],
    Membership: ["Membership Status"],
  };

  // 🔹 Default filter VALUES for each screen
  const defaultFilterValues = {
    Applications: {
      "Application Status": {
        operator: "==",
        selectedValues: ["Draft", "Submitted"] // ✅ Default for Applications screen
      }
    },
    Profile: {
      "Email": {
        operator: "==",
        selectedValues: [] // No default values for Profile
      }
    },
    Membership: {
      "Membership Status": {
        operator: "==",
        selectedValues: ["Active"] // ✅ Default for Membership screen
      }
    },
    Memebers:{
      "Subscription Status": {
        operator: "==",
        selectedValues: [] // No default values for Profile
      },
      "Membership Category": {
        operator: "==",
        selectedValues: [] // No default values for Profile
      }
    }
  };

  // 🔹 Dropdown options per filter
  const filterOptions = useMemo(
    () => ({
      "Application Status": ["In-Progress", "Approved", "Rejected", "Submitted", "Draft"],
      "Membership Category": ["Student", "Full", "Associate", "Retired"],
      "Membership Status": ["Active", "Inactive", "Pending", "Cancelled"],
      "Payment Type": ["Payroll Deduction", "Credit Card", "Bank Transfer"],
      "Gender": ["Male", "Female", "Other"],
      "Region": ["North", "South", "East", "West"],
      "Branch": ["Dublin", "Cork", "Galway", "Limerick"],
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
  const activeScreenName = location?.pathname
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
  const activeScreen = getScreenFromPath(activeScreenName)
  useEffect(() => {
    setActivePage(activeScreen)
  }, [activeScreen])

  // 🔹 Reset filters when changing page - UPDATED
  useEffect(() => {
    setVisibleFilters(defaultVisibleFilters[activePage] || []);
    setFiltersState(defaultFilterValues[activePage] || {});
  }, [activePage]);

  // 🔹 Helper functions
  const toggleFilter = (filter, checked) => {
    setVisibleFilters((prev) =>
      checked ? [...prev, filter] : prev.filter((f) => f !== filter)
    );
  };

  const resetFilters = () => {
    setVisibleFilters(defaultVisibleFilters[activePage] || []);
    setFiltersState(defaultFilterValues[activePage] || {});
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

  return (
    <FilterContext.Provider
      value={{
        activePage,
        setActivePage,
        currentPageFilters,
        visibleFilters,
        toggleFilter,
        resetFilters,
        filterOptions,
        filtersState,
        updateFilterValues,
        updateFilterOperator,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);