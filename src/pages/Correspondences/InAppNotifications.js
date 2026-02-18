import React from "react";
import { Card, Button, Input, Select, Tag } from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    MoreOutlined,
    BellOutlined
} from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

const InAppNotifications = () => {
    const navigate = useNavigate();

    // Static Columns Definition
    const columns = [
        {
            dataIndex: "batchName",
            title: "Batch Name",
            width: 300,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#e6f7ff',
                        color: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                    }}>
                        <BellOutlined />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1890ff', cursor: 'pointer' }}
                            onClick={() => navigate("/CommunicationBatchDetail", { state: { batchId: record.batchId, batchName: text } })}
                        >
                            {text}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.batchId}</div>
                    </div>
                </div>
            )
        },
        {
            dataIndex: "createdDate",
            title: "Created Date",
            width: 200,
            render: (date) => dayjs(date).format("MMM D, YYYY h:mm A")
        },
        {
            dataIndex: "recipientCount",
            title: "Recipients",
            width: 150,
            render: (count) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{count.toLocaleString()}</span>
                    <span style={{ color: '#8c8c8c', fontSize: '12px' }}>members</span>
                </div>
            )
        },
        {
            dataIndex: "status",
            title: "Status",
            width: 150,
            render: (status) => {
                let color = 'default';
                if (status === 'Completed') color = 'success';
                if (status === 'In Progress') color = 'processing';
                if (status === 'Draft') color = 'default';

                return <Tag color={color}>{status}</Tag>;
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
    ];

    // Static Mock Data
    const data = [
        {
            key: '1',
            batchId: '#NOT-2023-001',
            batchName: 'System Maintenance Alert',
            title: 'System Maintenance Scheduled',
            message: 'We will be performing scheduled maintenance on Sunday, August 25th from 2:00 AM to 4:00 AM UTC. Services may be intermittent.',
            createdDate: '2023-08-20T10:00:00',
            recipientCount: 15420,
            status: 'Completed'
        },
        {
            key: '2',
            batchId: '#NOT-2023-002',
            batchName: 'New Feature Announcement',
            title: 'Introducing Dark Mode!',
            message: 'You asked, we listened. Dark mode is now available in your settings. Try it out today for a better viewing experience at night.',
            createdDate: '2023-08-18T14:30:00',
            recipientCount: 12500,
            status: 'Completed'
        },
        {
            key: '3',
            batchId: '#NOT-2023-003',
            batchName: 'Policy Update Reminder',
            title: 'Action Required: Policy Updates',
            message: 'We have updated our terms of service. Please review the changes and accept the new terms by September 1st to continue using our services.',
            createdDate: '2023-08-15T09:15:00',
            recipientCount: 8900,
            status: 'In Progress'
        },
        {
            key: '4',
            batchId: '#NOT-2023-004',
            batchName: 'Welcome Series - Group A',
            title: 'Welcome to Our Community!',
            message: 'Thanks for joining! Here are a few tips to get you started and make the most out of your new membership.',
            createdDate: '2023-08-12T11:45:00',
            recipientCount: 340,
            status: 'Draft'
        },
        {
            key: '5',
            batchId: '#NOT-2023-005',
            batchName: 'Monthly Newsletter',
            title: 'August Newsletter: Top Trends',
            message: 'Check out the top trends for this month, upcoming events, and member highlights in our latest newsletter.',
            createdDate: '2023-08-10T16:20:00',
            recipientCount: 14200,
            status: 'Completed'
        }
    ];

    return (
        <div style={{ padding: "0" }}>
            {/* Table */}
            <MyTable
                dataSource={data}
                columns={columns}
                pagination={{ pageSize: 10 }}
                loading={false}
                onRowClick={(record) => {
                    navigate("/CommunicationBatchDetail", {
                        state: {
                            batchId: record.batchId,
                            batchName: record.batchName,
                            title: record.title,
                            message: record.message
                        }
                    });
                }}
            />
        </div>
    );
};

export default InAppNotifications;
