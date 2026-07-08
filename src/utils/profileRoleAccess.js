const FULL_MEMBERSHIP_UPDATE_ROLES = new Set([
  "SU",
  "SUPER USER",
  "ASU",
  "ASSISTANT SUPER USER",
  "MO",
  "MEMBERSHIP OFFICER",
  "AMO",
  "ASSISTANT MEMBERSHIP OFFICER",
]);

const FINANCE_ACTION_ROLES = new Set([
  "SU",
  "SUPER USER",
  "ASU",
  "ASSISTANT SUPER USER",
  "AM",
  "ACCOUNTS MANAGER",
  "ACCOUNT MANAGER",
  "DAM",
  "DEPUTY ACCOUNTS MANAGER",
  "DEPUTY ACCOUNT MANAGER",
]);

function normalizeRoleValue(role) {
  if (!role) return "";
  const raw =
    typeof role === "string"
      ? role
      : role.code || role.name || role.roleCode || role.roleName || "";
  return String(raw).trim().toUpperCase();
}

export function normalizeRoleValues(roles = []) {
  return [
    ...new Set(
      (Array.isArray(roles) ? roles : [])
        .map(normalizeRoleValue)
        .filter(Boolean),
    ),
  ];
}

export function hasFullMembershipUpdateRole(roles = []) {
  return normalizeRoleValues(roles).some((role) =>
    FULL_MEMBERSHIP_UPDATE_ROLES.has(role),
  );
}

export function hasFinanceActionRole(roles = []) {
  return normalizeRoleValues(roles).some((role) =>
    FINANCE_ACTION_ROLES.has(role),
  );
}

export function hasMembershipProfileWritePermission(permissions = []) {
  return (Array.isArray(permissions) ? permissions : []).some((permission) =>
    [
      "*",
      "admin",
      "crm:member:write",
      "crm:member:update",
      "profile:write",
      "profile:update",
      "portal:write",
    ].includes(permission),
  );
}
