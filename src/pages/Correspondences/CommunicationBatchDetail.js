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
    MoreOutlined,
    SendOutlined
} from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
import { useLocation, useNavigate } from "react-router-dom";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { Space } from "antd";
import Toolbar from "../../component/common/Toolbar";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getNotificationTokens, sendNotification, clearNotificationState } from "../../features/NotificationSlice";
import MyAlert from "../../component/common/MyAlert";

const { Option } = Select;

const CommunicationBatchDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tokens, loading, sending, successMessage, error } = useSelector((state) => state.notification);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        if (successMessage) {
            MyAlert("success", "Success", successMessage);
            dispatch(clearNotificationState());
            setSelectedRowKeys([]);
            setSelectedRows([]);
        }
        if (error) {
            MyAlert("error", "Error", typeof error === 'string' ? error : "Failed to send notifications");
            dispatch(clearNotificationState());
        }
    }, [successMessage, error, dispatch]);

    useEffect(() => {
        dispatch(getNotificationTokens());
    }, [dispatch]);
    // Fallback to static values if no state is passed, but keep it simple
    const batchName = location.state?.batchName || "August Newsletter - Email";
    const batchId = location.state?.batchId || "#BTH-2023-08-15";
    const notificationTitle = location.state?.title || "Notification Title";
    const notificationMessage = location.state?.message || "This is the content of the notification message.";

    // Static Columns Definition
    const tableColumns = useMemo(() => [
        {
            dataIndex: "userId",
            title: "User ID",
            width: 150,
        },
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
        // {
        //     title: "Actions",
        //     key: "actions",
        //     width: 100,
        //     render: () => (
        //         <Button type="text" icon={<MoreOutlined />} />
        //     )
        // }
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
    // const data = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    //     key: i,
    //     memberName: i % 2 === 0 ? "Alex Smith" : "Bonnie Johnson",
    //     memberId: i % 2 === 0 ? "#MEM-00124" : "#MEM-00982",
    //     initials: i % 2 === 0 ? "AS" : "BJ",
    //     avatarColor: i % 2 === 0 ? "#1890ff" : "#fa8c16",
    //     channel: "Email",
    //     recipientDetail: i % 2 === 0 ? "alex.smith@example.com" : "bonnie.j@invalid-domain",
    //     timestamp: "Aug 15, 11:02 AM",
    //     status: i % 3 === 0 ? "Failed" : i % 2 === 0 ? "Read" : "Delivered"
    // })), []);

    const data = useMemo(() => {
        let tokenList = [];
        if (Array.isArray(tokens)) {
            tokenList = tokens;
        } else if (tokens?.data?.tokens && Array.isArray(tokens.data.tokens)) {
            tokenList = tokens.data.tokens;
        } else if (Array.isArray(tokens?.data)) {
            tokenList = tokens.data;
        }

        return tokenList.map((token, index) => ({
            key: index,
            userId: token.userId || "N/A",
            memberName: token.profile?.name || "Unknown",
            memberId: token.memberId || "N/A",
            initials: "MB",
            avatarColor: "#1890ff",
            channel: token.platform || "Unknown",
            recipientDetail: token.fcmToken ? `${token.fcmToken.substring(0, 20)}...` : "N/A",
            timestamp: token.createdAt ? new Date(token.createdAt).toLocaleString() : "N/A",
            status: token.isActive ? "Active" : "Inactive",
            tenantId: token.tenantId // Ensure tenantId is passed
        }));
    }, [tokens]);

    const navyButtonStyle = {
        backgroundColor: "#1d5b95",
        borderColor: "#1d5b95",
        color: "white",
        borderRadius: "4px",
        height: "38px",
        padding: "0 30px",
        fontWeight: "500",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const outlineButtonStyle = {
        color: "#595959",
        borderColor: "#d9d9d9",
        borderRadius: "4px",
        height: "38px",
        padding: "0 16px",
        fontWeight: "400",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#fff"
    };

    const retryButtonStyle = {
        backgroundColor: "#1677ff",
        borderColor: "#1677ff",
        color: "white",
        borderRadius: "4px",
        height: "38px",
        padding: "0 16px",
        fontWeight: "500",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    };

    const handleSendNotification = () => {
        if (selectedRows.length === 0) {
            MyAlert("warning", "Selection Required", "Please select at least one user to send notification.");
            return;
        }

        const payload = {
            title: notificationTitle,
            body: notificationMessage,
            userId: selectedRows.map(row => row.userId),
            tenantId: selectedRows.map(row => row.tenantId || "68cbf7806080b4621d469d34")
        };

        dispatch(sendNotification(payload));
    };

    return (
        <div style={{ padding: "0", minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            <div style={{ padding: "16px 24px 0 24px" }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '12px', color: '#8c8c8c' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, borderRadius: '2px', border: '2px solid #adc6ff' }}></div> Correspondence</span>
                    <span>&gt;</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, borderRadius: '2px', border: '2px solid #adc6ff' }}></div> Batch Details</span>
                    <span>&gt;</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, border: '2px solid #d9d9d9', opacity: 0.5 }}></div> {batchName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                                {batchName}
                            </h1>
                            <Tag color="blue" style={{ borderRadius: '4px', margin: 0, fontWeight: 'bold' }}>ACTIVE</Tag>
                        </div>
                        <div style={{ color: '#8c8c8c', marginTop: '4px', fontSize: '13px', marginBottom: '16px' }}>
                            Batch ID: {batchId} • Created on Aug 15, 2023 at 10:45 AM
                        </div>

                        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #f0f0f0', maxWidth: '800px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#8c8c8c', textTransform: 'uppercase', marginRight: '8px' }}>
                                    Subject:
                                </span>
                                <span style={{ fontWeight: '500', color: '#262626', fontSize: '15px' }}>
                                    {notificationTitle}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#8c8c8c', textTransform: 'uppercase', marginRight: '8px', verticalAlign: 'top' }}>
                                    Message:
                                </span>
                                <span style={{ color: '#595959', fontSize: '14px', lineHeight: '1.5' }}>
                                    {notificationMessage}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <CommonPopConfirm
                            title={`Are you sure you want to send notifications to ${selectedRows.length} selected members?`}
                            onConfirm={handleSendNotification}
                        >
                            <Button
                                style={retryButtonStyle}
                                icon={<SendOutlined />}
                                loading={sending}
                                disabled={selectedRows.length === 0}
                            >
                                Send Notification
                            </Button>
                        </CommonPopConfirm>
                        <Button style={navyButtonStyle}>Include</Button>
                        <CommonPopConfirm title="Are you sure you want to exclude members?">
                            <Button style={navyButtonStyle}>Exclude Members</Button>
                        </CommonPopConfirm>
                        <Button style={outlineButtonStyle} icon={<ExportOutlined />}>Export CSV</Button>
                        <Button style={retryButtonStyle} icon={<ReloadOutlined />}>Retry Failed</Button>
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
                <Toolbar />
            </div>

            {/* Table */}
            <MyTable
                dataSource={data}
                columns={tableColumns}
                onRowClick={(record) => {
                    navigate("/Details", { state: { id: record.memberId, ...record } });
                }}
                selection={true}
                rowSelection={{ selectedRowKeys }}
                onSelectionChange={(selectedKeys, selectedRows) => {
                    setSelectedRowKeys(selectedKeys);
                    setSelectedRows(selectedRows);
                }}
            />
        </div>
    );
};

export default CommunicationBatchDetail;
