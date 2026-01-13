importScripts(
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCXGt41botyVbEkMsfo0SEe5iu8Qy1hguY",
  authDomain: "portal-2ba29.firebaseapp.com",
  projectId: "portal-2ba29",
  storageBucket: "portal-2ba29.firebasestorage.app",
  messagingSenderId: "31732856266",
  appId: "1:31732856266:web:d3033d39df7ca6d0100b33",
  measurementId: "G-3F413XVYM2",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle skip waiting message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || "/logo192.png",
    badge: "/logo192.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  // Close notification immediately on click
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
      })
  );
});
