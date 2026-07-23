import React, { useEffect, useState } from "react";
import TableComponent from "../../component/common/TableComponent";
import { fetchRegistrations } from "../../services/eventsApi";

function AttendeesSummary() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRegistrations()
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setAttendees(
          rows.map((reg) => ({
            key: reg._id,
            attendeeId: reg._id,
            attendeeName: `${reg.attendeeSnapshot?.firstName || ""} ${reg.attendeeSnapshot?.lastName || ""}`.trim(),
            email: reg.attendeeSnapshot?.email,
            mobileNumber: reg.attendeeSnapshot?.phone,
            workLocation: reg.attendeeSnapshot?.workLocation,
            grade: reg.attendeeSnapshot?.grade,
            attendeeType: reg.isMemberAtRegistration ? "Member" : "Non-member",
            eventId: reg.eventId || reg.courseId,
            registrationType: reg.registrationType,
            totalFee: reg.amount,
            currency: reg.currency,
            paymentStatus: reg.paymentStatus,
            paymentMethod: reg.paymentMethod,
            status: reg.status,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setAttendees([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: "20px 0" }}>
      <TableComponent
        data={attendees}
        screenName="Attendees"
        isGrideLoading={loading}
        selectionType="checkbox"
        enableRowSelection={true}
      />
    </div>
  );
}

export default AttendeesSummary;
