import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Modal, Button, message, Tooltip } from "antd";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUser,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import dayjs from "dayjs";
import MyDatePicker from "./MyDatePicker";
import CustomSelect from "./CustomSelect";
import "../../styles/ProfileHeader.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  getAccountServiceBaseUrl,
  getSubscriptionServiceBaseUrl,
} from "../../config/serviceUrls";
import MyAlert from "./MyAlert"; // Assuming you have this component
import UndoCancellationModal from "./UndoCancellationModal";
import { centsToEuro, formatMobileNumber } from "../../utils/Utilities";
import { getProfileDetailsById } from "../../features/profiles/ProfileDetailsSlice";
import {
  getSubscriptionByProfileId,
  getSubscriptionById,
  getProfileSubscriptionsForActivateEligibility,
  pickPrimarySubscription,
  profileDetailActiveSubscriptionArgs,
} from "../../features/subscription/profileSubscriptionSlice";
import { shouldDisableActivateUnlessLatestSubscriptionByStartDate } from "../../utils/applicationEligibility";

const ACTIVATE_MEMBERSHIP_DISABLED_TITLE =
  "Only the subscription with the latest start date can be reactivated here. This membership is an older subscription line.";

const ProfileHeader = forwardRef(function ProfileHeader(
  { showButtons = false, isDeceased = false, onMembershipHeaderActionsMetaChange },
  ref,
) {
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isUndoCancelModalVisible, setIsUndoCancelModalVisible] =
    useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [cancelFormData, setCancelFormData] = useState({
    dateResigned: null,
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ledgerBalance, setLedgerBalance] = useState(0);
  const [ledgerBalanceIsCents, setLedgerBalanceIsCents] = useState(true);
  const [lastPaymentAmount, setLastPaymentAmount] = useState(0);
  const [lastPaymentDate, setLastPaymentDate] = useState(null);
  const [paymentCode, setPaymentCode] = useState("");
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Get data from Redux store
  const { profileDetails, loading, error } = useSelector(
    (state) => state.profileDetails
  );

  // Subscription API data
  const {
    ProfileSubData,
    ProfileSubLoading,
    ProfileSubError,
    profileSubscriptionsForActivateEligibility,
  } = useSelector((state) => state.profileSubscription);

  const {
    profileSearchData,
    loading: searchLoading,
    error: searchError,
  } = useSelector((state) => state.searchProfile);

  // FIXED: Safely access results with proper null checking
  const searchAoiRes = profileSearchData?.results?.[0] || null;

  // Choose source dynamically - profileDetails has priority
  const source = profileDetails || searchAoiRes;

  const profileIdForApps = source?.id || source?._id;
  useEffect(() => {
    if (!profileIdForApps) return;
    dispatch(
      getProfileSubscriptionsForActivateEligibility({
        profileId: profileIdForApps,
      })
    );
  }, [dispatch, profileIdForApps]);

  // Get token from Redux store (assuming you have auth state)
  // const { token } = useSelector((state) => state.auth || {});
  const token = localStorage.getItem("token");

  // Function to calculate age from date of birth using dayjs
  const calculateAge = (dateString) => {
    if (!dateString) return "";
    const birthDate = dayjs(dateString);
    if (!birthDate.isValid()) return "";

    const today = dayjs();
    const age = today.diff(birthDate, "year");
    return `${age} Yrs`;
  };

  // Format date to DD/MM/YYYY using dayjs
  const formatDate = (dateString, format = "DD/MM/YYYY") => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.isValid() ? date.format(format) : "";
  };

  // Format timestamp to date time format
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    // Check if it's a timestamp (number) or date string
    const date =
      typeof dateString === "number" ? dayjs(dateString) : dayjs(dateString);
    return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : "";
  };

  // Format date to DD/MM/YYYY for DOB display
  const formatDOB = (dateString) => {
    return formatDate(dateString, "DD/MM/YYYY");
  };

  // Prefer current subscription row; otherwise latest period — matches CRM list when multiple rows exist
  const subscriptionData = useMemo(() => {
    let rows = [];
    if (Array.isArray(ProfileSubData?.data)) {
      rows = ProfileSubData.data;
    } else if (
      ProfileSubData?.data?.data &&
      Array.isArray(ProfileSubData.data.data)
    ) {
      rows = ProfileSubData.data.data;
    }
    const sub = pickPrimarySubscription(rows);
    if (!sub) return null;

    return {
      subscriptionStatus: sub.subscriptionStatus || "",
      paymentType: sub.paymentType || "",
      payrollNo: sub.payrollNo || "",
      paymentFrequency: sub.paymentFrequency || "",
      subscriptionYear: sub.subscriptionYear || "",
      isCurrent: sub.isCurrent === true,
      startDate: sub.startDate || null,
      startDateFormatted: sub.startDate ? formatDate(sub.startDate) : "",
      endDate: sub.endDate || null,
      endDateFormatted: sub.endDate ? formatDate(sub.endDate) : "",
      renewalDate: sub.rolloverDate ? formatDate(sub.rolloverDate) : "",
      membershipMovement: sub.membershipMovement || "",
      reinstated: sub.cancellation?.reinstated || false,
      yearendProcessed: sub.yearend?.processed || false,
      ...sub,
    };
  }, [ProfileSubData]);

  const memberIdForLedger = useMemo(() => {
    const fromSearch = searchParams.get("memberId");
    const fromSource =
      source?.membershipNumber ||
      source?.membershipNo ||
      source?.personalDetails?.membershipNo ||
      source?.personalInfo?.membershipNumber;
    const fromSubscription =
      subscriptionData?.membershipNumber ||
      subscriptionData?.membershipNo ||
      subscriptionData?.personalDetails?.membershipNo;
    const fromAnySubscription = (
      Array.isArray(profileSubscriptionsForActivateEligibility)
        ? profileSubscriptionsForActivateEligibility
        : []
    )
      .map(
        (sub) =>
          sub?.membershipNumber ||
          sub?.membershipNo ||
          sub?.personalDetails?.membershipNo ||
          sub?.profile?.membershipNumber
      )
      .find(Boolean);
    return (
      fromSearch ||
      location.state?.memberId ||
      fromSource ||
      source?.regNo ||
      fromSubscription ||
      fromAnySubscription ||
      ""
    );
  }, [
    source,
    subscriptionData,
    profileSubscriptionsForActivateEligibility,
    location,
    searchParams,
  ]);

  const fetchAccountSummary = useCallback(async () => {
    if (!memberIdForLedger || !token) return;

    setLedgerLoading(true);
    try {
      const response = await axios.get(
        `${getAccountServiceBaseUrl()}/reports/member/${memberIdForLedger}/summary`,
        // /reports/member/B00002/summary?year=2026
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const summaryData = response.data?.data || response.data;
      const normalizedNet =
        summaryData?.net ??
        summaryData?.balance ??
        summaryData?.ledgerBalance ??
        0;
      // account-service summary can return euros (decimal) while legacy flows use cents (integer).
      const isCents = Number.isInteger(normalizedNet);
      setLedgerBalance(normalizedNet || 0);
      setLedgerBalanceIsCents(isCents);

      const normalizedLastPaymentAmount =
        summaryData?.lastPayment?.amount ??
        summaryData?.lastPaymentAmount ??
        summaryData?.payment?.amount ??
        0;
      const normalizedLastPaymentDate =
        summaryData?.lastPayment?.date ??
        summaryData?.lastPaymentDate ??
        summaryData?.paymentDate ??
        null;
      setLastPaymentAmount(normalizedLastPaymentAmount || 0);
      setLastPaymentDate(normalizedLastPaymentDate);
    } catch (error) {
      console.error("Error fetching account summary in ProfileHeader:", error);
      setLedgerBalance(0);
      setLedgerBalanceIsCents(true);
      setLastPaymentAmount(0);
      setLastPaymentDate(null);
    } finally {
      setLedgerLoading(false);
    }
  }, [memberIdForLedger, token]);

  const refreshAllData = useCallback(() => {
    const profileId = source?.id || source?._id;
    const subscriptionId =
      searchParams.get("subscriptionId") || location.state?.subscriptionId;
    if (profileId) {
      dispatch(getProfileDetailsById(profileId));
      if (subscriptionId) {
        dispatch(getSubscriptionById(subscriptionId));
      } else {
        dispatch(
          getSubscriptionByProfileId({
            profileId,
            ...profileDetailActiveSubscriptionArgs,
          }),
        );
      }
    }
    fetchAccountSummary();
  }, [
    dispatch,
    source,
    searchParams,
    location.state?.subscriptionId,
    fetchAccountSummary,
  ]);

  useEffect(() => {
    fetchAccountSummary();
  }, [fetchAccountSummary]);

  useEffect(() => {
    const handleMemberFinanceUpdated = (event) => {
      const eventMemberId = String(event?.detail?.memberId || "")
        .trim()
        .toLowerCase();
      const currentMemberId = String(memberIdForLedger || "")
        .trim()
        .toLowerCase();

      // Refresh only when event is for the currently visible member.
      if (eventMemberId && eventMemberId !== currentMemberId) return;
      fetchAccountSummary();
    };

    window.addEventListener("member-finance-updated", handleMemberFinanceUpdated);
    return () => {
      window.removeEventListener(
        "member-finance-updated",
        handleMemberFinanceUpdated
      );
    };
  }, [fetchAccountSummary, memberIdForLedger]);

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

  // Helper function to safely get nested properties
  const getSafe = (obj, path, defaultValue = "") => {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  };

  // FIXED: Derive member data from source - now properly reactive
  const memberData = useMemo(() => {
    // Personal Info
    const name = source
      ? `${getSafe(source, "personalInfo.forename", "")} ${getSafe(
        source,
        "personalInfo.surname",
        ""
      )}`.trim()
      : "";
    const dob = formatDOB(getSafe(source, "personalInfo.dateOfBirth"));
    const gender = getSafe(source, "personalInfo.gender", "M")
      .charAt(0)
      .toUpperCase();
    const age =
      calculateAge(getSafe(source, "personalInfo.dateOfBirth")) || "36 Yrs";

    let status = "";
    if (isDeceased) {
      status = "Deceased";
    } else if (subscriptionData?.subscriptionStatus) {
      status = subscriptionData.subscriptionStatus;
    } else if (isSubscriptionEmpty && !ProfileSubLoading) {
      status = "Resigned";
    } else {
      status =
        getSafe(source, "membershipStatus") ||
        (getSafe(source, "deactivatedAt") ? "Inactive" : "Active Member");
    }

    // Membership Info - Use subscription end date if available, otherwise fall back
    const memberId = getSafe(source, "membershipNumber", "");
    const joined = formatDate(getSafe(source, "firstJoinedDate")) || "";
    // Expires: resignation / cancellation exit date when applicable; else subscription year end or profile deactivation
    const cancelBlock = subscriptionData?.cancellation;
    const dateCancelledRaw =
      cancelBlock && !cancelBlock.reinstated
        ? cancelBlock.dateCancelled
        : null;
    const dateResignedRaw = subscriptionData?.resignation?.dateResigned;
    let expires = "";
    if (dateResignedRaw) {
      expires = formatDate(dateResignedRaw);
    } else if (dateCancelledRaw) {
      expires = formatDate(dateCancelledRaw);
    } else {
      expires =
        subscriptionData?.endDateFormatted ||
        formatDate(getSafe(source, "deactivatedAt")) ||
        "";
    }

    // Contact Info
    const address = source?.contactInfo
      ? `${getSafe(source, "contactInfo.buildingOrHouse", "")} ${getSafe(
        source,
        "contactInfo.streetOrRoad",
        ""
      )}, ${getSafe(source, "contactInfo.areaOrTown", "")}`.trim() ||
      "123 Main Street, New York"
      : "123 Main Street, New York";

    const email =
      getSafe(source, "contactInfo.preferredEmail") === "work"
        ? getSafe(source, "contactInfo.workEmail")
        : getSafe(source, "contactInfo.personalEmail", "");

    const phone = formatMobileNumber(getSafe(source, "contactInfo.mobileNumber", ""));

    // Professional Info
    const grade = getSafe(source, "professionalDetails.grade", " ");
    // const category = getSafe(source, 'membershipCategory', ' ');
    const category = subscriptionData?.membershipCategory || "";
    // Subscription Info
    const paymentType = subscriptionData?.paymentType || "Salary Deduction";
    const subscriptionYear = subscriptionData?.subscriptionYear || "";

    // Financial Info - Now using fetched summary data
    // Assume ledgerBalance (net) is in Euros if it has decimal, but to be safe and consistent with previous logic, 
    // let's check if we should still use centsToEuro. 
    // Actually, historical code used centsToEuro. If the API changed units, we should adjust.
    // Given the example "net": 120.5, it looks like Euros.
    const numericLedgerBalance = Number(ledgerBalance || 0);
    const balanceInEuro = ledgerBalanceIsCents
      ? centsToEuro(numericLedgerBalance)
      : numericLedgerBalance;
    const balanceAmount = `€${Math.abs(balanceInEuro).toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const balanceIndicator =
      numericLedgerBalance > 0 ? "Dr" : numericLedgerBalance < 0 ? "Cr" : "";
    const balanceColor =
      balanceIndicator === "Dr"
        ? "#cf1322"
        : balanceIndicator === "Cr"
          ? "#389e0d"
          : "#faad14";
    const lastPayment = `€${centsToEuro(lastPaymentAmount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Payment date only from account summary (cash receipt crediting 2020); not subscription start.
    const paymentDateRaw = lastPaymentDate || null;
    const paymentDate = paymentDateRaw
      ? formatDate(paymentDateRaw)
      : "N/A";

    // Use paymentCode from API if available, fallback to generated one
    const paymentCodeToUse = `MB-${subscriptionData?.subscriptionYear || dayjs().year()
      }-${getSafe(source, "membershipNumber", "001")}`;

    return {
      // Personal Info
      name,
      dob,
      gender,
      age,

      // Status
      status,

      // Membership Info
      memberId,
      joined,
      expires,

      // Contact Info
      address,
      email,
      phone,

      // Professional Info
      grade,
      category,

      // Subscription Info
      paymentType,
      subscriptionYear,

      // Financial Info
      balance: balanceAmount,
      balanceIndicator,
      balanceColor,
      lastPayment,
      paymentDate,
      paymentCode: paymentCodeToUse,
    };
  }, [
    source,
    subscriptionData,
    isDeceased,
    isSubscriptionEmpty,
    ProfileSubLoading,
    ledgerBalance,
    ledgerBalanceIsCents,
    lastPaymentAmount,
    lastPaymentDate,
    paymentCode,
  ]); // Now recalculates when source OR subscriptionData OR summary data changes

  const statusBadgeTooltip = useMemo(() => {
    if (isDeceased) return "";
    const statusLower = (memberData.status || "").toLowerCase();
    const subLower = (subscriptionData?.subscriptionStatus || "").toLowerCase();
    const isResignedOrCancelled =
      statusLower.includes("resign") ||
      statusLower.includes("cancel") ||
      subLower.includes("resign") ||
      subLower.includes("cancel");
    if (!isResignedOrCancelled) return "";

    const reason =
      subscriptionData?.resignation?.reason?.trim() ||
      subscriptionData?.cancellation?.reason?.trim();
    const dateRaw =
      subscriptionData?.resignation?.dateResigned ||
      subscriptionData?.cancellation?.dateCancelled;
    const dateStr = dateRaw ? formatDate(dateRaw) : "";

    const lines = [];
    if (dateStr) lines.push(`Date: ${dateStr}`);
    if (reason) lines.push(`Reason: ${reason}`);
    return lines.length ? lines.join("\n") : "";
  }, [isDeceased, memberData.status, subscriptionData]);

  const currentSubscriptionForActivate = useMemo(() => {
    const arr = ProfileSubData?.data;
    if (!Array.isArray(arr)) return null;
    return pickPrimarySubscription(arr);
  }, [ProfileSubData]);

  const mergedProfileSubscriptions = useMemo(() => {
    const fromEligibility = Array.isArray(
      profileSubscriptionsForActivateEligibility
    )
      ? profileSubscriptionsForActivateEligibility
      : [];
    const fromProfile = Array.isArray(ProfileSubData?.data)
      ? ProfileSubData.data
      : [];
    const byId = new Map();
    [...fromEligibility, ...fromProfile].forEach((s) => {
      if (s?._id) byId.set(s._id, s);
    });
    return [...byId.values()];
  }, [profileSubscriptionsForActivateEligibility, ProfileSubData]);

  const shouldDisableActivateMembership = useMemo(() => {
    if (memberData.status !== "Resigned") return false;
    return shouldDisableActivateUnlessLatestSubscriptionByStartDate(
      currentSubscriptionForActivate,
      mergedProfileSubscriptions
    );
  }, [
    memberData.status,
    currentSubscriptionForActivate,
    mergedProfileSubscriptions,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      openCancelMembershipModal: () => setIsCancelModalVisible(true),
      openActivateMembershipModal: () => {
        if (shouldDisableActivateMembership) return;
        setIsUndoCancelModalVisible(true);
      },
    }),
    [shouldDisableActivateMembership],
  );

  useEffect(() => {
    if (typeof onMembershipHeaderActionsMetaChange !== "function") return;
    const showCancelMembership =
      showButtons &&
      !isDeceased &&
      memberData.status !== "Resigned" &&
      memberData.status !== "Lapsed" &&
      !subscriptionData?.reinstated;
    const showActivateMembership =
      showButtons && !isDeceased && memberData.status === "Resigned";
    onMembershipHeaderActionsMetaChange({
      showCancelMembership,
      showActivateMembership,
      activateMembershipDisabled: shouldDisableActivateMembership,
      activateMembershipTitle: shouldDisableActivateMembership
        ? ACTIVATE_MEMBERSHIP_DISABLED_TITLE
        : undefined,
    });
  }, [
    onMembershipHeaderActionsMetaChange,
    showButtons,
    isDeceased,
    memberData.status,
    subscriptionData?.reinstated,
    shouldDisableActivateMembership,
  ]);

  const cancellationReasons = [
    { key: "voluntary", label: "Voluntary Resignation" },
    { key: "retirement", label: "Retirement" },
    { key: "relocation", label: "Relocation" },
    { key: "financial", label: "Financial Reasons" },
    { key: "dissatisfaction", label: "Dissatisfaction with Services" },
    { key: "other", label: "Other" },
    { key: "deceased", label: "Deceased" },
  ];

  const handleCancelModalClose = () => {
    setIsCancelModalVisible(false);
    setCancelFormData({
      dateResigned: null,
      reason: "",
    });
    setIsSubmitting(false);
  };

  const handleCancelSubmit = async () => {
    if (!cancelFormData.dateResigned || !cancelFormData.reason?.trim()) {
      MyAlert("error", "Please fill all required fields");
      return;
    }

    if (!token) {
      MyAlert("error", "Authentication token is missing. Please log in again.");
      return;
    }

    const subscriptionId =
      subscriptionData?._id != null
        ? String(subscriptionData._id).trim()
        : "";
    if (!subscriptionId) {
      MyAlert(
        "error",
        "Active subscription ID not found. Cannot resign until subscription data loads.",
      );
      return;
    }

    const payload = {
      dateResigned: dayjs(cancelFormData.dateResigned).format("YYYY-MM-DD"),
      reason: cancelFormData.reason.trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${getSubscriptionServiceBaseUrl()}/subscriptions/${subscriptionId}/resign`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      MyAlert("success", "Membership cancellation submitted successfully!");
      handleCancelModalClose();
      refreshAllData();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request
          ? "No response from server. Please check your connection."
          : "Error setting up request.");

      MyAlert("error", `Cancellation failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setCancelFormData({ ...cancelFormData, [field]: value });
  };

  // Show loading state
  if (loading && !source) {
    return (
      <div className="member-header-container">
        <div className="member-header-single-card">
          <div className="member-header-top">
            <div className="member-profile-section">
              <div className="member-avatar">
                <FaUser className="avatar-icon" />
              </div>
              <h2 className="member-name">Loading...</h2>
              <p className="member-details">Loading profile data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !source) {
    return (
      <div className="member-header-container">
        <div className="member-header-single-card">
          <div className="member-header-top">
            <div className="member-profile-section">
              <div className="member-avatar">
                <FaUser className="avatar-icon" />
              </div>
              <h2 className="member-name">Error</h2>
              <p className="member-details">Failed to load profile data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="member-header-container">
      <div className="member-header-single-card">
        {/* Profile Header Section */}
        <div
          className={`member-header-top ${isDeceased ? "member-deceased" : ""}`}
        >
          <div className="member-profile-section">
            <div className="member-avatar">
              <FaUser className="avatar-icon" />
            </div>
            <h2 className="member-name">{memberData.name}</h2>
            <p className="member-details">
              {memberData.dob} ({memberData.gender}) {memberData.age}
            </p>
            <Tooltip
              title={statusBadgeTooltip || undefined}
              trigger={["hover", "focus"]}
              mouseEnterDelay={0.05}
              mouseLeaveDelay={0.05}
            >
              <span
                className={`member-status-badge ${isDeceased
                  ? "member-status-deceased"
                  : /resign|cancel/i.test(memberData.status || "")
                    ? "member-status-resigned"
                    : /lapsed/i.test(memberData.status || "")
                      ? "member-status-lapsed"
                      : ""
                  }`}
                style={{ cursor: statusBadgeTooltip ? "help" : undefined }}
              >
                {memberData.status}
                {subscriptionData?.isCurrent && " (Current)"}
                {subscriptionData?.reinstated && " (Reinstated)"}
              </span>
            </Tooltip>
          </div>

          {/* Contact Information Section - on blue background */}
          <div className="member-contact-section-blue">
            <div className="contact-item-blue">
              <FaEnvelope className="contact-icon-blue" />
              <span>{memberData.email}</span>
            </div>
            <div className="contact-item-blue">
              <FaPhone className="contact-icon-blue" />
              <span>Cell: {memberData.phone}</span>
            </div>
            <div className="contact-item-blue">
              <FaMapMarkerAlt className="contact-icon-blue" />
              <span>{memberData.address}</span>
            </div>
          </div>
        </div>

        {/* Membership Details Section */}
        <div className="member-details-section">
          <div className="detail-row">
            <FaIdCard className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Member ID:</span>
              <span className="detail-value member-id">
                {memberData.memberId}
              </span>
            </div>
          </div>
          <div className="detail-row">
            <FaCalendarAlt className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Joined:</span>
              <span className="detail-value">{memberData.joined}</span>
            </div>
          </div>
          <div className="detail-row">
            <FaClock className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Expires:</span>
              <span className="detail-value">{memberData.expires}</span>
            </div>
          </div>
        </div>

        {/* Financial Details Card */}
        <div className="member-financial-card">
          <div className="detail-row">
            <FaExclamationTriangle className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Balance:</span>
              <span
                className="detail-value"
                style={{
                  color: memberData.balanceColor || "#faad14",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {memberData.balance}
                {memberData.balanceIndicator && (
                  <span
                    style={{
                      fontSize: "12px",
                      marginLeft: 4,
                      fontWeight: 600,
                    }}
                  >
                    ({memberData.balanceIndicator})
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="detail-row">
            <FaClock className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Last Payment:</span>
              <span className="detail-value">{memberData.lastPayment}</span>
            </div>
          </div>
          <div className="detail-row">
            <FaCalendarAlt className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Payment Date:</span>
              <span className="detail-value">{memberData.paymentDate}</span>
            </div>
          </div>
          <div className="detail-row">
            <FaCreditCard className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Payment Code:</span>
              <span className="detail-value">{memberData.paymentCode}</span>
            </div>
          </div>
          {/* Show subscription info if available */}
          {subscriptionData && (
            <>
              <div className="detail-row">
                <FaMoneyBillWave className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Payment Type:</span>
                  <span className="detail-value">{memberData.paymentType}</span>
                </div>
              </div>
              {memberData.subscriptionYear && (
                <div className="detail-row">
                  <FaCalendarAlt className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Sub Year:</span>
                    <span className="detail-value">
                      {memberData.subscriptionYear}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Grade and Category Section - on blue background */}
        <div
          className={`member-grade-section-blue ${isDeceased ? "member-deceased" : ""}`}
        >
          <div className="grade-row-blue">
            <span className="grade-label-blue">Category:</span>
            <span className="grade-value-blue">{memberData?.category}</span>
          </div>
          <div className="grade-row-blue">
            <span className="grade-label-blue">Grade:</span>
            <span className="grade-value-blue">{memberData.grade}</span>
          </div>
        </div>

      </div>

      {/* Cancel Membership Modal */}
      <Modal
        title="Cancel Membership"
        open={isCancelModalVisible}
        onCancel={handleCancelModalClose}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancelModalClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleCancelSubmit}
            disabled={
              !cancelFormData.dateResigned ||
              !cancelFormData.reason ||
              isSubmitting
            }
            loading={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Confirm Cancellation"}
          </Button>,
        ]}
        width={520}
        centered
        className="cancel-membership-modal"
      >
        <div
          style={{
            padding: "24px 16px",
            minHeight: "120px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <MyDatePicker
              label="Date Resigned"
              placeholder="Select date resigned"
              value={cancelFormData.dateResigned}
              onChange={(date) => handleFormChange("dateResigned", date)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <CustomSelect
              label="Reason for Cancellation"
              placeholder="Select reason"
              options={cancellationReasons}
              value={cancelFormData.reason}
              onChange={(e) => handleFormChange("reason", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Undo Cancellation Modal */}
      <UndoCancellationModal
        visible={isUndoCancelModalVisible}
        onClose={() => setIsUndoCancelModalVisible(false)}
        subscriptionId={subscriptionData?._id}
        onSuccess={() => {
          refreshAllData();
        }}
      />
    </div>
  );
});

export default ProfileHeader;
