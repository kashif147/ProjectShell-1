// Utility function to check FCM service worker status
// Run this in browser console: window.debugFCM()
// NOTE: This tool only checks status - it does NOT get tokens
// Tokens must be requested via user action (button click) using requestNotificationPermission()

const debugFCM = async () => {
  console.log("=== FCM Debug Tool (Status Check Only) ===");
  console.log("⚠️ NOTE: This tool does NOT get tokens. Use requestNotificationPermission() from a button click.");
  
  // Check if service worker is supported
  if (!("serviceWorker" in navigator)) {
    console.error("❌ Service Worker not supported");
    return;
  }
  console.log("✅ Service Worker supported");

  // Check if Notification is supported
  if (!("Notification" in window)) {
    console.error("❌ Notification API not supported");
    return;
  }
  console.log("✅ Notification API supported");

  // Check notification permission
  const permission = Notification.permission;
  console.log("📱 Notification permission:", permission);
  
  if (permission === "denied") {
    console.error("❌ Notification permission is denied. Please enable it in browser settings.");
  }

  // CRITICAL CHECK: Is service worker controlling the page?
  const controller = navigator.serviceWorker.controller;
  console.log("\n🎯 SERVICE WORKER CONTROLLER STATUS:");
  if (!controller) {
    console.error("❌ SERVICE WORKER IS NOT CONTROLLING THE PAGE");
    console.error("💡 This is why push registration fails.");
    console.error("💡 The page must reload for the service worker to take control.");
    console.error("💡 After reload, check again: navigator.serviceWorker.controller");
    console.log("\n=== End FCM Debug (Controller check failed) ===");
    return;
  }
  console.log("✅ Service Worker IS controlling the page (push can work)");
  console.log("   Controller script URL:", controller.scriptURL);
  console.log("   Controller state:", controller.state);

  // Check service worker registration at Firebase scope
  let registration;
  try {
    const serviceWorkerScope = "/firebase-cloud-messaging-push-scope";
    registration = await navigator.serviceWorker.getRegistration(serviceWorkerScope);
    console.log("\n🔧 SERVICE WORKER REGISTRATION:");
    console.log("   Status:", registration ? "✅ Found" : "❌ Not found");
    
    if (!registration) {
      console.warn("⚠️ No service worker found at Firebase scope");
      console.warn("💡 Service worker should be registered by FCMContext on app load");
      console.log("\n=== End FCM Debug (No registration) ===");
      return;
    }
    
    console.log("   Scope:", registration.scope);
    console.log("   Active:", registration.active ? "✅ Yes" : "❌ No");
    console.log("   State:", registration.active?.state || "Unknown");
    console.log("   Installing:", registration.installing ? registration.installing.state : "None");
    console.log("   Waiting:", registration.waiting ? registration.waiting.state : "None");
    console.log("   Script URL:", registration.active?.scriptURL || "N/A");
  } catch (error) {
    console.error("❌ Service Worker registration error:", error);
    return;
  }

  // Check localStorage for existing token
  const storedToken = localStorage.getItem("fcmToken");
  console.log("\n💾 TOKEN STATUS:");
  console.log("   In localStorage:", storedToken ? `✅ Found (${storedToken.substring(0, 30)}...)` : "❌ Not found");

  // Summary
  console.log("\n📋 SUMMARY:");
  console.log("   Service Worker Controller:", controller ? "✅ Present" : "❌ Missing");
  console.log("   Service Worker Registration:", registration?.active ? "✅ Active" : "❌ Inactive");
  console.log("   Notification Permission:", permission);
  console.log("   FCM Token:", storedToken ? "✅ Present" : "❌ Missing");
  
  console.log("\n💡 TO GET TOKEN:");
  console.log("   1. Ensure service worker controller is present (✅ above)");
  console.log("   2. Call requestNotificationPermission() from a button click handler");
  console.log("   3. Do NOT call it automatically - it must be from user action");
  
  console.log("\n=== End FCM Debug ===");
};

// Make it available globally
if (typeof window !== "undefined") {
  window.debugFCM = debugFCM;
}

export default debugFCM;
