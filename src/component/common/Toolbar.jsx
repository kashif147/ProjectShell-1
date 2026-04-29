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
import { transformFiltersForApi, transformFiltersFromApi } from "../../utils/filterUtils";
import { useAuthorization } from "../../context/AuthorizationContext";
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
    activePage,
    visibleFilters,
    filterOptions,
    filtersState,
    updateFilter,
    resetFilters,
    applyTemplateFilters,
    getFiltersStateForSave,
    bumpMembershipDashboardApply,
  } = useFilters();
  /** TableColumnsContext keys use "Members"; FilterContext uses "Membership" for /membership */
  const tableColumnScreen =
    activePage === "Membership" ? "Members" : activePage;

  const { columns } = useTableColumns();
  const { hasAnyRole } = useAuthorization();
  const canEditGridTemplates = hasAnyRole(["SU", "ASU"]);
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const screenChanges = useSelector(
    (state) => state.screenFilter.screenFilterChanged,
  );
  // const activeScreen = getScreenFromPath();

  const getScreenFromPath = () => {
    const key = (location.pathname || "")
      .replace(/\/$/, "")
      .toLowerCase();
    const pathMap = {
      "/applications": "Applications",
      "/summary": "Profile",
      "/membership": "Membership",
      "/members": "Members",
      "/communicationbatchdetail": "Communication",
      "/eventssummary": "Events",
      "/eventsdashboard": "Events",
      "/correspondencedashboard": "Communication",
      "/issuesmanagementdashboard": "Cases",
      "/attendees": "Attendees",
      "/membershipdashboard": "MembershipDashboard",
    };
    return pathMap[key] || "";
  };
  const activeScreen = getScreenFromPath();
  const isMembersScreen =
    location.pathname === "/members" ||
    location.pathname === "/Members" ||
    location.pathname === "/membership";
  const isProfileScreen =
    location.pathname === "/Summary" || location.pathname === "/summary";
  const hasChanges = activeScreen
    ? screenChanges[activeScreen.toLowerCase()] === true
    : false;

  const resolvedGridTemplateId =
    activeTemplateId || currentTemplateId || "";
  const normalizedPath = (location.pathname || "")
    .replace(/\/$/, "")
    .toLowerCase();
  const isApplicationsPage = normalizedPath === "/applications";
  const gridTemplateType = isMembersScreen
    ? "members"
    : isApplicationsPage
      ? "application"
      : isProfileScreen
        ? "profile"
        : undefined;

  const [batchName, setBatchName] = useState("");
  const markTemplateScreenDirty = () => {
    const screen =
      getScreenFromPath() ||
      (isApplicationsPage
        ? "Applications"
        : isProfileScreen
          ? "Profile"
          : isMembersScreen
            ? "Members"
            : "");
    if (screen) {
      dispatch(markScreenChanged({ screen }));
    }
  };

  const handleFilterApply = (filterData) => {
    const { label, operator, selectedValues } = filterData;
    updateFilter(label, operator, selectedValues);
    markTemplateScreenDirty();
  };

  const handleSearch = () => {
    const filterSnapshot = getFiltersStateForSave();
    const cleanedFilters = {};
    Object.keys(filterSnapshot).forEach((key) => {
      if (filterSnapshot[key]?.selectedValues?.length > 0) {
        cleanedFilters[key] = filterSnapshot[key];
      }
    });

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
        columns[tableColumnScreen] || [],
      );
      const visibleColumns = (columns[tableColumnScreen] || [])
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
        columns[tableColumnScreen] || [],
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
        columns[tableColumnScreen] || [],
      );
      const visibleColumns = (columns[tableColumnScreen] || [])
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
    if (isApplicationsPage || isProfileScreen || isMembersScreen) {
      const screen =
        getScreenFromPath() ||
        (isApplicationsPage
          ? "Applications"
          : isProfileScreen
            ? "Profile"
            : "Members");
      if (screen) {
        dispatch(resetScreenChanged({ screen }));
      }
    }
    if (isApplicationsPage) {
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
    const id = String(resolvedGridTemplateId || "").trim();
    if (!id) {
      message.warning(
        "No view is selected. Choose a template from the view menu, then try again.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const filterSnapshot = getFiltersStateForSave();
      const currentApiFilters = transformFiltersForApi(
        filterSnapshot,
        columns[tableColumnScreen] || [],
      );
      const screenColumns = columns[tableColumnScreen] || [];
      const currentColumnLabels = screenColumns.reduce(
        (acc, col) => {
          const key = Array.isArray(col?.dataIndex)
            ? col.dataIndex.join(".")
            : col?.dataIndex;
          if (key) acc[String(key)] = String(col?.title || key);
          return acc;
        },
        {},
      );
      const visibleColumnKeys = screenColumns
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : col.dataIndex,
        );

      const payload = {
        filters: currentApiFilters,
        columnLabels: currentColumnLabels,
        columns: visibleColumnKeys,
        ...(gridTemplateType ? { templateType: gridTemplateType } : {}),
      };

      await dispatch(
        updateGridTemplate({
          id,
          type: gridTemplateType,
          payload,
        }),
      ).unwrap();
      MyAlert("success", "Success", "Template updated successfully");

      const freshView = await dispatch(
        getViewById({
          id,
          type: gridTemplateType,
        }),
      ).unwrap();

      const nextFilters = transformFiltersFromApi(
        freshView?.filters || {},
        columns[tableColumnScreen] || [],
      );
      applyTemplateFilters(nextFilters);

      dispatch(setTemplateId(id));
      dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));

      dispatch(
        getGridTemplates(
          gridTemplateType ? { type: gridTemplateType } : {},
        ),
      );

      if (isApplicationsPage) {
        dispatch(
          getApplicationsWithFilter({
            templateId: id,
            page: 1,
            limit: 10,
          }),
        );
      } else if (isProfileScreen) {
        dispatch(
          getProfilesWithFilter({
            templateId: id,
            page: 1,
            limit: 100,
          }),
        );
      } else if (isMembersScreen) {
        dispatch(
          getSubscriptionsWithTemplate({
            templateId: id,
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
                key={`${resolvedGridTemplateId || "default"}-${label}`}
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
              key={`${resolvedGridTemplateId || "default"}-${label}`}
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
          canEditGridTemplates &&
          hasChanges && (
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