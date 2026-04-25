import React, { useState } from "react";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import { Button, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getApplicationsWithFilter, setTemplateId } from "../../features/applicationwithfilterslice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { getSubscriptionsWithTemplate } from "../../features/subscription/subscriptionSlice";
import { getProfilesWithFilter } from "../../features/profiles/ProfileSlice";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { transformFiltersForApi, transformFiltersFromApi, areFiltersEqual } from "../../utils/filterUtils";
import { updateGridTemplate, getGridTemplates } from "../../features/templete/templetefiltrsclumnapi";
import { getViewById } from "../../features/views/ViewByIdSlice";
import { setActiveTemplateId } from "../../features/views/ActiveTemplateSlice";
import MyAlert from "./MyAlert";
import { markScreenChanged, resetScreenChanged } from '../../features/views/ScreenFilterChangSlice';
import { message } from "antd";
import DateRang from "./DateRang";


const Toolbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();


  const {
    visibleFilters,
    filterOptions,
    filtersState,
    updateFilter,
    resetFilters,
    applyTemplateFilters,
    bumpMembershipDashboardApply,
  } = useFilters();

  const { columns, updateSelectedTemplate, selectedTemplates } = useTableColumns();
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templates, loading: templatesLoading } = useSelector((state) => state.templetefiltrsclumnapi);
  const { selectedView, loading: viewLoading } = useSelector((state) => state.viewById);
  const [isSaving, setIsSaving] = useState(false);
  const screenChanges = useSelector(state => state.screenFilter.screenFilterChanged);
  // const activeScreen = getScreenFromPath();

  const getScreenFromPath = () => {
    const pathMap = {
      "/applications": "Applications",
      "/Applications": "Applications",
      "/Summary": "Profile",
      "/membership": "Membership",
      "/members": "Members",
      "/Members": "Members",
      "/CommunicationBatchDetail": "Communication",
      "/EventsSummary": "Events",
      "/EventsDashboard": "Events",
      "/CorrespondenceDashboard": "Communication",
      "/IssuesManagementDashboard": "Cases",
      "/Attendees": "Attendees",
      "/MembershipDashboard": "MembershipDashboard",
    };
    return pathMap[location.pathname] || "";
  };
  const activeScreen = getScreenFromPath();
  const isMembersScreen =
    location.pathname === "/members" ||
    location.pathname === "/Members" ||
    location.pathname === "/membership";
  const isProfileScreen =
    location.pathname === "/Summary" || location.pathname === "/summary";
  const isSystemDefaultTemplateActive =
    !!selectedView &&
    selectedView._id === activeTemplateId &&
    !!selectedView.systemDefault;
  const hasChanges = screenChanges[activeScreen.toLowerCase()] === true;

  // Reactively update screen change state based on deep equality
  React.useEffect(() => {
    if (
      location.pathname === "/MembershipDashboard" ||
      location.pathname === "/EventsDashboard" ||
      location.pathname === "/CorrespondenceDashboard" ||
      location.pathname === "/IssuesManagementDashboard"
    ) {
      return;
    }
    if (!selectedView || !activeTemplateId || selectedView._id !== activeTemplateId) {
      if (hasChanges) {
        dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));
      }
      return;
    }

    const originalFilters = transformFiltersFromApi(selectedView.filters || {}, columns[activeScreen] || []);
    const isEqual = areFiltersEqual(filtersState, originalFilters);

    if (isEqual && hasChanges) {
      dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));
    } else if (!isEqual && !hasChanges) {
      dispatch(markScreenChanged({ screen: activeScreen }));
    }
  }, [filtersState, selectedView, activeScreen, columns, dispatch, hasChanges, location.pathname]);

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
    // Manual markScreenChanged removed - handled by useEffect above
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
    const isMembershipDashboard =
      location.pathname === "/MembershipDashboard";
    const isEventsDashboard = location.pathname === "/EventsDashboard";
    const isCorrespondenceDashboard =
      location.pathname === "/CorrespondenceDashboard";
    const isIssuesManagementDashboard =
      location.pathname === "/IssuesManagementDashboard";

    if (isApplicationsPage) {
      const apiFilters = transformFiltersForApi(
        cleanedFilters,
        columns[activeScreen] || [],
      );
      const visibleColumns = (columns[activeScreen] || [])
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : col.dataIndex,
        );
      dispatch(
        getApplicationsWithFilter({
          templateId: activeTemplateId || currentTemplateId || undefined,
          page: 1,
          limit: 10,
          filters: apiFilters,
          columns: visibleColumns,
        }),
      );
    } else if (isProfileScreen) {
      const apiFilters = transformFiltersForApi(
        cleanedFilters,
        columns[activeScreen] || [],
      );
      dispatch(
        getProfilesWithFilter({
          templateId: activeTemplateId || currentTemplateId || undefined,
          page: 1,
          limit: 100,
          filters: apiFilters,
        }),
      );
    } else if (isMembershipDashboard) {
      bumpMembershipDashboardApply();
    } else if (
      isEventsDashboard ||
      isCorrespondenceDashboard ||
      isIssuesManagementDashboard
    ) {
      // Summary dashboards: no grid fetch
    } else if (isMembersScreen) {
      const apiFilters = transformFiltersForApi(
        cleanedFilters,
        columns[activeScreen] || [],
      );
      const visibleColumns = (columns[activeScreen] || [])
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : col.dataIndex,
        );
      dispatch(
        getSubscriptionsWithTemplate({
          templateId: activeTemplateId || currentTemplateId || undefined,
          page: 1,
          limit: 10,
          filters: apiFilters,
          columns: visibleColumns,
        }),
      );
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
      dispatch(
        getApplicationsWithFilter({
          templateId: activeTemplateId || currentTemplateId || undefined,
          page: 1,
          limit: 10,
        }),
      );
    } else if (isProfileScreen) {
      dispatch(
        getProfilesWithFilter({
          templateId: activeTemplateId || currentTemplateId || undefined,
          page: 1,
          limit: 100,
        }),
      );
    } else if (location.pathname === "/MembershipDashboard") {
      bumpMembershipDashboardApply();
    } else if (
      location.pathname === "/EventsDashboard" ||
      location.pathname === "/CorrespondenceDashboard" ||
      location.pathname === "/IssuesManagementDashboard"
    ) {
      // no-op
    } else if (isMembersScreen) {
      dispatch(
        getSubscriptionsWithTemplate({
          templateId: activeTemplateId || currentTemplateId || undefined,
          page: 1,
          limit: 10,
        }),
      );
    } else {
      dispatch(getAllApplications({}));
    }
  };



  const handleSave = async () => {
    if (!currentTemplateId) return;

    setIsSaving(true);
    try {
      const activeScreenName = getScreenFromPath();
      const currentApiFilters = transformFiltersForApi(filtersState, columns[activeScreenName] || []);
      const currentColumnLabels = (columns[activeScreenName] || []).reduce(
        (acc, col) => {
          const key = Array.isArray(col?.dataIndex)
            ? col.dataIndex.join(".")
            : col?.dataIndex;
          if (key) acc[String(key)] = String(col?.title || key);
          return acc;
        },
        {},
      );

      const payload = {
        filters: currentApiFilters,
        columnLabels: currentColumnLabels,
      };

      await dispatch(
        updateGridTemplate({
          id: currentTemplateId,
          payload: {
            ...payload,
            templateType: isMembersScreen ? "members" : undefined,
          },
        }),
      ).unwrap();
      MyAlert("success", "Success", "Template updated successfully");

      console.log("✅ Update successful, resetting change state and re-fetching details...");

      // 1. Reset the "dirty" state for this screen
      dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));

      // 2. Refresh the specific view details in Redux
      // This will trigger the useEffect in SaveViewMenu.jsx to re-apply filters if needed
      dispatch(
        getViewById({
          id: currentTemplateId,
          type: isMembersScreen ? "members" : undefined,
        }),
      );

      // 3. Refresh the template list to ensure anything else using it (like the dropdown) is current
      dispatch(
        getGridTemplates(isMembersScreen ? { type: "members" } : {}),
      );

      // 4. Reload the filtered applications if on the applications page
      if (location.pathname.toLowerCase() === "/applications") {
        console.log("🔄 Reloading applications after save with templateId:", currentTemplateId);
        dispatch(getApplicationsWithFilter({
          templateId: currentTemplateId,
          page: 1,
          limit: 10
        }));
      } else if (isProfileScreen) {
        dispatch(
          getProfilesWithFilter({
            templateId: currentTemplateId,
            page: 1,
            limit: 100,
          }),
        );
      } else if (isMembersScreen) {
        dispatch(
          getSubscriptionsWithTemplate({
            templateId: currentTemplateId,
            page: 1,
            limit: 10,
          }),
        );
      }

    } catch (error) {
      console.error("Error updating template:", error);
      MyAlert("error", "Error", error?.message || "Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };


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
        {location.pathname !== "/MembershipDashboard" &&
          location.pathname !== "/EventsDashboard" &&
          location.pathname !== "/CorrespondenceDashboard" &&
          location.pathname !== "/IssuesManagementDashboard" && (
          <div style={{ flex: "0 0 250px" }}>
            <Input
              className="my-input-field"
              placeholder={
                location.pathname === "/CasesSummary"
                  ? "Search Case ID, team, or stakeholder"
                  : location.pathname === "/EventsSummary"
                    ? "Search Event ID or Name"
                    : location.pathname === "/Attendees"
                      ? "Search Attendee ID or Name"
                    : "Membership No or Surname"
              }
              style={{
                height: "30px",
                borderRadius: "4px",
                color: "gray",
              }}
            />
          </div>
        )}

        {/* Dynamic filters */}
        {visibleFilters.map((label) => {
          const filterState = filtersState[label];
          const selectedValues = filterState?.selectedValues || [];
          const operator = filterState?.operator || "==";
          const options = filterOptions[label] || [];

          const isDateField = label.toLowerCase().includes("date");

          if (isDateField) {
            return (
              <DateRang
                key={label}
                label={label}
                selectedValues={selectedValues}
                operator={operator}
                onApply={handleFilterApply}
              />
            );
          }

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
          Filter
        </Button>
        {location.pathname !== "/MembershipDashboard" &&
          location.pathname !== "/EventsDashboard" &&
          location.pathname !== "/CorrespondenceDashboard" &&
          location.pathname !== "/IssuesManagementDashboard" &&
          hasChanges &&
          !isSystemDefaultTemplateActive &&
          !templatesLoading &&
          !viewLoading && (
          <Button
            onClick={handleSave}
            loading={isSaving}
            style={{
              backgroundColor: "#E6F7FF",
              borderRadius: "#4px",
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