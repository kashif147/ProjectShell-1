import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import TableComponent from "../../component/common/TableComponent";
import EventRegistrationViewDrawer from "../../component/event/EventRegistrationViewDrawer";
import { fetchRegistrations } from "../../services/eventsApi";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import {
  subscribeAttendeesReload,
  registerAttendeesRowActions,
  clearAttendeesRowActions,
} from "../../utils/eventsWorkspace";
import {
  PROFILE_INVALIDATE_EVENT,
  scopesInclude,
} from "../../utils/profileRealtimeEvents";

function buildAttendeeAddress(snapshot) {
  if (!snapshot) return "";
  return [
    snapshot.addressLine1,
    snapshot.addressLine2,
    snapshot.townCity,
    snapshot.countyState,
    snapshot.eircode,
    snapshot.country,
  ]
    .map((part) => (part != null ? String(part).trim() : ""))
    .filter(Boolean)
    .join(", ");
}

function AttendeesSummary() {
  const location = useLocation();
  const { eventTypeOptions, eventCategoryOptions } = useSelector((state) => state.lookups);
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const attendeesColumns = columns.Attendees || [];
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching: templatesLoading } = useSelector(
    (state) => state.templateFiltersColumnApi,
  );
  const [attendees, setAttendees] = useState([]);
  const [attendeesSourceRows, setAttendeesSourceRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);

  const loadAttendees = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchRegistrations()
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((reg) => {
          const eventType = (eventTypeOptions || []).find(
            (opt) => String(opt.value) === String(reg.eventTypeId),
          );
          const eventCategory = (eventCategoryOptions || []).find(
            (opt) => String(opt.value) === String(reg.eventCategoryLookupId),
          );
          return {
            key: reg._id,
            attendeeId: reg._id,
            attendeeName: `${reg.attendeeSnapshot?.firstName || ""} ${reg.attendeeSnapshot?.lastName || ""}`.trim(),
            email: reg.attendeeSnapshot?.email,
            mobileNumber: reg.attendeeSnapshot?.phone,
            fullAddress: buildAttendeeAddress(reg.attendeeSnapshot),
            workLocation: reg.attendeeSnapshot?.workLocation,
            grade: reg.attendeeSnapshot?.grade,
            attendeeType: reg.isMemberAtRegistration ? "Member" : "Non-member",
            profileId: reg.profileId,
            __registration: reg,
            eventId: reg.eventId || reg.courseId,
            eventName: reg.eventTitle || "-",
            eventType: eventType?.label || "-",
            eventCategory:
              eventCategory?.label ||
              reg.eventCategoryLookupCode ||
              reg.eventCategoryCode ||
              "-",
            eventDate: reg.eventStartDate,
            registrationType: reg.registrationType,
            totalFee: reg.amount,
            currency: reg.currency,
            paymentStatus: reg.paymentStatus,
            paymentMethod: reg.paymentMethod,
            status: reg.status,
          };
        });
        setAttendeesSourceRows(mapped);
        setAttendees(applyClientSideRowFilters(mapped, filtersState, attendeesColumns));
      })
      .catch(() => {
        if (!cancelled) {
          setAttendeesSourceRows([]);
          setAttendees([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eventTypeOptions/eventCategoryOptions intentionally excluded - app-wide
    // state loaded once at startup, not something a fresh list needs to
    // re-fetch for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState, attendeesColumns]);

  // Re-fetch every time this route is navigated to, and once template
  // init completes - matches the pattern used by EventsSummary.
  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    loadAttendees();
  }, [loadAttendees, location.key, activeTemplateId, isInitialized, templatesLoading]);

  // The header's global "Add Attendee" button (HeaderDetails.jsx) owns the
  // CreateAttendeeDrawer instance for this route - refresh the grid when a
  // registration completes, via the same profile-invalidate event the drawer
  // already dispatches on success.
  useEffect(() => {
    const handleProfileInvalidate = (event) => {
      const detail = event?.detail || {};
      if (scopesInclude(detail.scopes, "events")) {
        loadAttendees();
      }
    };
    window.addEventListener(PROFILE_INVALIDATE_EVENT, handleProfileInvalidate);
    return () => {
      window.removeEventListener(PROFILE_INVALIDATE_EVENT, handleProfileInvalidate);
    };
  }, [loadAttendees]);

  // SaveViewMenu's fetchListingByTemplate signals a reload here (view
  // switch/save) via the same reload-pubsub pattern EventsSummary uses.
  useEffect(() => subscribeAttendeesReload(() => loadAttendees()), [loadAttendees]);

  // The "Registration" action column (TableColumnsContext) has no React
  // state of its own - it calls back through this module-level handler to
  // open the drawer here.
  useEffect(() => {
    registerAttendeesRowActions({
      onOpenRegistration: (record) => {
        setSelectedRegistration(record.__registration || record);
        setRegistrationDrawerOpen(true);
      },
    });
    return () => clearAttendeesRowActions();
  }, []);

  useRegisterGridFilterRows("Attendees", attendeesSourceRows, attendeesColumns);

  if (!isInitialized || templatesLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "50px",
        }}
      >
        <Spin tip="Initializing Template...">
          <div style={{ minHeight: 200, width: "100%" }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0" }}>
      <TableComponent
        data={attendees}
        screenName="Attendees"
        isGrideLoading={loading}
        selectionType="checkbox"
        enableRowSelection={true}
      />
      <EventRegistrationViewDrawer
        open={registrationDrawerOpen}
        onClose={() => setRegistrationDrawerOpen(false)}
        registration={selectedRegistration}
        onApproved={loadAttendees}
      />
    </div>
  );
}

export default AttendeesSummary;
