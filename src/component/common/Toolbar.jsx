import React, { useState } from "react";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import { Button, Input } from "antd";
import { useDispatch } from "react-redux";
import { getAllApplications } from "../../features/ApplicationSlice";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";

const Toolbar = () => {
  const dispatch = useDispatch();
  const {
    visibleFilters,
    filterOptions,
    filtersState,
    updateFilter,
    resetFilters,
  } = useFilters();

  const location = useLocation();
  const [batchName, setBatchName] = useState("");

  const handleFilterApply = (filterData) => {
    const { label, operator, selectedValues } = filterData;
    console.log("🔄 Applying filter:", {
      filter: label,
      values: selectedValues,
      operator: operator,
      count: selectedValues.length,
    });

    updateFilter(label, operator, selectedValues);
  };

  const handleSearch = () => {
    const cleanedFilters = {};
    Object.keys(filtersState).forEach((key) => {
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

  const handleBatchSearch = () => {
    let batchType = "";
    const nav = location.pathname;
    if (nav.toLowerCase().includes("newgraduate")) {
      batchType = "new-graduate";
    } else if (nav.toLowerCase().includes("cornmarketrewards")) {
      batchType = "inmo-rewards";
    } else if (nav.toLowerCase().includes("recruitafriend")) {
      batchType = "recruit-friend";
    }

    if (batchType) {
      dispatch(
        fetchBatchesByType({
          type: batchType,
          batchName: batchName,
          page: 1,
          limit: 500,
        })
      );
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting all filters");
    resetFilters();
    dispatch(getAllApplications({}));
  };

  const activeScreenName = location?.pathname;

  const getScreenFromPath = () => {
    const pathMap = {
      "/applications": "Applications",
      "/Summary": "Profile",
      "/membership": "Membership",
      "/Members": "Members",
      "/CommunicationBatchDetail": "Communication",
    };
    return pathMap[activeScreenName] || "Applications";
  };

  const activeScreen = getScreenFromPath();
  const specialRoutes = [
    "/RecruitAFriend",
    "/CornMarketRewards",
    "/NewGraduate",
    "/Deductions",
    "/StandingOrders",
    "/DirectDebit",
    "/Import",
    "/Batches",
    "/Cheque",
    "/DirectDebit",
    "/InAppNotifications"
  ];

  if (specialRoutes.includes(location.pathname)) {
    return (
      <div
        className="d-flex justify-content-between align-items-center flex-wrap mb-2"
        style={{ rowGap: "10px" }}
      >
        <div className="d-flex align-items-center flex-wrap gap-2">
          <div style={{ flex: "0 0 450px" }}>
            <Input
              className="my-input-field"
              placeholder="Search Batch Name"
              style={{
                height: "30px",
                borderRadius: "4px",
                color: "gray",
              }}
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleBatchSearch}
            style={{
              backgroundColor: "#45669d",
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
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-between align-items-center flex-wrap mb-2"
      style={{ rowGap: "10px" }}
    >
      <div className="d-flex align-items-center flex-wrap gap-2">
        {/* Search input */}
        <div style={{ flex: "0: 0 250px" }}>
          <Input
            className="my-input-field"
            placeholder={
              location.pathname === "/CasesSummary"
                ? "Search Case ID, team, or stakeholder"
                : location.pathname === "/EventsSummary"
                  ? "Search Event ID or Name"
                  : "Membership No or Surname"
            }
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
          if (
            options.length === 0 &&
            !["Email", "Membership No"].includes(label)
          ) {
            return null;
          }

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
            backgroundColor: "#45669d",
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
    </div>
  );
};

export default Toolbar;