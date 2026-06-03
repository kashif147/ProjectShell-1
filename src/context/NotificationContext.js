import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { notification } from "antd";
import axios from "axios";
import {
  disconnectRealtimeSocket,
  getNotificationServiceUrl,
  getNotificationSocketConfig,
  getRealtimeSocket,
} from "../services/realtimeSocket";

export { getNotificationServiceUrl, getNotificationSocketConfig };

const NotificationContext = createContext();

/** Coalesce overlapping unread-count XHRs (e.g. StrictMode double mount + visibility). */
let unreadCountFetchInFlight = null;

export const NotificationProvider = ({ children }) => {
  const [badge, setBadge] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const recentNotificationIds = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setBadge(0);
      setNotifications([]);
      window.recentNotificationIds = undefined;
      disconnectRealtimeSocket();
      return;
    }

    const socket = getRealtimeSocket();
    if (!socket) return undefined;

    const onConnectError = (err) => {
      console.warn(
        "[NotificationContext] Socket connect_error:",
        err.message || err,
      );
    };

    const onDisconnect = (reason) => {
      if (reason !== "io client disconnect") {
        console.warn("[NotificationContext] Socket disconnect:", reason);
      }
    };

    window.recentNotificationIds = recentNotificationIds.current;

    const onUnreadCount = (data) => {
      if (typeof data?.count === "number") {
        setBadge(data.count);
      }
    };

    const onNotification = (notif) => {
      if (!notif) return;

      const notifId = notif?._id ? String(notif._id) : null;
      const alreadySeen = notifId
        ? recentNotificationIds.current.has(notifId)
        : false;

      if (notif?._id) {
        recentNotificationIds.current.add(notif._id);
        setTimeout(() => {
          recentNotificationIds.current.delete(notif._id);
        }, 5000);
      }

      setNotifications((prev) => [notif, ...prev]);
      if (!alreadySeen && notif?.isRead !== true) {
        setBadge((prev) => prev + 1);
      }

      notification.info({
        message: notif.title || "New Notification",
        description: notif.body || "",
        duration: 4.5,
      });
    };

    const onBadgeIncrement = (data) => {
      setBadge((prev) =>
        typeof data?.count === "number" ? data.count : prev + 1,
      );
    };

    const onBadgeDecrement = (data) => {
      setBadge((prev) =>
        typeof data?.count === "number" ? data.count : Math.max(prev - 1, 0),
      );
    };

    const onBadgeReset = () => {
      setBadge(0);
    };

    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on("unreadCount", onUnreadCount);
    socket.on("notification", onNotification);
    socket.on("badgeIncrement", onBadgeIncrement);
    socket.on("badgeDecrement", onBadgeDecrement);
    socket.on("badgeReset", onBadgeReset);

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.off("unreadCount", onUnreadCount);
      socket.off("notification", onNotification);
      socket.off("badgeIncrement", onBadgeIncrement);
      socket.off("badgeDecrement", onBadgeDecrement);
      socket.off("badgeReset", onBadgeReset);
      disconnectRealtimeSocket();
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (unreadCountFetchInFlight) return unreadCountFetchInFlight;
    unreadCountFetchInFlight = (async () => {
      try {
        const res = await axios.get(
          `${getNotificationServiceUrl()}/notifications?limit=1`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const { unreadCount } = res.data?.data ?? res.data ?? {};
        if (typeof unreadCount === "number") setBadge(unreadCount);
      } catch {
        // ignore
      } finally {
        unreadCountFetchInFlight = null;
      }
    })();
    return unreadCountFetchInFlight;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setBadge(0);
        setNotifications([]);
        window.recentNotificationIds = undefined;
        disconnectRealtimeSocket();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const markAsRead = (notificationId) => {
    const socket = getRealtimeSocket();
    if (socket && notificationId) {
      socket.emit("markAsRead", { notificationId });
    }
  };

  const markAllAsRead = () => {
    const socket = getRealtimeSocket();
    if (socket) {
      socket.emit("markAllAsRead");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        badge,
        setBadge,
        notifications,
        setNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
