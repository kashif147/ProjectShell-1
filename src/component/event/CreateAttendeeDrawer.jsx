import React, { useEffect, useRef, useState } from 'react';
import {
    Drawer,
    Button,
    Row,
    Col,
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
import {
    fetchEvents,
    fetchEventById,
    fetchEventPriceQuote,
    checkAttendeeDuplicates,
    createRegistration,
} from '../../services/eventsApi';
import { dispatchProfileInvalidate } from '../../utils/profileRealtimeEvents';
import { computeEventFormat } from '../../utils/eventFormat';
import "../../styles/CreateAttendeeDrawer.css";

const { Text } = Typography;
const libraries = ['places', 'maps'];

const TIER_LABELS = {
    MEMBER: 'Member price',
    NON_MEMBER: 'Non-member price',
    EARLY_BIRD_MEMBER: 'Early Bird Member',
    EARLY_BIRD_NON_MEMBER: 'Early Bird Non-member',
    STUDENT: 'Student',
    GROUP_STUDENT: 'Group Student',
};

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

const INITIAL_FORM_DATA = {
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
};

function toTitleCase(value) {
    return String(value || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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

const CreateAttendeeDrawerInner = ({ open, onClose, eventId }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [selectedSessionIds, setSelectedSessionIds] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [eventSessions, setEventSessions] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [tierQuantities, setTierQuantities] = useState({});
    const [userEditedTiers, setUserEditedTiers] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [submitting, setSubmitting] = useState(false);
    const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
    const [isNewAttendee, setIsNewAttendee] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [attendeeMembershipNumber, setAttendeeMembershipNumber] = useState(null);
    const [computedAmount, setComputedAmount] = useState(null);
    const [priceQuote, setPriceQuote] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [duplicateCandidates, setDuplicateCandidates] = useState(null);
    const [confirmedNewProfile, setConfirmedNewProfile] = useState(false);

    const inputRef = useRef(null);
    const dispatch = useDispatch();
    const { countriesOptions } = useSelector((state) => state.countries);
    const { workLocationOptions, gradeOptions, eventTypeOptions, eventCategoryOptions } = useSelector((state) => state.lookups);
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
        if (eventId) {
            // Came from the event's own page - lock straight to it instead of
            // fetching the general (Published-only) list.
            setSelectedEventId(eventId);
            return;
        }
        fetchEvents({ status: 'Published' })
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch(() => setEvents([]));
    }, [open, eventId]);

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
                // Always register for every session of the event - there's no
                // per-day selection in this drawer.
                setSelectedSessionIds(sessions.map((s) => s._id));
            })
            .catch(() => {
                setEventSessions([]);
                setSelectedEvent(null);
                setSelectedSessionIds([]);
            });
    }, [selectedEventId]);

    useEffect(() => {
        setComputedAmount(null);
        setTierQuantities({});
        setUserEditedTiers(false);
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

    // Live membership check for the linked (or not-yet-linked) attendee -
    // resolves their real, active membership/category, purely to suggest
    // which pricing row to pre-fill. Never gates which rows the CRM can add
    // tickets against.
    useEffect(() => {
        if (!selectedEventId) {
            setPriceQuote(null);
            return;
        }
        let cancelled = false;
        setQuoteLoading(true);
        fetchEventPriceQuote(selectedEventId, { profileId: selectedProfileId || undefined, quantity: 1 })
            .then((data) => {
                if (!cancelled) setPriceQuote(data || null);
            })
            .catch(() => {
                if (!cancelled) setPriceQuote(null);
            })
            .finally(() => {
                if (!cancelled) setQuoteLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedEventId, selectedProfileId]);

    // Pre-fill 1 ticket on the suggested/eligible tier as a convenience
    // default - keeps re-syncing to whatever the linked profile's real
    // membership resolves to (e.g. Non-member -> Member once a member
    // profile is searched/selected) right up until the CRM user manually
    // touches a counter themselves, at which point we stop overwriting.
    useEffect(() => {
        if (userEditedTiers) return;
        if (!priceQuote?.appliedTier) return;
        setTierQuantities({ [priceQuote.appliedTier]: 1 });
    }, [priceQuote, userEditedTiers]);

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

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
        setDuplicateCandidates(null);
        setConfirmedNewProfile(false);
        // Switching to a different attendee starts pricing over - any tier
        // manually picked for whoever was previously selected (e.g. an Early
        // Bird Member ticket left over from a member profile) must not carry
        // over and silently get charged alongside this attendee's own tier.
        setTierQuantities({});
        setUserEditedTiers(false);
        setFormData({
            ...formData,
            firstName: toTitleCase(memberData.personalInfo?.forename),
            surname: toTitleCase(memberData.personalInfo?.surname),
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
        setDuplicateCandidates(null);
        setConfirmedNewProfile(false);
        // Same reset as handleMemberSelect - a previously selected member's
        // leftover tier (e.g. Early Bird Member) must not persist onto this
        // new non-member attendee.
        setTierQuantities({});
        setUserEditedTiers(false);
        // Clear out whatever was left over from a previous selection (e.g. a
        // different member's workLocation/grade/address/phone) before
        // loading this search term's parsed name - a blank slate plus the
        // new attendee's name, not a merge with stale data.
        setFormData({
            ...INITIAL_FORM_DATA,
            email,
            firstName: toTitleCase(firstName),
            surname: toTitleCase(surname),
        });
        message.info('No existing profile found - this will register a new (non-member) attendee.');
    };

    // Clearing the profile search box (the × button) starts the attendee
    // over completely - wipes the linked/new-attendee state, the form, any
    // pending duplicate-review panel, and the ticket counters (which then
    // re-sync to the non-member default via the price-quote effect).
    const handleClearAttendee = () => {
        setSelectedProfileId(null);
        setAttendeeMembershipNumber(null);
        setIsNewAttendee(false);
        setDuplicateCandidates(null);
        setConfirmedNewProfile(false);
        setFormData(INITIAL_FORM_DATA);
        setComputedAmount(null);
        setTierQuantities({});
        setUserEditedTiers(false);
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

    const isOtherSelection = (value) =>
        typeof value === 'string' && value.trim().toLowerCase() === 'other';

    const fieldsEnabled = isNewAttendee || !!selectedProfileId;

    const eventOptions = eventId
        ? (selectedEvent ? [{ label: selectedEvent.title, value: selectedEvent._id }] : [])
        : events.map((ev) => ({ label: ev.title, value: ev._id }));

    const eventCategoryLabel =
        (eventCategoryOptions || []).find(
            (opt) => String(opt.value) === String(selectedEvent?.eventCategoryLookupId),
        )?.label ||
        selectedEvent?.eventCategoryLookupCode ||
        selectedEvent?.eventCategoryCode ||
        '-';
    const eventTypeLabel = (eventTypeOptions || []).find(
        (opt) => String(opt.value) === String(selectedEvent?.eventTypeId),
    )?.label || '-';
    const eventFormat = selectedEvent ? computeEventFormat(selectedEvent) : '-';
    const registeredCount = selectedEvent?.seatsBooked || 0;
    const availableCapacity = selectedEvent?.capacity != null
        ? Math.max(selectedEvent.capacity - registeredCount, 0)
        : null;
    const membershipStatusLabel = quoteLoading
        ? 'Checking…'
        : priceQuote?.isActiveMember
            ? `Active Member${priceQuote.membershipCategory ? ` — ${priceQuote.membershipCategory}` : ''}`
            : 'Non-member';

    // One row per pricing option actually available to buy right now - early
    // bird rows drop off once their cutoff has passed.
    const now = new Date();
    const findActiveTier = (tierType) =>
        (selectedEvent?.pricingTiers || []).find((t) => t.tierType === tierType && t.isActive !== false);

    const tierRows = [];
    if (selectedEvent?.memberPrice != null) {
        tierRows.push({ key: 'MEMBER', label: TIER_LABELS.MEMBER, unitPrice: Number(selectedEvent.memberPrice) });
    }
    if (selectedEvent?.nonMemberPrice != null) {
        tierRows.push({ key: 'NON_MEMBER', label: TIER_LABELS.NON_MEMBER, unitPrice: Number(selectedEvent.nonMemberPrice) });
    }
    const earlyBirdMemberTier = findActiveTier('EARLY_BIRD_MEMBER');
    if (earlyBirdMemberTier?.cutoffDate && new Date(earlyBirdMemberTier.cutoffDate) >= now) {
        tierRows.push({
            key: 'EARLY_BIRD_MEMBER',
            label: TIER_LABELS.EARLY_BIRD_MEMBER,
            unitPrice: Number(earlyBirdMemberTier.price),
            note: `until ${new Date(earlyBirdMemberTier.cutoffDate).toLocaleDateString()}`,
        });
    }
    const earlyBirdNonMemberTier = findActiveTier('EARLY_BIRD_NON_MEMBER');
    if (earlyBirdNonMemberTier?.cutoffDate && new Date(earlyBirdNonMemberTier.cutoffDate) >= now) {
        tierRows.push({
            key: 'EARLY_BIRD_NON_MEMBER',
            label: TIER_LABELS.EARLY_BIRD_NON_MEMBER,
            unitPrice: Number(earlyBirdNonMemberTier.price),
            note: `until ${new Date(earlyBirdNonMemberTier.cutoffDate).toLocaleDateString()}`,
        });
    }
    const studentTier = findActiveTier('STUDENT');
    if (studentTier) {
        tierRows.push({ key: 'STUDENT', label: TIER_LABELS.STUDENT, unitPrice: Number(studentTier.price) });
    }
    const groupStudentTier = findActiveTier('GROUP_STUDENT');
    if (groupStudentTier) {
        const minGroupSize = groupStudentTier.minGroupSize || 2;
        tierRows.push({
            key: 'GROUP_STUDENT',
            label: TIER_LABELS.GROUP_STUDENT,
            unitPrice: Number(groupStudentTier.price),
            minGroupSize,
            note: `min ${minGroupSize} tickets`,
        });
    }

    const totalTicketCount = Object.values(tierQuantities).reduce((sum, q) => sum + (q || 0), 0);
    const estimatedTotal = tierRows.reduce(
        (sum, row) => sum + row.unitPrice * (tierQuantities[row.key] || 0),
        0,
    );
    const invalidGroupRow = tierRows.find(
        (row) => row.key === 'GROUP_STUDENT' && tierQuantities.GROUP_STUDENT > 0 && tierQuantities.GROUP_STUDENT < row.minGroupSize,
    );

    const decrementTierQuantity = (key) => {
        setUserEditedTiers(true);
        setTierQuantities((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }));
    };
    const incrementTierQuantity = (key) => {
        setUserEditedTiers(true);
        setTierQuantities((prev) => {
            const total = Object.values(prev).reduce((sum, q) => sum + (q || 0), 0);
            if (Number.isFinite(remainingCapacity) && total >= remainingCapacity) return prev;
            return { ...prev, [key]: (prev[key] || 0) + 1 };
        });
    };

    const submitRegistration = async () => {
        setSubmitting(true);
        try {
            const lineItems = tierRows
                .filter((row) => (tierQuantities[row.key] || 0) > 0)
                .map((row) => ({ tierKey: row.key, quantity: tierQuantities[row.key] }));

            const payload = {
                registrationType: 'event',
                eventId: selectedEventId,
                sessionIds: selectedSessionIds,
                lineItems,
                profile: {
                    profileId: selectedProfileId || undefined,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.surname,
                    phone: formData.phone,
                    workLocation: isOtherSelection(formData.workPlace) ? formData.otherWorkPlace : formData.workPlace,
                    grade: isOtherSelection(formData.grade) ? formData.otherGrade : formData.grade,
                    addressLine1: formData.addressLine1,
                    addressLine2: formData.addressLine2,
                    townCity: formData.townCity,
                    countyState: formData.countyState,
                    eircode: formData.eircode,
                    country: formData.country,
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

    const handleUseDuplicateCandidate = (candidate) => {
        setSelectedProfileId(candidate.profileId);
        setAttendeeMembershipNumber(candidate.membershipNumber || null);
        setDuplicateCandidates(null);
        submitRegistration();
    };

    const handleConfirmCreateNew = () => {
        setDuplicateCandidates(null);
        setConfirmedNewProfile(true);
        submitRegistration();
    };

    const handleSubmit = async () => {
        if (!selectedEventId) {
            message.error('Please select an event');
            return;
        }
        if (!formData.email) {
            message.error('Email is required');
            return;
        }
        if (totalTicketCount < 1) {
            message.error('Please add at least one ticket');
            return;
        }
        if (invalidGroupRow) {
            message.error(`Group Student pricing requires at least ${invalidGroupRow.minGroupSize} tickets`);
            return;
        }

        // New, not-yet-linked attendee - resolve against existing profiles
        // before registering, so we never silently create a duplicate.
        if (isNewAttendee && !selectedProfileId && !confirmedNewProfile) {
            setSubmitting(true);
            try {
                const result = await checkAttendeeDuplicates({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.surname,
                    phone: formData.phone,
                    addressLine1: formData.addressLine1,
                    townCity: formData.townCity,
                    countyState: formData.countyState,
                    eircode: formData.eircode,
                    country: formData.country,
                });
                if (result?.resolution === 'review' && result.candidates?.length) {
                    setDuplicateCandidates(result.candidates);
                    return;
                }
                // "exact" or "none": createRegistration's own find-or-create
                // step already handles both safely (reuses the exact match,
                // or creates fresh since we've just confirmed there's no
                // likely duplicate).
            } catch (err) {
                message.error('Failed to check for existing profiles - please try again.');
                return;
            } finally {
                setSubmitting(false);
            }
        }

        await submitRegistration();
    };

    const headerExtra = (
        <Button
            className="butn primary-btn"
            loading={submitting}
            disabled={!!duplicateCandidates}
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
                                onClear={handleClearAttendee}
                            />
                            {isNewAttendee && (
                                <Text type="warning" style={{ display: 'block', marginTop: 8 }}>
                                    Registering a new, non-member attendee.
                                </Text>
                            )}
                            {duplicateCandidates && (
                                <div
                                    style={{
                                        border: '1px solid #ffd591',
                                        background: '#fff7e6',
                                        borderRadius: 8,
                                        padding: 12,
                                        marginTop: 8,
                                    }}
                                >
                                    <Text strong>Possible existing profiles found</Text>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                        Review before creating a new one, to avoid duplicate records.
                                    </Text>
                                    {duplicateCandidates.map((candidate) => (
                                        <div
                                            key={candidate.profileId}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '6px 0',
                                                borderBottom: '1px solid #ffe7ba',
                                            }}
                                        >
                                            <div>
                                                <div>{candidate.name || '-'}</div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {candidate.email || 'no email'}
                                                    {candidate.membershipNumber ? ` · ${candidate.membershipNumber}` : ''}
                                                    {candidate.classification ? ` · ${candidate.classification}` : ''}
                                                </Text>
                                            </div>
                                            <Button size="small" onClick={() => handleUseDuplicateCandidate(candidate)}>
                                                Use this profile
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        style={{ marginTop: 8 }}
                                        size="small"
                                        danger
                                        type="text"
                                        onClick={handleConfirmCreateNew}
                                    >
                                        None of these - create new profile
                                    </Button>
                                </div>
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
                            showSearch
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
                            showSearch
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
                                    showSearch
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
                            disabled={!!eventId}
                            showSearch
                            isIDs
                        />

                        <div className="event-summary-box">
                            <label className="my-input-label">Event summary</label>
                            <div className="summary-table">
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Category</div>
                                    <div className="summary-table-value">{eventCategoryLabel}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Event type</div>
                                    <div className="summary-table-value">{eventTypeLabel}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Format</div>
                                    <div className="summary-table-value">{eventFormat}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Venue</div>
                                    <div className="summary-table-value">{selectedEvent?.venue || '-'}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Total capacity</div>
                                    <div className="summary-table-value">{selectedEvent?.capacity != null ? selectedEvent.capacity : 'Unlimited'}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Registered</div>
                                    <div className="summary-table-value">{registeredCount}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Available capacity</div>
                                    <div className="summary-table-value">{availableCapacity != null ? availableCapacity : 'Unlimited'}</div>
                                </div>
                                <div className="summary-table-row">
                                    <div className="summary-table-label">Membership status</div>
                                    <div className="summary-table-value">{membershipStatusLabel}</div>
                                </div>

                                {tierRows.map((row) => (
                                    <div className="summary-table-row" key={row.key}>
                                        <div className="summary-table-label">
                                            {row.label}
                                            <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
                                                €{row.unitPrice.toFixed(2)}{row.note ? ` (${row.note})` : ''}
                                            </div>
                                        </div>
                                        <div className="summary-table-value">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Button
                                                    size="small"
                                                    icon={<MinusOutlined />}
                                                    onClick={() => decrementTierQuantity(row.key)}
                                                    disabled={!(tierQuantities[row.key] > 0)}
                                                />
                                                <span style={{ minWidth: 20, textAlign: 'center' }}>{tierQuantities[row.key] || 0}</span>
                                                <Button
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => incrementTierQuantity(row.key)}
                                                    disabled={Number.isFinite(remainingCapacity) && totalTicketCount >= remainingCapacity}
                                                />
                                            </div>
                                            {row.key === 'GROUP_STUDENT' && tierQuantities.GROUP_STUDENT > 0 && tierQuantities.GROUP_STUDENT < row.minGroupSize && (
                                                <Text type="danger" style={{ fontSize: 12, display: 'block' }}>
                                                    Requires at least {row.minGroupSize} tickets
                                                </Text>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {Number.isFinite(remainingCapacity) && (
                                    <div className="summary-table-row">
                                        <div className="summary-table-label">Seats remaining</div>
                                        <div className="summary-table-value">{Math.max(remainingCapacity - totalTicketCount, 0)}</div>
                                    </div>
                                )}
                            </div>
                            <div className="total-fee-row">
                                <div className="total-label">
                                    Total Registration Fee
                                    <p>
                                        {computedAmount != null
                                            ? 'Charged'
                                            : totalTicketCount > 0
                                                ? `${totalTicketCount} ticket${totalTicketCount === 1 ? '' : 's'} - exact fee confirmed on submission`
                                                : 'Add tickets above to calculate the fee'}
                                    </p>
                                </div>
                                <div className="total-amount">
                                    {computedAmount != null
                                        ? `€${(computedAmount / 100).toFixed(2)}`
                                        : totalTicketCount > 0
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
