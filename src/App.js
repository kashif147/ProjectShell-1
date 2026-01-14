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

function App() {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const hasFetchedRef = useRef(false);

  const {
    hierarchicalLookups,
    hierarchicalLookupsLoading,
    hierarchicalLookupsError,
  } = useSelector((state) => state.hierarchicalLookups);

  const { lookups, loading: lookupsLoading } = useSelector(
    (state) => state.lookups
  );

  // Make AntD notification globally available for MyAlert.js
  notification.success = api.success;
  notification.error = api.error;
  notification.info = api.info;
  notification.warning = api.warning;

  useEffect(() => {
    // Only fetch lookups if user is authenticated (token exists)
    // This prevents API calls when landing on the login page
    const token = localStorage.getItem("token");
    if (!token) {
      hasFetchedRef.current = false;
      return;
    }

    // Only fetch if data doesn't exist, not already loading, and haven't fetched in this session
    if (
      !lookupsLoading &&
      (!lookups || lookups.length === 0) &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      dispatch(getAllLookups());
    }

    // Only fetch hierarchical if data doesn't exist and not already loading
    if (
      !hierarchicalLookupsLoading &&
      (!hierarchicalLookups || hierarchicalLookups.length === 0)
    ) {
      dispatch(getHierarchicalLookups());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  useEffect(() => {
    const loadWorklet = async () => {
      // Shared Storage API is only available in secure contexts and specific origins
      if ("sharedStorage" in window && window.location.protocol === "https:") {
        try {
          // Check if worklet.addModule is available
          if (window.sharedStorage?.worklet?.addModule) {
            await window.sharedStorage.worklet.addModule(
              "/shared-storage-worklet.js"
            );
            
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
          <ChatbotProvider>
            <div className="App">
              <Entry />
            </div>
          </ChatbotProvider>
        </FCMProvider>
      </AuthProvider>
    </AntApp>
  );
}

export default App;
