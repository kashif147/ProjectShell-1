import React, { useEffect } from "react";
import { List, Typography, Button, Badge, Avatar } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNotifications } from "../../context/NotificationContext";

const { Text, Title } = Typography;

const iconMap = {
  DEFAULT: <FileTextOutlined style={{ color: "#1890ff" }} />,
  SUCCESS: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  USER: <UserOutlined style={{ color: "#fa8c16" }} />,
  MAIL: <MailOutlined style={{ color: "#722ed1" }} />,
};

const NotificationPopover = ({ isOpen }) => {
  const { notifications, setNotifications, setBadge, markAsRead, markAllAsRead } =
    useNotifications();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_NOTIFICATION_SERVICE_URL}/notifications?limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const { notifications: list, unreadCount } = res.data?.data ?? res.data ?? {};
      if (Array.isArray(list)) setNotifications(list);
      if (typeof unreadCount === "number") setBadge(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // 🔹 Auto-refresh when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <div style={{ width: 400, padding: 0 }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Notifications
        </Title>
        <Typography.Link style={{ fontSize: "12px" }} onClick={markAllAsRead}>
          Mark all as read
        </Typography.Link>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: "No notifications" }}
        renderItem={(item) => (
          <List.Item
            onClick={() => markAsRead(item._id)}
            style={{
              padding: "16px 24px",
              backgroundColor: item.isRead ? "#fff" : "#f6faff",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            className="notification-item"
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={iconMap.DEFAULT}
                  style={{ backgroundColor: "#e6f7ff" }}
                  size="large"
                />
              }
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Text strong>{item.title}</Text>
                  {!item.isRead && (
                    <Badge status="processing" color="#1890ff" />
                  )}
                </div>
              }
              description={
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginBottom: "4px",
                      lineHeight: "1.4",
                    }}
                  >
                    {item.body}
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ClockCircleOutlined />
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <div
        style={{
          padding: "12px",
          borderTop: "1px solid #f0f0f0",
          textAlign: "center",
        }}
      >
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
