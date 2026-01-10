import { getMessagingInstance } from "../config/firebase";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

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
    // Use navigator.serviceWorker.ready - Firebase requires root scope registration
    // This aligns with Firebase's internal expectations
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

    console.log("🔍 getMessaging: Using service worker registration:", {
      scope: registration.scope,
      active: registration.active?.state,
    });

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
    console.log("🔄 getFCMToken: Starting token retrieval...");

    // Check notification permission
    if (Notification.permission !== "granted") {
      console.error(
        "❌ getFCMToken: Notification permission is not granted:",
        Notification.permission
      );
      return null;
    }

    // Check service worker controller
    if (!navigator.serviceWorker.controller) {
      console.error(
        "❌ getFCMToken: Service worker is not controlling the page"
      );
      return null;
    }

    console.log("🔄 getFCMToken: Getting messaging instance...");
    const messaging = await getMessaging();
    if (!messaging) {
      console.warn("❌ getFCMToken: Firebase messaging is not initialized");
      console.warn("❌ This could be due to:");
      console.warn("   - Service worker not ready");
      console.warn("   - Service worker registration mismatch");
      console.warn("   - Firebase initialization error");
      return null;
    }
    console.log("✅ getFCMToken: Messaging instance available");

    if (!vapidKey) {
      console.error(
        "❌ getFCMToken: VAPID key is missing! Cannot generate token."
      );
      console.error(
        "❌ Please set REACT_APP_FIREBASE_VAPID_KEY in your .env file"
      );
      return null;
    }

    console.log(
      "🔑 getFCMToken: VAPID key:",
      vapidKey ? `Present (${vapidKey.substring(0, 20)}...)` : "Missing"
    );
    console.log("🎫 getFCMToken: Requesting token from Firebase...");
    console.log(
      "🎫 getFCMToken: Calling getToken with messaging and vapidKey..."
    );
    console.log(
      "🎫 getFCMToken: Service worker controller scriptURL:",
      navigator.serviceWorker.controller.scriptURL
    );

    // Verify service worker registration (using root scope)
    const currentRegistration = await navigator.serviceWorker.ready;
    if (currentRegistration) {
      console.log(
        "🎫 getFCMToken: Current SW registration scope:",
        currentRegistration.scope
      );
      console.log(
        "🎫 getFCMToken: Current SW active state:",
        currentRegistration.active?.state
      );
      console.log(
        "🎫 getFCMToken: Current SW scriptURL:",
        currentRegistration.active?.scriptURL
      );
    } else {
      console.warn(
        "⚠️ getFCMToken: Could not get current service worker registration"
      );
      return null;
    }

    // Ensure service worker is active and controlling
    if (!navigator.serviceWorker.controller) {
      console.error(
        "❌ getFCMToken: Service worker is not controlling the page at this point"
      );
      return null;
    }

    let token;
    try {
      token = await getToken(messaging, { vapidKey });
    } catch (tokenError) {
      console.error("❌ getFCMToken: Error calling getToken():", tokenError);
      console.error("❌ Error code:", tokenError.code);
      console.error("❌ Error message:", tokenError.message);
      console.error("❌ Error name:", tokenError.name);
      console.error("❌ Full error:", tokenError);

      // Check for specific Firebase error codes
      if (tokenError.code === "messaging/token-subscribe-failed") {
        console.error("❌ This usually means:");
        console.error("   - Service worker registration doesn't match");
        console.error("   - VAPID key is incorrect");
        console.error("   - Service worker scope mismatch");
      }

      throw tokenError; // Re-throw to be caught by outer catch
    }

    console.log("📝 getFCMToken: getToken returned:", token);
    console.log("📝 getFCMToken: Token type:", typeof token);
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
      console.warn("   - Firebase project configuration mismatch");
      console.warn("   - Service worker not registered at root scope (/)");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    console.error("❌ Error code:", error?.code);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error name:", error?.name);
    console.error("❌ Full error object:", error);
    if (error?.stack) {
      console.error("❌ Error stack:", error.stack);
    }
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

// Decode JWT token helper
const decodeToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    const base64Url = token.split(".")[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return null;
  }
};

// Get user ID from token
export const getUserId = () => {
  try {
    const decodedToken = decodeToken();
    if (!decodedToken) {
      console.warn("⚠️ No token found or invalid token, cannot extract user ID");
      return null;
    }

    const userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
    return userId;
  } catch (error) {
    console.error("❌ Error extracting user ID from token:", error);
    return null;
  }
};

// Get tenant ID from token
export const getTenantId = () => {
  try {
    const decodedToken = decodeToken();
    if (!decodedToken) {
      console.warn("⚠️ No token found or invalid token, cannot extract tenant ID");
      return null;
    }

    const tenantId = decodedToken.tenantId || decodedToken.tenant_id;
    return tenantId;
  } catch (error) {
    console.error("❌ Error extracting tenant ID from token:", error);
    return null;
  }
};

// Detect platform (web, ios, android)
export const getPlatform = () => {
  try {
    // Since this is a React web app, default to "web"
    // Only check for mobile platforms if running in a hybrid app (Cordova/Capacitor)
    if (typeof window === "undefined") {
      return "web";
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check if running in Capacitor/Cordova (hybrid app)
    if (window.Capacitor || window.cordova) {
      // Check for iOS
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "ios";
      }
      // Check for Android
      if (/android/i.test(userAgent)) {
        return "android";
      }
    }

    // For web browser, always return "web"
    // This includes mobile web browsers (Chrome on Android, Safari on iOS)
    // FCM for web uses the same token regardless of device OS
    return "web";
  } catch (error) {
    console.error("❌ Error detecting platform:", error);
    return "web"; // Default to web
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

    const tenantId = getTenantId();
    if (!tenantId) {
      console.warn("⚠️ Cannot register FCM token: Tenant ID not available");
      return { success: false, error: "Tenant ID not available" };
    }

    const deviceId = getDeviceId();
    const platform = getPlatform();
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
      tenantId,
      deviceId,
      platform,
      tokenLength: fcmToken?.length,
    });

    const response = await axios.post(
      endpoint,
      {
        fcmToken,
        userId,
        tenantId,
        deviceId,
        platform,
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
    console.log("🔄 generateAndRegisterFCMToken: Starting token generation...");

    // Verify service worker is controlling
    if (!navigator.serviceWorker.controller) {
      const errorMsg =
        "Service Worker is not controlling the page. Cannot generate token.";
      console.error("❌", errorMsg);
      return { success: false, error: errorMsg };
    }

    // Check notification permission
    if (Notification.permission !== "granted") {
      const errorMsg = `Notification permission is "${Notification.permission}", not "granted"`;
      console.error("❌", errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log("🔄 generateAndRegisterFCMToken: Calling getFCMToken()...");
    const fcmToken = await getFCMToken();
    console.log(
      "🔄 generateAndRegisterFCMToken: getFCMToken() returned:",
      fcmToken ? "Token received" : "null/undefined"
    );

    if (!fcmToken) {
      console.warn(
        "⚠️ generateAndRegisterFCMToken: Failed to generate FCM token"
      );
      return { success: false, error: "Failed to generate FCM token" };
    }

    console.log(
      "✅ generateAndRegisterFCMToken: FCM token generated, registering with backend..."
    );
    const registrationResult = await registerFCMToken(fcmToken);

    return {
      success: registrationResult.success,
      fcmToken,
      registrationResult,
    };
  } catch (error) {
    console.error("❌ Error in generateAndRegisterFCMToken:", error);
    console.error("❌ Error stack:", error?.stack);
    console.error("❌ Error details:", {
      code: error?.code,
      message: error?.message,
      name: error?.name,
    });
    return {
      success: false,
      error: error?.message || "Unknown error",
    };
  }
};
