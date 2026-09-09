/**
 * Signals that login has just completed (JWT stored in localStorage) - same
 * bump-/subscribe- CustomEvent pattern already used across utils/*Workspace.js for reload
 * signals. Exists specifically for hooks/providers that can't rely on AuthorizationContext
 * to know when auth is ready, because they're mounted outside its tree - e.g.
 * FilterContext.js's FilterProvider sits in index.js *above* <App />/<Entry />, which is
 * where AuthorizationProvider actually lives, so there's no context signal available there
 * at all. Those callers instead check localStorage directly for a token and use this event
 * to retry once one appears, rather than firing (and 401ing) immediately on mount and never
 * getting a second chance to succeed.
 */
const AUTH_READY_EVENT = "auth-token-ready";

export function bumpAuthReady() {
  window.dispatchEvent(new CustomEvent(AUTH_READY_EVENT));
}

export function subscribeAuthReady(handler) {
  window.addEventListener(AUTH_READY_EVENT, handler);
  return () => window.removeEventListener(AUTH_READY_EVENT, handler);
}
