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

import Breadcrumb from '../../component/common/Breadcrumb';
import { Activity, CheckCircle, Shuffle, XCircle, Clock } from "lucide-react";
import CreateAttendeeDrawer from '../../component/event/CreateAttendeeDrawer';

const { Title, Text } = Typography;

const EventDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventId = location.state?.eventId || 'EVT-001';
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isAttendeeDrawerVisible, setIsAttendeeDrawerVisible] = useState(false);


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
                className="event-details-content"
                style={{}}
            >
                <div className="event-details-container" style={{ padding: '0 34px' }}>
                    <Row gutter={[24]} align="stretch">
                        <Col xs={24} lg={16}>
                            {/* BASIC INFORMATION SECTION */}
                            <div className="form-section" style={{ height: '100%', marginBottom: 0, padding: '24px' }}>
                                <Row gutter={[24, 0]}>
                                    {/* Row 1: Event Name */}
                                    <Col span={24}>
                                        <MyInput
                                            label="Event Name"
                                            value={eventData.eventName}
                                            disabled
                                        />
                                    </Col>

                                    {/* Row 2: Date & Seat Limit */}
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

                                    {/* Row 3: Venue & Address */}
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

                                    {/* Row 4: Description */}
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
                        </Col>

                        <Col xs={24} lg={8}>
                            {/* CPD & ACCREDITATIONS SECTION */}
                            <div className="form-section" style={{ height: '100%', marginBottom: 0, padding: '24px' }}>
                                <Row gutter={[0, 0]}>
                                    {/* Row 1: Aligned with Event Name */}
                                    <Col span={24}>
                                        <MyInput
                                            label="CPD Credits"
                                            value={eventData.cpdCredits}
                                            suffix="HRS"
                                            disabled
                                        />
                                    </Col>

                                    {/* Row 2: Aligned with Date & Seat Limit */}
                                    <Col span={24}>
                                        <MyInput
                                            label="Accreditation Body"
                                            value={eventData.accreditationBody}
                                            disabled
                                        />
                                    </Col>

                                    {/* Row 3: Aligned with Venue & Address */}
                                    <Col span={24}>
                                        <CustomSelect
                                            label="Certification Type"
                                            value={eventData.certificationType}
                                            options={[{ label: 'Digital Certificate', value: 'Digital Certificate' }]}
                                            disabled
                                        />
                                    </Col>

                                    {/* Row 4: Aligned with Description (matching height/alignment) */}
                                    <Col span={24}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Auto-Issue on Finish</Text>
                                            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Tag color={eventData.autoIssueOnFinish ? "green" : "red"} style={{ borderRadius: '4px', padding: '4px 12px', fontSize: '13px', fontWeight: 600 }}>
                                                        {eventData.autoIssueOnFinish ? "ENABLED" : "DISABLED"}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
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
                            {[
                                { label: 'All', value: 'All', count: attendees.length },
                                { label: 'Registered', value: 'Registered', count: attendees.filter(a => a.status === 'Registered').length },
                                { label: 'Cancelled', value: 'Cancelled', count: attendees.filter(a => a.status === 'Cancelled').length },
                                { label: 'Refund', value: 'Refund', count: attendees.filter(a => a.status === 'Refund').length }
                            ].map(item => (
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
                                    {item.label} <span style={{ opacity: 0.6, marginLeft: '4px' }}>({item.count})</span>
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
                            pagination={{ pageSize: 10 }}
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
                />
            </div>
        </div>
    );
};

export default EventDetails;
