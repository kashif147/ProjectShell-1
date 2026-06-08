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

  const [iroUsers, branchUsers, regionUsers] = await Promise.all([
    roleIds.iro
      ? fetchUsersByRoleId(roleIds.iro, token).catch((error) => {
          console.error(`Failed to fetch IRO users for role ${roleIds.iro}:`, error);
          return [];
        })
      : Promise.resolve([]),
    roleIds.branch
      ? fetchUsersByRoleId(roleIds.branch, token).catch((error) => {
          console.error(
            `Failed to fetch Branch Officer users for role ${roleIds.branch}:`,
            error,
          );
          return [];
        })
      : Promise.resolve([]),
    roleIds.region
      ? fetchUsersByRoleId(roleIds.region, token).catch((error) => {
          console.error(
            `Failed to fetch Region Officer users for role ${roleIds.region}:`,
            error,
          );
          return [];
        })
      : Promise.resolve([]),
  ]);

  return { iroUsers, branchUsers, regionUsers, roleIds };
}
