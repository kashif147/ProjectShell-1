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
import {
  useNotifications,
  getNotificationServiceUrl,
} from "../../context/NotificationContext";

const { Text, Title } = Typography;

const iconMap = {
  DEFAULT: <FileTextOutlined style={{ color: "#1890ff" }} />,
  SUCCESS: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  USER: <UserOutlined style={{ color: "#fa8c16" }} />,
  MAIL: <MailOutlined style={{ color: "#722ed1" }} />,
};

const isBatchProcessNotification = (type) =>
  type === "BATCH_PROCESS_COMPLETED" || type === "BATCH_PROCESS_QUEUED";

const NotificationPopover = ({ isOpen }) => {
  const { notifications, setNotifications, setBadge, markAsRead, markAllAsRead } =
    useNotifications();
  const [clearLoading, setClearLoading] = React.useState(false);

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) return;

    const target = notifications.find((n) => String(n._id) === String(notificationId));
    if (target?.isRead) return;

    // Optimistic UI update for instant feedback
    setNotifications((prev) =>
      prev.map((n) =>
        String(n._id) === String(notificationId) ? { ...n, isRead: true } : n
      )
    );
    setBadge((prev) => Math.max((Number(prev) || 0) - 1, 0));

    try {
      await axios.post(
        `${getNotificationServiceUrl().replace(/\/$/, "")}/firebase/notifications/mark-read`,
        { notificationIds: [notificationId] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Keep socket path for other open views/counters
      markAsRead(notificationId);
    } catch (error) {
      // Re-sync if API fails
      fetchNotifications();
      console.error("Failed to mark notification as read:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${getNotificationServiceUrl()}/notifications?limit=20`,
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

  const handleClearNotifications = async () => {
    if (clearLoading) return;
    setClearLoading(true);
    try {
      await axios.delete(
        `${getNotificationServiceUrl().replace(/\/$/, "")}/firebase/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotifications([]);
      setBadge(0);
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    } finally {
      setClearLoading(false);
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Typography.Link style={{ fontSize: "12px" }} onClick={markAllAsRead}>
            Mark all as read
          </Typography.Link>
          <Typography.Link
            style={{ fontSize: "12px", color: "#cf1322" }}
            onClick={handleClearNotifications}
          >
            {clearLoading ? "Clearing..." : "Clear notifications"}
          </Typography.Link>
        </div>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: "No notifications" }}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleMarkAsRead(item._id)}
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginLeft: 8,
                    }}
                  >
                    {isBatchProcessNotification(item?.metadata?.type) && (
                      <Text strong style={{ color: "#1D4ED8", fontSize: 12 }}>
                        {Number(item?.metadata?.totalTransactions || 0)}
                      </Text>
                    )}
                    {!item.isRead && (
                      <Badge status="processing" color="#1890ff" />
                    )}
                  </div>
                </div>
              }
              description={
                <div>
                  {isBatchProcessNotification(item?.metadata?.type) ? (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "4px",
                        lineHeight: "1.4",
                      }}
                    >
                      <div>{`Ref No: ${item?.metadata?.referenceNumber || "-"} | Description: ${item?.metadata?.description || "-"}`}</div>
                    </div>
                  ) : (
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
                  )}
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
