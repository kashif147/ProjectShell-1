import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "../features/LookupsSlice";
import { getCategoryLookup } from "../features/CategoryLookupSlice";
import { getWorkLocationHierarchy } from "../features/LookupsWorkLocationSlice";
import { resetInitialization } from "../features/applicationwithfilterslice";
import { markScreenChanged } from "../features/views/ScreenFilterChangSlice";
import { fetchSubscriptionYears } from "../features/subscription/subscriptionSlice";
import {
  isDateFilterLabel,
  isNumericFilterLabel,
  isStringFilterLabel,
  consolidateApplicationsStatusFilter,
  consolidateMembershipListingFilters,
} from "../utils/filterUtils";
import {
  buildDataDerivedFilterOptions,
  CLIENT_SIDE_GRID_FILTER_SCREENS,
  hasRegisteredGridFilterRows,
  mergeStaticAndDerivedOptions,
  subscribeGridFilterRows,
} from "../utils/gridFilterOptionsRegistry";

const FilterContext = createContext();

// 🔹 Common filters that should appear on all screens
const COMMON_FILTERS = ["Grade", "Work Location", "Region", "Branch"];

/** Statistics report: membership / executive filters only (no application/profile fields). */
const STATISTICS_REPORT_ALLOWED_FILTERS = [
  "Membership Category",
  "Membership Status",
  "Membership Movement",
  "Grade",
  "Work Location",
  "Section (Primary Section)",
  "Region",
  "Branch",
  "Payment Type",
  "Payment Frequency",
  "Membership Start Date",
  "Expiry Date",
  "Cancelled Date",
  "Resigned Date",
  "Processed At Date",
  "Renewal Date",
  "Last Payment Date",
  "Invoice Amount",
  "Arrears Amount",
  "Deferred Amount",
  "Balance",
];

const STATISTICS_REPORT_ALLOWED_SET = new Set(
  STATISTICS_REPORT_ALLOWED_FILTERS,
);

/** Toolbar chips shown on first visit / reset. Month, Year, Student, Honorary are header controls. */
const STATISTICS_REPORT_DEFAULT_VISIBLE_FILTERS = [
  "Membership Category",
  "Grade",
  "Branch",
  "Region",
];

const WORKPLACE_BREAKDOWN_REPORT_DEFAULT_VISIBLE_FILTERS = [
  "Membership Status",
  "Work Location",
  "Region",
];

const AGGREGATE_MEMBERSHIP_REPORT_SCREENS = new Set([
  "StatisticsReport",
  "WorkplaceBreakdownReport",
]);

function isAggregateMembershipReportScreen(screen) {
  return AGGREGATE_MEMBERSHIP_REPORT_SCREENS.has(screen);
}

export const FilterProvider = ({ children }) => {
  const dispatch = useDispatch();

  // 🔹 Get lookups from Redux store
  const {
    gradeOptions,
    workLocationOptions,
    regionOptions,
    branchOptions,
    membershipCategoryOptions,
    paymentTypeOptions,
    genderOptions,
    sectionOptions,
    lookups: lookupsRaw,
    lookupsloading,
  } = useSelector((state) => state.lookups);

  // 🔹 Get category data from categoryLookup slice
  const { categoryData, categoryLoading, currentCategoryId } = useSelector(
    (state) => state.categoryLookup,
  );

  const MEMBERSHIP_CATEGORY_LOOKUP_ID = "68dae613c5b15073d66b891f";

  // 🔹 Get hierarchical data from lookupsWorkLocation slice
  const { hierarchyData, workLocationLoading, workLocationError } = useSelector(
    (state) => state.lookupsWorkLocation,
  );

  const {
    subscriptionYears,
    subscriptionYearsLoaded,
    subscriptionYearsLoading,
  } = useSelector((state) => state.subscription);

  // 🔹 Use hierarchical lookups from localStorage
  const [allHierarchicalData, setAllHierarchicalData] = useState([]);
  const [filteredWLOptions, setFilteredWLOptions] = useState([]);
  const [filteredRegionOptions, setFilteredRegionOptions] = useState([]);
  const [filteredBranchOptions, setFilteredBranchOptions] = useState([]);

  // 🔹 Load hierarchy data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hierarchicalLookups");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAllHierarchicalData(parsed);
          console.log(
            "✅ FilterContext: Loaded hierarchical lookups from localStorage",
            parsed.length,
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ FilterContext: Error loading hierarchy from localStorage",
        error,
      );
    }
  }, []);

  const screenFilterStatesRef = useRef({});

  // 🔹 Store filter states for each screen
  const [screenFilterStates, setScreenFilterStates] = useState({
    Applications: {
      visibleFilters: [],
      filtersState: {},
    },
    Profile: {
      visibleFilters: [],
      filtersState: {},
    },
    Membership: {
      visibleFilters: [],
      filtersState: {},
    },
    Members: {
      visibleFilters: [],
      filtersState: {},
    },
    OnlinePayment: {
      visibleFilters: [],
      filtersState: {},
    },
    Communication: {
      visibleFilters: [],
      filtersState: {},
    },
    Cases: {
      visibleFilters: [],
      filtersState: {},
    },
    Events: {
      visibleFilters: [],
      filtersState: {},
    },
    Attendees: {
      visibleFilters: [],
      filtersState: {},
    },
    MembershipDashboard: {
      visibleFilters: [],
      filtersState: {},
    },
    MembershipListingReport: {
      visibleFilters: [],
      filtersState: {},
    },
    StatisticsReport: {
      visibleFilters: [],
      filtersState: {},
    },
    WorkplaceBreakdownReport: {
      visibleFilters: [],
      filtersState: {},
    },
    EmailCampaigns: {
      visibleFilters: [],
      filtersState: {},
    },
    CreditNotes: {
      visibleFilters: [],
      filtersState: {},
    },
    JournalAdjustments: {
      visibleFilters: [],
      filtersState: {},
    },
    Refunds: {
      visibleFilters: [],
      filtersState: {},
    },
    WriteOffs: {
      visibleFilters: [],
      filtersState: {},
    },
    GeneralLedger: {
      visibleFilters: [],
      filtersState: {},
    },
    Reconciliation: {
      visibleFilters: [],
      filtersState: {},
    },
  });

  // 🔹 Current screen's states
  const [activePage, setActivePage] = useState("Applications");
  const [visibleFilters, setVisibleFilters] = useState([]);
  const [filtersState, setFiltersState] = useState({});
  /** Ref mirrors filtersState for save/serialize so payloads always use the latest in-memory values. */
  const filtersStateRef = useRef({});
  /**
   * True after the user changes any filter or reset; false after a server/template apply.
   * SaveViewMenu uses this to avoid stomping in-progress edits when getViewById completes late.
   */
  const userOverrodeTemplateFiltersRef = useRef(false);
  const activePageRef = useRef("Applications");
  const [membershipDashboardApplyTick, setMembershipDashboardApplyTick] =
    useState(0);

  const getDefaultMembershipDashboardHeader = () => {
    const now = new Date();
    return {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      includeStudents: true,
      includeHonorary: true,
      includeBreakdown: true,
      includeEmptyRows: false,
      rollingMonths: 12,
      audienceScope: "full",
      scopeUserId: null,
      manualMembershipCategories: { operator: "==", selectedValues: [] },
    };
  };

  const [membershipDashboardHeader, setMembershipDashboardHeader] = useState(
    getDefaultMembershipDashboardHeader,
  );

  const updateMembershipDashboardHeader = useCallback((patch) => {
    setMembershipDashboardHeader((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetMembershipDashboardHeader = useCallback(() => {
    setMembershipDashboardHeader(getDefaultMembershipDashboardHeader());
  }, []);

  const location = useLocation();
  const activeScreenName = location?.pathname;

  useEffect(() => {
    filtersStateRef.current = filtersState;
  }, [filtersState]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    screenFilterStatesRef.current = screenFilterStates;
  }, [screenFilterStates]);

  /** Always use live filter state. Falling back to `screenFilterStates` when live was empty caused stale template values and broken Save / dirty behavior. */
  const getFiltersStateForSave = useCallback(() => {
    const live = { ...(filtersStateRef.current || {}) };
    if (
      activePageRef.current === "MembershipListingReport" ||
      activePageRef.current === "StatisticsReport" ||
      activePageRef.current === "WorkplaceBreakdownReport"
    ) {
      return consolidateMembershipListingFilters(live, []).filtersState;
    }
    return live;
  }, []);

  // 🔹 Fetch lookups and categories when missing (avoids duplicating App.js bootstrap)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!lookupsloading && (!lookupsRaw || lookupsRaw.length === 0)) {
      dispatch(getAllLookups());
    }
    if (
      !categoryLoading &&
      (currentCategoryId !== MEMBERSHIP_CATEGORY_LOOKUP_ID ||
        !categoryData?.length)
    ) {
      dispatch(getCategoryLookup(MEMBERSHIP_CATEGORY_LOOKUP_ID));
    }
  }, [
    dispatch,
    lookupsloading,
    lookupsRaw,
    categoryLoading,
    currentCategoryId,
    categoryData,
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    dispatch(fetchSubscriptionYears());
  }, [dispatch]);

  /** Rebuild filter dropdown options when client-side grids register row data. */
  const [gridFilterRowsTick, setGridFilterRowsTick] = useState(0);
  useEffect(() => subscribeGridFilterRows(() => {
    setGridFilterRowsTick((t) => t + 1);
  }), []);

  // 🔹 Remove old API-based extraction helper

  // 🔹 Multi-way dependent filtering logic (Final Robust version)
  useEffect(() => {
    if (!allHierarchicalData || allHierarchicalData.length === 0) return;

    const selectedWL = filtersState["Work Location"]?.selectedValues || [];
    const selectedRegion = filtersState["Region"]?.selectedValues || [];
    const selectedBranch = filtersState["Branch"]?.selectedValues || [];

    // Helper to extract identifier names from data item for a specific type
    const getNamesForItem = (item, type) => {
      const names = new Set();

      // Simple nested location tree (default hierarchy API shape)
      if (item?.id && item?.type) {
        if (type === "Work Location" && item.type === "workLocation" && item.name) {
          names.add(item.name);
        }
        if (type === "Branch" && item.branch?.name) {
          names.add(item.branch.name);
        }
        if (type === "Region") {
          const regionName = item.branch?.region?.name || item.region?.name;
          if (regionName) names.add(regionName);
        }
        if (names.size > 0) return Array.from(names);
      }

      // 1. Direct property (e.g. item.region, item.branch, item.lookup)
      const propName = type === "Work Location" ? "lookup" : type.toLowerCase();
      const direct = item[propName];
      if (direct) {
        const name =
          direct.DisplayName ||
          direct.lookupname ||
          direct.label ||
          (typeof direct === "string" ? direct : null);
        if (name && typeof name === "string") names.add(name);
        else if (typeof direct === "string") {
          // Resolve ID if string
          const optionsMap = {
            Region: regionOptions,
            Branch: branchOptions,
            "Work Location": workLocationOptions,
          };
          const found = optionsMap[type]?.find(
            (opt) =>
              opt.value === direct || opt.id === direct || opt._id === direct,
          );
          if (found?.label) names.add(found.label);
        }
      }

      // 2. Hierarchy array
      item.hierarchy?.forEach((h) => {
        const hType = h.lookuptypeId?.lookuptype?.toLowerCase();
        // Handle "workLocation" camelCase from JSON vs "Work Location"
        const isMatch =
          (type === "Work Location" &&
            (hType === "worklocation" || hType === "workloc")) ||
          hType === type.toLowerCase();

        if (isMatch) {
          const name = h.DisplayName || h.lookupname || h.label;
          if (name) names.add(name);
        }
      });

      return Array.from(names);
    };

    // Helper to filter data based on selections EXCEPT the one we are calculating options for
    const getFilteredSubset = (excludeType) => {
      let data = allHierarchicalData;

      if (excludeType !== "Work Location" && selectedWL.length > 0) {
        data = data.filter((item) => {
          const itemWLs = getNamesForItem(item, "Work Location");
          return itemWLs.some((wl) => selectedWL.includes(wl));
        });
      }

      if (excludeType !== "Region" && selectedRegion.length > 0) {
        data = data.filter((item) => {
          const itemRegions = getNamesForItem(item, "Region");
          return itemRegions.some((reg) => selectedRegion.includes(reg));
        });
      }

      if (excludeType !== "Branch" && selectedBranch.length > 0) {
        data = data.filter((item) => {
          const itemBranches = getNamesForItem(item, "Branch");
          return itemBranches.some((br) => selectedBranch.includes(br));
        });
      }

      return data;
    };

    // Calculate available options
    const newWL = new Set();
    const newRegions = new Set();
    const newBranches = new Set();

    getFilteredSubset("Work Location").forEach((item) => {
      getNamesForItem(item, "Work Location").forEach((n) => newWL.add(n));
    });

    getFilteredSubset("Region").forEach((item) => {
      getNamesForItem(item, "Region").forEach((n) => newRegions.add(n));
    });

    getFilteredSubset("Branch").forEach((item) => {
      getNamesForItem(item, "Branch").forEach((n) => newBranches.add(n));
    });

    const finalWLs = Array.from(newWL).sort();
    const finalRegions = Array.from(newRegions).sort();
    const finalBranches = Array.from(newBranches).sort();

    setFilteredWLOptions(finalWLs);
    setFilteredRegionOptions(finalRegions);
    setFilteredBranchOptions(finalBranches);

    // Sync geo filters: prune invalid + auto-select Region/Branch when WL leaves only one choice
    let needsStateSync = false;
    const syncedFiltersState = { ...filtersState };

    const labelListFromOpts = (options) =>
      (options || []).map((opt) => opt.label);

    if (selectedWL.length > 0) {
      const dataUnderWL = allHierarchicalData.filter((item) => {
        const itemWLs = getNamesForItem(item, "Work Location");
        return itemWLs.some((wl) => selectedWL.includes(wl));
      });
      const regionsUnderWL = new Set();
      const branchesUnderWL = new Set();
      dataUnderWL.forEach((item) => {
        getNamesForItem(item, "Region").forEach((n) => regionsUnderWL.add(n));
        getNamesForItem(item, "Branch").forEach((n) => branchesUnderWL.add(n));
      });
      const ru = Array.from(regionsUnderWL).sort();
      const bu = Array.from(branchesUnderWL).sort();

      const sameValues = (cur, next) =>
        Array.isArray(cur) &&
        Array.isArray(next) &&
        cur.length === next.length &&
        cur.every(
          (v, i) => String(v).toLowerCase() === String(next[i]).toLowerCase(),
        );

      if (ru.length === 1) {
        const next = [ru[0]];
        const cur = syncedFiltersState["Region"]?.selectedValues || [];
        if (!sameValues(cur, next)) {
          syncedFiltersState["Region"] = {
            operator: syncedFiltersState["Region"]?.operator || "==",
            selectedValues: next,
          };
          needsStateSync = true;
        }
      }
      if (bu.length === 1) {
        const next = [bu[0]];
        const cur = syncedFiltersState["Branch"]?.selectedValues || [];
        if (!sameValues(cur, next)) {
          syncedFiltersState["Branch"] = {
            operator: syncedFiltersState["Branch"]?.operator || "==",
            selectedValues: next,
          };
          needsStateSync = true;
        }
      }
    }

    const effWL = syncedFiltersState["Work Location"]?.selectedValues || [];
    const effReg = syncedFiltersState["Region"]?.selectedValues || [];
    const effBr = syncedFiltersState["Branch"]?.selectedValues || [];

    const checkAndPrune = (type, validOptions, baseOptions) => {
      const current = syncedFiltersState[type]?.selectedValues || [];
      if (current.length === 0) return;

      const otherWL = type !== "Work Location" && effWL.length > 0;
      const otherReg = type !== "Region" && effReg.length > 0;
      const otherBr = type !== "Branch" && effBr.length > 0;

      const isRestricted =
        (type === "Work Location" && (otherReg || otherBr)) ||
        (type === "Region" && (otherWL || otherBr)) ||
        (type === "Branch" && (otherWL || otherReg));

      const sourceOfTruth = isRestricted ? validOptions : baseOptions;

      if (!sourceOfTruth || sourceOfTruth.length === 0) return;

      const stillValid = current.filter((val) => {
        const stringVal = String(val).toLowerCase();
        return sourceOfTruth.some(
          (opt) => String(opt).toLowerCase() === stringVal,
        );
      });
      if (stillValid.length !== current.length) {
        syncedFiltersState[type] = {
          ...syncedFiltersState[type],
          selectedValues: stillValid,
        };
        needsStateSync = true;
      }
    };

    if (effWL.length > 0 || effReg.length > 0 || effBr.length > 0) {
      checkAndPrune(
        "Work Location",
        finalWLs,
        labelListFromOpts(workLocationOptions || []),
      );
      checkAndPrune(
        "Region",
        finalRegions,
        labelListFromOpts(regionOptions || []),
      );
      checkAndPrune(
        "Branch",
        finalBranches,
        labelListFromOpts(branchOptions || []),
      );
    }

    if (needsStateSync) {
      console.log(
        "🛡️ FilterContext: Synced geo filters (singleton auto-select and/or prune)",
      );
      setFiltersState(syncedFiltersState);
      setScreenFilterStates((prev) => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          filtersState: syncedFiltersState,
        },
      }));
    }
  }, [
    filtersState,
    allHierarchicalData,
    regionOptions,
    branchOptions,
    workLocationOptions,
    activePage,
  ]);

  // 🛡️ EFFECT: Periodically prune junk from filtersState (null, undefined, non-strings, etc.)
  useEffect(() => {
    let changed = false;
    const newState = { ...filtersState };

    Object.keys(newState).forEach((key) => {
      const filter = newState[key];
      if (filter?.selectedValues) {
        const isDateFilter = isDateFilterLabel(key);
        const cleaned = filter.selectedValues.filter((v) => {
          if (v === null || v === undefined) return false;
          if (isDateFilter && typeof v === "number" && Number.isFinite(v)) {
            return true;
          }
          return typeof v === "string" && v.trim() !== "";
        });

        if (cleaned.length !== filter.selectedValues.length) {
          newState[key] = { ...filter, selectedValues: cleaned };
          changed = true;
        }
      }
    });

    if (changed) {
      console.log(
        "🛡️ FilterContext: Pruned invalid values from state (enforced string-only)",
      );
      setFiltersState(newState);
    }
  }, [filtersState]);

  // 🔹 Helper to get screen from path (keys lowercased so /Applications and /applications match)
  const getScreenFromPath = () => {
    const pathMap = {
      "/applications": "Applications",
      "/paymentforms": "Payment Forms",
      "/summary": "Profile",
      "/membership": "Membership",
      "/members": "Members",
      "/onlinepayment": "OnlinePayment",
      "/communicationbatchdetail": "Communication",
      "/casessummary": "Cases",
      "/eventssummary": "Events",
      "/eventsdashboard": "Events",
      "/correspondencedashboard": "Communication",
      "/issuesmanagementdashboard": "Cases",
      "/attendees": "Attendees",
      "/membershipdashboard": "MembershipDashboard",
      "/membershiplistingreport": "MembershipListingReport",
      "/statisticsreport": "StatisticsReport",
      "/workplacebreakdownreport": "WorkplaceBreakdownReport",
      "/email": "EmailCampaigns",
      "/emailcampaigndetail": "EmailCampaigns",
      "/creditnotes": "CreditNotes",
      "/journaladjustments": "JournalAdjustments",
      "/refunds": "Refunds",
      "/write-offs": "WriteOffs",
      "/generalledger": "GeneralLedger",
      "/reconciliation": "Reconciliation",
    };
    const key = (activeScreenName || "").toLowerCase();
    return pathMap[key] || "Applications";
  };

  const activeScreen = getScreenFromPath();

  // 🔹 View filters configuration
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
      "Payment Forms": [
        "Membership Category",
        "Form Type",
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
        "Joining Date",
        "Membership Fee",
        "Outstanding Balance",
        "Reminder No",
        "Reminder Date",
        "Cancellation Flag",
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
        "Membership Status",
        "Membership Category",
        "Payment Type",
        "Payment Frequency",
        "Subscription Year",
        "Start Date",
        "End Date",
        "Rollover Date",
        "Membership Movement",
        "Payroll No",
        "Consent",
        "Created At",
        "Updated At",
        "Cancellation/Reinstated",
        "Work Location",
        "Grade",
        "Branch",
        "Region",
      ],
      OnlinePayment: [
        "Member / Application No",
        "Membership Category",
        "Full Name",
        "Membership Status",
        "Renewal Date",
        "Transaction ID",
        "Paid Amount",
        "Payment Date",
        "Payment Method",
        "Payment Status",
        "Billing Cycle",
        "Email",
        "Phone",
        "Join Date",
      ],
      Communication: [
        "Membership No",
        "Email",
        "Mobile No",
        "Grade",
        "Work Location",
        "Region",
        "Branch",
        "Membership Category",
        "Payment Status",
      ],
      Cases: [
        "Search",
        "Incident Date",
        "Case Type",
        "Stakeholder",
        "Priority",
      ],
      Events: ["Event", "Event Type", "Event Date"],
      MembershipDashboard: [
        "Membership Category",
        "Grade",
        "Section (Primary Section)",
        "Region",
        "Branch",
      ],
      MembershipListingReport: [
        "Membership Category",
        "Membership Status",
        "Membership Movement",
        "Grade",
        "Work Location",
        "Section (Primary Section)",
        "Region",
        "Branch",
        "Payment Type",
        "Payment Frequency",
        "Membership Start Date",
        "Expiry Date",
        "Cancelled Date",
        "Resigned Date",
        "Processed At Date",
        "Renewal Date",
        "Last Payment Date",
        "Invoice Amount",
        "Arrears Amount",
        "Deferred Amount",
        "Balance",
      ],
      StatisticsReport: [...STATISTICS_REPORT_ALLOWED_FILTERS],
      WorkplaceBreakdownReport: [...STATISTICS_REPORT_ALLOWED_FILTERS],
      EmailCampaigns: [
        "Membership Category",
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
      Attendees: [
        "Event",
        "Event Type",
        "Registration Status",
        "Event Date",
        "Payment Status",
        "Grade",
        "Work Location",
      ],
      CreditNotes: [
        "CN Status",
        "CN ref",
        "Invoice",
        "Member",
        "Amount",
        "Reason",
        "Created By",
        "Effective",
        "Created At",
      ],
      JournalAdjustments: [
        "JA Status",
        "Adjustment reference",
        "Debit",
        "Credit",
        "Member",
        "Reason",
        "Effective",
        "Created At",
      ],
      Refunds: [
        "Refund ID",
        "Ref No",
        "Memo",
        "Refund Date",
        "Refund Amount",
        "Refund Type",
        "Refund Source",
        "Member No / Application No",
        "Created By",
        "Created At",
      ],
      WriteOffs: [
        "WO Status",
        "WriteOff",
        "WriteOff Date",
        "Ref",
        "Amount",
        "Member",
        "Type",
        "Created By",
        "Created At",
        "Updated By",
        "Updated At",
      ],
      GeneralLedger: [
        "GL Status",
        "Member",
        "Tx date",
        "Tx type",
        "Doc ref",
        "GL Debit",
        "GL Credit",
        "Memo",
        "Posted",
      ],
      Reconciliation: [
        "Rec Status",
        "Clearing Account",
        "Bank ref",
        "Member",
        "Amount",
        "Expected",
        "Difference",
        "Confidence",
        "Suggested action",
        "Matched GL",
        "Source",
      ],
    }),
    [],
  );

  // 🔹 Screen-specific default filters
  const screenSpecificDefaultFilters = {
    Applications: ["Application Status", "Membership Category"],
    "Payment Forms": ["Form Type", "Membership Category"],
    Profile: ["Email", "Membership Category"],
    Membership: ["Membership Status", "Membership Category"],
    Members: ["Membership Status", "Membership Category"],
    OnlinePayment: ["Membership Status", "Payment Status"],
    Communication: ["Grade", "Work Location"],
    Cases: ["Incident Date", "Case Type", "Stakeholder", "Priority"],
    Events: ["Event", "Event Type", "Event Date"],
    Attendees: [
      "Event",
      "Event Type",
      "Registration Status",
      "Event Date",
      "Payment Status",
    ],
    MembershipDashboard: ["Membership Category", "Section (Primary Section)"],
    MembershipListingReport: [
      "Membership Category",
      "Membership Status",
      "Membership Movement",
      "Section (Primary Section)",
      "Payment Type",
    ],
    StatisticsReport: [...STATISTICS_REPORT_DEFAULT_VISIBLE_FILTERS],
    WorkplaceBreakdownReport: [...WORKPLACE_BREAKDOWN_REPORT_DEFAULT_VISIBLE_FILTERS],
    EmailCampaigns: ["Membership Category"],
    CreditNotes: ["CN Status"],
    JournalAdjustments: ["JA Status"],
    Refunds: ["Refund Type"],
    WriteOffs: ["WO Status"],
    GeneralLedger: ["GL Status"],
    Reconciliation: ["Rec Status", "Clearing Account"],
  };

  /** Preserve order; drop duplicate labels (e.g. Grade in both screen defaults and COMMON_FILTERS). */
  const dedupeFilterLabels = (labels = []) => {
    const seen = new Set();
    return labels.filter((label) => {
      if (!label || seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  };

  const restrictStatisticsReportFilters = (
    visible = [],
    state = {},
  ) => {
    const visibleFilters = dedupeFilterLabels(
      visible.filter((label) => STATISTICS_REPORT_ALLOWED_SET.has(label)),
    );
    const filtersState = {};
    Object.entries(state || {}).forEach(([key, value]) => {
      if (STATISTICS_REPORT_ALLOWED_SET.has(key)) {
        filtersState[key] = value;
      }
    });
    return { visibleFilters, filtersState };
  };

  const buildAggregateReportVisibleFilters = (screen, state = {}) => {
    const defaults =
      screen === "WorkplaceBreakdownReport"
        ? WORKPLACE_BREAKDOWN_REPORT_DEFAULT_VISIBLE_FILTERS
        : STATISTICS_REPORT_DEFAULT_VISIBLE_FILTERS;
    const withValues = Object.keys(state || {}).filter(
      (key) =>
        STATISTICS_REPORT_ALLOWED_SET.has(key) &&
        (state[key]?.selectedValues || []).length > 0,
    );
    return dedupeFilterLabels([
      ...defaults,
      ...withValues.filter((key) => !defaults.includes(key)),
    ]);
  };

  const buildStatisticsReportVisibleFilters = (state = {}) =>
    buildAggregateReportVisibleFilters("StatisticsReport", state);

  const buildWorkplaceBreakdownReportVisibleFilters = (state = {}) =>
    buildAggregateReportVisibleFilters("WorkplaceBreakdownReport", state);

  // 🔹 Helper to get default visible filters for a screen
  const getDefaultVisibleFilters = (screen) => {
    if (screen === "StatisticsReport") {
      return [...STATISTICS_REPORT_DEFAULT_VISIBLE_FILTERS];
    }
    if (screen === "WorkplaceBreakdownReport") {
      return [...WORKPLACE_BREAKDOWN_REPORT_DEFAULT_VISIBLE_FILTERS];
    }
    const screenSpecific = screenSpecificDefaultFilters[screen] || [];
    const availableCommonFilters = COMMON_FILTERS.filter((filter) =>
      viewFilters[screen]?.includes(filter),
    );
    return dedupeFilterLabels([...screenSpecific, ...availableCommonFilters]);
  };

  const buildMembershipListingReportVisibleFilters = (
    state = {},
    savedVisible = null,
  ) => {
    const allowed = new Set(viewFilters.MembershipListingReport || []);
    const defaults = getDefaultVisibleFilters("MembershipListingReport");

    if (Array.isArray(savedVisible) && savedVisible.length > 0) {
      return dedupeFilterLabels(
        savedVisible.filter(
          (label) =>
            allowed.has(label) &&
            label !== "Date Range" &&
            label !== "Payment Date",
        ),
      );
    }

    const withValues = Object.keys(state || {}).filter(
      (key) =>
        allowed.has(key) && (state[key]?.selectedValues || []).length > 0,
    );
    return dedupeFilterLabels([
      ...defaults,
      ...withValues.filter((key) => !defaults.includes(key)),
    ]);
  };

  // 🔹 Default visible filters for each screen
  const defaultVisibleFilters = useMemo(
    () => ({
      Applications: getDefaultVisibleFilters("Applications"),
      "Payment Forms": getDefaultVisibleFilters("Payment Forms"),
      Profile: getDefaultVisibleFilters("Profile"),
      Membership: getDefaultVisibleFilters("Membership"),
      Members: getDefaultVisibleFilters("Members"),
      OnlinePayment: getDefaultVisibleFilters("OnlinePayment"),
      Communication: getDefaultVisibleFilters("Communication"),
      Cases: getDefaultVisibleFilters("Cases"),
      Events: getDefaultVisibleFilters("Events"),
      Attendees: getDefaultVisibleFilters("Attendees"),
      MembershipDashboard: getDefaultVisibleFilters("MembershipDashboard"),
      MembershipListingReport: getDefaultVisibleFilters("MembershipListingReport"),
      StatisticsReport: getDefaultVisibleFilters("StatisticsReport"),
      WorkplaceBreakdownReport: getDefaultVisibleFilters("WorkplaceBreakdownReport"),
      EmailCampaigns: getDefaultVisibleFilters("EmailCampaigns"),
      CreditNotes: getDefaultVisibleFilters("CreditNotes"),
      JournalAdjustments: getDefaultVisibleFilters("JournalAdjustments"),
      Refunds: getDefaultVisibleFilters("Refunds"),
      WriteOffs: getDefaultVisibleFilters("WriteOffs"),
      GeneralLedger: getDefaultVisibleFilters("GeneralLedger"),
      Reconciliation: getDefaultVisibleFilters("Reconciliation"),
    }),
    [],
  );

  // 🔹 Default filter VALUES for each screen
  const defaultFilterValues = useMemo(
    () => ({
      Applications: {
        "Application Status": {
          operator: "==",
          selectedValues: ["Submitted"],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      "Payment Forms": {
        "Form Type": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      Profile: {
        Email: {
          operator: "==",
          selectedValues: [],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      Membership: {
        "Membership Status": {
          operator: "==",
          selectedValues: ["Active"],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      Members: {
        "Membership Status": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      OnlinePayment: {
        "Membership Status": {
          operator: "==",
          selectedValues: [],
        },
        "Payment Status": {
          operator: "==",
          selectedValues: [],
        },
        "Payment Method": {
          operator: "==",
          selectedValues: [],
        },
        "Billing Cycle": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Member / Application No": {
          operator: "==",
          selectedValues: [],
        },
        "Transaction ID": {
          operator: "==",
          selectedValues: [],
        },
        "Paid Amount": {
          operator: "==",
          selectedValues: [],
        },
        "Full Name": {
          operator: "==",
          selectedValues: [],
        },
        Email: {
          operator: "==",
          selectedValues: [],
        },
        Phone: {
          operator: "==",
          selectedValues: [],
        },
        "Renewal Date": {
          operator: "between",
          selectedValues: [],
        },
        "Payment Date": {
          operator: "between",
          selectedValues: [],
        },
        "Join Date": {
          operator: "between",
          selectedValues: [],
        },
      },
      Communication: {
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
      },
      Cases: {
        "Incident Date": {
          operator: "between",
          selectedValues: [],
        },
        "Case Type": {
          operator: "==",
          selectedValues: [],
        },
        Stakeholder: {
          operator: "==",
          selectedValues: [],
        },
        Priority: {
          operator: "==",
          selectedValues: [],
        },
      },
      Events: {
        Event: {
          operator: "==",
          selectedValues: [],
        },
        "Event Type": {
          operator: "==",
          selectedValues: [],
        },
        "Event Date": {
          operator: "between",
          selectedValues: [],
        },
      },
      MembershipDashboard: {
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        "Section (Primary Section)": {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      MembershipListingReport: {
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Status": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Movement": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        "Section (Primary Section)": {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
        "Payment Type": {
          operator: "==",
          selectedValues: [],
        },
        "Payment Frequency": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Start Date": {
          operator: "between",
          selectedValues: [],
        },
        "Expiry Date": {
          operator: "between",
          selectedValues: [],
        },
        "Cancelled Date": {
          operator: "between",
          selectedValues: [],
        },
        "Resigned Date": {
          operator: "between",
          selectedValues: [],
        },
        "Processed At Date": {
          operator: "between",
          selectedValues: [],
        },
        "Renewal Date": {
          operator: "between",
          selectedValues: [],
        },
        "Last Payment Date": {
          operator: "between",
          selectedValues: [],
        },
      },
      StatisticsReport: {
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Status": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Movement": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        "Section (Primary Section)": {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
        "Payment Type": {
          operator: "==",
          selectedValues: [],
        },
        "Payment Frequency": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Start Date": {
          operator: "between",
          selectedValues: [],
        },
        "Expiry Date": {
          operator: "between",
          selectedValues: [],
        },
        "Cancelled Date": {
          operator: "between",
          selectedValues: [],
        },
        "Resigned Date": {
          operator: "between",
          selectedValues: [],
        },
        "Processed At Date": {
          operator: "between",
          selectedValues: [],
        },
        "Renewal Date": {
          operator: "between",
          selectedValues: [],
        },
        "Last Payment Date": {
          operator: "between",
          selectedValues: [],
        },
      },
      WorkplaceBreakdownReport: {
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Status": {
          operator: "==",
          selectedValues: ["Active"],
        },
        "Membership Movement": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        "Section (Primary Section)": {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
        "Payment Type": {
          operator: "==",
          selectedValues: [],
        },
        "Payment Frequency": {
          operator: "==",
          selectedValues: [],
        },
        "Membership Start Date": {
          operator: "between",
          selectedValues: [],
        },
        "Expiry Date": {
          operator: "between",
          selectedValues: [],
        },
        "Cancelled Date": {
          operator: "between",
          selectedValues: [],
        },
        "Resigned Date": {
          operator: "between",
          selectedValues: [],
        },
        "Processed At Date": {
          operator: "between",
          selectedValues: [],
        },
        "Renewal Date": {
          operator: "between",
          selectedValues: [],
        },
        "Last Payment Date": {
          operator: "between",
          selectedValues: [],
        },
      },
      Attendees: {
        Event: {
          operator: "==",
          selectedValues: [],
        },
        "Event Type": {
          operator: "==",
          selectedValues: [],
        },
        "Registration Status": {
          operator: "==",
          selectedValues: [],
        },
        "Payment Status": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        "Event Date": {
          operator: "between",
          selectedValues: [],
        },
      },
      EmailCampaigns: {
        "Membership Category": {
          operator: "==",
          selectedValues: [],
        },
        "Work Location": {
          operator: "==",
          selectedValues: [],
        },
        Grade: {
          operator: "==",
          selectedValues: [],
        },
        Region: {
          operator: "==",
          selectedValues: [],
        },
        Branch: {
          operator: "==",
          selectedValues: [],
        },
      },
      CreditNotes: {
        "CN Status": {
          operator: "==",
          selectedValues: [],
        },
        "CN ref": {
          operator: "==",
          selectedValues: [],
        },
        Invoice: {
          operator: "==",
          selectedValues: [],
        },
        Member: {
          operator: "==",
          selectedValues: [],
        },
        Amount: {
          operator: "==",
          selectedValues: [],
        },
        Reason: {
          operator: "contains",
          selectedValues: [],
        },
        "Created By": {
          operator: "contains",
          selectedValues: [],
        },
        Effective: {
          operator: "between",
          selectedValues: [],
        },
        "Created At": {
          operator: "between",
          selectedValues: [],
        },
      },
      JournalAdjustments: {
        "JA Status": {
          operator: "==",
          selectedValues: [],
        },
        "Adjustment reference": {
          operator: "==",
          selectedValues: [],
        },
        Debit: {
          operator: "==",
          selectedValues: [],
        },
        Credit: {
          operator: "==",
          selectedValues: [],
        },
        Member: {
          operator: "==",
          selectedValues: [],
        },
        Reason: {
          operator: "contains",
          selectedValues: [],
        },
        Effective: {
          operator: "between",
          selectedValues: [],
        },
        "Created At": {
          operator: "between",
          selectedValues: [],
        },
      },
      Refunds: {
        "Refund ID": {
          operator: "==",
          selectedValues: [],
        },
        "Ref No": {
          operator: "==",
          selectedValues: [],
        },
        Memo: {
          operator: "contains",
          selectedValues: [],
        },
        "Refund Date": {
          operator: "between",
          selectedValues: [],
        },
        "Refund Amount": {
          operator: "==",
          selectedValues: [],
        },
        "Refund Type": {
          operator: "==",
          selectedValues: [],
        },
        "Refund Source": {
          operator: "==",
          selectedValues: [],
        },
        "Member No / Application No": {
          operator: "==",
          selectedValues: [],
        },
        "Created By": {
          operator: "contains",
          selectedValues: [],
        },
        "Created At": {
          operator: "between",
          selectedValues: [],
        },
      },
      WriteOffs: {
        "WO Status": {
          operator: "==",
          selectedValues: [],
        },
        WriteOff: {
          operator: "==",
          selectedValues: [],
        },
        "WriteOff Date": {
          operator: "between",
          selectedValues: [],
        },
        Ref: {
          operator: "==",
          selectedValues: [],
        },
        Amount: {
          operator: "==",
          selectedValues: [],
        },
        Member: {
          operator: "==",
          selectedValues: [],
        },
        Type: {
          operator: "==",
          selectedValues: [],
        },
        "Created By": {
          operator: "contains",
          selectedValues: [],
        },
        "Created At": {
          operator: "between",
          selectedValues: [],
        },
        "Updated By": {
          operator: "contains",
          selectedValues: [],
        },
        "Updated At": {
          operator: "between",
          selectedValues: [],
        },
      },
      GeneralLedger: {
        "GL Status": {
          operator: "==",
          selectedValues: [],
        },
        Member: {
          operator: "==",
          selectedValues: [],
        },
        "Tx date": {
          operator: "between",
          selectedValues: [],
        },
        "Tx type": {
          operator: "==",
          selectedValues: [],
        },
        "Doc ref": {
          operator: "==",
          selectedValues: [],
        },
        "GL Debit": {
          operator: "==",
          selectedValues: [],
        },
        "GL Credit": {
          operator: "==",
          selectedValues: [],
        },
        Memo: {
          operator: "contains",
          selectedValues: [],
        },
        Posted: {
          operator: "between",
          selectedValues: [],
        },
      },
      Reconciliation: {
        "Rec Status": {
          operator: "==",
          selectedValues: [],
        },
        "Clearing Account": {
          operator: "==",
          selectedValues: [],
        },
        "Bank ref": {
          operator: "contains",
          selectedValues: [],
        },
        Member: {
          operator: "==",
          selectedValues: [],
        },
        Amount: {
          operator: "==",
          selectedValues: [],
        },
        Expected: {
          operator: "==",
          selectedValues: [],
        },
        Difference: {
          operator: "==",
          selectedValues: [],
        },
        Confidence: {
          operator: "==",
          selectedValues: [],
        },
        "Suggested action": {
          operator: "==",
          selectedValues: [],
        },
        "Matched GL": {
          operator: "==",
          selectedValues: [],
        },
        Source: {
          operator: "==",
          selectedValues: [],
        },
      },
    }),
    [],
  );

  // 🔹 When screen changes, save current state and load new screen's state
  useEffect(() => {
    if (activeScreen === activePage && Object.keys(filtersState).length > 0)
      return;

    console.log("Switching from:", activePage, "to:", activeScreen);

    // Save current screen's state
    setScreenFilterStates((prev) => ({
      ...prev,
      [activePage]: {
        visibleFilters: [...visibleFilters],
        filtersState: { ...filtersState },
      },
    }));

    // Switch to new screen
    setActivePage(activeScreen);

    // Load new screen's saved state
    const savedState = screenFilterStates[activeScreen];

    if (savedState && Object.keys(savedState.filtersState).length > 0) {
      let loaded =
        activeScreen === "Applications"
          ? consolidateApplicationsStatusFilter(
              savedState.filtersState,
              savedState.visibleFilters,
            )
          : {
              filtersState: savedState.filtersState,
              visibleFilters: savedState.visibleFilters,
            };
      if (
        activeScreen === "MembershipListingReport" ||
        isAggregateMembershipReportScreen(activeScreen)
      ) {
        loaded = consolidateMembershipListingFilters(
          loaded.filtersState,
          loaded.visibleFilters,
        );
      }
      if (activeScreen === "MembershipListingReport") {
        const persistedVisible = savedState.visibleFilters || [];
        loaded.visibleFilters = buildMembershipListingReportVisibleFilters(
          loaded.filtersState,
          persistedVisible.length > 0 ? persistedVisible : null,
        );
      }
      if (isAggregateMembershipReportScreen(activeScreen)) {
        loaded = restrictStatisticsReportFilters(
          loaded.visibleFilters,
          loaded.filtersState,
        );
        loaded.visibleFilters = buildAggregateReportVisibleFilters(
          activeScreen,
          loaded.filtersState,
        );
      }
      setVisibleFilters(loaded.visibleFilters);
      setFiltersState(loaded.filtersState);
    } else {
      // If no saved state, use defaults
      setVisibleFilters(defaultVisibleFilters[activeScreen] || []);
      setFiltersState(defaultFilterValues[activeScreen] || {});
    }
  }, [activeScreen]);

  // Drop duplicate or non-membership chips (saved state / templates from other screens).
  useEffect(() => {
    if (!isAggregateMembershipReportScreen(activePage)) return;
    const restricted = restrictStatisticsReportFilters(
      visibleFilters,
      filtersState,
    );
    const visSame =
      restricted.visibleFilters.length === visibleFilters.length &&
      restricted.visibleFilters.every((l, i) => l === visibleFilters[i]);
    const stateKeys = Object.keys(filtersState);
    const restrictedKeys = Object.keys(restricted.filtersState);
    const stateSame =
      stateKeys.length === restrictedKeys.length &&
      stateKeys.every((k) => restricted.filtersState[k] === filtersState[k]);
    if (visSame && stateSame) return;
    setVisibleFilters(restricted.visibleFilters);
    setFiltersState(restricted.filtersState);
    filtersStateRef.current = restricted.filtersState;
    setScreenFilterStates((prev) => ({
      ...prev,
      [activePage]: {
        visibleFilters: restricted.visibleFilters,
        filtersState: restricted.filtersState,
      },
    }));
  }, [activePage, visibleFilters, filtersState]);

  // Aggregate membership reports: default toolbar chips only (extras only when filter has values).
  useEffect(() => {
    if (!isAggregateMembershipReportScreen(activePage)) return;
    const normalized = buildAggregateReportVisibleFilters(
      activePage,
      filtersStateRef.current,
    );
    const visSame =
      normalized.length === visibleFilters.length &&
      normalized.every((label, i) => label === visibleFilters[i]);
    if (visSame) return;
    setVisibleFilters(normalized);
    setScreenFilterStates((prev) => ({
      ...prev,
      [activePage]: {
        visibleFilters: normalized,
        filtersState: filtersStateRef.current,
      },
    }));
  }, [activePage]);

  // Strip legacy "Date Range" chip when already on the listing report (no route change).
  useEffect(() => {
    if (
      activePage !== "MembershipListingReport" &&
      !isAggregateMembershipReportScreen(activePage)
    ) {
      return;
    }
    const hasLegacyChip =
      visibleFilters.includes("Date Range") ||
      filtersState["Date Range"] ||
      visibleFilters.includes("Payment Date") ||
      filtersState["Payment Date"];
    if (!hasLegacyChip) return;
    const cleaned = consolidateMembershipListingFilters(
      filtersState,
      visibleFilters,
    );
    setFiltersState(cleaned.filtersState);
    filtersStateRef.current = cleaned.filtersState;
    setVisibleFilters(cleaned.visibleFilters);
    setScreenFilterStates((prev) => ({
      ...prev,
      MembershipListingReport: {
        visibleFilters: cleaned.visibleFilters,
        filtersState: cleaned.filtersState,
      },
      StatisticsReport: {
        visibleFilters: cleaned.visibleFilters,
        filtersState: cleaned.filtersState,
      },
      WorkplaceBreakdownReport: {
        visibleFilters: cleaned.visibleFilters,
        filtersState: cleaned.filtersState,
      },
    }));
  }, [activePage, filtersState, visibleFilters]);

  // 🔹 Removing old API-based effect

  // 🔹 Helper to convert lookup options to filter format (Sanitized & Unique)
  const getLookupOptions = (lookupArray) => {
    if (!lookupArray || !Array.isArray(lookupArray)) {
      return [];
    }
    const options = lookupArray
      .map(
        (item) =>
          item.label ||
          item.DisplayName ||
          item.lookupname ||
          (typeof item === "string" ? item : ""),
      )
      .filter(
        (label) => label && typeof label === "string" && label.trim() !== "",
      );

    return [...new Set(options)].sort();
  };

  // 🔹 Helper to get hierarchical region options
  const getHierarchicalRegionOptions = () => {
    const full = getLookupOptions(regionOptions || []);
    if (!allHierarchicalData?.length) {
      return full;
    }
    const selectedWL = filtersState["Work Location"]?.selectedValues || [];
    const selectedBranch = filtersState["Branch"]?.selectedValues || [];

    if (selectedWL.length === 0 && selectedBranch.length === 0) {
      return full;
    }

    if (filteredRegionOptions?.length > 0) {
      return filteredRegionOptions;
    }
    return full;
  };

  // 🔹 Helper to get hierarchical branch options
  const getHierarchicalBranchOptions = () => {
    const full = getLookupOptions(branchOptions || []);
    if (!allHierarchicalData?.length) {
      return full;
    }
    const selectedWL = filtersState["Work Location"]?.selectedValues || [];
    const selectedRegion = filtersState["Region"]?.selectedValues || [];

    if (selectedWL.length === 0 && selectedRegion.length === 0) {
      return full;
    }

    if (filteredBranchOptions?.length > 0) {
      return filteredBranchOptions;
    }
    return full;
  };

  // 🔹 Helper to get hierarchical work location options
  const getHierarchicalWLOptions = () => {
    const full = getLookupOptions(workLocationOptions || []);
    if (!allHierarchicalData?.length) {
      return full;
    }
    const selectedRegion = filtersState["Region"]?.selectedValues || [];
    const selectedBranch = filtersState["Branch"]?.selectedValues || [];

    if (selectedRegion.length === 0 && selectedBranch.length === 0) {
      return full;
    }

    if (filteredWLOptions?.length > 0) {
      return filteredWLOptions;
    }
    return full;
  };

  // 🔹 Helper to get category options (Unique & Sorted)
  const getCategoryOptions = () => {
    if (!categoryData || !Array.isArray(categoryData)) {
      return [];
    }
    const options = categoryData
      .map(
        (item) =>
          item.label || item.DisplayName || item.lookupname || item.name || "",
      )
      .filter(
        (label) => label && typeof label === "string" && label.trim() !== "",
      );

    return [...new Set(options)].sort();
  };

  // 🔹 Helper to get lookup ID from label
  const getLookupIdFromLabel = (filterName, label) => {
    if (!label) return null;

    if (filterName === "Work Location" && workLocationOptions) {
      const found = workLocationOptions.find((item) => item.label === label);
      return found ? found.value : null;
    }

    if (filterName === "Membership Category" && categoryData) {
      const found = categoryData.find((item) => {
        const itemLabel = item.label || item.name || item.lookupname;
        return itemLabel === label;
      });
      return found ? found._id || found.value || found.id : null;
    }

    if (filterName === "Category" && categoryData) {
      const found = categoryData.find((item) => {
        const itemLabel = item.label || item.name || item.lookupname;
        return itemLabel === label;
      });
      return found ? found._id || found.value || found.id : null;
    }

    const lookupMap = {
      Grade: gradeOptions,
      Region: regionOptions,
      Branch: branchOptions,
      "Payment Type": paymentTypeOptions,
      "Payment Method": paymentTypeOptions,
      Gender: genderOptions,
      "Section (Primary)": sectionOptions,
      "Section (Primary Section)": sectionOptions,
    };

    const lookupArray = lookupMap[filterName];
    if (!lookupArray) return null;

    const found = lookupArray.find((item) => item.label === label);
    return found ? found.value : null;
  };

  // 🔹 Dynamic filter options from lookups + loaded grid rows (finance client-side grids)
  const filterOptions = useMemo(() => {
    const categoryOpts =
      categoryLoading && !categoryData?.length
        ? ["Loading..."]
        : ["", ...getCategoryOptions()];

    const base = {
      // 🔹 CUSTOM FILTERS
      "Application Status": [
        "",
        "In-Progress",
        "Approved",
        "Rejected",
        "Submitted",
      ],
      "Form Type": ["", "Salary Deductions", "Standing Orders"],
      "Membership Status": [
        "",
        "Active",
        "Cancelled",
        "Resigned",
        "Lapsed",
        "Suspended",
        "Archived",
      ],

      // 🔹 CATEGORY FILTER
      Category: categoryOpts,
      "Membership Category": categoryOpts,

      // 🔹 WORK LOCATION - hierarchical loading
      "Work Location": getHierarchicalWLOptions(),

      // 🔹 REGION - hierarchical loading
      Region: getHierarchicalRegionOptions(),

      // 🔹 BRANCH - hierarchical loading
      Branch: getHierarchicalBranchOptions(),

      // 🔹 OTHER REDUX LOOKUP FILTERS
      "Payment Type": getLookupOptions(paymentTypeOptions || []),
      Grade: getLookupOptions(gradeOptions || []),
      "Section (Primary)": getLookupOptions(sectionOptions || []),
      "Section (Primary Section)": getLookupOptions(sectionOptions || []),
      Gender: getLookupOptions(genderOptions || []),

      // 🔹 More custom filters
      "Another Union Member": ["", "Yes", "No"],
      Consent: ["", "Yes", "No"],
      "Income Protection": ["", "Yes", "No"],
      "INMO Rewards": ["", "Yes", "No"],
      "Partner Consent": ["", "Yes", "No"],
      "Cancellation Flag": ["", "Yes", "No"],
      "Cancellation/Reinstated": ["", "Yes", "No"],
      "Payment Frequency": ["", "Monthly", "Quarterly", "Yearly"],
      "Membership Movement": ["", "NewJoin", "Rejoin", "Reinstate", "Renewed"],
      "Payment Method":
        lookupsloading && !paymentTypeOptions?.length
          ? ["Loading..."]
          : ["", ...getLookupOptions(paymentTypeOptions || [])],
      "Payment Status": ["", "Paid", "Pending", "Failed", "Refunded"],
      "Billing Cycle": ["", "Annual", "Monthly"],
      "Case Type": ["", "General", "Legal", "Financial", "Other"],
      Priority: ["", "Low", "Medium", "High", "Critical"],
      Stakeholder: ["", "Internal", "External", "Partner"],
      "Event Type": ["", "Internal", "Workshop", "External"],
      Status: ["", "Active", "Planning", "Review", "Canceled"],
      "CN Status": ["", "Draft", "Approved", "Cancelled", "Posted"],
      "JA Status": ["", "Draft", "Approved", "Cancelled"],
      "WO Status": ["", "Posted", "Reversed"],
      "GL Status": ["", "Draft", "Posted", "Cancelled"],
      "Rec Status": [
        "",
        "unmatched",
        "auto_matched",
        "manual_matched",
        "suspense",
        "settled",
      ],
      "Clearing Account": ["", "1210", "1220", "1230", "1240", "1250"],
      Confidence: ["", "high", "medium", "low", "none"],
      Source: ["", "bank", "gl"],
      "Adjustment reference": [],
      Debit: [],
      Credit: [],
      Reason: [],
      "Created By": [],
      "Member / Application No": [],
      "Full Name": [],
      Phone: [],
      Event: [
        "",
        "Annual Nursing Conference",
        "Advanced Clinical Skills",
        "Infection Control Essentials",
        "Leadership Forum",
      ],
      "Registration Status": [
        "",
        "Registered",
        "Cancelled",
        "Pending",
        "Waitlisted",
      ],

      // 🔹 Text input filters
      Email: [],
      "Membership No": [],
      "Mobile No": [],
      "Email (Preferred)": [],
      "Payroll No": [],
      Address: [],
      "NMBI No": [],
      Speciality: [],
      "Pension Number": [],
      "Outstanding Balance": [],
      "Membership Fee": [],
      "Last Payment Amount": [],
      "Reminder No": [],
      "Subscription Year":
        subscriptionYearsLoading && !subscriptionYearsLoaded
          ? ["Loading..."]
          : ["", ...(subscriptionYears || []).map(String)],
      "Transaction ID": [],
      "Paid Amount": [],
      "Refund Amount": [],
      "Refund ID": [],
      "Ref No": [],
      "Refund Type": [],
      "Refund Source": [],
      WriteOff: [],
      Ref: [],
      "GL Debit": [],
      "GL Credit": [],
      "Doc ref": [],
      "Tx type": [],
      Expected: [],
      Difference: [],
      "Suggested action": [],
      "Matched GL": [],
      "CN ref": [],
      Invoice: [],
      Member: [],

      // 🔹 Date filters
      "Submission Date": [],
      "Date of Birth": [],
      "Retired Date": [],
      "Joining Date": [],
      "Expiry Date": [],
      "Last Payment Date": [],
      "Reminder Date": [],
      "Renewal Date": [],
      "Payment Date": [],
      "Start Date": [],
      "End Date": [],
      "Rollover Date": [],
      "Created At": [],
      "Updated At": [],
      "Incident Date": [],
      "Event Date": [],
      Effective: [],
    };

    const pageFilterLabels = viewFilters[activePage] || [];
    const dataDerived = buildDataDerivedFilterOptions(
      activePage,
      pageFilterLabels,
    );

    Object.entries(dataDerived).forEach(([label, opts]) => {
      base[label] = mergeStaticAndDerivedOptions(base[label], opts, label);
    });

    const isClientSideGrid = CLIENT_SIDE_GRID_FILTER_SCREENS.has(activePage);
    const gridLoaded = hasRegisteredGridFilterRows(activePage);

    if (isClientSideGrid && !gridLoaded) {
      pageFilterLabels.forEach((label) => {
        if (isDateFilterLabel(label, [])) return;
        if (isNumericFilterLabel(label, [])) return;
        if (isStringFilterLabel(label, [])) return;
        const current = base[label] || [];
        const hasRealStatic = current.some(
          (v) => String(v).trim() && v !== "Loading...",
        );
        if (!hasRealStatic) {
          base[label] = ["Loading..."];
        }
      });
    }

    return base;
  }, [
    workLocationOptions,
    gradeOptions,
    categoryData,
    paymentTypeOptions,
    genderOptions,
    sectionOptions,
    filteredWLOptions,
    filteredRegionOptions,
    filteredBranchOptions,
    filtersState,
    allHierarchicalData,
    regionOptions,
    branchOptions,
    subscriptionYears,
    subscriptionYearsLoaded,
    subscriptionYearsLoading,
    activePage,
    gridFilterRowsTick,
    categoryLoading,
    lookupsloading,
  ]);

  // 🔹 Helper functions
  const toggleFilter = (filter, checked) => {
    if (
      isAggregateMembershipReportScreen(activePage) &&
      !STATISTICS_REPORT_ALLOWED_SET.has(filter)
    ) {
      return;
    }

    let newVisibleFilters = checked
      ? visibleFilters.includes(filter)
        ? visibleFilters
        : [...visibleFilters, filter]
      : visibleFilters.filter((f) => f !== filter);

    if (isAggregateMembershipReportScreen(activePage)) {
      newVisibleFilters = restrictStatisticsReportFilters(
        newVisibleFilters,
        filtersState,
      ).visibleFilters;
    }

    setVisibleFilters(newVisibleFilters);

    setScreenFilterStates((prev) => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        visibleFilters: newVisibleFilters,
      },
    }));

    userOverrodeTemplateFiltersRef.current = true;
    dispatch(markScreenChanged({ screen: activePage }));
  };

  const resetFilters = () => {
    const resetVisibleFilters = getDefaultVisibleFilters(activePage);
    const resetFilterValues = defaultFilterValues[activePage] || {};
    userOverrodeTemplateFiltersRef.current = false;

    setVisibleFilters(resetVisibleFilters);
    setFiltersState(resetFilterValues);
    filtersStateRef.current = resetFilterValues;

    setScreenFilterStates((prev) => ({
      ...prev,
      [activePage]: {
        visibleFilters: resetVisibleFilters,
        filtersState: resetFilterValues,
      },
    }));
  };

  const bumpMembershipDashboardApply = useCallback(() => {
    setMembershipDashboardApplyTick((t) => t + 1);
  }, []);

  // 🔹 Combined update function
  const updateFilter = (
    filter,
    operator,
    selectedValues,
    customFiltersState = null,
  ) => {
    const currentState = customFiltersState || filtersState;

    // 🛡️ Sanitize selectedValues (strictly non-empty strings)
    const sanitize = (values) =>
      (values || [])
        .map((v) => String(v))
        .filter((v) => v !== null && v !== undefined && v.trim() !== "");

    const sanitizedValues = sanitize(selectedValues);

    const newFilterState = {
      ...currentState,
      [filter]: {
        operator,
        selectedValues: sanitizedValues,
      },
    };

    // Only update state if we're not using a custom filters state
    if (!customFiltersState) {
      userOverrodeTemplateFiltersRef.current = true;
      setFiltersState(newFilterState);
      filtersStateRef.current = newFilterState;

      setScreenFilterStates((prev) => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          filtersState: newFilterState,
        },
      }));
    }

    return newFilterState;
  };

  const acknowledgeUserChoseNewTemplate = useCallback(() => {
    userOverrodeTemplateFiltersRef.current = false;
  }, []);

  const hasUserOverriddenTemplateFilters = useCallback(() => {
    return userOverrodeTemplateFiltersRef.current;
  }, []);

  // 🔹 Individual update functions for backward compatibility
  const updateFilterValues = (filter, values) => {
    const operator = filtersState[filter]?.operator || "==";
    updateFilter(filter, operator, values);
  };

  const updateFilterOperator = (filter, operator) => {
    const selectedValues = filtersState[filter]?.selectedValues || [];
    updateFilter(filter, operator, selectedValues);
  };

  const currentPageFilters = useMemo(
    () => viewFilters[activePage] || [],
    [activePage, viewFilters],
  );

  // Preserve toolbar order: defaults first, then filters added from More append to the right.
  const getOrderedVisibleFilters = () => {
    if (activePage === "Applications") {
      return visibleFilters.filter((label) => label !== "Status");
    }
    if (isAggregateMembershipReportScreen(activePage)) {
      return restrictStatisticsReportFilters(
        visibleFilters.filter(
          (label) => label !== "Date Range" && label !== "Payment Date",
        ),
        filtersState,
      ).visibleFilters;
    }
    if (activePage === "MembershipListingReport") {
      return dedupeFilterLabels(
        visibleFilters.filter(
          (label) => label !== "Date Range" && label !== "Payment Date",
        ),
      );
    }
    return dedupeFilterLabels(visibleFilters);
  };

  const orderedVisibleFilters = getOrderedVisibleFilters();

  const getVisibleFiltersForSave = useCallback(() => {
    return dedupeFilterLabels(
      visibleFilters.filter(
        (label) => label !== "Date Range" && label !== "Payment Date",
      ),
    );
  }, [visibleFilters]);

  const applyTemplateFilters = (templateFilters, options = {}) => {
    const { savedVisibleFilters = null } = options;
    // 🛡️ Sanitize selectedValues (strictly non-empty strings)
    const sanitize = (values) =>
      (values || [])
        .map((v) => String(v))
        .filter((v) => v !== null && v !== undefined && v.trim() !== "");

    // Use structural defaults with all selections empty — not product defaults like
    // "Submitted" for Application Status. Merging with full `defaultFilterValues` here
    // re-injected those defaults when the server returned an empty `filters: {}` and
    // the next save persisted them, undoing a cleared template.
    const baseFiltersRaw = defaultFilterValues[activePage] || {};
    const baseFilters = {};
    Object.keys(baseFiltersRaw).forEach((key) => {
      baseFilters[key] = {
        operator: baseFiltersRaw[key]?.operator || "==",
        selectedValues: [],
      };
    });

    // Sanitize incoming template filters
    const sanitizedTemplateFilters = {};
    Object.keys(templateFilters).forEach((key) => {
      sanitizedTemplateFilters[key] = {
        ...templateFilters[key],
        selectedValues: sanitize(templateFilters[key]?.selectedValues),
      };
    });

    const newFiltersState = { ...baseFilters, ...sanitizedTemplateFilters };
    let consolidated =
      activePage === "Applications"
        ? consolidateApplicationsStatusFilter(newFiltersState, visibleFilters)
        : { filtersState: newFiltersState, visibleFilters };

    if (
      activePage === "MembershipListingReport" ||
      isAggregateMembershipReportScreen(activePage)
    ) {
      consolidated = consolidateMembershipListingFilters(
        consolidated.filtersState,
        consolidated.visibleFilters,
      );
    }
    if (isAggregateMembershipReportScreen(activePage)) {
      consolidated = restrictStatisticsReportFilters(
        consolidated.visibleFilters,
        consolidated.filtersState,
      );
    }

    const templateKeys = Object.keys(sanitizedTemplateFilters);
    let newVisible;
    if (isAggregateMembershipReportScreen(activePage)) {
      newVisible = buildAggregateReportVisibleFilters(
        activePage,
        consolidated.filtersState,
      );
      const keysWithValues = templateKeys.filter(
        (key) =>
          (sanitizedTemplateFilters[key]?.selectedValues || []).length > 0,
      );
      newVisible = restrictStatisticsReportFilters(
        dedupeFilterLabels([
          ...newVisible,
          ...keysWithValues.filter((key) => !newVisible.includes(key)),
        ]),
        consolidated.filtersState,
      ).visibleFilters;
    } else if (activePage === "MembershipListingReport") {
      newVisible = consolidateMembershipListingFilters(
        consolidated.filtersState,
        buildMembershipListingReportVisibleFilters(
          consolidated.filtersState,
          savedVisibleFilters,
        ),
      ).visibleFilters;
    } else {
      const mergedVisible = [
        ...consolidated.visibleFilters,
        ...templateKeys.filter(
          (key) => !consolidated.visibleFilters.includes(key),
        ),
      ];
      newVisible =
        activePage === "Applications"
          ? mergedVisible.filter((label) => label !== "Status")
          : mergedVisible;
    }
    const resolvedVisible = dedupeFilterLabels(newVisible);

    setFiltersState(consolidated.filtersState);
    filtersStateRef.current = consolidated.filtersState;
    setVisibleFilters(resolvedVisible);
    setScreenFilterStates((prev) => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        filtersState: consolidated.filtersState,
        visibleFilters: resolvedVisible,
      },
    }));

    userOverrodeTemplateFiltersRef.current = false;
  };

  return (
    <FilterContext.Provider
      value={{
        activePage,
        setActivePage,
        currentPageFilters,
        visibleFilters: orderedVisibleFilters,
        rawVisibleFilters: visibleFilters,
        toggleFilter,
        resetFilters,
        filterOptions,
        filtersState,
        updateFilter,
        updateFilterValues,
        updateFilterOperator,
        applyTemplateFilters,
        acknowledgeUserChoseNewTemplate,
        hasUserOverriddenTemplateFilters,
        getFiltersStateForSave,
        getVisibleFiltersForSave,
        COMMON_FILTERS,
        getDefaultVisibleFilters,
        screenSpecificDefaultFilters,
        getLookupIdFromLabel,
        filteredWLOptions,
        filteredRegionOptions,
        filteredBranchOptions,
        membershipDashboardApplyTick,
        bumpMembershipDashboardApply,
        membershipDashboardHeader,
        updateMembershipDashboardHeader,
        resetMembershipDashboardHeader,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
