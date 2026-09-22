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
export async function redirectToMicrosoftLogout() {
  const fallback = () => {
    window.location.href = "/";
  };

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

    window.location.href = data.azureADLogoutUrl;
  } catch (error) {
    console.warn("Microsoft logout redirect failed, falling back to /:", error);
    fallback();
  }
}
