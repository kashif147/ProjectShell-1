import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { Row, Col, Card, Checkbox, Radio, Button } from "antd";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import CustomSelect from "../common/CustomSelect";
import MyAlert from "../common/MyAlert";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getCategoryLookup } from "../../features/CategoryLookupSlice";

import {
  getProfileDetailsById,
  updateProfileDetails,
} from "../../features/profiles/ProfileDetailsSlice";
import {
  getSubscriptionByProfileId,
  getSubscriptionById,
  updateSubscriptionById,
} from "../../features/subscription/profileSubscriptionSlice";
import {
  formDataToProfilePutPayload,
  formDataToSubscriptionPutPayload,
} from "../../utils/membershipProfileSaveMappers";
import { useMembershipTabToolbar } from "../../context/MembershipTabToolbarContext";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";

/** CustomSelect uses option label as <select> value; API often stores gender lowercase (e.g. male). */
function normalizeGenderToSelectLabel(raw, options) {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  if (!s) return "";
  if (!Array.isArray(options) || options.length === 0) return s;

  const exact = options.find((o) => o.label === s);
  if (exact) return exact.label;

  const lower = s.toLowerCase();
  const byLabel = options.find((o) => (o.label || "").toLowerCase() === lower);
  if (byLabel) return byLabel.label;

  const byKey = options.find((o) => {
    const k = o.key != null ? String(o.key).toLowerCase() : "";
    const v = o.value != null ? String(o.value).toLowerCase() : "";
    return (
      k === lower || v === lower || String(o.key) === s || String(o.value) === s
    );
  });
  if (byKey) return byKey.label;

  return s;
}

function isPayrollOrSalaryDeduction(paymentType) {
  const s = (paymentType || "").trim().toLowerCase();
  if (!s) return false;
  if (s === "payroll deduction" || s === "salary deduction") return true;
  if (
    s.includes("deduction") &&
    (s.includes("payroll") || s.includes("salary"))
  )
    return true;
  return false;
}

/** Membership category value may be product _id or display name from API. */
function isUndergraduateStudentMembershipCategory(selected, categoryOptions) {
  const sel = (selected || "").trim();
  if (!sel) return false;

  const opts = Array.isArray(categoryOptions) ? categoryOptions : [];
  const ugOpt = opts.find((o) => {
    const lab = (o.label || "").toLowerCase();
    return (
      lab.includes("undergraduate") &&
      lab.includes("student") &&
      !lab.includes("postgraduate")
    );
  });
  if (ugOpt) {
    if (ugOpt.value === sel || ugOpt.label === sel || ugOpt.key === sel) {
      return true;
    }
  }

  const norm = sel.toLowerCase().replace(/\s+/g, "_");
  if (norm === "undergraduate_student") return true;

  const combined = sel.toLowerCase();
  return (
    combined.includes("undergraduate") &&
    combined.includes("student") &&
    !combined.includes("postgraduate")
  );
}

function isSameDayValue(a, b) {
  if (!a || !b) return false;
  const da = dayjs.isDayjs(a) ? a : dayjs(a);
  const db = dayjs.isDayjs(b) ? b : dayjs(b);
  if (!da.isValid() || !db.isValid()) return false;
  return da.isSame(db, "day");
}

const membershipSaveButtonStyle = {
  backgroundColor: "#45669d",
  borderColor: "#45669d",
};

const MembershipForm = ({
  isEditMode = false,
  setIsEditMode,
  isDeceased: propIsDeceased = false,
  setIsDeceased,
}) => {
  const membershipToolbar = useMembershipTabToolbar();

  const { profileDetails, loading, error } = useSelector(
    (state) => state.profileDetails,
  );
  const { countriesOptions, countriesData, loadingC, errorC } = useSelector(
    (state) => state.countries,
  );

  const { categoryData, currentCategoryId } = useSelector(
    (state) => state.categoryLookup,
  );
  const {
    profileSearchData,
    loading: searchLoading,
    error: searchError,
  } = useSelector((state) => state.searchProfile);

  // Subscription API data
  const { ProfileSubData, ProfileSubLoading, ProfileSubError } = useSelector(
    (state) => state.profileSubscription,
  );
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subscriptionIdParam = searchParams.get("subscriptionId") || "";
  const profileIdParam = searchParams.get("profileId") || "";
  const [saveLoading, setSaveLoading] = useState(false);
  const [initialMembershipCategory, setInitialMembershipCategory] =
    useState("");
  const [initialSubscriptionStartDate, setInitialSubscriptionStartDate] =
    useState(null);
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
    countryOptions,
  } = useSelector((state) => state.lookups);

  dayjs.extend(utc);
  dayjs.extend(timezone);

  // useEffect(() => {
  //   return () => {
  //     dispatch(clearProfileDetails());
  //   };
  // }, []);

  const convertUTCToLocalDate = (utcDateString) => {
    if (!utcDateString) return null;
    return dayjs.utc(utcDateString).local();
  };

  useEffect(() => {
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, []);

  // Helper function to format dates safely
  const formatDateSafe = (dateString, format = "DD/MM/YYYY") => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.isValid() ? date.format(format) : "";
  };

  // Memoize subscription data to prevent unnecessary recalculations
  const subscriptionData = useMemo(() => {
    if (ProfileSubData?.data?.length > 0) {
      const subscription = ProfileSubData.data[0];
      return {
        subscriptionStatus: subscription.subscriptionStatus || "",
        paymentType: subscription.paymentType || "",
        payrollNo: subscription.payrollNo || "",
        paymentFrequency: subscription.paymentFrequency || "",
        subscriptionYear: subscription.subscriptionYear || "",
        isCurrent: subscription.isCurrent || false,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        renewalDate: subscription.rolloverDate,
        membershipMovement: subscription.membershipMovement || "",
        reinstated: subscription.cancellation?.reinstated || false,
        yearendProcessed: subscription.yearend?.processed || false,
        membershipCategory: subscription.membershipCategory || "",
        primarySection: subscription.professionalDetails?.primarySection || "",
        secondarySection:
          subscription.professionalDetails?.secondarySection || "",
        resignationDate: subscription.resignation?.dateResigned,
        resignationReason: subscription.resignation?.reason || "",
      };
    }
    return null;
  }, [ProfileSubData]);

  const isSubscriptionEmpty = useMemo(() => {
    if (!ProfileSubData) return false;
    // Direct array empty
    if (Array.isArray(ProfileSubData.data) && ProfileSubData.data.length === 0)
      return true;
    // Nested array empty
    if (
      ProfileSubData.data &&
      typeof ProfileSubData.data === "object" &&
      Array.isArray(ProfileSubData.data.data) &&
      ProfileSubData.data.data.length === 0
    )
      return true;
    return false;
  }, [ProfileSubData]);

  const memoizedPaymentTypeOptions = useMemo(() => {
    if (!paymentTypeOptions) return [];
    const hasPayrollDeduction = paymentTypeOptions.some(
      (opt) =>
        opt.label === "Payroll Deduction" || opt.value === "Payroll Deduction",
    );
    if (hasPayrollDeduction) return paymentTypeOptions;

    return [
      ...paymentTypeOptions,
      {
        id: "Payroll Deduction",
        value: "Payroll Deduction",
        label: "Payroll Deduction",
      },
    ];
  }, [paymentTypeOptions]);

  useEffect(() => {
    // FIXED: Safely access profileSearchData results
    const searchAoiRes = profileSearchData?.results?.[0] || null;
    // Choose source dynamically
    const source = profileDetails || searchAoiRes;
    if (!source) return;

    const subDoc =
      ProfileSubData?.data?.length > 0 ? ProfileSubData.data[0] : null;

    // Initialize form data from profile API
    const initialFormData = {
      // Personal Info
      title: source.personalInfo?.title || "",
      surname: source.personalInfo?.surname || "",
      forename: source.personalInfo?.forename || "",
      gender: normalizeGenderToSelectLabel(source.personalInfo?.gender || "", [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "other", label: "Other" },
      ]),
      dateOfBirth: convertUTCToLocalDate(source.personalInfo?.dateOfBirth),
      countryPrimaryQualification:
        source.personalInfo?.countryPrimaryQualification || "",

      // Contact Info
      addressLine1: source.contactInfo?.buildingOrHouse || "",
      addressLine2: source.contactInfo?.streetOrRoad || "",
      townCity: source.contactInfo?.areaOrTown || "",
      countyState: source.contactInfo?.countyCityOrPostCode || "",
      eircode: source.contactInfo?.eircode || "",
      country: source.contactInfo?.country || "",
      nata: Boolean(source.contactInfo?.nATA),
      preferredAddress:
        source.contactInfo?.preferredAddress === "home"
          ? "Home/Personal"
          : "Work",
      mobileNumber: source.contactInfo?.mobileNumber || "",
      telephoneNumber: source.contactInfo?.telephoneNumber || "",
      preferredEmail:
        source.contactInfo?.preferredEmail === "work" ? "Work" : "Personal",
      personalEmail: source.contactInfo?.personalEmail || "",
      workEmail: source.contactInfo?.workEmail || "",

      // Professional Details
      studyLocation: source.professionalDetails?.studyLocation || "",
      discipline: source.professionalDetails?.discipline || "",
      startDate: convertUTCToLocalDate(source.professionalDetails?.startDate),
      graduationDate: convertUTCToLocalDate(
        source.professionalDetails?.graduationDate,
      ),
      workLocation: source.professionalDetails?.workLocation || "",
      otherWorkLocation: source.professionalDetails?.otherWorkLocation || "",
      branch: source.professionalDetails?.branch || "",
      region: source.professionalDetails?.region || "",
      grade: source.professionalDetails?.grade || "",
      otherGrade: source.professionalDetails?.otherGrade || "",
      otherPrimarySection:
        source.professionalDetails?.otherPrimarySection || "",
      otherSecondarySection:
        source.professionalDetails?.otherSecondarySection || "",
      retiredDate: convertUTCToLocalDate(
        source.professionalDetails?.retiredDate,
      ),
      pensionNumber: source.professionalDetails?.pensionNo || "",
      nmbiNumber: source.professionalDetails?.nmbiNumber || "",
      nursingProgramme: source.professionalDetails?.nursingAdaptationProgramme
        ? "Yes"
        : "No",
      nursingSpecialization: source.professionalDetails?.nurseType || "",
      primarySection:
        source.professionalDetails?.primarySection ||
        source.professionalDetails?.nurseType ||
        "",
      secondarySection: source.professionalDetails?.secondarySection || "",

      // Membership Info
      membershipNumber: source.membershipNumber || "",
      joiningDate: convertUTCToLocalDate(source.firstJoinedDate),
      expiryDate: convertUTCToLocalDate(source.deactivatedAt),
      submissionDate: convertUTCToLocalDate(source.submissionDate),

      // Preferences
      consent: Boolean(source.preferences?.consent),
      consentSMS: source.preferences?.smsConsent ?? false,
      consentEmail: source.preferences?.emailConsent ?? false,
      consentPost: source.preferences?.postalConsent ?? false,
      consentApp: source.preferences?.appConsent ?? false,
      consentCorrespondence: Boolean(source.preferences?.consent),
      agreeDataProtection: source.preferences?.termsAndConditions ?? false,
      valueAddedServices: source.preferences?.valueAddedServices,

      // Corn Market
      joinINMOIncomeProtection: source.cornMarket?.incomeProtectionScheme,
      joinRewards: source.cornMarket?.inmoRewards,
      exclusiveDiscountsOffers: source.cornMarket?.exclusiveDiscountsAndOffers,

      // Additional Information
      membershipStatus: source.additionalInformation?.membershipStatus || "",
      memberOfOtherUnion:
        source.additionalInformation?.otherIrishTradeUnion === true
          ? "Yes"
          : "No",
      otherUnionName:
        source.additionalInformation?.otherIrishTradeUnionName || "",
      otherUnionScheme: source.additionalInformation?.otherScheme
        ? "Yes"
        : "No",

      // Recruitment Details
      recruitedBy: source.recruitmentDetails?.recuritedBy || "",
      recruitedByMembershipNo:
        source.recruitmentDetails?.recuritedByMembershipNo || "",
    };

    // Override with subscription data if available
    if (subscriptionData) {
      const originalCategory = subscriptionData.membershipCategory || "";
      const originalStartDate = convertUTCToLocalDate(
        subscriptionData.startDate,
      );
      setInitialMembershipCategory(originalCategory);
      setInitialSubscriptionStartDate(originalStartDate || null);

      setFormData((prev) => ({
        ...prev,
        ...initialFormData,

        // Subscription Details
        subscriptionStatus: subscriptionData.subscriptionStatus || "",
        membershipCategory:
          subscriptionData.membershipCategory || prev.membershipCategory || "",
        paymentType: subscriptionData.paymentType,
        payrollNumber: subscriptionData.payrollNo || prev.payrollNumber || "",

        membershipNumber:
          subDoc?.personalDetails?.membershipNo ||
          initialFormData.membershipNumber,

        joinINMOIncomeProtection:
          subDoc?.preferences?.incomeProtection ??
          source.cornMarket?.incomeProtectionScheme,
        joinRewards:
          subDoc?.preferences?.inmoRewards ?? source.cornMarket?.inmoRewards,

        ...(subDoc?.additionalInfo
          ? {
              memberOfOtherUnion: subDoc.additionalInfo.anotherUnionMember
                ? "Yes"
                : "No",
              otherUnionName: subDoc.additionalInfo.otherUnionName || "",
            }
          : {}),

        // Subscription Dates
        startDate:
          convertUTCToLocalDate(subscriptionData.startDate) || prev.startDate,
        endDate: convertUTCToLocalDate(subscriptionData.endDate),
        renewalDate:
          convertUTCToLocalDate(subscriptionData.renewalDate) ||
          prev.renewalDate,
        dateCancelled:
          convertUTCToLocalDate(subscriptionData.resignationDate) ||
          prev.dateCancelled,
        cancellationReason:
          subscriptionData.resignationReason || prev.cancellationReason || "",

        // Payment Information
        paymentFrequency: subscriptionData.paymentFrequency || "",

        // Membership Movement
        membershipMovement: subscriptionData.membershipMovement || "",

        // Subscription Status Flags
        isCurrent: subscriptionData.isCurrent || false,
        reinstated: subscriptionData.reinstated || false,
        yearendProcessed: subscriptionData.yearendProcessed || false,
        subscriptionYear: subscriptionData.subscriptionYear || null,
        primarySection:
          subscriptionData.primarySection || prev.primarySection || "",
        secondarySection:
          subscriptionData.secondarySection || prev.secondarySection || "",
      }));
    } else {
      setInitialMembershipCategory("");
      setInitialSubscriptionStartDate(null);
      // If no subscription data, check if it's because they are resigned
      let status = "";
      if (isSubscriptionEmpty && !ProfileSubLoading) {
        status = "Resigned";
      }

      // If no subscription data, just set profile data
      setFormData((prev) => ({
        ...prev,
        ...initialFormData,
        subscriptionStatus: status,
      }));
    }
  }, [
    profileDetails,
    profileSearchData,
    subscriptionData,
    isSubscriptionEmpty,
    ProfileSubLoading,
    ProfileSubData,
  ]);

  useEffect(() => {
    if (!Array.isArray(genderOptions) || genderOptions.length === 0) return;
    setFormData((prev) => {
      if (!prev.gender) return prev;
      const next = normalizeGenderToSelectLabel(prev.gender, genderOptions);
      return next === prev.gender ? prev : { ...prev, gender: next };
    });
  }, [genderOptions]);

  // Internal form state
  const [formData, setFormData] = useState({
    title: "",
    surname: "",
    forename: "",
    gender: "",
    dateOfBirth: null,
    countryPrimaryQualification: "",
    searchAddress: "",
    addressLine1: "",
    addressLine2: "",
    nata: false,
    townCity: "",
    countyState: "",
    eircode: "",
    country: "",
    preferredAddress: "Home/Personal",
    consentCorrespondence: false,
    consentSMS: false,
    consentEmail: false,
    consentPost: false,
    consentApp: false,
    mobileNumber: "",
    telephoneNumber: "",
    preferredEmail: "Personal",
    personalEmail: "",
    workEmail: "",
    studyLocation: "",
    startDate: null,
    graduationDate: null,
    discipline: "",
    workLocation: "",
    otherWorkLocation: "",
    branch: "",
    region: "",
    grade: "",
    otherGrade: "",
    retiredDate: null,
    pensionNumber: "",
    membershipNumber: "",
    membershipStatus: "",
    membershipCategory: "",
    joiningDate: null,
    expiryDate: null,
    renewalDate: null,
    firstReminderDate: null,
    secondReminderDate: null,
    thirdReminderDate: null,
    paymentType: "",
    payrollNumber: "",
    isDeceased: propIsDeceased || false,
    dateDeceased: null,
    dateCancelled: null,
    cancellationReason: "",
    consent: false,
    nursingProgramme: "No",
    nmbiNumber: "",
    nursingSpecialization: "",
    memberStatus: "",
    memberOfOtherUnion: "No",
    otherUnionName: "",
    otherUnionScheme: "No",
    joinINMOIncomeProtection: false,
    joinRewards: false,
    exclusiveDiscountsOffers: false,
    valueAddedServices: false,
    agreeDataProtection: false,
    recruitedBy: "",
    recruitedByMembershipNo: "",
    primarySection: "",
    otherPrimarySection: "",
    secondarySection: "",
    otherSecondarySection: "",
    Reason: "",
    exclusiveDiscountsAndOffers: false,

    // Subscription specific fields
    subscriptionStatus: "",
    paymentFrequency: "",
    membershipMovement: "",
    isCurrent: false,
    reinstated: false,
    yearendProcessed: false,
    endDate: null,
    subscriptionYear: null,
  });
  const lookupData = {
    titles: [
      { key: "mr", label: "Mr" },
      { key: "mrs", label: "Mrs" },
      { key: "miss", label: "Miss" },
      { key: "dr", label: "Dr" },
    ],
    genders: [
      { key: "male", label: "Male" },
      { key: "female", label: "Female" },
      { key: "other", label: "Other" },
    ],
    countries: [
      { key: "pakistan", label: "Pakistan" },
      { key: "usa", label: "USA" },
      { key: "uk", label: "UK" },
      { key: "other", label: "Other" },
    ],
    studyLocations: [
      { key: "local", label: "Local" },
      { key: "abroad", label: "Abroad" },
    ],
    disciplines: [
      { key: "nursing", label: "Nursing" },
      { key: "medicine", label: "Medicine" },
      { key: "pharmacy", label: "Pharmacy" },
      { key: "physiotherapy", label: "Physiotherapy" },
      { key: "occupational-therapy", label: "Occupational Therapy" },
      { key: "radiography", label: "Radiography" },
      { key: "other", label: "Other" },
    ],
    workLocations: [
      { key: "hq", label: "HQ" },
      { key: "branch1", label: "Branch1" },
      { key: "branch2", label: "Branch2" },
      { key: "other", label: "Other" },
    ],
    branches: [
      { key: "branch-a", label: "Branch A" },
      { key: "branch-b", label: "Branch B" },
      { key: "branch-c", label: "Branch C" },
    ],
    regions: [
      { key: "north", label: "North" },
      { key: "south", label: "South" },
      { key: "east", label: "East" },
      { key: "west", label: "West" },
    ],
    grades: [
      { key: "grade-1", label: "Grade 1" },
      { key: "grade-2", label: "Grade 2" },
      { key: "grade-3", label: "Grade 3" },
      { key: "other", label: "Other" },
    ],
    membershipStatus: [
      { key: "active", label: "Active" },
      { key: "inactive", label: "Inactive" },
      { key: "suspended", label: "Suspended" },
    ],
    membershipCategory: [
      { key: "regular", label: "Regular" },
      { key: "premium", label: "Premium" },
      { key: "vip", label: "VIP" },
    ],
    paymentTypes: [
      { key: "cash", label: "Cash" },
      { key: "cheque", label: "Cheque" },
      { key: "bank-transfer", label: "Bank Transfer" },
    ],
  };

  /** Match ApplicationMgtDrawer: hierarchical rows have lookup / branch / region with lookupname. */
  const resolveWorkLocationFromHierarchy = (branchLabel, regionLabel) => {
    try {
      const raw = localStorage.getItem("hierarchicalLookups");
      if (!raw) return null;
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows) || rows.length === 0) return null;

      const b = typeof branchLabel === "string" ? branchLabel.trim() : "";
      const r = typeof regionLabel === "string" ? regionLabel.trim() : "";
      if (!b && !r) return null;

      const branchName = (item) =>
        item.branch?.lookupname || item.branch?.label || "";
      const regionName = (item) =>
        item.region?.lookupname || item.region?.label || "";
      const wlName = (item) =>
        item.lookup?.lookupname || item.lookup?.label || "";

      const candidates = rows.filter((item) => {
        if (!item.lookup) return false;
        if (b && branchName(item) !== b) return false;
        if (r && regionName(item) !== r) return false;
        return true;
      });
      if (candidates.length === 0) return null;
      return wlName(candidates[0]) || null;
    } catch {
      return null;
    }
  };

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    if (field === "workLocation") {
      if (typeof value === "object" && value !== null) {
        updatedData.workLocation =
          value.label || value.lookupname || value.name || "";
      }
    }
    if (field === "consentCorrespondence") {
      updatedData.consent = value;
    }
    // Uncheck NATA if addressLine1 is changed
    if (field === "addressLine1" && formData.nata) {
      updatedData.nata = false;
    }
    // Auto-check SMS, Email, Post, and App when consentCorrespondence is checked
    if (field === "consentCorrespondence" && value === true) {
      updatedData.consentSMS = true;
      updatedData.consentEmail = true;
      updatedData.consentPost = true;
      updatedData.consentApp = true;
    }
    // Auto-uncheck SMS, Email, Post, and App when consentCorrespondence is unchecked
    if (field === "consentCorrespondence" && value === false) {
      updatedData.consentSMS = false;
      updatedData.consentEmail = false;
      updatedData.consentPost = false;
      updatedData.consentApp = false;
    }
    // Update consentCorrespondence based on individual checkboxes
    if (
      ["consentSMS", "consentEmail", "consentPost", "consentApp"].includes(
        field,
      )
    ) {
      const allChecked =
        (field === "consentSMS" ? value : updatedData.consentSMS) &&
        (field === "consentEmail" ? value : updatedData.consentEmail) &&
        (field === "consentPost" ? value : updatedData.consentPost) &&
        (field === "consentApp" ? value : updatedData.consentApp);
      const anyChecked =
        (field === "consentSMS" ? value : updatedData.consentSMS) ||
        (field === "consentEmail" ? value : updatedData.consentEmail) ||
        (field === "consentPost" ? value : updatedData.consentPost) ||
        (field === "consentApp" ? value : updatedData.consentApp);

      if (allChecked) {
        updatedData.consentCorrespondence = true;
      } else if (!anyChecked) {
        updatedData.consentCorrespondence = false;
      }
    }
    // Handle marking member as deceased
    if (field === "isDeceased" && value === true) {
      updatedData.membershipStatus = "inactive";
      updatedData.dateCancelled = new Date();
      updatedData.cancellationReason = "Deceased";
      // Update parent component
      if (setIsDeceased) setIsDeceased(true);
    }
    // If unmarking as deceased, allow editing again and reset status
    if (field === "isDeceased" && value === false) {
      updatedData.membershipStatus = "";
      updatedData.dateCancelled = null;
      updatedData.cancellationReason = "";
      // Update parent component
      if (setIsDeceased) setIsDeceased(false);
    }
    if (field === "branch" || field === "region") {
      const nextBranch = field === "branch" ? value : updatedData.branch;
      const nextRegion = field === "region" ? value : updatedData.region;
      const resolved = resolveWorkLocationFromHierarchy(nextBranch, nextRegion);
      if (resolved) {
        updatedData.workLocation = resolved;
      }
    }
    if (field === "paymentType" && !isPayrollOrSalaryDeduction(value)) {
      updatedData.payrollNumber = "";
    }
    if (
      field === "membershipCategory" &&
      !isUndergraduateStudentMembershipCategory(value, categoryData)
    ) {
      updatedData.studyLocation = "";
      updatedData.discipline = "";
      updatedData.graduationDate = null;
    }
    setFormData(updatedData);
  };

  // Sync isDeceased prop with formData and apply deceased logic
  useEffect(() => {
    if (
      propIsDeceased !== undefined &&
      propIsDeceased !== formData.isDeceased
    ) {
      const updatedData = { ...formData, isDeceased: propIsDeceased };
      // Apply deceased logic when marking as deceased
      if (propIsDeceased === true) {
        updatedData.membershipStatus = "inactive";
        updatedData.dateCancelled = new Date();
        updatedData.cancellationReason = "Deceased";
      } else {
        // Reset when unmarking
        updatedData.membershipStatus = "";
        updatedData.dateCancelled = null;
        updatedData.cancellationReason = "";
      }
      setFormData(updatedData);
    }
  }, [propIsDeceased]);

  // Check if form should be read-only (either not in edit mode or member is deceased or resigned)
  const isFormReadOnly =
    !isEditMode ||
    formData.isDeceased ||
    formData.subscriptionStatus === "Resigned";

  const membershipCategorySelected = Boolean(
    String(formData.membershipCategory || "").trim(),
  );
  const membershipCategoryChanged =
    String(formData.membershipCategory || "").trim() !==
    String(initialMembershipCategory || "").trim();
  const subscriptionStartDateChanged =
    !initialSubscriptionStartDate ||
    !formData.startDate ||
    !isSameDayValue(formData.startDate, initialSubscriptionStartDate);
  const showMembershipCategoryStartDateWarning =
    isEditMode &&
    !isFormReadOnly &&
    membershipCategoryChanged &&
    !subscriptionStartDateChanged;

  const payrollDeductionPayment = useMemo(
    () => isPayrollOrSalaryDeduction(formData.paymentType),
    [formData.paymentType],
  );

  const undergradEducationalActive = useMemo(
    () =>
      isUndergraduateStudentMembershipCategory(
        formData.membershipCategory,
        categoryData,
      ),
    [formData.membershipCategory, categoryData],
  );

  const educationalSectionDisabled =
    isFormReadOnly || !undergradEducationalActive;

  // Calculate indeterminate state for main checkbox
  const isIndeterminate = () => {
    const checkedCount = [
      formData.consentSMS,
      formData.consentEmail,
      formData.consentPost,
      formData.consentApp,
    ].filter(Boolean).length;
    return checkedCount > 0 && checkedCount < 4;
  };

  const getSaveErrorMessage = (err) => {
    const p = err?.payload ?? err;
    if (typeof p === "string") return p;
    return (
      p?.message ||
      p?.error?.message ||
      (Array.isArray(p?.errors) ? p.errors.join(", ") : null) ||
      "Request failed"
    );
  };

  const handleCancelEdit = () => {
    if (setIsEditMode) setIsEditMode(false);
  };

  const handleSaveChanges = async () => {
    if (
      !isEditMode ||
      formData.isDeceased ||
      formData.subscriptionStatus === "Resigned"
    ) {
      return;
    }
    const sourceProfile = profileDetails || profileSearchData?.results?.[0];
    const profileId = sourceProfile?._id || sourceProfile?.id || profileIdParam;
    if (!profileId) {
      MyAlert("error", "Cannot save: missing profile id");
      return;
    }

    if (membershipCategorySelected) {
      const sd = formData.startDate;
      const startOk =
        sd && (dayjs.isDayjs(sd) ? sd.isValid() : dayjs(sd).isValid());
      if (!startOk) {
        MyAlert(
          "error",
          "Subscription start date is required when a membership category is selected.",
        );
        return;
      }
    }

    if (payrollDeductionPayment) {
      if (!String(formData.payrollNumber || "").trim()) {
        MyAlert(
          "error",
          "Payroll number is required when payment type is payroll or salary deduction.",
        );
        return;
      }
    }

    if (undergradEducationalActive) {
      if (!String(formData.studyLocation || "").trim()) {
        MyAlert(
          "error",
          "Study location is required for undergraduate student membership.",
        );
        return;
      }
      const gd = formData.graduationDate;
      const gradOk =
        gd && (dayjs.isDayjs(gd) ? gd.isValid() : dayjs(gd).isValid());
      if (!gradOk) {
        MyAlert(
          "error",
          "Graduation date is required for undergraduate student membership.",
        );
        return;
      }
      if (!String(formData.discipline || "").trim()) {
        MyAlert(
          "error",
          "Discipline is required for undergraduate student membership.",
        );
        return;
      }
    }

    setSaveLoading(true);
    try {
      const profileBody = formDataToProfilePutPayload(
        formData,
        profileDetails || sourceProfile,
      );
      await dispatch(
        updateProfileDetails({ profileId, body: profileBody }),
      ).unwrap();

      const subId = ProfileSubData?.data?.[0]?._id;
      if (subId) {
        const subBody = formDataToSubscriptionPutPayload(
          formData,
          ProfileSubData.data[0],
        );
        await dispatch(
          updateSubscriptionById({ subscriptionId: subId, body: subBody }),
        ).unwrap();
      }

      await dispatch(getProfileDetailsById(profileId)).unwrap();
      if (subscriptionIdParam) {
        await dispatch(getSubscriptionById(subscriptionIdParam)).unwrap();
      } else {
        await dispatch(
          getSubscriptionByProfileId({
            profileId,
            isCurrent: "true",
          }),
        ).unwrap();
      }

      MyAlert("success", "Profile updated successfully");
      if (setIsEditMode) setIsEditMode(false);
    } catch (err) {
      MyAlert("error", "Failed to save changes", getSaveErrorMessage(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveChangesRef = useRef(handleSaveChanges);
  handleSaveChangesRef.current = handleSaveChanges;

  useLayoutEffect(() => {
    const setExtras = membershipToolbar?.setMembershipTabBarExtra;
    if (!setExtras) return undefined;
    if (!isEditMode || isFormReadOnly) {
      setExtras(null);
      return undefined;
    }
    setExtras(
      <Button
        type="primary"
        style={membershipSaveButtonStyle}
        loading={saveLoading}
        onClick={() => handleSaveChangesRef.current()}
      >
        Save
      </Button>,
    );
    return () => setExtras(null);
  }, [membershipToolbar, isEditMode, isFormReadOnly, saveLoading]);

  const NursingSpecializationSelectOptn = [
    { label: "General Nursing", value: "generalNursing" },
    { label: "Public Health Nurse", value: "publicHealthNurse" },
    { label: "Mental Health Nurse", value: "mentalHealth" },
    { label: "Midwife", value: "midwife" },
    { label: "Sick Children's Nurse", value: "sickChildrenNurse" },
    {
      label: "Registered Nurse for Intellectual Disability",
      value: "intellectualDisability",
    },
  ];

  return (
    <div
      className="mt-2 pe-4 pb-4 mb-2 membership-form-container"
      style={{
        height: "calc(92vh - 120px - 4vh)",
        maxHeight: "calc(100vh - 120px - 4vh)",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        paddingRight: "12px",
        paddingBottom: isEditMode ? "300px" : "200px",
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Column 1: Personal Information */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Personal Information Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    margin: 0,
                    color: "#1a1a1a",
                  }}
                >
                  Personal Information
                </h3>
              </div>
              <CustomSelect
                label="Title"
                placeholder="Select a title"
                options={lookupData.titles}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Forename(s)"
                placeholder="Enter your forename(s)"
                value={formData.forename}
                onChange={(e) => handleChange("forename", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Surname"
                placeholder="Enter your surname"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyDatePicker
                label="Date of Birth"
                placeholder="mm/dd/yyyy"
                value={formData.dateOfBirth}
                onChange={(date) => handleChange("dateOfBirth", date)}
                disabled={isFormReadOnly}
                required={true}
              />
              <CustomSelect
                label="Gender"
                placeholder="Select your gender"
                options={
                  Array.isArray(genderOptions) && genderOptions.length > 0
                    ? genderOptions
                    : lookupData.genders
                }
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <CustomSelect
                label="Country of Primary Qualification"
                placeholder="Select a country"
                options={countriesOptions}
                value={formData.countryPrimaryQualification}
                onChange={(e) =>
                  handleChange("countryPrimaryQualification", e.target.value)
                }
                disabled={isFormReadOnly}
                required={true}
              />
            </Card>

            {/* Correspondence Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Correspondence Details
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Preferred Address <span className="required-star">*</span>
                </label>
                <Radio.Group
                  value={formData.preferredAddress}
                  onChange={(e) =>
                    handleChange("preferredAddress", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Home/Personal">Home/Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Search for your address"
                placeholder="Search address"
                value={formData.searchAddress}
                onChange={(e) => handleChange("searchAddress", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
                extra={
                  <Checkbox
                    checked={formData.nata}
                    onChange={(e) => handleChange("nata", e.target.checked)}
                    disabled={isFormReadOnly}
                  >
                    NATA
                  </Checkbox>
                }
              />
              <MyInput
                label="Address Line 2"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Town/City"
                value={formData.townCity}
                onChange={(e) => handleChange("townCity", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="County/State"
                value={formData.countyState}
                onChange={(e) => handleChange("countyState", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Eircode/Postcode"
                placeholder="Enter Eircode"
                value={formData.eircode}
                onChange={(e) => handleChange("eircode", e.target.value)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Country"
                placeholder="Select country"
                options={countriesOptions}
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
            </Card>

            {/* Contact Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Contact Details
              </h3>
              <MyInput
                label="Mobile Number"
                type="mobile"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Home / Work Tel Number"
                placeholder="Optional"
                value={formData.telephoneNumber}
                onChange={(e) =>
                  handleChange("telephoneNumber", e.target.value)
                }
                disabled={isFormReadOnly}
              />
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Preferred Email <span className="required-star">*</span>
                </label>
                <Radio.Group
                  value={formData.preferredEmail}
                  onChange={(e) =>
                    handleChange("preferredEmail", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Personal">Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Personal Email"
                value={formData.personalEmail}
                onChange={(e) => handleChange("personalEmail", e.target.value)}
                disabled={isFormReadOnly}
                required={formData.preferredEmail === "Personal"}
              />
              <MyInput
                label="Work Email"
                placeholder="Optional"
                value={formData.workEmail}
                onChange={(e) => handleChange("workEmail", e.target.value)}
                disabled={isFormReadOnly}
                required={formData.preferredEmail === "Work"}
              />
            </Card>

            {/* Third Party Consent Card */}
            <Card
              style={{
                marginBottom: "80px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Consent Management
              </h3>

              {/* INMO Consent Section */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "#1a1a1a",
                  }}
                >
                  INMO Consent
                </h4>
                <Checkbox
                  checked={formData.consent}
                  indeterminate={isIndeterminate()}
                  onChange={(e) =>
                    handleChange("consentCorrespondence", e.target.checked)
                  }
                  className={
                    isIndeterminate() ? "consent-checkbox-indeterminate" : ""
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                  disabled={isFormReadOnly}
                >
                  I consent to receive correspondence from INMO
                </Checkbox>
                <div
                  style={{
                    marginLeft: "24px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={formData.consentSMS}
                    onChange={(e) =>
                      handleChange("consentSMS", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    SMS
                  </Checkbox>
                  <Checkbox
                    checked={formData.consentEmail}
                    onChange={(e) =>
                      handleChange("consentEmail", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    Email
                  </Checkbox>
                  <Checkbox
                    checked={formData.consentPost}
                    onChange={(e) =>
                      handleChange("consentPost", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    Post
                  </Checkbox>
                  <Checkbox
                    checked={formData.consentApp}
                    onChange={(e) =>
                      handleChange("consentApp", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    App
                  </Checkbox>
                </div>
              </div>

              {/* Line Separator */}
              <div
                style={{
                  borderTop: "1px solid #e8e8e8",
                  marginTop: "24px",
                  marginBottom: "24px",
                }}
              ></div>

              {/* Additional Service and Terms Section */}
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "#1a1a1a",
                  }}
                >
                  Additional Service and Terms
                </h4>
                <Checkbox
                  checked={formData.valueAddedServices}
                  onChange={(e) =>
                    handleChange("valueAddedServices", e.target.checked)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  disabled={isFormReadOnly}
                >
                  I consent to being contacted by INMO partners about exclusive
                  member offers.
                </Checkbox>
              </div>
            </Card>
          </div>
        </Col>

        {/* Column 2: Professional Details */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Employment Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Employment Details
              </h3>
              <CustomSelect
                label="Work Location"
                placeholder="Select Location..."
                options={workLocationOptions}
                value={formData.workLocation}
                onChange={(e) => handleChange("workLocation", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Other Work Location"
                placeholder="Enabled if 'Other' is selected"
                disabled={isFormReadOnly || formData.workLocation !== "Other"}
                value={formData.otherWorkLocation}
                onChange={(e) =>
                  handleChange("otherWorkLocation", e.target.value)
                }
                required={formData.workLocation === "Other"}
              />
              <CustomSelect
                label="Branch"
                placeholder="Select Branch..."
                options={branchOptions}
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Region"
                placeholder="Select Region..."
                options={regionOptions}
                value={formData.region}
                onChange={(e) => handleChange("region", e.target.value)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Grade"
                placeholder="Select Grade..."
                options={gradeOptions}
                value={formData.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Other Grade"
                placeholder="Enabled if 'Other' is selected"
                disabled={isFormReadOnly || formData.grade !== "Other"}
                value={formData.otherGrade}
                onChange={(e) => handleChange("otherGrade", e.target.value)}
                required={formData.grade === "Other"}
              />
            </Card>

            {/* Educational Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Educational Details
              </h3>
              <CustomSelect
                label="Study Location"
                placeholder="Select Study Location..."
                options={lookupData.studyLocations}
                value={formData.studyLocation}
                onChange={(e) => handleChange("studyLocation", e.target.value)}
                disabled={educationalSectionDisabled}
                required={undergradEducationalActive && !isFormReadOnly}
              />
              <MyDatePicker
                label="Start Date"
                placeholder="Select start date (Optional)"
                value={formData.startDate}
                onChange={(date) => handleChange("startDate", date)}
                disabled={educationalSectionDisabled}
              />
              <MyDatePicker
                label="Graduation Date"
                placeholder="Select graduation date"
                value={formData.graduationDate}
                onChange={(date) => handleChange("graduationDate", date)}
                disabled={educationalSectionDisabled}
                required={undergradEducationalActive && !isFormReadOnly}
              />
              <CustomSelect
                label="Discipline"
                placeholder="Select Discipline..."
                options={lookupData.disciplines}
                value={formData.discipline}
                onChange={(e) => handleChange("discipline", e.target.value)}
                disabled={educationalSectionDisabled}
                required={undergradEducationalActive && !isFormReadOnly}
              />
            </Card>

            {/* Nursing Registration & Specialization Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Nursing Registration & Specialization
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Are you currently on a nursing adaptation program?
                </label>
                <Radio.Group
                  value={formData.nursingProgramme}
                  onChange={(e) =>
                    handleChange("nursingProgramme", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="NMBI No. / An Bord Altranais Number"
                placeholder="Enabled if adaptation is 'Yes'"
                disabled={isFormReadOnly || formData.nursingProgramme !== "Yes"}
                value={formData.nmbiNumber}
                onChange={(e) => handleChange("nmbiNumber", e.target.value)}
              />
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label mb-1">
                  Primary Nurse Type <span className="text-danger">*</span>
                </label>

                <Radio.Group
                  name="nursingSpecialization"
                  value={formData.nursingSpecialization}
                  onChange={(e) =>
                    handleChange("nursingSpecialization", e.target.value)
                  }
                  disabled={isFormReadOnly}
                  className="w-100"
                >
                  <Row gutter={[16, 8]}>
                    {NursingSpecializationSelectOptn.map((option) => (
                      <Col key={option.value} xs={24} sm={12}>
                        <Radio
                          value={option.value}
                          style={{
                            whiteSpace: "normal",
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            color: "#212529",
                          }}
                        >
                          {option.label}
                        </Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </div>
            </Card>

            {/* Section Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Section Details
              </h3>
              <CustomSelect
                label="Primary Section"
                placeholder="Select Primary Section"
                value={formData.primarySection}
                onChange={(e) => handleChange("primarySection", e.target.value)}
                options={sectionOptions}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Other"
                value={formData.otherPrimarySection}
                onChange={(e) =>
                  handleChange("otherPrimarySection", e.target.value)
                }
                disabled={isFormReadOnly}
                required={formData.primarySection === "Other"}
              />
              <CustomSelect
                label="Secondary Section (Optional)"
                placeholder="Select Secondary Section (Optional)"
                value={formData.secondarySection}
                onChange={(e) =>
                  handleChange("secondarySection", e.target.value)
                }
                options={secondarySectionOptions}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Other"
                value={formData.otherSecondarySection}
                onChange={(e) =>
                  handleChange("otherSecondarySection", e.target.value)
                }
                disabled={isFormReadOnly}
              />
            </Card>

            {/* Recruitment Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Recruitment Details
              </h3>
              <MyInput
                label="Recruited By"
                placeholder="Enter full name"
                value={formData.recruitedBy}
                onChange={(e) => handleChange("recruitedBy", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Membership Number"
                placeholder="Enter membership number"
                value={formData.recruitedByMembershipNo}
                onChange={(e) =>
                  handleChange("recruitedByMembershipNo", e.target.value)
                }
                disabled={isFormReadOnly}
              />
            </Card>
          </div>
        </Col>

        {/* Column 3: Finalize Profile */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Subscription Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Subscription Details
              </h3>

              <CustomSelect
                label="Membership Category"
                placeholder="Select Category..."
                options={categoryData}
                // isIDs={true}
                value={formData.membershipCategory}
                onChange={(e) =>
                  handleChange("membershipCategory", e.target.value)
                }
                disabled={isFormReadOnly}
                required={true}
              />
              {showMembershipCategoryStartDateWarning && (
                <div
                  style={{
                    backgroundColor: "#fff7e6",
                    border: "1px solid #ffd591",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    marginBottom: "12px",
                    color: "#ad6800",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  Membership Category has changed. Do you want to update the
                  Subscription Start Date?
                </div>
              )}
              <div
                style={
                  showMembershipCategoryStartDateWarning
                    ? {
                        border: "2px solid #faad14",
                        borderRadius: "8px",
                        padding: "8px",
                        backgroundColor: "#fffbe6",
                        marginBottom: "8px",
                      }
                    : undefined
                }
              >
                <MyDatePicker
                  label="Subscription Start Date"
                  placeholder="Select start date"
                  value={formData.startDate}
                  onChange={(date) => handleChange("startDate", date)}
                  disabled={isFormReadOnly}
                  required={membershipCategorySelected}
                />
              </div>
              <MyDatePicker
                label="Subscription End Date"
                placeholder="Select end date"
                value={formData.endDate}
                onChange={(date) => handleChange("endDate", date)}
                disabled
              />
              <MyDatePicker
                label="Renewal Date"
                placeholder="Select renewal date"
                value={formData.renewalDate}
                onChange={(date) => handleChange("renewalDate", date)}
                disabled
              />
              <CustomSelect
                label="Membership Movement"
                placeholder="Select Movement..."
                options={[
                  { value: "NewJoin", label: "NewJoin" },
                  { value: "Renewal", label: "Renewal" },
                  { value: "Reinstatement", label: "Reinstatement" },
                  { value: "Transfer", label: "Transfer" },
                  { value: "Conversion", label: "Conversion" },
                ]}
                value={formData.membershipMovement}
                onChange={(e) =>
                  handleChange("membershipMovement", e.target.value)
                }
                disabled
              />
              {/* <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                <Checkbox
                  checked={formData.isCurrent}
                  disabled={true}
                >
                  Current Subscription
                </Checkbox>
              </div> */}
              <MyDatePicker
                label="Cancellation / Resignation Date"
                placeholder="Select cancellation date"
                value={formData.dateCancelled}
                onChange={(date) => handleChange("dateCancelled", date)}
                disabled={true}
              />
              <MyInput
                label="Cancellation / Resignation Reason"
                placeholder="Enter cancellation reason"
                value={formData.cancellationReason}
                onChange={(e) =>
                  handleChange("cancellationReason", e.target.value)
                }
                disabled={true}
              />
            </Card>

            {/* Payment Information Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Payment Information
              </h3>
              <CustomSelect
                label="Payment Type"
                placeholder="Select Payment Type"
                // options={[
                //   { value: "Salary Deduction", label: "Salary Deduction" },
                //   { value: "Credit Card", label: "Credit Card" },
                // ]}
                value={formData.paymentType}
                onChange={(e) => handleChange("paymentType", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
                isIDs={false}
                options={memoizedPaymentTypeOptions}
              />
              <MyInput
                label="Payroll No."
                placeholder="Enter Payroll No."
                value={formData.payrollNumber}
                onChange={(e) => handleChange("payrollNumber", e.target.value)}
                disabled={isFormReadOnly || !payrollDeductionPayment}
                required={payrollDeductionPayment && !isFormReadOnly}
              />
              <CustomSelect
                label="Payment Frequency"
                placeholder="Select Frequency"
                options={[
                  { value: "Monthly", label: "Monthly" },
                  { value: "Annually", label: "Annually" },
                  { value: "Quarterly", label: "Quarterly" },
                  { value: "Semi-Annually", label: "Semi-Annually" },
                ]}
                value={formData.paymentFrequency}
                onChange={(e) =>
                  handleChange("paymentFrequency", e.target.value)
                }
                disabled={isFormReadOnly}
              />
            </Card>

            {/* Reminders Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Reminders
              </h3>
              <MyDatePicker
                label="First Reminder"
                placeholder="Select first reminder date"
                value={formData.firstReminderDate}
                onChange={(date) => handleChange("firstReminderDate", date)}
                disabled={true}
              />
              <MyDatePicker
                label="Second Reminder"
                placeholder="Select second reminder date"
                value={formData.secondReminderDate}
                onChange={(date) => handleChange("secondReminderDate", date)}
                disabled={true}
              />
              <MyDatePicker
                label="Third Reminder"
                placeholder="Select third reminder date"
                value={formData.thirdReminderDate}
                onChange={(date) => handleChange("thirdReminderDate", date)}
                disabled={true}
              />
            </Card>

            {/* Retirement Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Retirement Details
              </h3>
              <MyDatePicker
                label="Retirement Date"
                value={formData.retiredDate}
                onChange={(date) => handleChange("retiredDate", date)}
                disabled={
                  isFormReadOnly ||
                  formData.membershipCategory !== "retired_associate"
                }
                required={formData.membershipCategory === "retired_associate"}
              />
              <MyInput
                label="Pension No."
                value={formData.pensionNumber}
                onChange={(e) => handleChange("pensionNumber", e.target.value)}
                disabled={
                  isFormReadOnly ||
                  formData.membershipCategory !== "retired_associate"
                }
                required={formData.membershipCategory === "retired_associate"}
              />
            </Card>

            {/* Additional Memberships Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Additional Memberships
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Are you a member of another Trade Union?
                </label>
                <Radio.Group
                  value={formData.memberOfOtherUnion}
                  onChange={(e) =>
                    handleChange("memberOfOtherUnion", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Which Union?"
                value={formData.otherUnionName}
                onChange={(e) => handleChange("otherUnionName", e.target.value)}
                disabled={isFormReadOnly}
              />
              <div style={{ marginTop: "16px" }}>
                <label className="my-input-label">
                  Have you previously been a member of an Irish trade union
                  income protection scheme?
                </label>
                <Radio.Group
                  value={formData.otherUnionScheme}
                  onChange={(e) =>
                    handleChange("otherUnionScheme", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
            </Card>

            {/* Corn Market Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              styles={{ body: { padding: "16px" } }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                CornMarket
              </h3>
              <Checkbox
                checked={formData.joinRewards}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // If Rewards is checked, uncheck the other two
                    handleChange("exclusiveDiscountsOffers", false);
                    handleChange("joinINMOIncomeProtection", false);
                  }
                  handleChange("joinRewards", isChecked);
                }}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={
                  !isEditMode ||
                  formData.exclusiveDiscountsOffers ||
                  formData.joinINMOIncomeProtection
                }
              >
                Rewards for INMO members
              </Checkbox>
              <Checkbox
                checked={formData.exclusiveDiscountsOffers}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // If this is checked, uncheck Rewards
                    handleChange("joinRewards", false);
                  }
                  handleChange("exclusiveDiscountsOffers", isChecked);
                }}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={isFormReadOnly || formData.joinRewards}
              >
                Exclusive Discounts and Offers
              </Checkbox>
              <Checkbox
                checked={formData.joinINMOIncomeProtection}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // If this is checked, uncheck Rewards
                    handleChange("joinRewards", false);
                  }
                  handleChange("joinINMOIncomeProtection", isChecked);
                }}
                style={{ display: "flex", alignItems: "center" }}
                disabled={isFormReadOnly || formData.joinRewards}
              >
                Income Protection and Consent
              </Checkbox>
            </Card>
          </div>
        </Col>
      </Row>
      {isEditMode && !isFormReadOnly && !membershipToolbar && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 16px",
            background: "#fff",
            borderTop: "1px solid #e8e8e8",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            zIndex: 20,
            marginTop: 16,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Button onClick={handleCancelEdit} disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            type="primary"
            style={membershipSaveButtonStyle}
            loading={saveLoading}
            onClick={handleSaveChanges}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default MembershipForm;
