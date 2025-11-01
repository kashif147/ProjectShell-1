import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

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
    }),
    []
  );

  // 🔹 Default visible filters for each screen
  const defaultVisibleFilters = {
    Applications: [ "Application Status", "Membership Category"],
    Profile: [ "Email"],
    Membership: ["Membership Status"],
  };

  // 🔹 Current active screen
  const [activePage, setActivePage] = useState("Applications");

  // 🔹 Default visible filters for current page
  const [visibleFilters, setVisibleFilters] = useState(defaultVisibleFilters["Applications"]);

  // ⏩ Whenever page changes, update visible filters accordingly
  useEffect(() => {
    setVisibleFilters(defaultVisibleFilters[activePage] || []);
  }, [activePage]);

  const currentPageFilters = useMemo(
    () => viewFilters[activePage] || [],
    [activePage, viewFilters]
  );

  // Toggle one filter
  const toggleFilter = (filter, checked) => {
    setVisibleFilters((prev) =>
      checked ? [...prev, filter] : prev.filter((f) => f !== filter)
    );
  };

  // Reset filters for current page (back to its defaults)
  const resetFilters = () => {
    setVisibleFilters(defaultVisibleFilters[activePage] || []);
  };

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
