// src/AuthProvider.js

import React, { useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "../../component/msft/msalConfig";

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize MSAL instance
    msalInstance
      .initialize()
      .then(() => {
        console.log("MSAL initialized successfully");
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error("MSAL initialization error:", error);
        setIsInitialized(true); // Still set to true to render children, but log error
      });
  }, []);

  // Only render children once MSAL is initialized
  if (!isInitialized) {
    return <div>Initializing authentication...</div>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export default AuthProvider;
