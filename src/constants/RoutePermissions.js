/**
 * Centralized mapping of route paths to required permissions.
 * This is used for strict route validation when accessing URLs directly.
 */
export const RoutePermissions = {
  // Profiles & Membership
  "Summary": "profile:read",
  "Details": "profile:read",
  "Members": "crm:member:read",
  "MembershipDashboard": "dashboard:read",
  "Applications": "application:read",
  "PaymentForms": "application:read",
  "Transfers": "transferrequests:read",
  "ChangCateSumm": "changeofcategory:read",
  "Cancallation": "subscriptions:read",
  "RemindersSummary": "notifications:read",

  // Finance
  "onlinePayment": "payments:read",
  "Cheque": "payments:read",
  "Deductions": "payments:read",
  "StandingOrders": "payments:read",
  "DirectDebitAuthorization": "payments:read",
  "DirectDebit": "payments:read",
  "Refunds": "payments:read",
  "write-offs": "payments:read",
  "Import": "payments:read",
  "Reconciliation": "payments:read",

  // Correspondence
  "CorrespondenceDashboard": "dashboard:read",
  "InAppNotifications": "notifications:read",
  "UserNotifications": "notifications:read",
  "/UserNotifications": "notifications:read",
  "Email": "communication:write",
  "EmailCampaignDetail": "communication:write",
  "Sms": "communication:write",
  "Notes": "communication:read",
  "CorrespondencesSummary": "communication:read",

  // Configuration & Management
  "templeteSummary": "templates:read",
  "templeteConfig": "templates:read",
  "Configuratin": "portal:read", // System Configuration
  "PermissionManagement": "role:permission:assign",
  "RoleManagement": "role:read",
  "UserManagement": "user:read",
  "ProductTypesManagement": "portal:read",
  "TenantManagement": "tenant:read",
  "PolicyClientExample": "portal:read",

  // Reports
  "CancelledMembersReport": "subscriptions:read",
  "JoinersReport": "crm:member:read",
  "LeaversReport": "crm:member:read",
  "NewMembersReport": "crm:member:read",
  "ResignedMembersReport": "crm:member:read",
  "SuspendedMembersReport": "crm:member:read",

  // Cases & Issues
  "CasesSummary": "portal:read",
  "IssuesManagementDashboard": "portal:read",
  "CasesById": "portal:read",
  "CasesDetails": "portal:read",
  "ClaimSummary": "portal:read",
  "ClaimsDetails": "portal:read",
  "ClaimsById": "portal:read",

  // Events
  "EventsDashboard": "events:read",
  "EventsSummary": "events:read",
  "EventDetails": "events:read",
  "Attendees": "portal:read",
  "Reporting": "portal:read",
  "EventsSettings": "portal:read",

  // Portal/Other
};

export default RoutePermissions;
