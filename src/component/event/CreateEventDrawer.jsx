import React, { useState } from "react";
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
      date: dayjs("04/12/2024", "DD/MM/YYYY"),
      location: "Commercial Unit, 20 Ringrose",
      zoomLink: "",
      isOnline: false,
      startTime: null,
      endTime: null,
    },
    {
      id: 2,
      day: "Day 2",
      date: dayjs("05/12/2024", "DD/MM/YYYY"),
      location: "Commercial Unit, 20 Ringrose",
      zoomLink: "",
      isOnline: false,
      startTime: null,
      endTime: null,
    },
  ]);

  const [costsData, setCostsData] = useState([
    { id: 1, name: "Venue Rental", amount: "2500" },
    { id: 2, name: "Catering Service", amount: "1200" },
  ]);

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

  const handleScheduleAddDay = () => {
    const newId =
      scheduleData.length > 0
        ? Math.max(...scheduleData.map((s) => s.id)) + 1
        : 1;
    const newDayNum = scheduleData.length + 1;
    setScheduleData([
      ...scheduleData,
      {
        id: newId,
        day: `Day ${newDayNum}`,
        date: dayjs(),
        location: "",
        zoomLink: "",
        isOnline: false,
        startTime: null,
        endTime: null,
      },
    ]);
  };

  const handleScheduleRemoveDay = (id) => {
    setScheduleData(scheduleData.filter((session) => session.id !== id));
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

  const handleSessionChange = (id, field, value) => {
    setScheduleData((prevData) =>
      prevData.map((session) =>
        session.id === id ? { ...session, [field]: value } : session
      )
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
                  <CustomSelect
                    label="Seat Limit"
                    name="seatLimit"
                    value={seatLimit}
                    onChange={(e) => setSeatLimit(e.target.value)}
                    placeholder="1000000"
                    options={[
                      { label: "100", value: "100" },
                      { label: "500", value: "500" },
                      { label: "1000", value: "1000" },
                      { label: "1000000", value: "1000000" },
                    ]}
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
                {scheduleData.length} Days, {scheduleData.length * 4} Sessions
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
        onSessionChange={handleSessionChange}
        onAddDay={handleScheduleAddDay}
        onRemoveDay={handleScheduleRemoveDay}
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
