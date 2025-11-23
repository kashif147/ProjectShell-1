export const msalConfig = {
    auth: {
      clientId: process.env.REACT_APP_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
      redirectUri: (process.env.REACT_APP_REDIRECT_URI || window.location.origin).replace(/\/+$/, ''),
    },
    cache: {
      cacheLocation: 'sessionStorage', // You can also use localStorage
      storeAuthStateInCookie: false,
    },
  };
  
  export const loginRequest = {
    scopes: ['Files.Read','Files.ReadWrite', 'Sites.ReadWrite.All', 'Mail.Read', 'Mail.ReadWrite','Mail.Send','User.Read'],
  };
  