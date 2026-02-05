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

const { Title, Text } = Typography;

const EventDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventId = location.state?.eventId || 'EVT-001';

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
            title: (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#0000FF', fontSize: '11px', marginBottom: '4px' }}>CPD INFO</div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '10px', color: '#8c8c8c' }}>
                        <span>ELIGIBLE</span>
                        <span>STATUS</span>
                    </div>
                </div>
            ),
            key: 'cpdInfo',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    {record.cpdEligible ? <CheckCircleFilled className="cpd-eligible-icon" /> : <span>-</span>}
                    <span className={`cpd-status ${record.cpdStatus.toLowerCase()}`}>
                        {record.cpdStatus !== 'N/A' && <span style={{ fontSize: '16px', marginRight: '4px' }}>•</span>}
                        {record.cpdStatus}
                    </span>
                </div>
            )
        },
        {
            title: (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '4px' }}>ATTENDANCE</div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '10px', width: '160px', margin: '0 auto' }}>
                        <span>D1</span>
                        <span>D2</span>
                        <span>D3</span>
                        <span>D4</span>
                    </div>
                </div>
            ),
            key: 'attendance',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '160px', margin: '0 auto' }}>
                    {['D1', 'D2', 'D3', 'D4'].map(day => (
                        <Checkbox
                            key={day}
                            checked={record.attendance[day]}
                            disabled={record.status !== 'Registered'}
                            onChange={() => handleAttendanceChange(record.key, day)}
                        />
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
            <div className="event-details-header">
                <div className="back-link" onClick={() => navigate('/EventsSummary')}>
                    <LeftOutlined /> Back to Events
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ backgroundColor: '#215E97', borderColor: '#215E97' }}
                >
                    Add Member to Event
                </Button>
            </div>

            <div className="event-details-container">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        {/* COMBINED INFORMATION SECTION */}
                        <div className="form-section compact">
                            <Row gutter={[24, 0]}>
                                <Col span={24}>
                                    <MyInput
                                        label="Event Name"
                                        value={eventData.eventName}
                                        readOnly
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
                                        readOnly
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <MyInput
                                        label="Address"
                                        value={eventData.address}
                                        readOnly
                                    />
                                </Col>
                                <Col span={24}>
                                    <MyInput
                                        label="Description"
                                        value={eventData.description}
                                        type="textarea"
                                        rows={2}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* VENUE MAP */}
                        {/* <div className="form-section">
                            <h3 className="section-title">VENUE LOCATION</h3>
                            <div className="map-container" style={{ height: '150px', marginTop: '16px' }}>
                                <div className="map-placeholder">
                                    <div className="map-pin" style={{ fontSize: '32px' }}>📍</div>
                                </div>
                            </div>
                        </div> */}
                    </Col>

                    <Col xs={24} lg={8}>
                        {/* CPD & ACCREDITATIONS - Refined */}
                        <div className="form-section compact">
                            <h3 className="section-title">CPD & ACCREDITATIONS</h3>
                            <Row gutter={[16, 0]}>
                                <Col span={24}>
                                    <MyInput
                                        label="CPD Credits"
                                        value={eventData.cpdCredits}
                                        suffix="HRS"
                                        readOnly
                                    />
                                </Col>
                                <Col span={24}>
                                    <MyInput
                                        label="Accreditation Body"
                                        value={eventData.accreditationBody}
                                        readOnly
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

                        {/* QUICK STATS */}
                        <Card className="event-sidebar-card">
                            <h5 className="sidebar-card-title">Registration Summary</h5>
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#52c41a' }}>156</div>
                                    <Text type="secondary" style={{ fontSize: '10px' }}>REGISTERED</Text>
                                </Col>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#ff4d4f' }}>12</div>
                                    <Text type="secondary" style={{ fontSize: '10px' }}>CANCELLED</Text>
                                </Col>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#faad14' }}>4</div>
                                    <Text type="secondary" style={{ fontSize: '10px' }}>REFUNDED</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* ATTENDEE LISTING */}
                <div className="attendee-section">
                    <div className="attendee-filters">
                        <Title level={4} style={{ margin: 0 }}>Event Attendees</Title>
                        <div className="filter-group">
                            <Input
                                placeholder="Search by name or membership no..."
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                className="search-input"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                            <div style={{ display: 'flex', backgroundColor: '#f5f5f5', padding: '4px', borderRadius: '6px' }}>
                                {['All', 'Registered', 'Cancelled', 'Refund'].map(status => (
                                    <div
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        style={{
                                            padding: '4px 16px',
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: statusFilter === status ? '600' : '400',
                                            backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                                            boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            color: statusFilter === status ? '#215E97' : '#595959',
                                            transition: '0.3s'
                                        }}
                                    >
                                        {status}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <MyTable
                        dataSource={filteredAttendees}
                        columns={columns}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
