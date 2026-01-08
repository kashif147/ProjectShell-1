const fs = require("fs");
const path = require("path");

const env = process.env;

const firebaseConfig = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId:
    env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: env.REACT_APP_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID",
};

const swContent = `importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js');

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

const swPath = path.join(__dirname, "..", "public", "firebase-messaging-sw.js");
fs.writeFileSync(swPath, swContent, "utf8");
console.log("Service worker generated successfully at:", swPath);
