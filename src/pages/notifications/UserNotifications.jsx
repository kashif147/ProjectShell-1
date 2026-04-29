import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, List, Typography, Button, Spin, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  useNotifications,
  getNotificationServiceUrl,
} from "../../context/NotificationContext";
import { NotificationRow } from "../../component/notifications/notificationPresentation";

const { Title } = Typography;

const PAGE_LIMIT = 100;
const FILTERS = ["all", "unread"];

const UserNotifications = () => {
  const {
    setNotifications,
    setBadge,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearLoading, setClearLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${getNotificationServiceUrl()}/notifications?limit=${PAGE_LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const { notifications: list, unreadCount } =
        res.data?.data ?? res.data ?? {};
      const next = Array.isArray(list) ? list : [];
      setItems(next);
      setNotifications(next);
      if (typeof unreadCount === "number") setBadge(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      message.error("Failed to load notifications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [setBadge, setNotifications]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) return;
    const target = items.find((n) => String(n._id) === String(notificationId));
    if (target?.isRead) return;

    const next = items.map((n) =>
      String(n._id) === String(notificationId) ? { ...n, isRead: true } : n
    );
    setItems(next);
    setNotifications(next);
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
      markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      message.error("Could not mark as read");
      await loadList();
    }
  };

  const handleMarkAllAsRead = () => {
    const next = items.map((n) => ({ ...n, isRead: true }));
    setItems(next);
    setNotifications(next);
    setBadge(0);
    markAllAsRead();
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
      setItems([]);
      setNotifications([]);
      setBadge(0);
      await loadList();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      message.error("Could not clear notifications");
    } finally {
      setClearLoading(false);
    }
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !item?.isRead).length,
    [items]
  );

  const filterCounts = useMemo(
    () => ({
      all: items.length,
      unread: unreadCount,
    }),
    [items, unreadCount]
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === "unread") return items.filter((item) => !item?.isRead);
    return items;
  }, [activeFilter, items]);

  return (
    <div
      className="mt-2 pe-4 pb-4 mb-2"
      style={{
        width: "100%",
        maxWidth: 920,
        margin: "0 auto",
        overflowY: "auto",
        maxHeight: "calc(100vh - 160px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            <BellOutlined style={{ fontSize: 17 }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: 22, lineHeight: 1.1 }}>
              Notifications
            </Title>
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              You have {unreadCount} unread notifications
            </Typography.Text>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Button type="link" size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
          <Button
            type="link"
            danger
            size="small"
            loading={clearLoading}
            onClick={handleClearNotifications}
          >
            Delete all
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((filterKey) => {
            const labelMap = {
              all: "All",
              unread: "Unread",
            };
            const active = activeFilter === filterKey;
            return (
              <Button
                key={filterKey}
                type={active ? "primary" : "text"}
                onClick={() => setActiveFilter(filterKey)}
                style={{
                  height: 34,
                  borderRadius: 9,
                  fontWeight: active ? 600 : 500,
                  paddingInline: 14,
                  backgroundColor: active ? "#2563eb" : "transparent",
                }}
              >
                {labelMap[filterKey]} ({filterCounts[filterKey] || 0})
              </Button>
            );
          })}
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <List
            itemLayout="horizontal"
            dataSource={filteredItems}
            locale={{ emptyText: "No notifications" }}
            renderItem={(item) => (
              <NotificationRow
                key={item._id}
                item={item}
                onRowClick={handleMarkAsRead}
                padding="12px 8px"
              />
            )}
          />
        </Spin>
      </Card>
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

export default UserNotifications;
