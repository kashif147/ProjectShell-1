import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { notification } from "antd";

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

    socket = io(process.env.REACT_APP_NOTIFICATION_URL, {
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

    socket.on("badgeIncrement", () => {
      setBadge((prev) => prev + 1);
    });

    socket.on("badgeDecrement", () => {
      setBadge((prev) => Math.max(prev - 1, 0));
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
