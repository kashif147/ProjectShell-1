import { getUserServiceBaseUrl } from "../config/serviceUrls";

/**
 * Roles that may be the default role of an authentication connection of `connectionType` in the
 * organisation being edited. The server applies the eligibility rules (same organisation, active,
 * matching user type, no privileged/system roles), so this list is used as-is - never the
 * signed-in user's own organisation's role list.
 */
export async function fetchDefaultRoleOptions(
  tenantId,
  connectionType,
  token = localStorage.getItem("token"),
) {
  if (!tenantId || !connectionType || !token) return [];

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
    throw new Error("Failed to fetch default role options");
  }

  const body = await response.json();
  return Array.isArray(body?.data) ? body.data : [];
}
