// export const getRedirectUri = () => {
//   if (typeof window === "undefined") {
//     return process.env.REACT_APP_REDIRECT_URI || "";
//   }
//   return (
//     process.env.REACT_APP_REDIRECT_URI ||
//     (process.env.NODE_ENV === "development"
//       ? window.location.origin
//       : "https://project-shell-crm.vercel.app/")
//   ).replace(/\/+$/, "");
// };

export const getRedirectUri = () => {
  // If running in Node (SSR or server context, not browser), just use env value
  if (typeof window === "undefined") {
    return (
      process.env.REACT_APP_REDIRECT_URI_VER || REACT_APP_REDIRECT_URI || ""
    );
  }

  const envOverride =
    process.env.REACT_APP_REDIRECT_URI_VER ||
    process.env.REACT_APP_REDIRECT_URI;
  if (envOverride) {
    return envOverride.replace(/\/+$/, "");
  }

  // Determine based on NODE_ENV
  const defaultRedirect =
    process.env.NODE_ENV === "development"
      ? window.location.origin
      : "https://project-shell-crm.vercel.app/";

  return defaultRedirect.replace(/\/+$/, "");
};

// For debugging: log the redirect URI when the module loads (remove in production)
console.log("DEBUG: Redirect URI resolved to:", getRedirectUri());

// export const msalConfig = {
//   auth: {
//     clientId: process.env.REACT_APP_CLIENT_ID,
//     authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
//     get redirectUri() {
//       return getRedirectUri();
//     },
//   },
//   cache: {
//     cacheLocation: "sessionStorage", // You can also use localStorage
//     storeAuthStateInCookie: false,
//   },
// };
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(), // optional: same as redirect
  },
  cache: {
    cacheLocation: "sessionStorage",
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
