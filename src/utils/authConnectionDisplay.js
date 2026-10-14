/**
 * Display rules for organisation authentication connections (Tenant Management).
 *
 * `autoProvisionUsers`: only an explicit `true` is automatic; `false` and unset are both
 * pre-authorised-only on the server, but unset is shown distinctly so it can be set deliberately.
 *
 * A role-options entry is `{ status: "loading" | "loaded" | "error", roles: [...] }`, as produced by
 * useDefaultRoleOptions for the organisation being edited.
 */

export const DEFAULT_ROLE_OPTIONS_ERROR =
  "Default role options could not be loaded for this organisation.";

export function provisioningLabel(connection) {
  if (connection?.autoProvisionUsers === true) return "Automatic";
  if (connection?.autoProvisionUsers === false) return "Pre-authorised";
  return "Pre-authorised (not set)";
}

export const roleIdOf = (connection) =>
  connection?.defaultRoleId ? String(connection.defaultRoleId) : "";

/** The configured default role among the loaded options, or null. */
export function findDefaultRole(connection, entry) {
  const id = roleIdOf(connection);
  if (!id || entry?.status !== "loaded") return null;
  return (entry.roles || []).find((r) => String(r._id) === id) || null;
}

/**
 * "Default role: <name> (<code>)" for a configured role; "Default role: Unavailable" when the saved
 * role is no longer eligible (never another role in its place). Null when no role is configured.
 */
export function defaultRoleLabel(connection, entry) {
  if (!roleIdOf(connection)) return null;
  if (!entry || entry.status === "loading") return "Default role: loading…";
  if (entry.status === "error") return "Default role: could not be loaded";
  const role = findDefaultRole(connection, entry);
  return role ? `Default role: ${role.name} (${role.code})` : "Default role: Unavailable";
}

const CONNECTION_KEYS = ["connectionType", "autoProvisionUsers", "defaultRoleId"];

/** True when `connection` is new or its type / provisioning / default role differs from the stored one. */
export function isConnectionChanged(connection, storedConnections = []) {
  const stored = connection?._id
    ? (storedConnections || []).find((c) => String(c?._id) === String(connection._id))
    : null;
  if (!stored) return true;
  return CONNECTION_KEYS.some((k) => String(stored[k] ?? "") !== String(connection[k] ?? ""));
}

/**
 * Client-side rule for one connection before saving (the server stays the final validator).
 * Returns an error message, or null.
 * - Automatic always needs a default role.
 * - A new or changed automatic connection also needs the role options to have loaded, and the role
 *   to be one of them.
 */
export function automaticConnectionError(connection, entry, storedConnections) {
  if (connection?.autoProvisionUsers !== true) return null;
  if (!roleIdOf(connection)) return "Default role is required for automatic provisioning";
  if (!isConnectionChanged(connection, storedConnections)) return null;
  if (entry?.status !== "loaded") return DEFAULT_ROLE_OPTIONS_ERROR;
  if (!findDefaultRole(connection, entry)) return "Select an eligible default role";
  return null;
}
