/**
 * Clearing our own token/localStorage on logout never touches Microsoft's own session
 * cookie (login.microsoftonline.com) - that's a separate session this app doesn't own. Left
 * alone, the next "Sign in with Microsoft" click silently re-authenticates from that cookie
 * with no credential prompt, which is exactly the "logout doesn't clear my session" bug
 * this fixes. Actually ending it requires navigating the browser to Microsoft's own logout
 * endpoint - see user-service's pkce.controller.js's getLogoutUrls for where this URL comes
 * from and why post_logout_redirect_uri is built the way it is.
 *
 * Local state (localStorage, Redux, auth context) must already be cleared by the caller
 * before calling this - it only handles the cross-domain redirect, and navigates away from
 * the SPA entirely, so nothing after this call runs.
 */
const LOGOUT_HINT_KEY = "msLogoutHint";

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Called on a successful CRM sign-in with the callback's `logoutHint` (the ID token's opaque
 * `login_hint` claim - not a credential). On logout it is appended as Microsoft's `logout_hint`
 * to the Entra logout URL, in the browser only, so the user goes straight back to the app instead
 * of the "pick an account to sign out" screen. It is never sent to ProjectShell (gateway access
 * logs record full request URLs). A sign-in without one drops any hint left over from an earlier
 * session.
 */
export function rememberMicrosoftLogoutHint(hint) {
  const s = storage();
  if (!s) return;
  try {
    if (typeof hint === "string" && hint) s.setItem(LOGOUT_HINT_KEY, hint);
    else s.removeItem(LOGOUT_HINT_KEY);
  } catch {
    // Storage unavailable: logout still works, just with Microsoft's account picker.
  }
}

// Same bound as user-service applied when it issued the hint: storage is not trusted, so anything
// else is discarded and logout proceeds without a hint (Microsoft shows its account picker).
const LOGOUT_HINT_PATTERN = /^[A-Za-z0-9._~+\/=-]{1,2048}$/;
const ENTRA_LOGOUT_HOST = "login.microsoftonline.com";

/**
 * Appends `logout_hint` to the Microsoft Entra logout URL only (https, login.microsoftonline.com);
 * any other URL, or an invalid hint, is returned unchanged.
 */
export function withLogoutHint(logoutUrl, hint) {
  if (typeof hint !== "string" || !LOGOUT_HINT_PATTERN.test(hint)) return logoutUrl;
  let url;
  try {
    url = new URL(logoutUrl);
  } catch {
    return logoutUrl;
  }
  if (url.protocol !== "https:" || url.hostname !== ENTRA_LOGOUT_HOST) return logoutUrl;
  return `${logoutUrl}${url.search ? "&" : "?"}logout_hint=${encodeURIComponent(hint)}`;
}

/** Reads and removes the stored hint - each one is used for a single logout. */
function takeMicrosoftLogoutHint() {
  const s = storage();
  if (!s) return null;
  try {
    const hint = s.getItem(LOGOUT_HINT_KEY);
    s.removeItem(LOGOUT_HINT_KEY);
    return hint || null;
  } catch {
    return null;
  }
}

export async function redirectToMicrosoftLogout() {
  const fallback = () => {
    window.location.href = "/";
  };
  const logoutHint = takeMicrosoftLogoutHint();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL_DEV}/pkce/logout-urls`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Failed to fetch Microsoft logout URL, falling back to /");
      fallback();
      return;
    }

    const data = await response.json();
    if (!data?.azureADLogoutUrl) {
      console.warn("Malformed /pkce/logout-urls response, falling back to /");
      fallback();
      return;
    }

    window.location.href = withLogoutHint(data.azureADLogoutUrl, logoutHint);
  } catch (error) {
    console.warn("Microsoft logout redirect failed, falling back to /:", error);
    fallback();
  }
}
