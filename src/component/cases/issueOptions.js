import dayjs from "dayjs";

// Shared enum option lists for the Issue Management feature (Cases). Transcribed directly
// from backend/issue-service's Mongoose models (models/issue.model.js + the 4 discriminator
// models) so the frontend dropdowns stay in lockstep with what the API actually accepts -
// see CasesDetails.js / CreateCasesDrawer.jsx / ComplaintFields.jsx / FtpFields.jsx /
// IrFields.jsx / DataProtectionFields.jsx, all of which import from here rather than
// duplicating these lists.

/** "MEMBER_ON_SERVICE_PROVIDER" -> "Member On Service Provider" */
export function enumLabel(value) {
  if (!value) return "";
  return String(value)
    .split("_")
    .map((word) => (word ? word[0] + word.slice(1).toLowerCase() : word))
    .join(" ");
}

/** ["A","B"] -> [{label:"A", value:"A"}, ...] using enumLabel() for display. */
export function toOptions(values) {
  return (values || []).map((v) => ({ label: enumLabel(v), value: v }));
}

// ---- Base Issue fields (models/issue.model.js) ----
export const ISSUE_TYPES = ["COMPLAINT", "FTP", "IR", "DP"];
export const ISSUE_TYPE_LABELS = {
  COMPLAINT: "Complaint",
  FTP: "Fitness to Practice",
  IR: "Industrial Relations",
  DP: "Data Protection",
};

export const ISSUE_STATUSES = [
  "ACTIVE",
  "ACTIVE-FTP",
  "ACTIVE-IR",
  "ACTIVE-DP",
  "ACTIVE_BEFORE_BOARD",
  "ACTIVE_INQUIRY",
  "ACTIVE_PPC",
  "PENDING_THIRD_PARTY_HEARING",
  "PENDING_RESPONSE_MEMBER",
  "PENDING_RESPONSE_EXTERNAL",
  "AWAITING_OUTCOME_THIRD_PARTY",
  "FOR_REVIEW_BY_OFFICIAL",
  "OTHER",
  "CLOSED",
];

// Issue Source and Origin are no longer static enums - both are now sourced live from
// user-service's Lookup system (LookupType codes "ISSUESRC"/"ORIGIN"), see
// hooks/useIssueLookups.js's useIssueSourceOptions()/useOriginOptions().

export const OWNER_TEAMS = ["COMPLAINTS", "FTP", "IR", "DATA_PROTECTION"];

// Resolution and Priority are no longer static enums - both are now sourced live from
// user-service's Lookup system (LookupType codes "RESOLUTON"/"PRIORITY"). Resolution is
// Issue-Type-dependent (see hooks/useIssueLookups.js's useResolutionOptions()); Priority is
// flat (see useIssueDropdownLookups()).

// ---- Activity (models/activity.model.js) ----
export const ACTIVITY_TYPES = [
  "EMAIL",
  "CALL",
  "LETTER",
  "TASK",
  "NOTE",
  "APPOINTMENT",
  "SMS",
  "SOCIAL_MEDIA_QUERY",
  "FAX",
  "ADVICE_GIVEN",
];

// ---- Complaint (models/issue.complaint.model.js) ----
// Complaint Type is no longer a static enum - sourced live from user-service's Lookup
// system (LookupType code "CMPLNTYPE"), see hooks/useIssueLookups.js's
// useIssueDropdownLookups().
export const SOLICITORS = ["O_CONNORS", "OTHER"];

// Case Type (IR) and Criteria Letter Status/Legislation (FTP) are no longer static enums -
// all sourced live from user-service's Lookup system (LookupType codes "CASETYPE"/"CLS"/
// "LEGISLATON"), see hooks/useIssueLookups.js's useIssueDropdownLookups(). Case Type drives
// whether IrFields.jsx shows the single/simple member link (INDV) or the Group-linking
// feature (GROUP/NATIONAL) - see IrFields.jsx's header comment for why NATIONAL is grouped
// with GROUP there.

// ---- Data Protection (models/issue.dataprotection.model.js) ----
export const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];
export const DP_STATUSES = ["OPEN", "CLOSED"];
export const DP_ISSUE_TYPES = ["DSAR", "DP_COMPLAINT", "DATA_BREACH"];

/** issueType -> owner.team, mirrors issue-service's auto-routing (services/issue.service.js). */
export const ISSUE_TYPE_TO_TEAM = {
  COMPLAINT: "COMPLAINTS",
  FTP: "FTP",
  IR: "IR",
  DP: "DATA_PROTECTION",
};

/**
 * issueType -> the RBAC resource slug gating that team's issues, mirrors issue-service's
 * TEAM_RESOURCE_BY_ISSUE_TYPE (services/issue.service.js). Used to scope Owner/Resolved By
 * user pickers to whichever users hold write permission on that resource - see
 * hooks/useTeamUsers.js.
 */
export const ISSUE_TYPE_TO_TEAM_RESOURCE = {
  COMPLAINT: "issues-complaints",
  FTP: "issues-ftp",
  IR: "issues-ir",
  DP: "issues-dataprotection",
};

// issueType -> the discriminator-only field names accepted by that type's model, used to
// build PUT /issues/:id payloads without leaking another type's fields (and without leaking
// server-managed fields like `complainant`/`caseFileNumber`, which are excluded on purpose -
// see issue.complaint.model.js / issue.ir.model.js).
export const TYPE_FIELDS = {
  COMPLAINT: [
    "complaintType",
    "externalSolicitorInvolved",
    "solicitor",
    "solicitorOther",
    "resolvedByUserId",
    "dueDate",
    "externalAgency",
    "externalCaseRef",
    "respondents",
    "serviceProvider",
  ],
  FTP: [
    "aragReferenceNo",
    "criteriaLetterStatus",
    "externalSolicitorInvolved",
    "solicitor",
    "solicitorOther",
    "membershipVerified",
    "dateInitialPapersReceived",
    "insurerReference",
    "legislation",
    "nmbiReference",
  ],
  IR: [
    "caseType",
    "issueDesignation",
    "correspondenceWithExternalParty",
    "resolvedByUserId",
    "membershipVerified",
    "referredToThirdParty",
    "submissionIssuedToThirdParty",
    "outcomeReceivedFromThirdParty",
    "wrcCaseNumber",
  ],
  DP: [
    "severity",
    "dpStatus",
    "dpIssueType",
    "externalAgency",
    "dpcInformed",
    "dpcInformedDatetime",
    "externalSolicitorInvolved",
    "solicitor",
    "solicitorOther",
    "dueDate",
    "resolvedByUserId",
  ],
};

/** Fields that round-trip as dayjs objects in form state and ISO strings over the wire. */
export const DATE_FIELD_NAMES = [
  "dateReceived",
  "dateResolved",
  "dueDate",
  "dateInitialPapersReceived",
  "dpcInformedDatetime",
];

/** Issue document (API shape) -> form state: date strings become dayjs instances. */
export function toFormValues(issue) {
  if (!issue) return {};
  const clone = { ...issue };
  DATE_FIELD_NAMES.forEach((field) => {
    clone[field] = clone[field] ? dayjsSafe(clone[field]) : null;
  });
  return clone;
}

function dayjsSafe(value) {
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

/** Form state -> API payload: dayjs instances become ISO strings, everything else passes through. */
export function serializeIssuePayload(values) {
  const out = {};
  Object.keys(values || {}).forEach((key) => {
    const v = values[key];
    if (v && typeof v === "object" && typeof v.toISOString === "function" && typeof v.isValid === "function") {
      out[key] = v.isValid() ? v.toISOString() : null;
    } else {
      out[key] = v;
    }
  });
  return out;
}

/** Build a PUT /issues/:id payload from form state: base editable fields + this issueType's fields. */
export function buildIssueUpdatePayload(values, issueType, extraBaseFields = []) {
  const baseFields = [
    "description",
    "availability",
    "issueSource",
    "issueSourceOther",
    "origin",
    "priority",
    "dateReceived",
    "linkedIssueIds",
    "owner",
    "groupId",
    ...extraBaseFields,
  ];
  const typeFields = TYPE_FIELDS[issueType] || [];
  const picked = {};
  [...baseFields, ...typeFields].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(values || {}, field)) {
      picked[field] = values[field];
    }
  });
  return serializeIssuePayload(picked);
}

/**
 * Build a POST /issues payload from the Create drawer's form state. caseTitle,
 * internalReferenceNumber, complainant, caseFileNumber and owner.team are deliberately
 * never sent - issue-service's services/issue.service.js#prepareNewIssue always derives
 * them server-side (owner.userId is the one exception: only IR auto-resolves it, so it's
 * still included here for the other 3 types to support manual assignment on create).
 */
export function buildIssueCreatePayload(values, issueType) {
  const baseFields = [
    "description",
    "availability",
    "issueSource",
    "issueSourceOther",
    "origin",
    "priority",
    "dateReceived",
    "memberIds",
    "groupId",
    "linkedIssueIds",
    "issueStatus",
    "issueStatusOther",
    "owner",
  ];
  const typeFields = TYPE_FIELDS[issueType] || [];
  const picked = { issueType };
  [...baseFields, ...typeFields].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(values || {}, field)) {
      picked[field] = values[field];
    }
  });
  return serializeIssuePayload(picked);
}

/** Build a PUT /issues/:id/status payload - only the fields that endpoint accepts. */
export function buildIssueStatusPayload(values) {
  const picked = {};
  ["issueStatus", "issueStatusOther", "resolution", "resolutionOther", "dateResolved"].forEach(
    (field) => {
      if (Object.prototype.hasOwnProperty.call(values || {}, field)) {
        picked[field] = values[field];
      }
    },
  );
  return serializeIssuePayload(picked);
}
