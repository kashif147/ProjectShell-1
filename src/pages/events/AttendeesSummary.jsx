import React from "react";
import TableComponent from "../../component/common/TableComponent";

function AttendeesSummary() {
  const attendees = [
    { key: "1", attendeeId: "ATD-001", attendeeName: "John Doe", email: "john.doe@example.com", mobileNumber: "+353 87 900 0538", fullAddress: "12 Green Park, Dublin 2, Dublin, D02 XY76, Ireland", workLocation: "Dublin North", grade: "Staff Nurse", attendeeType: "Member", eventId: "EVT-101", eventName: "Annual Nursing Conference", eventType: "Event", eventDate: "2026-07-20", totalFee: 270, paymentStatus: "Paid", status: "Registered" },
    { key: "2", attendeeId: "ATD-002", attendeeName: "Mary Smith", email: "mary.smith@example.com", mobileNumber: "+353 86 221 4580", fullAddress: "44 River Street, Cork City, Cork, T12 PK88, Ireland", workLocation: "Cork University Hospital", grade: "Clinical Nurse Manager", attendeeType: "Previous attendee", eventId: "CRS-211", eventName: "Advanced Clinical Skills", eventType: "Course", eventDate: "2026-08-04", totalFee: 150, paymentStatus: "Pending", status: "Registered" },
    { key: "3", attendeeId: "ATD-003", attendeeName: "Liam Murphy", email: "liam.murphy@example.com", mobileNumber: "+353 85 199 7342", fullAddress: "9 Harbour View, Galway, Galway, H91 LL09, Ireland", workLocation: "Galway Clinic", grade: "Nurse Specialist", attendeeType: "Member", eventId: "CRS-150", eventName: "Infection Control Essentials", eventType: "Course", eventDate: "2026-06-10", totalFee: 120, paymentStatus: "Refunded", status: "Cancelled" },
    { key: "4", attendeeId: "ATD-004", attendeeName: "Sarah Kelly", email: "sarah.kelly@example.com", mobileNumber: "+353 89 650 1119", fullAddress: "6 Meadow Court, Limerick, Limerick, V94 KD10, Ireland", workLocation: "UL Hospital Group", grade: "Midwife", attendeeType: "Member", eventId: "EVT-101", eventName: "Annual Nursing Conference", eventType: "Event", eventDate: "2026-07-20", totalFee: 270, paymentStatus: "Paid", status: "Registered" },
    { key: "5", attendeeId: "ATD-005", attendeeName: "Noah Byrne", email: "noah.byrne@example.com", mobileNumber: "+353 87 312 0044", fullAddress: "18 Hill Road, Kilkenny Town, Kilkenny, R95 MX11, Ireland", workLocation: "St Luke's General Hospital", grade: "Senior Nurse", attendeeType: "Previous attendee", eventId: "EVT-099", eventName: "Leadership Forum", eventType: "Event", eventDate: "2026-05-02", totalFee: 180, paymentStatus: "Unpaid", status: "Cancelled" },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      <TableComponent
        data={attendees}
        screenName="Attendees"
        isGrideLoading={false}
        selectionType="checkbox"
        enableRowSelection={true}
      />
    </div>
  );
}

export default AttendeesSummary;
