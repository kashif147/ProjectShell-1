/**
 * CRM sign-in organisation context (locator only).
 *
 * - An explicit customer link (`/?tenant=<Organisation Code>`) is read into memory once and then
 *   removed from the address bar; the code is never rendered.
 * - The remembered organisation is `{ code, name }`, written ONLY from the authenticated session's
 *   own organisation record (see tenantBrandingService.fetchTenantRecord). The name is display-only;
 *   the code is still resolved by the backend on every sign-in and grants nothing by itself.
 *
 * Nothing else is stored: never the internal tenant id, directory, connection, oid / tid, OAuth
 * state or a token.
 */

export const REMEMBERED_CODE_KEY = "login_tenant_code";
export const REMEMBERED_NAME_KEY = "login_tenant_name";
const ORGANISATION_CODE = /^[A-Za-z0-9_-]{1,64}$/;

export const isOrganisationCode = (value) => ORGANISATION_CODE.test(String(value ?? "").trim());

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The Organisation Code from `?tenant=` on the current URL, or null. */
export function readExplicitOrganisation(search = window.location.search) {
  try {
    const code = (new URLSearchParams(search).get("tenant") || "").trim();
    return isOrganisationCode(code) ? code : null;
  } catch {
    return null;
  }
}

/** Removes `tenant` from the address bar without a reload (other query parameters are kept). */
export function removeExplicitOrganisationFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("tenant")) return;
    url.searchParams.delete("tenant");
    const rest = url.searchParams.toString();
    window.history.replaceState(window.history.state, document.title, url.pathname + (rest ? `?${rest}` : "") + url.hash);
  } catch {
    // leave the URL as it is
  }
}

/** `{ code, name }` of the remembered organisation, or null (incomplete / malformed -> null). */
export function getRememberedOrganisation() {
  const s = storage();
  if (!s) return null;
  const code = (s.getItem(REMEMBERED_CODE_KEY) || "").trim();
  const name = (s.getItem(REMEMBERED_NAME_KEY) || "").trim();
  if (!isOrganisationCode(code) || !name) return null;
  return { code, name };
}

/** Remembers the AUTHENTICATED organisation (call only with the session's own organisation record). */
export function rememberOrganisation({ code, name } = {}) {
  const s = storage();
  const c = String(code ?? "").trim();
  const n = String(name ?? "").trim();
  if (!s || !isOrganisationCode(c) || !n) return;
  s.setItem(REMEMBERED_CODE_KEY, c);
  s.setItem(REMEMBERED_NAME_KEY, n.slice(0, 200));
}

export function forgetRememberedOrganisation() {
  const s = storage();
  if (!s) return;
  s.removeItem(REMEMBERED_CODE_KEY);
  s.removeItem(REMEMBERED_NAME_KEY);
}
