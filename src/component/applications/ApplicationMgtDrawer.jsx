import { useState, useRef, useEffect, useMemo } from "react";
import {
  Checkbox,
  Radio,
  Button,
  Spin,
  Modal,
  Flex,
  Tooltip,
  Select,
  Input,
  message,
} from "antd";
import {
  MailOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import MemberSearch from "../profile/MemberSearch";
import dayjs from "dayjs";
import axios from "axios";
import {
  calculateAgeFtn,
  dateUtils,
  dayjsFromDateOnly,
} from "../../utils/Utilities";
import CustomSelect from "../common/CustomSelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import MyInput from "../common/MyInput";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import {
  clearApplicationDetails,
  getApplicationById,
} from "../../features/ApplicationDetailsSlice";
import { getAllApplications } from "../../features/ApplicationSlice";
import {
  DUPLICATE_REVIEW_REQUIRED_MESSAGE,
  isDuplicateReviewBlockingApproval,
} from "../../utils/duplicateReviewApproval";
import { buildApplicationMgtSearch } from "../../utils/applicationMgtRoute";
import { cleanPayload } from "../../utils/Utilities";
import MyAlert from "../common/MyAlert";
import { generatePatch } from "../../utils/Utilities";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight, FaClone } from "react-icons/fa";
import { fetchCountries } from "../../features/CountriesSlice";
import MyFooter from "../common/MyFooter";
import MyDatePicker1 from "../common/MyDatePicker1";
import { getCategoryLookup } from "../../features/CategoryLookupSlice";
import { useFilters } from "../../context/FilterContext";
import {
  searchProfiles,
  clearResults,
} from "../../features/profiles/SearchProfile";
import { getAllLookups } from "../../features/LookupsSlice";
import {
  InsuranceScreen,
  RewardsScreen,
} from "../profile/IncomeProtectionTooltip";
import debounce from "lodash.debounce";
import { confirmRetrospectiveMembershipModal } from "../../utils/retrospectiveMembership";
import {
  CRM_PAYMENT_FREQUENCY_OPTIONS,
  getDefaultPaymentFrequencyForPaymentMethod,
} from "../../constants/paymentFrequency";
import { fetchTenantTradingName } from "../../services/tenantBrandingService";
import DuplicateProfileReview from "./DuplicateProfileReview";
import "../../styles/ApplicationForm.css";

const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
const { Search: AntdSearch } = Input;
const { Option } = Select;

function AppFormGrid({ children, cols = 3, className = "" }) {
  const colsClass =
    cols === "33-67"
      ? "form-grid--33-67"
      : cols === "40-60"
        ? "form-grid--40-60"
        : `form-grid--${cols}`;
  return (
    <div className={`form-grid ${colsClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

function AppFormCell({ children, span = 1, className = "" }) {
  const spanClass =
    span === "full" ? "form-col-full" : span === 2 ? "form-col-2" : "";
  return (
    <div
      className={`form-grid-cell form-item ${spanClass} ${className}`.trim()}
    >
      <div className="form-grid-cell-inner">{children}</div>
    </div>
  );
}

const ApplicationMgtSelect = (props) => (
  <CustomSelect
    showSearch
    sortOptions
    allowClear
    isMarginBtm={false}
    {...props}
  />
);

const SALARY_DEDUCTION_PAYMENT_TYPE = "Salary Deduction";

const normalizeLookupMatchKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isOtherLookupSelection = (value) => {
  if (value == null || value === "") return false;
  if (typeof value === "object") {
    const label = value.label || value.name || value.lookupname || "";
    return normalizeLookupMatchKey(label) === "other";
  }
  return normalizeLookupMatchKey(value) === "other";
};

const isWorkLocationLookupTypeName = (typeName) => {
  const key = normalizeLookupMatchKey(typeName).replace(/\s+/g, "");
  return key === "worklocation";
};

const getWorkLocationMatchKeys = (item) => {
  if (!item || typeof item !== "object") return [];
  return [
    ...new Set(
      [item.label, item.lookupname, item.DisplayName, item.name]
        .filter(Boolean)
        .map(normalizeLookupMatchKey),
    ),
  ];
};

const isSalaryDeductionPaymentOption = (option) =>
  normalizeLookupMatchKey(option?.label) === "salary deduction" ||
  normalizeLookupMatchKey(option?.value) === "salary deduction";

const resolveWorkLocationProcessSalaryDeduction = (
  locationLabel,
  workLocationOptions,
  rawLookups,
  locationId = null,
) => {
  if (locationLabel === "Other") return false;

  const labelKey = normalizeLookupMatchKey(locationLabel);

  if (locationId) {
    const id = String(locationId);
    const fromOptionById = workLocationOptions?.find(
      (opt) => String(opt.key || opt.value) === id,
    );
    if (fromOptionById) return !!fromOptionById.processSalaryDeduction;

    const fromRawById = (rawLookups || []).find(
      (item) => String(item._id || item.id) === id,
    );
    if (fromRawById) return !!fromRawById.processSalaryDeduction;

    try {
      const stored = localStorage.getItem("hierarchicalLookups");
      const hierarchicalLookups = stored ? JSON.parse(stored) : [];
      const fromHierarchy = hierarchicalLookups.find(
        (item) =>
          String(item.id || item._id) === id ||
          String(item.lookup?._id) === id,
      );
      if (fromHierarchy) return !!fromHierarchy.processSalaryDeduction;
    } catch {
      // ignore parse errors
    }
  }

  if (!labelKey) return false;

  const fromOptions = workLocationOptions?.find((opt) =>
    getWorkLocationMatchKeys(opt).includes(labelKey),
  );
  if (fromOptions) return !!fromOptions.processSalaryDeduction;

  const fromRaw = (rawLookups || []).find((item) => {
    const type =
      item.lookuptypeName || item.lookuptypeId?.lookuptype || item.type || "";
    if (!isWorkLocationLookupTypeName(type)) return false;
    return getWorkLocationMatchKeys(item).includes(labelKey);
  });
  if (fromRaw) return !!fromRaw.processSalaryDeduction;

  try {
    const stored = localStorage.getItem("hierarchicalLookups");
    const hierarchicalLookups = stored ? JSON.parse(stored) : [];
    const fromHierarchy = hierarchicalLookups.find((item) => {
      const type = item.type || item.lookuptypeName || "";
      const isWorkLoc =
        type === "workLocation" || isWorkLocationLookupTypeName(type);
      if (!isWorkLoc) return false;
      return getWorkLocationMatchKeys(item).includes(labelKey);
    });
    if (fromHierarchy) return !!fromHierarchy.processSalaryDeduction;
  } catch {
    // ignore parse errors
  }

  return false;
};

/** Product ids used for conditional retired / student fields (policy service products). */
const RETIRED_MEMBERSHIP_CATEGORY_ID = "68dae699c5b15073d66b892c";
const STUDENT_MEMBERSHIP_CATEGORY_ID = "68dae699c5b15073d66b892d";

function membershipCategoryCompareKey(s) {
  if (s == null || s === "") return "";
  return String(s).trim().toLowerCase().replace(/\s+/g, " ");
}

/** Normalize API/profile membership category to a string (id, name, or plain string). */
function scalarMembershipCategoryValue(mc) {
  if (mc == null || mc === "") return "";
  if (typeof mc === "object" && mc != null) {
    if (mc._id != null && String(mc._id).trim() !== "")
      return String(mc._id).trim();
    if (mc.name != null && String(mc.name).trim() !== "")
      return String(mc.name).trim();
    return "";
  }
  return String(mc).trim();
}

/**
 * Read membership category from application payloads (CRM API, drafts, nested submission).
 */
function extractMembershipCategoryFromApplication(app) {
  if (!app || typeof app !== "object") return "";
  const candidates = [
    app.subscriptionDetails?.membershipCategory,
    app.submission?.subscriptionDetails?.membershipCategory,
    app.latestSubmission?.subscriptionDetails?.membershipCategory,
    app.pendingSubmission?.subscriptionDetails?.membershipCategory,
    app.personalDetails?.subscriptionDetails?.membershipCategory,
  ];
  for (const mc of candidates) {
    const s = scalarMembershipCategoryValue(mc);
    if (s) return s;
  }
  return "";
}

/**
 * Read membership category from profile search / member record shapes.
 */
function extractMembershipCategoryFromProfile(profile) {
  if (!profile || typeof profile !== "object") return "";
  const subs = profile.subscriptions;
  const candidates = [
    profile.subscription?.membershipCategory,
    profile.subscriptionDetails?.membershipCategory,
    profile.currentSubscription?.membershipCategory,
    Array.isArray(subs) && subs.length > 0
      ? subs[0]?.membershipCategory
      : undefined,
    profile.membershipCategory,
  ];
  for (const mc of candidates) {
    const s = scalarMembershipCategoryValue(mc);
    if (s) return s;
  }
  return "";
}

/**
 * Canonical label from API value (id, object with _id, or label with any casing/spacing).
 */
function normalizeMembershipCategoryToLabel(raw, categoryData) {
  const str = scalarMembershipCategoryValue(raw);
  if (!str) return "";

  if (!Array.isArray(categoryData) || categoryData.length === 0) {
    return str;
  }

  const byId = categoryData.find(
    (o) => String(o.value) === str || String(o.key) === str,
  );
  if (byId?.label) return byId.label;

  const key = membershipCategoryCompareKey(str);
  const byLabel = categoryData.find(
    (o) => o.label && membershipCategoryCompareKey(o.label) === key,
  );
  if (byLabel?.label) return byLabel.label;

  return str;
}

/**
 * Resolve UI label (or id) to product id for API payloads.
 */
function membershipCategoryLabelToId(labelOrId, categoryData) {
  if (labelOrId == null || labelOrId === "") return "";
  const str = String(labelOrId).trim();
  if (!Array.isArray(categoryData) || categoryData.length === 0) {
    return str;
  }

  const key = membershipCategoryCompareKey(str);
  const byLabel = categoryData.find(
    (o) => o.label && membershipCategoryCompareKey(o.label) === key,
  );
  if (byLabel != null) {
    return String(byLabel.value ?? byLabel.key ?? "");
  }

  const byId = categoryData.find(
    (o) => String(o.value) === str || String(o.key) === str,
  );
  if (byId != null) {
    return String(byId.value ?? byId.key ?? str);
  }

  return str;
}

function membershipCategoryMatchesProductId(
  storedValue,
  productId,
  categoryData,
) {
  if (!storedValue || !productId) return false;
  if (String(storedValue).trim() === productId) return true;
  const id = membershipCategoryLabelToId(storedValue, categoryData);
  return id === productId;
}

function isReducedRateMembershipCategory(storedValue, categoryData) {
  const label = normalizeMembershipCategoryToLabel(storedValue, categoryData);
  const key = membershipCategoryCompareKey(label);
  if (!key) return false;
  if (key.includes("retired associate")) return false;
  if (
    key.includes("affiliate") &&
    (key.includes("non-practicing") || key.includes("non practicing"))
  ) {
    return true;
  }
  if (key.startsWith("associate")) return true;
  if (
    (key.includes("short-term") || key.includes("short term")) &&
    key.includes("relief")
  ) {
    return true;
  }
  return false;
}

function confirmReducedRateMembershipCategoryModal() {
  return new Promise((resolve) => {
    Modal.confirm({
      title: "Membership Category Confirmation",
      content:
        "You have selected a reduced-rate membership category. Please ensure you meet the eligibility criteria, as this category may provide different benefits and entitlements than a full membership.\n\nAre you sure you want to continue?",
      okText: "Yes, continue",
      cancelText: "Cancel",
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

/** Map API discipline/study location (id, { _id }, or label) to canonical lookup label for selects. */
function normalizeLookupOptionToLabel(raw, options) {
  if (raw == null || raw === "") return "";
  const fromObj =
    typeof raw === "object" && raw != null && raw._id != null
      ? String(raw._id)
      : null;
  const str = (fromObj ?? String(raw)).trim();
  if (!str) return "";

  if (!Array.isArray(options) || options.length === 0) {
    return str;
  }

  const byId = options.find(
    (o) => String(o.value) === str || String(o.key) === str,
  );
  if (byId?.label) return byId.label;

  const key = membershipCategoryCompareKey(str);
  const byLabel = options.find(
    (o) => o.label && membershipCategoryCompareKey(o.label) === key,
  );
  if (byLabel?.label) return byLabel.label;

  return str;
}

/** Stable id for matching grid rows across API / filter / draft shapes */
function getNavApplicationRowId(app) {
  if (app == null) return "";
  return String(
    app.applicationId ?? app.ApplicationId ?? app._id ?? app.id ?? "",
  );
}

function ApplicationMgtDrawer({
  open,
  onClose,
  title = "Registration Request",
}) {
  const { application, loading } = useSelector(
    (state) => state.applicationDetails,
  );

  const {
    titleOptions,
    genderOptions,
    workLocationOptions,
    gradeOptions,
    sectionOptions,
    membershipCategoryOptions,
    paymentTypeOptions,
    branchOptions,
    regionOptions,
    secondarySectionOptions,
    studyLocationOptions,
    disciplineOptions,
    youthForumOptions,
    countryOptions,
    lookups: lookupsRaw,
    lookupsloading,
  } = useSelector((state) => state.lookups);
  const navigate = useNavigate();
  const {
    hierarchyData, // This replaces hierarchyLookup
    workLocationLoading,
    workLocationError,
  } = useSelector((state) => state.lookupsWorkLocation);
  console.log(hierarchyData, "lk");
  const { filtersState } = useFilters();
  const EmailConflictScreen = () => {
    if (!emailConflictData?.hasConflict) return null;

    return (
      <div
        className="p-3 w-60"
        style={{
          width: "60%",
          backgroundColor: "#fef9c6",
          borderLeft: "5px solid #edb301",
        }}
      >
        <div className="font-monospace">
          <div className="text-danger fw-bold" style={{ color: "#772400" }}>
            Action Required: Email Conflict
          </div>
          <div style={{ color: "#9E5600" }}>{emailConflictData.message}</div>
        </div>
      </div>
    );
  };
  // };
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null, // 'approve' or 'reject'
  });
  const [duplicateReviewOpen, setDuplicateReviewOpen] = useState(false);
  const [duplicateReviewAutoRun, setDuplicateReviewAutoRun] = useState(false);

  const duplicateReviewStatus =
    application?.personalDetails?.duplicateReview?.status ||
    application?.duplicateReview?.status ||
    "NOT_CHECKED";
  const openDuplicateReviewDrawer = (autoRun = false) => {
    setDuplicateReviewAutoRun(autoRun);
    setDuplicateReviewOpen(true);
  };
  const duplicateReviewPending =
    isDuplicateReviewBlockingApproval(duplicateReviewStatus);
  const isPotentialDuplicate =
    !!application?.personalDetails?.duplicateDetection?.isPotentialDuplicate;
  const [query, setQuery] = useState("");
  const { profileSearchData } = useSelector((state) => state.searchProfile);
  console.log("profileSearchData", profileSearchData);
  useEffect(() => {
    // Setup code runs on mount

    return () => {
      // Cleanup code runs on unmount
      dispatch(clearResults());
    };
  }, []);
  const handleSearch = (value) => {
    const trimmedQuery = value.trim();

    if (!trimmedQuery) {
      dispatch(clearResults());
      return;
    }

    setQuery(trimmedQuery);
    dispatch(searchProfiles(trimmedQuery));
  };

  // Handle clear
  const handleClear = () => {
    console.log("Clearing search and form");

    // Clear search state
    setQuery("");
    dispatch(clearResults());

    // Clear selected member
    setSelectedMember(null);
    setAddressSearchValue("");
    setRecruiterSearchValue("");

    // Clear form only if not in edit mode
    if (!isEdit) {
      setInfData(inputValue);
      message.info("Search cleared and form reset");
    } else {
      message.info("Search cleared");
    }
  };
  const [selectedMember, setSelectedMember] = useState(null);
  const [addressSearchValue, setAddressSearchValue] = useState("");
  const [recruiterSearchValue, setRecruiterSearchValue] = useState("");
  const [tenantTradeName, setTenantTradeName] = useState("");
  const [searchParams] = useSearchParams();
  const appIdFromUrl =
    searchParams.get("applicationId") || searchParams.get("id") || "";
  const draftIdFromUrl = searchParams.get("draftId") || "";
  /** Avoid resetting in-progress edits when Redux application object refreshes. */
  const loadedApplicationKeyRef = useRef(null);
  /** Edit mode follows URL only so "new application" clears reliably (no stale location.state). */
  const isEdit = Boolean(appIdFromUrl || draftIdFromUrl);
  const { applications, applicationsLoading } = useSelector(
    (state) => state.applications,
  );
  const filteredApplications = useSelector(
    (state) => state.applicationWithFilter?.applications || [],
  );

  const applicationsForNav = useMemo(() => {
    const fromFilter = filteredApplications || [];
    const fromLegacy = applications || [];
    const urlKey = String(
      draftIdFromUrl ||
        appIdFromUrl ||
        application?.applicationId ||
        application?.ApplicationId ||
        "",
    );
    const listContains = (list, id) =>
      id && list.some((row) => getNavApplicationRowId(row) === String(id));
    if (urlKey && listContains(fromFilter, urlKey)) return fromFilter;
    if (urlKey && listContains(fromLegacy, urlKey)) return fromLegacy;
    if (fromFilter.length) return fromFilter;
    return fromLegacy;
  }, [
    filteredApplications,
    applications,
    draftIdFromUrl,
    appIdFromUrl,
    application?.applicationId,
    application?.ApplicationId,
  ]);

  const [index, setIndex] = useState();
  const [rejectionData, setRejectionData] = useState({
    reason: "",
    note: "",
  });

  // Add this function near the top of your component, after the other mapping functions
  const mapSearchResultToFormData = (searchResult) => {
    if (!searchResult) return null;

    const toDayJS = dayjsFromDateOnly;

    return {
      personalInfo: {
        title: searchResult?.personalInfo?.title || "",
        surname: searchResult?.personalInfo?.surname || "",
        forename: searchResult?.personalInfo?.forename || "",
        gender: searchResult?.personalInfo?.gender || "",
        dateOfBirth: toDayJS(searchResult?.personalInfo?.dateOfBirth),
        countryPrimaryQualification:
          searchResult?.personalInfo?.countryPrimaryQualification || "",
      },
      contactInfo: {
        preferredAddress: searchResult?.contactInfo?.preferredAddress || "",
        eircode: searchResult?.contactInfo?.eircode || "",
        consent: searchResult?.preferences?.consent || true,
        buildingOrHouse: searchResult?.contactInfo?.buildingOrHouse || "",
        streetOrRoad: searchResult?.contactInfo?.streetOrRoad || "",
        areaOrTown: searchResult?.contactInfo?.areaOrTown || "",
        countyCityOrPostCode:
          searchResult?.contactInfo?.countyCityOrPostCode || "",
        country: searchResult?.contactInfo?.country || "",
        mobileNumber: searchResult?.contactInfo?.mobileNumber || "",
        telephoneNumber: searchResult?.contactInfo?.telephoneNumber || "",
        preferredEmail: searchResult?.contactInfo?.preferredEmail || "",
        personalEmail: searchResult?.contactInfo?.personalEmail || "",
        workEmail: searchResult?.contactInfo?.workEmail || "",
      },
      professionalDetails: {
        workLocation: searchResult?.professionalDetails?.workLocation || "",
        otherWorkLocation:
          searchResult?.professionalDetails?.otherWorkLocation || "",
        grade: searchResult?.professionalDetails?.grade || "",
        otherGrade: searchResult?.professionalDetails?.otherGrade || "",
        nmbiNumber: searchResult?.professionalDetails?.nmbiNumber || "",
        nurseType: searchResult?.professionalDetails?.nurseType || null,
        nursingAdaptationProgramme:
          searchResult?.professionalDetails?.nursingAdaptationProgramme ||
          false,
        region: searchResult?.professionalDetails?.region || "",
        branch: searchResult?.professionalDetails?.branch || "",
        isRetired: searchResult?.professionalDetails?.retiredDate
          ? true
          : false,
        retiredDate: toDayJS(searchResult?.professionalDetails?.retiredDate),
        pensionNo: searchResult?.professionalDetails?.pensionNo || "",
        studyLocation: searchResult?.professionalDetails?.studyLocation || "",
        discipline: searchResult?.professionalDetails?.discipline || "",
        graduationDate: toDayJS(
          searchResult?.professionalDetails?.graduationDate,
        ),
        startDate: toDayJS(searchResult?.professionalDetails?.startDate),
      },
      subscriptionDetails: {
        paymentType: searchResult?.professionalDetails?.paymentType || "",
        paymentFrequency:
          searchResult?.subscriptionDetails?.paymentFrequency ||
          searchResult?.subscription?.paymentFrequency ||
          "Monthly",
        payrollNo: searchResult?.professionalDetails?.payrollNo || "",
        membershipStatus:
          searchResult?.additionalInformation?.membershipStatus || "",
        otherIrishTradeUnion:
          searchResult?.additionalInformation?.otherIrishTradeUnion || false,
        otherIrishTradeUnionName:
          searchResult?.additionalInformation?.otherIrishTradeUnionName || "",
        otherScheme: searchResult?.additionalInformation?.otherScheme || false,
        recuritedBy: searchResult?.recruitmentDetails?.recuritedBy || "",
        recuritedByMembershipNo:
          searchResult?.recruitmentDetails?.recuritedByMembershipNo || "",
        primarySection: searchResult?.professionalDetails?.primarySection || "",
        otherPrimarySection:
          searchResult?.professionalDetails?.otherPrimarySection || "",
        secondarySection:
          searchResult?.professionalDetails?.secondarySection || "",
        otherSecondarySection:
          searchResult?.professionalDetails?.otherSecondarySection || "",
        incomeProtectionScheme:
          searchResult?.cornMarket?.incomeProtectionScheme || false,
        inmoRewards: searchResult?.cornMarket?.inmoRewards || false,
        valueAddedServices:
          searchResult?.preferences?.valueAddedServices || false,
        termsAndConditions:
          searchResult?.preferences?.termsAndConditions || false,
        membershipCategory: extractMembershipCategoryFromProfile(searchResult),
        confirmedRecruiterProfileId:
          searchResult?.recruitmentDetails?.confirmedRecruiterProfileId || null,
        dateJoined: toDayJS(searchResult?.firstJoinedDate || new Date()),
        submissionDate: toDayJS(searchResult?.submissionDate),
        exclusiveDiscountsAndOffers:
          searchResult?.cornMarket?.exclusiveDiscountsAndOffers || false,
      },
    };
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Auto-populate form when search results come back
    if (
      selectedMember &&
      profileSearchData?.results &&
      profileSearchData.results.length > 0
    ) {
      console.log(
        "Auto-populating form with search result:",
        profileSearchData.results[0],
      );

      // Take the first result from search
      const firstResult = profileSearchData.results[0];

      // Map the API response to form data
      const formData = mapSearchResultToFormData(firstResult);

      if (formData) {
        // Update the form data
        setInfData(formData);

        // Set the selected member
        setSelectedMember(firstResult);

        // Also update originalData if needed
        if (isEdit) {
          setOriginalData(formData);
        }

        // Clear any existing errors
        setErrors({});

        // Handle location change if workLocation exists
        if (formData.professionalDetails?.workLocation) {
          handleLocationChange(formData.professionalDetails.workLocation);
        }

        // Show success message
        // message.success(`Form auto-populated with member: ${firstResult.membershipNumber}`);
      }
    }
  }, [profileSearchData, selectedMember, isEdit]);

  useEffect(() => {
    if (!applicationsForNav?.length) {
      setIndex(undefined);
      return;
    }
    const urlOrAppKey = String(
      draftIdFromUrl ||
        appIdFromUrl ||
        application?.applicationId ||
        application?.ApplicationId ||
        "",
    );
    if (!urlOrAppKey) {
      setIndex(undefined);
      return;
    }
    const found = applicationsForNav.findIndex(
      (app) => getNavApplicationRowId(app) === urlOrAppKey,
    );
    setIndex(found === -1 ? undefined : found + 1);
  }, [open, application, applicationsForNav, appIdFromUrl, draftIdFromUrl]);

  // Keep form stable while switching records; only block on the very first load.
  const showLoader = loading && !application;
  const { lookupsForSelect, isDisable, disableFtn } = useTableColumns();

  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const name = await fetchTenantTradingName();
        if (!cancelled && name) setTenantTradeName(name);
      } catch {
        /* optional tenant branding */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fromApi = String(application?.tradingName || "").trim();
    if (fromApi) setTenantTradeName(fromApi);
  }, [application?.tradingName]);

  useEffect(() => {
    if (draftIdFromUrl || appIdFromUrl) return;
    dispatch(clearApplicationDetails());
  }, [dispatch, draftIdFromUrl, appIdFromUrl]);

  useEffect(() => {
    if (!draftIdFromUrl && !appIdFromUrl) return;
    const curApiId = application?.applicationId || application?.ApplicationId;
    if (draftIdFromUrl) {
      if (
        application?.type === "draft" &&
        String(application?.ApplicationId) === String(draftIdFromUrl)
      ) {
        return;
      }
      dispatch(getApplicationById({ id: "draft", draftId: draftIdFromUrl }));
      return;
    }
    if (curApiId && String(curApiId) === String(appIdFromUrl)) return;
    dispatch(getApplicationById({ id: appIdFromUrl }));
  }, [dispatch, appIdFromUrl, draftIdFromUrl, application]);

  // Align URL with loaded application only when they already match or URL has no id yet.
  // If URL already points at another id, Redux may still hold the previous record until
  // getApplicationById fulfills — overwriting the URL here causes prev/next flicker.
  useEffect(() => {
    if (loading || !application) return;
    const urlApp =
      searchParams.get("applicationId") || searchParams.get("id") || "";
    const urlDraft = searchParams.get("draftId") || "";
    if (!urlApp && !urlDraft) return;
    if (application.type === "draft") {
      const da = application.ApplicationId;
      if (!da) return;
      if (!urlDraft) {
        navigate(
          {
            pathname: "/applicationMgt",
            search: buildApplicationMgtSearch({
              draftId: da,
              edit: true,
            }),
          },
          { replace: true },
        );
        return;
      }
      if (String(urlDraft) === String(da)) return;
      return;
    }
    const aid = application.applicationId || application.ApplicationId;
    if (!aid) return;
    if (!urlApp) {
      navigate(
        {
          pathname: "/applicationMgt",
          search: buildApplicationMgtSearch({
            applicationId: aid,
            edit: true,
          }),
        },
        { replace: true },
      );
      return;
    }
    if (String(urlApp) === String(aid)) return;
  }, [application, loading, navigate, searchParams]);

  const { countriesOptions, countriesData, loadingC, errorC } = useSelector(
    (state) => state.countries,
  );
  console.log(countriesOptions, "countriesOptions");
  const nextPrevData = { total: applicationsForNav?.length || 0 };
  const [originalData, setOriginalData] = useState(null);
  const mapApiToState = (apiData) => {
    if (!apiData) return inputValue;

    const toDayJS = dayjsFromDateOnly;

    return {
      personalInfo: {
        title: apiData?.personalDetails?.personalInfo?.title || "",
        surname: apiData?.personalDetails?.personalInfo?.surname || "",
        forename: apiData?.personalDetails?.personalInfo?.forename || "",
        gender: apiData?.personalDetails?.personalInfo?.gender || "",
        dateOfBirth: toDayJS(
          apiData?.personalDetails?.personalInfo?.dateOfBirth,
        ),
        countryPrimaryQualification:
          apiData?.personalDetails?.personalInfo?.countryPrimaryQualification ||
          "",
      },
      contactInfo: {
        preferredAddress:
          apiData?.personalDetails?.contactInfo?.preferredAddress || "",
        eircode: apiData?.personalDetails?.contactInfo?.eircode || "",
        consent: apiData?.personalDetails?.contactInfo?.consent,
        buildingOrHouse:
          apiData?.personalDetails?.contactInfo?.buildingOrHouse || "",
        streetOrRoad: apiData?.personalDetails?.contactInfo?.streetOrRoad || "",
        areaOrTown: apiData?.personalDetails?.contactInfo?.areaOrTown || "",
        countyCityOrPostCode:
          apiData?.personalDetails?.contactInfo?.countyCityOrPostCode || "",
        country: apiData?.personalDetails?.contactInfo?.country || "",
        mobileNumber: apiData?.personalDetails?.contactInfo?.mobileNumber || "",
        telephoneNumber:
          apiData?.personalDetails?.contactInfo?.telephoneNumber || "",
        preferredEmail:
          apiData?.personalDetails?.contactInfo?.preferredEmail || "",
        personalEmail:
          apiData?.personalDetails?.contactInfo?.personalEmail || "",
        workEmail: apiData?.personalDetails?.contactInfo?.workEmail || "",
      },
      professionalDetails: {
        workLocation: apiData?.professionalDetails?.workLocation,
        otherWorkLocation:
          apiData?.professionalDetails?.otherWorkLocation || "",
        grade: apiData?.professionalDetails?.grade || "",
        otherGrade: apiData?.professionalDetails?.otherGrade || "",
        nmbiNumber: apiData?.professionalDetails?.nmbiNumber || "",
        nurseType: apiData?.professionalDetails?.nurseType || null,
        nursingAdaptationProgramme:
          apiData?.professionalDetails?.nursingAdaptationProgramme || false,
        region: apiData?.professionalDetails?.region || "",
        branch: apiData?.professionalDetails?.branch || "",
        isRetired: apiData?.professionalDetails?.isRetired || false,
        retiredDate: toDayJS(apiData?.professionalDetails?.retiredDate),
        pensionNo: apiData?.professionalDetails?.pensionNo || "",
        studyLocation: (() => {
          const sl = apiData?.professionalDetails?.studyLocation;
          if (sl == null || sl === "") return "";
          if (typeof sl === "object" && sl._id != null) return String(sl._id);
          return String(sl);
        })(),
        discipline: (() => {
          const d = apiData?.professionalDetails?.discipline;
          if (d == null || d === "") return "";
          if (typeof d === "object" && d._id != null) return String(d._id);
          return String(d);
        })(),
        graduationDate: toDayJS(apiData?.professionalDetails?.graduationDate),
        startDate: toDayJS(apiData?.professionalDetails?.startDate),
        previousMembershipNo:
          apiData?.professionalDetails?.previousMembershipNo ||
          apiData?.subscriptionDetails?.previousMembershipNo ||
          "",
        joinYouthForum:
          apiData?.professionalDetails?.joinYouthForum ??
          apiData?.subscriptionDetails?.joinYouthForum ??
          null,
        youthForum:
          apiData?.professionalDetails?.youthForum ||
          apiData?.subscriptionDetails?.youthForum ||
          "",
      },
      subscriptionDetails: {
        paymentType: apiData?.subscriptionDetails?.paymentType || "",
        processSalaryDeduction:
          apiData?.subscriptionDetails?.processSalaryDeduction ??
          resolveWorkLocationProcessSalaryDeduction(
            apiData?.professionalDetails?.workLocation,
            workLocationOptions,
            lookupsRaw,
          ),
        paymentFrequency:
          apiData?.subscriptionDetails?.paymentFrequency || "Monthly",
        payrollNo: apiData?.subscriptionDetails?.payrollNo || "",
        membershipStatus: apiData?.subscriptionDetails?.membershipStatus || "",
        otherIrishTradeUnion:
          apiData?.subscriptionDetails?.otherIrishTradeUnion || false,
        otherIrishTradeUnionName:
          apiData?.subscriptionDetails?.otherIrishTradeUnionName || "",
        otherScheme: apiData?.subscriptionDetails?.otherScheme || false,
        recuritedBy: apiData?.subscriptionDetails?.recuritedBy || "",
        recuritedByMembershipNo:
          apiData?.subscriptionDetails?.recuritedByMembershipNo || "",
        primarySection: apiData?.subscriptionDetails?.primarySection || "",
        otherPrimarySection:
          apiData?.subscriptionDetails?.otherPrimarySection || "",
        secondarySection: apiData?.subscriptionDetails?.secondarySection || "",
        otherSecondarySection:
          apiData?.subscriptionDetails?.otherSecondarySection || "",
        incomeProtectionScheme:
          apiData?.subscriptionDetails?.incomeProtectionScheme || false,
        inmoRewards: apiData?.subscriptionDetails?.inmoRewards,
        valueAddedServices:
          apiData?.subscriptionDetails?.valueAddedServices || false,
        termsAndConditions:
          apiData?.subscriptionDetails?.termsAndConditions || false,
        membershipCategory: extractMembershipCategoryFromApplication(apiData),
        confirmedRecruiterProfileId:
          apiData?.subscriptionDetails?.confirmedRecruiterProfileId || null,
        dateJoined: toDayJS(
          apiData?.subscriptionDetails?.dateJoined || new Date(),
        ),
        submissionDate: toDayJS(apiData?.subscriptionDetails?.submissionDate),
        exclusiveDiscountsAndOffers:
          apiData?.subscriptionDetails?.exclusiveDiscountsAndOffers,
      },
    };
  };

  const { categoryData, error, currentCategoryId } = useSelector(
    (state) => state.categoryLookup,
  );
  console.log(categoryData, "categoryData");

  /** Align CRM payloads with portal: send membershipCategory as lookup label, not product id. */
  const withMembershipCategoryLabelsForApi = (prepared) => {
    if (!prepared?.subscriptionDetails) return prepared;
    const raw = prepared.subscriptionDetails.membershipCategory;
    const label = normalizeMembershipCategoryToLabel(raw, categoryData);
    return {
      ...prepared,
      subscriptionDetails: {
        ...prepared.subscriptionDetails,
        membershipCategory: label !== "" ? label : raw,
      },
    };
  };

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || lookupsloading) return;
    if (Array.isArray(lookupsRaw) && lookupsRaw.length > 0) return;
    dispatch(getAllLookups());
  }, [dispatch, lookupsloading, lookupsRaw]);

  useEffect(() => {
    if (isEdit) {
      disableFtn(false);
    } else {
      disableFtn(true);
    }
  }, [isEdit, disableFtn]);

  useEffect(() => {
    loadedApplicationKeyRef.current = null;
  }, [appIdFromUrl, draftIdFromUrl]);

  useEffect(() => {
    if (!application || !isEdit) return;

    const aid = String(
      application.applicationId || application.ApplicationId || "",
    );
    const urlKey = String(draftIdFromUrl || appIdFromUrl || "");
    if (!aid || !urlKey || aid !== urlKey) return;
    if (loadedApplicationKeyRef.current === aid) return;

    loadedApplicationKeyRef.current = aid;
    const mappedData = mapApiToState(application);
    setInfData(mappedData);
    setOriginalData(mappedData);
  }, [application, isEdit, appIdFromUrl, draftIdFromUrl]);

  useEffect(() => {
    if (!Array.isArray(categoryData) || categoryData.length === 0) return;

    const patchMembershipCategory = (prev) => {
      if (!prev?.subscriptionDetails) return prev;
      const raw = prev.subscriptionDetails.membershipCategory;
      const norm = normalizeMembershipCategoryToLabel(raw, categoryData);
      if (norm === raw) return prev;
      return {
        ...prev,
        subscriptionDetails: {
          ...prev.subscriptionDetails,
          membershipCategory: norm,
        },
      };
    };

    setInfData((prev) => patchMembershipCategory(prev));
    setOriginalData((prev) => (prev ? patchMembershipCategory(prev) : prev));
  }, [categoryData, isEdit, profileSearchData]);

  useEffect(() => {
    if (!Array.isArray(disciplineOptions) || disciplineOptions.length === 0)
      return;

    const patchDisciplineAndStudyLocation = (prev) => {
      if (!prev?.professionalDetails) return prev;
      let next = prev;
      const pd = prev.professionalDetails;
      const dNorm = normalizeLookupOptionToLabel(
        pd.discipline,
        disciplineOptions,
      );
      const slNorm = normalizeLookupOptionToLabel(
        pd.studyLocation,
        studyLocationOptions,
      );
      if (dNorm === pd.discipline && slNorm === pd.studyLocation) return prev;
      return {
        ...prev,
        professionalDetails: {
          ...pd,
          discipline: dNorm,
          studyLocation: slNorm,
        },
      };
    };

    setInfData((prev) => patchDisciplineAndStudyLocation(prev));
    setOriginalData((prev) =>
      prev ? patchDisciplineAndStudyLocation(prev) : prev,
    );
  }, [disciplineOptions, studyLocationOptions, application, isEdit]);

  console.log(application, "application92");

  useEffect(() => {
    if (application && isEdit) {
      handleLocationChange(InfData?.professionalDetails?.workLocation);
    }
  }, [isEdit, application]);

  useEffect(() => {
    if (
      hierarchyData &&
      (hierarchyData.region || hierarchyData.branch) &&
      !workLocationLoading
    ) {
      setInfData((prev) => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          region: hierarchyData.region || prev.professionalDetails.region,
          branch: hierarchyData.branch || prev.professionalDetails.branch,
        },
      }));
    }
  }, [hierarchyData, workLocationLoading]);

  const SectionHeader = ({
    icon,
    title,
    backgroundColor,
    iconBackground,
    subTitle,
  }) => (
    <div className="section-header" style={{ backgroundColor }}>
      <div
        className="section-header-icon"
        style={{ backgroundColor: iconBackground }}
      >
        {icon}
      </div>
      <div className="section-header-text">
        <div className="section-header-title">{title}</div>
        {subTitle ? (
          <div className="section-header-subtitle">{subTitle}</div>
        ) : null}
      </div>
    </div>
  );

  const hasPersonalDetailsChanged = (original, current) => {
    const personalInfoFields = [
      "title",
      "surname",
      "forename",
      "gender",
      "dateOfBirth",
      "countryPrimaryQualification",
    ];
    const contactInfoFields = [
      "preferredAddress",
      "eircode",
      "buildingOrHouse",
      "streetOrRoad",
      "areaOrTown",
      "countyCityOrPostCode",
      "country",
      "mobileNumber",
      "telephoneNumber",
      "preferredEmail",
      "personalEmail",
      "workEmail",
      "consent",
    ];

    const personalInfoChanged = personalInfoFields.some((field) => {
      const originalValue = original.personalInfo?.[field];
      const currentValue = current.personalInfo?.[field];

      if (field === "dateOfBirth") {
        const originalDate = originalValue
          ? dayjs(originalValue).format("YYYY-MM-DD")
          : null;
        const currentDate = currentValue
          ? dayjs(currentValue).format("YYYY-MM-DD")
          : null;
        return originalDate !== currentDate;
      }

      return originalValue !== currentValue;
    });

    const contactInfoChanged = contactInfoFields.some(
      (field) => original.contactInfo?.[field] !== current.contactInfo?.[field],
    );

    return personalInfoChanged || contactInfoChanged;
  };

  const hasProfessionalDetailsChanged = (original, current) => {
    const professionalFields = [
      "workLocation",
      "otherWorkLocation",
      "grade",
      "otherGrade",
      "nmbiNumber",
      "nurseType",
      "nursingAdaptationProgramme",
      "region",
      "branch",
      "pensionNo",
      "isRetired",
      "retiredDate",
      "studyLocation",
      "discipline",
      "graduationDate",
      "startDate",
      "previousMembershipNo",
      "joinYouthForum",
      "youthForum",
    ];

    return professionalFields.some((field) => {
      const originalValue = original.professionalDetails?.[field];
      const currentValue = current.professionalDetails?.[field];

      return originalValue !== currentValue;
    });
  };

  const inputValue = {
    personalInfo: {
      title: "",
      surname: "",
      forename: "",
      gender: "",
      dateOfBirth: null,
      countryPrimaryQualification: "Ireland",
    },
    contactInfo: {
      preferredAddress: "",
      eircode: "",
      buildingOrHouse: "",
      streetOrRoad: "",
      areaOrTown: "",
      countyCityOrPostCode: "",
      country: "Ireland",
      mobileNumber: "",
      telephoneNumber: "",
      preferredEmail: "",
      consent: true,
      personalEmail: "",
      workEmail: "",
    },
    professionalDetails: {
      workLocation: "",
      otherWorkLocation: "",
      grade: "",
      otherGrade: "",
      nmbiNumber: "",
      nurseType: null,
      nursingAdaptationProgramme: null,
      region: "",
      branch: "",
      isRetired: false,
      pensionNo: "",
      retiredDate: null,
      studyLocation: "",
      discipline: "",
      graduationDate: null,
      startDate: null,
      previousMembershipNo: "",
      joinYouthForum: null,
      youthForum: "",
    },
    subscriptionDetails: {
      membershipCategory: "",
      paymentType: "",
      processSalaryDeduction: false,
      paymentFrequency: "Monthly",
      payrollNo: "",
      membershipStatus: "",
      otherIrishTradeUnion: null,
      otherScheme: null,
      recuritedBy: "",
      recuritedByMembershipNo: "",
      confirmedRecruiterProfileId: "",
      primarySection: "",
      otherPrimarySection: "",
      secondarySection: "",
      otherSecondarySection: "",
      incomeProtectionScheme: false,
      inmoRewards: false,
      valueAddedServices: false,
      termsAndConditions: false,
      dateJoined: dayjs(),
      submissionDate: dayjs(),
      startDate: null,
      exclusiveDiscountsAndOffers: false,
      otherIrishTradeUnionName: "",
    },
  };

  const [InfData, setInfData] = useState(inputValue);

  const workLocationAllowsSalaryDeduction = useMemo(
    () =>
      resolveWorkLocationProcessSalaryDeduction(
        InfData.professionalDetails?.workLocation,
        workLocationOptions,
        lookupsRaw,
      ),
    [
      InfData.professionalDetails?.workLocation,
      workLocationOptions,
      lookupsRaw,
    ],
  );

  const filteredPaymentTypeOptions = useMemo(() => {
    if (workLocationAllowsSalaryDeduction) return paymentTypeOptions;
    return paymentTypeOptions.filter(
      (opt) => !isSalaryDeductionPaymentOption(opt),
    );
  }, [paymentTypeOptions, workLocationAllowsSalaryDeduction]);

  const isWorkLocationOther = useMemo(
    () => isOtherLookupSelection(InfData.professionalDetails?.workLocation),
    [InfData.professionalDetails?.workLocation],
  );
  const isGradeOther = useMemo(
    () => isOtherLookupSelection(InfData.professionalDetails?.grade),
    [InfData.professionalDetails?.grade],
  );
  const isPrimarySectionOther = useMemo(
    () => isOtherLookupSelection(InfData.subscriptionDetails?.primarySection),
    [InfData.subscriptionDetails?.primarySection],
  );
  const isSecondarySectionOther = useMemo(
    () =>
      isOtherLookupSelection(InfData.subscriptionDetails?.secondarySection),
    [InfData.subscriptionDetails?.secondarySection],
  );
  const isSalaryDeductionPayment =
    InfData.subscriptionDetails?.paymentType === SALARY_DEDUCTION_PAYMENT_TYPE;
  const isUndergraduateStudentCategory = useMemo(
    () =>
      membershipCategoryMatchesProductId(
        InfData?.subscriptionDetails?.membershipCategory,
        STUDENT_MEMBERSHIP_CATEGORY_ID,
        categoryData,
      ),
    [InfData?.subscriptionDetails?.membershipCategory, categoryData],
  );
  const isNmbiNumberRequired =
    !isUndergraduateStudentCategory &&
    InfData.professionalDetails?.nursingAdaptationProgramme === false;
  const showNurseTypeField =
    InfData.professionalDetails?.nursingAdaptationProgramme === true;
  const showYouthForumSelect =
    InfData.professionalDetails?.joinYouthForum === true;

  useEffect(() => {
    if (lookupsloading) return;
    if (
      InfData.subscriptionDetails?.paymentType !==
        SALARY_DEDUCTION_PAYMENT_TYPE ||
      workLocationAllowsSalaryDeduction
    ) {
      return;
    }
    setInfData((prev) => ({
      ...prev,
      subscriptionDetails: {
        ...prev.subscriptionDetails,
        paymentType: "",
        payrollNo: "",
      },
    }));
  }, [
    lookupsloading,
    workLocationAllowsSalaryDeduction,
    InfData.subscriptionDetails?.paymentType,
  ]);

  useEffect(() => {
    if (appIdFromUrl || draftIdFromUrl) return;
    setInfData(inputValue);
    setOriginalData(null);
    setSelectedMember(null);
    setErrors({});
  }, [appIdFromUrl, draftIdFromUrl]);

  useEffect(() => {
    if (lookupsloading || !InfData.professionalDetails?.workLocation) return;
    const resolved = resolveWorkLocationProcessSalaryDeduction(
      InfData.professionalDetails.workLocation,
      workLocationOptions,
      lookupsRaw,
    );
    if (resolved === !!InfData.subscriptionDetails.processSalaryDeduction) {
      return;
    }
    setInfData((prev) => ({
      ...prev,
      subscriptionDetails: {
        ...prev.subscriptionDetails,
        processSalaryDeduction: resolved,
      },
    }));
  }, [
    lookupsloading,
    InfData.professionalDetails?.workLocation,
    workLocationOptions,
    lookupsRaw,
  ]);

  const handleLocationChange = (
    selectedLookupIdOrLabel,
    processSalaryDeductionOverride,
  ) => {
    const storedLookups = localStorage.getItem("hierarchicalLookups");
    const hierarchicalLookups = storedLookups ? JSON.parse(storedLookups) : [];
    const labelKey = normalizeLookupMatchKey(selectedLookupIdOrLabel);

    let matchedOption = workLocationOptions.find(
      (opt) => String(opt.key || opt.value) === String(selectedLookupIdOrLabel),
    );
    if (!matchedOption && labelKey) {
      matchedOption = workLocationOptions.find((opt) =>
        getWorkLocationMatchKeys(opt).includes(labelKey),
      );
    }

    const selectedLookupId =
      matchedOption?.key || matchedOption?.value || selectedLookupIdOrLabel;

    let foundObject = hierarchicalLookups.find(
      (item) =>
        String(item.id || item._id) === String(selectedLookupId) ||
        String(item.lookup?._id) === String(selectedLookupId),
    );
    if (!foundObject && labelKey) {
      foundObject = hierarchicalLookups.find((item) => {
        const type = item.type || item.lookuptypeName || "";
        const isWorkLoc =
          type === "workLocation" || isWorkLocationLookupTypeName(type);
        return isWorkLoc && getWorkLocationMatchKeys(item).includes(labelKey);
      });
    }

    const workLocationLabel =
      matchedOption?.label ||
      (foundObject?.type === "workLocation"
        ? foundObject.name
        : foundObject?.lookup?.lookupname) ||
      (typeof selectedLookupIdOrLabel === "string" ? selectedLookupIdOrLabel : "");

    if (foundObject || matchedOption || workLocationLabel) {
      const isSimple = foundObject?.type === "workLocation";
      setInfData((prevData) => {
        const allowsSalaryDeduction =
          typeof processSalaryDeductionOverride === "boolean"
            ? processSalaryDeductionOverride
            : resolveWorkLocationProcessSalaryDeduction(
                workLocationLabel,
                workLocationOptions,
                lookupsRaw,
                selectedLookupId,
              );
        const next = {
          ...prevData,
          professionalDetails: {
            ...prevData.professionalDetails,
            workLocation: workLocationLabel,
            otherWorkLocation: isOtherLookupSelection(workLocationLabel)
              ? prevData.professionalDetails?.otherWorkLocation || ""
              : "",
            region: isSimple
              ? foundObject?.branch?.region?.name ||
                foundObject?.region?.name ||
                ""
              : foundObject?.region?.lookupname || "",
            branch: isSimple
              ? foundObject?.branch?.name || ""
              : foundObject?.branch?.lookupname || "",
          },
          subscriptionDetails: {
            ...prevData.subscriptionDetails,
            processSalaryDeduction: allowsSalaryDeduction,
          },
        };
        if (
          !allowsSalaryDeduction &&
          next.subscriptionDetails?.paymentType ===
            SALARY_DEDUCTION_PAYMENT_TYPE
        ) {
          next.subscriptionDetails = {
            ...next.subscriptionDetails,
            paymentType: "",
            payrollNo: "",
          };
        }
        return next;
      });
    }
  };

  const validateForm = () => {
    const isUndergraduateStudent = membershipCategoryMatchesProductId(
      InfData?.subscriptionDetails?.membershipCategory,
      STUDENT_MEMBERSHIP_CATEGORY_ID,
      categoryData,
    );
    const requiredFields = [
      "title",
      "forename",
      "surname",
      "dateOfBirth",
      "gender",
      "buildingOrHouse",
      "countyCityOrPostCode",
      "country",
      "mobileNumber",
      "preferredEmail",
      "membershipCategory",
      "workLocation",
      "grade",
      "paymentType",
      "termsAndConditions",
      "preferredAddress",
      "countryPrimaryQualification",
      "otherIrishTradeUnion",
      "otherScheme",
      "joinYouthForum",
      "membershipStatus",
      "nursingAdaptationProgramme",
    ];

    const fieldLabels = {
      title: "Title",
      forename: "Forename",
      surname: "Surname",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      buildingOrHouse: "Building or House",
      countyCityOrPostCode: "County/City or PostCode",
      country: "Country",
      mobileNumber: "Mobile Number",
      preferredEmail: "Preferred Email",
      membershipCategory: "Membership Category",
      workLocation: "Work Location",
      grade: "Grade",
      paymentType: "Payment Method",
      termsAndConditions: "Terms and Conditions",
      preferredAddress: "Preferred Address",
      countryPrimaryQualification: "Country Primary Qualification",
      otherIrishTradeUnion: "Other Irish Trade Union",
      otherScheme: "Other Scheme",
      joinYouthForum: "Youth Forum",
      youthForum: "Youth Forum selection",
      nurseType: "Nurse Type",
      membershipStatus: "Membership Status",
      nursingAdaptationProgramme: "Nursing Adaptation Programme",
      personalEmail: "Personal Email",
      workEmail: "Work Email",
      otherWorkLocation: "Other Work Location",
      otherPrimarySection: "Other Primary Section",
      otherIrishTradeUnionName: "Union Name",
      retiredDate: "Retirement Date",
      pensionNo: "Pension Number",
      studyLocation: "Study Location",
      discipline: "Discipline",
      graduationDate: "Graduation Date",
      startDate: "Start Date",
      payrollNo: "Payroll Number",
      otherSecondarySection: "Other Secondary Section",
      nmbiNumber: "NMBI Number",
      region: "Region",
      branch: "Branch",
    };

    const fieldMap = {
      title: ["personalInfo", "title"],
      forename: ["personalInfo", "forename"],
      surname: ["personalInfo", "surname"],
      dateOfBirth: ["personalInfo", "dateOfBirth"],
      gender: ["personalInfo", "gender"],
      otherIrishTradeUnion: ["subscriptionDetails", "otherIrishTradeUnion"],
      otherScheme: ["subscriptionDetails", "otherScheme"],
      joinYouthForum: ["professionalDetails", "joinYouthForum"],
      youthForum: ["professionalDetails", "youthForum"],
      countryPrimaryQualification: [
        "personalInfo",
        "countryPrimaryQualification",
      ],

      buildingOrHouse: ["contactInfo", "buildingOrHouse"],
      countyCityOrPostCode: ["contactInfo", "countyCityOrPostCode"],
      country: ["contactInfo", "country"],
      mobileNumber: ["contactInfo", "mobileNumber"],
      preferredEmail: ["contactInfo", "preferredEmail"],
      preferredAddress: ["contactInfo", "preferredAddress"],
      personalEmail: ["contactInfo", "personalEmail"],

      membershipCategory: ["subscriptionDetails", "membershipCategory"],
      workLocation: ["professionalDetails", "workLocation"],
      grade: ["professionalDetails", "grade"],
      retiredDate: ["professionalDetails", "retiredDate"],
      startDate: ["professionalDetails", "startDate"],
      pensionNo: ["professionalDetails", "pensionNo"],

      paymentType: ["subscriptionDetails", "paymentType"],
      termsAndConditions: ["subscriptionDetails", "termsAndConditions"],
      payrollNo: ["subscriptionDetails", "payrollNo"],
      otherPrimarySection: ["subscriptionDetails", "otherPrimarySection"],
      otherSecondarySection: ["subscriptionDetails", "otherSecondarySection"],
      nurseType: ["professionalDetails", "nurseType"],
      membershipStatus: ["subscriptionDetails", "membershipStatus"],
      nursingAdaptationProgramme: [
        "professionalDetails",
        "nursingAdaptationProgramme",
      ],
    };

    const newErrors = {};
    const missingFieldNames = [];
    const requiresTradeUnionQuestions = ["new", "graduate"].includes(
      InfData?.subscriptionDetails?.membershipStatus,
    );
    const memberAge = calculateAgeFtn(InfData?.personalInfo?.dateOfBirth);
    const requiresYouthForumQuestions =
      memberAge !== "" && memberAge !== null && memberAge < 35;

    requiredFields.forEach((field) => {
      if (
        (field === "otherIrishTradeUnion" || field === "otherScheme") &&
        !requiresTradeUnionQuestions
      ) {
        return;
      }
      if (field === "joinYouthForum" && !requiresYouthForumQuestions) {
        return;
      }
      if (field === "nursingAdaptationProgramme" && isUndergraduateStudent) {
        return;
      }

      const [section, key] = fieldMap[field] || [];
      const value = section ? InfData[section]?.[key] : null;

      const booleanAllowed = [
        "otherIrishTradeUnion",
        "otherScheme",
        "joinYouthForum",
        "nursingAdaptationProgramme",
      ];

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "boolean" &&
          value === false &&
          !booleanAllowed.includes(field))
      ) {
        newErrors[field] = "This field is required";
        missingFieldNames.push(fieldLabels[field] || field);
      }
    });

    const mobileTrimmed =
      typeof InfData.contactInfo?.mobileNumber === "string"
        ? InfData.contactInfo.mobileNumber.trim()
        : "";
    if (
      mobileTrimmed &&
      !mobileTrimmed.startsWith("+") &&
      /\d/.test(mobileTrimmed)
    ) {
      newErrors.mobileNumber =
        "Select a country calling code for the mobile number";
      missingFieldNames.push("Mobile country calling code");
    }

    if (InfData.contactInfo.preferredEmail === "personal") {
      if (!InfData.contactInfo.personalEmail?.trim()) {
        newErrors.personalEmail = "Personal Email is required";
        missingFieldNames.push(fieldLabels.personalEmail);
      }
    }
    if (InfData.contactInfo.preferredEmail === "work") {
      if (!InfData.contactInfo.workEmail?.trim()) {
        newErrors.workEmail = "Work Email is required";
        missingFieldNames.push(fieldLabels.workEmail);
      }
    }

    if (isOtherLookupSelection(InfData.professionalDetails?.workLocation)) {
      if (!InfData.professionalDetails.otherWorkLocation?.trim()) {
        newErrors.otherWorkLocation = "Other work location is required";
        missingFieldNames.push(fieldLabels.otherWorkLocation);
      }
    }

    if (isOtherLookupSelection(InfData.professionalDetails?.grade)) {
      if (!InfData.professionalDetails.otherGrade?.trim()) {
        newErrors.otherGrade = "Other grade is required";
        missingFieldNames.push("Other Grade");
      }
    }

    if (isOtherLookupSelection(InfData.subscriptionDetails.primarySection)) {
      if (!InfData.subscriptionDetails.otherPrimarySection?.trim()) {
        newErrors.otherPrimarySection = "Other primary section is required";
        missingFieldNames.push(fieldLabels.otherPrimarySection);
      }
    }
    if (
      requiresTradeUnionQuestions &&
      InfData.subscriptionDetails?.otherIrishTradeUnion === true
    ) {
      if (!InfData.subscriptionDetails?.otherIrishTradeUnionName?.trim()) {
        newErrors.otherIrishTradeUnionName =
          "Union name is required when 'Yes' is selected";
        missingFieldNames.push(fieldLabels.otherIrishTradeUnionName);
      }
    }

    if (
      requiresYouthForumQuestions &&
      InfData.professionalDetails?.joinYouthForum === true &&
      !InfData.professionalDetails?.youthForum?.trim()
    ) {
      newErrors.youthForum = "Please select a Youth Forum";
      missingFieldNames.push(fieldLabels.youthForum);
    }

    if (
      membershipCategoryMatchesProductId(
        InfData?.subscriptionDetails?.membershipCategory,
        RETIRED_MEMBERSHIP_CATEGORY_ID,
        categoryData,
      )
    ) {
      if (!InfData.professionalDetails?.retiredDate) {
        newErrors.retiredDate = "Retired date is required";
        missingFieldNames.push(fieldLabels.retiredDate);
      }
      if (!InfData.professionalDetails?.pensionNo?.trim()) {
        newErrors.pensionNo = "Pension number is required";
        missingFieldNames.push(fieldLabels.pensionNo);
      }
    }

    if (
      membershipCategoryMatchesProductId(
        InfData?.subscriptionDetails?.membershipCategory,
        STUDENT_MEMBERSHIP_CATEGORY_ID,
        categoryData,
      )
    ) {
      if (!InfData.professionalDetails?.studyLocation?.trim()) {
        newErrors.studyLocation = "Study location is required";
        missingFieldNames.push(fieldLabels.studyLocation);
      }
      if (!InfData.professionalDetails?.discipline?.trim()) {
        newErrors.discipline = "Discipline is required";
        missingFieldNames.push(fieldLabels.discipline);
      }
      if (!InfData.professionalDetails?.graduationDate) {
        newErrors.graduationDate = "Graduation date is required";
        missingFieldNames.push(fieldLabels.graduationDate);
      }
    }

    if (
      InfData.subscriptionDetails.paymentType === SALARY_DEDUCTION_PAYMENT_TYPE
    ) {
      if (!workLocationAllowsSalaryDeduction) {
        newErrors.paymentType = InfData.professionalDetails?.workLocation
          ? `Salary Deduction is not enabled for work location "${InfData.professionalDetails.workLocation}"`
          : "Salary Deduction requires a work location with payroll deduction enabled";
        missingFieldNames.push(fieldLabels.paymentType);
      }
      if (!InfData.subscriptionDetails.payrollNo?.trim()) {
        newErrors.payrollNo = "Payroll number is required";
        missingFieldNames.push(fieldLabels.payrollNo);
      }
    }

    if (isOtherLookupSelection(InfData.subscriptionDetails.secondarySection)) {
      if (!InfData.subscriptionDetails.otherSecondarySection?.trim()) {
        newErrors.otherSecondarySection = "Other secondary section is required";
        missingFieldNames.push(fieldLabels.otherSecondarySection);
      }
    }
    if (
      !isUndergraduateStudent &&
      InfData.professionalDetails?.nursingAdaptationProgramme === false
    ) {
      if (!InfData.professionalDetails.nmbiNumber?.trim()) {
        newErrors.nmbiNumber = "NMBI No/An Board Altranais Number is required";
        missingFieldNames.push(fieldLabels.nmbiNumber);
      }
    }
    if (
      !isUndergraduateStudent &&
      InfData.professionalDetails?.nursingAdaptationProgramme === true
    ) {
      const nt = InfData.professionalDetails.nurseType;
      if (
        nt === undefined ||
        nt === null ||
        (typeof nt === "string" && nt.trim() === "")
      ) {
        newErrors.nurseType = "This field is required";
        missingFieldNames.push(fieldLabels.nurseType);
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Unique names to avoid duplicates if multiple checks hit the same field
      const uniqueMissing = [...new Set(missingFieldNames)];
      let errorDescription = "Please fill in all required fields.";

      if (uniqueMissing.length > 0) {
        const firstTwo = uniqueMissing.slice(0, 2);
        if (uniqueMissing.length === 1) {
          errorDescription = `${uniqueMissing[0]} field is missing.`;
        } else if (uniqueMissing.length === 2) {
          errorDescription = `${uniqueMissing[0]} and ${uniqueMissing[1]} fields are missing.`;
        } else {
          errorDescription = `Multiple fields are missing, including ${firstTwo[0]} and ${firstTwo[1]}.`;
        }
      }

      MyAlert("error", "Validation Error", errorDescription);
      return false;
    }

    setErrors({});
    return true;
  };

  const generateCreatePatch = (data) => {
    const patch = [];
    if (data.personalInfo) {
      patch.push({ op: "add", path: "/personalInfo", value: {} });
      Object.keys(data.personalInfo).forEach((key) => {
        if (
          data.personalInfo[key] !== null &&
          data.personalInfo[key] !== undefined &&
          data.personalInfo[key] !== ""
        ) {
          patch.push({
            op: "add",
            path: `/personalInfo/${key}`,
            value: data.personalInfo[key],
          });
        }
      });
    }

    if (data.contactInfo) {
      patch.push({ op: "add", path: "/contactInfo", value: {} });
      Object.keys(data.contactInfo).forEach((key) => {
        if (
          data.contactInfo[key] !== null &&
          data.contactInfo[key] !== undefined &&
          data.contactInfo[key] !== ""
        ) {
          patch.push({
            op: "add",
            path: `/contactInfo/${key}`,
            value: data.contactInfo[key],
          });
        }
      });
    }

    if (data.professionalDetails) {
      patch.push({ op: "add", path: "/professionalDetails", value: {} });
      Object.keys(data.professionalDetails).forEach((key) => {
        if (
          data.professionalDetails[key] !== null &&
          data.professionalDetails[key] !== undefined
        ) {
          patch.push({
            op: "add",
            path: `/professionalDetails/${key}`,
            value: data.professionalDetails[key],
          });
        }
      });
    }

    if (data.subscriptionDetails) {
      patch.push({ op: "add", path: "/subscriptionDetails", value: {} });
      Object.keys(data.subscriptionDetails).forEach((key) => {
        if (
          data.subscriptionDetails[key] !== null &&
          data.subscriptionDetails[key] !== undefined
        ) {
          patch.push({
            op: "add",
            path: `/subscriptionDetails/${key}`,
            value: data.subscriptionDetails[key],
          });
        }
      });
    }

    return patch;
  };

  const handleSubmit = async () => {
    if (isDisable) return;
    const isValid = validateForm();
    if (!isValid) return;
    setIsProcessing(true);
    disableFtn(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiData = withMembershipCategoryLabelsForApi(
        dateUtils.prepareForAPI(InfData),
      );

      const personalPayload = cleanPayload({
        personalInfo: apiData.personalInfo,
        contactInfo: apiData.contactInfo,
      });

      const personalRes = await axios.post(
        `${baseURL}/personal-details`,
        personalPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const applicationId = personalRes?.data?.data?.applicationId;

      if (!applicationId) {
        throw new Error("ApplicationId not returned from personal details API");
      }

      const professionalPayload = cleanPayload({
        professionalDetails: apiData.professionalDetails,
      });

      await axios.post(
        `${baseURL}/professional-details/${applicationId}`,
        professionalPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const subscriptionPayload = cleanPayload({
        subscriptionDetails: apiData.subscriptionDetails,
      });

      await axios.post(
        `${baseURL}/subscription-details/${applicationId}`,
        subscriptionPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (selected.Approve) {
        try {
          const okRetro = await confirmRetrospectiveMembershipModal(apiData);
          if (!okRetro) {
            MyAlert(
              "info",
              "Approval cancelled",
              "The application was saved. Approve from the list when you are ready.",
            );
          } else {
            let approvalPayload;

            if (isEdit && originalData) {
              const apiOriginalData = withMembershipCategoryLabelsForApi(
                dateUtils.prepareForAPI(originalData),
              );
              const proposedPatch = generatePatch(apiOriginalData, apiData);
              approvalPayload = {
                submission: apiData,
                proposedPatch: proposedPatch,
                notes: "Auto-approved with changes on submission",
              };
            } else {
              const proposedPatch = generateCreatePatch(apiData);
              approvalPayload = {
                submission: apiData,
                proposedPatch: proposedPatch,
                notes: "Auto-approved on submission",
              };
            }

            await axios.post(
              `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/approve`,
              approvalPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            MyAlert(
              "success",
              "Application submitted and approved successfully!",
            );
          }
        } catch (approveError) {
          console.error("Approval failed:", approveError);
          const duplicateBlocked =
            approveError.response?.data?.code === "DUPLICATE_REVIEW_REQUIRED" ||
            approveError.response?.data?.error?.code === "DUPLICATE_REVIEW_REQUIRED";
          if (duplicateBlocked) {
            MyAlert(
              "warning",
              "Duplicate review required",
              approveError.response?.data?.message ||
                "Open Duplicate Profile Review before approving this application.",
            );
            openDuplicateReviewDrawer(true);
          } else {
            MyAlert(
              "warning",
              "Application submitted successfully but approval failed",
              "The application was created but could not be automatically approved. Please approve it manually.",
            );
          }
        }
      } else {
        MyAlert("success", "Application submitted successfully!");
      }

      if (selected?.Bulk !== true) {
        setInfData(inputValue);
        setSelected((prev) => ({
          ...prev,
          Approve: false,
          Reject: false,
        }));
        setSelectedMember(null);
        setAddressSearchValue("");
        setRecruiterSearchValue("");
        navigate("/Applications");
      } else {
        // Preserve ONLY the specified fields when Batch Entry is checked
        const preservedFields = {
          professionalDetails: {
            // Only preserve these specific fields
            grade: InfData.professionalDetails?.grade || "",
            studyLocation: InfData.professionalDetails?.studyLocation || "",
            discipline: InfData.professionalDetails?.discipline || "",
            workLocation: InfData.professionalDetails?.workLocation || "",
            region: InfData.professionalDetails?.region || "",
            branch: InfData.professionalDetails?.branch || "",
            startDate: InfData.professionalDetails?.startDate || null,
          },
          subscriptionDetails: {
            // Only preserve these specific fields
            membershipCategory:
              InfData.subscriptionDetails?.membershipCategory || "",
            paymentType: InfData.subscriptionDetails?.paymentType || "",
            paymentFrequency:
              InfData.subscriptionDetails?.paymentFrequency || "Monthly",
            primarySection: InfData.subscriptionDetails?.primarySection || "",
          },
        };

        // Create new state with preserved fields
        const newInfData = {
          ...inputValue,
          professionalDetails: {
            ...inputValue.professionalDetails,
            ...preservedFields.professionalDetails,
          },
          subscriptionDetails: {
            ...inputValue.subscriptionDetails,
            ...preservedFields.subscriptionDetails,
          },
        };

        // Reset other fields to default values
        newInfData.personalInfo = { ...inputValue.personalInfo };
        newInfData.contactInfo = { ...inputValue.contactInfo };

        // Reset other professional details fields
        newInfData.professionalDetails.nmbiNumber = "";
        newInfData.professionalDetails.otherWorkLocation = "";
        newInfData.professionalDetails.otherGrade = "";
        newInfData.professionalDetails.nurseType = null;
        newInfData.professionalDetails.nursingAdaptationProgramme = null;
        newInfData.professionalDetails.isRetired = false;
        newInfData.professionalDetails.retiredDate = null;
        newInfData.professionalDetails.pensionNo = "";
        newInfData.professionalDetails.graduationDate = null;

        setInfData(newInfData);
        setSelectedMember(null);
        setAddressSearchValue("");
        setRecruiterSearchValue("");
        setSelected((prev) => ({
          ...prev,
          Reject: false,
          Bulk: true, // Keep Bulk checked for next entry
        }));

        // Trigger handleLocationChange to refresh region/branch if workLocation exists
        if (preservedFields.professionalDetails.workLocation) {
          setTimeout(() => {
            handleLocationChange(
              preservedFields.professionalDetails.workLocation,
            );
          }, 100);
        }

        MyAlert(
          "success",
          "Application submitted successfully! Form cleared (except preserved fields) and ready for next entry.",
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      MyAlert(
        "error",
        "Failed to submit application",
        error?.response?.data?.error?.message || error.message,
      );
    } finally {
      setIsProcessing(false);
      disableFtn(false);
    }
  };

  // Also check when preferred email selection changes
  // useEffect(() => {
  //   handleEmailBlur();
  // }, [InfData?.contactInfo?.preferredEmail]);
  const checkEmailConflict = async (email) => {
    if (!email || email.trim() === "") {
      setEmailConflictData(null);
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/profile/check-email`,
        {
          params: { email: email.trim() },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (
        response.data?.status === "success" &&
        response.data.data?.status === true
      ) {
        setEmailConflictData({
          hasConflict: true,
          message: response.data.data.message || "Email already in use",
        });
        return true;
      } else {
        setEmailConflictData(null);
        return false;
      }
    } catch (error) {
      console.error("Error checking email conflict:", error);
      setEmailConflictData(null);
      return false;
    }
  };

  // Add this state
  const [emailConflictData, setEmailConflictData] = useState(null);
  console.log(emailConflictData, "emailConflictData");
  const hasSubscriptionDetailsChanged = (current, original) => {
    const currentSub = current.subscriptionDetails || {};
    const originalSub = original.subscriptionDetails || {};

    const allSubscriptionFields = [
      "paymentType",
      "payrollNo",
      "membershipStatus",
      "otherIrishTradeUnion",
      "otherIrishTradeUnionName",
      "otherScheme",
      "recuritedBy",
      "recuritedByMembershipNo",
      "primarySection",
      "otherPrimarySection",
      "secondarySection",
      "otherSecondarySection",
      "incomeProtectionScheme",
      "inmoRewards",
      "valueAddedServices",
      "termsAndConditions",
      "membershipCategory",
      "exclusiveDiscountsAndOffers",
      "dateJoined",
      "submissionDate",
    ];

    const hasAnyChange = allSubscriptionFields.some((field) => {
      const currentVal = currentSub[field];
      const originalVal = originalSub[field];

      if (field === "membershipCategory") {
        const c =
          normalizeMembershipCategoryToLabel(currentVal, categoryData) ||
          String(currentVal ?? "").trim();
        const o =
          normalizeMembershipCategoryToLabel(originalVal, categoryData) ||
          String(originalVal ?? "").trim();
        return (
          membershipCategoryCompareKey(c) !== membershipCategoryCompareKey(o)
        );
      }

      if (currentVal && originalVal) {
        return currentVal !== originalVal;
      }

      return Boolean(currentVal) !== Boolean(originalVal);
    });

    return hasAnyChange;
  };

  const handleSave = async () => {
    if (isDisable) return;
    const isValid = validateForm();
    if (!isValid) return;
    setIsProcessing(true);
    disableFtn(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const apiData = withMembershipCategoryLabelsForApi(
        dateUtils.prepareForAPI(InfData),
      );
      if (!isEdit || !originalData) {
        throw new Error("Save operation requires edit mode and original data");
      }

      const applicationId = application?.applicationId;
      if (!applicationId) {
        throw new Error("ApplicationId not found");
      }

      const apiOriginalData = withMembershipCategoryLabelsForApi(
        dateUtils.prepareForAPI(originalData),
      );
      let savedAny = false;
      const putHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (
        applicationId &&
        hasPersonalDetailsChanged(apiData, apiOriginalData)
      ) {
        const personalPayload = cleanPayload({
          personalInfo: apiData.personalInfo,
          contactInfo: apiData.contactInfo,
        });
        await axios.put(
          `${baseURL}/personal-details/${applicationId}`,
          personalPayload,
          { headers: putHeaders },
        );
        savedAny = true;
      }

      const subscriptionChanging =
        applicationId &&
        hasSubscriptionDetailsChanged(apiData, apiOriginalData);
      const professionalChanging =
        applicationId &&
        hasProfessionalDetailsChanged(apiOriginalData, apiData);

      const upsertProfessionalDetails = async () => {
        const professionalPayload = cleanPayload({
          professionalDetails: apiData.professionalDetails,
        });
        const putRes = await axios.put(
          `${baseURL}/professional-details/${applicationId}`,
          professionalPayload,
          { headers: putHeaders },
        );
        if (putRes?.data?.data == null) {
          await axios.post(
            `${baseURL}/professional-details/${applicationId}`,
            professionalPayload,
            { headers: putHeaders },
          );
        }
      };

      if (applicationId && (subscriptionChanging || professionalChanging)) {
        await upsertProfessionalDetails();
        savedAny = true;
      }

      if (subscriptionChanging) {
        const categoryForApi =
          apiData.subscriptionDetails?.membershipCategory ??
          InfData.subscriptionDetails?.membershipCategory;
        const subscriptionPayload = cleanPayload({
          subscriptionDetails: {
            ...apiData.subscriptionDetails,
            ...(categoryForApi != null && categoryForApi !== ""
              ? { membershipCategory: categoryForApi }
              : {}),
          },
        });
        let savedSubscriptionRecord = null;
        const putRes = await axios.put(
          `${baseURL}/subscription-details/${applicationId}`,
          subscriptionPayload,
          { headers: putHeaders },
        );
        if (putRes?.data?.data) {
          savedSubscriptionRecord = putRes.data.data;
        }
        if (putRes?.data?.data == null) {
          const postRes = await axios.post(
            `${baseURL}/subscription-details/${applicationId}`,
            subscriptionPayload,
            { headers: putHeaders },
          );
          if (postRes?.data?.data == null) {
            throw new Error(
              postRes?.data?.message || "Subscription details were not saved",
            );
          }
          savedSubscriptionRecord = postRes.data.data;
        }
        savedAny = true;

        const refreshed = await dispatch(
          getApplicationById({ id: applicationId }),
        ).unwrap();
        const mappedData = mapApiToState(refreshed);
        const savedCategory =
          savedSubscriptionRecord?.subscriptionDetails?.membershipCategory;
        if (savedCategory != null && String(savedCategory).trim() !== "") {
          mappedData.subscriptionDetails = {
            ...mappedData.subscriptionDetails,
            membershipCategory:
              normalizeMembershipCategoryToLabel(savedCategory, categoryData) ||
              savedCategory,
          };
        }
        loadedApplicationKeyRef.current = String(applicationId);
        setInfData(mappedData);
        setOriginalData(mappedData);
      }

      if (savedAny) {
        if (!subscriptionChanging) {
          const refreshed = await dispatch(
            getApplicationById({ id: applicationId }),
          ).unwrap();
          const mappedData = mapApiToState(refreshed);
          loadedApplicationKeyRef.current = String(applicationId);
          setInfData(mappedData);
          setOriginalData(mappedData);
        }
        MyAlert("success", "Application Updated successfully!");
      } else {
        MyAlert("info", "No changes detected to save.");
      }
    } catch (error) {
      console.error("Save error:", error);
      MyAlert(
        "error",
        "Failed to save changes",
        error?.response?.data?.error?.message || error.message,
      );
    } finally {
      setIsProcessing(false);
      disableFtn(false);
    }
  };

  const { hierarchicalData, hierarchicalDataLoading, hierarchicalDataError } =
    useSelector((state) => state.hierarchicalDataByLocation);
  console.log(hierarchicalData, "hierarchicalData");

  const handleInputChange = (section, field, value) => {
    if (section === "subscriptionDetails" && field === "membershipStatus") {
      setInfData((prev) => {
        const updated = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };

        const statusDependentFields = {
          graduate: ["exclusiveDiscountsAndOffers", "incomeProtectionScheme"],
          new: ["inmoRewards"],
        };

        Object.values(statusDependentFields).forEach((fields) => {
          fields.forEach((dependentField) => {
            updated.subscriptionDetails[dependentField] = false;
          });
        });

        if (!["new", "graduate"].includes(value)) {
          updated.subscriptionDetails.otherIrishTradeUnion = null;
          updated.subscriptionDetails.otherScheme = null;
          updated.subscriptionDetails.otherIrishTradeUnionName = "";
          updated.subscriptionDetails.inmoRewards = false;
          updated.subscriptionDetails.exclusiveDiscountsAndOffers = false;
          updated.subscriptionDetails.incomeProtectionScheme = false;
        }
        if (!["rejoin", "careerBreak"].includes(value)) {
          updated.professionalDetails = {
            ...updated.professionalDetails,
            previousMembershipNo: "",
          };
        }

        return updated;
      });
    } else if (
      section === "professionalDetails" &&
      field === "joinYouthForum"
    ) {
      setInfData((prev) => {
        const updated = {
          ...prev,
          professionalDetails: {
            ...prev.professionalDetails,
            [field]: value,
            youthForum:
              value === true ? prev.professionalDetails?.youthForum : "",
          },
        };
        return updated;
      });
    } else if (section === "subscriptionDetails" && field === "otherScheme") {
      setInfData((prev) => {
        const updated = {
          ...prev,
          subscriptionDetails: {
            ...prev.subscriptionDetails,
            [field]: value,
          },
        };
        if (value !== false) {
          updated.subscriptionDetails.inmoRewards = false;
          updated.subscriptionDetails.exclusiveDiscountsAndOffers = false;
          updated.subscriptionDetails.incomeProtectionScheme = false;
        }
        return updated;
      });
    } else if (section === "subscriptionDetails" && field === "paymentType") {
      setInfData((prev) => {
        const nextSub = {
          ...prev.subscriptionDetails,
          paymentType: value,
        };
        const defaultFrequency =
          getDefaultPaymentFrequencyForPaymentMethod(value);
        if (defaultFrequency) {
          nextSub.paymentFrequency = defaultFrequency;
        } else if (!String(nextSub.paymentFrequency || "").trim()) {
          nextSub.paymentFrequency = "Monthly";
        }
        if (value !== SALARY_DEDUCTION_PAYMENT_TYPE) {
          nextSub.payrollNo = "";
        }
        return {
          ...prev,
          subscriptionDetails: nextSub,
        };
      });
    } else if (field === "workLocation") {
      const locationId =
        typeof value === "object" && value !== null
          ? value.key || value.id || value.value
          : value;
      const locationLabel =
        typeof value === "object" && value !== null
          ? value.label || value.name || ""
          : value;
      const allowsSalaryDeduction = resolveWorkLocationProcessSalaryDeduction(
        locationLabel,
        workLocationOptions,
        lookupsRaw,
        locationId,
      );

      setInfData((prev) => {
        const resolvedLocation = locationLabel || value;
        const next = {
          ...prev,
          professionalDetails: {
            ...prev.professionalDetails,
            workLocation: resolvedLocation,
            otherWorkLocation: isOtherLookupSelection(resolvedLocation)
              ? prev.professionalDetails?.otherWorkLocation || ""
              : "",
          },
          subscriptionDetails: {
            ...prev.subscriptionDetails,
            processSalaryDeduction: allowsSalaryDeduction,
          },
        };
        if (
          !allowsSalaryDeduction &&
          next.subscriptionDetails?.paymentType ===
            SALARY_DEDUCTION_PAYMENT_TYPE
        ) {
          next.subscriptionDetails = {
            ...next.subscriptionDetails,
            paymentType: "",
            payrollNo: "",
          };
        }
        return next;
      });

      handleLocationChange(locationId, allowsSalaryDeduction);
    } else {
      setInfData((prev) => {
        let updated = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
        if (
          section === "professionalDetails" &&
          field === "nursingAdaptationProgramme"
        ) {
          updated = {
            ...updated,
            professionalDetails: {
              ...updated.professionalDetails,
              nurseType: value === true ? updated.professionalDetails.nurseType : null,
            },
          };
        }
        if (section === "professionalDetails" && field === "grade") {
          if (!isOtherLookupSelection(value)) {
            updated.professionalDetails.otherGrade = "";
          }
        }
        if (section === "subscriptionDetails" && field === "primarySection") {
          if (!isOtherLookupSelection(value)) {
            updated.subscriptionDetails.otherPrimarySection = "";
          }
        }
        if (section === "subscriptionDetails" && field === "secondarySection") {
          if (!isOtherLookupSelection(value)) {
            updated.subscriptionDetails.otherSecondarySection = "";
          }
        }
        if (section === "personalInfo" && field === "dateOfBirth") {
          const age = calculateAgeFtn(value);
          if (age === "" || age >= 35) {
            updated.professionalDetails = {
              ...updated.professionalDetails,
              joinYouthForum: null,
              youthForum: "",
            };
          }
        }
        return updated;
      });
    }

    setErrors((prevErrors) => {
      let next = prevErrors;
      if (prevErrors?.[field]) {
        const { [field]: removed, ...rest } = prevErrors;
        next = rest;
      }
      if (field === "nursingAdaptationProgramme") {
        if (value === false && next?.nurseType) {
          const { nurseType: _removedNt, ...rest } = next;
          next = rest;
        }
        if (value === true && next?.nmbiNumber) {
          const { nmbiNumber: _removedNmbi, ...rest } = next;
          next = rest;
        }
      }
      if (field === "joinYouthForum" && value !== true && next?.youthForum) {
        const { youthForum: _removedYf, ...rest } = next;
        next = rest;
      }
      if (field === "grade" && !isOtherLookupSelection(value) && next?.otherGrade) {
        const { otherGrade: _removedOg, ...rest } = next;
        next = rest;
      }
      if (
        field === "workLocation" &&
        !isOtherLookupSelection(value) &&
        next?.otherWorkLocation
      ) {
        const { otherWorkLocation: _removedOwl, ...rest } = next;
        next = rest;
      }
      if (
        field === "primarySection" &&
        !isOtherLookupSelection(value) &&
        next?.otherPrimarySection
      ) {
        const { otherPrimarySection: _removedOps, ...rest } = next;
        next = rest;
      }
      if (
        field === "secondarySection" &&
        !isOtherLookupSelection(value) &&
        next?.otherSecondarySection
      ) {
        const { otherSecondarySection: _removedOss, ...rest } = next;
        next = rest;
      }
      if (field === "dateOfBirth") {
        const age = calculateAgeFtn(value);
        if (age === "" || age >= 35) {
          const { joinYouthForum: _jyf, youthForum: _yf, ...rest } = next || {};
          next = rest;
        }
      }
      if (
        field === "membershipStatus" &&
        !["new", "graduate"].includes(value)
      ) {
        const {
          otherIrishTradeUnion: _oitu,
          otherScheme: _os,
          otherIrishTradeUnionName: _oitun,
          inmoRewards: _ir,
          exclusiveDiscountsAndOffers: _edao,
          incomeProtectionScheme: _ips,
          ...rest
        } = next || {};
        next = rest;
      }
      return next;
    });
  };

  const inputRef = useRef(null);
  const libraries = ["places", "maps"];

  const handlePlacesChanged = () => {
    const places = inputRef.current.getPlaces();

    if (places && places.length > 0) {
      const place = places[0];
      const placeId = place.place_id;

      // Update search value with the formatted address
      if (place.formatted_address) {
        setAddressSearchValue(place.formatted_address);
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement("div"),
      );

      const request = {
        placeId: placeId,
        fields: ["address_components", "name", "formatted_address"],
      };

      service.getDetails(request, (details, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          details
        ) {
          const components = details.address_components;
          console.log("components=========>", components);

          const getComponent = (type) =>
            components.find((c) => c.types.includes(type))?.long_name || "";

          const getComponentShortName = (type) =>
            components.find((c) => c.types.includes(type))?.short_name || "";

          const streetNumber = getComponent("street_number");
          const route = getComponent("route");
          const neighborhood = getComponent("neighborhood") || "";
          const sublocality = getComponent("sublocality") || "";
          const town =
            getComponent("locality") || getComponent("postal_town") || "";
          const county = getComponent("administrative_area_level_1") || "";
          const postalCode = getComponent("postal_code");
          const countryLongName = getComponent("country");
          const countryShortName = getComponentShortName("country");

          const buildingOrHouse = `${streetNumber} ${route}`.trim();
          const streetOrRoad = neighborhood || sublocality; // Use neighborhood first, fallback to sublocality
          const areaOrTown = town;
          const countyCityOrPostCode = `${county}`.trim();
          const eircode = `${postalCode}`.trim();

          // Find the country displayname from countryLookups based on the country name or code
          let countryDisplayName = InfData.contactInfo?.country;
          // Default to Ireland if not found
          if (countryLongName || countryShortName) {
            console.log(
              "Country from API - Long Name:",
              countryLongName,
              "Short Name:",
              countryShortName,
            );
            const matchedCountry = countriesOptions?.find(
              (c) =>
                c?.code === countryLongName ||
                c?.code === countryShortName ||
                c?.name === countryLongName ||
                c?.displayname === countryLongName,
            );
            if (matchedCountry) {
              countryDisplayName = matchedCountry.displayname;
              console.log("Matched country:", matchedCountry);
            } else {
              console.log("No matching country found in lookup");
            }
          }

          // onFormDataChange({
          //   ...formData,
          //   addressLine1,
          //   addressLine2,
          //   addressLine3,
          //   addressLine4,
          //   eircode,
          //   country: countryDisplayName,
          // });

          setInfData((prev) => ({
            ...prev,
            contactInfo: {
              ...prev.contactInfo,
              buildingOrHouse,
              streetOrRoad,
              areaOrTown,
              countyCityOrPostCode,
              eircode,
              // country,
            },
          }));
        }
      });
    }
  };

  const [errors, setErrors] = useState({});
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o",
    libraries: libraries,
  });

  const select = {
    Bulk: false,
    Approve: false,
    Reject: false,
  };
  const [selected, setSelected] = useState(select);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);

  useEffect(() => {
    if (application && isEdit) {
      const status = application.applicationStatus?.toLowerCase();
      setCurrentApplication(application);

      const shouldDisableForm = ["approved"].includes(status);
      disableFtn(shouldDisableForm);

      setSelected((prev) => ({
        ...prev,
        Approve: status === "approved",
        Reject: status === "rejected",
      }));
    } else {
      setSelected(select);
    }
  }, [application, isEdit]);

  const handleChange = (e) => {
    const { name, checked } = e.target;

    const status = application?.applicationStatus?.toLowerCase();
    const readOnlyStatuses = ["approved"];

    if (readOnlyStatuses.includes(status) && name === "Approve") {
      return;
    }

    if (name === "Bulk") {
      disableFtn(!checked);
      setErrors({});
      setSelected((prev) => ({
        ...prev,
        Bulk: checked,
      }));
    }

    if (name === "Approve" && checked === true && isEdit) {
      setSelected((prev) => ({
        ...prev,
        Approve: true,
        Reject: false,
      }));

      handleApplicationAction("approved");
    }

    if (name === "Reject" && checked === true) {
      setActionModal({ open: true, type: "reject" });
    }

    if (
      !isEdit &&
      (name === "Approve" || name === "Reject") &&
      checked === false
    ) {
      setSelected((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
    if (
      !isEdit &&
      (name === "Approve" || name === "Reject") &&
      checked === true
    ) {
      setSelected((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  const handleApplicationAction = async (action) => {
    if (isEdit && !originalData) return;
    const isValid = validateForm();
    if (!isValid) return;
    setIsProcessing(true);
    disableFtn(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiInfData = withMembershipCategoryLabelsForApi(
        dateUtils.prepareForAPI(InfData),
      );
      const apiOriginalData = withMembershipCategoryLabelsForApi(
        dateUtils.prepareForAPI(originalData),
      );

      const subscriptionChanged = hasSubscriptionDetailsChanged(
        apiInfData,
        apiOriginalData,
      );
      const personalChanged = hasPersonalDetailsChanged(
        apiOriginalData,
        apiInfData,
      );
      const professionalChanged = hasProfessionalDetailsChanged(
        apiOriginalData,
        apiInfData,
      );
      const applicationId = application?.applicationId;

      const proposedPatch = generatePatch(apiOriginalData, apiInfData);
      const singleStepPatch = generateCreatePatch(apiInfData);

      const hasChanges = proposedPatch && proposedPatch.length > 0;

      if (action === "approved") {
        if (duplicateReviewPending) {
          message.warning(DUPLICATE_REVIEW_REQUIRED_MESSAGE);
          openDuplicateReviewDrawer(false);
          setIsProcessing(false);
          disableFtn(false);
          setSelected((prev) => ({
            ...prev,
            Approve: false,
          }));
          return;
        }

        const submissionForRetroCheck = {
          subscriptionDetails: {
            ...(apiOriginalData?.subscriptionDetails || {}),
            ...(apiInfData?.subscriptionDetails || {}),
          },
          professionalDetails: {
            ...(apiOriginalData?.professionalDetails || {}),
            ...(apiInfData?.professionalDetails || {}),
          },
        };
        const okRetro = await confirmRetrospectiveMembershipModal(
          submissionForRetroCheck,
        );
        if (!okRetro) {
          setIsProcessing(false);
          disableFtn(false);
          setSelected((prev) => ({
            ...prev,
            Approve: false,
          }));
          return;
        }

        const approvalPayload = {
          submission: apiOriginalData || {},
        };

        if (hasChanges) {
          approvalPayload.proposedPatch = proposedPatch;
        }

        const approvalResponse = await axios.post(
          `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/approve`,
          approvalPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (isEdit && hasChanges) {
          if (personalChanged) {
            const personalPayload = cleanPayload({
              personalInfo: apiInfData.personalInfo,
              contactInfo: apiInfData.contactInfo,
            });
            await axios.put(
              `${baseURL}/personal-details/${applicationId}`,
              personalPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          }

          if (professionalChanged) {
            const professionalPayload = cleanPayload({
              professionalDetails: apiInfData.professionalDetails,
            });
            await axios.put(
              `${baseURL}/professional-details/${applicationId}`,
              professionalPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          }

          if (subscriptionChanged) {
            const subscriptionPayload = cleanPayload({
              subscriptionDetails: apiInfData.subscriptionDetails,
            });
            await axios.put(
              `${baseURL}/subscription-details/${applicationId}`,
              subscriptionPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          }
        }
      } else if (action === "rejected") {
        if (!rejectionData.reason) {
          MyAlert("error", "Please select a rejection reason");
          setIsProcessing(false);
          return;
        }

        const rejectionPayload = {
          submission: apiOriginalData || {},
          proposedPatch: hasChanges ? proposedPatch : [],
          reason: rejectionData.reason,
        };

        await axios.post(
          `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/reject`,
          rejectionPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      setSelected((prev) => ({
        ...prev,
        Approve: action === "approved",
        Reject: action === "rejected",
      }));

      const successMessage =
        action === "approved"
          ? "Application approved successfully!"
          : "Application rejected successfully!";

      MyAlert("success", successMessage);
      disableFtn(true);

      if (action === "rejected") {
        setActionModal({ open: false, type: null });
        setRejectionData({ reason: "", note: "" });
      }

      if (!isEdit) {
        navigate("/Applications");
      }
    } catch (error) {
      console.error(`❌ Error ${action} application:`, error);
      console.error("Error details:", error.response?.data || error.message);

      const duplicateBlocked =
        error.response?.data?.code === "DUPLICATE_REVIEW_REQUIRED" ||
        error.response?.data?.error?.code === "DUPLICATE_REVIEW_REQUIRED";

      if (duplicateBlocked) {
        MyAlert(
          "warning",
          "Duplicate review required",
          error.response?.data?.message ||
            "Open Duplicate Profile Review before approving this application.",
        );
        openDuplicateReviewDrawer(false);
      } else {
        MyAlert(
          "error",
          `Failed to ${action} application`,
          error?.response?.data?.error?.message || error.message,
        );
      }

      setSelected((prev) => ({
        ...prev,
        Approve: false,
        Reject: false,
      }));
    } finally {
      setIsProcessing(false);
      disableFtn(true);
    }
  };

  function navigateApplication(direction) {
    if (index == null || index < 1 || !applicationsForNav?.length) {
      return;
    }

    let newIndex = index;

    if (direction === "prev" && index > 1) {
      newIndex = index - 1;
    } else if (direction === "next" && index < applicationsForNav.length) {
      newIndex = index + 1;
    } else {
      return;
    }

    setIndex(newIndex);
    const newApplication = applicationsForNav[newIndex - 1];

    if (newApplication) {
      const newdata = mapApiToState(newApplication);
      setInfData(newdata);
      setOriginalData(newdata);
      setCurrentApplication(newApplication);
      setSelectedMember(null);

      const rawId =
        newApplication.applicationId || newApplication.ApplicationId;
      if (rawId) {
        const isDraftRow =
          String(newApplication.applicationStatus || "").toLowerCase() ===
            "draft" || newApplication.type === "draft";
        navigate(
          {
            pathname: "/applicationMgt",
            search: isDraftRow
              ? buildApplicationMgtSearch({ draftId: rawId, edit: true })
              : buildApplicationMgtSearch({
                  applicationId: rawId,
                  edit: true,
                }),
          },
          { replace: true },
        );
      }

      const status = newApplication.applicationStatus?.toLowerCase();
      const readOnlyStatuses = ["approved", "in-progress"];

      if (readOnlyStatuses.includes(status)) {
        disableFtn(true);
        setSelected((prev) => ({
          ...prev,
          Approve: status === "approved",
          Reject: status === "rejected",
        }));
      } else {
        disableFtn(false);
        setSelected((prev) => ({
          ...prev,
          Approve: false,
          Reject: false,
        }));
      }
    }
  }

  const handleMemberSelect = (memberData) => {
    console.log("Selected member:", memberData);
    setSelectedMember(memberData);

    const formData = mapSearchResultToFormData(memberData);

    if (formData) {
      setInfData(formData);
      setErrors({});
      disableFtn(false);
      if (formData.professionalDetails?.workLocation) {
        handleLocationChange(formData.professionalDetails.workLocation);
      }

      // message.success(`Form populated with member: ${memberData.membershipNumber}`);
    }
  };
  const handleEmailBlur = async () => {
    let emailToCheck = "";
    if (InfData?.contactInfo?.preferredEmail === "personal") {
      emailToCheck = InfData?.contactInfo?.personalEmail;
    } else if (InfData?.contactInfo?.preferredEmail === "work") {
      emailToCheck = InfData?.contactInfo?.workEmail;
    }

    if (emailToCheck) {
      await checkEmailConflict(emailToCheck);
    } else {
      setEmailConflictData(null);
    }
  };

  // Also check when preferred email selection changes
  // useEffect(() => {
  //   handleEmailBlur();
  // }, [InfData?.contactInfo?.preferredEmail]);
  const handleRecruteBy = (memberData) => {
    console.log("Recruited by member:", memberData?._id);

    if (memberData) {
      const recruiterName = [
        memberData.personalInfo?.forename,
        memberData.personalInfo?.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      setInfData((prevData) => ({
        ...prevData,
        subscriptionDetails: {
          ...prevData.subscriptionDetails,
          confirmedRecruiterProfileId: memberData?._id || "",
          recuritedBy: recruiterName,
          recuritedByMembershipNo: memberData.membershipNumber || "",
        },
      }));

      setRecruiterSearchValue(
        `${recruiterName} (${memberData.membershipNumber || ""})`.trim(),
      );
    }
  };

  const [searchResults, setSearchResults] = useState([]);

  const handleSearchResult = (results) => {
    console.log("Search results:", results);
    setSearchResults(results);
  };

  const handleAddMember = (searchTerm) => {
    disableFtn(false);
    setInfData(inputValue);
    setSelectedMember(null);

    const nameParts = searchTerm.split(" ");
    if (nameParts.length >= 2) {
      setInfData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          forename: nameParts[0],
          surname: nameParts.slice(1).join(" "),
        },
      }));
    }

    message.success("Ready to add new member");
  };

  const membershipStatusValue =
    InfData?.subscriptionDetails?.membershipStatus || "";
  const isNewOrGraduateMembershipStatus = ["new", "graduate"].includes(
    membershipStatusValue,
  );
  const showPreviousMembershipNo = ["rejoin", "careerBreak"].includes(
    membershipStatusValue,
  );
  const otherSchemeAnsweredNo =
    isNewOrGraduateMembershipStatus &&
    InfData?.subscriptionDetails?.otherScheme === false;
  const showGraduateCornMarketOptions =
    otherSchemeAnsweredNo && membershipStatusValue === "graduate";
  const showNewMemberRewardsOption =
    otherSchemeAnsweredNo && membershipStatusValue === "new";

  const memberAge = useMemo(() => {
    const age = calculateAgeFtn(InfData?.personalInfo?.dateOfBirth);
    return age === "" ? null : age;
  }, [InfData?.personalInfo?.dateOfBirth]);

  const showYouthForumSection = memberAge !== null && memberAge < 35;

  const handleMembershipCategoryChange = async (nextValue) => {
    const currentValue = InfData?.subscriptionDetails?.membershipCategory;
    const currentKey = membershipCategoryCompareKey(
      normalizeMembershipCategoryToLabel(currentValue, categoryData),
    );
    const nextKey = membershipCategoryCompareKey(
      normalizeMembershipCategoryToLabel(nextValue, categoryData),
    );
    if (nextKey && nextKey === currentKey) return;

    if (isReducedRateMembershipCategory(nextValue, categoryData)) {
      const confirmed = await confirmReducedRateMembershipCategoryModal();
      if (!confirmed) return;
    }

    handleInputChange("subscriptionDetails", "membershipCategory", nextValue);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: "#f6f7f8",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{ marginRight: "2.25rem", flexShrink: 0 }}
          className="d-flex justify-content-end align-items-center py-2"
        >
          <div className="d-flex align-items-center gap-3">
            {!isEdit && (
              <>
                <MemberSearch
                  // fullWidth={true}/
                  onSelectBehavior="callback"
                  onSelectCallback={handleMemberSelect}
                  onAddMember={handleAddMember}
                  addMemberLabel="Add New Member"
                  style={{ width: "400px" }}
                />
                <Checkbox
                  name="Bulk"
                  checked={selected.Bulk}
                  onChange={handleChange}
                >
                  Batch Entry
                </Checkbox>
              </>
            )}
            <Checkbox
              name="Approve"
              checked={selected.Approve}
              disabled={
                isEdit ? selected.actionCompleted || isDisable : isDisable
              }
              onChange={handleChange}
            >
              Approve
            </Checkbox>
            <Checkbox
              name="Reject"
              disabled={
                isDisable ||
                !isEdit ||
                (isEdit && selected.Approve) ||
                (isEdit && selected.actionCompleted)
              }
              checked={selected.Reject}
              onChange={handleChange}
            >
              Reject
            </Checkbox>
            <Button
              className="butn primary-btn"
              disabled={isDisable}
              onClick={() => handleSave()}
            >
              Save
            </Button>
            {application?.applicationId &&
              !["approved", "rejected"].includes(
                (
                  application?.applicationStatus ||
                  application?.personalDetails?.applicationStatus ||
                  ""
                ).toLowerCase(),
              ) && (
              <Button
                className="butn"
                disabled={!application?.applicationId}
                onClick={() => openDuplicateReviewDrawer(true)}
              >
                Detect Duplicate
              </Button>
            )}
            {!isEdit && (
              <>
                <Button
                  onClick={() => handleSubmit()}
                  className="butn primary-btn"
                  loading={isProcessing}
                >
                  Submit
                </Button>
                {selectedMember && (
                  <Button
                    onClick={() => {
                      setSelectedMember(null);
                      setInfData(inputValue);
                      setInfData(inputValue);
                      dispatch(clearResults());
                      disableFtn(true);
                      message.info("Form cleared");
                    }}
                    className="butn gray-btn"
                  >
                    Clear Form
                  </Button>
                )}
              </>
            )}
            {isEdit && (
              <div className="d-flex align-items-center">
                <Button
                  className="me-1 gray-btn butn"
                  disabled={index == null || index <= 1 || !nextPrevData?.total}
                  onClick={() => navigateApplication("prev")}
                >
                  <FaAngleLeft className="deatil-header-icon" />
                </Button>
                <p
                  className="mb-0 mx-2"
                  style={{ fontWeight: "500", fontSize: "14px" }}
                >
                  {index != null && nextPrevData?.total
                    ? `${index} of ${nextPrevData.total}`
                    : "—"}
                </p>
                <Button
                  className="me-1 gray-btn butn"
                  disabled={
                    index == null ||
                    !nextPrevData?.total ||
                    index >= nextPrevData.total
                  }
                  onClick={() => navigateApplication("next")}
                >
                  <FaAngleRight className="deatil-header-icon" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {emailConflictData?.hasConflict && <EmailConflictScreen />}
        {isEdit && isPotentialDuplicate && duplicateReviewPending && (
          <div
            style={{
              margin: "0 1.5rem 0.5rem",
              padding: "6px 12px",
              backgroundColor: "#fff1f0",
              borderLeft: "4px solid #f5222d",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
              <span
                className="fw-bold"
                style={{ color: "#a8071a", marginRight: 8, fontSize: 13 }}
              >
                Potential duplicate detected
              </span>
              <span style={{ color: "#820014", fontSize: 13 }}>
                Resolve all matches (Create New Profile, Ignore Match, Tag this
                Profile, or Merge this Profile) before approval.
              </span>
            </div>
            <Button
              size="small"
              type="primary"
              danger
              icon={<FaClone />}
              style={{ flexShrink: 0 }}
              onClick={() => openDuplicateReviewDrawer(false)}
            >
              Open Duplicate Profiles
            </Button>
          </div>
        )}
        <div
          className="hide-scroll-webkit application-form compact"
          style={{
            borderRadius: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            margin: "0 1.5rem 1.5rem",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            backgroundColor: "white",
            padding: "12px 16px",
            filter: showLoader ? "blur(3px)" : "none",
            pointerEvents: showLoader ? "none" : "auto",
            transition: "0.3s ease",
          }}
        >
          {/* Personal Information Section */}
          <div className="section-card">
            <SectionHeader
              icon={
                <MailOutlined style={{ color: "#2f6bff", fontSize: "16px" }} />
              }
              title="Personal Information"
              subTitle="Please provide your details as they appear on your official documents."
              backgroundColor="#eef4ff"
              iconBackground="#e5edff"
            />

            <AppFormGrid>
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Title"
                  name="title"
                  value={InfData?.personalInfo?.title}
                  options={titleOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange("personalInfo", "title", e.target.value)
                  }
                  hasError={!!errors?.title}
                />
              </AppFormCell>
              <AppFormCell>
                <MyInput
                  label="Forename"
                  name="forename"
                  value={InfData.personalInfo?.forename}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "forename",
                      e.target.value,
                    )
                  }
                  hasError={!!errors?.forename}
                />
              </AppFormCell>
              <AppFormCell>
                <MyInput
                  label="Surname"
                  name="surname"
                  value={InfData.personalInfo?.surname}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange("personalInfo", "surname", e.target.value)
                  }
                  hasError={!!errors?.surname}
                />
              </AppFormCell>

              <AppFormCell>
                <ApplicationMgtSelect
                  label="Gender"
                  name="gender"
                  value={InfData.personalInfo?.gender}
                  options={genderOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange("personalInfo", "gender", e.target.value)
                  }
                  hasError={!!errors?.gender}
                />
              </AppFormCell>
              <AppFormCell>
                <MyDatePicker1
                  label="Date Of Birth"
                  name="dob"
                  required
                  value={InfData?.personalInfo?.dateOfBirth}
                  disabled={isDisable}
                  onChange={(date, dateString) => {
                    handleInputChange("personalInfo", "dateOfBirth", date);
                  }}
                  hasError={!!errors?.dateOfBirth}
                  errorMessage={errors?.dateOfBirth || "Required"}
                />
              </AppFormCell>
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Country Primary Qualification"
                  name="countryPrimaryQualification"
                  value={InfData?.personalInfo?.countryPrimaryQualification}
                  options={countriesOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "countryPrimaryQualification",
                      e.target.value,
                    )
                  }
                  hasError={!!errors?.countryPrimaryQualification}
                />
              </AppFormCell>
            </AppFormGrid>
          </div>

          {/* Correspondence Details Section */}
          <div className="section-card">
            <SectionHeader
              icon={
                <EnvironmentOutlined
                  style={{ color: "green", fontSize: "16px" }}
                />
              }
              title="Correspondence Details"
              backgroundColor="#edfdf5"
              iconBackground="#e5edff"
              subTitle="Let us know the best way to contact you"
            />

            <AppFormGrid>
              {/* Preferred Address (33%) and Consent (67%) in one row */}
              <AppFormCell span="full">
                <AppFormGrid cols="33-67" className="form-grid--address-consent">
                  <AppFormCell>
                    <div
                      className={`info-box info-box--field-aligned ${
                        errors?.preferredAddress ? "info-box--error" : ""
                      }`}
                    >
                      <label
                        className={`my-input-label ${
                          errors?.preferredAddress ? "error-text1" : ""
                        }`}
                      >
                        Preferred Address{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="form-control-band">
                        <Radio.Group
                          style={{ color: "#215e97", borderColor: "#215e97" }}
                          onChange={(e) =>
                            handleInputChange(
                              "contactInfo",
                              "preferredAddress",
                              e.target.value,
                            )
                          }
                          value={InfData?.contactInfo?.preferredAddress}
                          disabled={isDisable}
                          options={[
                            { value: "home", label: "Home" },
                            { value: "work", label: "Work" },
                          ]}
                        />
                      </div>
                    </div>
                  </AppFormCell>
                  <AppFormCell>
                    <div className="consent-box consent-box--compact">
                      <Checkbox
                        value={true}
                        checked={InfData?.contactInfo?.consent}
                        onChange={(e) =>
                          handleInputChange(
                            "contactInfo",
                            "consent",
                            e.target.checked,
                          )
                        }
                      >
                        <span className="consent-box-text">
                          <span className="consent-box-label">
                            Consent to receive Correspondence from{" "}
                            {tenantTradeName || "the organisation"}
                          </span>
                          <span className="consent-box-note">
                            (Please un-tick this box if you would{" "}
                            <strong>NOT like</strong> to receive correspondence via
                            email or phone.)
                          </span>
                        </span>
                      </Checkbox>
                    </div>
                  </AppFormCell>
                </AppFormGrid>
              </AppFormCell>

              {/* Search by address or Eircode — own row, 33% width */}
              <AppFormCell span="full" className="form-search-eircode-row">
                <AppFormGrid cols="33-67" className="form-grid--search-eircode">
                  <AppFormCell>
                    {isLoaded && (
                      <div className="address-search-field">
                        <StandaloneSearchBox
                          onLoad={(ref) => (inputRef.current = ref)}
                          onPlacesChanged={handlePlacesChanged}
                          placeholder="Enter Eircode (e.g., D01X4X0)"
                          disabled={isDisable}
                        >
                          <MyInput
                            label="Search by address or Eircode"
                            name="addressSearch"
                            placeholder="Enter Eircode (e.g., D01X4X0)"
                            disabled={isDisable}
                            value={addressSearchValue}
                            onChange={(e) =>
                              setAddressSearchValue(e.target.value)
                            }
                          />
                        </StandaloneSearchBox>
                      </div>
                    )}
                  </AppFormCell>
                </AppFormGrid>
              </AppFormCell>

              <AppFormCell>
                <MyInput
                  label="Address Line 1 (Building or House)"
                  name="buildingOrHouse"
                  value={InfData?.contactInfo?.buildingOrHouse}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "contactInfo",
                      "buildingOrHouse",
                      e.target.value,
                    )
                  }
                  hasError={!!errors?.buildingOrHouse}
                />
              </AppFormCell>

              <AppFormCell>
                <MyInput
                  label="Address Line 2 (Street or Road)"
                  name="streetOrRoad"
                  value={InfData?.contactInfo.streetOrRoad}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "contactInfo",
                      "streetOrRoad",
                      e.target.value,
                    )
                  }
                />
              </AppFormCell>

              <AppFormCell>
                <MyInput
                  label="Address Line 3 (Area or Town)"
                  name="adressLine3"
                  value={InfData.contactInfo?.areaOrTown}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "contactInfo",
                      "areaOrTown",
                      e.target.value,
                    )
                  }
                />
              </AppFormCell>

              <AppFormCell>
                <MyInput
                  label="Address Line 4 (County, City or Postcode)"
                  name="countyCityOrPostCode"
                  value={InfData?.contactInfo?.countyCityOrPostCode}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "contactInfo",
                      "countyCityOrPostCode",
                      e.target.value,
                    )
                  }
                  hasError={!!errors?.countyCityOrPostCode}
                />
              </AppFormCell>

              <AppFormCell>
                <MyInput
                  label="Eircode"
                  name="Eircode"
                  placeholder="Enter Eircode"
                  value={InfData?.contactInfo?.eircode}
                  onChange={(e) =>
                    handleInputChange("contactInfo", "eircode", e.target.value)
                  }
                  disabled={isDisable}
                />
              </AppFormCell>

              <AppFormCell>
                <ApplicationMgtSelect
                  label="Country"
                  name="country"
                  value={InfData.contactInfo?.country}
                  options={countriesOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange("contactInfo", "country", e.target.value)
                  }
                  hasError={!!errors?.country}
                />
              </AppFormCell>
              <AppFormCell span="full">
                <div className="contact-subsection">
                  <h4 className="contact-subsection-title">Contact Details</h4>
                  <p className="contact-subsection-subtitle">
                    Provide your email and contact number
                  </p>
                </div>
              </AppFormCell>
              <AppFormCell span="full">
                <AppFormGrid cols={2} className="form-grid--contact-phones">
                  <AppFormCell>
                    <MyInput
                      label="Mobile"
                      name="mobile"
                      type="mobile"
                      value={InfData.contactInfo?.mobileNumber}
                      required
                      hasError={!!errors?.mobileNumber}
                      errorMessage={errors?.mobileNumber || "Required"}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "mobileNumber",
                          e.target.value,
                        )
                      }
                    />
                  </AppFormCell>
                  <AppFormCell>
                    <MyInput
                      label="Home / Work Tel Number"
                      name="telephoneNumber"
                      type="number"
                      value={InfData.contactInfo?.telephoneNumber}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "telephoneNumber",
                          e.target.value,
                        )
                      }
                      hasError={!!errors?.telephoneNumber}
                    />
                  </AppFormCell>
                </AppFormGrid>
              </AppFormCell>

              <AppFormCell span="full">
                <AppFormGrid cols={3} className="form-grid--contact-emails">
                  <AppFormCell>
                    <div
                      className={`info-box info-box--field-aligned ${
                        errors?.preferredEmail ? "info-box--error" : ""
                      }`}
                    >
                      <label
                        className={`my-input-label ${
                          errors?.preferredEmail ? "error-text1" : ""
                        }`}
                      >
                        Preferred Email{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="form-control-band">
                        <Radio.Group
                          style={{ color: "#215e97", borderColor: "#215e97" }}
                          onChange={(e) =>
                            handleInputChange(
                              "contactInfo",
                              "preferredEmail",
                              e.target.value,
                            )
                          }
                          value={InfData?.contactInfo?.preferredEmail}
                          disabled={isDisable}
                          options={[
                            { value: "personal", label: "Personal" },
                            { value: "work", label: "Work" },
                          ]}
                        />
                      </div>
                    </div>
                  </AppFormCell>
                  <AppFormCell>
                    <MyInput
                      label="Personal Email"
                      name="email"
                      type="email"
                      required={
                        InfData.contactInfo?.preferredEmail === "personal"
                      }
                      value={InfData.contactInfo?.personalEmail}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "personalEmail",
                          e.target.value,
                        )
                      }
                      onBlur={handleEmailBlur}
                      hasError={!!errors?.personalEmail}
                    />
                  </AppFormCell>
                  <AppFormCell>
                    <MyInput
                      label="Work Email"
                      name="Work Email"
                      type="email"
                      value={InfData?.contactInfo?.workEmail}
                      required={InfData.contactInfo?.preferredEmail === "work"}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "workEmail",
                          e.target.value,
                        )
                      }
                      onBlur={handleEmailBlur}
                      hasError={!!errors?.workEmail}
                    />
                  </AppFormCell>
                </AppFormGrid>
              </AppFormCell>
            </AppFormGrid>
          </div>

          {/* Professional Details Section */}
          <div className="section-card">
            <SectionHeader
              icon={
                <IoBagRemoveOutline
                  style={{ color: "#bf86f3", fontSize: "16px" }}
                />
              }
              title="Professional Details"
              backgroundColor="#f7f4ff"
              iconBackground="#ede6fa"
            />

            <AppFormGrid>
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Membership Category"
                  name="membershipCategory"
                  value={InfData.subscriptionDetails?.membershipCategory}
                  isIDs={false}
                  options={categoryData}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleMembershipCategoryChange(e.target.value)
                  }
                  hasError={!!errors?.membershipCategory}
                />
              </AppFormCell>
              {membershipCategoryMatchesProductId(
                InfData.subscriptionDetails?.membershipCategory,
                RETIRED_MEMBERSHIP_CATEGORY_ID,
                categoryData,
              ) ? (
                <>
                  <AppFormCell>
                    <MyDatePicker1
                      label="Retired Date"
                      name="retiredDate"
                      value={InfData?.professionalDetails?.retiredDate}
                      disabled={
                        isDisable ||
                        !membershipCategoryMatchesProductId(
                          InfData?.subscriptionDetails?.membershipCategory,
                          RETIRED_MEMBERSHIP_CATEGORY_ID,
                          categoryData,
                        )
                      }
                      required={membershipCategoryMatchesProductId(
                        InfData?.subscriptionDetails?.membershipCategory,
                        RETIRED_MEMBERSHIP_CATEGORY_ID,
                        categoryData,
                      )}
                      onChange={(date, dateString) => {
                        handleInputChange(
                          "professionalDetails",
                          "retiredDate",
                          date,
                        );
                      }}
                      hasError={!!errors?.retiredDate}
                    />
                  </AppFormCell>
                  <AppFormCell>
                    <MyInput
                      label="Pension No"
                      name="pensionNo"
                      value={InfData.professionalDetails?.pensionNo}
                      disabled={
                        isDisable ||
                        !membershipCategoryMatchesProductId(
                          InfData?.subscriptionDetails?.membershipCategory,
                          RETIRED_MEMBERSHIP_CATEGORY_ID,
                          categoryData,
                        )
                      }
                      required={membershipCategoryMatchesProductId(
                        InfData?.subscriptionDetails?.membershipCategory,
                        RETIRED_MEMBERSHIP_CATEGORY_ID,
                        categoryData,
                      )}
                      onChange={(e) =>
                        handleInputChange(
                          "professionalDetails",
                          "pensionNo",
                          e.target.value,
                        )
                      }
                      hasError={!!errors?.pensionNo}
                    />
                  </AppFormCell>
                </>
              ) : null}
              {isUndergraduateStudentCategory ? (
                <>
                  <AppFormCell>
                    <ApplicationMgtSelect
                      onChange={(e) =>
                        handleInputChange(
                          "professionalDetails",
                          "studyLocation",
                          e.target.value,
                        )
                      }
                      label="Study Location"
                      disabled={isDisable}
                      required
                      options={studyLocationOptions}
                      value={InfData?.professionalDetails?.studyLocation}
                      hasError={!!errors?.studyLocation}
                    />
                  </AppFormCell>
                  <AppFormCell>
                    <ApplicationMgtSelect
                      label="Discipline"
                      name="discipline"
                      disabled={isDisable}
                      required
                      options={disciplineOptions}
                      value={InfData?.professionalDetails?.discipline}
                      onChange={(e) =>
                        handleInputChange(
                          "professionalDetails",
                          "discipline",
                          e.target.value,
                        )
                      }
                      hasError={!!errors?.discipline}
                    />
                  </AppFormCell>
                  <AppFormCell>
                    <MyDatePicker1
                      label="Start Date"
                      onChange={(date, datestring) => {
                        handleInputChange(
                          "professionalDetails",
                          "startDate",
                          date,
                        );
                      }}
                      disabled={isDisable}
                      value={InfData?.professionalDetails?.startDate}
                    />
                  </AppFormCell>
                  <AppFormCell>
                    <MyDatePicker1
                      label="Graduation date"
                      required
                      disabled={isDisable}
                      onChange={(date, datestring) => {
                        handleInputChange(
                          "professionalDetails",
                          "graduationDate",
                          date,
                        );
                      }}
                      value={InfData?.professionalDetails?.graduationDate}
                      hasError={!!errors?.graduationDate}
                    />
                  </AppFormCell>
                </>
              ) : null}

              {/* Work Location */}
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Work Location"
                  name="workLocation"
                  isObjectValue={true}
                  isIDs={false}
                  value={InfData.professionalDetails?.workLocation}
                  required
                  options={workLocationOptions}
                  disabled={isDisable}
                  onChange={(e) => {
                    handleInputChange(
                      "professionalDetails",
                      "workLocation",
                      e.target.value,
                    );
                  }}
                  hasError={!!errors?.workLocation}
                />
              </AppFormCell>

              {isWorkLocationOther && (
                <AppFormCell>
                  <MyInput
                    label="Other Work Location"
                    name="Other Work Location"
                    value={InfData.professionalDetails?.otherWorkLocation}
                    required
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "otherWorkLocation",
                        e.target.value,
                      )
                    }
                    hasError={!!errors?.otherWorkLocation}
                  />
                </AppFormCell>
              )}

              <AppFormCell>
                <ApplicationMgtSelect
                  label="Branch"
                  name="branch"
                  value={InfData.professionalDetails.branch}
                  disabled={true}
                  placeholder={`${
                    workLocationLoading ? "Loading..." : "Select"
                  }`}
                  onChange={(e) =>
                    handleInputChange(
                      "professionalDetails",
                      "branch",
                      e.target.value,
                    )
                  }
                  options={branchOptions}
                  hasError={!!errors?.branch}
                />
              </AppFormCell>

              <AppFormCell>
                <ApplicationMgtSelect
                  label="Region"
                  name="Region"
                  placeholder={`${
                    workLocationLoading ? "Loading..." : "Select"
                  }`}
                  value={InfData.professionalDetails?.region}
                  disabled={true}
                  onChange={(e) =>
                    handleInputChange(
                      "professionalDetails",
                      "region",
                      e.target.value,
                    )
                  }
                  options={regionOptions}
                  hasError={!!errors?.region}
                />
              </AppFormCell>
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Grade"
                  name="grade"
                  value={InfData?.professionalDetails?.grade}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "professionalDetails",
                      "grade",
                      e.target.value,
                    )
                  }
                  options={gradeOptions}
                  hasError={!!errors?.grade}
                />
              </AppFormCell>

              {isGradeOther && (
                <AppFormCell>
                  <MyInput
                    label="Other Grade"
                    name="otherGrade"
                    value={InfData.professionalDetails?.otherGrade}
                    required
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "otherGrade",
                        e.target.value,
                      )
                    }
                    hasError={!!errors?.otherGrade}
                  />
                </AppFormCell>
              )}

              <AppFormCell>
                <ApplicationMgtSelect
                  label="Primary Section"
                  name="primarySection"
                  value={InfData.subscriptionDetails?.primarySection}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "primarySection",
                      e.target.value,
                    )
                  }
                  options={sectionOptions}
                />
              </AppFormCell>

              {isPrimarySectionOther && (
                <AppFormCell>
                  <MyInput
                    label="Other Primary Section"
                    name="otherPrimarySection"
                    value={InfData.subscriptionDetails?.otherPrimarySection}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "otherPrimarySection",
                        e.target.value,
                      )
                    }
                    required
                    disabled={isDisable}
                    hasError={!!errors?.otherPrimarySection}
                  />
                </AppFormCell>
              )}

              <AppFormCell>
                <ApplicationMgtSelect
                  label="Secondary Section"
                  name="secondarySection"
                  value={InfData.subscriptionDetails?.secondarySection}
                  options={secondarySectionOptions}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "secondarySection",
                      e.target.value,
                    )
                  }
                />
              </AppFormCell>

              {isSecondarySectionOther && (
                <AppFormCell>
                  <MyInput
                    label="Other Secondary Section"
                    name="otherSecondarySection"
                    value={InfData.subscriptionDetails?.otherSecondarySection}
                    disabled={isDisable}
                    required
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "otherSecondarySection",
                        e.target.value,
                      )
                    }
                    hasError={!!errors?.otherSecondarySection}
                  />
                </AppFormCell>
              )}

              {/* Nursing Adaptation Programme (cols 1–2) + NMBI No (col 3) */}
              <AppFormCell span="full">
                <AppFormGrid cols={2} className="form-grid--nursing-row">
                  <AppFormCell>
                    <div
                      className={`info-box info-box--field-aligned info-box--field-aligned--wrap ${
                        errors?.nursingAdaptationProgramme
                          ? "info-box--error"
                          : ""
                      }`}
                    >
                      <label
                        className={`my-input-label ${
                          errors?.nursingAdaptationProgramme
                            ? "error-text1"
                            : ""
                        }`}
                        style={{
                          color: errors?.nursingAdaptationProgramme
                            ? "#ff4d4f"
                            : "#215e97",
                        }}
                      >
                        Are you currently undertaking a nursing adaptation
                        programme?
                        {!isUndergraduateStudentCategory ? (
                          <span className="text-danger"> *</span>
                        ) : null}
                      </label>
                      <div className="form-control-band">
                        <Radio.Group
                          name="nursingAdaptationProgramme"
                          value={
                            InfData.professionalDetails
                              ?.nursingAdaptationProgramme === true
                              ? true
                              : InfData.professionalDetails
                                    ?.nursingAdaptationProgramme === false
                                ? false
                                : null
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "professionalDetails",
                              "nursingAdaptationProgramme",
                              e.target.value,
                            )
                          }
                          disabled={isDisable}
                          style={{
                            color: "#215e97",
                            borderColor: "#215e97",
                          }}
                          className={
                            errors?.nursingAdaptationProgramme
                              ? "radio-error"
                              : ""
                          }
                          options={[
                            { value: true, label: "Yes" },
                            { value: false, label: "No" },
                          ]}
                        />
                      </div>
                    </div>
                  </AppFormCell>
                  <AppFormCell>
                    <MyInput
                      label="NMBI No/An Board Altranais Number"
                      name="nmbiNumber"
                      value={InfData?.professionalDetails?.nmbiNumber}
                      disabled={isDisable}
                      required={isNmbiNumberRequired}
                      onChange={(e) =>
                        handleInputChange(
                          "professionalDetails",
                          "nmbiNumber",
                          e.target.value,
                        )
                      }
                      hasError={!!errors?.nmbiNumber}
                    />
                  </AppFormCell>
                </AppFormGrid>
              </AppFormCell>

              {/* Nurse Type - Full Width */}
              {showNurseTypeField && (
              <AppFormCell span="full">
                <div
                  className={`question-box nurse-type-box ${
                    errors?.nurseType ? "info-box--error" : ""
                  }`}
                >
                  <label
                    className={`my-input-label ${
                      errors?.nurseType ? "error-text1" : ""
                    }`}
                    style={{
                      color: errors?.nurseType ? "#ff4d4f" : "#215e97",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Please tick one of the following
                    {!isUndergraduateStudentCategory ? (
                      <span className="text-danger">*</span>
                    ) : null}
                  </label>
                  <Radio.Group
                    name="nurseType"
                    value={InfData.professionalDetails?.nurseType}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "nurseType",
                        e.target.value,
                      )
                    }
                    disabled={
                      InfData?.professionalDetails
                        ?.nursingAdaptationProgramme !== true || isDisable
                    }
                    style={{
                      color: "#215e97",
                      width: "100%",
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-wrap"
                      style={{ gap: "8px" }}
                    >
                      <Radio
                        value="generalNursing"
                        style={{ color: "#215e97", width: "14%" }}
                      >
                        General Nursing
                      </Radio>

                      <Radio
                        value="publicHealthNurse"
                        style={{ color: "#215e97", width: "14%" }}
                      >
                        Public Health Nurse
                      </Radio>

                      <Radio
                        value="mentalHealth"
                        style={{ color: "#215e97", width: "14%" }}
                      >
                        Mental Health Nurse
                      </Radio>

                      <Radio
                        value="midwife"
                        style={{ color: "#215e97", width: "16%" }}
                      >
                        Midwife
                      </Radio>

                      <Radio
                        value="sickChildrenNurse"
                        style={{ color: "#215e97", width: "14%" }}
                      >
                        Sick Children's Nurse
                      </Radio>

                      <Radio
                        value="intellectualDisability"
                        style={{
                          color: "#215e97",
                          width: "20%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        Registered Nurse for Intellectual Disability
                      </Radio>
                    </div>
                  </Radio.Group>
                </div>
              </AppFormCell>
              )}
            </AppFormGrid>
          </div>

          {showYouthForumSection && (
            <div className="section-card">
              <AppFormGrid>
                <AppFormCell span={showYouthForumSelect ? 2 : "full"}>
                  <div
                    className={`info-box question-box ${
                      errors?.joinYouthForum ? "info-box--error" : ""
                    }`}
                  >
                    <label
                      className={`my-input-label ${
                        errors?.joinYouthForum ? "error-text1" : ""
                      }`}
                      style={{
                        color: errors?.joinYouthForum ? "#ff4d4f" : "#215e97",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Would you like to join Youth Forum?
                      <span className="text-danger">*</span>
                    </label>
                    <Radio.Group
                      name="joinYouthForum"
                      value={
                        InfData.professionalDetails?.joinYouthForum !== null
                          ? InfData.professionalDetails?.joinYouthForum
                          : null
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "professionalDetails",
                          "joinYouthForum",
                          e.target?.value,
                        )
                      }
                      style={{ color: "#215e97" }}
                      disabled={isDisable}
                    >
                      <Radio style={{ color: "#215e97" }} value={true}>
                        Yes
                      </Radio>
                      <Radio style={{ color: "#215e97" }} value={false}>
                        No
                      </Radio>
                    </Radio.Group>
                  </div>
                </AppFormCell>
                {showYouthForumSelect && (
                  <AppFormCell>
                    <ApplicationMgtSelect
                      label="Youth Forum"
                      name="youthForum"
                      required
                      options={youthForumOptions}
                      value={InfData.professionalDetails?.youthForum}
                      disabled={isDisable}
                      placeholder="Select Youth Forum"
                      onChange={(e) =>
                        handleInputChange(
                          "professionalDetails",
                          "youthForum",
                          e.target.value,
                        )
                      }
                      hasError={!!errors?.youthForum}
                    />
                  </AppFormCell>
                )}
              </AppFormGrid>
            </div>
          )}

          {/* Subscription Details Section */}
          <div className="section-card">
            <SectionHeader
              icon={
                <CiCreditCard1 style={{ color: "#ec6d28", fontSize: "16px" }} />
              }
              title="Subscription Details"
              backgroundColor="#fff9eb"
              iconBackground="#fad1b8ff"
            />

            <AppFormGrid>
              <AppFormCell>
                <MyDatePicker1
                  className="w-100"
                  label="Date Joined"
                  name="dateJoined"
                  required
                  value={InfData?.subscriptionDetails?.dateJoined}
                  disabled={isDisable}
                  onChange={(date, dateString) => {
                    handleInputChange(
                      "subscriptionDetails",
                      "dateJoined",
                      date,
                    );
                  }}
                  hasError={!!errors?.dateJoined}
                  errorMessage={errors?.dateJoined || "Required"}
                />
              </AppFormCell>
              <AppFormCell>
                <MyDatePicker1
                  className="w-100"
                  label="Submission Date"
                  name="submissionDate"
                  value={InfData?.subscriptionDetails?.submissionDate}
                  disabled={isDisable || isEdit}
                  onChange={(date, dateString) => {
                    handleInputChange(
                      "subscriptionDetails",
                      "submissionDate",
                      date,
                    );
                  }}
                  hasError={!!errors?.submissionDate}
                  errorMessage={errors?.submissionDate || "Required"}
                />
              </AppFormCell>
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Payment Method"
                  name="paymentType"
                  required
                  options={filteredPaymentTypeOptions}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "paymentType",
                      e.target.value,
                    )
                  }
                  value={InfData.subscriptionDetails?.paymentType}
                  hasError={!!errors?.paymentType}
                />
              </AppFormCell>
              {isSalaryDeductionPayment && (
                <AppFormCell>
                  <MyInput
                    className="w-100"
                    label="Payroll No"
                    name="payrollNo"
                    value={InfData?.subscriptionDetails?.payrollNo}
                    hasError={!!errors?.payrollNo}
                    required
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "payrollNo",
                        e.target.value,
                      )
                    }
                  />
                </AppFormCell>
              )}
              <AppFormCell>
                <ApplicationMgtSelect
                  label="Payment Frequency"
                  name="paymentFrequency"
                  options={CRM_PAYMENT_FREQUENCY_OPTIONS}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "paymentFrequency",
                      e.target.value,
                    )
                  }
                  value={InfData.subscriptionDetails?.paymentFrequency}
                />
              </AppFormCell>

              {/* Membership Status - Full Width */}
              <AppFormCell span="full">
                <div
                  className="notice-box"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: errors?.membershipStatus
                      ? "1px solid #ff4d4f"
                      : "1px solid #a4e3ba",
                  }}
                >
                  <label
                    className="my-input-label"
                    style={{
                      color: errors?.membershipStatus ? "#ff4d4f" : "#14532d",
                    }}
                  >
                    Please select the most appropriate option below{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <Radio.Group
                    name="memberStatus"
                    value={InfData?.subscriptionDetails?.membershipStatus || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "membershipStatus",
                        e.target.value,
                      )
                    }
                    disabled={isDisable}
                    style={{
                      color: "#14532d",
                      width: "100%",
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-wrap"
                      style={{ gap: "8px" }}
                    >
                      <Radio
                        value="new"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        New member
                      </Radio>

                      <Radio
                        value="graduate"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        Newly graduated
                      </Radio>

                      <Radio
                        value="rejoin"
                        style={{
                          color: "#14532d",
                          width: "28%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        Rejoining - Previous{"  "}
                        {tenantTradeName || "the organisation"} Member"
                      </Radio>

                      <Radio
                        value="careerBreak"
                        style={{
                          color: "#14532d",
                          width: "18%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        Returning from a career break
                      </Radio>

                      <Radio
                        value="nursingAbroad"
                        style={{
                          color: "#14532d",
                          width: "18%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        Returning from nursing abroad
                      </Radio>
                    </div>
                  </Radio.Group>
                </div>
              </AppFormCell>

              {isNewOrGraduateMembershipStatus && (
                <>
                  <AppFormCell span="full">
                    <AppFormGrid
                      cols={
                        InfData.subscriptionDetails?.otherIrishTradeUnion ===
                        true
                          ? 3
                          : 2
                      }
                      className={`form-grid--trade-union-row${
                        InfData.subscriptionDetails?.otherIrishTradeUnion ===
                        true
                          ? " form-grid--trade-union-row--3"
                          : ""
                      }`}
                    >
                      <AppFormCell>
                        <div
                          className={`info-box info-box--field-aligned info-box--field-aligned--wrap ${
                            errors?.otherIrishTradeUnion
                              ? "info-box--error"
                              : ""
                          }`}
                        >
                          <label
                            className={`my-input-label ${
                              errors?.otherIrishTradeUnion ? "error-text1" : ""
                            }`}
                            style={{
                              color: errors?.otherIrishTradeUnion
                                ? "#ff4d4f"
                                : "#215e97",
                            }}
                          >
                            If you are a member of another Trade Union. If yes,
                            which Union?{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div className="form-control-band">
                            <Radio.Group
                              name="otherIrishTradeUnion"
                              style={{
                                color: "#215e97",
                                borderColor: "#215e97",
                              }}
                              className={
                                errors?.otherIrishTradeUnion
                                  ? "radio-error"
                                  : ""
                              }
                              value={
                                InfData.subscriptionDetails
                                  ?.otherIrishTradeUnion !== null
                                  ? InfData.subscriptionDetails
                                      ?.otherIrishTradeUnion
                                    : null
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "subscriptionDetails",
                                  "otherIrishTradeUnion",
                                  e.target?.value,
                                )
                              }
                              disabled={isDisable}
                              options={[
                                { value: true, label: "Yes" },
                                { value: false, label: "No" },
                              ]}
                            />
                          </div>
                        </div>
                      </AppFormCell>
                      {InfData.subscriptionDetails?.otherIrishTradeUnion ===
                        true && (
                        <AppFormCell>
                          <MyInput
                            label="Union Name"
                            name="otherIrishTradeUnionName"
                            value={
                              InfData.subscriptionDetails
                                ?.otherIrishTradeUnionName
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "subscriptionDetails",
                                "otherIrishTradeUnionName",
                                e.target?.value,
                              )
                            }
                            placeholder="Enter Union name"
                            required
                            disabled={isDisable}
                            hasError={!!errors?.otherIrishTradeUnionName}
                          />
                        </AppFormCell>
                      )}
                      <AppFormCell>
                        <div
                          className={`info-box info-box--field-aligned info-box--field-aligned--wrap ${
                            errors?.otherScheme ? "info-box--error" : ""
                          }`}
                        >
                          <label
                            className={`my-input-label ${
                              errors?.otherScheme ? "error-text1" : ""
                            }`}
                            style={{
                              color: errors?.otherScheme
                                ? "#ff4d4f"
                                : "#215e97",
                            }}
                          >
                            Are you or were you a member of another Irish trade
                            Union salary or Income Protection Scheme?{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div className="form-control-band">
                            <Radio.Group
                              name="otherScheme"
                              style={{
                                color: "#215e97",
                                borderColor: "#215e97",
                              }}
                              className={
                                errors?.otherScheme ? "radio-error" : ""
                              }
                              value={
                                InfData.subscriptionDetails?.otherScheme !==
                                null
                                  ? InfData.subscriptionDetails?.otherScheme
                                  : null
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "subscriptionDetails",
                                  "otherScheme",
                                  e.target?.value,
                                )
                              }
                              disabled={isDisable}
                              options={[
                                { value: true, label: "Yes" },
                                { value: false, label: "No" },
                              ]}
                            />
                          </div>
                        </div>
                      </AppFormCell>
                    </AppFormGrid>
                  </AppFormCell>
                </>
              )}

              {showGraduateCornMarketOptions && (
                <>
                  <AppFormCell span="full">
                    <div className="consent-box">
                      <Checkbox
                        checked={
                          InfData?.subscriptionDetails
                            ?.exclusiveDiscountsAndOffers
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "subscriptionDetails",
                            "exclusiveDiscountsAndOffers",
                            e.target.checked,
                          )
                        }
                        disabled={isDisable}
                      >
                        Would you like to hear about exclusive discounts and
                        offers for {tenantTradeName || "organisation"} members?
                      </Checkbox>
                    </div>
                  </AppFormCell>
                  <AppFormCell span="full">
                    <div className="consent-box">
                      <Checkbox
                        checked={
                          InfData?.subscriptionDetails?.incomeProtectionScheme
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "subscriptionDetails",
                            "incomeProtectionScheme",
                            e.target.checked,
                          )
                        }
                        disabled={isDisable}
                      >
                        I consent to{" "}
                        <a
                          href={`http://localhost:3000/rewards/insurance`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#78350f",
                            textDecoration: "underline",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tenantTradeName || "Organisation"} Income Protection
                          Scheme
                        </a>
                      </Checkbox>
                      <p className="consent-box-note">
                        By selecting 'I consent' below, you are agreeing to the
                        {tenantTradeName || "The organisation"}, sharing your
                        Trade Union membership details with Cornmarket.
                        Cornmarket as Scheme Administrator will process and
                        retain details of your Trade Union membership for the
                        purposes of assessing eligibility and admitting eligible
                        members (automatically) to the Income Protection Scheme
                        (with 9 Months' Free Cover), and for the ongoing
                        administration of the Scheme. Where you have also opted
                        in to receiving marketing communications, Cornmarket
                        will provide you with information on discounts and
                        offers they have for {tenantTradeName || "organisation"}{" "}
                        members. This consent can be withdrawn at any time by
                        emailing Cornmarket at dataprotection@cornmarket.ie.
                        Please note, if you do consent below, your data will be
                        shared with Cornmarket, and you will be assessed for
                        eligibility for automatic Income Protection Scheme
                        membership. If you do not consent, your data will not be
                        shared with Cornmarket for this purpose, you will not be
                        assessed for automatic Scheme membership (including 9
                        Months' Free Cover) and you will have to contact
                        Cornmarket separately should you wish to apply for
                        Scheme membership. This offer will run on a pilot basis.
                        Terms and conditions apply and are subject to change.
                        Important: If you do not give your consent, your Trade
                        union membership data will not be shared with Cornmarket
                        for this purpose. This means you will not be assessed
                        for Automatic Access to the Scheme.
                      </p>
                    </div>
                  </AppFormCell>
                </>
              )}
              {showNewMemberRewardsOption && (
                <AppFormCell span="full">
                  <div className="consent-box">
                    <Checkbox
                      checked={InfData?.subscriptionDetails?.inmoRewards}
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionDetails",
                          "inmoRewards",
                          e.target.checked,
                        )
                      }
                      disabled={isDisable}
                    >
                      Tick here to join{" "}
                      <Tooltip
                        placement="top"
                        styles={{
                          body: {
                            maxWidth: "600px",
                            width: "600px",
                            maxHeight: "650px",
                            overflow: "hidden",
                            padding: "0",
                          },
                        }}
                      >
                        <a
                          href={`http://localhost:3000/rewards/rewards`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#78350f",
                            textDecoration: "underline",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Rewards
                        </a>
                      </Tooltip>{" "}
                      for {tenantTradeName || "organisation"} members
                    </Checkbox>
                    <p className="consent-box-note">
                      By ticking here, you confirm that you agree to the Terms &
                      Conditions available on Cornmarket.ie/rewards-club-terms
                      and the Data Protection Statement available on
                      Cornmarket.ie/rewards-dps. Cornmarket will contact you
                      about your Rewards Benefits. You can opt out at any time.
                    </p>
                  </div>
                </AppFormCell>
              )}

              {showPreviousMembershipNo && (
                <AppFormCell span="full">
                  <AppFormGrid cols={3}>
                    <AppFormCell>
                      <MyInput
                        label="Previous Membership No."
                        name="previousMembershipNo"
                        value={
                          InfData?.professionalDetails?.previousMembershipNo
                        }
                        placeholder="Enter previous membership number"
                        disabled={isDisable}
                        onChange={(e) =>
                          handleInputChange(
                            "professionalDetails",
                            "previousMembershipNo",
                            e.target.value,
                          )
                        }
                      />
                    </AppFormCell>
                  </AppFormGrid>
                </AppFormCell>
              )}

              {/* Recruited By */}
              <AppFormCell>
                <MyInput
                  label="Recruited By"
                  name="recuritedBy"
                  value={InfData.subscriptionDetails?.recuritedBy}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "recuritedBy",
                      e.target.value,
                    )
                  }
                />
              </AppFormCell>

              <AppFormCell>
                <MyInput
                  label="Recruited By (Membership No)"
                  name="recuritedByMembershipNo"
                  value={InfData?.subscriptionDetails?.recuritedByMembershipNo}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "recuritedByMembershipNo",
                      e.target.value,
                    )
                  }
                />
              </AppFormCell>
              {/* <Col span={12}>
                <label className="my-input-label">
                  Validate Recruited By Information
                </label>
                <div style={{
                  display: 'flex',
                  marginBottom: '20px',
                  height: '40px'
                }}>
                  <Input
                    disabled={isDisable}
                    placeholder="Search by name or membership number"
                    allowClear
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={() => handleSearch(query)}
                    style={{
                      flex: 1,
                      border: '1px solid #d9d9d9',
                      borderRight: 'none',
                      borderRadius: '6px 0 0 6px',
                      height: '40px',
                      paddingLeft: 4,
                      paddingRight: 4,
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => handleSearch(query)}
                    loading={loading}
                    style={{
                      backgroundColor: '#215e97',
                      borderColor: '#215e97',
                      borderRadius: '0 4px 4px 0',
                      height: '40px',
                      width: '90px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderLeft: 'none'
                    }}
                  >
                    Search
                  </Button>
                </div>
              </AppFormCell> */}
              <AppFormCell>
                <div className="form-field-stack">
                  <label className="my-input-label">
                    Validate Recruited By Information
                  </label>
                  <div className="form-control-band form-control-band--plain">
                    <MemberSearch
                      compact
                      showStatus={false}
                      disable={isDisable}
                      onSelectBehavior="callback"
                      onSelectCallback={handleRecruteBy}
                      value={recruiterSearchValue}
                      onChange={setRecruiterSearchValue}
                      addMemberLabel="Add New Member"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </AppFormCell>

              <AppFormCell span="full">
                <AppFormGrid
                  cols="40-60"
                  className="form-grid--final-checkboxes"
                >
                  <AppFormCell>
                    <div className="checkbox-notice-box">
                      <Checkbox
                        checked={
                          InfData?.subscriptionDetails?.valueAddedServices
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "subscriptionDetails",
                            "valueAddedServices",
                            e.target.checked,
                          )
                        }
                        disabled={isDisable}
                      >
                        Tick here to allow our partners to contact you about
                        Value added Services by Email and SMS
                      </Checkbox>
                    </div>
                  </AppFormCell>
                  <AppFormCell>
                    <div className="checkbox-notice-box">
                      <Checkbox
                        checked={
                          InfData?.subscriptionDetails?.termsAndConditions
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "subscriptionDetails",
                            "termsAndConditions",
                            e.target.checked,
                          )
                        }
                        style={{ color: "#78350f" }}
                        disabled={isDisable}
                      >
                        I have read and agree to the{" "}
                        <a
                          href="#"
                          style={{
                            color: "#78350f",
                            textDecoration: "underline",
                          }}
                        >
                          {tenantTradeName || "Organisation"} Data Protection
                          Statement,
                        </a>{" "}
                        the{" "}
                        <a
                          href="#"
                          style={{
                            color: "#78350f",
                            textDecoration: "underline",
                          }}
                        >
                          {tenantTradeName || "Organisation"} Privacy Statement
                        </a>{" "}
                        and the{" "}
                        <a
                          href="#"
                          style={{
                            color: "#78350f",
                            textDecoration: "underline",
                          }}
                        >
                          {tenantTradeName || "Organisation"} Conditions of
                          Membership
                        </a>
                        {errors?.termsAndConditions && (
                          <span style={{ color: "red" }}> (Required)</span>
                        )}
                      </Checkbox>
                    </div>
                  </AppFormCell>
                </AppFormGrid>
              </AppFormCell>
            </AppFormGrid>
          </div>
        </div>

        {showLoader && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.5)",
              zIndex: 10,
            }}
          >
            <Spin size="large" />
          </div>
        )}
      </div>

      <Modal
        centered
        title="Reject Application"
        open={actionModal.open && actionModal.type === "reject"}
        onCancel={() => {
          setActionModal({ open: false, type: null });
          setSelected((prev) => ({
            ...prev,
            Reject: false,
          }));
          setRejectionData({ reason: "", note: "" });
        }}
        onOk={() => handleApplicationAction("rejected")}
        okText="Reject"
        okButtonProps={{
          danger: true,
          className: "butn",
          loading: isProcessing,
        }}
        cancelButtonProps={{
          className: "butn butn primary-btn",
          disabled: isProcessing,
        }}
        confirmLoading={isProcessing}
      >
        <div className="drawer-main-container">
          <ApplicationMgtSelect
            label="Reason"
            name="Reason"
            required
            placeholder="Select reason"
            value={rejectionData.reason}
            onChange={(val) =>
              setRejectionData((prev) => ({
                ...prev,
                reason: val.target.value,
              }))
            }
            options={[
              { label: "Incomplete documents", value: "incomplete_documents" },
              { label: "Invalid information", value: "invalid_information" },
              { label: "Duplicate application", value: "duplicate" },
              { label: "Other", value: "other" },
            ]}
            hasError={!rejectionData.reason}
          />
          <MyInput
            name="Note (optional)"
            label="Note (optional)"
            placeholder="Enter note"
            value={rejectionData.note}
            onChange={(e) =>
              setRejectionData((prev) => ({ ...prev, note: e.target.value }))
            }
            textarea
          />
        </div>
      </Modal>

      <DuplicateProfileReview
        open={duplicateReviewOpen}
        onClose={() => setDuplicateReviewOpen(false)}
        applicationId={application?.applicationId}
        runDetectionOnOpen={duplicateReviewAutoRun}
        onReviewUpdated={() => {
          if (application?.applicationId) {
            dispatch(getApplicationById({ id: application.applicationId }));
          }
        }}
      />
    </div>
  );
}

export default ApplicationMgtDrawer;
