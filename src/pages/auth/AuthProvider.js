// src/AuthProvider.js

import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

// Configuring MSAL
const msalConfig = {
    auth: {
        // clientId: process.env.CLIENT_ID, // From Azure Portal
        clientId: process.env.REACT_APP_CLIENT_ID, // From Azure Portal
        // authority: 'https://login.microsoftonline.com/39866a06-30bc-4a89-80c6-9dd9357dd453', // Tenant info
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`, // Tenant info

        
        redirectUri: "http://localhost:3000", // Your redirect URI
    },
    cache: {
        cacheLocation: "sessionStorage", // Stores login session
        storeAuthStateInCookie: false, 
    },
};



const msalInstance = new PublicClientApplication(msalConfig);

const AuthProvider = ({ children }) => {
    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    );
};

export default AuthProvider;
