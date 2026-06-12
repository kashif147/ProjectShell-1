import React, { useState, useEffect, useMemo } from "react";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import DateRang from "./DateRang";
import NumberFilter from "./NumberFilter";
import TextFilter from "./TextFilter";
import { Button, Input, Modal } from "antd";
import axios from "axios";
import { resolveTemplatesApiUrl } from "../../config/gridTemplateRouting";
import MyInput from "./MyInput";
import { EnterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getApplicationsWithFilter,
  setTemplateId,
} from "../../features/applicationwithfilterslice";
import {
  getPaymentFormsWithFilter,
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
  isDateFilterLabel,
  isNumericFilterLabel,
  isStringFilterLabel,
} from "../../utils/filterUtils";
import { bumpCreditNotesReload } from "../../utils/creditNotesWorkspace";
import { bumpJournalAdjustmentsReload } from "../../utils/journalAdjustmentsWorkspace";
import { bumpOnlinePaymentsReload } from "../../utils/onlinePaymentsWorkspace";
import { bumpRefundsReload } from "../../utils/refundsWorkspace";
import { bumpWriteOffsReload } from "../../utils/writeOffsWorkspace";
import { bumpGeneralLedgerReload } from "../../utils/generalLedgerWorkspace";
import { bumpReconciliationReload } from "../../utils/reconciliationWorkspace";
import { bumpMembershipListingReportReload } from "../../utils/membershipListingReportWorkspace";
import { bumpCreditorsListReportReload } from "../../utils/creditorsListReportWorkspace";
import { bumpDebtorsListReportReload } from "../../utils/debtorsListReportWorkspace";
import { bumpMembershipStatisticsReportReload } from "../../utils/membershipStatisticsReportWorkspace";
import { bumpWorkplaceBreakdownReportReload } from "../../utils/workplaceBreakdownReportWorkspace";
import {
  clearReportGridSearchQuery,
  setReportGridSearchQuery,
  subscribeReportGridSearch,
} from "../../utils/reportGridSearchBridge";
import { useAuthorization } from "../../context/AuthorizationContext";
import {
  updateGridTemplate,
  getGridTemplates,
} from "../../features/templete/templetefiltrsclumnapi";
import { getViewById } from "../../features/views/ViewByIdSlice";
import { setActiveTemplateId } from "../../features/views/ActiveTemplateSlice";
import MyAlert from "./MyAlert";
import MembershipDashboardHeaderControls from "../../pages/membership/executive/MembershipDashboardHeaderControls";
import {
  parseMembershipCategoryOptionLabels,
  resolveDashboardMembershipCategoryFilterState,
} from "../../pages/membership/executive/executiveDashboardUtils";
import "../../styles/ExecutiveDashboard.css";
import "../../styles/ToolbarFilters.css";
import {
  markScreenChanged,
  resetScreenChanged,
} from "../../features/views/ScreenFilterChangSlice";
import { message } from "antd";
import { formatMembershipMovementLabel } from "../../utils/membershipMovementLabels";
import {
  buildTemplateMetaWithVisibleFilters,
  persistVisibleFiltersToStorage,
  resolveTemplateVisibleFilters,
} from "../../utils/gridTemplateVisibleFilters";

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
    getVisibleFiltersForSave,
    bumpMembershipDashboardApply,
    membershipDashboardHeader,
    updateMembershipDashboardHeader,
  } = useFilters();
  /** TableColumnsContext keys use "Members"; FilterContext uses "Membership" for /membership */
  const tableColumnScreen =
    activePage === "Membership" ? "Members" : activePage;

  const { columns, applyTemplate } = useTableColumns();
  const { templates } = useSelector((state) => state.templetefiltrsclumnapi);
  const { hasAnyRole } = useAuthorization();
  const canEditGridTemplates = hasAnyRole(["SU", "ASU"]);
  const { currentTemplateId } = useSelector(
    (state) => state.applicationWithFilter,
  );
  const { currentTemplateId: paymentFormsTemplateId } = useSelector(
    (state) => state.paymentFormsWithFilter || {},
  );
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { selectedView } = useSelector((state) => state.viewById);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAsNewModalOpen, setSaveAsNewModalOpen] = useState(false);
  const [saveAsNewViewName, setSaveAsNewViewName] = useState("");
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
      "/creditnotes": "CreditNotes",
      "/journaladjustments": "JournalAdjustments",
      "/onlinepayment": "OnlinePayment",
      "/refunds": "Refunds",
      "/write-offs": "WriteOffs",
      "/generalledger": "GeneralLedger",
      "/reconciliation": "Reconciliation",
      "/membershiplistingreport": "MembershipListingReport",
      "/statisticsreport": "StatisticsReport",
      "/workplacebreakdownreport": "WorkplaceBreakdownReport",
      "/creditorslistreport": "CreditorsListReport",
      "/debtorslistreport": "DebtorsListReport",
    };
    return pathMap[key] || "";
  };
  const activeScreen = getScreenFromPath();
  const normalizedPath = (location.pathname || "")
    .replace(/\/$/, "")
    .toLowerCase();
  const isCreditNotesScreen = normalizedPath === "/creditnotes";
  const isJournalAdjustmentsScreen = normalizedPath === "/journaladjustments";
  const isOnlinePaymentScreen = normalizedPath === "/onlinepayment";
  const isRefundsScreen = normalizedPath === "/refunds";
  const isWriteOffsScreen = normalizedPath === "/write-offs";
  const isGeneralLedgerScreen = normalizedPath === "/generalledger";
  const isReconciliationScreen = normalizedPath === "/reconciliation";
  const isMembershipListingReportScreen =
    normalizedPath === "/membershiplistingreport";
  const isCreditorsListReportScreen =
    normalizedPath === "/creditorslistreport";
  const isDebtorsListReportScreen =
    normalizedPath === "/debtorslistreport";
  const isMembershipListingStyleReportScreen =
    isMembershipListingReportScreen ||
    isCreditorsListReportScreen ||
    isDebtorsListReportScreen;
  const isStatisticsReportScreen = normalizedPath === "/statisticsreport";
  const isWorkplaceBreakdownReportScreen =
    normalizedPath === "/workplacebreakdownreport";
  const isAggregateMembershipReportScreen =
    isStatisticsReportScreen || isWorkplaceBreakdownReportScreen;
  const isMembershipDashboard = normalizedPath === "/membershipdashboard";
  const isMembershipExecutiveScreen =
    isMembershipDashboard || isAggregateMembershipReportScreen;
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

  const isActiveSystemDefault = useMemo(() => {
    const id = String(resolvedGridTemplateId || "").trim();
    if (!id) return true;
    if (!templates) return false;
    if (String(templates.systemDefault?._id) === id) return true;
    return (templates.userTemplates || []).some(
      (t) => String(t._id) === id && t.systemDefault === true,
    );
  }, [resolvedGridTemplateId, templates]);
  const isPaymentFormsPage = normalizedPath === "/paymentforms";
  const isApplicationsPage = normalizedPath === "/applications";
  const isApplicationLikePage = isApplicationsPage || isPaymentFormsPage;
  const gridTemplateType = isMembersScreen
    ? "members"
    : isCreditNotesScreen
      ? "creditnotes"
      : isJournalAdjustmentsScreen
        ? "journaladjustments"
      : isOnlinePaymentScreen
        ? "onlinepayment"
      : isRefundsScreen
        ? "refunds"
      : isWriteOffsScreen
        ? "writeoffs"
      : isGeneralLedgerScreen
        ? "generalledger"
      : isReconciliationScreen
        ? "reconciliation"
      : isMembershipListingReportScreen
        ? "membershiplisting"
      : isStatisticsReportScreen
        ? "statisticsreport"
      : isWorkplaceBreakdownReportScreen
        ? "workplacebreakdownreport"
      : isCreditorsListReportScreen
        ? "creditorslistreport"
      : isDebtorsListReportScreen
        ? "debtorslistreport"
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
  const [gridSearch, setGridSearch] = useState("");
  const [aiBoxOpen, setAiBoxOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isMembershipListingStyleReportScreen) {
      setGridSearch("");
      return undefined;
    }
    return subscribeReportGridSearch(setGridSearch);
  }, [isMembershipListingStyleReportScreen]);

  const dashboardCategoryLabels = useMemo(
    () =>
      parseMembershipCategoryOptionLabels(
        filterOptions["Membership Category"] || [],
      ),
    [filterOptions],
  );

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
            : isCreditNotesScreen
              ? "CreditNotes"
              : isJournalAdjustmentsScreen
                ? "JournalAdjustments"
              : isOnlinePaymentScreen
                ? "OnlinePayment"
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

  const setApplicationLikeTemplateId = (templateId) => {
    if (isPaymentFormsPage) {
      dispatch(setPaymentFormsTemplateId(templateId));
      return;
    }
    dispatch(setTemplateId(templateId));
  };

  const handleFilterApply = (filterData) => {
    const { label, operator, selectedValues } = filterData;

    if (isMembershipExecutiveScreen && label === "Membership Category") {
      const manualMembershipCategories = { operator, selectedValues };
      const nextHeader = {
        ...membershipDashboardHeader,
        manualMembershipCategories,
      };
      updateMembershipDashboardHeader({ manualMembershipCategories });
      const nextCategoryFilter = resolveDashboardMembershipCategoryFilterState(
        nextHeader,
        dashboardCategoryLabels,
        manualMembershipCategories,
      );
      updateFilter(
        "Membership Category",
        nextCategoryFilter.operator,
        nextCategoryFilter.selectedValues,
      );
      markTemplateScreenDirty();
      if (isAggregateMembershipReportScreen) {
        if (isStatisticsReportScreen) {
          bumpMembershipStatisticsReportReload();
        }
      } else {
        bumpMembershipDashboardApply();
      }
      return;
    }

    updateFilter(label, operator, selectedValues);
    markTemplateScreenDirty();
    if (isStatisticsReportScreen) {
      bumpMembershipStatisticsReportReload();
    }
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
    } else if (isStatisticsReportScreen) {
      bumpMembershipStatisticsReportReload();
    } else if (isWorkplaceBreakdownReportScreen) {
      bumpWorkplaceBreakdownReportReload({ ensureSnapshots: true });
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
    } else if (isCreditNotesScreen) {
      bumpCreditNotesReload();
    } else if (isJournalAdjustmentsScreen) {
      bumpJournalAdjustmentsReload();
    } else if (isOnlinePaymentScreen) {
      bumpOnlinePaymentsReload();
    } else if (isRefundsScreen) {
      bumpRefundsReload();
    } else if (isWriteOffsScreen) {
      bumpWriteOffsReload();
    } else if (isGeneralLedgerScreen) {
      bumpGeneralLedgerReload();
    } else if (isReconciliationScreen) {
      bumpReconciliationReload();
    } else if (isMembershipListingReportScreen) {
      bumpMembershipListingReportReload();
    } else if (isCreditorsListReportScreen) {
      bumpCreditorsListReportReload();
    } else if (isDebtorsListReportScreen) {
      bumpDebtorsListReportReload();
    } else if (isStatisticsReportScreen) {
      bumpMembershipStatisticsReportReload();
    } else if (isWorkplaceBreakdownReportScreen) {
      bumpWorkplaceBreakdownReportReload({ ensureSnapshots: true });
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
    if (isMembershipListingStyleReportScreen) {
      clearReportGridSearchQuery();
    }
    if (
      isApplicationLikePage ||
      isProfileScreen ||
      isMembersScreen ||
      isCreditNotesScreen ||
      isJournalAdjustmentsScreen ||
      isOnlinePaymentScreen ||
      isRefundsScreen ||
      isWriteOffsScreen ||
      isGeneralLedgerScreen ||
      isReconciliationScreen ||
      isMembershipListingStyleReportScreen ||
      isAggregateMembershipReportScreen
    ) {
      const screen =
        getScreenFromPath() ||
        (isApplicationsPage
          ? "Applications"
          : isProfileScreen
            ? "Profile"
            : isCreditNotesScreen
              ? "CreditNotes"
              : isJournalAdjustmentsScreen
                ? "JournalAdjustments"
              : isOnlinePaymentScreen
                ? "OnlinePayment"
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
    } else if (isMembershipExecutiveScreen) {
      updateMembershipDashboardHeader({
        manualMembershipCategories: { operator: "==", selectedValues: [] },
      });
      const nextCategoryFilter = resolveDashboardMembershipCategoryFilterState(
        {
          ...membershipDashboardHeader,
          manualMembershipCategories: { operator: "==", selectedValues: [] },
        },
        dashboardCategoryLabels,
        { operator: "==", selectedValues: [] },
      );
      updateFilter(
        "Membership Category",
        nextCategoryFilter.operator,
        nextCategoryFilter.selectedValues,
      );
      if (isAggregateMembershipReportScreen) {
        if (isStatisticsReportScreen) {
          bumpMembershipStatisticsReportReload();
        } else {
          bumpWorkplaceBreakdownReportReload();
        }
      } else {
        bumpMembershipDashboardApply();
      }
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
    } else if (isCreditNotesScreen) {
      bumpCreditNotesReload();
    } else if (isJournalAdjustmentsScreen) {
      bumpJournalAdjustmentsReload();
    } else if (isOnlinePaymentScreen) {
      bumpOnlinePaymentsReload();
    } else if (isRefundsScreen) {
      bumpRefundsReload();
    } else if (isWriteOffsScreen) {
      bumpWriteOffsReload();
    } else if (isGeneralLedgerScreen) {
      bumpGeneralLedgerReload();
    } else if (isReconciliationScreen) {
      bumpReconciliationReload();
    } else if (isMembershipListingReportScreen) {
      bumpMembershipListingReportReload();
    } else if (isCreditorsListReportScreen) {
      bumpCreditorsListReportReload();
    } else if (isDebtorsListReportScreen) {
      bumpDebtorsListReportReload();
    } else if (isStatisticsReportScreen) {
      bumpMembershipStatisticsReportReload();
    } else if (isWorkplaceBreakdownReportScreen) {
      bumpWorkplaceBreakdownReportReload({ ensureSnapshots: true });
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
        await fetchApplicationLikeList({
          templateId,
          page: 1,
          limit: 500,
          filters: aiFilters,
        }).unwrap();
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

  const buildTemplateSavePayload = () => {
    const filterSnapshot = getFiltersStateForSave();
    const currentApiFilters = transformFiltersForApi(
      filterSnapshot,
      columns[tableColumnScreen] || [],
      gridTemplateType ? { templateType: gridTemplateType } : {},
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

    const visibleFilterLabels = getVisibleFiltersForSave();
    const existingMeta =
      selectedView?.meta ||
      (templates?.userTemplates || []).find(
        (t) => String(t._id) === String(resolvedGridTemplateId),
      )?.meta ||
      templates?.systemDefault?.meta;

    return {
      filters: currentApiFilters,
      columnLabels: currentColumnLabels,
      columns: visibleColumnKeys,
      visibleFilters: visibleFilterLabels,
      meta: buildTemplateMetaWithVisibleFilters(
        existingMeta,
        visibleFilterLabels,
      ),
      ...(gridTemplateType ? { templateType: gridTemplateType } : {}),
    };
  };

  const reloadGridAfterTemplateSave = (templateId) => {
    if (isApplicationLikePage) {
      fetchApplicationLikeList({
        templateId,
        page: 1,
        limit: 500,
      });
    } else if (isProfileScreen) {
      dispatch(
        getProfilesWithFilter({
          templateId,
          page: 1,
          limit: 500,
        }),
      );
    } else if (isMembersScreen) {
      dispatch(
        getSubscriptionsWithTemplate({
          templateId,
          page: 1,
          limit: 500,
        }),
      );
    } else if (isCreditNotesScreen) {
      bumpCreditNotesReload();
    } else if (isJournalAdjustmentsScreen) {
      bumpJournalAdjustmentsReload();
    } else if (isOnlinePaymentScreen) {
      bumpOnlinePaymentsReload();
    } else if (isRefundsScreen) {
      bumpRefundsReload();
    } else if (isWriteOffsScreen) {
      bumpWriteOffsReload();
    } else if (isGeneralLedgerScreen) {
      bumpGeneralLedgerReload();
    } else if (isReconciliationScreen) {
      bumpReconciliationReload();
    } else if (isMembershipListingReportScreen) {
      bumpMembershipListingReportReload();
    } else if (isCreditorsListReportScreen) {
      bumpCreditorsListReportReload();
    } else if (isDebtorsListReportScreen) {
      bumpDebtorsListReportReload();
    } else if (isStatisticsReportScreen) {
      bumpMembershipStatisticsReportReload();
    } else if (isWorkplaceBreakdownReportScreen) {
      bumpWorkplaceBreakdownReportReload();
    }
  };

  const applySavedTemplateState = (view, { preserveVisibleFilters = null } = {}) => {
    const nextFilters = transformFiltersFromApi(
      view?.filters || {},
      columns[tableColumnScreen] || [],
      gridTemplateType ? { templateType: gridTemplateType } : {},
    );
    const savedVisible =
      resolveTemplateVisibleFilters(view, gridTemplateType) ||
      preserveVisibleFilters;
    applyTemplateFilters(nextFilters, {
      savedVisibleFilters: savedVisible,
    });
  };

  const handleSave = () => {
    if (!gridTemplateType) {
      message.warning("This screen does not support saving views.");
      return;
    }
    if (isActiveSystemDefault) {
      setSaveAsNewViewName(
        activeScreen ? `${activeScreen} View` : "Custom View",
      );
      setSaveAsNewModalOpen(true);
      return;
    }

    const id = String(resolvedGridTemplateId || "").trim();
    if (!id) {
      setSaveAsNewViewName(
        activeScreen ? `${activeScreen} View` : "Custom View",
      );
      setSaveAsNewModalOpen(true);
      return;
    }

    handleUpdateExistingTemplate(id);
  };

  const handleUpdateExistingTemplate = async (id) => {
    setIsSaving(true);
    try {
      const payload = buildTemplateSavePayload();
      const preservedVisibleFilters = getVisibleFiltersForSave();

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

      persistVisibleFiltersToStorage(
        gridTemplateType,
        id,
        preservedVisibleFilters,
      );

      applySavedTemplateState(freshView, {
        preserveVisibleFilters: preservedVisibleFilters,
      });

      setApplicationLikeTemplateId(id);
      dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));

      dispatch(
        getGridTemplates(gridTemplateType ? { type: gridTemplateType } : {}),
      );

      reloadGridAfterTemplateSave(id);
    } catch (error) {
      console.error("Error updating template:", error);
      MyAlert("error", "Error", error?.message || "Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNewView = async () => {
    if (!saveAsNewViewName.trim()) {
      message.error("Please enter a view name");
      return;
    }
    if (!gridTemplateType) {
      message.warning("This screen does not support saving views.");
      return;
    }

    const savedViewName = saveAsNewViewName.trim();
    setIsSaving(true);
    try {
      const payload = {
        name: savedViewName,
        ...buildTemplateSavePayload(),
        isDefault: true,
      };
      const preservedVisibleFilters = getVisibleFiltersForSave();
      const token = localStorage.getItem("token");
      const API_URL = resolveTemplatesApiUrl(gridTemplateType);

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      MyAlert(
        "success",
        "Success",
        `View "${savedViewName}" saved and set as your default`,
      );
      setSaveAsNewModalOpen(false);
      setSaveAsNewViewName("");

      const templatesResponse = await dispatch(
        getGridTemplates({ type: gridTemplateType }),
      ).unwrap();

      const savedTemplate = templatesResponse.userTemplates?.find(
        (t) =>
          t.name === savedViewName &&
          String(t.templateType || "").toLowerCase() ===
            String(gridTemplateType).toLowerCase(),
      );

      if (savedTemplate?._id) {
        persistVisibleFiltersToStorage(
          gridTemplateType,
          savedTemplate._id,
          preservedVisibleFilters,
        );

        dispatch(setActiveTemplateId(savedTemplate._id));
        setApplicationLikeTemplateId(savedTemplate._id);

        const freshView = await dispatch(
          getViewById({
            id: savedTemplate._id,
            type: gridTemplateType,
          }),
        ).unwrap();

        applyTemplate(
          tableColumnScreen,
          savedTemplate.columns || freshView?.columns || [],
          templatesResponse?.systemDefault?.columns || [],
          savedTemplate.columnLabels || freshView?.columnLabels || {},
          templatesResponse?.systemDefault?.columnLabels || {},
        );
        applySavedTemplateState(freshView || savedTemplate, {
          preserveVisibleFilters: preservedVisibleFilters,
        });
        reloadGridAfterTemplateSave(savedTemplate._id);
      }

      dispatch(resetScreenChanged({ screen: activeScreen.toLowerCase() }));
    } catch (error) {
      console.error("Error saving new view:", error);
      const apiMsg =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.response?.data?.data ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : null);
      MyAlert("error", "Error", apiMsg || error.message || "Failed to save view");
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
      <div className="d-flex align-items-center flex-wrap toolbar-filter-row">
        {/* Search input */}
        {!isAggregateMembershipReportScreen &&
          location.pathname !== "/MembershipDashboard" &&
          location.pathname !== "/EventsDashboard" &&
          location.pathname !== "/CorrespondenceDashboard" &&
          location.pathname !== "/IssuesManagementDashboard" && (
            <div style={{ flex: "0 0 250px" }}>
              <Input
                className="my-input-field"
                allowClear={isMembershipListingStyleReportScreen}
                value={
                  isMembershipListingStyleReportScreen ? gridSearch : undefined
                }
                onChange={(e) => {
                  if (isMembershipListingStyleReportScreen) {
                    setReportGridSearchQuery(e.target.value);
                  }
                }}
                placeholder={
                  isMembershipListingStyleReportScreen
                    ? "Membership No or Name"
                    : location.pathname === "/CasesSummary"
                      ? "Search Case ID, team, or stakeholder"
                      : location.pathname === "/EventsSummary"
                        ? "Search Event ID or Name"
                        : location.pathname === "/Attendees"
                          ? "Search Attendee ID or Name"
                          : isCreditNotesScreen
                            ? "Search CN ref or member"
                            : isJournalAdjustmentsScreen
                              ? "Search adjustment ref or member"
                              : isOnlinePaymentScreen
                                ? "Search transaction or member"
                                : "Membership No or Surname"
                }
                style={{
                  height: 34,
                  borderRadius: 3,
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

          const isDateField = isDateFilterLabel(
            label,
            columns[tableColumnScreen] || [],
          );

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

          const isNumericField = isNumericFilterLabel(
            label,
            columns[tableColumnScreen] || [],
          );

          if (isNumericField) {
            return (
              <NumberFilter
                key={`${resolvedGridTemplateId || "default"}-${label}`}
                label={label}
                selectedValues={selectedValues}
                operator={operator}
                onApply={handleFilterApply}
              />
            );
          }

          const isStringField = isStringFilterLabel(
            label,
            columns[tableColumnScreen] || [],
          );

          if (isStringField) {
            return (
              <TextFilter
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
              formatOptionLabel={
                label === "Membership Movement"
                  ? formatMembershipMovementLabel
                  : undefined
              }
            />
          );
        })}

        {isMembershipExecutiveScreen && (
          <MembershipDashboardHeaderControls variant="inline" />
        )}

        <SimpleMenu
          title="More"
          triggerClassName="gray-btn butn"
        />
        <Button className="gray-btn butn" onClick={handleReset}>
          Reset
        </Button>
        <Button
          className="toolbar-filter-action toolbar-filter-action--primary"
          onClick={handleSearch}
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
      <Modal
        title="Save as New View"
        open={saveAsNewModalOpen}
        onCancel={() => setSaveAsNewModalOpen(false)}
        closable={false}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={() => setSaveAsNewModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            className="butn primary-btn"
            style={{ marginRight: 4 }}
            onClick={handleSaveAsNewView}
            loading={isSaving}
          >
            Save
          </Button>,
        ]}
      >
        <div style={{ margin: 16 }}>
          <p style={{ marginBottom: 12, color: "#666" }}>
            System default cannot be changed directly. Save your settings as a
            new view — it will become your default on this screen.
          </p>
          <MyInput
            label="View Name"
            value={saveAsNewViewName}
            onChange={(e) => setSaveAsNewViewName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Toolbar;
