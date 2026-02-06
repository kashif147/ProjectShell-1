import React, { useState } from 'react';
import {
    Drawer,
    Button,
    Row,
    Col,
    Checkbox,
    Typography,
    Space,
    Avatar,
    Switch,
    Radio
} from 'antd';
import {
    CreditCardOutlined,
    UserOutlined
} from '@ant-design/icons';
import MyInput from '../common/MyInput';
import CustomSelect from '../common/CustomSelect';
import MemberSearch from '../profile/MemberSearch';
import MySearchInput from '../common/MySearchInput';
import "../../styles/CreateAttendeeDrawer.css";

const { Title, Text } = Typography;

const CreateAttendeeDrawer = ({ open, onClose }) => {
    const [registrationType, setRegistrationType] = useState('Member'); // 'Member', 'PreviousAttendee', 'NonMember'
    const [selectedDays, setSelectedDays] = useState(['Day 1', 'Day 2']);

    const [formData, setFormData] = useState({
        firstName: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone: '+353 87 900 0538',
        workPlace: 'Acme Corp',
        grade: 'Level 4',
        homeAddress: '123 Event Lane, Conference City, 90210',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberSelect = (memberData) => {
        setFormData({
            ...formData,
            firstName: memberData.personalInfo?.forename || '',
            surname: memberData.personalInfo?.surname || '',
            email: memberData.contactInfo?.personalEmail || '',
            phone: memberData.contactInfo?.mobileNumber || '',
            workPlace: memberData.professionalDetails?.workplace || '',
            grade: memberData.professionalDetails?.grade || '',
            homeAddress: memberData.contactInfo?.fullAddress || ''
        });
    };

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const days = [
        { id: 'Day 1', label: 'Day 1: Opening Keynote', date: 'Oct 24, 2024', price: 120 },
        { id: 'Day 2', label: 'Day 2: Breakout Sessions', date: 'Oct 25, 2024', price: 150 },
        { id: 'Day 3', label: 'Day 3: Networking & Gala', date: 'Oct 26, 2024', price: 95 }
    ];

    const totalPrice = days
        .filter(d => selectedDays.includes(d.id))
        .reduce((sum, d) => sum + d.price, 0);

    const headerExtra = (
        <Button
            className="butn primary-btn"
            onClick={() => console.log('Adding attendee...', formData)}
        >
            Add Attendee
        </Button>
    );

    return (
        <Drawer
            title={<span style={{ fontSize: '18px', fontWeight: 900 }}>Attendee Details</span>}
            placement="right"
            onClose={onClose}
            open={open}
            width={900}
            extra={headerExtra}
            className="create-attendee-drawer"
        >
            <div className="create-attendee-container drwer-bg-clr">
                <Row gutter={40}>
                    {/* LEFT COLUMN: Attendee Details */}
                    <Col span={12}>
                        <div className="my-input-wrapper">
                            <label className="my-input-label">Registration type</label>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0 16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #eef2f6',
                                height: '40px',
                                alignItems: 'center'
                            }}>
                                <Checkbox
                                    checked={registrationType === 'Member'}
                                    onChange={() => setRegistrationType('Member')}
                                >
                                    <Text style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Member</Text>
                                </Checkbox>
                                <Checkbox
                                    checked={registrationType === 'PreviousAttendee'}
                                    onChange={() => setRegistrationType('PreviousAttendee')}
                                >
                                    <Text style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Previous attendee</Text>
                                </Checkbox>
                                <Checkbox
                                    checked={registrationType === 'NonMember'}
                                    onChange={() => setRegistrationType('NonMember')}
                                >
                                    <Text style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Non-member</Text>
                                </Checkbox>
                            </div>
                        </div>

                        {registrationType === 'Member' && (
                            <div style={{ marginBottom: '24px' }}>
                                <label className="my-input-label">Member search</label>
                                <MemberSearch
                                    fullWidth={true}
                                    onSelectBehavior="callback"
                                    onSelectCallback={handleMemberSelect}
                                />
                            </div>
                        )}

                        {registrationType === 'PreviousAttendee' && (
                            <div style={{ marginBottom: '24px' }}>
                                <div className="drawer-subsection-title">Previous attendee search</div>
                                <MySearchInput
                                    placeholder="Search by name or email..."
                                    onChange={(e) => console.log('Searching attendee...', e.target.value)}
                                />
                            </div>
                        )}

                        <Row gutter={16}>
                            <Col span={12}>
                                <MyInput
                                    label="First name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                />
                            </Col>
                            <Col span={12}>
                                <MyInput
                                    label="Surname"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                />
                            </Col>
                        </Row>

                        <MyInput
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john.doe@example.com"
                        />

                        <MyInput
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            type="mobile"
                        />

                        <Row gutter={16}>
                            <Col span={12}>
                                <MyInput
                                    label="Work place"
                                    name="workPlace"
                                    value={formData.workPlace}
                                    onChange={handleInputChange}
                                    placeholder="Acme Corp"
                                />
                            </Col>
                            <Col span={12}>
                                <MyInput
                                    label="Grade"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleInputChange}
                                    placeholder="Level 4"
                                />
                            </Col>
                        </Row>

                        <MyInput
                            label="Home address"
                            name="homeAddress"
                            value={formData.homeAddress}
                            onChange={handleInputChange}
                            placeholder="123 Event Lane, Conference City, 90210"
                            type="textarea"
                            rows={3}
                        />
                    </Col>

                    {/* RIGHT COLUMN: Event & Payment */}
                    <Col span={12}>
                        {/* <h3 className="drawer-section-title">Event & Payment</h3> */}


                        <CustomSelect
                            value="Global Innovation Summit 2024"
                            label="Event selection"
                            options={[{ label: 'Global Innovation Summit 2024', value: '1' }]}
                            onChange={() => { }}
                            isMarginBtm={true}
                        />

                        <label className="my-input-label">Day selection</label>
                        {days.map(day => (
                            <div
                                key={day.id}
                                className={`day-selection-card ${selectedDays.includes(day.id) ? 'selected' : ''}`}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Checkbox
                                        checked={selectedDays.includes(day.id)}
                                        onChange={() => toggleDay(day.id)}
                                    />
                                    <div className="day-info">
                                        <span className="day-title">{day.label}</span>
                                        <span className="day-date">{day.date}</span>
                                    </div>
                                </div>
                                <div className="day-price">${day.price.toFixed(2)}</div>
                            </div>
                        ))}

                        <div className="event-summary-box">
                            <label className="my-input-label">Event summary</label>
                            <div className="summary-table">
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Venue</div>
                                    <div className="summary-table-value">Convention</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Selected days</div>
                                    <div className="summary-table-value">{selectedDays.join(', ')}</div>
                                </div>
                            </div>
                            <div className="total-fee-row">
                                <div className="total-label">
                                    Total Registration Fee
                                    <p>Recalculated in real-time</p>
                                </div>
                                <div className="total-amount">${totalPrice.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="payment-details-section">
                            <div className="drawer-subsection-title">Payment details</div>
                            <MyInput
                                label="Card number"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="0000 0000 0000 0000"
                                prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
                            />
                            <Row gutter={16}>
                                <Col span={12}>
                                    <MyInput
                                        label="Expiry date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                    />
                                </Col>
                                <Col span={12}>
                                    <MyInput
                                        label="Cvv"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="***"
                                    />
                                </Col>
                            </Row>
                        </div>

                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

export default CreateAttendeeDrawer;
