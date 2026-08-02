/**
 * Centralized mapping of route paths to required permissions.
 * This is used for strict route validation when accessing URLs directly.
 */
export const RoutePermissions = {
  // Profiles & Membership
  "Summary": "profile:read",
  "Details": "profile:read",
  "Members": "crm:member:read",
  "MembershipDashboard": "reporting:read",
  "Applications": "application:read",
  "PaymentForms": "application:read",
  "Transfers": "transferrequests:read",
  "ChangCateSumm": "changeofcategory:read",
  "Cancallation": "subscriptions:read",
  "YearEndRenewal": "subscriptions:write",
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
  "JournalAdjustments": "payments:read",
  "CreditNotes": "payments:read",
  "GeneralLedger": "payments:read",

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
  "templateSummary": "templates:read",
  "templateConfig": "templates:read",
  "Configuration": "portal:read", // System Configuration
  "PermissionManagement": "role:permission:assign",
  "RoleManagement": "role:read",
  "UserManagement": "user:read",
  "ProductTypesManagement": "portal:read",
  "TenantManagement": "tenant:read",
  "TenantOffices": "tenant:read",
  "TenantDepartments": "tenant:read",
  "PolicyClientExample": "portal:read",

  // Reports
  "Reports": "reporting:read",
  "AccountsReports": "reporting:read",
  "CancelledMembersReport": "reporting:read",
  "JoinersReport": "reporting:read",
  "LeaversReport": "crm:member:read",
  "NewMembersReport": "reporting:read",
  "ResignedMembersReport": "reporting:read",
  "ComparisonReport": "reporting:read",
  "LiveStatsReport": "reporting:read",
  "MembershipListingReport": "reporting:read",
  "StatisticsReport": "reporting:read",
  "WorkplaceBreakdownReport": "reporting:read",
  "CreditorsListReport": "reporting:read",
  "DebtorsListReport": "reporting:read",
  "SuspendedMembersReport": "crm:member:read",

  // Cases & Issues
  // Reachability floor only - real team-based visibility (Complaints/FTP/IR/Data
  // Protection) is always enforced server-side by issue-service, never by this string.
  // CasesById is left on its pre-existing permission: it's also used as a per-member
  // "Cases" tab (component/common/AppTabs.jsx) and profile sub-nav item
  // (component/common/SideNav.jsx) outside Issue Management's scope, not just a dead
  // duplicate grid as originally assumed - see the task's own report for detail.
  "CasesSummary": "issues:read",
  "IssuesManagementDashboard": "issues:read",
  "FindIssues": "issues:read",
  "CasesById": "portal:read",
  "CasesDetails": "issues:read",
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
