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
  pickPrimarySubscription,
  profileDetailActiveSubscriptionArgs,
} from "../../features/subscription/profileSubscriptionSlice";
import {
  formDataToProfilePutPayload,
  formDataToSubscriptionPutPayload,
} from "../../utils/membershipProfileSaveMappers";
import { useMembershipTabToolbar } from "../../context/MembershipTabToolbarContext";
import {
  CRM_PAYMENT_FREQUENCY_OPTIONS,
  getDefaultPaymentFrequencyForPaymentMethod,
} from "../../constants/paymentFrequency";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import "../../styles/MembershipForm.css";

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

const normalizeLookupMatchKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

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
  isPayrollOrSalaryDeduction(option?.label) ||
  isPayrollOrSalaryDeduction(option?.value);

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

function resolveBranchRegionFromWorkLocation(
  selectedLookupIdOrLabel,
  workLocationOptions,
) {
  try {
    const storedLookups = localStorage.getItem("hierarchicalLookups");
    const hierarchicalLookups = storedLookups ? JSON.parse(storedLookups) : [];
    const labelKey = normalizeLookupMatchKey(selectedLookupIdOrLabel);

    let matchedOption = workLocationOptions?.find(
      (opt) => String(opt.key || opt.value) === String(selectedLookupIdOrLabel),
    );
    if (!matchedOption && labelKey) {
      matchedOption = workLocationOptions?.find((opt) =>
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

    if (!foundObject && !matchedOption) {
      return { branch: "", region: "" };
    }

    const isSimple = foundObject?.type === "workLocation";
    return {
      branch: isSimple
        ? foundObject?.branch?.name || ""
        : foundObject?.branch?.lookupname ||
          foundObject?.branch?.label ||
          "",
      region: isSimple
        ? foundObject?.branch?.region?.name ||
          foundObject?.region?.name ||
          ""
        : foundObject?.region?.lookupname ||
          foundObject?.region?.label ||
          "",
    };
  } catch {
    return { branch: "", region: "" };
  }
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

/** Membership category value may be product _id or display name from API. */
function isHonoraryMembershipCategory(selected, categoryOptions) {
  const sel = (selected || "").trim();
  if (!sel) return false;

  const opts = Array.isArray(categoryOptions) ? categoryOptions : [];
  const honOpt = opts.find((o) => {
    const lab = (o.label || "").toLowerCase();
    return lab === "honorary" || /\bhonorary\b/.test(lab);
  });
  if (honOpt) {
    if (honOpt.value === sel || honOpt.label === sel || honOpt.key === sel) {
      return true;
    }
  }

  const norm = sel.toLowerCase().replace(/\s+/g, "_");
  if (norm === "honorary") return true;

  const combined = sel.toLowerCase();
  return combined === "honorary" || /\bhonorary\b/.test(combined);
}

/** Membership category value may be product _id or display name from API. */
function isRetiredAssociateMembershipCategory(selected, categoryOptions) {
  const sel = (selected || "").trim();
  if (!sel) return false;

  const opts = Array.isArray(categoryOptions) ? categoryOptions : [];
  const retiredOpt = opts.find((o) => {
    const lab = (o.label || "").toLowerCase();
    return lab.includes("retired") && lab.includes("associate");
  });
  if (retiredOpt) {
    if (
      retiredOpt.value === sel ||
      retiredOpt.label === sel ||
      retiredOpt.key === sel
    ) {
      return true;
    }
  }

  const norm = sel.toLowerCase().replace(/\s+/g, "_");
  if (norm === "retired_associate") return true;

  const combined = sel.toLowerCase();
  return combined.includes("retired") && combined.includes("associate");
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

function hasRequiredText(value) {
  return String(value ?? "").trim() !== "";
}

function hasRequiredDate(value) {
  if (value == null || value === "") return false;
  const d = dayjs.isDayjs(value) ? value : dayjs(value);
  return d.isValid();
}

const MEMBERSHIP_FIELD_ERROR_STYLE = {
  border: "2px solid #ff4d4f",
  borderRadius: "6px",
  padding: "6px",
  backgroundColor: "#fff2f0",
  marginBottom: "6px",
};

function MembershipFormField({ field, fieldErrors, children }) {
  const hasError = !!fieldErrors[field];
  const child = React.Children.only(children);
  const content =
    React.isValidElement(child) &&
    typeof child.type !== "string" &&
    child.props?.hasError == null
      ? React.cloneElement(child, { hasError })
      : child;

  return (
    <div
      className="membership-form-field"
      data-membership-field={field}
      style={hasError ? MEMBERSHIP_FIELD_ERROR_STYLE : undefined}
    >
      {content}
    </div>
  );
}

function MembershipFormCard({ title, children, className = "" }) {
  return (
    <Card className={`membership-form-card ${className}`.trim()}>
      <h3 className="membership-form-card-header">{title}</h3>
      <div className="membership-form-card-body">{children}</div>
    </Card>
  );
}

function MembershipFormGrid({ children }) {
  return (
    <div className="membership-form-grid">
      {React.Children.map(children, (child) => {
        if (child == null) return null;
        if (React.isValidElement(child) && child.type === MembershipFormGridFull) {
          return child;
        }
        return <div className="membership-form-grid-cell">{child}</div>;
      })}
    </div>
  );
}

function MembershipFormGridFull({ children }) {
  return (
    <div className="membership-form-grid-cell membership-form-grid-full">
      {children}
    </div>
  );
}

function MembershipFormColumns({ children }) {
  return (
    <Row gutter={[16, 10]} className="membership-form-columns" align="top">
      {children}
    </Row>
  );
}

function MembershipFormCol({ children, isFirst = false }) {
  return (
    <Col
      span={8}
      className={`membership-form-col${isFirst ? " membership-form-col--first" : ""}`}
    >
      <div className="membership-form-column">{children}</div>
    </Col>
  );
}

function collectMembershipFormValidationErrors(formData, options = {}) {
  const {
    membershipCategorySelected,
    undergradEducationalActive,
    retiredAssociateActive,
    honoraryMembershipActive,
    showPaymentInformation,
    payrollDeductionPayment,
    workLocationAllowsSalaryDeduction,
  } = options;
  const labels = [];
  const fields = {};

  const addIssue = (field, label) => {
    fields[field] = true;
    if (!labels.includes(label)) labels.push(label);
  };
  const requireText = (value, field, label) => {
    if (!hasRequiredText(value)) addIssue(field, label);
  };
  const requireDate = (value, field, label) => {
    if (!hasRequiredDate(value)) addIssue(field, label);
  };

  requireText(formData.title, "title", "Title");
  requireText(formData.forename, "forename", "Forename(s)");
  requireText(formData.surname, "surname", "Surname");
  requireDate(formData.dateOfBirth, "dateOfBirth", "Date of Birth");
  requireText(formData.gender, "gender", "Gender");
  requireText(
    formData.countryPrimaryQualification,
    "countryPrimaryQualification",
    "Country of Primary Qualification",
  );

  if (!hasRequiredText(formData.preferredAddress)) {
    addIssue("preferredAddress", "Preferred Address");
  }
  requireText(formData.addressLine1, "addressLine1", "Address Line 1");
  requireText(formData.townCity, "townCity", "Town/City");
  requireText(formData.country, "country", "Country");

  requireText(formData.mobileNumber, "mobileNumber", "Mobile Number");
  if (!hasRequiredText(formData.preferredEmail)) {
    addIssue("preferredEmail", "Preferred Email");
  } else if (formData.preferredEmail === "Personal") {
    requireText(formData.personalEmail, "personalEmail", "Personal Email");
  } else if (formData.preferredEmail === "Work") {
    requireText(formData.workEmail, "workEmail", "Work Email");
  }

  requireText(formData.workLocation, "workLocation", "Work Location");
  if (formData.workLocation === "Other") {
    requireText(
      formData.otherWorkLocation,
      "otherWorkLocation",
      "Other Work Location",
    );
  }
  requireText(formData.grade, "grade", "Grade");
  if (formData.grade === "Other") {
    requireText(formData.otherGrade, "otherGrade", "Other Grade");
  }

  if (undergradEducationalActive) {
    requireText(formData.studyLocation, "studyLocation", "Study Location");
    requireDate(formData.graduationDate, "graduationDate", "Graduation Date");
    requireText(formData.discipline, "discipline", "Discipline");
  }

  if (formData.nursingProgramme === "Yes") {
    requireText(
      formData.nursingSpecialization,
      "nursingSpecialization",
      "Primary Nurse Type",
    );
  } else if (formData.nursingProgramme === "No") {
    requireText(
      formData.nmbiNumber,
      "nmbiNumber",
      "NMBI No. / An Bord Altranais Number",
    );
  }

  requireText(formData.primarySection, "primarySection", "Primary Section");
  if (formData.primarySection === "Other") {
    requireText(
      formData.otherPrimarySection,
      "otherPrimarySection",
      "Other Primary Section",
    );
  }

  requireText(
    formData.membershipCategory,
    "membershipCategory",
    "Membership Category",
  );
  if (membershipCategorySelected) {
    requireDate(formData.startDate, "startDate", "Start Date");
  }

  if (payrollDeductionPayment && showPaymentInformation) {
    if (!workLocationAllowsSalaryDeduction) {
      addIssue(
        "workLocation",
        formData.workLocation
          ? `Salary Deduction is not enabled for work location "${formData.workLocation}"`
          : "Work Location (required for Salary Deduction)",
      );
      addIssue("paymentType", "Payment Type");
    }
    requireText(formData.payrollNumber, "payrollNumber", "Payroll No.");
  }

  if (retiredAssociateActive) {
    requireDate(formData.retiredDate, "retiredDate", "Retirement Date");
    requireText(formData.pensionNumber, "pensionNumber", "Pension No.");
  }

  return { labels, fields };
}

function scrollToFirstMembershipFieldError(fields, containerSelector) {
  const firstField = Object.keys(fields)[0];
  if (!firstField) return;
  const el = document.querySelector(`[data-membership-field="${firstField}"]`);
  if (!el) return;
  const container = el.closest(containerSelector);
  if (container) {
    scrollElementWithinContainer(el, container);
  }
}

function scrollElementWithinContainer(
  element,
  container,
  { behavior = "smooth", padding = 24 } = {},
) {
  if (!element || !container) return;

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  if (elementRect.top < containerRect.top + padding) {
    container.scrollBy({
      top: elementRect.top - containerRect.top - padding,
      behavior,
    });
    return;
  }

  if (elementRect.bottom > containerRect.bottom - padding) {
    container.scrollBy({
      top: elementRect.bottom - containerRect.bottom + padding,
      behavior,
    });
  }
}

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
  const paymentTypeSectionRef = useRef(null);
  const shouldFocusPaymentTypeRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState({});
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
    lookups: lookupsRaw,
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
    const subscription = pickPrimarySubscription(ProfileSubData?.data || []);
    if (subscription) {
      return {
        subscriptionStatus: subscription.subscriptionStatus || "",
        paymentType: subscription.paymentType || "",
        payrollNo: subscription.payrollNo || "",
        paymentFrequency: subscription.paymentFrequency || "",
        subscriptionYear: subscription.subscriptionYear || "",
        isCurrent: subscription.isCurrent === true,
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

  useEffect(() => {
    // FIXED: Safely access profileSearchData results
    const searchAoiRes = profileSearchData?.results?.[0] || null;
    // Choose source dynamically
    const source = profileDetails || searchAoiRes;
    if (!source) return;

    const subDoc = pickPrimarySubscription(ProfileSubData?.data || []);

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

  const workLocationAllowsSalaryDeduction = useMemo(
    () =>
      resolveWorkLocationProcessSalaryDeduction(
        formData.workLocation,
        workLocationOptions,
        lookupsRaw,
      ),
    [formData.workLocation, workLocationOptions, lookupsRaw],
  );

  const filteredPaymentTypeOptions = useMemo(() => {
    const options = paymentTypeOptions || [];
    if (workLocationAllowsSalaryDeduction) return options;
    return options.filter((opt) => !isSalaryDeductionPaymentOption(opt));
  }, [paymentTypeOptions, workLocationAllowsSalaryDeduction]);

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
      const allowsSalaryDeduction = resolveWorkLocationProcessSalaryDeduction(
        updatedData.workLocation,
        workLocationOptions,
        lookupsRaw,
        typeof value === "object" && value !== null
          ? value.key || value.value || value._id
          : null,
      );
      if (
        !allowsSalaryDeduction &&
        isPayrollOrSalaryDeduction(updatedData.paymentType)
      ) {
        updatedData.paymentType = "";
        updatedData.payrollNumber = "";
      }
      if (
        !allowsSalaryDeduction &&
        String(updatedData.workLocation || "").trim()
      ) {
        shouldFocusPaymentTypeRef.current = true;
      }

      const workLocationLabel = String(updatedData.workLocation || "").trim();
      if (workLocationLabel && workLocationLabel !== "Other") {
        const { branch, region } = resolveBranchRegionFromWorkLocation(
          typeof value === "object" && value !== null
            ? value.key || value.value || workLocationLabel
            : value,
          workLocationOptions,
        );
        updatedData.branch = branch;
        updatedData.region = region;
      } else if (!workLocationLabel) {
        updatedData.branch = "";
        updatedData.region = "";
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
      if (String(updatedData.workLocation || "").trim() !== "Other") {
      const resolved = resolveWorkLocationFromHierarchy(nextBranch, nextRegion);
      if (resolved) {
        updatedData.workLocation = resolved;
        const allowsSalaryDeduction = resolveWorkLocationProcessSalaryDeduction(
          resolved,
          workLocationOptions,
          lookupsRaw,
        );
        if (
          !allowsSalaryDeduction &&
          isPayrollOrSalaryDeduction(updatedData.paymentType)
        ) {
          updatedData.paymentType = "";
          updatedData.payrollNumber = "";
        }
        if (!allowsSalaryDeduction) {
          shouldFocusPaymentTypeRef.current = true;
        }
      }
      }
    }
    if (field === "nursingProgramme" && value !== "Yes") {
      updatedData.nursingSpecialization = "";
    }
    if (field === "memberOfOtherUnion" && value !== "Yes") {
      updatedData.otherUnionName = "";
    }
    if (field === "paymentType") {
      const defaultFrequency =
        getDefaultPaymentFrequencyForPaymentMethod(value);
      if (defaultFrequency) {
        updatedData.paymentFrequency = defaultFrequency;
      } else if (!String(updatedData.paymentFrequency || "").trim()) {
        updatedData.paymentFrequency = "Monthly";
      }
      if (!isPayrollOrSalaryDeduction(value)) {
        updatedData.payrollNumber = "";
      }
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
    setFieldErrors((prev) => {
      const next = { ...prev };
      let changed = false;
      if (prev[field]) {
        delete next[field];
        changed = true;
      }
      if (field === "nursingProgramme") {
        if (value === "Yes" && next.nmbiNumber) {
          delete next.nmbiNumber;
          changed = true;
        }
        if (value !== "Yes" && next.nursingSpecialization) {
          delete next.nursingSpecialization;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
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

  const showPaymentTypeSalaryDeductionNotice =
    !isFormReadOnly &&
    Boolean(String(formData.workLocation || "").trim()) &&
    !workLocationAllowsSalaryDeduction;

  const paymentTypeHighlightStyle = showPaymentTypeSalaryDeductionNotice
    ? {
        border: "2px solid #faad14",
        borderRadius: "8px",
        padding: "8px",
        backgroundColor: "#fffbe6",
        marginBottom: "8px",
      }
    : undefined;

  useEffect(() => {
    if (
      !showPaymentTypeSalaryDeductionNotice ||
      !shouldFocusPaymentTypeRef.current
    ) {
      return;
    }
    shouldFocusPaymentTypeRef.current = false;

    const section = paymentTypeSectionRef.current;
    if (!section) return;

    const scrollContainer = section.closest(".membership-form-container");
    if (scrollContainer) {
      scrollElementWithinContainer(section, scrollContainer);
    }

    requestAnimationFrame(() => {
      const select = section.querySelector("select:not([disabled])");
      select?.focus({ preventScroll: true });
    });
  }, [showPaymentTypeSalaryDeductionNotice, formData.workLocation]);

  const undergradEducationalActive = useMemo(
    () =>
      isUndergraduateStudentMembershipCategory(
        formData.membershipCategory,
        categoryData,
      ),
    [formData.membershipCategory, categoryData],
  );

  const honoraryMembershipActive = useMemo(
    () =>
      isHonoraryMembershipCategory(
        formData.membershipCategory,
        categoryData,
      ),
    [formData.membershipCategory, categoryData],
  );

  const retiredAssociateActive = useMemo(
    () =>
      isRetiredAssociateMembershipCategory(
        formData.membershipCategory,
        categoryData,
      ),
    [formData.membershipCategory, categoryData],
  );

  const showPaymentInformation =
    !honoraryMembershipActive && !undergradEducationalActive;

  const showRemindersCancellations =
    !undergradEducationalActive && !honoraryMembershipActive;

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
    if (p?.error?.message) return p.error.message;
    if (p?.message) return p.message;
    if (Array.isArray(p?.errors)) return p.errors.join(", ");
    if (Array.isArray(p?.error?.details)) {
      return p.error.details.map((d) => d?.message || d).join(", ");
    }
    if (typeof p?.error === "string") return p.error;
    return "Unable to save. Please check required fields and try again.";
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

    const validation = collectMembershipFormValidationErrors(formData, {
      membershipCategorySelected,
      undergradEducationalActive,
      retiredAssociateActive,
      honoraryMembershipActive,
      showPaymentInformation,
      payrollDeductionPayment,
      workLocationAllowsSalaryDeduction,
    });
    if (validation.labels.length > 0) {
      setFieldErrors(validation.fields);
      scrollToFirstMembershipFieldError(
        validation.fields,
        ".membership-form-container",
      );
      MyAlert(
        "error",
        "Please complete the following required fields:",
        validation.labels.map((label) => `• ${label}`).join("\n"),
      );
      return;
    }

    setFieldErrors({});
    setSaveLoading(true);
    try {
      const profileBody = formDataToProfilePutPayload(
        formData,
        profileDetails || sourceProfile,
      );
      await dispatch(
        updateProfileDetails({ profileId, body: profileBody }),
      ).unwrap();

      const primarySub = pickPrimarySubscription(ProfileSubData?.data || []);
      const subId = primarySub?._id;
      if (subId) {
        const subBody = formDataToSubscriptionPutPayload(
          formData,
          primarySub,
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
            ...profileDetailActiveSubscriptionArgs,
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

  const cancellationReasonOptions = [
    { key: "voluntary", label: "Voluntary Resignation" },
    { key: "retirement", label: "Retirement" },
    { key: "relocation", label: "Relocation" },
    { key: "financial", label: "Financial Reasons" },
    { key: "dissatisfaction", label: "Dissatisfaction with Services" },
    { key: "other", label: "Other" },
    { key: "deceased", label: "Deceased" },
  ];

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
      className="mt-2 pe-4 pb-4 mb-2 membership-form-container membership-form compact"
      style={{
        height: "calc(92vh - 120px - 4vh)",
        maxHeight: "calc(100vh - 120px - 4vh)",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        paddingRight: "12px",
        paddingBottom: isEditMode ? "120px" : "80px",
      }}
    >
      <MembershipFormColumns>
          <MembershipFormCol isFirst>
            <MembershipFormCard title="Personal Information">
              <MembershipFormGrid>
                <MembershipFormGridFull>
                  <MembershipFormField field="title" fieldErrors={fieldErrors}>
                    <CustomSelect
                      label="Title"
                      placeholder="Select a title"
                      options={lookupData.titles}
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      disabled={isFormReadOnly}
                      required={true}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                <MembershipFormField field="forename" fieldErrors={fieldErrors}>
                  <MyInput
                    label="Forename(s)"
                    placeholder="Enter your forename(s)"
                    value={formData.forename}
                    onChange={(e) => handleChange("forename", e.target.value)}
                    disabled={isFormReadOnly}
                    required={true}
                  />
                </MembershipFormField>
                <MembershipFormField field="surname" fieldErrors={fieldErrors}>
                  <MyInput
                    label="Surname"
                    placeholder="Enter your surname"
                    value={formData.surname}
                    onChange={(e) => handleChange("surname", e.target.value)}
                    disabled={isFormReadOnly}
                    required={true}
                  />
                </MembershipFormField>
                <MembershipFormField field="dateOfBirth" fieldErrors={fieldErrors}>
                  <MyDatePicker
                    label="Date of Birth"
                    placeholder="mm/dd/yyyy"
                    value={formData.dateOfBirth}
                    onChange={(date) => handleChange("dateOfBirth", date)}
                    disabled={isFormReadOnly}
                    required={true}
                  />
                </MembershipFormField>
                <MembershipFormField field="gender" fieldErrors={fieldErrors}>
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
                </MembershipFormField>
                <MembershipFormGridFull>
                  <MembershipFormField
                    field="countryPrimaryQualification"
                    fieldErrors={fieldErrors}
                  >
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
                  </MembershipFormField>
                </MembershipFormGridFull>
              </MembershipFormGrid>
            </MembershipFormCard>

            <MembershipFormCard title="Correspondence Details">
              <MembershipFormField
                field="preferredAddress"
                fieldErrors={fieldErrors}
                radio
              >
                <div className="membership-form-radio-block membership-form-radio-inline">
                  <label
                    className={`my-input-label ${fieldErrors.preferredAddress ? "error" : ""}`}
                  >
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
              </MembershipFormField>
              <MyInput
                label="Search for your address"
                placeholder="Search address"
                value={formData.searchAddress}
                onChange={(e) => handleChange("searchAddress", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MembershipFormGrid>
                <MembershipFormField field="addressLine1" fieldErrors={fieldErrors}>
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
                </MembershipFormField>
                <MyInput
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  disabled={isFormReadOnly}
                />
              </MembershipFormGrid>
              <MembershipFormGrid>
                <MembershipFormField field="townCity" fieldErrors={fieldErrors}>
                  <MyInput
                    label="Town/City"
                    value={formData.townCity}
                    onChange={(e) => handleChange("townCity", e.target.value)}
                    disabled={isFormReadOnly}
                    required={true}
                  />
                </MembershipFormField>
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
                <MembershipFormField field="country" fieldErrors={fieldErrors}>
                  <CustomSelect
                    label="Country"
                    placeholder="Select country"
                    options={countriesOptions}
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    disabled={isFormReadOnly}
                    required={true}
                  />
                </MembershipFormField>
              </MembershipFormGrid>
            </MembershipFormCard>

            <MembershipFormCard title="Contact Details">
              <MembershipFormGrid>
                <MembershipFormGridFull>
                  <MembershipFormField field="mobileNumber" fieldErrors={fieldErrors}>
                    <MyInput
                      label="Mobile Number"
                      type="mobile"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange("mobileNumber", e.target.value)}
                      disabled={isFormReadOnly}
                      required={true}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                <MembershipFormGridFull>
                  <MyInput
                    label="Home / Work Tel Number"
                    placeholder="Optional"
                    value={formData.telephoneNumber}
                    onChange={(e) =>
                      handleChange("telephoneNumber", e.target.value)
                    }
                    disabled={isFormReadOnly}
                  />
                </MembershipFormGridFull>
              </MembershipFormGrid>
              <MembershipFormField
                field="preferredEmail"
                fieldErrors={fieldErrors}
                radio
              >
                <div className="membership-form-radio-block membership-form-radio-inline">
                  <label
                    className={`my-input-label ${fieldErrors.preferredEmail ? "error" : ""}`}
                  >
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
              </MembershipFormField>
              <MembershipFormGrid>
                <MembershipFormField field="personalEmail" fieldErrors={fieldErrors}>
                  <MyInput
                    label="Personal Email"
                    value={formData.personalEmail}
                    onChange={(e) =>
                      handleChange("personalEmail", e.target.value)
                    }
                    disabled={isFormReadOnly}
                    required={formData.preferredEmail === "Personal"}
                  />
                </MembershipFormField>
                <MembershipFormField field="workEmail" fieldErrors={fieldErrors}>
                  <MyInput
                    label="Work Email"
                    placeholder="Optional"
                    value={formData.workEmail}
                    onChange={(e) => handleChange("workEmail", e.target.value)}
                    disabled={isFormReadOnly}
                    required={formData.preferredEmail === "Work"}
                  />
                </MembershipFormField>
              </MembershipFormGrid>
            </MembershipFormCard>

            <MembershipFormCard title="Consent Management">
              <div className="membership-form-consent-section">
                <h4 className="membership-form-subsection-title">INMO Consent</h4>
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
                    marginBottom: "8px",
                  }}
                  disabled={isFormReadOnly}
                >
                  I consent to receive correspondence from INMO
                </Checkbox>
                <div className="membership-form-consent-options">
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

              <div className="membership-form-separator" />

              <div>
                <h4 className="membership-form-subsection-title">
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
            </MembershipFormCard>
          </MembershipFormCol>
          <MembershipFormCol>
            <MembershipFormCard title="Employment Details">
              <MembershipFormGrid>
                <MembershipFormGridFull>
                  <MembershipFormField field="workLocation" fieldErrors={fieldErrors}>
                    <CustomSelect
                      label="Work Location"
                      placeholder="Select Location..."
                      options={workLocationOptions}
                      value={formData.workLocation}
                      onChange={(e) => handleChange("workLocation", e.target.value)}
                      disabled={isFormReadOnly}
                      required={true}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                <CustomSelect
                  label="Branch"
                  placeholder="Select Branch..."
                  options={branchOptions}
                  value={formData.branch}
                  onChange={(e) => handleChange("branch", e.target.value)}
                  disabled={
                    isFormReadOnly || formData.workLocation !== "Other"
                  }
                />
                <CustomSelect
                  label="Region"
                  placeholder="Select Region..."
                  options={regionOptions}
                  value={formData.region}
                  onChange={(e) => handleChange("region", e.target.value)}
                  disabled={
                    isFormReadOnly || formData.workLocation !== "Other"
                  }
                />
                <MembershipFormGridFull>
                  <MembershipFormField field="grade" fieldErrors={fieldErrors}>
                    <CustomSelect
                      label="Grade"
                      placeholder="Select Grade..."
                      options={gradeOptions}
                      value={formData.grade}
                      onChange={(e) => handleChange("grade", e.target.value)}
                      disabled={isFormReadOnly}
                      required={true}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                <MembershipFormField
                  field="otherWorkLocation"
                  fieldErrors={fieldErrors}
                >
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
                </MembershipFormField>
                <MembershipFormField field="otherGrade" fieldErrors={fieldErrors}>
                  <MyInput
                    label="Other Grade"
                    placeholder="Enabled if 'Other' is selected"
                    disabled={isFormReadOnly || formData.grade !== "Other"}
                    value={formData.otherGrade}
                    onChange={(e) => handleChange("otherGrade", e.target.value)}
                    required={formData.grade === "Other"}
                  />
                </MembershipFormField>
              </MembershipFormGrid>
            </MembershipFormCard>

            <MembershipFormCard title="Section Details">
              <MembershipFormGrid>
                <MembershipFormGridFull>
                  <MembershipFormField field="primarySection" fieldErrors={fieldErrors}>
                    <CustomSelect
                      label="Primary Section"
                      placeholder="Select Primary Section"
                      value={formData.primarySection}
                      onChange={(e) =>
                        handleChange("primarySection", e.target.value)
                      }
                      options={sectionOptions}
                      disabled={isFormReadOnly}
                      required={true}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                <MembershipFormGridFull>
                  <MembershipFormField
                    field="otherPrimarySection"
                    fieldErrors={fieldErrors}
                  >
                    <MyInput
                      label="Other Primary Section"
                      value={formData.otherPrimarySection}
                      onChange={(e) =>
                        handleChange("otherPrimarySection", e.target.value)
                      }
                      disabled={isFormReadOnly}
                      required={formData.primarySection === "Other"}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                <MembershipFormGridFull>
                  <CustomSelect
                    label="Secondary Section"
                    placeholder="Select Secondary Section (Optional)"
                    value={formData.secondarySection}
                    onChange={(e) =>
                      handleChange("secondarySection", e.target.value)
                    }
                    options={secondarySectionOptions}
                    disabled={isFormReadOnly}
                  />
                </MembershipFormGridFull>
                <MembershipFormGridFull>
                  <MyInput
                    label="Other Secondary Section"
                    value={formData.otherSecondarySection}
                    onChange={(e) =>
                      handleChange("otherSecondarySection", e.target.value)
                    }
                    disabled={isFormReadOnly}
                  />
                </MembershipFormGridFull>
              </MembershipFormGrid>
            </MembershipFormCard>

            <MembershipFormCard title="Nursing Registration & Specialization">
              <div className="membership-form-radio-block membership-form-radio-inline">
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
              <MembershipFormField field="nmbiNumber" fieldErrors={fieldErrors}>
                <MyInput
                  label="NMBI No. / An Bord Altranais Number"
                  placeholder={
                    formData.nursingProgramme === "No"
                      ? "Enter your NMBI number"
                      : "Optional during adaptation programme"
                  }
                  disabled={isFormReadOnly}
                  value={formData.nmbiNumber}
                  onChange={(e) => handleChange("nmbiNumber", e.target.value)}
                  required={
                    !isFormReadOnly && formData.nursingProgramme === "No"
                  }
                />
              </MembershipFormField>
              <MembershipFormField
                field="nursingSpecialization"
                fieldErrors={fieldErrors}
                radio
              >
                <div className="membership-form-radio-block">
                  <label
                    className={`my-input-label mb-1 ${fieldErrors.nursingSpecialization ? "error" : ""}`}
                  >
                    Primary Nurse Type
                    {formData.nursingProgramme === "Yes" ? (
                      <span className="text-danger"> *</span>
                    ) : null}
                  </label>

                  <Radio.Group
                    name="nursingSpecialization"
                    value={formData.nursingSpecialization}
                    onChange={(e) =>
                      handleChange("nursingSpecialization", e.target.value)
                    }
                    disabled={
                      isFormReadOnly || formData.nursingProgramme !== "Yes"
                    }
                    className="w-100"
                  >
                    <Row gutter={[12, 4]}>
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
              </MembershipFormField>
            </MembershipFormCard>

            <MembershipFormCard
              title="Recruitment Details"
              className="membership-form-card--last"
            >
              <MembershipFormGrid>
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
              </MembershipFormGrid>
            </MembershipFormCard>
          </MembershipFormCol>
          <MembershipFormCol>
            <MembershipFormCard title="Subscription Details">
              <MembershipFormGrid>
                <MembershipFormGridFull>
                  <MembershipFormField
                    field="membershipCategory"
                    fieldErrors={fieldErrors}
                  >
                    <CustomSelect
                      label="Membership Category"
                      placeholder="Select Category..."
                      options={categoryData}
                      value={formData.membershipCategory}
                      onChange={(e) =>
                        handleChange("membershipCategory", e.target.value)
                      }
                      disabled={isFormReadOnly}
                      required={true}
                    />
                  </MembershipFormField>
                </MembershipFormGridFull>
                {showMembershipCategoryStartDateWarning && (
                  <MembershipFormGridFull>
                    <div className="membership-form-notice">
                      Membership Category has changed. Do you want to update the
                      Start Date?
                    </div>
                  </MembershipFormGridFull>
                )}
                <MembershipFormField field="startDate" fieldErrors={fieldErrors}>
                  <div
                    className={
                      showMembershipCategoryStartDateWarning &&
                      !fieldErrors.startDate
                        ? "membership-form-warning-wrap"
                        : undefined
                    }
                  >
                    <MyDatePicker
                      label="Start Date"
                      placeholder="Select start date"
                      value={formData.startDate}
                      onChange={(date) => handleChange("startDate", date)}
                      disabled={isFormReadOnly}
                      required={membershipCategorySelected}
                    />
                  </div>
                </MembershipFormField>
                <MyDatePicker
                  label="End Date"
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
                    { value: "NewJoin", label: "New" },
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
              </MembershipFormGrid>
            </MembershipFormCard>

            {undergradEducationalActive && (
              <MembershipFormCard title="Educational Details">
                <MembershipFormGrid>
                  <MembershipFormGridFull>
                    <MembershipFormField field="studyLocation" fieldErrors={fieldErrors}>
                      <CustomSelect
                        label="Study Location"
                        placeholder="Select Study Location..."
                        options={lookupData.studyLocations}
                        value={formData.studyLocation}
                        onChange={(e) =>
                          handleChange("studyLocation", e.target.value)
                        }
                        disabled={educationalSectionDisabled}
                        required={undergradEducationalActive && !isFormReadOnly}
                      />
                    </MembershipFormField>
                  </MembershipFormGridFull>
                  <MyDatePicker
                    label="Start Date"
                    placeholder="Select start date (Optional)"
                    value={formData.startDate}
                    onChange={(date) => handleChange("startDate", date)}
                    disabled={educationalSectionDisabled}
                  />
                  <MembershipFormField
                    field="graduationDate"
                    fieldErrors={fieldErrors}
                  >
                    <MyDatePicker
                      label="Graduation Date"
                      placeholder="Select graduation date"
                      value={formData.graduationDate}
                      onChange={(date) => handleChange("graduationDate", date)}
                      disabled={educationalSectionDisabled}
                      required={undergradEducationalActive && !isFormReadOnly}
                    />
                  </MembershipFormField>
                  <MembershipFormGridFull>
                    <MembershipFormField field="discipline" fieldErrors={fieldErrors}>
                      <CustomSelect
                        label="Discipline"
                        placeholder="Select Discipline..."
                        options={lookupData.disciplines}
                        value={formData.discipline}
                        onChange={(e) => handleChange("discipline", e.target.value)}
                        disabled={educationalSectionDisabled}
                        required={undergradEducationalActive && !isFormReadOnly}
                      />
                    </MembershipFormField>
                  </MembershipFormGridFull>
                </MembershipFormGrid>
              </MembershipFormCard>
            )}

            {retiredAssociateActive && (
              <MembershipFormCard title="Retirement Details">
                <MembershipFormGrid>
                  <MembershipFormField field="retiredDate" fieldErrors={fieldErrors}>
                    <MyDatePicker
                      label="Retirement Date"
                      value={formData.retiredDate}
                      onChange={(date) => handleChange("retiredDate", date)}
                      disabled={isFormReadOnly}
                      required={!isFormReadOnly}
                    />
                  </MembershipFormField>
                  <MembershipFormField field="pensionNumber" fieldErrors={fieldErrors}>
                    <MyInput
                      label="Pension No."
                      value={formData.pensionNumber}
                      onChange={(e) =>
                        handleChange("pensionNumber", e.target.value)
                      }
                      disabled={isFormReadOnly}
                      required={!isFormReadOnly}
                    />
                  </MembershipFormField>
                </MembershipFormGrid>
              </MembershipFormCard>
            )}

            {showPaymentInformation && (
              <MembershipFormCard title="Payment Information">
                <div ref={paymentTypeSectionRef}>
                  {showPaymentTypeSalaryDeductionNotice && (
                    <div className="membership-form-notice">
                      Salary Deduction is not available for work location &quot;
                      {formData.workLocation}&quot;. Please choose another
                      payment method.
                    </div>
                  )}
                  <MembershipFormField field="paymentType" fieldErrors={fieldErrors}>
                    <CustomSelect
                      label="Payment Type"
                      placeholder="Select Payment Type"
                      value={formData.paymentType}
                      onChange={(e) =>
                        handleChange("paymentType", e.target.value)
                      }
                      disabled={isFormReadOnly}
                      isIDs={false}
                      options={filteredPaymentTypeOptions}
                      isMarginBtm={!showPaymentTypeSalaryDeductionNotice}
                    />
                  </MembershipFormField>
                </div>
                <MembershipFormGrid>
                  <MembershipFormField field="payrollNumber" fieldErrors={fieldErrors}>
                    <MyInput
                      label="Payroll No."
                      placeholder="Enter Payroll No."
                      value={formData.payrollNumber}
                      onChange={(e) =>
                        handleChange("payrollNumber", e.target.value)
                      }
                      disabled={isFormReadOnly || !payrollDeductionPayment}
                      required={payrollDeductionPayment && !isFormReadOnly}
                    />
                  </MembershipFormField>
                  <CustomSelect
                    label="Payment Frequency"
                    placeholder="Select Frequency"
                    options={CRM_PAYMENT_FREQUENCY_OPTIONS}
                    value={formData.paymentFrequency}
                    onChange={(e) =>
                      handleChange("paymentFrequency", e.target.value)
                    }
                    disabled={isFormReadOnly}
                  />
                </MembershipFormGrid>
              </MembershipFormCard>
            )}

            {showRemindersCancellations && (
              <MembershipFormCard title="Reminders & Cancellations">
                <MembershipFormGrid>
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
                  <MyDatePicker
                    label="Cancellation / Resignation Date"
                    placeholder="Select cancellation date"
                    value={formData.dateCancelled}
                    onChange={(date) => handleChange("dateCancelled", date)}
                    disabled={true}
                  />
                  <MembershipFormGridFull>
                    <CustomSelect
                      label="Cancellation / Resignation Reason"
                      placeholder="Select reason"
                      options={cancellationReasonOptions}
                      value={formData.cancellationReason}
                      onChange={(e) =>
                        handleChange("cancellationReason", e.target.value)
                      }
                      disabled={true}
                    />
                  </MembershipFormGridFull>
                </MembershipFormGrid>
              </MembershipFormCard>
            )}

            <MembershipFormCard title="Additional Memberships">
              <div className="membership-form-radio-block membership-form-radio-inline">
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
              {formData.memberOfOtherUnion === "Yes" && (
                <MyInput
                  label="Which Union?"
                  value={formData.otherUnionName}
                  onChange={(e) =>
                    handleChange("otherUnionName", e.target.value)
                  }
                  disabled={isFormReadOnly}
                />
              )}
            </MembershipFormCard>

            <MembershipFormCard title="Income Protection Scheme">
              <div className="membership-form-radio-block membership-form-radio-stacked">
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
            </MembershipFormCard>

            <MembershipFormCard title="CornMarket" className="membership-form-card--last">
              <Checkbox
                checked={formData.joinRewards}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    handleChange("exclusiveDiscountsOffers", false);
                    handleChange("joinINMOIncomeProtection", false);
                  }
                  handleChange("joinRewards", isChecked);
                }}
                style={{
                  marginBottom: "8px",
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
                    handleChange("joinRewards", false);
                  }
                  handleChange("exclusiveDiscountsOffers", isChecked);
                }}
                style={{
                  marginBottom: "8px",
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
                    handleChange("joinRewards", false);
                  }
                  handleChange("joinINMOIncomeProtection", isChecked);
                }}
                style={{ display: "flex", alignItems: "center" }}
                disabled={isFormReadOnly || formData.joinRewards}
              >
                Income Protection and Consent
              </Checkbox>
            </MembershipFormCard>
          </MembershipFormCol>
      </MembershipFormColumns>
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
            marginTop: 10,
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
