import React, { useState } from "react";
import { Modal, Button } from "antd";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaEdit,
  FaUser,
} from "react-icons/fa";
import dayjs from "dayjs";
import MyDatePicker from "./MyDatePicker";
import CustomSelect from "./CustomSelect";
import "../../styles/ProfileHeader.css";
import { useSelector } from "react-redux";

function ProfileHeader({
  isEditMode = false,
  setIsEditMode,
  showButtons = false,
  isDeceased = false
}) {
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelFormData, setCancelFormData] = useState({
    dateResigned: null,
    reason: "",
  });

  // Get data from Redux store
  const { profileDetails, loading, error } = useSelector(
    (state) => state.profileDetails
  );

  // Subscription API data
  const {
    ProfileSubData,
    ProfileSubLoading,
    ProfileSubError,
  } = useSelector((state) => state.profileSubscription);
  
  const {
    profileSearchData,
    loading: searchLoading,
    error: searchError
  } = useSelector((state) => state.searchProfile);
  
  // FIXED: Safely access results with proper null checking
  const searchAoiRes = profileSearchData?.results?.[0] || null;
  
  // Choose source dynamically - profileDetails has priority
  const source = profileDetails || searchAoiRes;

  // Function to calculate age from date of birth using dayjs
  const calculateAge = (dateString) => {
    if (!dateString) return "";
    const birthDate = dayjs(dateString);
    if (!birthDate.isValid()) return "";
    
    const today = dayjs();
    const age = today.diff(birthDate, 'year');
    return `${age} Yrs`;
  };

  // Format date to DD/MM/YYYY using dayjs
  const formatDate = (dateString, format = "DD/MM/YYYY") => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.isValid() ? date.format(format) : "";
  };

  // Format date to DD/MM/YYYY for DOB display
  const formatDOB = (dateString) => {
    return formatDate(dateString, "DD/MM/YYYY");
  };

  // Get subscription data
  const getSubscriptionData = () => {
    if (ProfileSubData?.data?.length > 0) {
      const subscription = ProfileSubData.data[0];

      return {
        subscriptionStatus: subscription.subscriptionStatus || "",
        paymentType: subscription.paymentType || "",
        payrollNo: subscription.payrollNo || "",
        paymentFrequency: subscription.paymentFrequency || "",
        subscriptionYear: subscription.subscriptionYear || "",
        isCurrent: subscription.isCurrent || false,
        startDate: subscription.startDate ? formatDate(subscription.startDate) : "",
        endDate: subscription.endDate ? formatDate(subscription.endDate) : "",
        renewalDate: subscription.rolloverDate ? formatDate(subscription.rolloverDate) : "",
        membershipMovement: subscription.membershipMovement || "",
        reinstated: subscription.cancellation?.reinstated || false,
        yearendProcessed: subscription.yearend?.processed || false,
      };
    }
    return null;
  };

  const subscriptionData = getSubscriptionData();

  // Helper function to safely get nested properties
  const getSafe = (obj, path, defaultValue = "") => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  };

  // Derive member data from source
  const memberData = {
    // Personal Info
    name: source ? `${getSafe(source, 'personalInfo.forename', '')} ${getSafe(source, 'personalInfo.surname', '')}`.trim() : "",
    dob: formatDOB(getSafe(source, 'personalInfo.dateOfBirth')),
    gender: getSafe(source, 'personalInfo.gender', 'M').charAt(0).toUpperCase(),
    age: calculateAge(getSafe(source, 'personalInfo.dateOfBirth')) || "36 Yrs",

    // Status - Use subscription status if available, otherwise fall back to profile data
    status: isDeceased ? "Deceased" :
      (subscriptionData?.subscriptionStatus ||
        getSafe(source, 'membershipStatus') ||
        (getSafe(source, 'deactivatedAt') ? "Inactive" : "Active Member")),

    // Membership Info - Use subscription end date if available, otherwise fall back
    memberId: getSafe(source, 'membershipNumber', '45217A'),
    joined: formatDate(getSafe(source, 'firstJoinedDate')) || "01/01/2016",
    expires: subscriptionData?.endDate ||
      formatDate(getSafe(source, 'deactivatedAt')) || "01/01/2026",

    // Contact Info
    address: source?.contactInfo ?
      `${getSafe(source, 'contactInfo.buildingOrHouse', '')} ${getSafe(source, 'contactInfo.streetOrRoad', '')}, ${getSafe(source, 'contactInfo.areaOrTown', '')}`.trim() ||
      "123 Main Street, New York" : "123 Main Street, New York",
    email: getSafe(source, 'contactInfo.preferredEmail') === "work" ?
      getSafe(source, 'contactInfo.workEmail') :
      getSafe(source, 'contactInfo.personalEmail', ''),
    phone: getSafe(source, 'contactInfo.mobileNumber', ''),

    // Professional Info
    grade: getSafe(source, 'professionalDetails.grade', ' '),
    category: getSafe(source, 'membershipCategory', ' '),

    // Subscription Info
    paymentType: subscriptionData?.paymentType || "Salary Deduction",
    subscriptionYear: subscriptionData?.subscriptionYear || "",

    // Financial Info - These would likely come from a different API endpoint
    balance: "€200",
    lastPayment: "€74.7",
    // Use subscription start date for payment date if available
    paymentDate: subscriptionData?.startDate || 
      formatDate(getSafe(source, 'submissionDate')) || "1/02/2025",
    // Include subscription year in payment code if available
    paymentCode: `MB-${subscriptionData?.subscriptionYear || dayjs().year()}-${getSafe(source, 'membershipNumber', '001')}`,
  };

  const cancellationReasons = [
    { key: "voluntary", label: "Voluntary Resignation" },
    { key: "retirement", label: "Retirement" },
    { key: "relocation", label: "Relocation" },
    { key: "financial", label: "Financial Reasons" },
    { key: "dissatisfaction", label: "Dissatisfaction with Services" },
    { key: "other", label: "Other" },
    { key: "deceased", label: "Deceased" },
  ];

  const handleCancelClick = () => {
    setIsCancelModalVisible(true);
  };

  const handleCancelModalClose = () => {
    setIsCancelModalVisible(false);
    setCancelFormData({
      dateResigned: null,
      reason: "",
    });
  };

  const handleCancelSubmit = () => {
    if (!cancelFormData.dateResigned || !cancelFormData.reason) {
      return;
    }

    // Handle cancellation submission here
    console.log("Cancellation submitted:", cancelFormData);

    // Close modal and reset form
    handleCancelModalClose();
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
        <div className={`member-header-top ${isDeceased ? "member-deceased" : ""}`}>
          {showButtons && (
            <button
              className="member-edit-btn"
              onClick={() => setIsEditMode && setIsEditMode(!isEditMode)}
            >
              <FaEdit className="edit-icon" />
              <span>{isEditMode ? "Cancel" : "Edit"}</span>
            </button>
          )}

          <div className="member-profile-section">
            <div className="member-avatar">
              <FaUser className="avatar-icon" />
            </div>
            <h2 className="member-name">{memberData.name}</h2>
            <p className="member-details">
              {memberData.dob} ({memberData.gender}) {memberData.age}
            </p>
            <span className={`member-status-badge ${isDeceased ? "member-status-deceased" : ""}`}>
              {memberData.status}
              {subscriptionData?.isCurrent && " (Current)"}
              {subscriptionData?.reinstated && " (Reinstated)"}
            </span>
          </div>

          {/* Contact Information Section - on blue background */}
          <div className="member-contact-section-blue">
            <div className="contact-item-blue">
              <FaMapMarkerAlt className="contact-icon-blue" />
              <span>{memberData.address}</span>
            </div>
            <div className="contact-item-blue">
              <FaEnvelope className="contact-icon-blue" />
              <span>{memberData.email}</span>
            </div>
            <div className="contact-item-blue">
              <FaPhone className="contact-icon-blue" />
              <span>Cell: {memberData.phone}</span>
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
          <div className="financial-header">
            <div className="financial-title">
              <FaExclamationTriangle className="warning-icon" />
              <span>Balance</span>
            </div>
            <span className="balance-amount">{memberData.balance}</span>
          </div>
          <div className="financial-details">
            <div className="financial-row">
              <span className="financial-label">Last Payment:</span>
              <span className="financial-value">{memberData.lastPayment}</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Payment Date:</span>
              <span className="financial-value">{memberData.paymentDate}</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Payment Code:</span>
              <span className="financial-value">{memberData.paymentCode}</span>
            </div>
            {/* Show subscription info if available */}
            {subscriptionData && (
              <>
                <div className="financial-row">
                  <span className="financial-label">Payment Type:</span>
                  <span className="financial-value">{memberData.paymentType}</span>
                </div>
                {memberData.subscriptionYear && (
                  <div className="financial-row">
                    <span className="financial-label">Sub Year:</span>
                    <span className="financial-value">{memberData.subscriptionYear}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Grade and Category Section - on blue background */}
        <div className={`member-grade-section-blue ${isDeceased ? "member-deceased" : ""}`}>
          <div className="grade-row-blue">
            <span className="grade-label-blue">Grade:</span>
            <span className="grade-value-blue">{memberData.grade}</span>
          </div>
          <div className="grade-row-blue">
            <span className="grade-label-blue">Category:</span>
            <span className="grade-value-blue">{memberData.category}</span>
          </div>
        </div>

        {/* Cancel Membership Button */}
        {showButtons && !isDeceased && !subscriptionData?.reinstated && (
          <button className="member-cancel-btn" onClick={handleCancelClick}>
            Cancel Membership
          </button>
        )}
      </div>

      {/* Cancel Membership Modal */}
      <Modal
        title="Cancel Membership"
        open={isCancelModalVisible}
        onCancel={handleCancelModalClose}
        footer={[
          <Button key="cancel" onClick={handleCancelModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleCancelSubmit}
            disabled={!cancelFormData.dateResigned || !cancelFormData.reason}
          >
            Confirm Cancellation
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
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProfileHeader;