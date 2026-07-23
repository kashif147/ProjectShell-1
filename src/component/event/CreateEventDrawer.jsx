import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { bumpEventsRefresh } from "../../features/events/EventsRefreshSlice";
import {
  Button,
  Row,
  Col,
  Card,
  Checkbox,
  Switch,
  TimePicker,
  Input,
  message,
  Tooltip,
} from "antd";
import { EnvironmentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import CustomSelect from "../common/CustomSelect";
import MyConfirm from "../common/MyConfirm";
import "../../styles/CreateEventDrawer.css";
import dayjs from "dayjs";
import ScheduleManagementDrawer from "./ScheduleManagementDrawer";
import CostsFeesDrawer from "./CostsFeesDrawer";
import {
  createEvent,
  updateEvent as updateEventApi,
  deleteEvent,
  fetchEventById,
  addEventSession,
} from "../../services/eventsApi";
import { fetchEventCategoryProductTypes } from "../../services/productTypesApi";

const DRAFT_STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
];

const PUBLISHED_STATUS_OPTIONS = [
  { label: "Published", value: "Published" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Completed", value: "Completed" },
];

const DESCRIPTION_EDITOR_MODULES = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const CreateEventDrawer = ({ open, onClose, eventId, onDeleted, cloneFromEventId }) => {
  const dispatch = useDispatch();
  const { eventTypeOptions, venueOptions, accreditationBodyOptions } = useSelector(
    (state) => state.lookups,
  );

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [eventType, setEventType] = useState("");
  const [seatLimit, setSeatLimit] = useState("");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState("");
  const [status, setStatus] = useState("Draft");
  const [initialStatus, setInitialStatus] = useState("Draft");
  const [isActive, setIsActive] = useState(true);
  // eventCategoryProductTypeId is the real user-service ProductType _id the
  // admin picked (the authoritative reference); eventCategoryCode is that
  // ProductType's own `code`, derived from the fetched list below, kept
  // alongside for display/GL-mapping - never hardcoded or guessed.
  const [eventCategoryProductTypeId, setEventCategoryProductTypeId] = useState("");
  const [eventCategoryCode, setEventCategoryCode] = useState("");
  const [eventCategoryOptions, setEventCategoryOptions] = useState([]);
  const [loadingEventCategories, setLoadingEventCategories] = useState(true);
  const [eventCategoryLoadError, setEventCategoryLoadError] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [nonMemberPrice, setNonMemberPrice] = useState("");
  // Days before startDate up to which a refund is allowed - 0 means no
  // refunds. Left empty (rather than defaulted) so the user must explicitly
  // choose a value.
  const [refundPolicyDays, setRefundPolicyDays] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [cpdCredits, setCpdCredits] = useState("");
  const [accreditationBody, setAccreditationBody] = useState("");
  const [certificationType, setCertificationType] = useState("");
  const [autoIssueOnFinish, setAutoIssueOnFinish] = useState(true);
  const [accreditationType, setAccreditationType] = useState("");
  const [allowVirtualHosting, setAllowVirtualHosting] = useState(false);
  const [bookingOnMultipleDays, setBookingOnMultipleDays] = useState(false);
  const [isScheduleDrawerVisible, setIsScheduleDrawerVisible] = useState(false);
  const [isCostsDrawerVisible, setIsCostsDrawerVisible] = useState(false);

  const [scheduleData, setScheduleData] = useState([
    {
      id: 1,
      day: "Day 1",
      date: null,
      location: "",
      zoomLink: "",
      isOnline: false,
      sessions: [{ id: 1, startTime: null, endTime: null }],
    },
  ]);

  const [costsData, setCostsData] = useState([]);

  // Once a Published event is loaded for edit, every field except Status and
  // Active locks - mirrors the backend guard in event.controller.js.
  const isLocked = Boolean(eventId) && initialStatus === "Published";

  // Event Category options are real ProductType records fetched from Product
  // Management, not a hardcoded list - if neither the CPD nor Events
  // ProductType has been set up yet, the dropdown is empty and says so,
  // instead of letting a save fail deep in the Product/Pricing link step.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingEventCategories(true);
    setEventCategoryLoadError("");
    fetchEventCategoryProductTypes()
      .then((productTypes) => {
        if (cancelled) return;
        setEventCategoryOptions(
          productTypes.map((pt) => ({
            value: pt._id,
            key: pt._id,
            label: pt.name,
            code: pt.code,
          })),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setEventCategoryOptions([]);
        // Surface the real reason (e.g. 403 = missing product-type:read
        // permission) instead of looking identical to "none configured yet".
        setEventCategoryLoadError(
          err?.response?.status === 403
            ? "You don't have permission to view Product Types (missing product-type:read)."
            : err?.response?.data?.error?.message || err?.message || "Failed to load Event Categories",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingEventCategories(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Selected Venue lookup (pulled from Configuration > Venue), with its address.
  const selectedVenue = useMemo(
    () => venueOptions.find((v) => String(v.value) === String(venueId)) || null,
    [venueOptions, venueId],
  );
  const venueName = selectedVenue?.label || "";
  const venueAddressDisplay = useMemo(() => {
    const addr = selectedVenue?.venueAddress;
    if (!addr) return "";
    return (
      addr.fullAddress ||
      [addr.buildingOrHouse, addr.streetOrRoad, addr.areaOrTown, addr.countyCityOrPostCode, addr.country, addr.eircode]
        .filter(Boolean)
        .join(", ")
    );
  }, [selectedVenue]);

  useEffect(() => {
    if (!open || !eventId) return;
    let cancelled = false;
    setLoadingEvent(true);
    (async () => {
      try {
        const ev = await fetchEventById(eventId);
        if (cancelled || !ev) return;
        setEventName(ev.title || "");
        setDescription(ev.description || "");
        setEventDate(ev.startDate ? dayjs(ev.startDate) : null);
        setSeatLimit(ev.capacity != null ? String(ev.capacity) : "");
        setVenueId(ev.venueId || "");
        setAllowVirtualHosting(!!ev.isVirtual);
        setStatus(ev.status || "Draft");
        setInitialStatus(ev.status || "Draft");
        setIsActive(ev.isActive !== false);
        setEventCategoryProductTypeId(ev.eventCategoryProductTypeId || "");
        setEventCategoryCode(ev.eventCategoryCode || "");
        setEventType(ev.eventTypeId || "");
        setMemberPrice(ev.memberPrice != null ? String(ev.memberPrice) : "");
        setNonMemberPrice(ev.nonMemberPrice != null ? String(ev.nonMemberPrice) : "");
        setRefundPolicyDays(ev.refundPolicyDays != null ? String(ev.refundPolicyDays) : "");
        setCpdCredits(ev.cpdCredits != null ? String(ev.cpdCredits) : "");
        setAccreditationBody(ev.accreditationBody || "");
        setCertificationType(ev.certificationType || "");
        setAutoIssueOnFinish(ev.autoIssueOnFinish !== false);
        setCostsData(
          (ev.costs || []).map((c, idx) => ({
            id: idx + 1,
            name: c.name || "",
            amount: c.amount != null ? String(c.amount) : "0",
          })),
        );
      } catch (err) {
        message.error(err?.response?.data?.error?.message || err?.message || "Failed to load event");
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, eventId]);

  // Clone: seed every field from the source event except Event Date and the
  // schedule/status, which reset so the user picks a fresh date and timeslot
  // instead of unknowingly reusing the original's.
  useEffect(() => {
    if (!open || eventId || !cloneFromEventId) return;
    let cancelled = false;
    setLoadingEvent(true);
    (async () => {
      try {
        const ev = await fetchEventById(cloneFromEventId);
        if (cancelled || !ev) return;
        setEventName(ev.title ? `${ev.title} (Copy)` : "");
        setDescription(ev.description || "");
        setEventDate(null);
        setSeatLimit(ev.capacity != null ? String(ev.capacity) : "");
        setVenueId(ev.venueId || "");
        setAllowVirtualHosting(!!ev.isVirtual);
        setStatus("Draft");
        setInitialStatus("Draft");
        setIsActive(true);
        setEventCategoryProductTypeId(ev.eventCategoryProductTypeId || "");
        setEventCategoryCode(ev.eventCategoryCode || "");
        setEventType(ev.eventTypeId || "");
        setMemberPrice(ev.memberPrice != null ? String(ev.memberPrice) : "");
        setNonMemberPrice(ev.nonMemberPrice != null ? String(ev.nonMemberPrice) : "");
        setRefundPolicyDays(ev.refundPolicyDays != null ? String(ev.refundPolicyDays) : "");
        setCpdCredits(ev.cpdCredits != null ? String(ev.cpdCredits) : "");
        setAccreditationBody(ev.accreditationBody || "");
        setCertificationType(ev.certificationType || "");
        setAutoIssueOnFinish(ev.autoIssueOnFinish !== false);
        setCostsData(
          (ev.costs || []).map((c, idx) => ({
            id: idx + 1,
            name: c.name || "",
            amount: c.amount != null ? String(c.amount) : "0",
          })),
        );
        setBookingOnMultipleDays(false);
        setScheduleData([
          {
            id: 1,
            day: "Day 1",
            date: null,
            location: "",
            zoomLink: "",
            isOnline: false,
            sessions: [{ id: 1, startTime: null, endTime: null }],
          },
        ]);
      } catch (err) {
        message.error(err?.response?.data?.error?.message || err?.message || "Failed to load event to clone");
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, eventId, cloneFromEventId]);

  useEffect(() => {
    setScheduleData((prev) =>
      prev.length >= 1
        ? [{ ...prev[0], date: eventDate != null ? eventDate : prev[0].date }, ...prev.slice(1)]
        : prev
    );
  }, [eventDate]);

  // Default each in-person day's schedule location to the event Venue Name,
  // without clobbering a location the user has since typed something else into.
  const lastAutoVenueRef = useRef("");
  useEffect(() => {
    setScheduleData((prev) =>
      prev.map((day) => {
        if (day.isOnline) return day;
        const wasAutoFilledOrEmpty = !day.location || day.location === lastAutoVenueRef.current;
        return wasAutoFilledOrEmpty ? { ...day, location: venueName } : day;
      })
    );
    lastAutoVenueRef.current = venueName;
  }, [venueName]);

  const totalSessionCount = scheduleData.reduce((sum, d) => sum + (d.sessions?.length ?? 0), 0);
  const dayCount = scheduleData.length;

  const handleScheduleClick = (e) => {
    e.preventDefault();
    setIsScheduleDrawerVisible(true);
  };

  const handleCostsClick = (e) => {
    e.preventDefault();
    setIsCostsDrawerVisible(true);
  };

  const handleScheduleDrawerClose = () => {
    setIsScheduleDrawerVisible(false);
  };

  const handleCostsDrawerClose = () => {
    setIsCostsDrawerVisible(false);
  };

  const handleScheduleSubmit = () => {
    setIsScheduleDrawerVisible(false);
  };

  const handleCostsSubmit = () => {
    setIsCostsDrawerVisible(false);
  };

  const getAllSessionIds = () =>
    scheduleData.flatMap((d) => (d.sessions || []).map((s) => s.id));

  const handleScheduleAddDay = () => {
    const newDayId =
      scheduleData.length > 0 ? Math.max(...scheduleData.map((d) => d.id)) + 1 : 1;
    const newSessionId =
      getAllSessionIds().length > 0 ? Math.max(...getAllSessionIds()) + 1 : 1;
    const newDayNum = scheduleData.length + 1;
    const lastDay = scheduleData[scheduleData.length - 1];
    const nextDate = lastDay?.date ? dayjs(lastDay.date).add(1, "day") : dayjs();
    setScheduleData([
      ...scheduleData,
      {
        id: newDayId,
        day: `Day ${newDayNum}`,
        date: nextDate,
        location: venueName,
        zoomLink: "",
        isOnline: false,
        sessions: [{ id: newSessionId, startTime: null, endTime: null }],
      },
    ]);
  };

  const handleScheduleRemoveDay = (dayId) => {
    const removedIndex = scheduleData.findIndex((d) => d.id === dayId);
    const newData = scheduleData
      .filter((d) => d.id !== dayId)
      .map((day, index) => {
        const wasAfterRemoved = index >= removedIndex;
        const adjustedDate =
          wasAfterRemoved && day.date
            ? dayjs(day.date).subtract(1, "day")
            : day.date;
        return {
          ...day,
          date: adjustedDate,
          day: `Day ${index + 1}`,
        };
      });
    setScheduleData(newData);
  };

  const handleDayChange = (dayId, field, value) => {
    setScheduleData((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const next = { ...d, [field]: value };
        // Switching a day back to in-person defaults its location to the
        // event Venue Name if it doesn't already have one set.
        if (field === "isOnline" && value === false && !d.location) {
          next.location = venueName;
        }
        return next;
      })
    );
  };

  const SESSION_GAP_MINUTES = 15;

  const handleSessionTimeChange = (dayId, sessionId, field, value) => {
    setScheduleData((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const sessions = [...(d.sessions || [])];
        const idx = sessions.findIndex((s) => s.id === sessionId);
        if (idx < 0) return d;

        const apply = (arr, i, updates) => {
          const next = [...arr];
          next[i] = { ...next[i], ...updates };
          return next;
        };

        if (field === "startTime") {
          let newStart = value;
          let newSessions = sessions.map((s, i) => (i === idx ? { ...s, startTime: newStart } : { ...s }));

          if (newStart && newSessions[idx].endTime) {
            const end = dayjs(newSessions[idx].endTime);
            if (!dayjs(newStart).isBefore(end, "minute")) {
              newSessions[idx].endTime = dayjs(newStart).add(SESSION_GAP_MINUTES, "minute");
            }
          }
          if (idx > 0 && newStart && newSessions[idx - 1].endTime) {
            const prevEnd = dayjs(newSessions[idx - 1].endTime);
            if (!dayjs(newStart).isAfter(prevEnd, "minute")) {
              let prevNewEnd = dayjs(newStart).subtract(SESSION_GAP_MINUTES, "minute");
              const prevStart = newSessions[idx - 1].startTime && dayjs(newSessions[idx - 1].startTime);
              if (prevStart && !prevNewEnd.isAfter(prevStart)) {
                prevNewEnd = prevStart.add(SESSION_GAP_MINUTES, "minute");
              }
              newSessions[idx - 1].endTime = prevNewEnd;
            }
          }
          return { ...d, sessions: newSessions };
        }

        if (field === "endTime") {
          let newEnd = value;
          let newSessions = sessions.map((s, i) => (i === idx ? { ...s, endTime: newEnd } : { ...s }));

          if (newEnd && newSessions[idx].startTime) {
            const start = dayjs(newSessions[idx].startTime);
            if (!dayjs(newEnd).isAfter(start, "minute")) {
              newSessions[idx].endTime = dayjs(start).add(SESSION_GAP_MINUTES, "minute");
              newEnd = newSessions[idx].endTime;
            }
          }
          if (idx < newSessions.length - 1 && newEnd && newSessions[idx + 1].startTime) {
            const nextStart = dayjs(newSessions[idx + 1].startTime);
            if (!dayjs(newEnd).isBefore(nextStart, "minute")) {
              newSessions[idx + 1].startTime = dayjs(newEnd).add(SESSION_GAP_MINUTES, "minute");
            }
          }
          return { ...d, sessions: newSessions };
        }

        return { ...d, sessions: apply(sessions, idx, { [field]: value }) };
      })
    );
  };

  const handleAddSessionToDay = (dayId) => {
    const newSessionId =
      getAllSessionIds().length > 0 ? Math.max(...getAllSessionIds()) + 1 : 1;
    setScheduleData((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              sessions: [
                ...(d.sessions || []),
                { id: newSessionId, startTime: null, endTime: null },
              ],
            }
          : d
      )
    );
  };

  const handleRemoveSession = (dayId, sessionId) => {
    setScheduleData((prev) => {
      const removedDayIndex = prev.findIndex((d) => d.id === dayId);
      const dayHadOneSession = (prev[removedDayIndex]?.sessions?.length ?? 0) === 1;
      const afterRemoval = prev.map((d) => {
        if (d.id !== dayId) return d;
        const sessions = (d.sessions || []).filter((s) => s.id !== sessionId);
        return { ...d, sessions };
      });
      const filtered = afterRemoval.filter((d) => d.sessions?.length > 0);
      return filtered.map((day, index) => {
        const wasAfterRemoved =
          dayHadOneSession && removedDayIndex >= 0 && index >= removedDayIndex;
        const adjustedDate =
          wasAfterRemoved && day.date
            ? dayjs(day.date).subtract(1, "day")
            : day.date;
        return { ...day, date: adjustedDate, day: `Day ${index + 1}` };
      });
    });
  };

  const handleAddCost = () => {
    const newId =
      costsData.length > 0 ? Math.max(...costsData.map((c) => c.id)) + 1 : 1;
    setCostsData([...costsData, { id: newId, name: "", amount: "0" }]);
  };

  const handleRemoveCost = (id) => {
    setCostsData(costsData.filter((cost) => cost.id !== id));
  };

  const handleCostChange = (id, field, value) => {
    setCostsData((prev) =>
      prev.map((cost) => (cost.id === id ? { ...cost, [field]: value } : cost))
    );
  };

  // Schedule Management only collects a time-of-day (no date) per session -
  // merge it onto the day's date so Event.startDate/endDate carry a real
  // time instead of defaulting to midnight.
  const combineDateAndTime = (date, time) => {
    if (!date) return null;
    const d = dayjs(date);
    if (!time) return d;
    const t = dayjs(time);
    return d.hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
  };


  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (isLocked) {
      setSaving(true);
      try {
        await updateEventApi(eventId, { status, isActive });
        message.success("Event updated");
        dispatch(bumpEventsRefresh());
        onClose();
      } catch (err) {
        message.error(err?.response?.data?.error?.message || err?.message || "Failed to update event");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!eventName) {
      message.error("Event name is required");
      return;
    }
    if (!eventCategoryProductTypeId) {
      message.error("Event category is required");
      return;
    }
    if (!eventDate) {
      message.error("Start date is required");
      return;
    }
    if (!description.replace(/<[^>]*>/g, "").trim()) {
      message.error("Description is required");
      return;
    }
    if (!venueId) {
      message.error("Venue is required");
      return;
    }
    if (refundPolicyDays === "") {
      message.error("Refund policy is required");
      return;
    }
    if (Number(refundPolicyDays) < 0) {
      message.error("Refund policy must be 0 or more days");
      return;
    }
    if (eventCategoryProductTypeId && (!memberPrice || !nonMemberPrice)) {
      message.error("Member Price and Non-Member Price are required when an Event Category is selected");
      return;
    }

    setSaving(true);
    try {
      // Span the event across the earliest and latest scheduled day, not
      // array position - a day's date can be edited to any value, so it
      // isn't guaranteed to stay in chronological order in scheduleData.
      const daysWithDates = scheduleData.filter((d) => d.date);
      const minDateDay =
        daysWithDates.reduce(
          (min, d) => (!min || dayjs(d.date).isBefore(dayjs(min.date), "day") ? d : min),
          null,
        ) || scheduleData[0];
      const maxDateDay =
        daysWithDates.reduce(
          (max, d) => (!max || dayjs(d.date).isAfter(dayjs(max.date), "day") ? d : max),
          null,
        ) || scheduleData[scheduleData.length - 1];

      const firstSession = minDateDay?.sessions?.[0];
      const startDateTime =
        combineDateAndTime(minDateDay?.date || eventDate, firstSession?.startTime) ||
        dayjs(eventDate);
      const startDate = startDateTime.toISOString();

      const maxDaySessions = maxDateDay?.sessions || [];
      const lastSession = maxDaySessions[maxDaySessions.length - 1];
      const endDateTime =
        combineDateAndTime(
          maxDateDay?.date || minDateDay?.date || eventDate,
          lastSession?.endTime || lastSession?.startTime,
        ) || startDateTime;
      const endDate = endDateTime.toISOString();

      const payload = {
        title: eventName,
        description,
        venueId: venueId || undefined,
        venue: venueName
          ? `${venueName}${venueAddressDisplay ? `, ${venueAddressDisplay}` : ""}`
          : undefined,
        isVirtual: allowVirtualHosting,
        startDate,
        endDate,
        capacity: seatLimit ? Number(seatLimit) : undefined,
        status,
        isActive,
        eventCategoryProductTypeId: eventCategoryProductTypeId || undefined,
        eventCategoryCode: eventCategoryCode || undefined,
        eventTypeId: eventType || undefined,
        memberPrice: memberPrice ? Number(memberPrice) : undefined,
        nonMemberPrice: nonMemberPrice ? Number(nonMemberPrice) : undefined,
        refundPolicyDays: Number(refundPolicyDays),
        cpdCredits: cpdCredits ? Number(cpdCredits) : undefined,
        accreditationBody: accreditationBody || undefined,
        certificationType: certificationType || undefined,
        autoIssueOnFinish,
        costs: costsData
          .filter((c) => c.name)
          .map((c) => ({ name: c.name, amount: Number(c.amount) || 0 })),
      };

      const event = eventId
        ? await updateEventApi(eventId, payload)
        : await createEvent(payload);

      // Persist multi-day schedule as sessions (per-session registration
      // pricing is not modelled per-day - configure via product catalog).
      if (!eventId && bookingOnMultipleDays && event?._id) {
        for (const day of scheduleData) {
          if (!day.date) continue;
          await addEventSession(event._id, {
            label: day.day,
            date: dayjs(day.date).toISOString(),
          });
        }
      }

      if (event?.__syncWarning) {
        message.warning(event.__syncWarning);
      }
      message.success(eventId ? "Event updated" : "Event created");
      dispatch(bumpEventsRefresh());
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || `Failed to ${eventId ? "update" : "create"} event`);
    } finally {
      setSaving(false);
    }
  };

  // Only a saved Draft event can be deleted - matches the backend guard in
  // event.controller.js's softDeleteEvent.
  const canDelete = Boolean(eventId) && initialStatus === "Draft";

  const [deleting, setDeleting] = useState(false);

  const handleDeleteEvent = () => {
    MyConfirm({
      title: "Delete Event",
      message: "This will permanently remove this draft event. This cannot be undone. Continue?",
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteEvent(eventId);
          message.success("Event deleted");
          dispatch(bumpEventsRefresh());
          if (onDeleted) {
            onDeleted();
          } else {
            onClose();
          }
        } catch (err) {
          message.error(err?.response?.data?.error?.message || err?.message || "Failed to delete event");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const headerActions = (
    <div className="event-drawer-header-actions">
      <Button
        className="header-save-btn"
        type="primary"
        loading={saving}
        onClick={handleSave}
        style={{
          backgroundColor: "var(--app-brand-primary)",
          borderColor: "var(--app-brand-primary)",
          padding: "0 32px",
        }}
      >
        Save
      </Button>
    </div>
  );

  const totalCosts = costsData.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0
  );

  return (
    <MyDrawer
      title={eventId ? "Edit Event" : cloneFromEventId ? "Clone Event" : "Event Configuration"}
      onClose={onClose}
      open={open}
      width={1200}
      extra={headerActions}
      isLoading={loadingEvent}
      rootClassName="hide-scroll-webkit"
    >
      <div className="event-drawer-container hide-scroll-webkit">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* BASIC INFORMATION */}
            <div className="form-section">
              <h3 className="section-title">BASIC INFORMATION</h3>

              <Row gutter={[16, 0]} align="bottom">
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={initialStatus === "Published" ? PUBLISHED_STATUS_OPTIONS : DRAFT_STATUS_OPTIONS}
                    isIDs={true}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div className="my-input-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1">
                        <label className="my-input-label mb-0" style={{ visibility: "hidden" }}>
                          Active
                        </label>
                      </div>
                    </div>
                    <div
                      className="my-input-container"
                      style={{ border: "none", background: "transparent" }}
                    >
                      <Checkbox
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      >
                        Active
                      </Checkbox>
                    </div>
                  </div>
                </Col>
              </Row>

              <MyInput
                label="Event Name"
                name="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Innovation Days 2024"
                disabled={isLocked}
                required
              />

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Event Category"
                    placeholder={
                      loadingEventCategories
                        ? "Loading categories..."
                        : eventCategoryLoadError
                          ? "Failed to load — see message below"
                          : eventCategoryOptions.length
                            ? "Select Category"
                            : "None configured — create in Product Management"
                    }
                    value={eventCategoryProductTypeId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      const selected = eventCategoryOptions.find(
                        (opt) => String(opt.value) === String(nextId),
                      );
                      setEventCategoryProductTypeId(nextId);
                      setEventCategoryCode(selected?.code || "");
                    }}
                    options={eventCategoryOptions}
                    disabled={isLocked || loadingEventCategories}
                    hasError={!!eventCategoryLoadError}
                    errorMessage={eventCategoryLoadError}
                    isIDs={true}
                    required
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Event Type"
                    placeholder="Select Type (optional)"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    options={eventTypeOptions}
                    disabled={isLocked}
                    isIDs={true}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <MyDatePicker1
                    label="Start Date"
                    name="eventDate"
                    value={eventDate}
                    onChange={(date) => {
                      setEventDate(date);
                      // Adding a date is the trigger to start configuring
                      // times/days - open Schedule Management right away.
                      if (date) setIsScheduleDrawerVisible(true);
                    }}
                    format="DD/MM/YYYY"
                    placeholder="DD/MM/YYYY"
                    disabled={isLocked}
                    required
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Seat Limit"
                    name="seatLimit"
                    type="number"
                    value={seatLimit}
                    onChange={(e) => setSeatLimit(e.target.value)}
                    placeholder="e.g. 100"
                    disabled={isLocked}
                  />
                </Col>
              </Row>

              <div className="my-input-wrapper">
                <label className="my-input-label mb-0">
                  Description<span className="required-star"> *</span>
                </label>
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                  readOnly={isLocked}
                  placeholder="A multi-day event focused on emerging technologies and accelerative development strategies for 2024 and beyond."
                  modules={DESCRIPTION_EDITOR_MODULES}
                  className="event-description-editor"
                />
              </div>
            </div>

            {/* VENUE & LOCATION */}
            <div className="form-section">
              <h3 className="section-title">VENUE & LOCATION</h3>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Venue"
                    placeholder="Select Venue"
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    options={venueOptions}
                    disabled={isLocked}
                    isIDs={true}
                    showSearch
                    required
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Address"
                    name="venueAddressDisplay"
                    value={venueAddressDisplay}
                    disabled
                    placeholder="Address populates from the selected venue"
                  />
                </Col>
              </Row>
            </div>

            {/* PRICING */}
            <div className="form-section">
              <h3 className="section-title">PRICING</h3>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Member Price"
                    name="memberPrice"
                    type="number"
                    value={memberPrice}
                    onChange={(e) => setMemberPrice(e.target.value)}
                    placeholder="0.00"
                    prefix="€"
                    disabled={isLocked}
                    required={!!eventCategoryProductTypeId}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Non-Member Price"
                    name="nonMemberPrice"
                    type="number"
                    value={nonMemberPrice}
                    onChange={(e) => setNonMemberPrice(e.target.value)}
                    placeholder="0.00"
                    prefix="€"
                    disabled={isLocked}
                    required={!!eventCategoryProductTypeId}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <MyInput
                    label={
                      <>
                        Refund Policy
                        <span className="required-star"> *</span>{" "}
                        <Tooltip title="Number of days before the event up to which a refund is allowed. Enter 0 for no refunds.">
                          <InfoCircleOutlined style={{ color: "var(--theme-text-muted)", cursor: "help" }} />
                        </Tooltip>
                      </>
                    }
                    name="refundPolicyDays"
                    type="number"
                    min="0"
                    value={refundPolicyDays}
                    onChange={(e) => setRefundPolicyDays(e.target.value)}
                    placeholder="0"
                    suffix="days before event"
                    disabled={isLocked}
                  />
                </Col>
              </Row>
            </div>

            {/* CPD & ACCREDITATIONS */}
            <div className="form-section cpd-section">
              <h3 className="section-title">CPD & ACCREDITATIONS</h3>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="CPD Credits"
                    name="cpdCredits"
                    value={cpdCredits}
                    onChange={(e) => setCpdCredits(e.target.value)}
                    placeholder="5.0"
                    suffix="HRS"
                    disabled={isLocked}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Accreditation Body"
                    placeholder="Select Accreditation Body"
                    value={accreditationBody}
                    onChange={(e) => setAccreditationBody(e.target.value)}
                    options={accreditationBodyOptions}
                    disabled={isLocked}
                    showSearch
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Certification Type"
                    placeholder="Select Certification Type"
                    value={certificationType}
                    onChange={(e) => setCertificationType(e.target.value)}
                    options={[
                      {
                        label: "Digital Certificate",
                        value: "Digital Certificate",
                      },
                      {
                        label: "Paper Certificate",
                        value: "Paper Certificate",
                      },
                      { label: "Both", value: "Both" },
                    ]}
                    isMarginBtm={false}
                    disabled={isLocked}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div
                    className="cpd-switch-container"
                    style={{
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="my-input-label"
                      style={{ marginBottom: 0 }}
                    >
                      Auto-Issue on Finish
                    </span>
                    <Switch
                      checked={autoIssueOnFinish}
                      onChange={setAutoIssueOnFinish}
                      disabled={isLocked}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* DELETE EVENT SECTION - Draft only */}
            {canDelete && (
              <div className="cancel-event-section">
                <div className="cancel-event-content">
                  <div className="cancel-event-text">
                    <h4 className="cancel-event-title">Delete Event</h4>
                    <p className="cancel-event-description">
                      Permanently remove this draft event. This cannot be undone.
                    </p>
                  </div>
                  <Button
                    danger
                    className="cancel-event-btn"
                    loading={deleting}
                    onClick={handleDeleteEvent}
                  >
                    Delete Event
                  </Button>
                </div>
              </div>
            )}
          </Col>

          {/* RIGHT SIDEBAR */}
          <Col xs={24} lg={8}>
            {/* SCHEDULE */}
            <Card className="event-sidebar-card">
              <div className="sidebar-card-icon">📅</div>
              <h5 className="sidebar-card-title">Schedule</h5>
              <p className="text-sm text-slate-500">
                {dayCount} {dayCount === 1 ? "Day" : "Days"}, {totalSessionCount}{" "}
                {totalSessionCount === 1 ? "Session" : "Sessions"}
              </p>
              <a
                href="#/"
                className="sidebar-card-link"
                onClick={handleScheduleClick}
              >
                Go to Schedule Management
              </a>
            </Card>

            {/* COSTS & FEES */}
            <Card className="event-sidebar-card">
              <div className="sidebar-card-icon">💰</div>
              <h5 className="sidebar-card-title">Costs & Fees</h5>
              <div className="cost-display">
                <span className="cost-currency">€</span>
                <span className="cost-amount">
                  {totalCosts.toLocaleString()}
                </span>
                <span className="cost-period">total</span>
              </div>
              <div className="cost-progress">
                <div
                  className="cost-progress-bar"
                  style={{ width: "65%" }}
                ></div>
              </div>
              <a
                href="#/"
                className="sidebar-card-link"
                style={{ marginTop: "12px", display: "block" }}
                onClick={handleCostsClick}
              >
                Manage Costs & Fees
              </a>
            </Card>

            {/* CONFIGURATION TIP */}
            <Card className="event-sidebar-card tip-card">
              <div className="tip-card-icon">⚙️</div>
              <h6 className="tip-card-title">Configuration Tip</h6>
              <p className="tip-card-text">
                Ensure your CPD credits are accurate and the time of publication
                to prevent conflicts or attendances.
              </p>
              <a href="#/" className="tip-card-link">
                Learn more
              </a>
            </Card>
          </Col>
        </Row>
      </div>

      <ScheduleManagementDrawer
        open={isScheduleDrawerVisible}
        onClose={handleScheduleDrawerClose}
        onSave={handleScheduleSubmit}
        scheduleData={scheduleData}
        onDayChange={handleDayChange}
        onSessionTimeChange={handleSessionTimeChange}
        onAddDay={handleScheduleAddDay}
        onRemoveDay={handleScheduleRemoveDay}
        onAddSessionToDay={handleAddSessionToDay}
        onRemoveSession={handleRemoveSession}
        allowAddDay={bookingOnMultipleDays}
        multipleDayEvent={bookingOnMultipleDays}
        onMultipleDayEventChange={setBookingOnMultipleDays}
        multipleDayEventDisabled={isLocked}
      />

      <CostsFeesDrawer
        open={isCostsDrawerVisible}
        onClose={handleCostsDrawerClose}
        costsData={costsData}
        onCostChange={handleCostChange}
        onAddCost={handleAddCost}
        onRemoveCost={handleRemoveCost}
        onSave={handleCostsSubmit}
      />
    </MyDrawer>
  );
};

export default CreateEventDrawer;
