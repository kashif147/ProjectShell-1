import React, { useEffect, useRef, useState } from 'react';
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
    CreditCardOutlined
} from '@ant-design/icons';
import MyInput from '../common/MyInput';
import CustomSelect from '../common/CustomSelect';
import MemberSearch from '../profile/MemberSearch';
import MySearchInput from '../common/MySearchInput';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../features/CountriesSlice';
import { useLocation } from 'react-router-dom';
import "../../styles/CreateAttendeeDrawer.css";

const { Title, Text } = Typography;
const libraries = ['places', 'maps'];

const CreateAttendeeDrawer = ({ open, onClose }) => {
    const location = useLocation();
    const isAttendeesPage = location?.pathname === '/Attendees';
    const [registrationType, setRegistrationType] = useState('Member');
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(isAttendeesPage ? '' : 'Global Innovation Summit 2024');
    const inputRef = useRef(null);
    const dispatch = useDispatch();
    const { countriesOptions } = useSelector((state) => state.countries);
    const { workLocationOptions, gradeOptions } = useSelector((state) => state.lookups);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o',
        libraries,
    });

    useEffect(() => {
        dispatch(fetchCountries());
    }, [dispatch]);

    const [formData, setFormData] = useState({
        firstName: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone: '+353 87 900 0538',
        workPlace: 'Acme Corp',
        otherWorkPlace: '',
        grade: 'Level 4',
        otherGrade: '',
        searchAddress: '',
        addressLine1: '',
        addressLine2: '',
        townCity: '',
        countyState: '',
        eircode: '',
        country: 'Ireland',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === 'workPlace' && !isOtherSelection(value)) {
                updated.otherWorkPlace = '';
            }
            if (name === 'grade' && !isOtherSelection(value)) {
                updated.otherGrade = '';
            }
            return updated;
        });
    };

    const handleMemberSelect = (memberData) => {
        setFormData({
            ...formData,
            firstName: memberData.personalInfo?.forename || '',
            surname: memberData.personalInfo?.surname || '',
            email: memberData.contactInfo?.personalEmail || '',
            phone: memberData.contactInfo?.mobileNumber || '',
            workPlace: memberData.professionalDetails?.workLocation || '',
            otherWorkPlace: memberData.professionalDetails?.otherWorkLocation || '',
            grade: memberData.professionalDetails?.grade || '',
            otherGrade: memberData.professionalDetails?.otherGrade || '',
            addressLine1: memberData.contactInfo?.buildingOrHouse || '',
            addressLine2: memberData.contactInfo?.streetOrRoad || '',
            townCity: memberData.contactInfo?.areaOrTown || '',
            countyState: memberData.contactInfo?.countyCityOrPostCode || '',
            eircode: memberData.contactInfo?.eircode || '',
            country: memberData.contactInfo?.country || 'Ireland'
        });
    };

    const handlePlacesChanged = () => {
        const places = inputRef.current?.getPlaces();
        if (!places || places.length === 0) return;

        const place = places[0];
        const placeId = place.place_id;
        if (!placeId || !window.google?.maps?.places) return;

        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails(
            {
                placeId,
                fields: ['address_components'],
            },
            (details, status) => {
                if (status !== window.google.maps.places.PlacesServiceStatus.OK || !details) return;

                const components = details.address_components || [];
                const getComponent = (type) =>
                    components.find((c) => c.types.includes(type))?.long_name || '';

                const streetNumber = getComponent('street_number');
                const route = getComponent('route');
                const sublocality = getComponent('sublocality') || '';
                const town = getComponent('locality') || getComponent('postal_town') || '';
                const county = getComponent('administrative_area_level_1') || '';
                const postalCode = getComponent('postal_code') || '';
                const country = getComponent('country') || 'Ireland';

                setFormData((prev) => ({
                    ...prev,
                    searchAddress: details.formatted_address || place.formatted_address || prev.searchAddress,
                    addressLine1: `${streetNumber} ${route}`.trim(),
                    addressLine2: sublocality,
                    townCity: town,
                    countyState: county,
                    eircode: postalCode,
                    country,
                }));
            }
        );
    };

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const isOtherSelection = (value) =>
        typeof value === 'string' && value.trim().toLowerCase() === 'other';

    const eventDaysMap = {
        'Global Innovation Summit 2024': [
            { id: 'Day 1', label: 'Day 1: Opening Keynote', date: 'Oct 24, 2024', price: 120 },
            { id: 'Day 2', label: 'Day 2: Breakout Sessions', date: 'Oct 25, 2024', price: 150 },
            { id: 'Day 3', label: 'Day 3: Networking & Gala', date: 'Oct 26, 2024', price: 95 },
        ],
        'Annual Nursing Conference': [
            { id: 'Day 1', label: 'Day 1: Clinical Leadership', date: 'Nov 04, 2024', price: 110 },
            { id: 'Day 2', label: 'Day 2: Policy & Advocacy', date: 'Nov 05, 2024', price: 130 },
        ],
        'Advanced Clinical Skills': [
            { id: 'Module 1', label: 'Module 1: Acute Care Workshop', date: 'Sep 12, 2024', price: 95 },
            { id: 'Module 2', label: 'Module 2: Simulation Lab', date: 'Sep 13, 2024', price: 105 },
            { id: 'Module 3', label: 'Module 3: Assessment', date: 'Sep 14, 2024', price: 80 },
        ],
        'Infection Control Essentials': [
            { id: 'Session 1', label: 'Session 1: Prevention Basics', date: 'Aug 21, 2024', price: 70 },
            { id: 'Session 2', label: 'Session 2: Clinical Practice', date: 'Aug 22, 2024', price: 85 },
        ],
    };
    const eventOptions = [
        { label: 'Global Innovation Summit 2024', value: '1' },
        { label: 'Annual Nursing Conference', value: '2' },
        { label: 'Advanced Clinical Skills', value: '3' },
        { label: 'Infection Control Essentials', value: '4' },
    ];
    const days = selectedEvent ? (eventDaysMap[selectedEvent] || []) : [];

    useEffect(() => {
        if (!selectedEvent || days.length === 0) {
            setSelectedDays([]);
            return;
        }

        // Keep only valid selections for the newly selected event.
        setSelectedDays((prev) => {
            const validIds = new Set(days.map((day) => day.id));
            const retained = prev.filter((id) => validIds.has(id));
            return retained.length ? retained : [days[0].id];
        });
    }, [selectedEvent]);

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

                        <CustomSelect
                            label="Work location"
                            name="workPlace"
                            value={formData.workPlace}
                            onChange={handleInputChange}
                            options={workLocationOptions}
                            placeholder="Select work location"
                        />
                        {isOtherSelection(formData.workPlace) && (
                            <MyInput
                                label="Other work location"
                                name="otherWorkPlace"
                                value={formData.otherWorkPlace}
                                onChange={handleInputChange}
                                placeholder="Enter other work location"
                            />
                        )}
                        <CustomSelect
                            label="Grade"
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            options={gradeOptions}
                            placeholder="Select grade"
                        />
                        {isOtherSelection(formData.grade) && (
                            <MyInput
                                label="Other grade"
                                name="otherGrade"
                                value={formData.otherGrade}
                                onChange={handleInputChange}
                                placeholder="Enter other grade"
                            />
                        )}

                        {isLoaded && (
                            <StandaloneSearchBox
                                onLoad={(ref) => (inputRef.current = ref)}
                                onPlacesChanged={handlePlacesChanged}
                            >
                                <MyInput
                                    label="Search by address or Eircode"
                                    name="searchAddress"
                                    value={formData.searchAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter Eircode (e.g., D01X4X0)"
                                />
                            </StandaloneSearchBox>
                        )}

                        <MyInput
                            label="Address Line 1 (Building or House)"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                        />
                        <MyInput
                            label="Address Line 2 (Street or Road)"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                        />
                        <MyInput
                            label="Address Line 3 (Town/City)"
                            name="townCity"
                            value={formData.townCity}
                            onChange={handleInputChange}
                        />
                        <MyInput
                            label="Address Line 4 (County/State)"
                            name="countyState"
                            value={formData.countyState}
                            onChange={handleInputChange}
                        />
                        <Row gutter={16}>
                            <Col span={12}>
                                <MyInput
                                    label="Eircode/Postcode"
                                    name="eircode"
                                    value={formData.eircode}
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col span={12}>
                                <CustomSelect
                                    label="Country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    options={countriesOptions}
                                    placeholder="Select country"
                                />
                            </Col>
                        </Row>
                    </Col>

                    {/* RIGHT COLUMN: Event & Payment */}
                    <Col span={12}>
                        {/* <h3 className="drawer-section-title">Event & Payment</h3> */}


                        <CustomSelect
                            value={selectedEvent}
                            label="Event selection"
                            options={eventOptions}
                            placeholder="Select event"
                            onChange={(e) => setSelectedEvent(e.target.value)}
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
                                    <div className="summary-table-value">{selectedDays.length ? selectedDays.join(', ') : '-'}</div>
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
