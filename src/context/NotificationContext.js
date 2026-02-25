import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { notification } from "antd";
import axios from "axios";

const NotificationContext = createContext();

let socket = null;

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
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    socket = io(process.env.REACT_APP_NOTIFICATION_SERVICE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    // Expose for Firebase duplicate guard
    window.recentNotificationIds = recentNotificationIds.current;

    socket.on("unreadCount", (data) => {
      if (typeof data?.count === "number") {
        setBadge(data.count);
      }
    });

    socket.on("notification", (notif) => {
      if (!notif) return;

      if (notif?._id) {
        recentNotificationIds.current.add(notif._id);

        setTimeout(() => {
          recentNotificationIds.current.delete(notif._id);
        }, 5000);
      }

      setNotifications((prev) => [notif, ...prev]);

      notification.info({
        message: notif.title || "New Notification",
        description: notif.body || "",
        duration: 4.5,
      });
    });

    socket.on("badgeIncrement", (data) => {
      setBadge((prev) =>
        typeof data?.count === "number" ? data.count : prev + 1
      );
    });

    socket.on("badgeDecrement", (data) => {
      setBadge((prev) =>
        typeof data?.count === "number"
          ? data.count
          : Math.max(prev - 1, 0)
      );
    });

    socket.on("badgeReset", () => {
      setBadge(0);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_NOTIFICATION_SERVICE_URL}/notifications?limit=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { unreadCount } = res.data?.data ?? res.data ?? {};
      if (typeof unreadCount === "number") setBadge(unreadCount);
    } catch {
      // ignore
    }
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

  // Cross-tab logout sync
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setBadge(0);
        setNotifications([]);
        window.recentNotificationIds = undefined;
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const markAsRead = (notificationId) => {
    if (socket && notificationId) {
      socket.emit("markAsRead", { notificationId });
    }
  };

  const markAllAsRead = () => {
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
