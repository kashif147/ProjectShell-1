# FCM Debug Instructions

## Quick Debug - Paste in Browser Console

If `window.debugFCM()` doesn't work, paste this directly in your browser console:

```javascript
(async () => {
  console.log("=== FCM Debug ===");
  
  // Check notification permission
  const permission = Notification.permission;
  console.log("Notification permission:", permission);
  
  if (permission !== "granted") {
    console.warn("⚠️ Permission not granted. Requesting...");
    const result = await Notification.requestPermission();
    console.log("Permission result:", result);
  }
  
  // Check service worker
  const firebaseScope = "/firebase-cloud-messaging-push-scope";
  const registration = await navigator.serviceWorker.getRegistration(firebaseScope);
  console.log("Service Worker:", registration ? "Found" : "Not found");
  
  // Check localStorage
  const token = localStorage.getItem("fcmToken");
  console.log("Token in localStorage:", token || "NOT FOUND");
  
  // Try to get token
  try {
    const { getFCMToken } = await import("/src/services/firebaseMessaging.js");
    const newToken = await getFCMToken();
    console.log("New token:", newToken);
    if (newToken) {
      localStorage.setItem("fcmToken", newToken);
      console.log("✅ Token saved!");
    }
  } catch (e) {
    console.error("Error:", e);
  }
})();
```

## Check Console Logs

Look for these logs in the browser console when the page loads:
1. "Service Worker registered" or "Service Worker already registered"
2. "Service Worker ready"
3. "Firebase messaging initialized"
4. "🔔 Requesting notification permission..."
5. "📱 Notification permission: granted/denied/default"
6. "✅ FCM Token saved to localStorage" (if successful)
7. "❌ No token received from requestPermission" (if failed)

## Common Issues

1. **Permission Denied**: Click the lock icon in browser address bar → Allow notifications
2. **Service Worker Not Found**: Check DevTools → Application → Service Workers
3. **No Console Logs**: Check if FCMProvider is in your component tree (App.js)

