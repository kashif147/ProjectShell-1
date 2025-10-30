// src/context/FilterContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  // 🔹 View-wise field definitions
  const viewFilters = useMemo(
    () => ({
      Applications: [
        "Full Name",
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
        "Full Name",
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
        "Full Name",
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
    }),
    []
  );

  // 🔹 Filters currently visible (selected by user)
  const [visibleFilters, setVisibleFilters] = useState([]);

  // 🔹 Active page (Applications, Profile, or Membership)
  const [activePage, setActivePage] = useState("Applications");

  // 🔹 Compute filters for the current page
  const currentPageFilters = useMemo(
    () => viewFilters[activePage] || [],
    [activePage, viewFilters]
  );

  // Toggle individual filter visibility
  const toggleFilter = (filter, checked) => {
    setVisibleFilters((prev) =>
      checked ? [...prev, filter] : prev.filter((f) => f !== filter)
    );
  };

  // Reset all filters
  const resetFilters = () => setVisibleFilters([]);

  return (
    <FilterContext.Provider
      value={{
        activePage,
        setActivePage,
        currentPageFilters,
        visibleFilters,
        toggleFilter,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
