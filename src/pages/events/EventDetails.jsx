import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Row,
    Col,
    Card,
    Input,
    Tag,
    Checkbox,
    Avatar,
    Typography,
    Space
} from 'antd';
import {
    LeftOutlined,
    SearchOutlined,
    PlusOutlined,
    CheckCircleFilled,
    EnvironmentOutlined
} from '@ant-design/icons';
import MyTable from '../../component/common/MyTable';
import MyInput from '../../component/common/MyInput';
import MyDatePicker1 from '../../component/common/MyDatePicker1';
import CustomSelect from '../../component/common/CustomSelect';
import "../../styles/EventDetails.css";
import "../../styles/CreateEventDrawer.css";
import dayjs from 'dayjs';

import { Activity, CheckCircle, Shuffle, XCircle, Clock } from "lucide-react";

const { Title, Text } = Typography;

const EventDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventId = location.state?.eventId || 'EVT-001';
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);


    // Event data state
    const [eventData, setEventData] = useState({
        eventName: 'Annual Conference 2024',
        eventDate: dayjs('04/12/2024', 'DD/MM/YYYY'),
        seatLimit: '1000000',
        description: 'A multi-day event focused on emerging technologies and accelerative development strategies for 2024 and beyond.',
        venueName: 'Convention Center East',
        address: '123 Innovation Drive, SF',
        cpdCredits: '5.0',
        accreditationBody: 'NMBI',
        certificationType: 'Digital Certificate',
        autoIssueOnFinish: true
    });

    // Summary cards configuration matching Reconciliation.js style
    const summaryCards = [
        {
            title: "Registered",
            value: 156,
            icon: <CheckCircle size={20} color="#22c55e" />,
            color: "#22c55e",
            bg: "#dcfce7",
        },
        {
            title: "Cancelled",
            value: 12,
            icon: <XCircle size={20} color="#ef4444" />,
            color: "#ef4444",
            bg: "#fee2e2",
        },
        {
            title: "Refunds",
            value: 4,
            amount: "€400",
            icon: <Shuffle size={20} color="#0891b2" />,
            color: "#0891b2",
            bg: "#cffafe",
        },
        {
            title: "Pending Refunds",
            value: 28,
            amount: "€2,800",
            icon: <Clock size={20} color="#eab308" />,
            color: "#eab308",
            bg: "#fef9c3",
        },
    ];

    // Sample dynamic attendee data based on the screenshot
    const [attendees, setAttendees] = useState([
        {
            key: '1',
            name: 'Alex Rivera',
            avatar: '', // Random avatar or placeholder
            membershipNo: '#88291',
            category: 'VIP',
            status: 'Registered',
            cpdEligible: true,
            cpdStatus: 'Earned',
            attendance: { D1: true, D2: true, D3: true, D4: true }
        },
        {
            key: '2',
            name: 'Sarah Jenkins',
            avatar: '',
            membershipNo: '#44210',
            category: 'SPEAKER',
            status: 'Registered',
            cpdEligible: true,
            cpdStatus: 'Pending',
            attendance: { D1: true, D2: true, D3: false, D4: false }
        },
        {
            key: '3',
            name: 'Michael Chen',
            avatar: '',
            membershipNo: '#12345',
            category: 'MEMBER',
            status: 'Cancelled',
            cpdEligible: false,
            cpdStatus: 'N/A',
            attendance: { D1: false, D2: false, D3: false, D4: false }
        }
    ]);

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const handleAttendanceChange = (key, day) => {
        setAttendees(prev => prev.map(item => {
            if (item.key === key && item.status === 'Registered') {
                return {
                    ...item,
                    attendance: {
                        ...item.attendance,
                        [day]: !item.attendance[day]
                    }
                };
            }
            return item;
        }));
    };

    const handleSelectionChange = (keys) => {
        setSelectedRowKeys(keys);
    };

    const handleCancelAttendance = () => {
        console.log('Cancelling attendance for:', selectedRowKeys);
        // Add actual logic here (API call etc)
    };

    const handleProcessRefund = () => {
        console.log('Processing refund for:', selectedRowKeys);
        // Add actual logic here (API call etc)
    };

    const columns = [
        {
            title: 'ATTENDEE INFO',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="attendee-info-cell">
                    <Avatar size={40} src={record.avatar} icon={!record.avatar && <span style={{ fontSize: '10px' }}>AV</span>} />
                    <span className="attendee-name">{text}</span>
                </div>
            )
        },
        {
            title: 'MEMBERSHIP NO',
            dataIndex: 'membershipNo',
            key: 'membershipNo',
        },
        {
            title: 'CATEGORY',
            dataIndex: 'category',
            key: 'category',
            render: (category) => {
                const colors = {
                    'VIP': { color: '#722ed1', bg: '#f9f0ff', border: '#d3adf7' },
                    'SPEAKER': { color: '#08979c', bg: '#e6fffb', border: '#87e8de' },
                    'MEMBER': { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' }
                };
                const style = colors[category] || colors['MEMBER'];
                return (
                    <Tag style={{
                        color: style.color,
                        backgroundColor: style.bg,
                        border: `1px solid ${style.border}`,
                        borderRadius: '12px',
                        padding: '0 10px'
                    }}>
                        {category}
                    </Tag>
                );
            }
        },
        {
            title: 'ELIGIBLE',
            key: 'cpdEligible',
            align: 'center',
            render: (_, record) => (
                record.cpdEligible ? <CheckCircleFilled className="cpd-eligible-icon" /> : <span>-</span>
            )
        },
        {
            title: 'CPD STATUS',
            key: 'cpdStatus',
            align: 'center',
            render: (_, record) => (
                <span className={`cpd-status ${record.cpdStatus.toLowerCase()}`}>
                    {record.cpdStatus !== 'N/A' && <span style={{ fontSize: '16px', marginRight: '4px' }}>•</span>}
                    {record.cpdStatus}
                </span>
            )
        },
        {
            title: 'ATTENDANCE',
            key: 'attendance',
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '160px', margin: '0 auto' }}>
                    {['D1', 'D2', 'D3', 'D4'].map(day => (
                        <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#8c8c8c', marginBottom: '4px' }}>{day}</span>
                            <Checkbox
                                checked={record.attendance[day]}
                                disabled={record.status !== 'Registered'}
                                onChange={() => handleAttendanceChange(record.key, day)}
                            />
                        </div>
                    ))}
                </div>
            )
        }
    ];

    const filteredAttendees = attendees.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchText.toLowerCase()) ||
            a.membershipNo.includes(searchText);
        const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="event-details-page hide-scroll-webkit">
            <div
                className="event-details-header"
                style={{
                    paddingTop: '10px',
                    paddingLeft: '34px',
                    paddingRight: '34px',
                    marginBottom: '8px'
                }}
            >
                <div>
                    <div
                        // className="event-details-header"
                        // style={{
                        //     display: 'flex',
                        //     alignItems: 'center',
                        //     width: '100%'
                        // }}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ backgroundColor: '#215E97', borderColor: '#215E97' }}
                        >
                            Left Action
                        </Button>

                    </div>



                    {/* <div className="back-link mb-2" onClick={() => navigate('/EventsSummary')}>
                        <LeftOutlined /> Back to Events Summary
                    </div> */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* <div>
                            <Title level={2} style={{ margin: 0, color: '#1a3353', fontWeight: 700 }}>
                                Event Details
                            </Title>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Manage event settings, attendance, and refunds for <Text strong>{eventId}</Text>
                            </Text>
                        </div> */}
                        {/* <div className="event-actions">
                            <Space>
                                <Button icon={<PlusOutlined />}>Edit Event</Button>
                                <Button type="primary">Publish Changes</Button>
                            </Space>
                        </div> */}
                    </div>
                </div>
            </div>

            <div
                className="event-details-content"
                style={{}}
            >
                <div className="event-details-container" style={{ padding: '0 34px' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            {/* COMBINED INFORMATION SECTION */}
                            <div className="form-section">
                                <Row gutter={[24, 0]}>
                                    <Col span={24}>
                                        <MyInput
                                            label="Event Name"
                                            value={eventData.eventName}
                                            disabled
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <MyDatePicker1
                                            label="Event Date"
                                            value={eventData.eventDate}
                                            format="DD/MM/YYYY"
                                            disabled
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <CustomSelect
                                            label="Seat Limit"
                                            value={eventData.seatLimit}
                                            options={[{ label: '1000000', value: '1000000' }]}
                                            disabled
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <MyInput
                                            label="Venue Name"
                                            value={eventData.venueName}
                                            disabled
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <MyInput
                                            label="Address"
                                            value={eventData.address}
                                            disabled
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <MyInput
                                            label="Description"
                                            value={eventData.description}
                                            type="textarea"
                                            rows={2}
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </div>

                            {/* RECONCILIATION SUMMARY SECTION */}
                            <div className="form-section compact" style={{ border: 'none', background: 'transparent', padding: '0 !important', boxShadow: 'none' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 12,
                                        overflowX: "auto",
                                        msOverflowStyle: "none",
                                    }}
                                    className="hide-scrollbar"
                                >
                                    {summaryCards.map((card) => (
                                        <div key={card.title} style={{ flex: '0 0 auto', width: '210px' }}>
                                            <Card
                                                style={{
                                                    borderRadius: 3,
                                                    backgroundColor: card.bg,
                                                    border: "1px solid #e5e7eb",
                                                    boxShadow: "none",
                                                    transition: "all 0.3s ease",
                                                }}
                                                bodyStyle={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "16px 18px",
                                                }}
                                            >
                                                <div>
                                                    <div style={{ color: "#475569", fontSize: 13, fontWeight: 500 }}>
                                                        {card.title.toUpperCase()}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                        <div
                                                            style={{
                                                                fontSize: 24,
                                                                fontWeight: 700,
                                                                color: card.color,
                                                                marginTop: 4,
                                                            }}
                                                        >
                                                            {card.value}
                                                        </div>
                                                        {card.amount && (
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                                                                ({card.amount})
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        backgroundColor: "#fff",
                                                        borderRadius: "50%",
                                                        padding: 8,
                                                        border: `1px solid ${card.color}30`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {card.icon}
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            {/* CPD & ACCREDITATIONS - Refined */}
                            <div className="form-section compact">
                                <Row gutter={[16, 0]}>
                                    <Col span={24}>
                                        <MyInput
                                            label="CPD Credits"
                                            value={eventData.cpdCredits}
                                            suffix="HRS"
                                            disabled
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <MyInput
                                            label="Accreditation Body"
                                            value={eventData.accreditationBody}
                                            disabled
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <CustomSelect
                                            label="Certification Type"
                                            value={eventData.certificationType}
                                            options={[{ label: 'Digital Certificate', value: 'Digital Certificate' }]}
                                            disabled
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Auto-Issue on Finish</Text>
                                            <Tag color={eventData.autoIssueOnFinish ? "green" : "red"}>
                                                {eventData.autoIssueOnFinish ? "ENABLED" : "DISABLED"}
                                            </Tag>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* ATTENDEE LISTING */}
                <div className="attendee-section">
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
                            {['All', 'Registered', 'Cancelled', 'Refund'].map(status => (
                                <div
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    style={{
                                        padding: '6px 16px',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: statusFilter === status ? '600' : '500',
                                        backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                                        boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        color: statusFilter === status ? '#2563eb' : '#4b5563',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {status}
                                </div>
                            ))}
                        </div>

                        <div className="action-buttons-group ms-auto">
                            <Button
                                className="butn primary-btn"
                                onClick={handleCancelAttendance}
                            >
                                Cancel Attendee
                            </Button>
                            <Button
                                className="butn primary-btn"
                                onClick={handleProcessRefund}
                            >
                                Process Refund
                            </Button>
                        </div>
                    </div>

                    <MyTable
                        dataSource={filteredAttendees}
                        columns={columns}
                        pagination={{ pageSize: 10 }}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: handleSelectionChange
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
