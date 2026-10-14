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
