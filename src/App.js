import "./App.css";
import "./styles/Utilites.css";
import "./styles/GlobalChatbot.css";
import Entry from "./Entry";
import React, { useEffect } from "react";
import AuthProvider from "./pages/auth/AuthProvider";
import { ChatbotProvider } from "./context/ChatbotContext";
import { App as AntApp, notification } from "antd";
import "antd/dist/reset.css";

function App() {
  const [api, contextHolder] = notification.useNotification();

  // Make AntD notification globally available for MyAlert.js
  notification.success = api.success;
  notification.error = api.error;
  notification.info = api.info;
  notification.warning = api.warning;

  useEffect(() => {
    const loadWorklet = async () => {
      if ("sharedStorage" in window) {
        try {
          await window.sharedStorage.worklet.addModule(
            "/shared-storage-worklet.js"
          );
          console.log("✅ Shared Storage worklet loaded");
        } catch (err) {
          console.error("❌ Error loading worklet:", err);
        }
      } else {
        console.warn("Shared Storage API not supported in this browser.");
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

