import { getUserServiceBaseUrl } from "../config/serviceUrls";
import {
  extractRolesArray,
  resolveOfficerRoleIdsFromRolesList,
} from "../utils/officerRoles";

function normalizeUsersResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  return [];
}

export async function fetchCatalogRoles(
  token = localStorage.getItem("token"),
) {
  if (!token) return [];

  const baseUrl = getUserServiceBaseUrl();
  const response = await fetch(`${baseUrl}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  const data = await response.json();
  return extractRolesArray(data);
}

export async function fetchUsersByRoleId(
  roleId,
  token = localStorage.getItem("token"),
) {
  if (!roleId || !token) return [];

  const baseUrl = getUserServiceBaseUrl();
  const response = await fetch(`${baseUrl}/roles/${roleId}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users for role ${roleId}`);
  }

  const data = await response.json();
  return normalizeUsersResponse(data);
}

export async function fetchUsersByRoleIds(
  roleIds = [],
  token = localStorage.getItem("token"),
) {
  const ids = [...new Set((roleIds || []).filter(Boolean))];
  if (ids.length === 0 || !token) return {};

  const baseUrl = getUserServiceBaseUrl();
  const params = new URLSearchParams({ roleIds: ids.join(",") });
  const response = await fetch(`${baseUrl}/roles/users/by-role?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users for roles");
  }

  const data = await response.json();
  return data?.data && typeof data.data === "object" ? data.data : {};
}

/**
 * Load officer users per drawer from tenant roles catalog:
 * IRO → Work Location, BO → Branch, RO → Region.
 * Skips fetch when the role code is not in the roles list.
 */
export async function fetchOfficerRoleUsers(
  catalogRoles = [],
  token = localStorage.getItem("token"),
) {
  const roles = extractRolesArray(catalogRoles);
  const roleIds = resolveOfficerRoleIdsFromRolesList(roles);
  const usersByRoleId = await fetchUsersByRoleIds(
    [roleIds.iro, roleIds.branch, roleIds.region],
    token,
  ).catch((error) => {
    console.error("Failed to fetch officer role users:", error);
    return {};
  });

  const iroUsers = roleIds.iro ? normalizeUsersResponse(usersByRoleId[roleIds.iro]) : [];
  const branchUsers = roleIds.branch
    ? normalizeUsersResponse(usersByRoleId[roleIds.branch])
    : [];
  const regionUsers = roleIds.region
    ? normalizeUsersResponse(usersByRoleId[roleIds.region])
    : [];

  return { iroUsers, branchUsers, regionUsers, roleIds };
}
