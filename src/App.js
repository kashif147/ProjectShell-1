import "./App.css";
import "./styles/Utilites.css";
import "./styles/GlobalChatbot.css";
import Entry from "./Entry";
import React from "react";
import AuthProvider from "./pages/auth/AuthProvider";
import { ChatbotProvider } from "./context/ChatbotContext";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const loadWorklet = async () => {
      if ("sharedStorage" in window) {
        try {
          // 👇 Load your worklet from public
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
    <AuthProvider>
      <ChatbotProvider>
        <div className="App">
          <div className="">
            {/* <Login/> */}
            <Entry />
          </div>
        </div>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;
