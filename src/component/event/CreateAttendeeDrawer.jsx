import React, { useEffect, useRef, useState } from 'react';
import {
    Drawer,
    Button,
    Row,
    Col,
    Checkbox,
    Typography,
    Radio,
    message
} from 'antd';
import { CreditCardOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import MyInput from '../common/MyInput';
import CustomSelect from '../common/CustomSelect';
import MemberSearch from '../profile/MemberSearch';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../features/CountriesSlice';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fetchEvents, fetchEventById, createRegistration } from '../../services/eventsApi';
import { dispatchProfileInvalidate } from '../../utils/profileRealtimeEvents';
import "../../styles/CreateAttendeeDrawer.css";

const { Text } = Typography;
const libraries = ['places', 'maps'];

// Publishable key is not a secret; same key used across the app's Stripe integrations.
const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const STRIPE_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '14px',
            color: '#424770',
            letterSpacing: '0.025em',
            '::placeholder': { color: '#aab7c4' },
        },
        invalid: { color: '#9e2146' },
    },
};

function splitSearchTerm(term) {
    const value = String(term || '').trim();
    if (!value) return { email: '', firstName: '', surname: '' };
    if (value.includes('@')) return { email: value, firstName: '', surname: '' };
    const parts = value.split(/\s+/);
    return {
        email: '',
        firstName: parts[0] || '',
        surname: parts.slice(1).join(' ') || '',
    };
}

const CreateAttendeeDrawerInner = ({ open, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [selectedSessionIds, setSelectedSessionIds] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [eventSessions, setEventSessions] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [submitting, setSubmitting] = useState(false);
    const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
    const [isNewAttendee, setIsNewAttendee] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [attendeeMembershipNumber, setAttendeeMembershipNumber] = useState(null);
    const [computedAmount, setComputedAmount] = useState(null);

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

    useEffect(() => {
        if (!open) return;
        fetchEvents({ status: 'Published' })
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch(() => setEvents([]));
    }, [open]);

    useEffect(() => {
        if (!selectedEventId) {
            setEventSessions([]);
            setSelectedEvent(null);
            setSelectedSessionIds([]);
            return;
        }
        fetchEventById(selectedEventId)
            .then((data) => {
                const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
                setEventSessions(sessions);
                setSelectedEvent(data || null);
                // Full-attendance events (allowPartialAttendance false/default)
                // must include every day - only let the operator pick a subset
                // when the event explicitly allows partial attendance.
                setSelectedSessionIds(data?.allowPartialAttendance ? [] : sessions.map((s) => s._id));
            })
            .catch(() => {
                setEventSessions([]);
                setSelectedEvent(null);
                setSelectedSessionIds([]);
            });
    }, [selectedEventId]);

    useEffect(() => {
        setComputedAmount(null);
        setQuantity(1);
    }, [selectedEventId]);

    const remainingCapacity = (() => {
        let remaining = Infinity;
        if (selectedEvent?.capacity != null) {
            remaining = selectedEvent.capacity - (selectedEvent.seatsBooked || 0);
        }
        for (const sessionId of selectedSessionIds) {
            const session = eventSessions.find((s) => s._id === sessionId);
            if (session?.capacity != null) {
                remaining = Math.min(remaining, session.capacity - (session.seatsBooked || 0));
            }
        }
        return remaining;
    })();

    useEffect(() => {
        if (Number.isFinite(remainingCapacity)) {
            setQuantity((q) => Math.min(q, Math.max(remainingCapacity, 1)));
        }
    }, [remainingCapacity]);

    const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
    const incrementQuantity = () => setQuantity((q) => (
        Number.isFinite(remainingCapacity) ? Math.min(remainingCapacity, q + 1) : q + 1
    ));

    const unitPrice = attendeeMembershipNumber ? selectedEvent?.memberPrice : selectedEvent?.nonMemberPrice;
    const estimatedTotal = unitPrice != null ? unitPrice * quantity : null;

    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        email: '',
        phone: '',
        workPlace: '',
        otherWorkPlace: '',
        grade: '',
        otherGrade: '',
        searchAddress: '',
        addressLine1: '',
        addressLine2: '',
        townCity: '',
        countyState: '',
        eircode: '',
        country: 'Ireland',
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
        setSelectedProfileId(memberData._id || memberData.profileId || null);
        setAttendeeMembershipNumber(memberData.membershipNumber || null);
        setIsNewAttendee(false);
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

    const handleAddNewAttendee = (searchTerm) => {
        const { email, firstName, surname } = splitSearchTerm(searchTerm);
        setIsNewAttendee(true);
        setSelectedProfileId(null);
        setAttendeeMembershipNumber(null);
        setFormData((prev) => ({
            ...prev,
            email: email || prev.email,
            firstName: firstName || prev.firstName,
            surname: surname || prev.surname,
        }));
        message.info('No existing profile found - this will register a new (non-member) attendee.');
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

    const toggleSession = (sessionId) => {
        setSelectedSessionIds(prev =>
            prev.includes(sessionId)
                ? prev.filter(d => d !== sessionId)
                : [...prev, sessionId]
        );
    };

    const isOtherSelection = (value) =>
        typeof value === 'string' && value.trim().toLowerCase() === 'other';

    const fieldsEnabled = isNewAttendee || !!selectedProfileId;

    const eventOptions = events.map((ev) => ({ label: ev.title, value: ev._id }));

    const handleSubmit = async () => {
        if (!selectedEventId) {
            message.error('Please select an event');
            return;
        }
        if (!formData.email) {
            message.error('Email is required');
            return;
        }

        setSubmitting(true);
        try {
            let paymentIntentClientSecret = null;

            const payload = {
                registrationType: 'event',
                eventId: selectedEventId,
                sessionIds: selectedSessionIds,
                quantity,
                profile: {
                    profileId: selectedProfileId || undefined,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.surname,
                    phone: formData.phone,
                    workLocation: isOtherSelection(formData.workPlace) ? formData.otherWorkPlace : formData.workPlace,
                    grade: isOtherSelection(formData.grade) ? formData.otherGrade : formData.grade,
                },
                paymentMethod,
                registeredVia: 'crm',
            };

            const result = await createRegistration(payload);
            setComputedAmount(result?.registration?.amount ?? null);

            if (paymentMethod === 'stripe' && result?.payment?.clientSecret) {
                if (!stripe || !elements) {
                    message.error('Stripe has not finished loading - please try again.');
                    return;
                }
                const cardNumberElement = elements.getElement(CardNumberElement);
                const confirmResult = await stripe.confirmCardPayment(result.payment.clientSecret, {
                    payment_method: { card: cardNumberElement },
                });
                if (confirmResult.error) {
                    message.error(confirmResult.error.message || 'Card payment failed');
                    return;
                }
            }

            message.success('Attendee registered successfully');
            dispatchProfileInvalidate({ scopes: ['events'], profileId: selectedProfileId || result?.registration?.profileId });
            if (onClose) onClose();
        } catch (err) {
            message.error(err?.response?.data?.error?.message || err?.message || 'Failed to register attendee');
        } finally {
            setSubmitting(false);
        }
    };

    const headerExtra = (
        <Button
            className="butn primary-btn"
            loading={submitting}
            onClick={handleSubmit}
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
                        <div style={{ marginBottom: '24px' }}>
                            <label className="my-input-label">Profile Search</label>
                            <MemberSearch
                                fullWidth={true}
                                onSelectBehavior="callback"
                                onSelectCallback={handleMemberSelect}
                                onAddMember={handleAddNewAttendee}
                                addMemberLabel="Add as new attendee"
                            />
                            {isNewAttendee && (
                                <Text type="warning" style={{ display: 'block', marginTop: 8 }}>
                                    Registering a new, non-member attendee - no membership number will be created.
                                </Text>
                            )}
                            {!fieldsEnabled && (
                                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                    Search for a profile above, or add a new one, to enable the attendee details below.
                                </Text>
                            )}
                        </div>

                        <Row gutter={16}>
                            <Col span={12}>
                                <MyInput
                                    label="First name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                    disabled={!fieldsEnabled}
                                />
                            </Col>
                            <Col span={12}>
                                <MyInput
                                    label="Surname"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                    disabled={!fieldsEnabled}
                                />
                            </Col>
                        </Row>

                        <MyInput
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john.doe@example.com"
                            disabled={!fieldsEnabled}
                        />

                        <MyInput
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            type="mobile"
                            disabled={!fieldsEnabled}
                        />

                        <CustomSelect
                            label="Work location"
                            name="workPlace"
                            value={formData.workPlace}
                            onChange={handleInputChange}
                            options={workLocationOptions}
                            placeholder="Select work location"
                            disabled={!fieldsEnabled}
                        />
                        {isOtherSelection(formData.workPlace) && (
                            <MyInput
                                label="Other work location"
                                name="otherWorkPlace"
                                value={formData.otherWorkPlace}
                                onChange={handleInputChange}
                                placeholder="Enter other work location"
                                disabled={!fieldsEnabled}
                            />
                        )}
                        <CustomSelect
                            label="Grade"
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            options={gradeOptions}
                            placeholder="Select grade"
                            disabled={!fieldsEnabled}
                        />
                        {isOtherSelection(formData.grade) && (
                            <MyInput
                                label="Other grade"
                                name="otherGrade"
                                value={formData.otherGrade}
                                onChange={handleInputChange}
                                placeholder="Enter other grade"
                                disabled={!fieldsEnabled}
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
                                    disabled={!fieldsEnabled}
                                />
                            </StandaloneSearchBox>
                        )}

                        <MyInput
                            label="Address Line 1 (Building or House)"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            disabled={!fieldsEnabled}
                        />
                        <MyInput
                            label="Address Line 2 (Street or Road)"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            disabled={!fieldsEnabled}
                        />
                        <MyInput
                            label="Address Line 3 (Town/City)"
                            name="townCity"
                            value={formData.townCity}
                            onChange={handleInputChange}
                            disabled={!fieldsEnabled}
                        />
                        <MyInput
                            label="Address Line 4 (County/State)"
                            name="countyState"
                            value={formData.countyState}
                            onChange={handleInputChange}
                            disabled={!fieldsEnabled}
                        />
                        <Row gutter={16}>
                            <Col span={12}>
                                <MyInput
                                    label="Eircode/Postcode"
                                    name="eircode"
                                    value={formData.eircode}
                                    onChange={handleInputChange}
                                    disabled={!fieldsEnabled}
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
                                    disabled={!fieldsEnabled}
                                />
                            </Col>
                        </Row>
                    </Col>

                    {/* RIGHT COLUMN: Event & Payment */}
                    <Col span={12}>
                        <CustomSelect
                            value={selectedEventId}
                            label="Event selection"
                            options={eventOptions}
                            placeholder="Select event"
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            isMarginBtm={true}
                        />

                        {eventSessions.length > 0 && (
                            <>
                                <label className="my-input-label">Day/session selection</label>
                                {!selectedEvent?.allowPartialAttendance && (
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                        This event requires full attendance - every day is included.
                                    </Text>
                                )}
                                {eventSessions.map(session => (
                                    <div
                                        key={session._id}
                                        className={`day-selection-card ${selectedSessionIds.includes(session._id) ? 'selected' : ''}`}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Checkbox
                                                checked={selectedSessionIds.includes(session._id)}
                                                onChange={() => toggleSession(session._id)}
                                                disabled={!selectedEvent?.allowPartialAttendance}
                                            />
                                            <div className="day-info">
                                                <span className="day-title">{session.label}</span>
                                                <span className="day-date">{session.date ? new Date(session.date).toLocaleDateString() : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        <div className="event-summary-box">
                            <label className="my-input-label">Event summary</label>
                            <div className="summary-table">
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Venue</div>
                                    <div className="summary-table-value">{selectedEvent?.venue || '-'}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Selected sessions</div>
                                    <div className="summary-table-value">{selectedSessionIds.length || 'All'}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Tickets</div>
                                    <div className="summary-table-value">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Button
                                                size="small"
                                                icon={<MinusOutlined />}
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1}
                                            />
                                            <span style={{ minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                                            <Button
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={incrementQuantity}
                                                disabled={Number.isFinite(remainingCapacity) && quantity >= remainingCapacity}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {Number.isFinite(remainingCapacity) && (
                                    <div className="summary-table-row">
                                        <div className="summary-table-label">Seats remaining</div>
                                        <div className="summary-table-value">{Math.max(remainingCapacity, 0)}</div>
                                    </div>
                                )}
                            </div>
                            <div className="total-fee-row">
                                <div className="total-label">
                                    Total Registration Fee
                                    <p>
                                        {computedAmount != null
                                            ? 'Charged'
                                            : estimatedTotal != null
                                                ? 'Estimated - exact fee confirmed on submission'
                                                : 'Calculated on submission (member pricing applies automatically)'}
                                    </p>
                                </div>
                                <div className="total-amount">
                                    {computedAmount != null
                                        ? `€${(computedAmount / 100).toFixed(2)}`
                                        : estimatedTotal != null
                                            ? `€${estimatedTotal.toFixed(2)}`
                                            : '-'}
                                </div>
                            </div>
                        </div>

                        <div className="payment-details-section">
                            <div className="drawer-subsection-title">Payment method</div>
                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ marginBottom: 16 }}
                            >
                                <Radio value="stripe">Card (Stripe)</Radio>
                                <Radio value="invoice">Invoice</Radio>
                                <Radio value="comp">Complimentary</Radio>
                                <Radio value="manual">Manual (cash/cheque received)</Radio>
                            </Radio.Group>

                            {paymentMethod === 'stripe' && (
                                <>
                                    <div className="my-input-wrapper">
                                        <label className="my-input-label">Card number</label>
                                        <div className="stripe-element-input">
                                            <CreditCardOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />
                                            <CardNumberElement
                                                options={STRIPE_ELEMENT_OPTIONS}
                                                onChange={(e) => setCardComplete((prev) => ({ ...prev, number: e.complete }))}
                                            />
                                        </div>
                                    </div>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <div className="my-input-wrapper">
                                                <label className="my-input-label">Expiry date</label>
                                                <div className="stripe-element-input">
                                                    <CardExpiryElement
                                                        options={STRIPE_ELEMENT_OPTIONS}
                                                        onChange={(e) => setCardComplete((prev) => ({ ...prev, expiry: e.complete }))}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div className="my-input-wrapper">
                                                <label className="my-input-label">Cvv</label>
                                                <div className="stripe-element-input">
                                                    <CardCvcElement
                                                        options={STRIPE_ELEMENT_OPTIONS}
                                                        onChange={(e) => setCardComplete((prev) => ({ ...prev, cvc: e.complete }))}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )}
                            {paymentMethod !== 'stripe' && (
                                <Text type="secondary">
                                    {paymentMethod === 'invoice' && 'An invoice will be posted to the ledger; the attendee is billed separately.'}
                                    {paymentMethod === 'comp' && 'No payment will be collected; the registration fee is waived and recorded as a write-off.'}
                                    {paymentMethod === 'manual' && 'Record this as already paid via cash/cheque/bank transfer outside Stripe.'}
                                </Text>
                            )}
                        </div>

                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

const CreateAttendeeDrawer = (props) => (
    <Elements stripe={stripePromise}>
        <CreateAttendeeDrawerInner {...props} />
    </Elements>
);

export default CreateAttendeeDrawer;
