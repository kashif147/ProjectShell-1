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
import { transformFiltersForApi, transformFiltersFromApi } from "../../utils/filterUtils";
import { updateGridTemplate, getGridTemplates } from "../../features/templete/templetefiltrsclumnapi";
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
    applyTemplateFilters,
  } = useFilters();

  const { columns, updateSelectedTemplate, selectedTemplates } = useTableColumns();
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const { templates } = useSelector((state) => state.templetefiltrsclumnapi);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to compare current filters with active template filters
  const hasFilterChanges = () => {
    if (!currentTemplateId || !templates) return false;

    const activeScreenForMapping = getScreenFromPath();
    let activeTemplate = selectedTemplates[activeScreenForMapping.toLowerCase()];

    // Fallback to Redux templates if context hasn't been synced yet
    if (!activeTemplate && templates) {
      const allTemplates = [
        ...(templates.userTemplates || []),
        ...(templates.systemDefault ? [templates.systemDefault] : [])
      ];
      activeTemplate = allTemplates.find(t => t._id === currentTemplateId);
    }

    if (!activeTemplate) return false;

    const currentApiFilters = transformFiltersForApi(filtersState, columns[activeScreenForMapping] || []);
    const templateFilters = activeTemplate.filters || {};

    const normalize = (obj) => {
      const normalized = {};
      Object.keys(obj).sort().forEach(key => {
        const val = obj[key] || {};
        // Combine values and selectedValues to handle different API response formats
        const rawValues = val.values || val.selectedValues || [];
        const values = Array.isArray(rawValues)
          ? [...rawValues].map(v => String(v).toLowerCase()).sort()
          : [];

        // Only include if there are values selected
        if (values.length > 0) {
          // Standardize operator naming
          let op = val.operator || "equal_to";
          if (op === "==") op = "equal_to";
          if (op === "!=") op = "not_equal";

          normalized[key] = {
            operator: op,
            values
          };
        }
      });
      return JSON.stringify(normalized);
    };

    const currentNorm = normalize(currentApiFilters);
    const templateNorm = normalize(templateFilters);
    const changed = currentNorm !== templateNorm;

    if (changed) {
      // Find the specific difference for precise logging
      const cur = JSON.parse(currentNorm);
      const temp = JSON.parse(templateNorm);
      const allKeys = Array.from(new Set([...Object.keys(cur), ...Object.keys(temp)]));
      const differences = allKeys.filter(k => JSON.stringify(cur[k]) !== JSON.stringify(temp[k]));

      console.log("🛠️ Save button check: Changes detected", {
        activeScreen: activeScreenForMapping,
        differences,
        current: cur,
        template: temp
      });
    }

    return changed;
  };
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

    const isApplicationsPage = location.pathname.toLowerCase() === "/applications";

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
    if (location.pathname.toLowerCase() === "/applications") {
      // MembershipApplication will react to filtersState reset
      dispatch(setTemplateId("")); // Also reset template ID on full reset
    } else {
      dispatch(getAllApplications({}));
    }
  };

  const getScreenFromPath = () => {
    const pathMap = {
      "/applications": "Applications",
      "/Applications": "Applications",
      "/Summary": "Profile",
      "/membership": "Membership",
      "/Members": "Members",
      "/CommunicationBatchDetail": "Communication",
    };
    return pathMap[location.pathname] || "Applications";
  };

  const handleSave = async () => {
    if (!currentTemplateId) return;

    setIsSaving(true);
    try {
      const activeScreenName = getScreenFromPath();
      const currentApiFilters = transformFiltersForApi(filtersState, columns[activeScreenName] || []);

      const payload = {
        filters: currentApiFilters
      };

      const response = await dispatch(updateGridTemplate({ id: currentTemplateId, payload })).unwrap();
      MyAlert("success", "Success", "Template updated successfully");

      // SUCCESS BLOCK: Implement Robust Re-Fetch Synchronization
      console.log("✅ Update successful, performing robust re-fetch...");

      // 1. Re-fetch all templates from the server to get the processed "Global Truth"
      const refreshedTemplates = await dispatch(getGridTemplates()).unwrap();

      // 2. Find the current template in the refreshed results
      const allTemplates = [
        ...(refreshedTemplates.userTemplates || []),
        ...(refreshedTemplates.systemDefault ? [refreshedTemplates.systemDefault] : [])
      ];
      const primarySourceTemplate = allTemplates.find(t => t._id === currentTemplateId);

      if (primarySourceTemplate) {
        console.log("🔄 Syncing UI with re-fetched template data:", primarySourceTemplate);

        // 3. Apply filters from the official primary source
        const transformedFilters = transformFiltersFromApi(primarySourceTemplate.filters, columns[activeScreenName] || []);
        applyTemplateFilters(transformedFilters);

        // 4. Update the selected template in context
        updateSelectedTemplate(activeScreenName.toLowerCase(), primarySourceTemplate);
      } else {
        console.warn("⚠️ Could not find updated template in refreshed list, falling back to payload sync.");
        const transformedFilters = transformFiltersFromApi(payload.filters, columns[activeScreenName] || []);
        applyTemplateFilters(transformedFilters);
      }

      // 5. Final grid refresh REMOVED - MembershipApplication.jsx handles this automatically
      // via the loading state of getGridTemplates(). This prevents multiple refreshes.
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
        {location.pathname.toLowerCase() === "/applications" && hasFilterChanges() && (
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