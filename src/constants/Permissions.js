export const PERMISSIONS = {
  // General read permissions
  READ_ONLY: "read:all",

  // User Service permissions
  USER: {
    READ: "user:read",
    WRITE: "user:write",
    DELETE: "user:delete",
    MANAGE_ROLES: "user:manage_roles",
    CREATE: "user:create",
    UPDATE: "user:update",
    LIST: "user:list",
  },

  // Role Service permissions
  ROLE: {
    READ: "role:read",
    WRITE: "role:write",
    DELETE: "role:delete",
    CREATE: "role:create",
    UPDATE: "role:update",
    LIST: "role:list",
    ASSIGN: "role:assign",
    REMOVE: "role:remove",
  },

  // Account Service permissions
  ACCOUNT: {
    READ: "account:read",
    WRITE: "account:write",
    DELETE: "account:delete",
    PAYMENT: "account:payment",
    TRANSACTION_READ: "account:transaction:read",
    TRANSACTION_WRITE: "account:transaction:write",
    TRANSACTION_DELETE: "account:transaction:delete",
    FINANCIAL_READ: "financial:read",
    FINANCIAL_WRITE: "financial:write",
    FINANCIAL_DELETE: "financial:delete",
    ADMIN_READ: "admin:read",
    ADMIN_WRITE: "admin:write",
    ADMIN_DELETE: "admin:delete",
    INVOICE_CREATE: "invoice:create",
    INVOICE_READ: "invoice:read",
    INVOICE_UPDATE: "invoice:update",
    INVOICE_DELETE: "invoice:delete",
    RECEIPT_CREATE: "receipt:create",
    RECEIPT_READ: "receipt:read",
    RECEIPT_UPDATE: "receipt:update",
    RECEIPT_DELETE: "receipt:delete",
  },

  // Portal Service permissions
  PORTAL: {
    ACCESS: "portal:access",
    PROFILE_READ: "portal:profile:read",
    PROFILE_WRITE: "portal:profile:write",
    PROFILE_DELETE: "portal:profile:delete",
    DASHBOARD_READ: "portal:dashboard:read",
    SETTINGS_READ: "portal:settings:read",
    SETTINGS_WRITE: "portal:settings:write",
    NOTIFICATIONS_READ: "portal:notifications:read",
    NOTIFICATIONS_WRITE: "portal:notifications:write",
  },

  // CRM Service permissions
  CRM: {
    ACCESS: "crm:access",
    MEMBER_READ: "crm:member:read",
    MEMBER_WRITE: "crm:member:write",
    MEMBER_DELETE: "crm:member:delete",
    MEMBER_CREATE: "crm:member:create",
    MEMBER_UPDATE: "crm:member:update",
    MEMBER_LIST: "crm:member:list",
    MEMBERSHIP_READ: "crm:membership:read",
    MEMBERSHIP_WRITE: "crm:membership:write",
    MEMBERSHIP_DELETE: "crm:membership:delete",
    REPORTS_READ: "crm:reports:read",
    REPORTS_WRITE: "crm:reports:write",
  },

  // Audit Service permissions
  AUDIT: {
    READ: "audit:read",
    WRITE: "audit:write",
    DELETE: "audit:delete",
    LOGS_READ: "audit:logs:read",
    LOGS_WRITE: "audit:logs:write",
    REPORTS_READ: "audit:reports:read",
  },

  // Subscription Service permissions
  SUBSCRIPTION: {
    READ: "subscription:read",
    WRITE: "subscription:write",
    DELETE: "subscription:delete",
    CREATE: "subscription:create",
    UPDATE: "subscription:update",
    CANCEL: "subscription:cancel",
    RENEW: "subscription:renew",
  },

  // Profile Service permissions
  PROFILE: {
    READ: "profile:read",
    WRITE: "profile:write",
    DELETE: "profile:delete",
    CREATE: "profile:create",
    UPDATE: "profile:update",
    UPLOAD: "profile:upload",
    DOWNLOAD: "profile:download",
  },
};

// Helper function to flatten permissions into an array
export const getAllPermissionsList = () => {
  const permissions = [];

  // Add general permissions
  permissions.push({
    id: "read:all",
    name: "Read Only",
    category: "General",
    action: "read",
    description: "General read-only access to all resources",
    permission: PERMISSIONS.READ_ONLY,
  });

  // Add service-specific permissions
  Object.keys(PERMISSIONS).forEach((serviceKey) => {
    if (serviceKey === "READ_ONLY") return; // Skip general permissions

    const service = PERMISSIONS[serviceKey];
    Object.keys(service).forEach((actionKey) => {
      const permission = service[actionKey];
      const category = serviceKey.toLowerCase();
      const action = actionKey.toLowerCase();

      permissions.push({
        id: permission,
        name: `${serviceKey} ${actionKey}`,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        action: action,
        description: `${action} access for ${category} service`,
        permission: permission,
      });
    });
  });

  return permissions;
};

// Categories for filtering
export const PERMISSION_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "user", label: "User" },
  { value: "role", label: "Role" },
  { value: "account", label: "Account" },
  { value: "portal", label: "Portal" },
  { value: "crm", label: "CRM" },
  { value: "audit", label: "Audit" },
  { value: "subscription", label: "Subscription" },
  { value: "profile", label: "Profile" },
];

// Actions for filtering
export const PERMISSION_ACTIONS = [
  { value: "all", label: "All Actions" },
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "access", label: "Access" },
  { value: "manage", label: "Manage" },
  { value: "assign", label: "Assign" },
  { value: "remove", label: "Remove" },
  { value: "cancel", label: "Cancel" },
  { value: "renew", label: "Renew" },
  { value: "upload", label: "Upload" },
  { value: "download", label: "Download" },
  { value: "payment", label: "Payment" },
];
