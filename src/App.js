import "./App.css";
import "./styles/Utilites.css";
import "./styles/GlobalChatbot.css";
import Entry from "./Entry";
import React, { useEffect } from "react";
import AuthProvider from "./pages/auth/AuthProvider";
import { ChatbotProvider } from "./context/ChatbotContext";
import { App as AntApp, notification } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "./features/LookupsSlice";
import { getHierarchicalLookups } from "./features/GetLocationWithHierarky";
import "antd/dist/reset.css";

function App() {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const { 
    hierarchicalLookups, 
    hierarchicalLookupsLoading, 
    hierarchicalLookupsError 
  } = useSelector((state) => state.hierarchicalLookups);
  // Make AntD notification globally available for MyAlert.js
  notification.success = api.success;
  notification.error = api.error;
  notification.info = api.info;
  notification.warning = api.warning;
  useEffect(() => {
    dispatch(getAllLookups())
  }, [])
    useEffect(() => {
    dispatch(getHierarchicalLookups());
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
        <ChatbotProvider>
          <div className="App">
            <Entry />
          </div>
        </ChatbotProvider>
      </AuthProvider>
    </AntApp>
  );
}

export default App;

