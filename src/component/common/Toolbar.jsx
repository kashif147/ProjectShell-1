import React, { useState } from "react";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import { Button, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getApplicationsWithFilter, setTemplateId } from "../../features/applicationwithfilterslice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { transformFiltersForApi } from "../../utils/filterUtils";
import { updateGridTemplate } from "../../features/templete/templetefiltrsclumnapi";
import MyAlert from "./MyAlert";
import { message } from "antd";

const Toolbar = () => {
  const dispatch = useDispatch();
  const {
    visibleFilters,
    filterOptions,
    filtersState,
    updateFilter,
    resetFilters,
  } = useFilters();

  const { columns } = useTableColumns();
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const { templates } = useSelector((state) => state.templetefiltrsclumnapi);
  const location = useLocation();
  const [batchName, setBatchName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Helper to compare current filters with active template filters
  const hasFilterChanges = () => {
    if (!currentTemplateId || !templates) {
      return false;
    }

    // Find the active template
    const allTemplates = [
      ...(templates.userTemplates || []),
      ...(templates.systemDefault ? [templates.systemDefault] : [])
    ];
    const activeTemplate = allTemplates.find(t => t._id === currentTemplateId);
    if (!activeTemplate) {
      return false;
    }

    // Transform current filters to API format for comparison
    const currentApiFilters = transformFiltersForApi(filtersState, columns[getScreenFromPath()] || []);

    // Get template filters
    const templateFilters = activeTemplate.filters || {};

    // Robust comparison: sort keys and values to be order-insensitive
    const normalize = (obj) => {
      const normalized = {};
      Object.keys(obj).sort().forEach(key => {
        const val = obj[key] || {};
        normalized[key] = {
          operator: val.operator || "equal_to",
          values: Array.isArray(val.values) ? [...val.values].map(v => String(v)).sort() : []
        };
      });
      return JSON.stringify(normalized);
    };

    const currentNorm = normalize(currentApiFilters);
    const templateNorm = normalize(templateFilters);
    const changed = currentNorm !== templateNorm;

    if (changed) {
      console.log("🛠️ Save button check: Changes detected", {
        current: currentApiFilters,
        template: templateFilters
      });
    }

    return changed;
  };

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

    const isApplicationsPage = location.pathname === "/applications";

    if (isApplicationsPage) {
      // MembershipApplication will react to filtersState changes
      console.log("🔍 Filters updated, MembershipApplication should re-fetch");
    } else {
      if (Object.keys(cleanedFilters).length > 0) {
        dispatch(getAllApplications(cleanedFilters));
      } else {
        console.log("⚠️ No filters selected, fetching all applications");
        dispatch(getAllApplications({}));
      }
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
    resetFilters();
    if (location.pathname === "/applications") {
      // MembershipApplication will react to filtersState reset
      dispatch(setTemplateId("")); // Also reset template ID on full reset
    } else {
      dispatch(getAllApplications({}));
    }
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

  const handleSave = async () => {
    if (!currentTemplateId) return;

    setIsSaving(true);
    try {
      const activeScreen = getScreenFromPath();
      const currentApiFilters = transformFiltersForApi(filtersState, columns[activeScreen] || []);

      const payload = {
        filters: currentApiFilters
      };

      await dispatch(updateGridTemplate({ id: currentTemplateId, payload })).unwrap();
      MyAlert("success", "Success", "Template updated successfully");
    } catch (error) {
      console.error("Error updating template:", error);
      MyAlert("error", "Error", error?.message || "Failed to update template");
    } finally {
      setIsSaving(false);
    }
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
        <div style={{ flex: "0 0 250px" }}>
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

          // Show all filters that are in visibleFilters
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
        {hasFilterChanges() && (
          <Button
            onClick={handleSave}
            loading={isSaving}
            style={{
              backgroundColor: "#E6F7FF",
              borderRadius: "4px",
              border: "1px solid #91D5FF",
              height: "32px",
              fontWeight: "500",
              color: "#1890FF",
            }}
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;