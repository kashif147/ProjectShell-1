import React, { useState, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Checkbox,
  Switch,
  TimePicker,
  Input,
} from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import CustomSelect from "../common/CustomSelect";
import "../../styles/CreateEventDrawer.css";
import dayjs from "dayjs";
import ScheduleManagementDrawer from "./ScheduleManagementDrawer";
import CostsFeesDrawer from "./CostsFeesDrawer";

const CreateEventDrawer = ({ open, onClose }) => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [eventType, setEventType] = useState("");
  const [seatLimit, setSeatLimit] = useState("");
  const [description, setDescription] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [cpdCredits, setCpdCredits] = useState("5.0");
  const [accreditationBody, setAccreditationBody] = useState("NMBI");
  const [certificationType, setCertificationType] = useState(
    "Digital Certificate"
  );
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

  const [costsData, setCostsData] = useState([
    { id: 1, name: "Venue Rental", amount: "2500" },
    { id: 2, name: "Catering Service", amount: "1200" },
  ]);

  useEffect(() => {
    setScheduleData((prev) =>
      prev.length >= 1
        ? [{ ...prev[0], date: eventDate != null ? eventDate : prev[0].date }, ...prev.slice(1)]
        : prev
    );
  }, [eventDate]);

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
        location: "",
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
      prev.map((d) => (d.id === dayId ? { ...d, [field]: value } : d))
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


  const handleSave = () => {
    console.log({
      eventName,
      eventDate,
      eventType,
      seatLimit,
      description,
      venueName,
      address,
      cpdCredits,
      accreditationBody,
      certificationType,
      autoIssueOnFinish,
      accreditationType,
      allowVirtualHosting,
      bookingOnMultipleDays,
      scheduleData,
      costsData,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const headerActions = (
    <div className="event-drawer-header-actions">
      <Button
        className="header-save-btn"
        type="primary"
        onClick={handleSave}
        style={{
          backgroundColor: "#215E97",
          borderColor: "#215E97",
          padding: "0 32px",
        }}
      >
        Create
      </Button>
    </div>
  );

  const totalCosts = costsData.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0
  );

  return (
    <MyDrawer
      title="Event Configuration"
      onClose={onClose}
      open={open}
      width={1200}
      extra={headerActions}
      rootClassName="hide-scroll-webkit"
    >
      <div className="event-drawer-container hide-scroll-webkit">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* BASIC INFORMATION */}
            <div className="form-section">
              <h3 className="section-title">BASIC INFORMATION</h3>

              <MyInput
                label="Event Name"
                name="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Innovation Days 2024"
                extra={
                  <Checkbox
                    checked={bookingOnMultipleDays}
                    onChange={(e) => setBookingOnMultipleDays(e.target.checked)}
                  >
                    Booking on Multiple days
                  </Checkbox>
                }
              />

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <MyDatePicker1
                    label="Event Date"
                    name="eventDate"
                    value={eventDate}
                    onChange={setEventDate}
                    format="DD/MM/YYYY"
                    placeholder="DD/MM/YYYY"
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
                  />
                </Col>
              </Row>

              <MyInput
                label="Description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A multi-day event focused on emerging technologies and accelerative development strategies for 2024 and beyond."
                type="textarea"
                rows={3}
              />
            </div>

            {/* VENUE & LOCATION */}
            <div className="form-section">
              <h3 className="section-title">VENUE & LOCATION</h3>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Venue Name"
                    name="venueName"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="Convention Center East"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Innovation Drive, SF"
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
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <MyInput
                    label="Accreditation Body"
                    name="accreditationBody"
                    value={accreditationBody}
                    onChange={(e) => setAccreditationBody(e.target.value)}
                    placeholder="NMBI"
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} sm={12}>
                  <CustomSelect
                    label="Certification Type"
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
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* CANCEL EVENT SECTION */}
            <div className="cancel-event-section">
              <div className="cancel-event-content">
                <div className="cancel-event-text">
                  <h4 className="cancel-event-title">Cancel Event</h4>
                  <p className="cancel-event-description">
                    Permanently remove all event information and archive
                    relevant documentation.
                  </p>
                </div>
                <Button
                  danger
                  className="cancel-event-btn"
                  onClick={handleCancel}
                >
                  Cancel Event
                </Button>
              </div>
            </div>
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
