import React, { useState, useMemo } from "react";
import { Card, Row, Col, Input, Select, Button, Tag } from "antd";
import {
    UserOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    ExportOutlined,
    ReloadOutlined,
    MoreOutlined
} from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
import { useLocation, useNavigate } from "react-router-dom";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { Space } from "antd";

const { Search } = Input;
const { Option } = Select;

const CommunicationBatchDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Fallback to static values if no state is passed, but keep it simple
    const batchName = location.state?.batchName || "August Newsletter - Email";
    const batchId = location.state?.batchId || "#BTH-2023-08-15";

    // Static Columns Definition
    const tableColumns = useMemo(() => [
        {
            dataIndex: "memberName",
            title: "Mbbember",
            width: 250,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: record.avatarColor || '#1890ff',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}>
                        {record.initials || "MB"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#262626' }}>{record.memberName}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.memberId}</div>
                    </div>
                </div>
            )
        },
        {
            dataIndex: "channel",
            title: "Channel",
            width: 150,
            render: (channel) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{channel === 'Email' ? '📧' : channel === 'SMS' ? '📱' : '📄'}</span>
                    <span>{channel}</span>
                </div>
            )
        },
        {
            dataIndex: "recipientDetail",
            title: "Recipient Detail",
            width: 250,
        },
        {
            dataIndex: "timestamp",
            title: "Timestamp",
            width: 180,
        },
        {
            dataIndex: "status",
            title: "Status",
            width: 150,
            render: (status) => {
                let color = 'default';
                let icon = null;

                if (status === 'Delivered') { color = 'success'; icon = '✓'; }
                if (status === 'Read') { color = 'processing'; icon = '👁'; }
                if (status === 'Failed') { color = 'error'; icon = '!'; }

                return (
                    <Tag color={color} style={{ borderRadius: '12px', padding: '0 10px' }}>
                        {icon} {status}
                    </Tag>
                );
            }
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: () => (
                <Button type="text" icon={<MoreOutlined />} />
            )
        }
    ], []);

    // Static Stats Data
    const stats = {
        totalMembers: 12500,
        delivered: 11850,
        read: 9200,
        failed: 650,
        sentProgress: 100,
        deliveredRate: 94.8,
        openRate: 73.6,
        failureRate: 5.2
    };

    // Static Table Data
    const data = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        key: i,
        memberName: i % 2 === 0 ? "Alex Smith" : "Bonnie Johnson",
        memberId: i % 2 === 0 ? "#MEM-00124" : "#MEM-00982",
        initials: i % 2 === 0 ? "AS" : "BJ",
        avatarColor: i % 2 === 0 ? "#1890ff" : "#fa8c16",
        channel: "Email",
        recipientDetail: i % 2 === 0 ? "alex.smith@example.com" : "bonnie.j@invalid-domain",
        timestamp: "Aug 15, 11:02 AM",
        status: i % 3 === 0 ? "Failed" : i % 2 === 0 ? "Read" : "Delivered"
    })), []);

    const buttonStyle = {
        backgroundColor: "#215e97",
        color: "white",
        borderRadius: "3px",
        minWidth: "150px",
    };

    return (
        <div style={{ padding: "0" }}>
            <div style={{ padding: "24px 24px 0 24px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {batchName} <Tag color="blue">ACTIVE</Tag>
                        </h1>
                        <div style={{ color: '#8c8c8c', marginTop: '4px' }}>
                            Batch ID: {batchId} • Created on Aug 15, 2023 at 10:45 AM
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Space size="middle">
                            <Button style={buttonStyle}>Include</Button>
                            <CommonPopConfirm title="Do you want to exclude member?">
                                <Button style={buttonStyle}>Exclude Members</Button>
                            </CommonPopConfirm>
                        </Space>
                        <Button icon={<ExportOutlined />}>Export CSV</Button>
                        <Button type="primary" icon={<ReloadOutlined />}>Retry Failed</Button>
                    </div>
                </div>

                {/* Stats Row */}
                <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#8c8c8c', textTransform: 'uppercase' }}>Total Members</div>
                                <UserOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{stats.totalMembers.toLocaleString()}</div>
                            <div style={{ color: '#52c41a', fontSize: '13px', fontWeight: '500' }}>+{stats.sentProgress}% Sent</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#8c8c8c', textTransform: 'uppercase' }}>Delivered</div>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{stats.delivered.toLocaleString()}</div>
                            <div style={{ color: '#8c8c8c', fontSize: '13px' }}>{stats.deliveredRate}% Success rate</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#8c8c8c', textTransform: 'uppercase' }}>Read</div>
                                <EyeOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{stats.read.toLocaleString()}</div>
                            <div style={{ color: '#8c8c8c', fontSize: '13px' }}>{stats.openRate}% Open rate</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#8c8c8c', textTransform: 'uppercase' }}>Failed</div>
                                <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{stats.failed.toLocaleString()}</div>
                            <div style={{ color: '#ff4d4f', fontSize: '13px', fontWeight: '500' }}>{stats.failureRate}% Failure rate</div>
                        </Card>
                    </Col>
                </Row>

                {/* Filters Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#fff', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <Search placeholder="Search members..." style={{ width: 300 }} />
                        <Select defaultValue="All Status" style={{ width: 150 }}>
                            <Option value="All Status">All Status</Option>
                            <Option value="Delivered">Delivered</Option>
                            <Option value="Read">Read</Option>
                            <Option value="Failed">Failed</Option>
                        </Select>
                    </div>
                    <div style={{ color: '#8c8c8c' }}>
                        Showing 1-10 of 12,500
                    </div>
                </div>
            </div>

            {/* Table */}
            <MyTable
                dataSource={data}
                columns={tableColumns}
                onRowClick={(record) => {
                    navigate("/Details", { state: { id: record.memberId, ...record } });
                }}
            />
        </div>
    );
};

export default CommunicationBatchDetail;
