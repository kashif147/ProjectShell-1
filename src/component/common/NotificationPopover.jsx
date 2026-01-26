import React from 'react';
import { List, Typography, Button, Badge, Avatar, Space } from 'antd'; // Removed Popover from here as it will be used in Header
import {
    FileTextOutlined,
    CheckCircleOutlined,
    UserOutlined,
    MailOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const NotificationPopover = () => {
    const data = [
        {
            id: 1,
            title: 'New Application Received',
            description: 'Shahab dfdfdf submitted a new General membership application.',
            time: 'JUST NOW',
            icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
            iconBg: '#e6f7ff',
            unread: true,
        },
        {
            id: 2,
            title: 'Payment Successful',
            description: 'Annual subscription payment for #MEM-10928 has been processed.',
            time: '15 MINS AGO',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            iconBg: '#f6ffed',
            unread: true,
        },
        {
            id: 3,
            title: 'Profile Updated',
            description: 'Kashif Elon updated their work location to Private Nursing Home.',
            time: '2 HOURS AGO',
            icon: <UserOutlined style={{ color: '#fa8c16' }} />,
            iconBg: '#fff7e6',
            unread: false,
        },
        {
            id: 4,
            title: 'Email Campaign Sent',
            description: 'Membership renewal reminders sent to 450 members.',
            time: 'YESTERDAY',
            icon: <MailOutlined style={{ color: '#722ed1' }} />,
            iconBg: '#f9f0ff',
            unread: false,
        },
    ];

    return (
        <div style={{ width: 400, padding: 0 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>Notifications</Title>
                <Typography.Link style={{ fontSize: '12px' }}>Mark all as read</Typography.Link>
            </div>
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            padding: '16px 24px',
                            backgroundColor: item.unread ? '#fdfdfd' : '#fff',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        className="notification-item"
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    icon={item.icon}
                                    style={{ backgroundColor: item.iconBg, verticalAlign: 'middle' }}
                                    size="large"
                                />
                            }
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Text strong>{item.title}</Text>
                                    {item.unread && <Badge status="processing" color="#1890ff" />}
                                </div>
                            }
                            description={
                                <div>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px', lineHeight: '1.4' }}>
                                        {item.description}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <ClockCircleOutlined /> {item.time}
                                    </Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                <Button type="text" block>
                    View all notifications
                </Button>
            </div>
            <style>
                {`
          .notification-item:hover {
            background-color: #fafafa !important;
          }
        `}
            </style>
        </div>
    );
};

export default NotificationPopover;
