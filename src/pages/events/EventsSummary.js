import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { message, Spin } from "antd";
import TableComponent from "../../component/common/TableComponent";
import MyConfirm from "../../component/common/MyConfirm";
import CreateEventDrawer from "../../component/event/CreateEventDrawer";
import { fetchEvents, deleteEvent } from "../../services/eventsApi";
import {
  registerEventsHandlers,
  clearEventsHandlers,
  subscribeEventsReload,
} from "../../utils/eventsWorkspace";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";

function EventsSummary() {
  const location = useLocation();
  const { eventTypeOptions, eventCategoryOptions } = useSelector((state) => state.lookups);
  const eventsRefreshVersion = useSelector((state) => state.eventsRefresh.version);
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const eventsColumns = columns.Events || [];
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching: templatesLoading } = useSelector(
    (state) => state.templateFiltersColumnApi,
  );
  const [events, setEvents] = useState([]);
  const [eventsSourceRows, setEventsSourceRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEventId, setEditEventId] = useState(null);
  const [cloneEventId, setCloneEventId] = useState(null);

  const loadEvents = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchEvents()
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((ev) => {
          const eventType = (eventTypeOptions || []).find(
            (opt) => String(opt.value) === String(ev.eventTypeId),
          );
          // Category moved from a ProductType-code snapshot (eventCategoryCode)
          // to a decoupled Lookup reference (eventCategoryLookupId/Code) -
          // resolve via the lookup first (same as the Edit form) and fall back
          // to the legacy fields for events created before that migration.
          const eventCategory = (eventCategoryOptions || []).find(
            (opt) => String(opt.value) === String(ev.eventCategoryLookupId),
          );
          return {
            key: ev._id,
            eventId: ev._id,
            eventName: ev.title,
            eventCategory:
              eventCategory?.label ||
              ev.eventCategoryLookupCode ||
              ev.eventCategoryCode ||
              "-",
            eventType: eventType?.label || "-",
            venue: ev.isVirtual ? "Virtual" : ev.venue || "-",
            startDate: ev.startDate,
            endDate: ev.endDate,
            memberPrice: ev.memberPrice,
            nonMemberPrice: ev.nonMemberPrice,
            createdBy: ev.createdByEmail || "-",
            createdAt: ev.createdAt,
            updatedBy: ev.updatedByEmail || "-",
            status: ev.status,
          };
        });
        setEventsSourceRows(mapped);
        setEvents(applyClientSideRowFilters(mapped, filtersState, eventsColumns));
      })
      .catch(() => {
        if (!cancelled) {
          setEventsSourceRows([]);
          setEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eventTypeOptions intentionally excluded - it's app-wide state loaded once
    // at startup, not something a fresh event list needs to re-fetch for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState, eventsColumns]);

  // Re-fetch every time this route is navigated to (not just first mount) -
  // some navigation paths back into this screen keep the component instance
  // alive instead of remounting it, which previously left it showing stale
  // (or no) data until the user happened to navigate away and back again.
  // Also gated on template init - Save View filters/columns must resolve
  // before the first fetch, matching the pattern used by other grid pages.
  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    loadEvents();
  }, [
    loadEvents,
    location.key,
    eventsRefreshVersion,
    activeTemplateId,
    isInitialized,
    templatesLoading,
  ]);

  useEffect(() => subscribeEventsReload(() => loadEvents()), [loadEvents]);

  useRegisterGridFilterRows("Events", eventsSourceRows, eventsColumns);

  // Only a Draft event can be deleted - matches the backend guard in
  // event.controller.js's softDeleteEvent.
  const handleDeleteRow = useCallback((record) => {
    if (record.status !== "Draft") {
      message.error("Only Draft events can be deleted");
      return;
    }
    MyConfirm({
      title: "Delete Event",
      message: "This will permanently remove this draft event. This cannot be undone. Continue?",
      onConfirm: async () => {
        try {
          await deleteEvent(record.eventId);
          message.success("Event deleted");
          loadEvents();
        } catch (err) {
          message.error(err?.response?.data?.error?.message || err?.message || "Failed to delete event");
        }
      },
    });
  }, [loadEvents]);

  useEffect(() => {
    registerEventsHandlers({
      onEdit: (record) => setEditEventId(record.eventId),
      onClone: (record) => setCloneEventId(record.eventId),
      onDelete: handleDeleteRow,
      isDeletable: (record) => record.status === "Draft",
    });
    return () => clearEventsHandlers();
  }, [handleDeleteRow]);

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
        data={events}
        screenName="Events"
        isGrideLoading={loading}
        hideLegacyRowChrome
        rowActionsInGridmenu
      />

      <CreateEventDrawer
        open={!!editEventId}
        eventId={editEventId}
        onClose={() => {
          setEditEventId(null);
          loadEvents();
        }}
        onDeleted={() => {
          setEditEventId(null);
          loadEvents();
        }}
      />

      <CreateEventDrawer
        open={!!cloneEventId}
        cloneFromEventId={cloneEventId}
        onClose={() => {
          setCloneEventId(null);
          loadEvents();
        }}
      />
    </div>
  );
}

export default EventsSummary;
