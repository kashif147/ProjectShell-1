import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Button,
    Row,
    Col,
    Input,
    Tag,
    Avatar,
    Typography,
    Descriptions,
    Popover,
    message
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    CopyOutlined,
    WarningOutlined
} from '@ant-design/icons';
import { FaAngleLeft } from 'react-icons/fa6';
import { FaAngleRight } from 'react-icons/fa';
import MyTable from '../../component/common/MyTable';
import "../../styles/EventDetails.css";
import "../../styles/CreateEventDrawer.css";
import dayjs from 'dayjs';

import CreateAttendeeDrawer from '../../component/event/CreateAttendeeDrawer';
import CreateEventDrawer from '../../component/event/CreateEventDrawer';
import { fetchEventById, fetchEvents, fetchRegistrations, cancelRegistration } from '../../services/eventsApi';
import { computeEventFormat, resolveFallbackImageFormat } from '../../utils/eventFormat';
import { resolveEventCategoryLabel } from '../../utils/eventCategory';
import { buildDetailsSearch, buildEventDetailsSearch } from '../../utils/detailsRoute';
import { buildEventFallbackImageDataUri } from '../../utils/eventFallbackImageDataUri';

const { Text, Title } = Typography;

const REGISTRATION_STATUS_TABS = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Attended', value: 'attended' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'No-show', value: 'no-show' },
];

const STATUS_TAG_STYLE = {
    pending: { color: '#d48806', bg: '#fffbe6', border: '#ffe58f' },
    confirmed: { color: 'var(--app-brand-accent)', bg: 'var(--app-brand-bg)', border: '#91d5ff' },
    attended: { color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
    cancelled: { color: '#cf1322', bg: '#fff1f0', border: '#ffa39e' },
    'no-show': { color: '#8c8c8c', bg: '#fafafa', border: '#d9d9d9' },
};

// Matches Registration.paymentStatus in events-service: pending, authorized,
// succeeded, failed, waived, manual - same color grouping as the Attendees grid.
const PAYMENT_STATUS_TAG_STYLE = {
    pending: { color: '#d48806', bg: '#fffbe6', border: '#ffe58f' },
    authorized: { color: 'var(--app-brand-accent)', bg: 'var(--app-brand-bg)', border: '#91d5ff' },
    succeeded: { color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
    waived: { color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
    manual: { color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
    failed: { color: '#cf1322', bg: '#fff1f0', border: '#ffa39e' },
};

// Mirrors the Status color scheme used on the Event Configuration drawer.
const EVENT_STATUS_TAG_STYLE = {
    draft: { color: '#ad6800', bg: '#fffbe6', border: '#ffe58f' },
    published: { color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
    completed: { color: 'var(--app-brand-accent)', bg: 'var(--app-brand-bg)', border: '#91d5ff' },
    cancelled: { color: '#cf1322', bg: '#fff1f0', border: '#ffa39e' },
};

function formatDateTime(value) {
    return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : null;
}

function buildAttendeeAddress(snapshot) {
    if (!snapshot) return '-';
    return [
        snapshot.addressLine1,
        snapshot.addressLine2,
        snapshot.townCity,
        snapshot.countyState,
        snapshot.eircode,
        snapshot.country,
    ]
        .map((part) => (part != null ? String(part).trim() : ''))
        .filter(Boolean)
        .join(', ') || '-';
}

function mapRegistrationToAttendeeRow(reg) {
    const snapshot = reg.attendeeSnapshot || {};
    return {
        key: reg._id,
        registrationId: reg._id,
        name: `${snapshot.firstName || ''} ${snapshot.lastName || ''}`.trim() || snapshot.email || '-',
        membershipNo: reg.membershipNumber || '-',
        email: snapshot.email || '-',
        mobileNumber: snapshot.phone || '-',
        fullAddress: buildAttendeeAddress(snapshot),
        nmbiNo: snapshot.nmbiNumber || '-',
        workLocation: snapshot.workLocation || '-',
        grade: snapshot.grade || '-',
        status: reg.status || 'pending',
        approvalStatus: reg.approvalStatus || 'pending_review',
        duplicateReviewStatus: reg.duplicateReview?.status || null,
        paymentStatus: reg.paymentStatus || '-',
        amount: reg.amount,
        currency: reg.currency,
        registeredAt: reg.createdAt,
        profileId: reg.profileId,
        __registration: reg,
    };
}

const EventDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventId = new URLSearchParams(location.search).get('eventId');
    const { eventTypeOptions, eventCategoryOptions, venueOptions } = useSelector((state) => state.lookups);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isAttendeeDrawerVisible, setIsAttendeeDrawerVisible] = useState(false);
    const [isEditEventDrawerVisible, setIsEditEventDrawerVisible] = useState(false);
    const [isCloneEventDrawerVisible, setIsCloneEventDrawerVisible] = useState(false);

    const [event, setEvent] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(false);

    // Description is capped at a fixed height with internal scroll so a long
    // description can't push the always-visible Attendees section further down
    // the page - "See more" lifts the cap when the content actually overflows it.
    const descriptionContentRef = useRef(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [descriptionOverflows, setDescriptionOverflows] = useState(false);

    useEffect(() => {
        setIsDescriptionExpanded(false);
    }, [eventId]);

    useEffect(() => {
        if (isDescriptionExpanded) return;
        const el = descriptionContentRef.current;
        if (!el) return;
        setDescriptionOverflows(el.scrollHeight > el.clientHeight + 1);
    }, [event?.description, isDescriptionExpanded]);

    const [attendees, setAttendees] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isRegistrationDrawerVisible, setIsRegistrationDrawerVisible] = useState(false);

    const loadEvent = useCallback(() => {
        if (!eventId) return;
        setLoadingEvent(true);
        fetchEventById(eventId)
            .then((data) => {
                setEvent(data || null);
                // Self-heal the breadcrumb's record label with the real title,
                // in case the referring page didn't already pass recordName.
                if (data?.title && location.state?.recordName !== data.title) {
                    navigate(
                        { pathname: location.pathname, search: location.search },
                        {
                            state: { ...location.state, recordName: data.title },
                            replace: true,
                        }
                    );
                }
            })
            .catch(() => setEvent(null))
            .finally(() => setLoadingEvent(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const loadAttendees = useCallback(() => {
        if (!eventId) return;
        setLoadingAttendees(true);
        fetchRegistrations({ eventId })
            .then((data) => {
                const rows = Array.isArray(data) ? data : [];
                setAttendees(rows.map(mapRegistrationToAttendeeRow));
            })
            .catch(() => setAttendees([]))
            .finally(() => setLoadingAttendees(false));
    }, [eventId]);

    useEffect(() => {
        loadEvent();
        loadAttendees();
    }, [loadEvent, loadAttendees]);

    // Fetched independently of the grid so prev/next works regardless of how the user
    // arrived here (direct link, refresh, or from the Events grid) - the app-wide shared
    // grid context is touched by unrelated screens and can't be relied on to still hold
    // the events list by the time this page renders.
    const [eventNavList, setEventNavList] = useState([]);
    useEffect(() => {
        let cancelled = false;
        fetchEvents()
            .then((data) => {
                if (!cancelled) setEventNavList(Array.isArray(data) ? data.filter((ev) => ev?._id) : []);
            })
            .catch(() => {
                if (!cancelled) setEventNavList([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);
    const navigationIndex = useMemo(
        () => eventNavList.findIndex((ev) => String(ev._id) === String(eventId)),
        [eventNavList, eventId]
    );
    const goToEventIndex = useCallback((index) => {
        const target = eventNavList[index];
        if (!target) return;
        navigate(
            { pathname: location.pathname, search: buildEventDetailsSearch(target._id) },
            {
                state: { recordName: target.title },
                replace: true,
            }
        );
    }, [eventNavList, location.pathname, navigate]);

    const handleSelectionChange = (keys) => {
        setSelectedRowKeys(keys);
    };

    const handleCancelAttendance = async () => {
        if (!selectedRowKeys.length) return;
        try {
            await Promise.all(selectedRowKeys.map((id) => cancelRegistration(id)));
            message.success('Selected registrations cancelled');
            setSelectedRowKeys([]);
            loadAttendees();
        } catch (err) {
            message.error(err?.response?.data?.error?.message || err?.message || 'Failed to cancel registrations');
        }
    };

    const columns = [
        {
            title: 'ATTENDEE INFO',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="attendee-info-cell">
                    <Avatar size={40} icon={<span style={{ fontSize: '10px' }}>AV</span>} />
                    {record.profileId ? (
                        <Link
                            className="attendee-name"
                            to={{ pathname: '/Details', search: buildDetailsSearch(record.profileId) }}
                            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            {text}
                        </Link>
                    ) : (
                        <span className="attendee-name">{text}</span>
                    )}
                </div>
            )
        },
        {
            title: 'REGISTRATION STATUS',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status, record) => {
                const style = STATUS_TAG_STYLE[status] || STATUS_TAG_STYLE.pending;
                const openDrawer = () => {
                    setSelectedRegistration(record.__registration || record);
                    setIsRegistrationDrawerVisible(true);
                };
                return (
                    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        <Tag
                            style={{
                                color: style.color,
                                backgroundColor: style.bg,
                                border: `1px solid ${style.border}`,
                                borderRadius: '12px',
                                padding: '0 10px',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                            }}
                            onClick={openDrawer}
                        >
                            {status}
                        </Tag>
                        {record.approvalStatus === 'pending_review' && (
                            record.duplicateReviewStatus === 'POTENTIAL_MATCH' ? (
                                <Tag
                                    icon={<WarningOutlined />}
                                    color="red"
                                    style={{ borderRadius: '12px', cursor: 'pointer' }}
                                    onClick={openDrawer}
                                >
                                    Possible Duplicate
                                </Tag>
                            ) : (
                                <Tag color="orange" style={{ borderRadius: '12px', cursor: 'pointer' }} onClick={openDrawer}>
                                    Needs Review
                                </Tag>
                            )
                        )}
                    </span>
                );
            }
        },
        {
            title: 'PAYMENT STATUS',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            align: 'center',
            render: (paymentStatus, record) => {
                const style = PAYMENT_STATUS_TAG_STYLE[paymentStatus] || PAYMENT_STATUS_TAG_STYLE.pending;
                return (
                    <Tag
                        style={{
                            color: style.color,
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            borderRadius: '12px',
                            padding: '0 10px',
                            textTransform: 'capitalize',
                        }}
                    >
                        {paymentStatus}
                        {record.amount != null
                            ? ` · ${(record.amount / 100).toFixed(2)} ${(record.currency || 'eur').toUpperCase()}`
                            : ''}
                    </Tag>
                );
            }
        },
        {
            title: 'REGISTERED',
            dataIndex: 'registeredAt',
            key: 'registeredAt',
            align: 'center',
            render: (registeredAt) => (registeredAt ? dayjs(registeredAt).format('DD/MM/YYYY') : '-')
        },
        {
            title: 'MEMBERSHIP NO',
            dataIndex: 'membershipNo',
            key: 'membershipNo',
        },
        {
            title: 'EMAIL',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'MOBILE NO',
            dataIndex: 'mobileNumber',
            key: 'mobileNumber',
        },
        {
            title: 'FULL ADDRESS',
            dataIndex: 'fullAddress',
            key: 'fullAddress',
            ellipsis: true,
        },
        {
            title: 'NMBI NO',
            dataIndex: 'nmbiNo',
            key: 'nmbiNo',
        },
        {
            title: 'WORK LOCATION',
            dataIndex: 'workLocation',
            key: 'workLocation',
        },
        {
            title: 'GRADE',
            dataIndex: 'grade',
            key: 'grade',
        },
    ];

    const filteredAttendees = attendees.filter(a => {
        const matchesSearch =
            a.name.toLowerCase().includes(searchText.toLowerCase()) ||
            String(a.membershipNo).toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const eventTypeLabel = (eventTypeOptions || []).find(
        (opt) => String(opt.value) === String(event?.eventTypeId),
    )?.label || '-';
    const eventCategoryLabel = resolveEventCategoryLabel(event, eventCategoryOptions);
    // Looked up live from the Venue lookup (rather than trusting the
    // point-in-time `event.venue` snapshot string) so the address always
    // reflects the venue's current record.
    const selectedVenue = (venueOptions || []).find(
        (v) => String(v.value) === String(event?.venueId),
    ) || null;
    const venueAddressDisplay = (() => {
        const addr = selectedVenue?.venueAddress;
        if (!addr) return '';
        return (
            addr.fullAddress ||
            [addr.buildingOrHouse, addr.streetOrRoad, addr.areaOrTown, addr.countyCityOrPostCode, addr.country, addr.eircode]
                .filter(Boolean)
                .join(', ')
        );
    })();
    const eventStatusKey = String(event?.status || 'draft').toLowerCase();
    const eventStatusStyle = EVENT_STATUS_TAG_STYLE[eventStatusKey] || EVENT_STATUS_TAG_STYLE.draft;
    const totalCosts = (event?.costs || []).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    // Older events saved before the image-upload feature shipped can have a
    // null imageUrl - build the same placeholder CreateEventDrawer generates
    // so the preview is never blank.
    const fallbackImageDataUri = useMemo(() => {
        if (!event) return null;
        const format = resolveFallbackImageFormat(computeEventFormat(event), eventTypeLabel);
        return buildEventFallbackImageDataUri({
            title: event.title,
            date: event.startDate,
            venue: selectedVenue?.label || event.venue,
            format,
            cpdHours: event.cpdCredits,
            accreditationBody: event.accreditationBody,
        });
    }, [event, eventTypeLabel, selectedVenue]);
    const displayImageUrl = event?.imageUrl || fallbackImageDataUri;

    return (
        <div className="event-details-page hide-scroll-webkit">
            <div
                className="event-details-content"
                style={{}}
            >
                <div className="event-details-container" style={{ padding: '0 34px' }}>
                    <div className="event-details-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                            {displayImageUrl && (
                                <Popover
                                    content={
                                        <img
                                            src={displayImageUrl}
                                            alt={event?.title || 'Event'}
                                            style={{ display: 'block', width: 320, maxWidth: '60vw', borderRadius: 6 }}
                                        />
                                    }
                                    placement="bottomLeft"
                                >
                                    <img
                                        src={displayImageUrl}
                                        alt={event?.title || 'Event'}
                                        className="event-details-thumbnail"
                                    />
                                </Popover>
                            )}
                            <Title level={4} style={{ margin: 0 }} ellipsis={{ tooltip: event?.title }}>
                                {event?.title || (loadingEvent ? 'Loading…' : 'Event')}
                            </Title>
                            <Tag style={{
                                color: eventStatusStyle.color,
                                backgroundColor: eventStatusStyle.bg,
                                border: `1px solid ${eventStatusStyle.border}`,
                                borderRadius: '12px',
                                padding: '0 10px',
                            }}>
                                {event?.status || 'Draft'}
                            </Tag>
                            <Tag color={event?.isActive !== false ? 'green' : 'default'}>
                                {event?.isActive !== false ? 'Active' : 'Inactive'}
                            </Tag>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Button
                                className="butn"
                                icon={<CopyOutlined />}
                                onClick={() => setIsCloneEventDrawerVisible(true)}
                            >
                                Clone Event
                            </Button>
                            <Button
                                className="butn primary-btn"
                                icon={<EditOutlined />}
                                onClick={() => setIsEditEventDrawerVisible(true)}
                            >
                                Edit Event
                            </Button>
                            <Button
                                disabled={!eventNavList.length || navigationIndex < 0 || navigationIndex <= 0}
                                onClick={() => goToEventIndex(navigationIndex - 1)}
                                className="me-1 gray-btn butn"
                            >
                                <FaAngleLeft className="deatil-header-icon" />
                            </Button>
                            <p style={{ fontWeight: 500, fontSize: 14, marginLeft: 4, marginBottom: 0 }}>
                                {eventNavList.length && navigationIndex >= 0
                                    ? `${navigationIndex + 1} of ${eventNavList.length}`
                                    : '—'}
                            </p>
                            <Button
                                disabled={!eventNavList.length || navigationIndex < 0 || navigationIndex >= eventNavList.length - 1}
                                onClick={() => goToEventIndex(navigationIndex + 1)}
                                className="me-1 gray-btn butn"
                                style={{ marginLeft: 8 }}
                            >
                                <FaAngleRight className="deatil-header-icon" />
                            </Button>
                        </div>
                    </div>
                    <Row gutter={[24]} align="stretch">
                        <Col xs={24} lg={16}>
                            {/* BASIC INFORMATION SECTION */}
                            <div className="form-section" style={{ height: '100%', marginBottom: 0, padding: '24px' }}>
                                <Descriptions
                                    bordered
                                    size="small"
                                    column={2}
                                    labelStyle={{ width: '30%', fontWeight: 500 }}
                                >
                                    <Descriptions.Item label="Category">{eventCategoryLabel}</Descriptions.Item>
                                    <Descriptions.Item label="Event Type">{eventTypeLabel}</Descriptions.Item>
                                    <Descriptions.Item label="Start Date">{formatDateTime(event?.startDate) || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="End Date">{formatDateTime(event?.endDate) || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Seat Limit">{event?.capacity != null ? event.capacity : '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Format">{computeEventFormat(event)}</Descriptions.Item>
                                    <Descriptions.Item label="Venue" span={2}>
                                        {computeEventFormat(event) === 'Online' ? 'Online' : (
                                            <div>
                                                <div>{selectedVenue?.label || event?.venue || '-'}</div>
                                                {venueAddressDisplay && (
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {venueAddressDisplay}
                                                    </Text>
                                                )}
                                            </div>
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Description: fixed height with internal scroll, expandable via See more */}
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Description</Text>
                                        {descriptionOverflows && (
                                            <Button
                                                type="link"
                                                size="small"
                                                style={{ padding: 0, height: 'auto' }}
                                                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                            >
                                                {isDescriptionExpanded ? 'See less' : 'See more'}
                                            </Button>
                                        )}
                                    </div>
                                    <div
                                        ref={descriptionContentRef}
                                        className={`event-description-display ${isDescriptionExpanded ? 'is-expanded' : 'is-collapsed'}`}
                                        dangerouslySetInnerHTML={{ __html: event?.description || '<p>-</p>' }}
                                    />
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            {/* PRICING, ACCREDITATION & RECORD INFO SECTION */}
                            <div className="form-section" style={{ height: '100%', marginBottom: 0, padding: '24px' }}>
                                <Descriptions
                                    bordered
                                    size="small"
                                    column={1}
                                    labelStyle={{ width: '45%', fontWeight: 500 }}
                                >
                                    <Descriptions.Item label="Member Price">{event?.memberPrice != null ? `€${event.memberPrice}` : '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Non-Member Price">{event?.nonMemberPrice != null ? `€${event.nonMemberPrice}` : '-'}</Descriptions.Item>
                                    <Descriptions.Item label="CPD Credits">{event?.cpdCredits != null ? `${event.cpdCredits} HRS` : '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Accreditation Body">{event?.accreditationBody || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Certification Type">{event?.certificationType || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Total Costs">{totalCosts ? `€${totalCosts.toLocaleString()}` : '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Refund Policy">
                                        {event?.refundPolicyDays != null
                                            ? (event.refundPolicyDays === 0
                                                ? 'No refunds'
                                                : `Up to ${event.refundPolicyDays} day${event.refundPolicyDays === 1 ? '' : 's'} before event`)
                                            : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Auto-Issue on Finish">
                                        <Tag color={event?.autoIssueOnFinish ? "green" : "red"} style={{ borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                            {event?.autoIssueOnFinish ? "ENABLED" : "DISABLED"}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                                <div className="event-record-meta">
                                    <div>Created by {event?.createdByEmail || '-'}{event?.createdAt ? ` on ${formatDateTime(event.createdAt)}` : ''}</div>
                                    <div>Updated by {event?.updatedByEmail || '-'}{event?.updatedAt ? ` on ${formatDateTime(event.updatedAt)}` : ''}</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* ATTENDEE LISTING */}
                <div className="attendee-section" style={{ padding: '20px 0' }}>
                    <div className="attendee-filters d-flex align-items-center flex-wrap mb-3" style={{ gap: '16px', padding: '0 34px' }}>
                        <div style={{ flex: '0 0 350px' }}>
                            <Input
                                className="my-input-field"
                                placeholder="Search attendees..."
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                style={{
                                    height: '40px',
                                    borderRadius: '6px',
                                    color: 'gray',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ced4da'
                                }}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            {REGISTRATION_STATUS_TABS.map(item => (
                                <div
                                    key={item.value}
                                    onClick={() => setStatusFilter(item.value)}
                                    style={{
                                        padding: '6px 16px',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: statusFilter === item.value ? '600' : '500',
                                        backgroundColor: statusFilter === item.value ? '#ffffff' : 'transparent',
                                        boxShadow: statusFilter === item.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        color: statusFilter === item.value ? '#2563eb' : '#4b5563',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {item.label}{' '}
                                    <span style={{ opacity: 0.6, marginLeft: '4px' }}>
                                        ({item.value === 'All' ? attendees.length : attendees.filter(a => a.status === item.value).length})
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="action-buttons-group ms-auto">
                            <Button
                                className="butn primary-btn"
                                onClick={handleCancelAttendance}
                                disabled={!selectedRowKeys.length}
                            >
                                Cancel Attendee
                            </Button>
                            <Button
                                className="butn primary-btn"
                                icon={<PlusOutlined />}
                                onClick={() => setIsAttendeeDrawerVisible(true)}
                            >
                                Add Attendee
                            </Button>
                        </div>
                    </div>

                    <div>
                        <MyTable
                            dataSource={filteredAttendees}
                            columns={columns}
                            loading={loadingAttendees}
                            pagination={{ pageSize: 500 }}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: handleSelectionChange
                            }}
                        />
                    </div>
                </div>

                <CreateAttendeeDrawer
                    open={isAttendeeDrawerVisible}
                    onClose={() => setIsAttendeeDrawerVisible(false)}
                    eventId={eventId}
                />

                <CreateAttendeeDrawer
                    open={isRegistrationDrawerVisible}
                    onClose={() => setIsRegistrationDrawerVisible(false)}
                    registration={selectedRegistration}
                    onApproved={loadAttendees}
                />

                <CreateEventDrawer
                    open={isEditEventDrawerVisible}
                    onClose={() => {
                        setIsEditEventDrawerVisible(false);
                        loadEvent();
                    }}
                    onDeleted={() => {
                        setIsEditEventDrawerVisible(false);
                        navigate('/EventsSummary');
                    }}
                    eventId={eventId}
                />

                <CreateEventDrawer
                    open={isCloneEventDrawerVisible}
                    onClose={() => setIsCloneEventDrawerVisible(false)}
                    cloneFromEventId={isCloneEventDrawerVisible ? eventId : undefined}
                />
            </div>
        </div>
    );
};

export default EventDetails;
