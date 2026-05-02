import React, { useState, useEffect } from "react";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import { Button, Input } from "antd";
import { EnterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getApplicationsWithFilter,
  setApplicationsFromExternal,
  setTemplateId,
} from "../../features/applicationwithfilterslice";
import {
  getPaymentFormsWithFilter,
  setPaymentFormsFromExternal,
  setPaymentFormsTemplateId,
} from "../../features/paymentFormsWithFilterSlice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { getSubscriptionsWithTemplate } from "../../features/subscription/subscriptionSlice";
import { getProfilesWithFilter } from "../../features/profiles/ProfileSlice";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { useTableColumns } from "../../context/TableColumnsContext ";
import {
  transformFiltersForApi,
  transformFiltersFromApi,
} from "../../utils/filterUtils";
import { useAuthorization } from "../../context/AuthorizationContext";
import {
  updateGridTemplate,
  getGridTemplates,
} from "../../features/templete/templetefiltrsclumnapi";
import { getViewById } from "../../features/views/ViewByIdSlice";
import { setActiveTemplateId } from "../../features/views/ActiveTemplateSlice";
import MyAlert from "./MyAlert";
import {
  markScreenChanged,
  resetScreenChanged,
} from "../../features/views/ScreenFilterChangSlice";
import { message } from "antd";
import DateRang from "./DateRang";

const AI_FILTER_API_URL =
  process.env.REACT_APP_AI_PROFILE_FILTER_URL ||
  "https://projectshell-vm.northeurope.cloudapp.azure.com/profile-service/api/profile/filter";

const CHATBOT_WEBHOOK_URL =
  process.env.REACT_APP_CHATBOT_WEBHOOK_URL ||
  "http://localhost:5678/webhook/5e3aba19-8555-4071-ab52-5120492708a7/chat";

const extractJsonBlock = (value) => {
  if (!value || typeof value !== "string") return null;
  const fenced = value.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const objectMatch = value.match(/\{[\s\S]*\}/);
  return objectMatch?.[0] || null;
};

const parseValues = (raw = "") =>
  raw
    .split(/,| and | or /gi)
    .map((v) => v.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

const FIELD_ALIASES = {
  membershipCategory: ["membership category", "membership", "category"],
  workLocation: ["work location", "location", "workplace"],
  region: ["region"],
  branch: ["branch"],
};

const buildFallbackFilters = (query = "") => {
  const result = {};

  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    for (const alias of aliases) {
      const rx = new RegExp(
        `${alias}\\s*(?:is|=|equals|equal to|in)\\s*([^.;\\n]+)`,
        "i",
      );
      const match = query.match(rx);
      if (match?.[1]) {
        result[field] = {
          operator: "equal_to",
          values: parseValues(match[1]),
        };
        break;
      }
    }
  });

  return result;
};

const BATCH_TOOLBAR_ROUTES = new Set([
  "/RecruitAFriend",
  "/CornMarketRewards",
  "/NewGraduate",
  "/Deductions",
  "/StandingOrders",
  "/DirectDebit",
  "/Import",
  "/Batches",
  "/Cheque",
  "/InAppNotifications",
]);

/** Screens where Filter does not load template grids (bump / no-op). */
const DASHBOARD_FILTER_NO_FETCH_ROUTES = new Set([
  "/MembershipDashboard",
  "/EventsDashboard",
  "/CorrespondenceDashboard",
  "/IssuesManagementDashboard",
]);

const AISparkleIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ display: "block", margin: "0 auto" }}
  >
    <defs>
      <linearGradient id="ai-sparkle-gradient" x1="4" y1="4" x2="20" y2="20">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      d="M12 3L13.7 8.3L19 10L13.7 11.7L12 17L10.3 11.7L5 10L10.3 8.3L12 3Z"
      stroke="url(#ai-sparkle-gradient)"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 2L20.2 4L22.2 4.7L20.2 5.4L19.5 7.4L18.8 5.4L16.8 4.7L18.8 4L19.5 2Z"
      stroke="url(#ai-sparkle-gradient)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6 15L6.7 16.8L8.5 17.5L6.7 18.2L6 20L5.3 18.2L3.5 17.5L5.3 16.8L6 15Z"
      stroke="url(#ai-sparkle-gradient)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const getAIConvertedFilters = async (query) => {
  const aiPrompt = `Convert this natural language filter query into strict JSON for grid filtering (applications, member profiles, or subscriptions lists).
Return ONLY a JSON object with this shape:
{
  "filters": {
    "membershipCategory": { "operator": "equal_to", "values": [] },
    "workLocation": { "operator": "equal_to", "values": [] },
    "region": { "operator": "equal_to", "values": [] },
    "branch": { "operator": "equal_to", "values": [] }
  }
}
Only include fields that are explicitly present in the query.
User query: ${query}`;

  try {
    const response = await fetch(CHATBOT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: aiPrompt, query: aiPrompt }),
    });

    const rawText = await response.text();
    if (!response.ok) throw new Error("AI conversion failed");

    let parsedBody = rawText;
    try {
      parsedBody = JSON.parse(rawText);
    } catch (_) {}

    const candidateText =
      typeof parsedBody === "string"
        ? parsedBody
        : parsedBody?.reply ||
          parsedBody?.response ||
          parsedBody?.message ||
          parsedBody?.text ||
          JSON.stringify(parsedBody);

    const jsonBlock = extractJsonBlock(candidateText);
    if (!jsonBlock) throw new Error("No JSON returned by AI");

    const parsedJson = JSON.parse(jsonBlock);
    return parsedJson?.filters || {};
  } catch (_) {
    return buildFallbackFilters(query);
  }
};

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
  const { currentTemplateId } = useSelector(
    (state) => state.applicationWithFilter,
  );
  const { currentTemplateId: paymentFormsTemplateId } = useSelector(
    (state) => state.paymentFormsWithFilter || {},
  );
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const screenChanges = useSelector(
    (state) => state.screenFilter.screenFilterChanged,
  );
  // const activeScreen = getScreenFromPath();

  const getScreenFromPath = () => {
    const key = (location.pathname || "").replace(/\/$/, "").toLowerCase();
    const pathMap = {
      "/applications": "Applications",
      "/paymentforms": "Payment Forms",
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
    activeTemplateId ||
    paymentFormsTemplateId ||
    currentTemplateId ||
    "";
  const normalizedPath = (location.pathname || "")
    .replace(/\/$/, "")
    .toLowerCase();
  const isPaymentFormsPage = normalizedPath === "/paymentforms";
  const isApplicationsPage = normalizedPath === "/applications";
  const isApplicationLikePage = isApplicationsPage || isPaymentFormsPage;
  const gridTemplateType = isMembersScreen
    ? "members"
    : isPaymentFormsPage
      ? "payment forms"
      : isApplicationsPage
      ? "application"
      : isProfileScreen
        ? "profile"
        : undefined;

  const supportsAiGridFilter =
    !BATCH_TOOLBAR_ROUTES.has(location.pathname) &&
    !DASHBOARD_FILTER_NO_FETCH_ROUTES.has(location.pathname) &&
    (isApplicationLikePage || isProfileScreen || isMembersScreen);

  const [batchName, setBatchName] = useState("");
  const [aiBoxOpen, setAiBoxOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!supportsAiGridFilter) setAiBoxOpen(false);
  }, [supportsAiGridFilter]);

  const markTemplateScreenDirty = () => {
    const screen =
      getScreenFromPath() ||
      (isApplicationLikePage
        ? isPaymentFormsPage
          ? "Payment Forms"
          : "Applications"
        : isProfileScreen
          ? "Profile"
          : isMembersScreen
            ? "Members"
            : "");
    if (screen) {
      dispatch(markScreenChanged({ screen }));
    }
  };

  const fetchApplicationLikeList = (payload) => {
    if (isPaymentFormsPage) {
      return dispatch(getPaymentFormsWithFilter(payload));
    }
    return dispatch(getApplicationsWithFilter(payload));
  };

  const setApplicationLikeData = (rows) => {
    if (isPaymentFormsPage) {
      dispatch(setPaymentFormsFromExternal(rows));
      return;
    }
    dispatch(setApplicationsFromExternal(rows));
  };

  const setApplicationLikeTemplateId = (templateId) => {
    if (isPaymentFormsPage) {
      dispatch(setPaymentFormsTemplateId(templateId));
      return;
    }
    dispatch(setTemplateId(templateId));
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

    const isMembershipDashboard = location.pathname === "/MembershipDashboard";
    const isEventsDashboard = location.pathname === "/EventsDashboard";
    const isCorrespondenceDashboard =
      location.pathname === "/CorrespondenceDashboard";
    const isIssuesManagementDashboard =
      location.pathname === "/IssuesManagementDashboard";

    if (isApplicationLikePage) {
      const apiFilters = transformFiltersForApi(
        cleanedFilters,
        columns[tableColumnScreen] || [],
      );
      const visibleColumns = (columns[tableColumnScreen] || [])
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex)
            ? col.dataIndex.join(".")
            : col.dataIndex,
        );
      fetchApplicationLikeList({
        templateId: activeTemplateId || resolvedGridTemplateId || undefined,
        page: 1,
        limit: 500,
        filters: apiFilters,
        columns: visibleColumns,
      });
    } else if (isProfileScreen) {
      const apiFilters = transformFiltersForApi(
        cleanedFilters,
        columns[tableColumnScreen] || [],
      );
      dispatch(
        getProfilesWithFilter({
          templateId: activeTemplateId || resolvedGridTemplateId || undefined,
          page: 1,
          limit: 500,
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
          Array.isArray(col.dataIndex)
            ? col.dataIndex.join(".")
            : col.dataIndex,
        );
      dispatch(
        getSubscriptionsWithTemplate({
          templateId: activeTemplateId || resolvedGridTemplateId || undefined,
          page: 1,
          limit: 500,
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
        }),
      );
    }
  };

  const handleReset = () => {
    resetFilters();
    if (isApplicationLikePage || isProfileScreen || isMembersScreen) {
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
    if (isApplicationLikePage) {
      fetchApplicationLikeList({
        templateId: activeTemplateId || resolvedGridTemplateId || undefined,
        page: 1,
        limit: 500,
      });
    } else if (isProfileScreen) {
      dispatch(
        getProfilesWithFilter({
          templateId: activeTemplateId || resolvedGridTemplateId || undefined,
          page: 1,
          limit: 500,
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
          templateId: activeTemplateId || resolvedGridTemplateId || undefined,
          page: 1,
          limit: 500,
        }),
      );
    } else {
      dispatch(getAllApplications({}));
    }
  };

  const handleAIFilter = async () => {
    const query = aiQuery.trim();
    if (!query) {
      message.warning("Enter a natural language query first.");
      return;
    }

    if (!supportsAiGridFilter) {
      message.warning("AI filter is not available on this screen.");
      return;
    }

    setAiLoading(true);
    try {
      const aiFilters = await getAIConvertedFilters(query);
      if (!Object.keys(aiFilters).length) {
        message.warning("Could not derive filters from your query.");
        return;
      }

      const templateId = activeTemplateId || resolvedGridTemplateId || undefined;

      if (isApplicationLikePage) {
        const payload = {
          templateId,
          page: 1,
          limit: 500,
          filters: aiFilters,
        };

        const token = localStorage.getItem("token");
        const response = await fetch(AI_FILTER_API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch applications with AI filter.");
        }

        const data = await response.json();
        const applications =
          data?.data?.applications ||
          data?.data?.paymentForms ||
          data?.applications ||
          data?.paymentForms ||
          data?.data ||
          [];
        setApplicationLikeData(applications);
      } else if (isProfileScreen) {
        await dispatch(
          getProfilesWithFilter({
            templateId,
            page: 1,
            limit: 500,
            filters: aiFilters,
          }),
        ).unwrap();
      } else if (isMembersScreen) {
        const visibleColumns = (columns[tableColumnScreen] || [])
          .filter((col) => col.isGride === true)
          .map((col) =>
            Array.isArray(col.dataIndex)
              ? col.dataIndex.join(".")
              : col.dataIndex,
          );
        await dispatch(
          getSubscriptionsWithTemplate({
            templateId,
            page: 1,
            limit: 500,
            filters: aiFilters,
            columns: visibleColumns,
          }),
        ).unwrap();
      }

      message.success("AI filter applied.");
    } catch (error) {
      message.error(error?.message || "Unable to apply AI filter.");
    } finally {
      setAiLoading(false);
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
      const currentColumnLabels = screenColumns.reduce((acc, col) => {
        const key = Array.isArray(col?.dataIndex)
          ? col.dataIndex.join(".")
          : col?.dataIndex;
        if (key) acc[String(key)] = String(col?.title || key);
        return acc;
      }, {});
      const visibleColumnKeys = screenColumns
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex)
            ? col.dataIndex.join(".")
            : col.dataIndex,
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

      setApplicationLikeTemplateId(id);
      dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));

      dispatch(
        getGridTemplates(gridTemplateType ? { type: gridTemplateType } : {}),
      );

      if (isApplicationLikePage) {
        fetchApplicationLikeList({
          templateId: id,
          page: 1,
          limit: 500,
        });
      } else if (isProfileScreen) {
        dispatch(
          getProfilesWithFilter({
            templateId: id,
            page: 1,
            limit: 500,
          }),
        );
      } else if (isMembersScreen) {
        dispatch(
          getSubscriptionsWithTemplate({
            templateId: id,
            page: 1,
            limit: 500,
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

  if (BATCH_TOOLBAR_ROUTES.has(location.pathname)) {
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
      className="mb-2"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: supportsAiGridFilter && aiBoxOpen ? 10 : 0,
      }}
    >
      <div
        className="d-flex align-items-center flex-wrap gap-2"
        style={{ rowGap: 10 }}
      >
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
                  height: 34,
                  borderRadius: 4,
                  color: "gray",
                  padding: "4px 11px",
                  lineHeight: "22px",
                  boxSizing: "border-box",
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
        {supportsAiGridFilter && (
          <Button
            onClick={() => setAiBoxOpen((prev) => !prev)}
            icon={<AISparkleIcon size={20} />}
            aria-label="AI filter"
            title="AI filter"
            style={{
              backgroundColor: "#f0f2f5",
              borderRadius: "4px",
              border: "1px solid #d9d9d9",
              height: "32px",
              width: "32px",
              minWidth: "32px",
              paddingInline: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "500",
              color: "#45669d",
            }}
          />
        )}
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
      {supportsAiGridFilter && aiBoxOpen && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 0,
            margin: 0,
          }}
        >
          <div style={{ width: "calc(100% - 180px)", minWidth: 0 }}>
            <Input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Describe filters in natural language. Example: membership category is General (all grades) and region is Dublin North East."
              onPressEnter={handleAIFilter}
              styles={{
                affixWrapper: {
                  minHeight: 32,
                  paddingTop: 0,
                  paddingBottom: 0,
                  marginLeft: 5,
                  alignItems: "center",
                },
              }}
              style={{
                height: 32,
                borderRadius: 4,
              }}
              suffix={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: "100%",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {aiQuery.trim() ? (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setAiQuery("")}
                      style={{ paddingInline: 6, color: "#8c8c8c" }}
                    >
                      X
                    </Button>
                  ) : null}
                  <Button
                    type="text"
                    size="small"
                    onClick={handleAIFilter}
                    loading={aiLoading}
                    style={{
                      paddingInline: 6,
                      color: "#45669d",
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "#45669d",
                      }}
                    >
                      Generate
                      <EnterOutlined style={{ color: "#45669d" }} />
                    </span>
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
