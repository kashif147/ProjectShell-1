import { io } from "socket.io-client";

// The gateway serves the DEV APIs on :8443; the bare :443 host does not allow the
// Vercel-hosted CRM's origin, so a fallback there would be blocked by CORS.
const GATEWAY_FALLBACK_ORIGIN =
  "https://projectshell-vm.northeurope.cloudapp.azure.com:8443";
const NOTIFICATION_SERVICE_FALLBACK = `${GATEWAY_FALLBACK_ORIGIN}/notification-service/api`;

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
      origin: GATEWAY_FALLBACK_ORIGIN,
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
