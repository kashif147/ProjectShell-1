import AuthorizationAPI from "../services/AuthorizationAPI";

/** Role codes used for officer assignment dropdowns */
export const OFFICER_ROLE_CODES = {
  IRO: "IRO",
  BRANCH: "BO",
  REGION: "RO",
};

const OFFICER_ROLE_ALIASES = {
  [OFFICER_ROLE_CODES.IRO]: ["IRO", "INDUSTRIAL RELATIONS OFFICER"],
  [OFFICER_ROLE_CODES.BRANCH]: ["BO", "BRANCH OFFICER", "BRANCH MANAGER"],
  [OFFICER_ROLE_CODES.REGION]: ["RO", "REGIONAL OFFICER", "REGION OFFICER"],
};

/** Roles from JWT / userData — each item uses inner `id` like token payload */
export function getTokenRoles() {
  try {
    const userDataRaw = localStorage.getItem("userData");
    if (userDataRaw) {
      const userData = JSON.parse(userDataRaw);
      if (Array.isArray(userData?.roles) && userData.roles.length > 0) {
        return userData.roles;
      }
    }
  } catch (error) {
    console.warn("Could not parse userData roles:", error);
  }

  const token = localStorage.getItem("token");
  if (!token) return [];
  const decoded = AuthorizationAPI.decodeToken(token);
  return decoded?.roles || [];
}

/** Extract role id from token role object (`roles[].id`) or API role (`_id`). */
export function extractRoleId(role) {
  if (!role) return null;
  if (typeof role === "string") return role;
  return role.id || role._id || null;
}

export function normalizeRoleCode(role) {
  if (!role) return "";
  if (typeof role === "string") return role.toUpperCase();
  return String(role.code || role.name || "").toUpperCase();
}

function roleMatchesAlias(role, aliases = []) {
  const code = normalizeRoleCode(role);
  const name = String(role?.name || "").toUpperCase();
  return aliases.some(
    (alias) => code === alias || name === alias || name.includes(alias),
  );
}

export function resolveRoleIdByCode(roles, code) {
  const aliases = OFFICER_ROLE_ALIASES[code] || [String(code || "").toUpperCase()];
  if (!Array.isArray(roles) || aliases.length === 0) return null;

  const match = roles.find((role) => roleMatchesAlias(role, aliases));
  return extractRoleId(match);
}

export function extractRolesArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.roles)) return payload.roles;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export function mergeRolesWithTokenRoles(catalogRoles = [], tokenRoles = []) {
  const merged = [...catalogRoles];
  tokenRoles.forEach((tokenRole) => {
    const tokenRoleId = extractRoleId(tokenRole);
    if (
      tokenRoleId &&
      !merged.some((role) => extractRoleId(role) === tokenRoleId)
    ) {
      merged.push(tokenRole);
    }
  });
  return merged;
}

export function resolveOfficerRoleIdsFromRolesList(catalogRoles = []) {
  const roles = extractRolesArray(catalogRoles);

  return {
    iro: resolveRoleIdByCode(roles, OFFICER_ROLE_CODES.IRO),
    branch: resolveRoleIdByCode(roles, OFFICER_ROLE_CODES.BRANCH),
    region: resolveRoleIdByCode(roles, OFFICER_ROLE_CODES.REGION),
  };
}

export function resolveOfficerRoleIdForDrawer(catalogRoles = [], drawerType) {
  const roleIds = resolveOfficerRoleIdsFromRolesList(catalogRoles);
  if (drawerType === "Branch") return roleIds.branch;
  if (drawerType === "Region") return roleIds.region;
  return roleIds.iro;
}

export function mapUsersToSelectOptions(users = []) {
  return (Array.isArray(users) ? users : []).map((user) => ({
    key: user._id || user.id,
    label:
      user.userFullName ||
      [user.userFirstName, user.userLastName].filter(Boolean).join(" ") ||
      user.userEmail ||
      "Unknown",
  }));
}

export function resolveOfficerSelectValue(officer) {
  if (officer == null || officer === "") return "";
  if (typeof officer === "object") return officer._id || officer.id || "";
  return String(officer);
}

/** Keep assigned officer visible in dropdown when not in fetched role users list. */
export function buildOfficerSelectOptions(
  baseOptions = [],
  selectedOfficerId,
  selectedOfficerLabel = "",
) {
  const options = [...baseOptions];
  const id = resolveOfficerSelectValue(selectedOfficerId);
  if (!id) return options;

  const exists = options.some((opt) => String(opt.key) === String(id));
  if (!exists) {
    options.unshift({
      key: id,
      label: selectedOfficerLabel || id,
    });
  }
  return options;
}
