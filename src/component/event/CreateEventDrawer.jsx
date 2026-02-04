import React, { useState } from 'react';
import {
    Button,
    Row,
    Col,
    Card,
    Checkbox,
    Modal,
    Switch,
    TimePicker,
    Input
} from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import MyDrawer from '../common/MyDrawer';
import MyInput from '../common/MyInput';
import MyDatePicker1 from '../common/MyDatePicker1';
import CustomSelect from '../common/CustomSelect';
import "../../styles/CreateEventDrawer.css";
import dayjs from 'dayjs';

const CreateEventDrawer = ({ open, onClose }) => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState(null);
    const [eventType, setEventType] = useState('');
    const [seatLimit, setSeatLimit] = useState('');
    const [description, setDescription] = useState('');
    const [venueName, setVenueName] = useState('');
    const [address, setAddress] = useState('');
    const [cpfCredits, setCpfCredits] = useState('');
    const [accreditationType, setAccreditationType] = useState('');
    const [allowVirtualHosting, setAllowVirtualHosting] = useState(false);
    const [bookingOnMultipleDays, setBookingOnMultipleDays] = useState(false);
    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
    const [scheduleData, setScheduleData] = useState([
        { id: 1, day: 'Day 1', date: '04/12/2024', location: 'Commercial Unit, 20 Ringrose', isOnline: false, startTime: null, endTime: null },
        { id: 2, day: 'Day 2', date: '05/12/2024', location: 'Commercial Unit, 20 Ringrose', isOnline: false, startTime: null, endTime: null }
    ]);

    const handleScheduleClick = (e) => {
        e.preventDefault(); // Prevent default anchor behavior
        setIsScheduleModalVisible(true);
    };

    const handleScheduleModalClose = () => {
        setIsScheduleModalVisible(false);
    };

    const handleScheduleSubmit = () => {
        // Logic to handle schedule submission
        console.log("Schedule Submitted:", scheduleData);
        setIsScheduleModalVisible(false);
    };

    const handleSessionChange = (id, field, value) => {
        setScheduleData(prevData => prevData.map(session =>
            session.id === id ? { ...session, [field]: value } : session
        ));
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
            cpfCredits,
            accreditationType,
            allowVirtualHosting,
            bookingOnMultipleDays,
        });
        onClose();
    };

    const handleCancel = () => {
        // Show confirmation or directly cancel
        onClose();
    };

    const headerActions = (
        <div className="event-drawer-header-actions">
            <Button className="header-discard-btn" onClick={onClose}>Discard</Button>
            <Button className="header-save-btn" type="primary" onClick={handleSave}>Save Changes</Button>
        </div>
    );

    return (
        <MyDrawer
            title="Event Configuration"
            onClose={onClose}
            open={open}
            width={1200}
            extra={headerActions}
        >
            <div className="event-drawer-container">
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
                                            { label: '100', value: '100' },
                                            { label: '500', value: '500' },
                                            { label: '1000', value: '1000' },
                                            { label: '1000000', value: '1000000' }
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

                            <div className="map-container">
                                <div className="map-placeholder">
                                    <div className="map-pin">📍</div>
                                </div>
                            </div>
                        </div>

                        {/* CPF & ACCREDITATIONS */}
                        <div className="form-section">
                            <h3 className="section-title">CPF & ACCREDITATIONS</h3>

                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12}>
                                    <MyInput
                                        label="CPF Credits"
                                        name="cpfCredits"
                                        value={cpfCredits}
                                        onChange={(e) => setCpfCredits(e.target.value)}
                                        placeholder="32"
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <CustomSelect
                                        label="Accreditation Type"
                                        name="accreditationType"
                                        value={accreditationType}
                                        onChange={(e) => setAccreditationType(e.target.value)}
                                        placeholder="CPD Certification Service"
                                        options={[
                                            { label: 'CPD Certification Service', value: 'cpd' },
                                            { label: 'Standard', value: 'standard' },
                                            { label: 'Premium', value: 'premium' }
                                        ]}
                                    />
                                </Col>
                            </Row>

                            <div style={{ marginTop: '16px' }}>
                                <Checkbox
                                    checked={allowVirtualHosting}
                                    onChange={(e) => setAllowVirtualHosting(e.target.checked)}
                                >
                                    Allow virtual live hosting
                                </Checkbox>
                            </div>
                        </div>

                        {/* CANCEL EVENT SECTION */}
                        <div className="cancel-event-section">
                            <div className="cancel-event-content">
                                <div className="cancel-event-text">
                                    <h4 className="cancel-event-title">Cancel Event</h4>
                                    <p className="cancel-event-description">
                                        Permanently remove all event information and archive relevant
                                        documentation.
                                    </p>
                                </div>
                                <Button danger className="cancel-event-btn" onClick={handleCancel}>
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
                            <p class="text-sm text-slate-500">3 Days, 12 Sessions</p>
                            <a href="#/" className="sidebar-card-link" onClick={handleScheduleClick}>Go to Schedule Management</a>
                        </Card>

                        {/* COSTS & FEES */}
                        <Card className="event-sidebar-card">
                            <div className="sidebar-card-icon">💰</div>
                            <h5 className="sidebar-card-title">Costs & Fees</h5>
                            <div className="cost-display">
                                <span className="cost-currency">$</span>
                                <span className="cost-amount">5,700</span>
                                <span className="cost-period">per</span>
                            </div>
                            <div className="cost-progress">
                                <div className="cost-progress-bar"></div>
                            </div>
                        </Card>

                        {/* CONFIGURATION TIP */}
                        <Card className="event-sidebar-card tip-card">
                            <div className="tip-card-icon">⚙️</div>
                            <h6 className="tip-card-title">Configuration Tip</h6>
                            <p className="tip-card-text">
                                Ensure your CPD credits are accurate and the time of
                                publication to prevent conflicts or attendances.
                            </p>
                            <a href="#/" className="tip-card-link">Learn more</a>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Schedule Management Modal */}
            <Modal
                title="Schedule Management"
                open={isScheduleModalVisible}
                onCancel={handleScheduleModalClose}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleScheduleSubmit}
                        style={{ width: '100%', backgroundColor: '#215E97', borderColor: '#215E97' }}
                    >
                        Done
                    </Button>,
                ]}
                width={600}
                centered
                className="schedule-management-modal"
            >
                <div
                    style={{
                        padding: "24px 16px",
                        minHeight: "120px",
                        maxHeight: "60vh",
                        overflowY: "auto"
                    }}
                >
                    {scheduleData.map((session, index) => (
                        <div key={session.id} style={{
                            marginBottom: index !== scheduleData.length - 1 ? "24px" : "0",
                            borderBottom: index !== scheduleData.length - 1 ? "1px solid #f0f0f0" : "none",
                            paddingBottom: index !== scheduleData.length - 1 ? "24px" : "0"
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{session.day} - {session.date}</h4>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: session.isOnline ? '#8c8c8c' : '#000000' }}>Inperson</span>
                                    <Switch
                                        checked={session.isOnline}
                                        onChange={(checked) => handleSessionChange(session.id, 'isOnline', checked)}
                                    />
                                    <span style={{ fontSize: '14px', color: session.isOnline ? '#000000' : '#8c8c8c' }}>Online</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <Input
                                    prefix={<EnvironmentOutlined style={{ color: '#bfbfbf', marginRight: '8px' }} />}
                                    value={session.location}
                                    onChange={(e) => handleSessionChange(session.id, 'location', e.target.value)}
                                    placeholder="Add Location"
                                    style={{ borderRadius: '6px', height: '40px' }}
                                />
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <div>
                                        <label className="my-input-label" style={{ display: 'block', marginBottom: '8px' }}>
                                            Start Time
                                        </label>
                                        <TimePicker
                                            value={session.startTime}
                                            onChange={(time) => handleSessionChange(session.id, 'startTime', time)}
                                            format="HH:mm"
                                            style={{ width: '100%', height: '40px', borderRadius: '6px' }}
                                            placeholder="Select start time"
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <label className="my-input-label" style={{ display: 'block', marginBottom: '8px' }}>
                                            End Time
                                        </label>
                                        <TimePicker
                                            value={session.endTime}
                                            onChange={(time) => handleSessionChange(session.id, 'endTime', time)}
                                            format="HH:mm"
                                            style={{ width: '100%', height: '40px', borderRadius: '6px' }}
                                            placeholder="Select end time"
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </div>
            </Modal>
        </MyDrawer>
    );
};

export default CreateEventDrawer;
