import { io } from "socket.io-client";

// No built-in host: each deployment's own env decides where the notification service lives
// (DEV and UAT run behind different gateways), so a hard-coded fallback could only ever point a
// build at the wrong environment.
function parseHttpUrl(value) {
  const raw = (value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Notification-service base URL, in order:
 *  1. REACT_APP_NOTIFICATION_SERVICE_URL, when it is a valid http(s) URL under /notification-service/;
 *  2. otherwise <origin of REACT_APP_GATEWAY_URL>/notification-service/api;
 *  3. otherwise null - realtime (and the unread-count call) stay off.
 */
export function resolveNotificationServiceUrl(notificationUrl, gatewayUrl) {
  const notification = parseHttpUrl(notificationUrl);
  if (notification && notification.pathname.includes("/notification-service/")) {
    return notificationUrl.trim();
  }
  const gateway = parseHttpUrl(gatewayUrl);
  if (gateway) return `${gateway.origin}/notification-service/api`;
  return null;
}

export function getNotificationServiceUrl() {
  return resolveNotificationServiceUrl(
    process.env.REACT_APP_NOTIFICATION_SERVICE_URL,
    process.env.REACT_APP_GATEWAY_URL,
  );
}

/** Socket.IO origin + path for notification-service, or null when no valid URL is configured. */
export function getNotificationSocketConfig() {
  const baseUrl = getNotificationServiceUrl();
  if (!baseUrl) return null;
  const url = new URL(baseUrl);
  return {
    origin: url.origin,
    path: `${url.pathname.replace(/\/$/, "")}/socket.io`,
  };
}

let warnedNoConfig = false;
function warnRealtimeDisabledOnce() {
  if (warnedNoConfig) return;
  warnedNoConfig = true;
  console.warn(
    "[realtimeSocket] Realtime disabled: no valid REACT_APP_NOTIFICATION_SERVICE_URL or REACT_APP_GATEWAY_URL configured",
  );
}

/**
 * Socket.IO `auth` for notification-service: a FUNCTION, so the CURRENT ProjectShell token is read
 * on every connection and reconnection (never captured once). It travels only in the Socket.IO
 * CONNECT packet - never in the request URL - and is never logged.
 */
export function notificationSocketAuth(cb) {
  cb({ token: localStorage.getItem("token") || "" });
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

  const config = getNotificationSocketConfig();
  if (!config) {
    warnRealtimeDisabledOnce();
    return null;
  }
  const { origin, path } = config;
  socket = io(origin, {
    path,
    auth: notificationSocketAuth,
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
