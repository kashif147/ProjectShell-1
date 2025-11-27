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
import MyDatePicker from "./MyDatePicker";
import CustomSelect from "./CustomSelect";
import "../../styles/ProfileHeader.css";

function ProfileHeader({ isEditMode = false, setIsEditMode, showButtons = false }) {
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelFormData, setCancelFormData] = useState({
    dateResigned: null,
    reason: "",
  });

  // Sample data - replace with actual data from props or state
  const memberData = {
    name: "Jack Smith",
    dob: "03.22.1990",
    gender: "M",
    age: "36A Yrs",
    status: "Active Member",
    memberId: "45217A",
    joined: "01/01/2016",
    expires: "01/01/2026",
    balance: "€200",
    lastPayment: "€74.7",
    paymentDate: "1/02/2025",
    paymentCode: "MB-2025-001",
    address: "123 Main Street, New York",
    email: "jack.smith@email.com",
    phone: "(817) 234-3244",
    grade: "General - All Grades",
    category: "Undergraduate Student",
    membershipStatus: "STOC Member",
  };

  const cancellationReasons = [
    { key: "voluntary", label: "Voluntary Resignation" },
    { key: "retirement", label: "Retirement" },
    { key: "relocation", label: "Relocation" },
    { key: "financial", label: "Financial Reasons" },
    { key: "dissatisfaction", label: "Dissatisfaction with Services" },
    { key: "other", label: "Other" },
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

  return (
    <div className="member-header-container">
      <div className="member-header-single-card">
        {/* Profile Header Section */}
        <div className="member-header-top">
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
            <span className="member-status-badge">{memberData.status}</span>
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
          <div className="detail-row">
            <FaShieldAlt className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                {memberData.membershipStatus}
              </span>
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
          </div>
        </div>

        {/* Grade and Category Section - on blue background */}
        <div className="member-grade-section-blue">
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
        {showButtons && (
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
