export const getRedirectUri = () => {
  if (typeof window === "undefined") {
    return process.env.REACT_APP_REDIRECT_URI || "";
  }
  return (
    process.env.REACT_APP_REDIRECT_URI ||
    (process.env.NODE_ENV === "development"
      ? window.location.origin
      : "https://project-shell-crm.vercel.app/")
  ).replace(/\/+$/, "");
};

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
    get redirectUri() {
      return getRedirectUri();
    },
  },
  cache: {
    cacheLocation: "sessionStorage", // You can also use localStorage
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "Files.Read",
    "Files.ReadWrite",
    "Sites.ReadWrite.All",
    "Mail.Read",
    "Mail.ReadWrite",
    "Mail.Send",
    "User.Read",
  ],
};
