/**
 * "Connect Microsoft Entra" return note (Tenant Management -> Microsoft -> /auth/azure-crm).
 *
 * Microsoft returns the Connect flow to the CRM sign-in callback, and the completion request needs
 * the organisation and connection in its path. Before redirecting, Tenant Management keeps ONLY
 * `{ tenantId, connectionId, startedAt }` in sessionStorage. Never the OAuth state, code, verifier,
 * nonce or any token: the backend's single-use Connect state (bound to the organisation,
 * connection, directory and initiating user) stays authoritative.
 *
 * The note is single-use and only ever routes a callback to Connect completion when it is
 * well-formed, at most 10 minutes old, and the returned state is not the ordinary CRM sign-in
 * state. A stale or malformed note is discarded; it is never enough to complete a Connect.
 */

export const CONNECT_RETURN_KEY = "entraConnectReturn";
export const CONNECT_RETURN_MAX_AGE_MS = 10 * 60 * 1000;
const CLOCK_SKEW_MS = 60 * 1000;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

function storage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Remembers which organisation / connection started a Connect (identifiers and time only). */
export function saveConnectReturn({ tenantId, connectionId }, now = Date.now()) {
  storage()?.setItem(
    CONNECT_RETURN_KEY,
    JSON.stringify({ tenantId: String(tenantId), connectionId: String(connectionId), startedAt: now }),
  );
}

export function clearConnectReturn() {
  storage()?.removeItem(CONNECT_RETURN_KEY);
}

/** The parsed note when it is well-formed and fresh, else null (a bad note is discarded). */
function readValidNote(now) {
  const raw = storage()?.getItem(CONNECT_RETURN_KEY);
  if (!raw) return null;
  let note = null;
  try {
    note = JSON.parse(raw);
  } catch {
    note = null;
  }
  const age = note ? now - note.startedAt : NaN;
  const valid =
    note &&
    typeof note === "object" &&
    typeof note.tenantId === "string" &&
    OBJECT_ID.test(note.tenantId) &&
    typeof note.connectionId === "string" &&
    OBJECT_ID.test(note.connectionId) &&
    Number.isFinite(note.startedAt) &&
    age >= -CLOCK_SKEW_MS &&
    age <= CONNECT_RETURN_MAX_AGE_MS;
  if (!valid) {
    clearConnectReturn();
    return null;
  }
  return note;
}

/**
 * For a Microsoft callback: `{ tenantId, connectionId }` when it belongs to a Connect started here,
 * else null (the ordinary sign-in handling continues unchanged). The note is removed BEFORE this
 * returns, so it is consumed exactly once whatever happens next.
 *
 * @param {{returnedState: string|null, signInState: string|null, now?: number}} args
 */
export function takeConnectReturn({ returnedState, signInState, now = Date.now() }) {
  if (!returnedState) return null;
  const note = readValidNote(now);
  if (!note) return null;
  if (signInState && returnedState === signInState) return null; // an ordinary CRM sign-in
  const target = { tenantId: note.tenantId, connectionId: note.connectionId };
  clearConnectReturn();
  return target;
}
