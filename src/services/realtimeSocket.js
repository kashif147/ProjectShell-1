import { io } from "socket.io-client";

const NOTIFICATION_SERVICE_FALLBACK =
  "https://projectshell-vm.northeurope.cloudapp.azure.com/notification-service/api";

export function getNotificationServiceUrl() {
  const env = (process.env.REACT_APP_NOTIFICATION_SERVICE_URL || "").trim();
  if (env && env.includes("/notification-service/")) return env;
  return NOTIFICATION_SERVICE_FALLBACK;
}

export function getNotificationSocketConfig() {
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
}

let socket = null;

/** One shared Socket.IO connection for notifications + profile realtime invalidation. */
export function getRealtimeSocket() {
  const token = localStorage.getItem("token");
  if (!token) {
    disconnectRealtimeSocket();
    return null;
  }
  if (socket) return socket;

  const { origin, path } = getNotificationSocketConfig();
  socket = io(origin, {
    path,
    auth: { token },
    query: { token },
    transports: ["websocket"],
  });
  return socket;
}

export function disconnectRealtimeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeRealtimeSocketEvent(eventName, handler) {
  const s = getRealtimeSocket();
  if (!s) return () => {};
  s.on(eventName, handler);
  return () => {
    s.off(eventName, handler);
  };
}
