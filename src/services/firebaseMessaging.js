import { getMessagingInstance } from "../config/firebase";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const vapidKey =
  process.env.REACT_APP_FIREBASE_VAPID_KEY;

let cachedMessaging = null;

export const initializeMessaging = async (serviceWorkerRegistration) => {
  if (cachedMessaging) {
    return cachedMessaging;
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    cachedMessaging = await getMessagingInstance(serviceWorkerRegistration);
    return cachedMessaging;
  } catch (error) {
    console.error("Error initializing messaging:", error);
    return null;
  }
};

const getMessaging = async () => {
  if (cachedMessaging) {
    return cachedMessaging;
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    // Get the ready service worker registration
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.error("No service worker registration found");
      return null;
    }

    // Verify service worker is controlling the page
    if (!navigator.serviceWorker.controller) {
      console.error("Service Worker is not controlling the page");
      return null;
    }

    cachedMessaging = await getMessagingInstance(registration);
    return cachedMessaging;
  } catch (error) {
    console.error("Error getting messaging instance:", error);
    return null;
  }
};

// Deprecated: Use requestNotificationPermission from FCMContext instead
// This function is kept for backward compatibility but should not be called automatically
export const requestPermission = async (messagingInstance = null) => {
  try {
    console.log("🔔 Requesting notification permission...");
    const messaging = messagingInstance || (await getMessaging());
    if (!messaging) {
      console.warn("❌ Firebase messaging is not initialized");
      return null;
    }
    console.log("✅ Firebase messaging instance available");

    const permission = await Notification.requestPermission();
    console.log("📱 Notification permission:", permission);

    if (permission === "granted") {
      console.log("✅ Permission granted, getting FCM token...");
      console.log("🔑 Using VAPID key:", vapidKey ? "Present" : "Missing");
      const token = await getToken(messaging, { vapidKey });
      console.log("🎫 FCM Token retrieved:", token ? "Success" : "Failed");
      return token;
    } else {
      console.warn(
        "❌ Notification permission denied. Permission status:",
        permission
      );
      return null;
    }
  } catch (error) {
    console.error("❌ Error requesting notification permission:", error);
    console.error("Error details:", error.message, error.stack);
    return null;
  }
};

export const getFCMToken = async () => {
  try {
    console.log("🔄 getFCMToken: Getting messaging instance...");
    const messaging = await getMessaging();
    if (!messaging) {
      console.warn("❌ Firebase messaging is not initialized");
      return null;
    }
    console.log("✅ getFCMToken: Messaging instance available");

    console.log(
      "🔑 getFCMToken: VAPID key:",
      vapidKey ? `Present (${vapidKey.substring(0, 20)}...)` : "Missing"
    );
    console.log("🎫 getFCMToken: Requesting token from Firebase...");
    console.log(
      "🎫 getFCMToken: Calling getToken with messaging and vapidKey..."
    );

    const token = await getToken(messaging, { vapidKey });

    console.log("📝 getFCMToken: getToken returned:", token);
    console.log("📝 getFCMToken: Token type:", typeof token);
    console.log("📝 getFCMToken: Token value:", token);
    console.log("📝 getFCMToken: Token length:", token ? token.length : 0);
    console.log("📝 getFCMToken: Is token truthy?", !!token);
    console.log("📝 getFCMToken: Is token empty string?", token === "");

    if (token && token.length > 0) {
      console.log(
        "✅ getFCMToken: Token received:",
        token.substring(0, 50) + "..."
      );
      return token;
    } else {
      console.warn("⚠️ getFCMToken: Token is null, undefined, or empty string");
      console.warn("⚠️ This usually indicates:");
      console.warn("   - Service worker registration mismatch");
      console.warn("   - VAPID key doesn't match Firebase project");
      console.warn(
        "   - Notification permission issue (but permission shows as granted)"
      );
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    return null;
  }
};

export const setupMessageListener = async (callback) => {
  const messaging = await getMessaging();
  if (!messaging) {
    console.warn("Firebase messaging is not initialized");
    return;
  }

  onMessage(messaging, callback);
};

// Generate or retrieve device ID
export const getDeviceId = () => {
  const deviceIdKey = "fcm_device_id";
  let deviceId = localStorage.getItem(deviceIdKey);

  if (!deviceId) {
    // Generate a unique device ID
    deviceId = `device_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem(deviceIdKey, deviceId);
    console.log("✅ Generated new device ID:", deviceId);
  }

  return deviceId;
};

// Get user ID from token
export const getUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No token found, cannot extract user ID");
      return null;
    }

    // Decode JWT token to extract user ID
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      console.warn("⚠️ Invalid token format");
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decodedToken = JSON.parse(jsonPayload);

    const userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
    return userId;
  } catch (error) {
    console.error("❌ Error extracting user ID from token:", error);
    return null;
  }
};

// Register FCM token with backend
export const registerFCMToken = async (fcmToken) => {
  try {
    const userId = getUserId();
    if (!userId) {
      console.warn("⚠️ Cannot register FCM token: User ID not available");
      return { success: false, error: "User ID not available" };
    }

    const deviceId = getDeviceId();
    const token = localStorage.getItem("token");

    // Determine API endpoint - prefer notification service, fallback to gateway
    const apiBaseUrl =
      process.env.REACT_APP_NOTIFICATION_SERVICE_URL ||
      process.env.REACT_APP_GATEWAY_URL ||
      process.env.REACT_APP_POLICY_SERVICE_URL;

    if (!apiBaseUrl) {
      console.error("❌ No API base URL configured");
      return { success: false, error: "API base URL not configured" };
    }

    // Construct endpoint URL
    let endpoint = `${apiBaseUrl}/firebase/register-token`;

    // If using gateway URL, prepend /api
    if (
      apiBaseUrl === process.env.REACT_APP_GATEWAY_URL &&
      !apiBaseUrl.includes("/api")
    ) {
      endpoint = `${apiBaseUrl}/api/firebase/register-token`;
    }

    console.log("📤 Registering FCM token:", {
      endpoint,
      userId,
      deviceId,
      tokenLength: fcmToken?.length,
    });

    const response = await axios.post(
      endpoint,
      {
        fcmToken,
        userId,
        deviceId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      console.log("✅ FCM token registered successfully");
      return { success: true, data: response.data };
    } else {
      console.warn("⚠️ Unexpected response status:", response.status);
      return { success: false, error: `Unexpected status: ${response.status}` };
    }
  } catch (error) {
    console.error("❌ Error registering FCM token:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
    };
  }
};

// Generate FCM token and register it
export const generateAndRegisterFCMToken = async () => {
  try {
    console.log("🔄 Generating FCM token...");
    const fcmToken = await getFCMToken();

    if (!fcmToken) {
      console.warn("⚠️ Failed to generate FCM token");
      return { success: false, error: "Failed to generate FCM token" };
    }

    console.log("✅ FCM token generated, registering with backend...");
    const registrationResult = await registerFCMToken(fcmToken);

    return {
      success: registrationResult.success,
      fcmToken,
      registrationResult,
    };
  } catch (error) {
    console.error("❌ Error in generateAndRegisterFCMToken:", error);
    return {
      success: false,
      error: error?.message || "Unknown error",
    };
  }
};
