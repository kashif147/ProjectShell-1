import React from "react";
import dayjs from "dayjs";
import { formatMobileNumber } from "../../utils/Utilities";

/**
 * Profile search dropdown row — same layout as MemberSearch.jsx results.
 * @param {{ member: object }} props
 */
export default function MemberSearchOptionLabel({ member }) {
  if (!member) return null;
  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ fontWeight: "600" }}>
        {`${member.personalInfo?.title || ""} ${member.personalInfo?.forename || ""} ${member.personalInfo?.surname || ""}`.trim()}
        <span style={{ color: "#555", fontWeight: "normal" }}>
          • {member.membershipNumber} •{" "}
          {member.contactInfo?.personalEmail || "No email"}
        </span>
      </div>
      <div style={{ fontSize: "13px", color: "#555" }}>
        📱{" "}
        {member.contactInfo?.mobileNumber
          ? formatMobileNumber(member.contactInfo.mobileNumber)
          : "No phone"}{" "}
        • 📍 {member.contactInfo?.fullAddress || "No address"}
      </div>
      <div style={{ fontSize: "13px", marginTop: "2px" }}>
        <span>
          👤 {member.additionalInformation?.membershipStatus || "Unknown"}
        </span>{" "}
        •{" "}
        <span>
          🎂{" "}
          {member.personalInfo?.dateOfBirth
            ? dayjs(member.personalInfo.dateOfBirth).format("DD/MM/YYYY")
            : "No DOB"}
        </span>{" "}
        •{" "}
        <span>💼 {member.professionalDetails?.grade || "No grade"}</span>
      </div>
    </div>
  );
}
