importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
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
