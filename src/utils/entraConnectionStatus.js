/**
 * Microsoft Entra connection: status labels, the status -> action matrix and the fixed, safe
 * messages for every backend code (Tenant Management > Authentication).
 *
 * The status comes from user-service's derived status endpoint and is authoritative; nothing here
 * re-derives it from individual fields. The matrix is deliberately stricter than the switch-OFF
 * backend: "Active for sign-in" is only offered for a verified connection (connected /
 * test_failed), and Reconnect is always the Microsoft Connect flow, never `isActive = true`.
 *
 * @typedef {"not_connected"|"connected"|"disconnected"|"test_failed"|"reconnect_required"} EntraStatus
 * @typedef {{status: EntraStatus, directoryId: string, isActive: boolean,
 *   sharedDirectoryException: boolean, autoProvisionUsers: boolean, connectedAt?: string|null,
 *   connectedBy?: string|null, lastTestedAt?: string, lastTestResult?: {ok: boolean, code: string|null},
 *   disconnectedAt?: string, disconnectedBy?: string}} EntraConnectionStatus
 */

export const ENTRA = "Entra ID (Azure AD)";
export const B2C = "Azure B2C";

export const STATUS_LABELS = {
  not_connected: "Not connected",
  connected: "Connected",
  disconnected: "Disconnected",
  test_failed: "Connection test failed",
  reconnect_required: "Reconnect required",
};

export const statusLabel = (status) => STATUS_LABELS[status] || "Unknown";

const VERIFIED = ["connected", "test_failed"];

/**
 * Which controls the Entra card offers. Without `canAdmin` (tenant:admin) everything is read-only.
 * A platform-managed connection (sharedDirectoryException) never offers Connect / Reconnect /
 * Disconnect or Tenant ID editing. The Tenant ID is only editable while the connection is inactive.
 */
export function entraActions({ status, isActive, sharedDirectoryException, canAdmin }) {
  const actions = {
    connect: false,
    reconnect: false,
    test: false,
    disconnect: false,
    editDirectory: false,
    editProvisioning: false,
    activeSwitch: false,
    deactivateOnly: false,
  };
  if (!canAdmin) return actions;
  const managed = sharedDirectoryException === true;
  const active = isActive === true;
  actions.editProvisioning = true;
  switch (status) {
    case "not_connected":
      actions.connect = !managed;
      actions.editDirectory = !managed && !active;
      break;
    case "connected":
      actions.test = true;
      actions.disconnect = !managed;
      break;
    case "test_failed":
      actions.test = true;
      actions.reconnect = !managed;
      actions.disconnect = !managed;
      break;
    case "disconnected":
    case "reconnect_required":
      actions.reconnect = !managed;
      actions.editDirectory = !managed && !active;
      break;
    default:
      break;
  }
  actions.activeSwitch = VERIFIED.includes(status);
  // An older connection that is active without verified ownership may only be deactivated.
  actions.deactivateOnly = !VERIFIED.includes(status) && active;
  return actions;
}

export const SUCCESS_MESSAGES = {
  connect: "Microsoft Entra has been connected successfully.",
  test: "Connection test successful",
  disconnect: "Microsoft Entra has been disconnected.",
  save: "Authentication settings saved.",
};

export const UNKNOWN_ERROR = "We couldn't complete this action. Please try again.";
export const CONNECT_UNAVAILABLE = "We could not complete the Microsoft connection. Please try again.";
export const RECONNECT_BEFORE_ACTIVATING = "Reconnect Microsoft Entra before activating this connection.";

const CODE_MESSAGES = {
  DIRECTORY_MISMATCH:
    "The Microsoft account used belongs to a different directory than the one configured for this organisation.",
  DIRECTORY_ALREADY_CLAIMED: "This Microsoft directory is already connected to another organisation.",
  DIRECTORY_SHARED_EXCEPTION: "This connection is managed by the platform and cannot be changed here.",
  CLAIM_METHOD_CONFLICT: "This connection is managed by the platform and cannot be changed here.",
  NOT_DIRECTORY_ADMIN: "The Microsoft account used does not have a supported administrator role in that directory.",
  INVALID_DIRECTORY: "The configured Microsoft Tenant ID is invalid.",
  TOKEN_EXCHANGE_FAILED: CONNECT_UNAVAILABLE,
  TOKEN_INVALID: CONNECT_UNAVAILABLE,
  CONNECT_STATE_INVALID: "The Microsoft connection request expired. Please start again.",
  CONNECTION_CHANGED: "This connection was changed while you were working. Refresh and try again.",
  CONNECTION_NOT_FOUND: "This authentication connection no longer exists.",
  NOT_ENTRA_CONNECTION: "This action is only available for Microsoft Entra connections.",
  NOT_CONNECTED: "This connection is not connected, so there is nothing to disconnect.",
  CONNECTION_DISCONNECTED: RECONNECT_BEFORE_ACTIVATING,
  ACTOR_REQUIRED: "Your session has expired. Please sign in again.",
};

/** Test Connection result codes (lastTestResult.code / a failed test's code). */
export const TEST_MESSAGES = {
  CONNECTED: "Connection test successful",
  DIRECTORY_NOT_CLAIMED: "This connection has not been verified. Connect Microsoft Entra first.",
  DIRECTORY_NOT_FOUND: "Microsoft could not find this directory. Check the Tenant ID.",
  APP_NOT_CONSENTED: "An administrator of this directory has not approved ProjectShell yet.",
  CONFIGURATION_INVALID: "ProjectShell's Microsoft configuration needs attention. Contact ProjectShell support.",
  CREDENTIAL_INVALID: "ProjectShell's Microsoft configuration needs attention. Contact ProjectShell support.",
  MICROSOFT_UNAVAILABLE: "Microsoft could not be reached. Try again shortly.",
};

export const testResultMessage = (code) => TEST_MESSAGES[code] || UNKNOWN_ERROR;

const CONNECT_OPS = ["connect", "complete"];

/**
 * The safe message for a failed request. `error` is an AuthConnectionApiError-like
 * `{status, code, network}`; `op` is connect | complete | test | disconnect | save | load.
 * Raw server or Microsoft text is never returned.
 */
export function errorMessage(error, op) {
  const code = error?.code;
  if (code === "CONNECTION_DISCONNECTED" && op === "test") {
    return "This connection is disconnected. Reconnect Microsoft Entra to test it.";
  }
  if (code && TEST_MESSAGES[code] && code !== "CONNECTED") return TEST_MESSAGES[code];
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (error?.network) return CONNECT_OPS.includes(op) ? CONNECT_UNAVAILABLE : UNKNOWN_ERROR;
  const status = error?.status;
  if (status === 401) return CODE_MESSAGES.ACTOR_REQUIRED;
  if (status === 403) return "You do not have permission to manage authentication for this organisation.";
  if (status === 400 && (op === "save" || op === "add")) return "Check the connection settings and try again.";
  if (status >= 500 && CONNECT_OPS.includes(op)) return CONNECT_UNAVAILABLE;
  return UNKNOWN_ERROR;
}

/** Microsoft's `error` query parameter on the callback (the admin cancelled, or Microsoft refused). */
export const microsoftCallbackErrorMessage = (msError) =>
  msError === "access_denied" ? "Microsoft sign-in was cancelled." : CONNECT_UNAVAILABLE;

const DIRECTORY_GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Client-side shape check only; the server stays the validator. */
export const isDirectoryGuid = (value) => DIRECTORY_GUID.test(String(value ?? "").trim());

/** "17 Oct 2026, 07:06" (local time), or null. */
export function formatWhen(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * The organisation's Entra connection shown on the card: the active one (at most one exists),
 * else the most recently updated one.
 */
export function primaryEntraConnection(connections = []) {
  const entra = (connections || []).filter((c) => c?.connectionType === ENTRA);
  if (!entra.length) return null;
  const active = entra.find((c) => c.isActive === true);
  if (active) return active;
  const time = (c) => new Date(c.updatedAt || c.createdAt || 0).getTime() || 0;
  return [...entra].sort((a, b) => time(b) - time(a))[0];
}
