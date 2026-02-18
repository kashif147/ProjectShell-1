import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "../features/LookupsSlice";
import { getCategoryLookup } from "../features/CategoryLookupSlice";
import { getWorkLocationHierarchy } from "../features/LookupsWorkLocationSlice";

const FilterContext = createContext();

// 🔹 Common filters that should appear on all screens
const COMMON_FILTERS = ["Grade", "Work Location", "Region", "Branch"];

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
  } = useSelector((state) => state.lookups);

  // 🔹 Get category data from categoryLookup slice
  const { categoryData } = useSelector((state) => state.categoryLookup);

  // 🔹 Get hierarchical data from lookupsWorkLocation slice
  const {
    hierarchyData,
    workLocationLoading,
    workLocationError
  } = useSelector((state) => state.lookupsWorkLocation);

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
          console.log("✅ FilterContext: Loaded hierarchical lookups from localStorage", parsed.length);
        }
      }
    } catch (error) {
      console.error("❌ FilterContext: Error loading hierarchy from localStorage", error);
    }
  }, []);

  // 🔹 Store filter states for each screen
  const [screenFilterStates, setScreenFilterStates] = useState({
    Applications: {
      visibleFilters: [],
      filtersState: {}
    },
    Profile: {
      visibleFilters: [],
      filtersState: {}
    },
    Membership: {
      visibleFilters: [],
      filtersState: {}
    },
    Members: {
      visibleFilters: [],
      filtersState: {}
    },
    OnlinePayment: {
      visibleFilters: [],
      filtersState: {}
    },
    Communication: {
      visibleFilters: [],
      filtersState: {}
    },
    Cases: {
      visibleFilters: [],
      filtersState: {}
    },
    Events: {
      visibleFilters: [],
      filtersState: {}
    }
  });

  // 🔹 Current screen's states
  const [activePage, setActivePage] = useState("Applications");
  const [visibleFilters, setVisibleFilters] = useState([]);
  const [filtersState, setFiltersState] = useState({});

  const location = useLocation();
  const activeScreenName = location?.pathname;

  // 🔹 Fetch lookups and categories on mount (only if authenticated)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(getAllLookups());
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, [dispatch]);

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

      // 1. Direct property (e.g. item.region, item.branch, item.lookup)
      const propName = type === "Work Location" ? "lookup" : type.toLowerCase();
      const direct = item[propName];
      if (direct) {
        const name = direct.DisplayName || direct.lookupname || direct.label || (typeof direct === 'string' ? direct : null);
        if (name && typeof name === 'string') names.add(name);
        else if (typeof direct === 'string') {
          // Resolve ID if string
          const optionsMap = { 'Region': regionOptions, 'Branch': branchOptions, 'Work Location': workLocationOptions };
          const found = optionsMap[type]?.find(opt => opt.value === direct || opt.id === direct || opt._id === direct);
          if (found?.label) names.add(found.label);
        }
      }

      // 2. Hierarchy array
      item.hierarchy?.forEach(h => {
        const hType = h.lookuptypeId?.lookuptype?.toLowerCase();
        // Handle "workLocation" camelCase from JSON vs "Work Location"
        const isMatch = (type === "Work Location" && (hType === "worklocation" || hType === "workloc")) ||
          (hType === type.toLowerCase());

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
        data = data.filter(item => {
          const itemWLs = getNamesForItem(item, "Work Location");
          return itemWLs.some(wl => selectedWL.includes(wl));
        });
      }

      if (excludeType !== "Region" && selectedRegion.length > 0) {
        data = data.filter(item => {
          const itemRegions = getNamesForItem(item, "Region");
          return itemRegions.some(reg => selectedRegion.includes(reg));
        });
      }

      if (excludeType !== "Branch" && selectedBranch.length > 0) {
        data = data.filter(item => {
          const itemBranches = getNamesForItem(item, "Branch");
          return itemBranches.some(br => selectedBranch.includes(br));
        });
      }

      return data;
    };

    // Calculate available options
    const newWL = new Set();
    const newRegions = new Set();
    const newBranches = new Set();

    getFilteredSubset("Work Location").forEach(item => {
      getNamesForItem(item, "Work Location").forEach(n => newWL.add(n));
    });

    getFilteredSubset("Region").forEach(item => {
      getNamesForItem(item, "Region").forEach(n => newRegions.add(n));
    });

    getFilteredSubset("Branch").forEach(item => {
      getNamesForItem(item, "Branch").forEach(n => newBranches.add(n));
    });

    const finalWLs = Array.from(newWL).sort();
    const finalRegions = Array.from(newRegions).sort();
    const finalBranches = Array.from(newBranches).sort();

    setFilteredWLOptions(finalWLs);
    setFilteredRegionOptions(finalRegions);
    setFilteredBranchOptions(finalBranches);

    // 🛡️ AUTO-CLEAR: If current selection is no longer in valid options, clear it
    let needsStateSync = false;
    const syncedFiltersState = { ...filtersState };

    // Helper to extract labels from lookup options
    const getLookupOptions = (options) => options.map(opt => opt.label);

    const checkAndPrune = (type, validOptions, baseOptions) => {
      const current = filtersState[type]?.selectedValues || [];
      if (current.length === 0) return;

      // Determine the true "valid" set based on current filter context
      // If no OTHER filters are active, use base Redux lookups as the validity source
      const otherWL = type !== "Work Location" && selectedWL.length > 0;
      const otherReg = type !== "Region" && selectedRegion.length > 0;
      const otherBr = type !== "Branch" && selectedBranch.length > 0;

      const isRestricted = (type === "Work Location" && (otherReg || otherBr)) ||
        (type === "Region" && (otherWL || otherBr)) ||
        (type === "Branch" && (otherWL || otherReg));

      const sourceOfTruth = isRestricted ? validOptions : baseOptions;

      // If sourceOfTruth is empty (e.g. data still loading), don't prune yet
      if (!sourceOfTruth || sourceOfTruth.length === 0) return;

      const stillValid = current.filter(val => sourceOfTruth.includes(val));
      if (stillValid.length !== current.length) {
        syncedFiltersState[type] = { ...filtersState[type], selectedValues: stillValid };
        needsStateSync = true;
      }
    };

    // We only auto-prune if some selections actually exist
    if (selectedWL.length > 0 || selectedRegion.length > 0 || selectedBranch.length > 0) {
      checkAndPrune("Work Location", finalWLs, getLookupOptions(workLocationOptions || []));
      checkAndPrune("Region", finalRegions, getLookupOptions(regionOptions || []));
      checkAndPrune("Branch", finalBranches, getLookupOptions(branchOptions || []));
    }

    if (needsStateSync) {
      console.log("🛡️ FilterContext: Auto-cleared invalid selections for integrity (synced with dropdown context)");
      setFiltersState(syncedFiltersState);
    }

  }, [filtersState, allHierarchicalData, regionOptions, branchOptions, workLocationOptions]);

  // 🛡️ EFFECT: Periodically prune junk from filtersState (null, undefined, non-strings, etc.)
  useEffect(() => {
    let changed = false;
    const newState = { ...filtersState };

    Object.keys(newState).forEach(key => {
      const filter = newState[key];
      if (filter?.selectedValues) {
        // Only allow non-empty strings
        const cleaned = filter.selectedValues.filter(v =>
          v !== null &&
          v !== undefined &&
          typeof v === 'string' &&
          v.trim() !== ""
        );

        if (cleaned.length !== filter.selectedValues.length) {
          newState[key] = { ...filter, selectedValues: cleaned };
          changed = true;
        }
      }
    });

    if (changed) {
      console.log("🛡️ FilterContext: Pruned invalid values from state (enforced string-only)");
      setFiltersState(newState);
    }
  }, [filtersState]);

  // 🔹 Helper to get screen from path
  const getScreenFromPath = () => {
    const pathMap = {
      '/applications': 'Applications',
      '/Summary': 'Profile',
      '/membership': 'Membership',
      "/members": "Members",
      "/onlinePayment": "OnlinePayment",
      "/CommunicationBatchDetail": "Communication",
      "/CasesSummary": "Cases",
      "/EventsSummary": "Events"
    };
    return pathMap[activeScreenName] || 'Applications';
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
        "Subscription Status",
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
        "Membership No",
        "Email",
        "Mobile No",
        "Joining Date",
        "Membership Category",
        "Membership Status",
        "Renewal Date",
        "Transaction ID",
        "Paid Amount",
        "Payment Date",
        "Payment Method",
        "Payment Status",
        "Billing Cycle",
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
      Events: [
        "Search",
        "Event Type",
        "Status",
        "Created At",
      ],
    }),
    []
  );

  // 🔹 Screen-specific default filters
  const screenSpecificDefaultFilters = {
    Applications: ["Application Status", "Membership Category"],
    Profile: ["Email", "Membership Category"],
    Membership: ["Membership Status", "Membership Category"],
    Members: ["Subscription Status", "Membership Category"],
    OnlinePayment: ["Membership Status", "Payment Status"],
    Communication: ["Grade", "Work Location"],
    Cases: ["Incident Date", "Case Type", "Stakeholder", "Priority"],
    Events: ["Event Type", "Status"],
  };

  // 🔹 Helper to get default visible filters for a screen
  const getDefaultVisibleFilters = (screen) => {
    const screenSpecific = screenSpecificDefaultFilters[screen] || [];
    const availableCommonFilters = COMMON_FILTERS.filter(filter =>
      viewFilters[screen]?.includes(filter)
    );
    return [...screenSpecific, ...availableCommonFilters];
  };

  // 🔹 Default visible filters for each screen
  const defaultVisibleFilters = useMemo(() => ({
    Applications: getDefaultVisibleFilters("Applications"),
    Profile: getDefaultVisibleFilters("Profile"),
    Membership: getDefaultVisibleFilters("Membership"),
    Members: getDefaultVisibleFilters("Members"),
    OnlinePayment: getDefaultVisibleFilters("OnlinePayment"),
    Communication: getDefaultVisibleFilters("Communication"),
  }), [],);

  // 🔹 Default filter VALUES for each screen
  const defaultFilterValues = useMemo(() => ({
    Applications: {
      "Application Status": {
        operator: "==",
        selectedValues: ["Submitted"]
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    Profile: {
      "Email": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    Membership: {
      "Membership Status": {
        operator: "==",
        selectedValues: ["Active"]
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    Members: {
      "Subscription Status": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      }
    },
    OnlinePayment: {
      "Membership Status": {
        operator: "==",
        selectedValues: []
      },
      "Payment Status": {
        operator: "==",
        selectedValues: []
      },
      "Payment Method": {
        operator: "==",
        selectedValues: []
      },
      "Billing Cycle": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      }
    },
    Communication: {
      "Grade": {
        operator: "==",
        selectedValues: []
      },
      "Work Location": {
        operator: "==",
        selectedValues: []
      },
      "Region": {
        operator: "==",
        selectedValues: []
      },
      "Branch": {
        operator: "==",
        selectedValues: []
      },
      "Membership Category": {
        operator: "==",
        selectedValues: []
      }
    },
    Cases: {
      "Incident Date": {
        operator: "==",
        selectedValues: []
      },
      "Case Type": {
        operator: "==",
        selectedValues: []
      },
      "Stakeholder": {
        operator: "==",
        selectedValues: []
      },
      "Priority": {
        operator: "==",
        selectedValues: []
      }
    },
    Events: {
      "Event Type": {
        operator: "==",
        selectedValues: []
      },
      "Status": {
        operator: "==",
        selectedValues: []
      },
      "Created At": {
        operator: "==",
        selectedValues: []
      }
    }
  }), []);

  // 🔹 When screen changes, save current state and load new screen's state
  useEffect(() => {
    if (activeScreen === activePage && Object.keys(filtersState).length > 0) return;

    console.log("Switching from:", activePage, "to:", activeScreen);

    // Save current screen's state
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        visibleFilters: [...visibleFilters],
        filtersState: { ...filtersState }
      }
    }));

    // Switch to new screen
    setActivePage(activeScreen);

    // Load new screen's saved state
    const savedState = screenFilterStates[activeScreen];
    if (savedState && Object.keys(savedState.filtersState).length > 0) {
      setVisibleFilters(savedState.visibleFilters);
      setFiltersState(savedState.filtersState);
    } else {
      // If no saved state, use defaults
      setVisibleFilters(defaultVisibleFilters[activeScreen] || []);
      setFiltersState(defaultFilterValues[activeScreen] || {});
    }
  }, [activeScreen]);

  // 🔹 Removing old API-based effect

  // 🔹 Helper to convert lookup options to filter format (Sanitized & Unique)
  const getLookupOptions = (lookupArray) => {
    if (!lookupArray || !Array.isArray(lookupArray)) {
      return [];
    }
    const options = lookupArray
      .map(item => item.label || item.DisplayName || item.lookupname || (typeof item === 'string' ? item : ""))
      .filter(label => label && typeof label === 'string' && label.trim() !== "");

    return [...new Set(options)].sort();
  };

  // 🔹 Helper to get hierarchical region options
  const getHierarchicalRegionOptions = () => {
    const selectedWL = filtersState["Work Location"]?.selectedValues || [];
    const selectedBranch = filtersState["Branch"]?.selectedValues || [];

    // ONLY show filtered subset if OTHER dependent filters are active
    if (selectedWL.length === 0 && selectedBranch.length === 0) {
      return getLookupOptions(regionOptions || []);
    }

    if (!filteredRegionOptions || filteredRegionOptions.length === 0) {
      return ["⚠️ No regions matching current selections"];
    }

    return filteredRegionOptions;
  };

  // 🔹 Helper to get hierarchical branch options
  const getHierarchicalBranchOptions = () => {
    const selectedWL = filtersState["Work Location"]?.selectedValues || [];
    const selectedRegion = filtersState["Region"]?.selectedValues || [];

    // ONLY show filtered subset if OTHER dependent filters are active
    if (selectedWL.length === 0 && selectedRegion.length === 0) {
      return getLookupOptions(branchOptions || []);
    }

    if (!filteredBranchOptions || filteredBranchOptions.length === 0) {
      return ["⚠️ No branches matching current selections"];
    }

    return filteredBranchOptions;
  };

  // 🔹 Helper to get hierarchical work location options
  const getHierarchicalWLOptions = () => {
    const selectedRegion = filtersState["Region"]?.selectedValues || [];
    const selectedBranch = filtersState["Branch"]?.selectedValues || [];

    // ONLY show filtered subset if OTHER dependent filters are active
    if (selectedRegion.length === 0 && selectedBranch.length === 0) {
      return getLookupOptions(workLocationOptions || []);
    }

    if (!filteredWLOptions || filteredWLOptions.length === 0) {
      return ["⚠️ No locations matching current selections"];
    }

    return filteredWLOptions;
  };

  // 🔹 Helper to get category options (Unique & Sorted)
  const getCategoryOptions = () => {
    if (!categoryData || !Array.isArray(categoryData)) {
      return [];
    }
    const options = categoryData
      .map(item => item.label || item.DisplayName || item.lookupname || item.name || "")
      .filter(label => label && typeof label === 'string' && label.trim() !== "");

    return [...new Set(options)].sort();
  };

  // 🔹 Helper to get lookup ID from label
  const getLookupIdFromLabel = (filterName, label) => {
    if (!label) return null;

    if (filterName === "Work Location" && workLocationOptions) {
      const found = workLocationOptions.find(item => item.label === label);
      return found ? found.value : null;
    }

    if (filterName === "Membership Category" && categoryData) {
      const found = categoryData.find(item => {
        const itemLabel = item.label || item.name || item.lookupname;
        return itemLabel === label;
      });
      return found ? found._id || found.value || found.id : null;
    }

    const lookupMap = {
      "Grade": gradeOptions,
      "Region": regionOptions,
      "Branch": branchOptions,
      "Payment Type": paymentTypeOptions,
      "Gender": genderOptions,
      "Section (Primary)": sectionOptions,
      "Section (Primary Section)": sectionOptions,
    };

    const lookupArray = lookupMap[filterName];
    if (!lookupArray) return null;

    const found = lookupArray.find(item => item.label === label);
    return found ? found.value : null;
  };

  // 🔹 Dynamic filter options from lookups
  const filterOptions = useMemo(() => {
    return {
      // 🔹 CUSTOM FILTERS
      "Application Status": ["", "In-Progress", "Approved", "Rejected", "Submitted"],
      "Membership Status": ["", "Active", "Inactive", "Pending", "Cancelled"],
      "Subscription Status": ["", "Active", "Cancelled", "Expired", "Pending"],

      // 🔹 CATEGORY FILTER
      "Membership Category": getCategoryOptions(),

      // 🔹 WORK LOCATION - hierarchical loading
      "Work Location": getHierarchicalWLOptions(),

      // 🔹 REGION - hierarchical loading
      "Region": getHierarchicalRegionOptions(),

      // 🔹 BRANCH - hierarchical loading
      "Branch": getHierarchicalBranchOptions(),

      // 🔹 OTHER REDUX LOOKUP FILTERS
      "Payment Type": getLookupOptions(paymentTypeOptions || []),
      "Grade": getLookupOptions(gradeOptions || []),
      "Section (Primary)": getLookupOptions(sectionOptions || []),
      "Section (Primary Section)": getLookupOptions(sectionOptions || []),
      "Gender": getLookupOptions(genderOptions || []),

      // 🔹 More custom filters
      "Another Union Member": ["", "Yes", "No"],
      "Consent": ["", "Yes", "No"],
      "Income Protection": ["", "Yes", "No"],
      "INMO Rewards": ["", "Yes", "No"],
      "Partner Consent": ["", "Yes", "No"],
      "Cancellation Flag": ["", "Yes", "No"],
      "Cancellation/Reinstated": ["", "Yes", "No"],
      "Payment Frequency": ["", "Monthly", "Quarterly", "Yearly"],
      "Membership Movement": ["", "New", "Renewal", "Upgrade", "Downgrade"],
      "Payment Method": ["", "Credit Card", "PayPal", "Debit Card", "Stripe"],
      "Payment Status": ["", "Paid", "Pending", "Failed", "Refunded"],
      "Billing Cycle": ["", "Annual", "Monthly"],
      "Case Type": ["", "General", "Legal", "Financial", "Other"],
      "Priority": ["", "Low", "Medium", "High", "Critical"],
      "Stakeholder": ["", "Internal", "External", "Partner"],
      "Event Type": ["", "Internal", "Workshop", "External"],
      "Status": ["", "Active", "Planning", "Review", "Canceled"],

      // 🔹 Text input filters
      "Email": [],
      "Membership No": [],
      "Mobile No": [],
      "Email (Preferred)": [],
      "Payroll No": [],
      "Address": [],
      "NMBI No": [],
      "Speciality": [],
      "Pension Number": [],
      "Outstanding Balance": [],
      "Membership Fee": [],
      "Last Payment Amount": [],
      "Reminder No": [],
      "Subscription Year": [],
      "Transaction ID": [],
      "Paid Amount": [],

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
    };
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
  ]);

  // 🔹 Helper functions
  const toggleFilter = (filter, checked) => {
    const newVisibleFilters = checked
      ? [...visibleFilters, filter]
      : visibleFilters.filter((f) => f !== filter);

    setVisibleFilters(newVisibleFilters);

    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        visibleFilters: newVisibleFilters
      }
    }));
  };

  const resetFilters = () => {
    console.log("Resetting filters for:", activePage);
    const resetVisibleFilters = getDefaultVisibleFilters(activePage);
    const resetFilterValues = defaultFilterValues[activePage] || {};

    setVisibleFilters(resetVisibleFilters);
    setFiltersState(resetFilterValues);

    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        visibleFilters: resetVisibleFilters,
        filtersState: resetFilterValues
      }
    }));
  };

  // 🔹 Combined update function
  const updateFilter = (filter, operator, selectedValues, customFiltersState = null) => {
    const currentState = customFiltersState || filtersState;

    console.log(`🎯 Updating filter "${filter}":`, {
      operator,
      selectedValues,
      currentFilters: currentState
    });

    // 🛡️ Sanitize selectedValues (strictly non-empty strings)
    const sanitize = (values) => (values || [])
      .map(v => String(v))
      .filter(v => v !== null && v !== undefined && v.trim() !== "");

    const sanitizedValues = sanitize(selectedValues);

    const newFilterState = {
      ...currentState,
      [filter]: {
        operator,
        selectedValues: sanitizedValues,
      },
    };

    // If Work Location is being cleared, also clear Region and Branch
    if (filter === "Work Location" && (!selectedValues || selectedValues.length === 0)) {
      newFilterState["Region"] = { operator: "==", selectedValues: [] };
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
    }

    // If Region is being cleared, also clear Branch
    if (filter === "Region" && (!selectedValues || selectedValues.length === 0)) {
      newFilterState["Branch"] = { operator: "==", selectedValues: [] };
    }
    // Only update state if we're not using a custom filters state
    if (!customFiltersState) {
      setFiltersState(newFilterState);

      setScreenFilterStates(prev => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          filtersState: newFilterState
        }
      }));
    }

    return newFilterState;
  };

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
    [activePage, viewFilters]
  );

  // 🔹 Function to get filters in correct order
  const getOrderedVisibleFilters = () => {
    // Simply return the visibleFilters in the order they appear in viewFilters config
    // This allows users to untick any filter, including "default" ones.
    const configOrder = viewFilters[activePage] || [];
    return configOrder.filter(filter => visibleFilters.includes(filter));
  };

  const orderedVisibleFilters = getOrderedVisibleFilters();

  const applyTemplateFilters = (templateFilters) => {
    // 🛡️ Sanitize selectedValues (strictly non-empty strings)
    const sanitize = (values) => (values || [])
      .map(v => String(v))
      .filter(v => v !== null && v !== undefined && v.trim() !== "");

    // We merge with default values for the current screen to ensure consistency
    const baseFilters = defaultFilterValues[activePage] || {};

    // Sanitize incoming template filters
    const sanitizedTemplateFilters = {};
    Object.keys(templateFilters).forEach(key => {
      sanitizedTemplateFilters[key] = {
        ...templateFilters[key],
        selectedValues: sanitize(templateFilters[key]?.selectedValues)
      };
    });

    const newFiltersState = { ...baseFilters, ...sanitizedTemplateFilters };

    setFiltersState(newFiltersState);
    setScreenFilterStates(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        filtersState: newFiltersState
      }
    }));

    // Also ensure all filters in the template are visible
    const newVisible = [...new Set([...visibleFilters, ...Object.keys(templateFilters)])];
    setVisibleFilters(newVisible);
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
        COMMON_FILTERS,
        getDefaultVisibleFilters,
        screenSpecificDefaultFilters,
        getLookupIdFromLabel,
        filteredWLOptions,
        filteredRegionOptions,
        filteredBranchOptions,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);