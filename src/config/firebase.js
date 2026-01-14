import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

let messagingInstance = null;

export const getMessagingInstance = async (serviceWorkerRegistration) => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  if (messagingInstance) {
    return messagingInstance;
  }

  try {
    if (serviceWorkerRegistration) {
      console.log("🔍 Passing service worker registration to Firebase:", {
        scope: serviceWorkerRegistration.scope,
        active: serviceWorkerRegistration.active?.state,
        scriptURL: serviceWorkerRegistration.active?.scriptURL,
      });
      messagingInstance = getMessaging(app, { serviceWorkerRegistration });
      console.log("✅ Firebase messaging instance created with service worker");
    } else {
      console.log(
        "⚠️ No service worker registration provided, Firebase will use default"
      );
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (error) {
    console.error("Firebase messaging initialization error:", error);
    return null;
  }
};

export default app;
