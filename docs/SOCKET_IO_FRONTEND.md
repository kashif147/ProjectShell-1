# Socket.IO Frontend Guide

## Overview

Socket.IO is used in this React app for real-time notifications via `NotificationContext`. The client connects to the notification service and receives live updates for the unread badge and notification list.

**Package:** `socket.io-client` v4.8.3  
**Primary file:** `src/context/NotificationContext.js`

---

## Connection Setup

```javascript
socket = io(process.env.REACT_APP_NOTIFICATION_SERVICE_URL, {
  auth: { token },
  transports: ["websocket"],
});
```

| Setting | Value | Notes |
|---------|-------|-------|
| URL | `REACT_APP_NOTIFICATION_SERVICE_URL` | e.g. `https://.../notification-service/api` |
| Auth | JWT in `auth.token` | From `localStorage.getItem("token")` |
| Transport | `["websocket"]` | No polling fallback |

---

## When Connection Happens

- **Connects:** User is authenticated (token in localStorage) and `NotificationProvider` mounts
- **Disconnects:** User logs out, tab closes, or cross-tab logout via `storage` event

---

## Server → Client Events (Listeners)

| Event | Payload | Action |
|-------|---------|--------|
| `unreadCount` | `{ count: number }` | Sets badge to `count` |
| `notification` | `{ _id, title, body, ... }` | Adds to list, shows Ant Design toast |
| `badgeIncrement` | `{ count?: number }` | Increments badge or sets to `count` |
| `badgeDecrement` | `{ count?: number }` | Decrements badge or sets to `count` |
| `badgeReset` | — | Sets badge to 0 |

### Duplicate Prevention

`notification` events use a `recentNotificationIds` Set (5s TTL) to avoid duplicate toasts when both Socket.IO and Firebase deliver the same notification.

---

## Client → Server Events (Emits)

| Event | Payload | Trigger |
|-------|---------|---------|
| `markAsRead` | `{ notificationId }` | User clicks a notification |
| `markAllAsRead` | — | User clicks "Mark all as read" |

---

## How Components Use It

| Component | Usage |
|-----------|-------|
| `App.js` | Wraps app with `NotificationProvider` |
| `Header.jsx` | `useNotifications()` → `badge` for bell icon |
| `NotificationPopover.jsx` | `useNotifications()` → `notifications`, `markAsRead`, `markAllAsRead` |

---

## REST Fallback

Unread count is also fetched via REST:

- On initial load when authenticated
- When the tab becomes visible (`visibilitychange`)
- When the notification popover opens (GET `/notifications?limit=20`)

---

## Data Flow Summary

1. Token exists → Connect with `auth.token`
2. Server sends `notification` → Toast + add to list; badge events update count
3. User marks read → `socket.emit("markAsRead" | "markAllAsRead")`
4. Logout/cleanup → Disconnect and null out socket
