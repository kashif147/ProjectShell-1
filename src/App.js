import logo from './logo.svg';
import './App.css';
import Entry from './Entry';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Application (client) ID from Azure portal
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Directory (tenant) ID
    redirectUri: 'http://localhost:3000', // Your app's redirect URI
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      {/* Your React Components */
      <div className="">
      
      <Entry />
 
     </div>}

    </MsalProvider>
  );
}

export default App;
