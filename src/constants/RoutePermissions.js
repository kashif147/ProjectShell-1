/**
 * Centralized mapping of route paths to required permissions.
 * This is used for strict route validation when accessing URLs directly.
 */
export const RoutePermissions = {
  // Profiles & Membership
  "Summary": "profile:read",
  "Details": "profile:read",
  "Members": "crm:member_read",
  "MembershipDashboard": "reporting.statistics:read",
  "Applications": "application:read",
  "PaymentForms": "application:read",
  "Transfers": "transferrequests:read",
  "ChangCateSumm": "changeofcategory:read",
  "Cancallation": "subscriptions:read",
  "YearEndRenewal": "subscriptions:write",
  "RemindersSummary": "notification:read",

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
  "InAppNotifications": "notification:read",
  "UserNotifications": "notification:read",
  "/UserNotifications": "notification:read",
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

  // Reports - PDP rollout P2: per-family codes matching reporting-service's backend checks
  // (statistics = aggregates/dashboard, listings = row-level member listings, finance =
  // creditors/debtors). "Reports" is the membership-reports hub (listing + statistics cards), so it
  // is an ANY-of array consumed via ProtectedRoute requiredPermissions in Entry.js.
  "Reports": ["reporting.statistics:read", "reporting.listings:read"],
  "AccountsReports": "reporting.finance:read",
  "CancelledMembersReport": "reporting.listings:read",
  "JoinersReport": "reporting.listings:read",
  "LeaversReport": "reporting.listings:read",
  "NewMembersReport": "reporting.listings:read",
  "ResignedMembersReport": "reporting.listings:read",
  "ComparisonReport": "reporting.statistics:read",
  "LiveStatsReport": "reporting.statistics:read",
  "MembershipListingReport": "reporting.listings:read",
  "StatisticsReport": "reporting.statistics:read",
  "WorkplaceBreakdownReport": "reporting.statistics:read",
  "CreditorsListReport": "reporting.finance:read",
  "DebtorsListReport": "reporting.finance:read",
  "SuspendedMembersReport": "reporting.listings:read",

  // Cases & Issues
  // Reachability floor only - real team-based visibility (Complaints/FTP/IR/Data
  // Protection) is always enforced server-side by issue-service, never by this string.
  // CasesById is left on its pre-existing permission: it's also used as a per-member
  // "Cases" tab (component/common/AppTabs.jsx) and profile sub-nav item
  // (component/common/SideNav.jsx) outside Issue Management's scope, not just a dead
  // duplicate grid as originally assumed - see the task's own report for detail.
  "CasesSummary": "issues:read",
  "IssuesManagementDashboard": "issues:read",
  "CasesById": "portal:read",
  "CasesDetails": "issues:read",
  // Dedicated Issue Management side-nav sections (SideNavWithAuth.js's `issuesItems`) - all
  // render CasesSummary.js pre-filtered by route. Open/Closed are cross-team, same base gate
  // as the main grid; Complaints/FTP/IR/Data Protection are each gated on their own team
  // resource, matching issue-service's own `ISSUE_TYPE_PERMISSION_MAP`
  // (services/issue.service.js) - this is the nav/route-level half of "only authorised users
  // have access to each section based on their roles"; issue-service's `GET /issues` is the
  // real, server-side enforcement (it already scopes results to the caller's granted
  // `issues-<team>:read` resources), this only keeps the route/nav link itself from being
  // reachable/visible to a user without that team's permission. Entry.js looks these up
  // without a leading slash (matching the working `"IssuesManagementDashboard"` lookup, not
  // the pre-existing `"/CasesSummary"`/`"/CasesDetails"`/`"/CasesById"` lookups above, which
  // don't actually match these keys due to the slash and so are effectively ungated today -
  // a pre-existing gap, not introduced here, and left alone since fixing it isn't this task).
  "CasesSummaryClosed": "issues:read",
  "Complaints": "issues-complaints:read",
  "FitnessToPractice": "issues-ftp:read",
  "IndustrialRelations": "issues-ir:read",
  "DataProtection": "issues-dataprotection:read",
  "ClaimSummary": "portal:read",
  "ClaimsDetails": "portal:read",
  "ClaimsById": "portal:read",

  // Events
  "EventsDashboard": "events:read",
  "EventsSummary": "events:read",
  "EventDetails": "events:read",
  // P5 organiser check-in scan - the backend requires CRM + events:write.
  "CheckinScan": "events:write",
  "Attendees": "portal:read",
  "Reporting": "portal:read",
  "EventsSettings": "portal:read",

  // Portal/Other
};

export default RoutePermissions;
