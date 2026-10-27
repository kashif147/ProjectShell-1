/**
 * Phase A / A12 - tenant-keyed browser storage for tenant-owned metadata.
 *
 * Tenant-owned values (lookup hierarchies, ids resolved from stable codes) are stored under
 * `<base>:v2:<tenantId>`, where the tenant is the signed-in session token's own `tenantId` claim
 * (never a caller-supplied value, never userData). With no usable tenant nothing is read or written.
 *
 *   hierarchicalLookups            -> hierarchicalLookups:v2:<tenantId>
 *   gardaApplicationDrafts (legacy, no longer written) -> removed
 *
 * purgeForeignTenantStorage(tenantId) removes the legacy global keys and every v2 key of any OTHER
 * tenant (boot, sign-in, tenant change); clearTenantStorage() removes all of them (logout, idle
 * logout, clearAuth, token expiry). Auth material and user preferences are not touched here.
 */

export const TENANT_KEYED_BASES = ["hierarchicalLookups"];
export const LEGACY_GLOBAL_KEYS = ["hierarchicalLookups", "gardaApplicationDrafts"];

const PLACEHOLDER_TENANTS = new Set(["default", "unknown", "system", "null", "undefined"]);
const OBJECT_ID = /^[0-9a-f]{24}$/i;

const store = () => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

/** A tenant id usable in a storage key, or null (missing / placeholder / malformed). */
export function cleanTenantId(tenantId) {
  const t = tenantId == null ? "" : String(tenantId).trim();
  if (!t || PLACEHOLDER_TENANTS.has(t.toLowerCase()) || !OBJECT_ID.test(t)) return null;
  return t;
}

function decodePayload(token) {
  try {
    const part = String(token).split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** The signed-in session's tenant: the session token's own tenantId claim only. */
export function sessionTenantId() {
  const s = store();
  const token = s ? s.getItem("token") : null;
  if (!token) return null;
  const payload = decodePayload(token);
  return cleanTenantId(payload && payload.tenantId);
}

export function tenantKey(base, tenantId = sessionTenantId()) {
  const t = cleanTenantId(tenantId);
  return t ? `${base}:v2:${t}` : null;
}

/** Raw stored string for the current session tenant, or null. */
export function readTenantItem(base) {
  const s = store();
  const key = tenantKey(base);
  if (!s || !key) return null;
  return s.getItem(key);
}

/** Stores under the current session tenant; false (nothing written) when there is no tenant. */
export function writeTenantItem(base, value) {
  const s = store();
  const key = tenantKey(base);
  if (!s || !key) return false;
  s.setItem(key, value);
  return true;
}

export function removeTenantItem(base) {
  const s = store();
  const key = tenantKey(base);
  if (s && key) s.removeItem(key);
}

const isTenantKeyFor = (key, base) => key.startsWith(`${base}:v2:`);

/** Removes legacy global keys and every tenant-keyed entry not belonging to keepTenantId. */
export function purgeForeignTenantStorage(keepTenantId = sessionTenantId()) {
  const s = store();
  if (!s) return [];
  const keep = cleanTenantId(keepTenantId);
  const removed = [];
  const keys = [];
  for (let i = 0; i < s.length; i += 1) keys.push(s.key(i));
  for (const key of keys) {
    if (!key) continue;
    const legacy = LEGACY_GLOBAL_KEYS.includes(key);
    const foreign = TENANT_KEYED_BASES.some(
      (base) => isTenantKeyFor(key, base) && (!keep || key !== `${base}:v2:${keep}`),
    );
    if (legacy || foreign) {
      s.removeItem(key);
      removed.push(key);
    }
  }
  return removed;
}

/** Logout / idle logout / clearAuth / token expiry: no tenant metadata survives. */
export function clearTenantStorage() {
  return purgeForeignTenantStorage(null);
}

/**
 * The signed-in user's id from the session token (`id`, else `sub`), or null. Used where an API
 * still requires the creator in the body (lookup / lookup-type create) instead of a hardcoded id.
 */
export function sessionUserId() {
  const s = store();
  const token = s ? s.getItem("token") : null;
  if (!token) return null;
  const payload = decodePayload(token);
  const id = payload && (payload.id || payload.sub);
  return id && OBJECT_ID.test(String(id)) ? String(id) : null;
}
