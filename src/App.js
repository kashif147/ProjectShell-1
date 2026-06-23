import "./App.css";
import "./styles/Utilites.css";
import "./styles/GlobalChatbot.css";
import Entry from "./Entry";
import React, { useEffect, useRef } from "react";
import AuthProvider from "./pages/auth/AuthProvider";
import { ChatbotProvider } from "./context/ChatbotContext";
import { FCMProvider } from "./context/FCMContext";
import { App as AntApp, notification } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "./features/LookupsSlice";
import { getHierarchicalLookups } from "./features/GetLocationWithHierarky";
import "antd/dist/reset.css";
import { NotificationProvider } from "./context/NotificationContext";
import { ProfileRealtimeProvider } from "./context/ProfileRealtimeContext";
import { TenantBrandingProvider } from "./context/TenantBrandingContext";

function App() {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const bootstrapRef = useRef({ lookups: false, hierarchical: false });

  const {
    hierarchicalLookups,
    hierarchicalLookupsLoading,
  } = useSelector((state) => state.hierarchicalLookups);

  const { lookups, lookupsloading: lookupsLoading } = useSelector(
    (state) => state.lookups,
  );

  // Make AntD notification globally available for MyAlert.js
  notification.success = api.success;
  notification.error = api.error;
  notification.info = api.info;
  notification.warning = api.warning;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      bootstrapRef.current = { lookups: false, hierarchical: false };
      return;
    }

    if (
      !lookupsLoading &&
      (!lookups || lookups.length === 0) &&
      !bootstrapRef.current.lookups
    ) {
      bootstrapRef.current.lookups = true;
      dispatch(getAllLookups());
    }

    if (
      !hierarchicalLookupsLoading &&
      (!hierarchicalLookups || hierarchicalLookups.length === 0) &&
      !bootstrapRef.current.hierarchical
    ) {
      bootstrapRef.current.hierarchical = true;
      dispatch(getHierarchicalLookups());
    }
  }, [
    dispatch,
    lookupsLoading,
    lookups,
    hierarchicalLookupsLoading,
    hierarchicalLookups,
  ]);
  useEffect(() => {
    const loadWorklet = async () => {
      // Shared Storage API is only available in secure contexts and specific origins
      if ("sharedStorage" in window && window.location.protocol === "https:") {
        try {
          // Check if worklet.addModule is available
          if (window.sharedStorage?.worklet?.addModule) {
            await window.sharedStorage.worklet.addModule(
              "/shared-storage-worklet.js",
            );
            console.log("✅ Shared Storage worklet loaded");
          }
        } catch (err) {
          // Silently fail - Shared Storage is not available in localhost/development
          // This is expected behavior and not an error
        }
      }
    };
    loadWorklet();
  }, []);

  return (
    <AntApp>
      {contextHolder}
      <AuthProvider>
        <FCMProvider>
          <NotificationProvider>
            <ProfileRealtimeProvider>
              <ChatbotProvider>
                <TenantBrandingProvider>
                  <div className="App">
                    <Entry />
                  </div>
                </TenantBrandingProvider>
              </ChatbotProvider>
            </ProfileRealtimeProvider>
          </NotificationProvider>
        </FCMProvider>
      </AuthProvider>
    </AntApp>
  );
}

export default App;
