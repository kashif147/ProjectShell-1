import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import MyTable from '../../component/common/MyTable';
import CreateEventDrawer from '../../component/event/CreateEventDrawer';

function EventsSummary() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Sample data for events
    const dataSource = [
        {
            key: "1",
            eventId: "EVT-001",
            eventName: "Annual Conference 2024",
            eventType: "Internal",
            createdBy: "John Doe",
            createdAt: "2024-01-15",
            status: "Active",
        },
        {
            key: "2",
            eventId: "EVT-002",
            eventName: "Technical Workshop",
            eventType: "Workshop",
            createdBy: "Jane Smith",
            createdAt: "2024-01-20",
            status: "Planning",
        },
        {
            key: "3",
            eventId: "EVT-003",
            eventName: "Team Building Event",
            eventType: "Internal",
            createdBy: "Alice Brown",
            createdAt: "2024-02-01",
            status: "Active",
        },
        {
            key: "4",
            eventId: "EVT-004",
            eventName: "Product Launch",
            eventType: "External",
            createdBy: "Bob Wilson",
            createdAt: "2024-02-05",
            status: "Review",
        },
        {
            key: "5",
            eventId: "EVT-005",
            eventName: "Training Session",
            eventType: "Workshop",
            createdBy: "Carol Davis",
            createdAt: "2024-02-10",
            status: "Canceled",
        },
        {
            key: "6",
            eventId: "EVT-006",
            eventName: "Quarterly Review",
            eventType: "Internal",
            createdBy: "David Lee",
            createdAt: "2024-02-15",
            status: "Planning",
        },
        {
            key: "7",
            eventId: "EVT-007",
            eventName: "Customer Appreciation Day",
            eventType: "External",
            createdBy: "Emma White",
            createdAt: "2024-02-20",
            status: "Active",
        },
        {
            key: "8",
            eventId: "EVT-008",
            eventName: "Leadership Workshop",
            eventType: "Workshop",
            createdBy: "Frank Miller",
            createdAt: "2024-02-25",
            status: "Active",
        },
    ];

    // Status tag colors matching CasesSummary style
    const getStatusTag = (status) => {
        const statusConfig = {
            'Active': { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
            'Planning': { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
            'Review': { color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
            'Canceled': { color: '#8c8c8c', bg: '#fafafa', border: '#d9d9d9' },
        };
        const config = statusConfig[status] || statusConfig['Active'];
        return (
            <Tag style={{
                color: config.color,
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: '4px',
                fontWeight: 500,
            }}>
                {status}
            </Tag>
        );
    };

    // Table columns configuration
    const columns = [
        {
            title: 'EVENT ID',
            dataIndex: 'eventId',
            key: 'eventId',
            render: (text, record) => (
                <a
                    style={{
                        color: '#0000FF',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to event details page when implemented
                        // navigate("/EventDetails", { state: { eventId: text } });
                    }}
                >
                    {text}
                </a>
            ),
            sorter: (a, b) => a.eventId.localeCompare(b.eventId),
        },
        {
            title: 'EVENT NAME',
            dataIndex: 'eventName',
            key: 'eventName',
            sorter: (a, b) => a.eventName.localeCompare(b.eventName),
        },
        {
            title: 'EVENT TYPE',
            dataIndex: 'eventType',
            key: 'eventType',
            sorter: (a, b) => a.eventType.localeCompare(b.eventType),
        },
        {
            title: 'CREATED BY',
            dataIndex: 'createdBy',
            key: 'createdBy',
            sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
        },
        {
            title: 'CREATED AT',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
    ];

    return (
        <div style={{ padding: "20px 0" }}>
            <MyTable
                dataSource={dataSource}
                columns={columns}
                onRowClick={(record) => {
                    // Navigate to event details when implemented
                    // navigate("/EventDetails", { state: { eventId: record.eventId } });
                }}
            />
            <CreateEventDrawer 
                open={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
            />
        </div>
    );
}

export default EventsSummary;
