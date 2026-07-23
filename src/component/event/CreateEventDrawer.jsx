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
  Upload,
  message,
  Tooltip,
} from "antd";
import { EnvironmentOutlined, InfoCircleOutlined, UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
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
  updateEventSession,
  deleteEventSession,
  uploadEventImage,
} from "../../services/eventsApi";

const DRAFT_STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
];

const PUBLISHED_STATUS_OPTIONS = [
  { label: "Published", value: "Published" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Completed", value: "Completed" },
];

// Optional additional pricing tiers - each keyed by its tierType, mirroring
// the backend's pricingTiers array shape. `enabled` drives the UI toggle;
// the other fields are only meaningful (and sent) when enabled is true.
export const DEFAULT_PRICING_TIERS = {
  EARLY_BIRD_MEMBER: { enabled: false, price: "", cutoffDate: null },
  EARLY_BIRD_NON_MEMBER: { enabled: false, price: "", cutoffDate: null },
  STUDENT: { enabled: false, price: "" },
  GROUP_STUDENT: { enabled: false, price: "", minGroupSize: "" },
};

const TIER_TYPE_TO_LABEL = {
  EARLY_BIRD_MEMBER: "Early Bird Member",
  EARLY_BIRD_NON_MEMBER: "Early Bird Non-Member",
  STUDENT: "Student",
  GROUP_STUDENT: "Group Student",
};

// Drives the four optional-tier toggle blocks in the PRICING section - kept
// as data so CreateEventDrawer and ScheduleManagementDrawer render the exact
// same fields for event-level vs per-day tiers.
export const PRICING_TIER_FIELDS = [
  { tierType: "EARLY_BIRD_MEMBER", label: "Early Bird Member Price", hasCutoff: true },
  { tierType: "EARLY_BIRD_NON_MEMBER", label: "Early Bird Non-Member Price", hasCutoff: true },
  { tierType: "STUDENT", label: "Student Price", hasCutoff: false },
  { tierType: "GROUP_STUDENT", label: "Group Student Price", hasCutoff: false, hasGroupSize: true },
];

/** Converts a loaded event/session's pricingTiers array into the keyed UI state shape. */
export function pricingTiersToState(tiers) {
  const byType = Object.fromEntries((tiers || []).map((t) => [t.tierType, t]));
  const next = {};
  for (const tierType of Object.keys(DEFAULT_PRICING_TIERS)) {
    const tier = byType[tierType];
    next[tierType] = {
      enabled: !!tier,
      price: tier?.price != null ? String(tier.price) : "",
      ...(tierType.startsWith("EARLY_BIRD_")
        ? { cutoffDate: tier?.cutoffDate ? dayjs(tier.cutoffDate) : null }
        : {}),
      ...(tierType === "GROUP_STUDENT"
        ? { minGroupSize: tier?.minGroupSize != null ? String(tier.minGroupSize) : "" }
        : {}),
    };
  }
  return next;
}

/** Converts the keyed UI state shape into the API's pricingTiers array (enabled tiers only). */
export function buildPricingTiersPayload(tiersState) {
  const state = tiersState || DEFAULT_PRICING_TIERS;
  const out = [];
  if (state.EARLY_BIRD_MEMBER?.enabled) {
    out.push({
      tierType: "EARLY_BIRD_MEMBER",
      price: Number(state.EARLY_BIRD_MEMBER.price) || 0,
      cutoffDate: state.EARLY_BIRD_MEMBER.cutoffDate
        ? dayjs(state.EARLY_BIRD_MEMBER.cutoffDate).endOf("day").toISOString()
        : null,
      isActive: true,
    });
  }
  if (state.EARLY_BIRD_NON_MEMBER?.enabled) {
    out.push({
      tierType: "EARLY_BIRD_NON_MEMBER",
      price: Number(state.EARLY_BIRD_NON_MEMBER.price) || 0,
      cutoffDate: state.EARLY_BIRD_NON_MEMBER.cutoffDate
        ? dayjs(state.EARLY_BIRD_NON_MEMBER.cutoffDate).endOf("day").toISOString()
        : null,
      isActive: true,
    });
  }
  if (state.STUDENT?.enabled) {
    out.push({ tierType: "STUDENT", price: Number(state.STUDENT.price) || 0, isActive: true });
  }
  if (state.GROUP_STUDENT?.enabled) {
    out.push({
      tierType: "GROUP_STUDENT",
      price: Number(state.GROUP_STUDENT.price) || 0,
      minGroupSize: Number(state.GROUP_STUDENT.minGroupSize) || 2,
      isActive: true,
    });
  }
  return out;
}

/** True when every enabled tier has its required companion field(s) filled in. */
export function validatePricingTiersState(tiersState) {
  const state = tiersState || DEFAULT_PRICING_TIERS;
  if (state.EARLY_BIRD_MEMBER?.enabled && (!state.EARLY_BIRD_MEMBER.price || !state.EARLY_BIRD_MEMBER.cutoffDate)) {
    return "Early Bird Member pricing needs both a price and a cutoff date";
  }
  if (
    state.EARLY_BIRD_NON_MEMBER?.enabled &&
    (!state.EARLY_BIRD_NON_MEMBER.price || !state.EARLY_BIRD_NON_MEMBER.cutoffDate)
  ) {
    return "Early Bird Non-Member pricing needs both a price and a cutoff date";
  }
  if (state.STUDENT?.enabled && !state.STUDENT.price) {
    return "Student pricing needs a price";
  }
  if (
    state.GROUP_STUDENT?.enabled &&
    (!state.GROUP_STUDENT.price || !state.GROUP_STUDENT.minGroupSize || Number(state.GROUP_STUDENT.minGroupSize) < 2)
  ) {
    return "Group Student pricing needs a price and a minimum group size of 2 or more";
  }
  return null;
}

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
  const { eventTypeOptions, eventCategoryOptions, venueOptions, accreditationBodyOptions } = useSelector(
    (state) => state.lookups,
  );

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [eventType, setEventType] = useState("");
  const [seatLimit, setSeatLimit] = useState("");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState("Draft");
  const [initialStatus, setInitialStatus] = useState("Draft");
  const [isActive, setIsActive] = useState(true);
  // eventCategoryProductTypeId is the real user-service ProductType _id the
  // admin picked (the authoritative reference); eventCategoryCode is that
  // ProductType's own `code`. Legacy pair, kept alongside the new
  // Lookup-based pair below during migration so the old backend path (GL
  // mapping via a synced Product record) keeps working until it's retired.
  const [eventCategoryProductTypeId, setEventCategoryProductTypeId] = useState("");
  const [eventCategoryCode, setEventCategoryCode] = useState("");
  // Decoupled Event Category: a user-service Lookup under LookupType "Event
  // Category" (CPD | EVENT), sourced from Redux (state.lookups.eventCategoryOptions)
  // rather than a live ProductType fetch. This is the target-state pair used
  // for the Event Type cascading filter and for account-service's GL mapping.
  const [eventCategoryLookupId, setEventCategoryLookupId] = useState("");
  const [eventCategoryLookupCode, setEventCategoryLookupCode] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [nonMemberPrice, setNonMemberPrice] = useState("");
  // Optional additional pricing tiers (early bird, student, group student) -
  // keyed by tierType, see DEFAULT_PRICING_TIERS above.
  const [pricingTiers, setPricingTiers] = useState(DEFAULT_PRICING_TIERS);
  const handleTierFieldChange = (tierType, field, value) =>
    setPricingTiers((prev) => ({ ...prev, [tierType]: { ...prev[tierType], [field]: value } }));
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

  const DEFAULT_SCHEDULE_DAY = {
    id: 1,
    day: "Day 1",
    date: null,
    location: "",
    zoomLink: "",
    isOnline: false,
    sessions: [{ id: 1, sessionId: null, startTime: dayjs("09:00", "HH:mm"), endTime: null }],
  };

  const [scheduleData, setScheduleData] = useState([{ ...DEFAULT_SCHEDULE_DAY }]);
  // Sessions removed from a loaded (edit) event's schedule - deleted on save.
  const [removedSessionIds, setRemovedSessionIds] = useState([]);

  const [costsData, setCostsData] = useState([]);

  // Once a Published event is loaded for edit, every field except Status and
  // Active locks - mirrors the backend guard in event.controller.js.
  const isLocked = Boolean(eventId) && initialStatus === "Published";

  useEffect(() => {
    if (!certificationType) setAutoIssueOnFinish(false);
  }, [certificationType]);

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

  // Event Type options filtered to the selected Event Category, via each
  // option's eventCategoryLookupId (that Event Type lookup's own
  // Parentlookupid, retained in LookupsSlice.js). Show every Event Type
  // unfiltered until a category is picked, matching today's behavior.
  const filteredEventTypeOptions = useMemo(
    () =>
      eventTypeOptions.filter(
        (opt) =>
          !eventCategoryLookupId ||
          String(opt.eventCategoryLookupId) === String(eventCategoryLookupId),
      ),
    [eventTypeOptions, eventCategoryLookupId],
  );

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
        setImageUrl(ev.imageUrl || "");
        setAllowVirtualHosting(!!ev.isVirtual);
        setStatus(ev.status || "Draft");
        setInitialStatus(ev.status || "Draft");
        setIsActive(ev.isActive !== false);
        setEventCategoryProductTypeId(ev.eventCategoryProductTypeId || "");
        setEventCategoryCode(ev.eventCategoryCode || "");
        setEventCategoryLookupId(ev.eventCategoryLookupId || "");
        setEventCategoryLookupCode(ev.eventCategoryLookupCode || "");
        setEventType(ev.eventTypeId || "");
        setMemberPrice(ev.memberPrice != null ? String(ev.memberPrice) : "");
        setNonMemberPrice(ev.nonMemberPrice != null ? String(ev.nonMemberPrice) : "");
        setPricingTiers(pricingTiersToState(ev.pricingTiers));
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
        setRemovedSessionIds([]);
        if (ev.sessions?.length) {
          setBookingOnMultipleDays(true);
          // Multiple EventSession records can share the same date - group
          // them back into one day card with several time-slot sessions,
          // the inverse of what the save logic below does.
          const sortedSessions = [...ev.sessions].sort((a, b) => {
            const dateDiff = dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
            if (dateDiff !== 0) return dateDiff;
            return (a.startTime || "").localeCompare(b.startTime || "");
          });
          const days = [];
          const dayByDateKey = new Map();
          let sessionCounter = 0;
          sortedSessions.forEach((s) => {
            const dateKey = s.date ? dayjs(s.date).format("YYYY-MM-DD") : `no-date-${days.length}`;
            let day = dayByDateKey.get(dateKey);
            if (!day) {
              day = {
                id: days.length + 1,
                day: `Day ${days.length + 1}`,
                date: s.date ? dayjs(s.date) : null,
                location: "",
                zoomLink: "",
                isOnline: !!s.isVirtual,
                sessions: [],
              };
              days.push(day);
              dayByDateKey.set(dateKey, day);
            }
            day.sessions.push({
              id: ++sessionCounter,
              sessionId: s._id,
              startTime: s.startTime ? dayjs(s.startTime, "HH:mm") : null,
              endTime: s.endTime ? dayjs(s.endTime, "HH:mm") : null,
            });
          });
          setScheduleData(days);
        } else {
          setBookingOnMultipleDays(false);
          setScheduleData([{ ...DEFAULT_SCHEDULE_DAY }]);
        }
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
        setImageUrl(ev.imageUrl || "");
        setAllowVirtualHosting(!!ev.isVirtual);
        setStatus("Draft");
        setInitialStatus("Draft");
        setIsActive(true);
        setEventCategoryProductTypeId(ev.eventCategoryProductTypeId || "");
        setEventCategoryCode(ev.eventCategoryCode || "");
        setEventCategoryLookupId(ev.eventCategoryLookupId || "");
        setEventCategoryLookupCode(ev.eventCategoryLookupCode || "");
        setEventType(ev.eventTypeId || "");
        setMemberPrice(ev.memberPrice != null ? String(ev.memberPrice) : "");
        setNonMemberPrice(ev.nonMemberPrice != null ? String(ev.nonMemberPrice) : "");
        {
          // Cloned early-bird cutoff dates are almost certainly stale (tied
          // to the source event's own timeline) - clear them like eventDate,
          // leaving the prices themselves intact for the user to edit.
          const clonedTiers = pricingTiersToState(ev.pricingTiers);
          clonedTiers.EARLY_BIRD_MEMBER.cutoffDate = null;
          clonedTiers.EARLY_BIRD_NON_MEMBER.cutoffDate = null;
          setPricingTiers(clonedTiers);
        }
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
        setRemovedSessionIds([]);
        setScheduleData([{ ...DEFAULT_SCHEDULE_DAY }]);
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

  // Image can be picked before the event is first saved - the upload
  // endpoint accepts eventId="draft" for that case, and the returned URL
  // rides along in the create/update payload afterwards.
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    setUploadingImage(true);
    try {
      const result = await uploadEventImage(eventId, file);
      if (!result?.url) throw new Error("No URL returned from upload");
      setImageUrl(result.url);
      onSuccess(result);
      message.success("Image uploaded");
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || "Failed to upload image");
      onError(err);
    } finally {
      setUploadingImage(false);
    }
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
        sessionId: null,
        day: `Day ${newDayNum}`,
        date: nextDate,
        location: venueName,
        zoomLink: "",
        isOnline: false,
        sessions: [{ id: newSessionId, sessionId: null, startTime: dayjs("09:00", "HH:mm"), endTime: null }],
      },
    ]);
  };

  const handleScheduleRemoveDay = (dayId) => {
    const removedDay = scheduleData.find((d) => d.id === dayId);
    const removedIds = (removedDay?.sessions || []).map((s) => s.sessionId).filter(Boolean);
    if (removedIds.length) {
      setRemovedSessionIds((prev) => [...prev, ...removedIds]);
    }
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

  const handleMultipleDayEventChange = (checked) => {
    setBookingOnMultipleDays(checked);
    if (!checked) {
      // Turning multi-day off removes every day but Day 1 (confirmed by the
      // user beforehand in ScheduleManagementDrawer).
      const removedIds = scheduleData
        .slice(1)
        .flatMap((day) => (day.sessions || []).map((s) => s.sessionId))
        .filter(Boolean);
      if (removedIds.length) {
        setRemovedSessionIds((prev) => [...prev, ...removedIds]);
      }
      setScheduleData((prev) => prev.slice(0, 1));
    }
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
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const existingSessions = d.sessions || [];
        const lastSession = existingSessions[existingSessions.length - 1];
        // New sessions default to starting 1 hour after the previous
        // session's end time.
        const newStartTime = lastSession?.endTime
          ? dayjs(lastSession.endTime).add(1, "hour")
          : dayjs("09:00", "HH:mm");
        return {
          ...d,
          sessions: [
            ...existingSessions,
            { id: newSessionId, sessionId: null, startTime: newStartTime, endTime: null },
          ],
        };
      })
    );
  };

  const handleRemoveSession = (dayId, sessionId) => {
    const removedDayIndex = scheduleData.findIndex((d) => d.id === dayId);
    const removedDay = scheduleData[removedDayIndex];
    const dayHadOneSession = (removedDay?.sessions?.length ?? 0) === 1;
    const removedSession = removedDay?.sessions?.find((s) => s.id === sessionId);
    if (removedSession?.sessionId) {
      setRemovedSessionIds((prev) => [...prev, removedSession.sessionId]);
    }
    const afterRemoval = scheduleData.map((d) => {
      if (d.id !== dayId) return d;
      const sessions = (d.sessions || []).filter((s) => s.id !== sessionId);
      return { ...d, sessions };
    });
    const filtered = afterRemoval.filter((d) => d.sessions?.length > 0);
    setScheduleData(
      filtered.map((day, index) => {
        const wasAfterRemoved =
          dayHadOneSession && removedDayIndex >= 0 && index >= removedDayIndex;
        const adjustedDate =
          wasAfterRemoved && day.date
            ? dayjs(day.date).subtract(1, "day")
            : day.date;
        return { ...day, date: adjustedDate, day: `Day ${index + 1}` };
      }),
    );
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
    if (!eventCategoryLookupId) {
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
    if (eventCategoryLookupId && (!memberPrice || !nonMemberPrice)) {
      message.error("Member Price and Non-Member Price are required when an Event Category is selected");
      return;
    }
    const tiersError = validatePricingTiersState(pricingTiers);
    if (tiersError) {
      message.error(tiersError);
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
        imageUrl: imageUrl || null,
        startDate,
        endDate,
        capacity: seatLimit ? Number(seatLimit) : undefined,
        status,
        isActive,
        eventCategoryProductTypeId: eventCategoryProductTypeId || undefined,
        eventCategoryCode: eventCategoryCode || undefined,
        eventCategoryLookupId: eventCategoryLookupId || undefined,
        eventCategoryLookupCode: eventCategoryLookupCode || undefined,
        eventTypeId: eventType || undefined,
        memberPrice: memberPrice ? Number(memberPrice) : undefined,
        nonMemberPrice: nonMemberPrice ? Number(nonMemberPrice) : undefined,
        pricingTiers: buildPricingTiersPayload(pricingTiers),
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

      // Persist the multi-day schedule as sessions - create/update/delete to
      // match scheduleData. A day with multiple time-slots (added via "Add
      // session") becomes one EventSession record per slot, all sharing the
      // day's date.
      if (bookingOnMultipleDays && event?._id) {
        for (const day of scheduleData) {
          if (!day.date) continue;
          const daySessions = day.sessions || [];
          for (let i = 0; i < daySessions.length; i++) {
            const session = daySessions[i];
            const sessionPayload = {
              label: daySessions.length > 1 ? `${day.day} - Session ${i + 1}` : day.day,
              date: dayjs(day.date).toISOString(),
              startTime: session.startTime ? dayjs(session.startTime).format("HH:mm") : undefined,
              endTime: session.endTime ? dayjs(session.endTime).format("HH:mm") : undefined,
              isVirtual: !!day.isOnline,
            };
            if (session.sessionId) {
              await updateEventSession(event._id, session.sessionId, sessionPayload);
            } else {
              await addEventSession(event._id, sessionPayload);
            }
          }
        }
        for (const sessionId of removedSessionIds) {
          await deleteEventSession(event._id, sessionId);
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
                      eventCategoryOptions.length
                        ? "Select Category"
                        : "None configured — create in Configuration"
                    }
                    value={eventCategoryLookupId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      const selected = eventCategoryOptions.find(
                        (opt) => String(opt.value) === String(nextId),
                      );
                      setEventCategoryLookupId(nextId);
                      setEventCategoryLookupCode(selected?.code || "");
                      // Cascading reset: clear Event Type if it no longer
                      // belongs to the newly selected category.
                      const currentEventTypeStillValid = eventTypeOptions.some(
                        (opt) =>
                          String(opt.value) === String(eventType) &&
                          String(opt.eventCategoryLookupId) === String(nextId),
                      );
                      if (!currentEventTypeStillValid) setEventType("");
                    }}
                    options={eventCategoryOptions}
                    disabled={isLocked}
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
                    options={filteredEventTypeOptions}
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
                    required={!!eventCategoryLookupId}
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
                    required={!!eventCategoryLookupId}
                  />
                </Col>
              </Row>

              <div className="pricing-tiers-block">
                {PRICING_TIER_FIELDS.map(({ tierType, label, hasCutoff, hasGroupSize }) => {
                  const tier = pricingTiers[tierType];
                  return (
                    <div key={tierType} style={{ marginBottom: 12 }}>
                      <Checkbox
                        checked={tier.enabled}
                        disabled={isLocked}
                        onChange={(e) => handleTierFieldChange(tierType, "enabled", e.target.checked)}
                      >
                        Enable {label}
                      </Checkbox>
                      {tier.enabled && (
                        <Row gutter={[16, 0]} style={{ marginTop: 8 }}>
                          <Col xs={24} sm={hasCutoff || hasGroupSize ? 12 : 24}>
                            <MyInput
                              label={label}
                              name={`${tierType}-price`}
                              type="number"
                              value={tier.price}
                              onChange={(e) => handleTierFieldChange(tierType, "price", e.target.value)}
                              placeholder="0.00"
                              prefix="€"
                              disabled={isLocked}
                              required
                            />
                          </Col>
                          {hasCutoff && (
                            <Col xs={24} sm={12}>
                              <MyDatePicker1
                                label="Cutoff Date"
                                name={`${tierType}-cutoffDate`}
                                value={tier.cutoffDate}
                                onChange={(date) => handleTierFieldChange(tierType, "cutoffDate", date)}
                                format="DD/MM/YYYY"
                                placeholder="DD/MM/YYYY"
                                disabled={isLocked}
                                required
                              />
                            </Col>
                          )}
                          {hasGroupSize && (
                            <Col xs={24} sm={12}>
                              <MyInput
                                label="Minimum Group Size"
                                name={`${tierType}-minGroupSize`}
                                type="number"
                                min="2"
                                value={tier.minGroupSize}
                                onChange={(e) => handleTierFieldChange(tierType, "minGroupSize", e.target.value)}
                                placeholder="e.g. 5"
                                suffix="people"
                                disabled={isLocked}
                                required
                              />
                            </Col>
                          )}
                        </Row>
                      )}
                    </div>
                  );
                })}
              </div>

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
                    <Tooltip title={!certificationType ? "Select a Certification Type to enable this" : ""}>
                      <span
                        className="my-input-label"
                        style={{ marginBottom: 0 }}
                      >
                        Auto-Issue on Finish
                      </span>
                    </Tooltip>
                    <Switch
                      checked={autoIssueOnFinish}
                      onChange={setAutoIssueOnFinish}
                      disabled={isLocked || !certificationType}
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

            {/* EVENT IMAGE */}
            <Card className="event-sidebar-card">
              <div className="sidebar-card-icon">🖼️</div>
              <h5 className="sidebar-card-title">Event Image</h5>
              {imageUrl ? (
                <div className="event-image-preview">
                  <img src={imageUrl} alt="Event" />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No image uploaded yet.
                </p>
              )}
              <div className="event-image-actions">
                <ImgCrop rotationSlider aspect={16 / 9} quality={0.9}>
                  <Upload
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    showUploadList={false}
                    customRequest={handleImageUpload}
                    disabled={isLocked || uploadingImage}
                  >
                    <Button
                      icon={uploadingImage ? <LoadingOutlined /> : <UploadOutlined />}
                      loading={uploadingImage}
                      disabled={isLocked}
                    >
                      {imageUrl ? "Replace Image" : "Upload Image"}
                    </Button>
                  </Upload>
                </ImgCrop>
                {imageUrl && !isLocked ? (
                  <Button
                    type="link"
                    danger
                    onClick={() => setImageUrl("")}
                    className="event-image-remove-btn"
                  >
                    Remove Image
                  </Button>
                ) : null}
              </div>
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
        onMultipleDayEventChange={handleMultipleDayEventChange}
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
