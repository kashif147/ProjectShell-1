import React, { useEffect } from "react";
import { List, Typography, Button } from "antd";
import axios from "axios";
import {
  useNotifications,
  getNotificationServiceUrl,
} from "../../context/NotificationContext";
import { NotificationRow } from "../notifications/notificationPresentation";

const { Title } = Typography;

const NotificationPopover = ({ isOpen, onNavigateToAll }) => {
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
          <NotificationRow
            key={item._id}
            item={item}
            onRowClick={handleMarkAsRead}
          />
        )}
      />

      <div
        style={{
          padding: "12px",
          borderTop: "1px solid #f0f0f0",
          textAlign: "center",
        }}
      >
        <Button
          type="text"
          block
          onClick={() => onNavigateToAll?.()}
        >
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
