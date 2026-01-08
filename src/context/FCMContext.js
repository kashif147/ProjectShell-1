import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getFCMToken,
  setupMessageListener,
  initializeMessaging,
  registerFCMToken,
  generateAndRegisterFCMToken,
} from "../services/firebaseMessaging";
import { notification } from "antd";

const FCMContext = createContext();

export const useFCM = () => {
  const context = useContext(FCMContext);
  if (!context) {
    throw new Error("useFCM must be used within FCMProvider");
  }
  return context;
};

export const FCMProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(
    localStorage.getItem("fcmToken") || null
  );
  const [pushAvailable, setPushAvailable] = useState(false);
  const initializationRef = React.useRef(false);
  const tokenRetrievalRef = React.useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    // Listen for controller changes (when service worker takes control)
    const handleControllerChange = () => {
      if (navigator.serviceWorker.controller) {
        console.log(
          "✅ Service Worker controller changed - now controlling the page"
        );
        setPushAvailable(true);
        sessionStorage.removeItem("sw-reload-scheduled");
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    const registerServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        console.warn("❌ Service Worker not supported");
        return;
      }

      try {
        // Check if service worker is already controlling
        if (navigator.serviceWorker.controller) {
          console.log("✅ Service Worker already controlling the page");
          setPushAvailable(true);
          sessionStorage.removeItem("sw-reload-scheduled");
          return;
        }

        // Clean up any redundant service workers across all scopes
        try {
          const allRegistrations =
            await navigator.serviceWorker.getRegistrations();
          for (const reg of allRegistrations) {
            if (
              reg.active?.state === "redundant" ||
              (!reg.active && !reg.waiting && !reg.installing)
            ) {
              console.log(
                `🗑️ Cleaning up redundant service worker at scope: ${reg.scope}`
              );
              await reg.unregister().catch((err) => {
                console.warn(
                  `⚠️ Could not unregister service worker at ${reg.scope}:`,
                  err
                );
              });
            }
          }
        } catch (error) {
          console.warn(
            "⚠️ Error checking all service worker registrations:",
            error
          );
        }

        // Step 1: Check for existing registration at Firebase scope first
        let registration = await navigator.serviceWorker.getRegistration(
          "/firebase-cloud-messaging-push-scope"
        );

        // Also check root scope (Firebase sometimes uses root)
        if (!registration) {
          registration = await navigator.serviceWorker.getRegistration("/");
        }

        // Check if existing registration has redundant/error states
        if (registration) {
          const swState =
            registration.active?.state ||
            registration.waiting?.state ||
            registration.installing?.state;
          console.log("📊 Existing Service Worker state:", swState);

          // If active worker is redundant, unregister and re-register
          if (
            registration.active?.state === "redundant" ||
            (!registration.active &&
              !registration.waiting &&
              !registration.installing)
          ) {
            console.log(
              "🗑️ Service Worker is redundant or invalid, unregistering..."
            );
            try {
              await registration.unregister();
              console.log("✅ Redundant service worker unregistered");
              registration = null;
            } catch (error) {
              console.error("❌ Error unregistering service worker:", error);
            }
          }
        }

        if (!registration) {
          // Step 2: Register service worker if not already registered or was unregistered
          registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            {
              scope: "/firebase-cloud-messaging-push-scope",
            }
          );
          console.log("✅ Service Worker registered:", registration.scope);
        } else {
          console.log(
            "✅ Service Worker already registered:",
            registration.scope
          );

          // Double-check that the registration is valid
          if (
            !registration.active &&
            !registration.waiting &&
            !registration.installing
          ) {
            console.log(
              "⚠️ Registration exists but has no active/waiting/installing worker, re-registering..."
            );
            try {
              await registration.unregister();
              registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                {
                  scope: "/firebase-cloud-messaging-push-scope",
                }
              );
              console.log(
                "✅ Service Worker re-registered:",
                registration.scope
              );
            } catch (error) {
              console.error("❌ Error re-registering service worker:", error);
            }
          }
        }

        // Step 3: Handle waiting service worker (needs activation)
        if (registration.waiting) {
          console.log("🔄 Found waiting service worker, activating...");

          // Send skipWaiting message to activate immediately
          registration.waiting.postMessage({ type: "SKIP_WAITING" });

          // Wait a bit for activation
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Check if controller appeared
          if (navigator.serviceWorker.controller) {
            console.log("✅ Service Worker activated and now controlling");
            setPushAvailable(true);
            sessionStorage.removeItem("sw-reload-scheduled");
            return;
          } else {
            console.log(
              "🔄 Service Worker activated but not controlling yet, will reload..."
            );
            if (!sessionStorage.getItem("sw-reload-scheduled")) {
              sessionStorage.setItem("sw-reload-scheduled", "true");
              setTimeout(() => window.location.reload(), 1000);
              return;
            }
          }
        }

        // Step 4: Handle installing service worker
        if (registration.installing) {
          console.log("⏳ Service Worker is installing...");

          await new Promise((resolve) => {
            const handleStateChange = async (e) => {
              const sw = e.target;
              console.log(`🔄 Service Worker state: ${sw.state}`);

              if (sw.state === "installed" || sw.state === "activated") {
                sw.removeEventListener("statechange", handleStateChange);
                console.log(`✅ Service Worker ${sw.state}`);

                // If there's no controller, we need to activate
                if (!navigator.serviceWorker.controller) {
                  console.log("🔄 Service worker needs activation...");

                  // Check if it became waiting
                  let updatedReg =
                    await navigator.serviceWorker.getRegistration(
                      "/firebase-cloud-messaging-push-scope"
                    );
                  if (!updatedReg) {
                    updatedReg = await navigator.serviceWorker.getRegistration(
                      "/"
                    );
                  }

                  if (updatedReg?.waiting) {
                    console.log("🔄 Activating waiting service worker...");
                    updatedReg.waiting.postMessage({ type: "SKIP_WAITING" });

                    // Wait for controller change
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    if (!navigator.serviceWorker.controller) {
                      console.log(
                        "🔄 Reloading page to activate service worker..."
                      );
                      if (!sessionStorage.getItem("sw-reload-scheduled")) {
                        sessionStorage.setItem("sw-reload-scheduled", "true");
                        setTimeout(() => window.location.reload(), 1000);
                      }
                      resolve();
                      return;
                    }
                  }
                }

                if (navigator.serviceWorker.controller) {
                  console.log(
                    "✅ Service Worker now controlling after installation"
                  );
                  setPushAvailable(true);
                  sessionStorage.removeItem("sw-reload-scheduled");
                }
                resolve();
              }
            };

            registration.installing.addEventListener(
              "statechange",
              handleStateChange
            );

            // Timeout fallback
            setTimeout(() => {
              registration.installing?.removeEventListener(
                "statechange",
                handleStateChange
              );
              resolve();
            }, 10000);
          });
        }

        // Step 5: Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log("✅ Service Worker is ready");

        // Step 6: Check registration state
        let finalRegistration = await navigator.serviceWorker.getRegistration(
          "/firebase-cloud-messaging-push-scope"
        );
        if (!finalRegistration) {
          finalRegistration = await navigator.serviceWorker.getRegistration(
            "/"
          );
        }

        if (finalRegistration) {
          console.log("📊 Service Worker Registration State:", {
            active: finalRegistration.active?.state || "none",
            waiting: finalRegistration.waiting?.state || "none",
            installing: finalRegistration.installing?.state || "none",
            controller: navigator.serviceWorker.controller
              ? "present"
              : "missing",
          });
        }

        // Step 7: Final check if controller exists
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (navigator.serviceWorker.controller) {
          console.log("✅ Service Worker is controlling the page");
          setPushAvailable(true);
          sessionStorage.removeItem("sw-reload-scheduled");
        } else {
          console.warn("⚠️ Service Worker registered but not controlling page");

          // Check all possible states and force activation/reload
          let currentRegistration =
            await navigator.serviceWorker.getRegistration(
              "/firebase-cloud-messaging-push-scope"
            );
          if (!currentRegistration) {
            currentRegistration = await navigator.serviceWorker.getRegistration(
              "/"
            );
          }

          if (currentRegistration) {
            // If there's a waiting service worker, activate it
            if (currentRegistration.waiting) {
              console.log("🔄 Found waiting service worker, activating...");
              currentRegistration.waiting.postMessage({ type: "SKIP_WAITING" });

              // Wait for activation
              await new Promise((resolve) => setTimeout(resolve, 1500));

              if (navigator.serviceWorker.controller) {
                console.log(
                  "✅ Service Worker now controlling after activation"
                );
                setPushAvailable(true);
                sessionStorage.removeItem("sw-reload-scheduled");
                return;
              }
            }

            // If there's an active service worker but no controller, we need a reload
            if (
              currentRegistration.active &&
              !navigator.serviceWorker.controller
            ) {
              console.log(
                "🔄 Service Worker is active but not controlling - reload required"
              );
              if (!sessionStorage.getItem("sw-reload-scheduled")) {
                sessionStorage.setItem("sw-reload-scheduled", "true");
                console.log(
                  "🔄 Reloading page in 1 second to activate service worker..."
                );
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
                return;
              }
            }

            // If service worker exists but isn't controlling, force reload
            if (!sessionStorage.getItem("sw-reload-scheduled")) {
              console.log(
                "🔄 Service Worker registered but not controlling - forcing reload..."
              );
              sessionStorage.setItem("sw-reload-scheduled", "true");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
              return;
            }
          }

          setPushAvailable(false);
        }
      } catch (error) {
        console.error("❌ Error registering service worker:", error);
        setPushAvailable(false);
      }
    };

    // Only register if we haven't scheduled a reload
    if (!sessionStorage.getItem("sw-reload-scheduled")) {
      registerServiceWorker();
    }

    // Periodic check to ensure service worker takes control
    const checkInterval = setInterval(async () => {
      if (navigator.serviceWorker.controller) {
        clearInterval(checkInterval);
        setPushAvailable(true);
        sessionStorage.removeItem("sw-reload-scheduled");
        return;
      }

      // If no controller after 3 seconds, check registration and force reload if needed
      let registration = await navigator.serviceWorker
        .getRegistration("/firebase-cloud-messaging-push-scope")
        .catch(() => null);
      if (!registration) {
        registration = await navigator.serviceWorker
          .getRegistration("/")
          .catch(() => null);
      }

      if (registration && !navigator.serviceWorker.controller) {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        if (!sessionStorage.getItem("sw-reload-scheduled")) {
          console.log(
            "🔄 Periodic check: Service worker not controlling, reloading..."
          );
          sessionStorage.setItem("sw-reload-scheduled", "true");
          clearInterval(checkInterval);
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    }, 1000);

    // Clear interval after 10 seconds (should have reloaded by then)
    setTimeout(() => clearInterval(checkInterval), 10000);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  useEffect(() => {
    // Set up message listener when we have a token
    if (!fcmToken) return;

    setupMessageListener((payload) => {
      notification.info({
        message: payload.notification?.title || "New Notification",
        description: payload.notification?.body || "",
        duration: 4.5,
      });
    }).catch((error) => {
      console.error("Error setting up message listener:", error);
    });
  }, [fcmToken]);

  useEffect(() => {
    // Automatically retrieve FCM token if permission is already granted
    const retrieveTokenIfPermissionGranted = async () => {
      // Prevent multiple executions
      if (tokenRetrievalRef.current) {
        return;
      }

      // Wait for service worker to be ready and controlling
      if (!pushAvailable || !navigator.serviceWorker.controller) {
        return;
      }

      // Check if notification permission is already granted
      if (!("Notification" in window)) {
        return;
      }

      const permission = Notification.permission;
      if (permission !== "granted") {
        console.log(
          `📱 Notification permission is "${permission}". Token will be retrieved after user grants permission.`
        );
        return;
      }

      // Prevent retry if we already have a token in localStorage
      // But still allow refresh if token is missing in state
      const existingToken = localStorage.getItem("fcmToken");
      if (existingToken && fcmToken === existingToken) {
        console.log("✅ FCM Token already exists, skipping retrieval");
        tokenRetrievalRef.current = true;
        return;
      }

      try {
        tokenRetrievalRef.current = true;
        console.log(
          "🔄 Auto-retrieving FCM token (permission already granted)..."
        );

        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;
        if (!registration) {
          console.error("❌ Service Worker registration not found");
          tokenRetrievalRef.current = false;
          return;
        }

        // Initialize Firebase messaging
        const messaging = await initializeMessaging(registration);
        if (!messaging) {
          console.error("❌ Failed to initialize Firebase messaging");
          tokenRetrievalRef.current = false;
          return;
        }

        // Get FCM token and register it
        const result = await generateAndRegisterFCMToken();
        if (result.success && result.fcmToken) {
          setFcmToken(result.fcmToken);
          localStorage.setItem("fcmToken", result.fcmToken);
          console.log(
            "✅ FCM Token auto-retrieved and saved:",
            result.fcmToken.substring(0, 50) + "..."
          );
          if (result.registrationResult?.success) {
            console.log("✅ FCM Token registered with backend");
          } else {
            console.warn(
              "⚠️ FCM Token generated but registration failed:",
              result.registrationResult?.error
            );
          }
        } else {
          console.warn("⚠️ Failed to retrieve FCM token");
          tokenRetrievalRef.current = false;
        }
      } catch (error) {
        console.error("❌ Error auto-retrieving FCM token:", error);
        tokenRetrievalRef.current = false;
      }
    };

    retrieveTokenIfPermissionGranted();
  }, [pushAvailable, fcmToken]);

  // Step 3: Only allow FCM token generation from user action
  // This must be called from a button click, NOT automatically
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("❌ Notification API not supported");
      return null;
    }

    // Verify service worker is controlling the page
    if (!navigator.serviceWorker.controller) {
      console.error(
        "❌ Service Worker is not controlling the page. Push will fail."
      );
      console.error(
        "💡 Reload the page to allow the service worker to take control."
      );
      return null;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("❌ Notification permission denied");
        return null;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        console.error("❌ Service Worker registration not found");
        return null;
      }

      // Initialize Firebase messaging with the registration
      const messaging = await initializeMessaging(registration);
      if (!messaging) {
        console.error("❌ Failed to initialize Firebase messaging");
        return null;
      }

      // Get FCM token and register it
      const result = await generateAndRegisterFCMToken();
      if (result.success && result.fcmToken) {
        setFcmToken(result.fcmToken);
        localStorage.setItem("fcmToken", result.fcmToken);
        console.log("✅ FCM Token saved:", result.fcmToken);
        if (result.registrationResult?.success) {
          console.log("✅ FCM Token registered with backend");
        } else {
          console.warn(
            "⚠️ FCM Token generated but registration failed:",
            result.registrationResult?.error
          );
        }
        return result.fcmToken;
      }

      return null;
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return null;
    }
  };

  const refreshToken = async () => {
    // Verify service worker is controlling the page
    if (!navigator.serviceWorker.controller) {
      console.error("❌ Service Worker is not controlling the page");
      return null;
    }

    const result = await generateAndRegisterFCMToken();
    if (result.success && result.fcmToken) {
      setFcmToken(result.fcmToken);
      localStorage.setItem("fcmToken", result.fcmToken);
      if (result.registrationResult?.success) {
        console.log("✅ FCM Token refreshed and registered with backend");
      } else {
        console.warn(
          "⚠️ FCM Token refreshed but registration failed:",
          result.registrationResult?.error
        );
      }
      return result.fcmToken;
    }
    return null;
  };

  return (
    <FCMContext.Provider
      value={{
        fcmToken,
        pushAvailable,
        requestNotificationPermission,
        refreshToken,
      }}
    >
      {children}
    </FCMContext.Provider>
  );
};
