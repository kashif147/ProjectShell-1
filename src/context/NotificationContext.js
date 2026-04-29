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

/** Coalesce overlapping unread-count XHRs (e.g. StrictMode double mount + visibility). */
let unreadCountFetchInFlight = null;

const NOTIFICATION_SERVICE_FALLBACK =
  "https://projectshell-vm.northeurope.cloudapp.azure.com/notification-service/api";

export const getNotificationServiceUrl = () => {
  const env = (process.env.REACT_APP_NOTIFICATION_SERVICE_URL || "").trim();
  if (env && env.includes("/notification-service/")) return env;
  return NOTIFICATION_SERVICE_FALLBACK;
};

export const getNotificationSocketConfig = () => {
  const baseUrl = getNotificationServiceUrl();
  try {
    const url = new URL(baseUrl);
    return {
      origin: url.origin,
      path: `${url.pathname.replace(/\/$/, "")}/socket.io`,
    };
  } catch {
    return {
      origin: "https://projectshell-vm.northeurope.cloudapp.azure.com",
      path: "/notification-service/api/socket.io",
    };
  }
};

/**
 * Socket.io-client ignores path in the URL; it only uses host/port.
 * Must pass path explicitly: io(origin, { path: basePath + "/socket.io" })
 */
const getSocketOptions = () => {
  return getNotificationSocketConfig();
};

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

    const { origin, path } = getSocketOptions();
    socket = io(origin, {
      path,
      auth: { token },
      query: { token },
      transports: ["websocket"],
    });

    socket.on("connect_error", (err) => {
      console.warn(
        "[NotificationContext] Socket connect_error:",
        err.message || err
      );
    });

    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        console.warn("[NotificationContext] Socket disconnect:", reason);
      }
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
    });

    socket.on("badgeIncrement", (data) => {
      setBadge((prev) =>
        typeof data?.count === "number" ? data.count : prev + 1,
      );
    });

    socket.on("badgeDecrement", (data) => {
      setBadge((prev) =>
        typeof data?.count === "number" ? data.count : Math.max(prev - 1, 0),
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
