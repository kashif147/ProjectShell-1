import { getUserServiceBaseUrl } from "../config/serviceUrls";

/**
 * Roles that may be the default role of an authentication connection of `connectionType` in the
 * organisation being edited. The server applies the eligibility rules (same organisation, active,
 * matching user type, no privileged/system roles; Azure B2C -> that organisation's NON-MEMBER only),
 * so this list is used as-is - never the signed-in user's own organisation's role list.
 *
 * Rejects (with `status` when the server answered) when the options cannot be loaded, e.g. 403 for
 * an organisation the signed-in user may not administer, so callers never mistake a failure for
 * "no eligible roles".
 */
export async function fetchDefaultRoleOptions(
  tenantId,
  connectionType,
  token = localStorage.getItem("token"),
) {
  if (!tenantId || !connectionType) return [];
  if (!token) {
    throw Object.assign(new Error("Not signed in"), { status: 401 });
  }

  const response = await fetch(
    `${getUserServiceBaseUrl()}/tenants/${encodeURIComponent(
      tenantId,
    )}/auth-connections/default-role-options?connectionType=${encodeURIComponent(
      connectionType,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw Object.assign(new Error("Failed to fetch default role options"), {
      status: response.status,
    });
  }

  const body = await response.json();
  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * Tenant Management > Authentication (Microsoft Entra Connect / Test / Disconnect and per-connection
 * saves). The organisation and connection always come from the path; nothing is ever logged.
 * Failures reject with AuthConnectionApiError `{status, code, network}` - `code` is the backend's
 * safe error code when it sent one - so callers can show fixed messages, never raw server text.
 */
export class AuthConnectionApiError extends Error {
  constructor({ status = null, code = null, network = false } = {}) {
    super(code || (network ? "NETWORK_ERROR" : `HTTP_${status}`));
    this.name = "AuthConnectionApiError";
    this.status = status;
    this.code = code;
    this.network = network;
  }
}

const connectionPath = (tenantId, connectionId, suffix = "") =>
  `/tenants/${encodeURIComponent(tenantId)}/auth-connections${
    connectionId ? `/${encodeURIComponent(connectionId)}` : ""
  }${suffix}`;

async function request(path, { method = "GET", body, allowFailedTest = false } = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new AuthConnectionApiError({ status: 401 });
  let response;
  try {
    response = await fetch(`${getUserServiceBaseUrl()}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new AuthConnectionApiError({ network: true });
  }
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (response.ok) return payload?.data;
  // A failed Test Connection is a result (`{status: "fail", data: {ok: false, code}}`), not an error.
  if (allowFailedTest && payload?.status === "fail" && payload?.data && typeof payload.data.code === "string") {
    return payload.data;
  }
  const code = typeof payload?.error?.code === "string" ? payload.error.code : null;
  throw new AuthConnectionApiError({ status: response.status, code });
}

/** The organisation (allow-listed connection fields only). */
export const fetchTenantForAuthentication = (tenantId) => request(`/tenants/${encodeURIComponent(tenantId)}`);

/** Backend-derived Microsoft Entra status of one connection. */
export const fetchEntraConnectionStatus = (tenantId, connectionId) =>
  request(connectionPath(tenantId, connectionId, "/status"));

/** -> `{authorizationUrl}` for the Microsoft administrator sign-in. */
export const startEntraConnect = (tenantId, connectionId) =>
  request(connectionPath(tenantId, connectionId, "/connect"), { method: "POST", body: {} });

export const completeEntraConnect = (tenantId, connectionId, { code, state }) =>
  request(connectionPath(tenantId, connectionId, "/connect/complete"), { method: "POST", body: { code, state } });

/** -> `{ok, code, testedAt}`; a failed test resolves with ok false. */
export const testEntraConnection = (tenantId, connectionId) =>
  request(connectionPath(tenantId, connectionId, "/test"), { method: "POST", body: {}, allowFailedTest: true });

export const disconnectEntraConnection = (tenantId, connectionId) =>
  request(connectionPath(tenantId, connectionId, "/disconnect"), { method: "POST", body: {} });

/** Adds a connection (Tenant Management only adds Microsoft Entra, inactive). */
export const addAuthConnection = (tenantId, connection) =>
  request(connectionPath(tenantId), { method: "POST", body: connection });

/** Saves only the given fields of one connection (the server merges and validates). */
export const updateAuthConnection = (tenantId, connectionId, fields) =>
  request(connectionPath(tenantId, connectionId), { method: "PUT", body: fields });
