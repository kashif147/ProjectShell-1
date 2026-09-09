import React, { useEffect, useRef, useState } from 'react';
import {
    Drawer,
    Button,
    Row,
    Col,
    Typography,
    Radio,
    Tag,
    Tooltip,
    Space,
    Popconfirm,
    message
} from 'antd';
import { CreditCardOutlined, MinusOutlined, PlusOutlined, DiffOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import MyInput from '../common/MyInput';
import CustomSelect from '../common/CustomSelect';
import MemberSearch from '../profile/MemberSearch';
import ProfileDuplicateReview from '../profile/ProfileDuplicateReview';
import AttendeeDuplicateCompareDrawer from './AttendeeDuplicateCompareDrawer';
import { resolveMatchClassification, CLASSIFICATION_COLORS, formatMatchDetail } from '../../utils/duplicateMatch';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../features/CountriesSlice';
import { getProfileDetailsById } from '../../features/profiles/ProfileDetailsSlice';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
    fetchEvents,
    fetchEventById,
    fetchEventPriceQuote,
    createRegistration,
    approveRegistration,
    rejectRegistration,
    retryRegistrationPayment,
} from '../../services/eventsApi';
import { dispatchProfileInvalidate } from '../../utils/profileRealtimeEvents';
import { computeEventFormat } from '../../utils/eventFormat';
import { resolveEventCategoryLabel } from '../../utils/eventCategory';
import "../../styles/CreateAttendeeDrawer.css";

const { Text } = Typography;
const libraries = ['places', 'maps'];

const REGISTRATION_STATUS_TAG_COLORS = {
    pending: 'gold',
    confirmed: 'green',
    cancelled: 'red',
    attended: 'blue',
    'no-show': 'default',
};

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
    nmbiNumber: '',
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

const CreateAttendeeDrawerInner = ({ open, onClose, eventId, registration, onApproved }) => {
    const stripe = useStripe();
    const elements = useElements();
    // When a registration is supplied, this same drawer opens read-only for
    // that existing registration (attendee/event/payment details plus
    // Approve/Reject) instead of the create-a-new-attendee form - triggered
    // from the Attendees table's status link, rather than the separate
    // EventRegistrationViewDrawer.
    const viewMode = !!registration;
    const [registrationStatus, setRegistrationStatus] = useState(registration?.status);
    const [approvalStatus, setApprovalStatus] = useState(registration?.approvalStatus);
    // View mode only - live payment status/method, re-synced from the
    // registration prop below and updated locally right after a successful
    // retry/switch (see handleRetryPayment) so Approve unblocks immediately
    // rather than waiting on the async requires_capture RabbitMQ event to
    // land.
    const [paymentStatus, setPaymentStatus] = useState(registration?.paymentStatus);
    const [viewPaymentMethod, setViewPaymentMethod] = useState(registration?.paymentMethod);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [retryingPayment, setRetryingPayment] = useState(false);
    const [retryCardComplete, setRetryCardComplete] = useState({ number: false, expiry: false, cvc: false });
    // View mode only - the CRM user opted to change a manual/comp/invoice
    // registration over to Card (Stripe) instead; reveals the same card-entry
    // UI used to retry a stuck stripe payment. Irrelevant once
    // viewPaymentMethod is already "stripe".
    const [switchToCard, setSwitchToCard] = useState(false);
    // View mode only - the recorded duplicateReview verdict from intake, and
    // (for POTENTIAL_MATCH) the reviewer's resolution this session, needed
    // before Approve is allowed to proceed.
    const [duplicateReviewStatus, setDuplicateReviewStatus] = useState(null);
    const [pendingReviewDecision, setPendingReviewDecision] = useState(null); // 'LINK' | 'CREATE_NEW' | null

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
    // NMBI No. is an exact-match duplicate-detection field and an official
    // register number - once an existing profile already has one, lock the
    // field here so a casual edit on the registration form can never
    // silently overwrite it (see syncAttendeeProfileFields on the backend,
    // which only ever fills in a currently-blank value anyway).
    const [nmbiLocked, setNmbiLocked] = useState(false);
    // Candidate row (from checkAttendeeDuplicates) currently open in the
    // compare-and-choose drawer - for a NEW attendee, not yet a persisted
    // Profile, so there's nothing to run a real merge against yet.
    const [compareCandidate, setCompareCandidate] = useState(null);
    // The real duplicate-review + merge workflow (identical to the profile
    // page's "Check Duplicate" action) for an attendee already linked to an
    // existing, persisted profileId - two real Profile documents, so a real
    // transactional merge is actually applicable here.
    const [duplicateReviewOpen, setDuplicateReviewOpen] = useState(false);
    // Create mode only - explicit CRM choice for what happens right after
    // Add Attendee: 'accept' approves immediately (creates/links the profile,
    // captures/posts payment), 'reject' cancels immediately with a full audit
    // trail, and left null (the default) leaves the registration
    // pending_review for later manual approval - no case silently auto-
    // approves anymore.
    const [addDecision, setAddDecision] = useState(null);
    // Id of the registration this same drawer session just created (create
    // mode only) - once set, the duplicate-compare panel below is resolving
    // an already-persisted pending_review registration rather than gating a
    // not-yet-submitted form.
    const [createdRegistrationId, setCreatedRegistrationId] = useState(null);

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

    // View mode: populate everything from the existing registration instead
    // of running the create-attendee flow (no MemberSearch, no dedupe check,
    // no live price quote - just display what was actually recorded).
    useEffect(() => {
        if (!open || !registration) return;
        const snapshot = registration.attendeeSnapshot || {};
        setIsNewAttendee(false);
        setSelectedProfileId(registration.profileId || null);
        setAttendeeMembershipNumber(registration.membershipNumber || null);
        setNmbiLocked(false);
        setPaymentMethod(registration.paymentMethod || 'stripe');
        setRegistrationStatus(registration.status);
        setApprovalStatus(registration.approvalStatus);
        setPaymentStatus(registration.paymentStatus);
        setViewPaymentMethod(registration.paymentMethod);
        setRetryCardComplete({ number: false, expiry: false, cvc: false });
        setSwitchToCard(false);
        const review = registration.duplicateReview || {};
        setDuplicateReviewStatus(review.status || null);
        setPendingReviewDecision(null);
        setDuplicateCandidates(
            review.status === 'POTENTIAL_MATCH' && review.matchSummary?.length ? review.matchSummary : null,
        );
        setFormData({
            ...INITIAL_FORM_DATA,
            firstName: snapshot.firstName || '',
            surname: snapshot.lastName || '',
            email: snapshot.email || '',
            phone: snapshot.phone || '',
            workPlace: snapshot.workLocation || '',
            grade: snapshot.grade || '',
            addressLine1: snapshot.addressLine1 || '',
            addressLine2: snapshot.addressLine2 || '',
            townCity: snapshot.townCity || '',
            countyState: snapshot.countyState || '',
            eircode: snapshot.eircode || '',
            country: snapshot.country || 'Ireland',
        });
        setSelectedEventId(registration.eventId || registration.courseId || '');
    }, [open, registration]);

    // Fresh create-mode session - this drawer instance stays mounted across
    // multiple Add Attendee uses (toggled via `open`, not remounted), so
    // clear out anything left over from a previous submission before it's
    // reused for a different attendee.
    useEffect(() => {
        if (!open || viewMode) return;
        setAddDecision(null);
        setCreatedRegistrationId(null);
        setDuplicateReviewStatus(null);
        setPendingReviewDecision(null);
        setDuplicateCandidates(null);
    }, [open, viewMode]);

    useEffect(() => {
        if (!open || viewMode) return;
        if (eventId) {
            // Came from the event's own page - lock straight to it instead of
            // fetching the general (Published-only) list.
            setSelectedEventId(eventId);
            return;
        }
        fetchEvents({ status: 'Published' })
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch(() => setEvents([]));
    }, [open, eventId, viewMode]);

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
        if (viewMode || !selectedEventId) {
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
    }, [selectedEventId, selectedProfileId, viewMode]);

    // Pre-fill 1 ticket on the suggested/eligible tier as a convenience
    // default - keeps re-syncing to whatever the linked profile's real
    // membership resolves to (e.g. Non-member -> Member once a member
    // profile is searched/selected) right up until the CRM user manually
    // touches a counter themselves, at which point we stop overwriting.
    useEffect(() => {
        if (viewMode || userEditedTiers) return;
        if (!priceQuote?.appliedTier) return;
        setTierQuantities({ [priceQuote.appliedTier]: 1 });
    }, [priceQuote, userEditedTiers, viewMode]);

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
        // Switching to a different attendee starts pricing over - any tier
        // manually picked for whoever was previously selected (e.g. an Early
        // Bird Member ticket left over from a member profile) must not carry
        // over and silently get charged alongside this attendee's own tier.
        setTierQuantities({});
        setUserEditedTiers(false);
        const existingNmbi = memberData.professionalDetails?.nmbiNumber || '';
        setNmbiLocked(!!existingNmbi);
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
            nmbiNumber: existingNmbi,
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
        setNmbiLocked(false);
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
        setNmbiLocked(false);
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
    // View mode always shows populated fields, but never editable ones.
    const fieldsDisabled = viewMode || !fieldsEnabled;

    // View mode (and the eventId-prop-locked create case) is always locked to
    // a single event, resolved via fetchEventById into selectedEvent - the
    // `events` list fetch is skipped entirely in view mode, so falling back
    // to it here left the select with no matching option and just showing
    // the raw eventId.
    const eventOptions = (viewMode || eventId)
        ? (selectedEvent ? [{ label: selectedEvent.title, value: selectedEvent._id }] : [])
        : events.map((ev) => ({ label: ev.title, value: ev._id }));

    const eventCategoryLabel = resolveEventCategoryLabel(selectedEvent, eventCategoryOptions);
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

    // Shared by the view-mode Approve/Reject buttons and the create-mode
    // "Approve now"/"Reject" one-step flow below - `override` lets a caller
    // that just resolved a POTENTIAL_MATCH this same tick (compare-drawer
    // callbacks) pass the fresh decision directly, since a just-set piece of
    // state isn't readable from this closure until the next render.
    const finalizeApproveOrReject = async (id, action, override = {}) => {
        const reviewStatus = 'reviewStatus' in override ? override.reviewStatus : duplicateReviewStatus;
        const decision = 'decision' in override ? override.decision : pendingReviewDecision;
        const candidateId = 'candidateProfileId' in override ? override.candidateProfileId : selectedProfileId;
        if (action === 'accept') {
            setApproving(true);
            try {
                const body =
                    reviewStatus === 'POTENTIAL_MATCH'
                        ? { decision, candidateProfileId: decision === 'LINK' ? candidateId : undefined }
                        : undefined;
                const updated = await approveRegistration(id, body);
                setRegistrationStatus(updated?.status || 'confirmed');
                setApprovalStatus(updated?.approvalStatus || 'approved');
                return updated;
            } finally {
                setApproving(false);
            }
        }
        setRejecting(true);
        try {
            const updated = await rejectRegistration(id);
            setRegistrationStatus(updated?.status || 'cancelled');
            setApprovalStatus(updated?.approvalStatus || 'rejected');
            return updated;
        } finally {
            setRejecting(false);
        }
    };

    // Create mode only - completes the one-step Add Attendee flow once a
    // registration exists with nothing ambiguous left to resolve: applies
    // the CRM's Accept/Reject choice (or leaves it pending_review if neither
    // was selected), then closes the drawer.
    const finishAfterCreate = async (id, profileIdFallback, override) => {
        try {
            if (id && addDecision) {
                const updated = await finalizeApproveOrReject(id, addDecision, override);
                message.success(addDecision === 'accept' ? 'Attendee added and approved' : 'Attendee added and rejected');
                dispatchProfileInvalidate({ scopes: ['events'], profileId: updated?.profileId || profileIdFallback || selectedProfileId });
            } else {
                message.success('Attendee added - pending review');
                dispatchProfileInvalidate({ scopes: ['events'], profileId: profileIdFallback || selectedProfileId });
            }
        } catch (err) {
            message.warning(
                `Attendee added, but ${addDecision === 'accept' ? 'approval' : 'rejection'} failed - it is pending review. ` +
                    (err?.response?.data?.error?.message || err?.message || ''),
            );
            dispatchProfileInvalidate({ scopes: ['events'], profileId: profileIdFallback || selectedProfileId });
        } finally {
            if (onClose) onClose();
        }
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
                    nmbiNumber: formData.nmbiNumber || undefined,
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
            const createdRegistration = result?.registration;
            setComputedAmount(createdRegistration?.amount ?? null);

            // The registration now exists, pending_review - the server-side
            // dedup check (email/mobile/NMBI exact, name/DOB/eircode/address
            // fuzzy) already ran as part of createRegistration itself.
            const review = createdRegistration?.duplicateReview || {};
            setDuplicateReviewStatus(review.status || null);
            setPendingReviewDecision(null);
            setCreatedRegistrationId(createdRegistration?._id || null);

            if (paymentMethod === 'stripe') {
                if (!result?.payment?.clientSecret) {
                    // The registration + PaymentIntent exist server-side, but
                    // there's nothing to confirm the card against - approving
                    // now would just fail Stripe capture with no successful
                    // authorization behind it. Never silently fall through to
                    // "success"/auto-approve here - leave it pending_review
                    // and tell the CRM user plainly instead.
                    message.error(
                        'Attendee added, but card payment could not be started (no payment session returned) - it has been left pending review. Reject and re-add, or retry payment for this attendee.',
                    );
                    if (onClose) onClose();
                    return;
                }
                if (!stripe || !elements) {
                    message.error(
                        'Attendee added, but Stripe had not finished loading so card payment was never attempted - it has been left pending review. Reject and re-add.',
                    );
                    if (onClose) onClose();
                    return;
                }
                const cardNumberElement = elements.getElement(CardNumberElement);
                if (!cardNumberElement) {
                    message.error(
                        'Attendee added, but the card fields were not ready so payment was never attempted - it has been left pending review. Reject and re-add.',
                    );
                    if (onClose) onClose();
                    return;
                }
                const confirmResult = await stripe.confirmCardPayment(result.payment.clientSecret, {
                    payment_method: { card: cardNumberElement },
                });
                if (confirmResult.error) {
                    message.error(
                        `Attendee added, but card payment failed (${confirmResult.error.message || 'unknown error'}) - it has been left pending review. Reject and re-add, or retry payment.`,
                    );
                    if (onClose) onClose();
                    return;
                }
            }

            if (review.status === 'POTENTIAL_MATCH' && review.matchSummary?.length) {
                setDuplicateCandidates(review.matchSummary);
                message.info('A possible existing profile was found - resolve it below to finish.');
                return;
            }

            await finishAfterCreate(createdRegistration?._id, createdRegistration?.profileId, {
                reviewStatus: review.status || null,
                decision: null,
                candidateProfileId: null,
            });
        } catch (err) {
            message.error(err?.response?.data?.error?.message || err?.message || 'Failed to register attendee');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenCompare = (candidate) => {
        setCompareCandidate(candidate);
    };

    // Resolution from AttendeeDuplicateCompareDrawer. View mode (resolving a
    // POTENTIAL_MATCH at approval): records the LINK decision so Approve can
    // proceed - nothing is submitted/approved yet, that's a separate click.
    // Create mode: the registration was already created (pending_review)
    // before this panel could show at all - once resolved here, immediately
    // finish the one-step Add Attendee flow (apply the CRM's Accept/Reject
    // choice, or leave it pending_review).
    const handleUseCompareSelected = (resolvedValues, candidateProfile) => {
        setFormData((prev) => ({ ...prev, ...resolvedValues }));
        const profileId = compareCandidate?.profileId || null;
        setSelectedProfileId(profileId);
        setAttendeeMembershipNumber(candidateProfile?.membershipNumber || compareCandidate?.membershipNumber || null);
        setIsNewAttendee(false);
        setNmbiLocked(!!candidateProfile?.professionalDetails?.nmbiNumber);
        setDuplicateCandidates(null);
        setCompareCandidate(null);
        setPendingReviewDecision('LINK');
        if (viewMode) return;
        if (createdRegistrationId) {
            finishAfterCreate(createdRegistrationId, profileId, {
                reviewStatus: 'POTENTIAL_MATCH',
                decision: 'LINK',
                candidateProfileId: profileId,
            });
        }
    };

    // "None of these" - view mode just records the CREATE_NEW decision for
    // Approve to act on. Create mode: same immediate-finish as above, since
    // the registration already exists by the time this panel can show.
    const handleConfirmCreateNew = () => {
        setDuplicateCandidates(null);
        setCompareCandidate(null);
        setPendingReviewDecision('CREATE_NEW');
        if (viewMode) return;
        if (createdRegistrationId) {
            finishAfterCreate(createdRegistrationId, null, {
                reviewStatus: 'POTENTIAL_MATCH',
                decision: 'CREATE_NEW',
                candidateProfileId: null,
            });
        }
    };

    // "Check Duplicate" on an already-selected existing profile - the real,
    // transactional duplicate-review + merge workflow (identical to the
    // profile page's action), since both sides here are persisted profiles.
    const handleDuplicateReviewMerged = () => {
        if (!selectedProfileId) return;
        dispatch(getProfileDetailsById(selectedProfileId))
            .unwrap()
            .then((profileData) => {
                if (profileData) handleMemberSelect(profileData);
            })
            .catch(() => {});
    };

    // View mode only - approve/reject a pending-review registration in
    // place, rather than a separate registration-review drawer. Approve
    // resolves/links the Profile and captures/posts payment server-side;
    // when duplicateReviewStatus is POTENTIAL_MATCH, the reviewer must have
    // already resolved it this session (pendingReviewDecision) before this
    // can be called - see the disabled state on the button below.
    const handleApprove = async () => {
        if (!registration?._id) return;
        try {
            const updated = await finalizeApproveOrReject(registration._id, 'accept');
            message.success('Registration approved');
            dispatchProfileInvalidate({ scopes: ['events'], profileId: updated?.profileId || registration.profileId });
            onApproved?.(updated);
        } catch (err) {
            message.error(err?.response?.data?.error?.message || err?.message || 'Failed to approve registration');
            // A capture conflict (e.g. the Stripe authorization hold expired
            // between authorization and approval - see events-service's
            // registrationApproval.service.js) already corrected paymentStatus
            // server-side, but this drawer instance's local paymentStatus is
            // still the stale "authorized" value it opened with. Without this,
            // the red tag/Approve-block/Retry Payment section below never
            // engage until the drawer is closed and reopened with fresh data -
            // the same "gap" this whole retry flow exists to close.
            const stripeStatus = err?.response?.data?.error?.details?.stripeStatus;
            if (stripeStatus && stripeStatus !== 'requires_capture') {
                setPaymentStatus(stripeStatus === 'succeeded' ? 'succeeded' : 'failed');
            }
        }
    };

    const handleReject = async () => {
        if (!registration?._id) return;
        try {
            const updated = await finalizeApproveOrReject(registration._id, 'reject');
            message.success('Registration rejected');
            dispatchProfileInvalidate({ scopes: ['events'], profileId: registration.profileId });
            onApproved?.(updated);
        } catch (err) {
            message.error(err?.response?.data?.error?.message || err?.message || 'Failed to reject registration');
        }
    };

    // View mode only - (re-)establishes a capturable Stripe payment for a
    // pending-review registration. Two situations land here: a stripe
    // registration whose card was never actually confirmed (the Add Attendee
    // drawer's client-side confirmCardPayment failed or was abandoned - a
    // declined card, closed tab, abandoned 3DS - which otherwise made every
    // /approve attempt fail forever with "PaymentIntent cannot be captured
    // when its status is requires_payment_method" and gave the CRM user no
    // way to fix it); or a manual/comp/invoice registration the CRM user now
    // wants to charge a card for instead (see switchToCard/canPayByCard
    // below). Re-fetches a clientSecret (events-service reuses the same
    // PaymentIntent when it's still confirmable, supersedes it with a fresh
    // one if it's dead, or creates a brand new one when switching off a
    // manual/comp/invoice method) and re-runs stripe.confirmCardPayment
    // against the card fields below.
    const handleRetryPayment = async () => {
        if (!registration?._id) return;
        setRetryingPayment(true);
        try {
            const result = await retryRegistrationPayment(registration._id);
            if (result?.paymentMethod) setViewPaymentMethod(result.paymentMethod);
            if (result?.paymentStatus === 'authorized') {
                // Already authorized server-side (e.g. the requires_capture
                // webhook/listener update had simply not reached this drawer
                // yet) - nothing left to confirm client-side.
                setPaymentStatus('authorized');
                message.success('Payment is already authorized - you can Approve now.');
                return;
            }
            if (!result?.clientSecret) {
                message.error('Could not start a new payment attempt for this registration.');
                return;
            }
            if (!stripe || !elements) {
                message.error('Stripe has not finished loading yet - try again in a moment.');
                return;
            }
            const cardNumberElement = elements.getElement(CardNumberElement);
            if (!cardNumberElement) {
                message.error('Enter the card details below, then try again.');
                return;
            }
            const confirmResult = await stripe.confirmCardPayment(result.clientSecret, {
                payment_method: { card: cardNumberElement },
            });
            if (confirmResult.error) {
                message.error(`Card payment failed: ${confirmResult.error.message || 'unknown error'}`);
                return;
            }
            // Use the synchronous confirm result to unblock Approve now,
            // rather than waiting on the async requires_capture RabbitMQ
            // event (webhook lag, or never arrives at all in local dev - see
            // events-service's payment.status.listener.js).
            if (confirmResult.paymentIntent?.status === 'requires_capture') {
                setPaymentStatus('authorized');
                message.success('Card confirmed - you can Approve now.');
            } else {
                message.info('Card submitted - waiting for confirmation before Approve can proceed.');
            }
        } catch (err) {
            message.error(err?.response?.data?.error?.message || err?.message || 'Failed to retry payment');
        } finally {
            setRetryingPayment(false);
        }
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
        if (paymentMethod === 'stripe' && !(cardComplete.number && cardComplete.expiry && cardComplete.cvc)) {
            message.error('Card number, expiry date and CVC are required for card payments');
            return;
        }

        // Duplicate detection now always runs server-side at intake
        // (createRegistration), regardless of source (CRM/portal/mobile) or
        // whether a profileId was already supplied - a CRM reviewer resolves
        // any potential match later, at approval, not before this submit.
        await submitRegistration();
    };

    // Approve is disabled until a POTENTIAL_MATCH has actually been resolved
    // this session (via the compare drawer's LINK, or "None of these" ->
    // CREATE_NEW below) - there's nothing ambiguous to gate on for any other
    // duplicateReviewStatus.
    const approveBlockedByReview = duplicateReviewStatus === 'POTENTIAL_MATCH' && !pendingReviewDecision;
    // A stripe registration whose card was never actually confirmed
    // (paymentStatus stuck at "pending"/"failed") always fails capture at
    // approval with a 409 - block Approve and point at the retry UI below
    // instead of letting the CRM user hit that dead end.
    const stripePaymentNotAuthorized =
        viewPaymentMethod === 'stripe' && !['authorized', 'succeeded'].includes(paymentStatus);
    const approveBlockedByPayment = viewMode && stripePaymentNotAuthorized;
    // View mode only - a manual/comp/invoice registration can be switched to
    // Card (Stripe) any time before approval, if the CRM user changes their
    // mind about how the attendee is paying.
    // Stripe rejects sub-minimum PaymentIntents, so a free (comp) or
    // zero-amount registration has nothing a card payment could actually
    // charge - don't offer to switch it to Card.
    const canPayByCard =
        viewMode && approvalStatus === 'pending_review' && viewPaymentMethod !== 'stripe' && registration?.amount > 0;
    const showCardCaptureSection =
        viewMode && approvalStatus === 'pending_review' && (stripePaymentNotAuthorized || (canPayByCard && switchToCard));
    // Create mode only - card number/expiry/CVC must all be entered before
    // Add Attendee is clickable when Card (Stripe) is the chosen payment
    // method; nothing to check for invoice/comp/manual.
    const stripeCardIncomplete =
        !viewMode && paymentMethod === 'stripe' && !(cardComplete.number && cardComplete.expiry && cardComplete.cvc);

    const headerExtra = viewMode ? (
        approvalStatus === 'pending_review' ? (
            <Space>
                <Tooltip title={approveBlockedByPayment ? 'Payment has not been authorized yet - retry payment below before approving.' : undefined}>
                <Button
                    className="butn primary-btn"
                    disabled={approveBlockedByReview || approveBlockedByPayment}
                    loading={approving}
                    onClick={handleApprove}
                >
                    Approve
                </Button>
                </Tooltip>
                <Popconfirm
                    title="Reject this registration?"
                    description="The registration will be cancelled and the seat released; any Stripe authorization is cancelled (not refunded, since nothing was captured)."
                    okText="Reject"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleReject}
                >
                    <Button danger loading={rejecting}>
                        Reject
                    </Button>
                </Popconfirm>
            </Space>
        ) : null
    ) : (
        <Space>
            <Radio.Group
                value={addDecision}
                onChange={(e) => setAddDecision(e.target.value)}
                disabled={submitting || !!createdRegistrationId}
                optionType="button"
                buttonStyle="solid"
            >
                <Radio.Button value="accept">Approve now</Radio.Button>
                <Radio.Button value="reject">Reject</Radio.Button>
            </Radio.Group>
            <Tooltip title={stripeCardIncomplete ? 'Enter the card number, expiry date and CVC before adding this attendee.' : undefined}>
                <Button
                    className="butn primary-btn"
                    loading={submitting}
                    disabled={!!duplicateCandidates || !!createdRegistrationId || stripeCardIncomplete}
                    onClick={handleSubmit}
                >
                    Add Attendee
                </Button>
            </Tooltip>
        </Space>
    );

    return (
        <>
        <Drawer
            title={
                <span style={{ fontSize: '18px', fontWeight: 900 }}>
                    {viewMode ? 'Attendee' : 'Attendee Details'}
                </span>
            }
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
                            {viewMode ? (
                                <>
                                    <label className="my-input-label">Attendee</label>
                                    <div>
                                        <Tag
                                            color={REGISTRATION_STATUS_TAG_COLORS[registrationStatus] || REGISTRATION_STATUS_TAG_COLORS.pending}
                                            style={{ textTransform: 'capitalize' }}
                                        >
                                            {registrationStatus}
                                        </Tag>
                                        {attendeeMembershipNumber ? (
                                            <Text type="secondary" style={{ marginLeft: 8 }}>
                                                Mem. No {attendeeMembershipNumber}
                                            </Text>
                                        ) : null}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <label className="my-input-label">Profile Search</label>
                                    <Space.Compact style={{ display: 'flex', width: '100%' }}>
                                        <MemberSearch
                                            fullWidth={true}
                                            onSelectBehavior="callback"
                                            onSelectCallback={handleMemberSelect}
                                            onAddMember={handleAddNewAttendee}
                                            addMemberLabel="Add as new attendee"
                                            onClear={handleClearAttendee}
                                        />
                                        {selectedProfileId && (
                                            <Tooltip title="Check Duplicate">
                                                <Button
                                                    icon={<SafetyCertificateOutlined />}
                                                    onClick={() => setDuplicateReviewOpen(true)}
                                                />
                                            </Tooltip>
                                        )}
                                    </Space.Compact>
                                </>
                            )}
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
                                        The registration has been recorded and is pending review - compare
                                        against an existing profile below, or confirm this is a new attendee, to finish.
                                    </Text>
                                    {duplicateCandidates.map((candidate) => {
                                        const label = resolveMatchClassification(candidate);
                                        return (
                                            <div
                                                key={candidate.profileId}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 12,
                                                    padding: '8px 0',
                                                    borderTop: '1px solid #ffe7ba',
                                                }}
                                            >
                                                <div>
                                                    {label !== '—' && (
                                                        <Tag color={CLASSIFICATION_COLORS[label] || 'default'} style={{ marginRight: 8 }}>
                                                            {label}
                                                        </Tag>
                                                    )}
                                                    <Text strong>{candidate.name || '—'}</Text>
                                                    {candidate.membershipNumber && (
                                                        <Text type="secondary" style={{ marginLeft: 8 }}>
                                                            Mem. No {candidate.membershipNumber}
                                                        </Text>
                                                    )}
                                                    <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                                                        {formatMatchDetail(candidate) || candidate.email || ''}
                                                    </Text>
                                                </div>
                                                <Button
                                                    size="small"
                                                    icon={<DiffOutlined />}
                                                    onClick={() => handleOpenCompare(candidate)}
                                                >
                                                    Compare & resolve
                                                </Button>
                                            </div>
                                        );
                                    })}
                                    <Button
                                        style={{ marginTop: 8 }}
                                        size="small"
                                        danger
                                        type="text"
                                        onClick={handleConfirmCreateNew}
                                    >
                                        None of these - this is a new attendee
                                    </Button>
                                </div>
                            )}
                            {viewMode && duplicateReviewStatus === 'POTENTIAL_MATCH' && !duplicateCandidates && pendingReviewDecision && (
                                <Text type="success" style={{ display: 'block', marginTop: 8 }}>
                                    {pendingReviewDecision === 'LINK'
                                        ? 'Resolved: will link to the selected existing profile.'
                                        : 'Resolved: will register as a new attendee.'}
                                </Text>
                            )}
                            {!viewMode && !fieldsEnabled && (
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
                                    disabled={fieldsDisabled}
                                />
                            </Col>
                            <Col span={12}>
                                <MyInput
                                    label="Surname"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                    disabled={fieldsDisabled}
                                />
                            </Col>
                        </Row>

                        <MyInput
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john.doe@example.com"
                            disabled={fieldsDisabled}
                            required={!viewMode}
                        />

                        <MyInput
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            type="mobile"
                            disabled={fieldsDisabled}
                        />

                        {viewMode ? (
                            <MyInput label="Work location" name="workPlace" value={formData.workPlace} disabled />
                        ) : (
                            <CustomSelect
                                label="Work location"
                                name="workPlace"
                                value={formData.workPlace}
                                onChange={handleInputChange}
                                options={workLocationOptions}
                                placeholder="Select work location"
                                disabled={fieldsDisabled}
                                showSearch
                            />
                        )}
                        {!viewMode && isOtherSelection(formData.workPlace) && (
                            <MyInput
                                label="Other work location"
                                name="otherWorkPlace"
                                value={formData.otherWorkPlace}
                                onChange={handleInputChange}
                                placeholder="Enter other work location"
                                disabled={fieldsDisabled}
                            />
                        )}
                        {viewMode ? (
                            <MyInput label="Grade" name="grade" value={formData.grade} disabled />
                        ) : (
                            <CustomSelect
                                label="Grade"
                                name="grade"
                                value={formData.grade}
                                onChange={handleInputChange}
                                options={gradeOptions}
                                placeholder="Select grade"
                                disabled={fieldsDisabled}
                                showSearch
                            />
                        )}
                        {!viewMode && isOtherSelection(formData.grade) && (
                            <MyInput
                                label="Other grade"
                                name="otherGrade"
                                value={formData.otherGrade}
                                onChange={handleInputChange}
                                placeholder="Enter other grade"
                                disabled={fieldsDisabled}
                            />
                        )}
                        {!viewMode && (
                            <MyInput
                                label="NMBI No."
                                name="nmbiNumber"
                                value={formData.nmbiNumber}
                                onChange={handleInputChange}
                                placeholder="Enter NMBI registration number"
                                disabled={fieldsDisabled || nmbiLocked}
                            />
                        )}
                        {!viewMode && nmbiLocked && (
                            <Text type="secondary" style={{ display: 'block', marginTop: -12, marginBottom: 12 }}>
                                Already on file for this profile.
                            </Text>
                        )}

                        {!viewMode && isLoaded && (
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
                                    disabled={fieldsDisabled}
                                />
                            </StandaloneSearchBox>
                        )}

                        <MyInput
                            label="Address Line 1 (Building or House)"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            disabled={fieldsDisabled}
                        />
                        <MyInput
                            label="Address Line 2 (Street or Road)"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            disabled={fieldsDisabled}
                        />
                        <MyInput
                            label="Address Line 3 (Town/City)"
                            name="townCity"
                            value={formData.townCity}
                            onChange={handleInputChange}
                            disabled={fieldsDisabled}
                        />
                        <MyInput
                            label="Address Line 4 (County/State)"
                            name="countyState"
                            value={formData.countyState}
                            onChange={handleInputChange}
                            disabled={fieldsDisabled}
                        />
                        <Row gutter={16}>
                            <Col span={12}>
                                <MyInput
                                    label="Eircode/Postcode"
                                    name="eircode"
                                    value={formData.eircode}
                                    onChange={handleInputChange}
                                    disabled={fieldsDisabled}
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
                                    disabled={fieldsDisabled}
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
                            disabled={viewMode || !!eventId}
                            showSearch
                            isIDs
                            required={!viewMode}
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
                                    <div className="summary-table-value">
                                        {viewMode
                                            ? (registration?.isMemberAtRegistration ? 'Member' : 'Non-member')
                                            : membershipStatusLabel}
                                    </div>
                                </div>

                                {!viewMode && tierRows.map((row) => (
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

                                {!viewMode && Number.isFinite(remainingCapacity) && (
                                    <div className="summary-table-row">
                                        <div className="summary-table-label">Seats remaining</div>
                                        <div className="summary-table-value">{Math.max(remainingCapacity - totalTicketCount, 0)}</div>
                                    </div>
                                )}
                                {viewMode && (
                                    <>
                                        <div className="summary-table-row">
                                            <div className="summary-table-label">Quantity</div>
                                            <div className="summary-table-value">{registration?.quantity ?? '-'}</div>
                                        </div>
                                        <div className="summary-table-row">
                                            <div className="summary-table-label">Price category</div>
                                            <div className="summary-table-value">{registration?.priceCategory || '-'}</div>
                                        </div>
                                        <div className="summary-table-row">
                                            <div className="summary-table-label">Registered On</div>
                                            <div className="summary-table-value">
                                                {registration?.createdAt ? new Date(registration.createdAt).toLocaleString() : '-'}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!viewMode && (
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
                            )}
                            {viewMode && (
                                <div className="total-fee-row">
                                    <div className="total-label">
                                        Registration Fee
                                        <p style={{ textTransform: 'capitalize' }}>
                                            {viewPaymentMethod || '-'} · {paymentStatus || '-'}
                                            {stripePaymentNotAuthorized && (
                                                <Tag color="red" style={{ marginLeft: 8, textTransform: 'none' }}>
                                                    Payment method not attached
                                                </Tag>
                                            )}
                                        </p>
                                    </div>
                                    <div className="total-amount">
                                        {registration?.amount != null
                                            ? `${(registration.amount / 100).toFixed(2)} ${(registration.currency || 'eur').toUpperCase()}`
                                            : '-'}
                                    </div>
                                </div>
                            )}
                            {canPayByCard && !switchToCard && (
                                <div style={{ marginTop: 8 }}>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setRetryCardComplete({ number: false, expiry: false, cvc: false });
                                            setSwitchToCard(true);
                                        }}
                                    >
                                        Pay by Card instead
                                    </Button>
                                </div>
                            )}
                        </div>

                        {showCardCaptureSection && (
                            <div className="payment-details-section">
                                <div className="drawer-subsection-title">
                                    {stripePaymentNotAuthorized ? 'Retry payment' : 'Pay by Card'}
                                </div>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                    {stripePaymentNotAuthorized
                                        ? 'The card was never successfully charged for this registration (declined, or the session was closed before it confirmed) - Approve will fail until a payment method is attached. Enter a card below and retry.'
                                        : `This registration was recorded as ${registration?.paymentMethod || 'a non-card'} payment - enter a card below to charge it instead. The recorded ${registration?.paymentMethod || 'non-card'} payment will be voided.`}
                                </Text>
                                {canPayByCard && switchToCard && (
                                    <Button
                                        size="small"
                                        style={{ marginBottom: 16 }}
                                        onClick={() => {
                                            setRetryCardComplete({ number: false, expiry: false, cvc: false });
                                            setSwitchToCard(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <div className="my-input-wrapper">
                                    <label className="my-input-label">
                                        Card number<span className="required-star"> *</span>
                                    </label>
                                    <div className="stripe-element-input">
                                        <CreditCardOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />
                                        <CardNumberElement
                                            options={STRIPE_ELEMENT_OPTIONS}
                                            onChange={(e) => setRetryCardComplete((prev) => ({ ...prev, number: e.complete }))}
                                        />
                                    </div>
                                </div>
                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <div className="my-input-wrapper">
                                            <label className="my-input-label">
                                                Expiry date<span className="required-star"> *</span>
                                            </label>
                                            <div className="stripe-element-input">
                                                <CardExpiryElement
                                                    options={STRIPE_ELEMENT_OPTIONS}
                                                    onChange={(e) => setRetryCardComplete((prev) => ({ ...prev, expiry: e.complete }))}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div className="my-input-wrapper">
                                            <label className="my-input-label">
                                                CVC<span className="required-star"> *</span>
                                            </label>
                                            <div className="stripe-element-input">
                                                <CardCvcElement
                                                    options={STRIPE_ELEMENT_OPTIONS}
                                                    onChange={(e) => setRetryCardComplete((prev) => ({ ...prev, cvc: e.complete }))}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Button
                                    className="butn primary-btn"
                                    loading={retryingPayment}
                                    disabled={!retryCardComplete.number || !retryCardComplete.expiry || !retryCardComplete.cvc}
                                    onClick={handleRetryPayment}
                                >
                                    {stripePaymentNotAuthorized ? 'Retry Payment' : 'Capture Card Payment'}
                                </Button>
                            </div>
                        )}

                        {!viewMode && (
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
                                        <label className="my-input-label">
                                            Card number<span className="required-star"> *</span>
                                        </label>
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
                                                <label className="my-input-label">
                                                    Expiry date<span className="required-star"> *</span>
                                                </label>
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
                                                <label className="my-input-label">
                                                    CVC<span className="required-star"> *</span>
                                                </label>
                                                <div className="stripe-element-input">
                                                    <CardCvcElement
                                                        options={STRIPE_ELEMENT_OPTIONS}
                                                        onChange={(e) => setCardComplete((prev) => ({ ...prev, cvc: e.complete }))}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    {!(cardComplete.number && cardComplete.expiry && cardComplete.cvc) && (
                                        <Text type="secondary" style={{ display: 'block', marginTop: -8, marginBottom: 16 }}>
                                            All card fields are required before this attendee can be added.
                                        </Text>
                                    )}
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
                        )}

                    </Col>
                </Row>
            </div>
        </Drawer>

        <AttendeeDuplicateCompareDrawer
            open={!!compareCandidate}
            onClose={() => setCompareCandidate(null)}
            candidateProfileId={compareCandidate?.profileId}
            candidateSummary={compareCandidate}
            formData={formData}
            onUseSelected={handleUseCompareSelected}
            onRegisterAsNew={handleConfirmCreateNew}
        />

        {selectedProfileId && (
            <ProfileDuplicateReview
                profileId={selectedProfileId}
                open={duplicateReviewOpen}
                onClose={() => setDuplicateReviewOpen(false)}
                runDetectionOnOpen
                onMerged={handleDuplicateReviewMerged}
            />
        )}
        </>
    );
};

const CreateAttendeeDrawer = (props) => (
    <Elements stripe={stripePromise}>
        <CreateAttendeeDrawerInner {...props} />
    </Elements>
);

export default CreateAttendeeDrawer;
