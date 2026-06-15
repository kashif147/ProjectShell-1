/**
 * User-facing labels for audit field paths.
 * Prefer MembershipForm / grid column titles over raw schema paths.
 */

const ACTION_LABELS = {
  PROFILE_CREATED: "Profile created",
  PROFILE_UPDATED: "Profile updated",
  PROFILE_DELETED: "Profile deleted",
  PROFILE_DUPLICATE_DETECTION_RUN: "Profile duplicate scan",
  PROFILE_DUPLICATE_MERGED: "Profile duplicate merged",
  DUPLICATE_DETECTION_RUN: "Application duplicate scan",
  DUPLICATE_REVIEW_DECIDED: "Duplicate review decision",
  DUPLICATE_PROFILE_LINKED: "Duplicate profile linked",
  DUPLICATE_PROFILE_MERGED: "Duplicate profile merged",
  DUPLICATE_MATCH_IGNORED: "Duplicate match ignored",
  DUPLICATE_MARKED_NEW: "Marked as new member",
  SUBSCRIPTION_FIELDS_UPDATED: "Subscription updated",
  SUBSCRIPTION_UPDATED: "Subscription updated",
  REMINDER_DATES_CHANGED: "Reminder dates changed",
  CANCELLATION_DATES_CHANGED: "Cancellation dates changed",
  UNDERGRADUATE_GRADUATION_CANCELLED: "Undergraduate graduation cancellation",
  REMINDER_BATCH_CANCELLATION: "Reminder batch cancellation",
  SUBSCRIPTION_CANCEL_REQUESTED: "Subscription cancelled",
  CANCELLATION_UNDONE: "Cancellation undone",
  MEMBERSHIP_CATEGORY_CHANGED: "Membership category changed",
  APPLICATION_APPROVED: "Application approved",
  APPLICATION_REJECTED: "Application rejected",
  APPLICATION_SUBMITTED: "Application submitted",
  JOURNAL_POSTED: "General ledger posting",
  RECEIPT_POSTED: "Receipt posted",
  ONLINE_PAYMENT_RECEIPT_POSTED: "Online payment receipt posted",
  CHEQUE_RECEIPT_POSTED: "Cheque receipt posted",
  CASH_RECEIPT_POSTED: "Cash receipt posted",
  SALARY_DEDUCTION_RECEIPT_POSTED: "Salary deduction receipt posted",
  STANDING_ORDER_RECEIPT_POSTED: "Standing order receipt posted",
  DIRECT_DEBIT_RECEIPT_POSTED: "Direct debit receipt posted",
  BATCH_RECEIPT_POSTED: "Batch receipt posted",
  INVOICE_POSTED: "Invoice posted",
  CREDIT_NOTE_POSTED: "Credit note posted",
  CREDIT_NOTE_DRAFT_CREATED: "Credit note draft created",
  CREDIT_NOTE_APPROVED: "Credit note approved",
  CREDIT_NOTE_CANCELLED: "Credit note cancelled",
  REFUND_POSTED: "Refund posted",
  WRITE_OFF_POSTED: "Write-off posted",
  ADJUSTMENT_POSTED: "Adjustment posted",
  FEE_ADJUSTMENT_POSTED: "Fee adjustment posted",
  FEE_INCREASE_POSTED: "Fee increase posted",
  FEE_DECREASE_POSTED: "Fee decrease posted",
  SETTLEMENT_POSTED: "Settlement posted",
  CLAIM_POSTED: "Claim posted",
  RECEIPT_REVERSED: "Receipt reversed",
  CLAIM_REVERSED: "Claim reversed",
  MEMBER_CREDIT_APPLIED: "Member credit applied",
  PAYMENT_REASSIGNED: "Payment reassigned",
  JOURNAL_ADJUSTMENT_DRAFT_CREATED: "Journal adjustment draft created",
  JOURNAL_ADJUSTMENT_APPROVED: "Journal adjustment approved",
  JOURNAL_ADJUSTMENT_POSTED: "Journal adjustment posted",
  BATCH_PROCESS_COMPLETED: "Batch import processed",
  BATCH_PROCESS_QUEUED: "Batch import queued",
  RECONCILIATION_MANUAL_MATCHED: "Reconciliation matched",
  RECONCILIATION_MOVED_TO_SUSPENSE: "Reconciliation moved to suspense",
  RECONCILIATION_SETTLED: "Reconciliation settled",
  ONLINE_PAYMENT_CREATED: "Online payment initiated",
  ONLINE_PAYMENT_COMPLETED: "Online payment completed",
};

/** Exact dotted paths from audit diffs (profile, application, subscription). */
const PATH_LABELS = {
  "reminders.reminder1At": "First Reminder",
  "reminders.reminder2At": "Second Reminder",
  "reminders.reminder3At": "Third Reminder",
  "reminders.cancellationBatchNotifiedAt": "Cancellation batch notified",
  "reminders.reminderCancellationBatchId": "Reminder cancellation batch",
  "cancellation.dateCancelled": "Cancellation / Resignation Date",
  "cancellation.reason": "Cancellation / Resignation Reason",
  "cancellation.reinstated": "Reinstated",
  "subscriptionDetails.membershipCategory": "Membership Category",
  "subscriptionDetails.membershipMovement": "Membership Movement",
  "subscriptionDetails.paymentType": "Payment Type",
  "subscriptionDetails.paymentFrequency": "Payment Frequency",
  "subscriptionDetails.membershipStatus": "Membership Status",
  "subscriptionDetails.payrollNo": "Payroll No.",
  "subscriptionDetails.startDate": "Start Date",
  "subscriptionDetails.dateJoined": "Date Joined",
  "subscriptionDetails.submissionDate": "Submission Date",
  "subscriptionDetails.primarySection": "Primary Section",
  "subscriptionDetails.otherPrimarySection": "Other Primary Section",
  "subscriptionDetails.secondarySection": "Secondary Section",
  "subscriptionDetails.otherSecondarySection": "Other Secondary Section",
  "subscriptionDetails.termsAndConditions": "Terms and Conditions",
  "subscriptionDetails.otherIrishTradeUnion": "Other Irish Trade Union",
  "subscriptionDetails.otherScheme": "Other Scheme",
  "personalDetails.personalInfo.forename": "Forename(s)",
  "personalDetails.personalInfo.surname": "Surname",
  "personalDetails.personalInfo.title": "Title",
  "personalDetails.personalInfo.gender": "Gender",
  "personalDetails.personalInfo.dateOfBirth": "Date of Birth",
  "personalDetails.personalInfo.countryPrimaryQualification":
    "Country of Primary Qualification",
  "personalDetails.contactInfo.mobileNumber": "Mobile Number",
  "personalDetails.contactInfo.personalEmail": "Personal Email",
  "personalDetails.contactInfo.workEmail": "Work Email",
  "personalDetails.contactInfo.preferredEmail": "Preferred Email",
  "personalDetails.contactInfo.preferredAddress": "Preferred Address",
  "personalDetails.contactInfo.buildingOrHouse": "Address Line 1",
  "personalDetails.contactInfo.streetOrRoad": "Address Line 2",
  "personalDetails.contactInfo.areaOrTown": "Town/City",
  "personalDetails.contactInfo.countyCityOrPostCode": "County/State",
  "personalDetails.contactInfo.eircode": "Eircode/Postcode",
  "personalDetails.contactInfo.country": "Country",
  "professionalDetails.workLocation": "Work Location",
  "professionalDetails.grade": "Grade",
  "professionalDetails.branch": "Branch",
  "professionalDetails.region": "Region",
  "professionalDetails.primarySection": "Primary Section",
  "professionalDetails.secondarySection": "Secondary Section",
  "professionalDetails.nmbiNumber": "NMBI No. / An Bord Altranais Number",
  "professionalDetails.retiredDate": "Retirement Date",
  "professionalDetails.pensionNo": "Pension No.",
  "professionalDetails.payrollNo": "Payroll No.",
  "personalInfo.forename": "Forename(s)",
  "personalInfo.surname": "Surname",
  "personalInfo.title": "Title",
  "personalInfo.gender": "Gender",
  "personalInfo.dateOfBirth": "Date of Birth",
  "personalInfo.countryPrimaryQualification": "Country of Primary Qualification",
  "contactInfo.mobileNumber": "Mobile Number",
  "contactInfo.personalEmail": "Personal Email",
  "contactInfo.workEmail": "Work Email",
  "contactInfo.preferredEmail": "Preferred Email",
  "contactInfo.preferredAddress": "Preferred Address",
  "contactInfo.buildingOrHouse": "Address Line 1",
  "contactInfo.streetOrRoad": "Address Line 2",
  "contactInfo.areaOrTown": "Town/City",
  "contactInfo.countyCityOrPostCode": "County/State",
  "contactInfo.eircode": "Eircode/Postcode",
  "contactInfo.country": "Country",
  "contactInfo.fullAddress": "Address",
  "contactInfo.telephoneNumber": "Home / Work Tel Number",
  "contactInfo.nATA": "Not at this Address",
};

/** Leaf keys shared across profile, application, and subscription audits. */
const LEAF_LABELS = {
  title: "Title",
  forename: "Forename(s)",
  surname: "Surname",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  countryPrimaryQualification: "Country of Primary Qualification",
  deceased: "Deceased",
  deceasedDate: "Deceased Date",
  age: "Age",
  fullName: "Full Name",
  preferredAddress: "Preferred Address",
  buildingOrHouse: "Address Line 1",
  streetOrRoad: "Address Line 2",
  areaOrTown: "Town/City",
  countyCityOrPostCode: "County/State",
  eircode: "Eircode/Postcode",
  country: "Country",
  fullAddress: "Address",
  mobileNumber: "Mobile Number",
  telephoneNumber: "Home / Work Tel Number",
  preferredEmail: "Preferred Email",
  personalEmail: "Personal Email",
  workEmail: "Work Email",
  nATA: "Not at this Address",
  workLocation: "Work Location",
  otherWorkLocation: "Other Work Location",
  branch: "Branch",
  region: "Region",
  grade: "Grade",
  otherGrade: "Other Grade",
  primarySection: "Primary Section",
  otherPrimarySection: "Other Primary Section",
  secondarySection: "Secondary Section",
  otherSecondarySection: "Other Secondary Section",
  nmbiNumber: "NMBI No. / An Bord Altranais Number",
  nurseType: "Nurse Type",
  retiredDate: "Retirement Date",
  pensionNo: "Pension No.",
  studyLocation: "Study Location",
  discipline: "Discipline",
  graduationDate: "Graduation Date",
  startDate: "Start Date",
  endDate: "End Date",
  renewalDate: "Renewal Date",
  payrollNo: "Payroll No.",
  nursingAdaptationProgramme: "Nursing Adaptation Programme",
  joinYouthForum: "Youth Forum",
  youthForum: "Youth Forum selection",
  membershipCategory: "Membership Category",
  membershipStatus: "Membership Status",
  membershipNumber: "Membership Number",
  membershipNo: "Membership No",
  paymentType: "Payment Type",
  paymentFrequency: "Payment Frequency",
  membershipMovement: "Membership Movement",
  subscriptionStatus: "Membership Status",
  subscriptionYear: "Year",
  isCurrent: "Current",
  reminder1At: "First Reminder",
  reminder2At: "Second Reminder",
  reminder3At: "Third Reminder",
  dateCancelled: "Cancellation / Resignation Date",
  reason: "Cancellation / Resignation Reason",
  reinstated: "Reinstated",
  consent: "Consent",
  smsConsent: "SMS Consent",
  emailConsent: "Email Consent",
  postalConsent: "Postal Consent",
  appConsent: "App Consent",
  valueAddedServices: "Partner Consent",
  termsAndConditions: "Terms and Conditions",
  inmoRewards: "INMO Rewards",
  exclusiveDiscountsAndOffers: "Exclusive Discounts and Offers",
  incomeProtectionScheme: "Income Protection",
  otherIrishTradeUnion: "Other Irish Trade Union",
  otherIrishTradeUnionName: "Which Union?",
  otherScheme: "Other Scheme",
  applicationStatus: "Application Status",
  submissionDate: "Submission Date",
  dateJoined: "Date Joined",
  isActive: "Active",
  normalizedEmail: "Email Address",
  joiningDate: "Joining Date",
  membershipFee: "Membership Fee",
  outstandingBalance: "Outstanding Balance",
  reminderNo: "Reminder No",
  reminderDate: "Reminder Date",
  cancellationFlag: "Cancellation Flag",
  cancellation: "Cancellation",
  reminders: "Reminders",
  approvedBy: "Approved By",
  approvedAt: "Approved At",
  rejectionReason: "Rejection Reason",
  actorUserId: "Actor User",
  actorId: "Actor",
  crmUserId: "CRM User",
  userId: "User",
  reviewerId: "Reviewer",
  reviewedBy: "Reviewer",
  runBy: "Run By",
  submittedBy: "Submitted By",
  applicationId: "Application",
  tenantId: "Tenant",
  profileId: "Profile",
  matchedProfileId: "Matched Profile",
  masterProfileId: "Master Profile",
  absorbedProfileId: "Absorbed Profile",
  subscriptionId: "Subscription",
  currentSubscriptionId: "Current Subscription",
  paymentIntentId: "Payment Intent",
  memberId: "Member",
  docNo: "Document No.",
  docType: "Document Type",
  glDocNo: "GL Document No.",
  invoiceDocNo: "Invoice Document No.",
  paymentMethod: "Payment Method",
  amountCents: "Amount (cents)",
  totalDebit: "Total Debit",
  totalCredit: "Total Credit",
  batchType: "Batch Type",
  batchName: "Batch Name",
  batchDetailId: "Batch Detail",
  clearingAccountCode: "Clearing Account",
  referenceNumber: "Reference Number",
  operation: "Operation",
  id: "Record",
  _id: "Record",
};

const STRIP_PREFIXES = [
  "personalDetails.",
  "professionalDetails.",
  "subscriptionDetails.",
  "contactDetails.contactInfo.",
  "approvalDetails.",
];

function formatColumnKeyToLabel(path) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  const rightMost = raw.includes(".") ? raw.split(".").pop() : raw;
  return rightMost
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function applyLabelOverrides(label) {
  const normalized = String(label || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  const replacements = {
    "membership number": "Membership No",
    "country primary qualification": "Country of Primary Qualification",
    "normalized email": "Email Address",
    "is active": "Active",
    "subscription status": "Membership Status",
    "n ata": "Not at this Address",
  };
  return replacements[normalized] || label;
}

function lookupPathLabel(path) {
  if (!path) return null;
  if (PATH_LABELS[path]) return PATH_LABELS[path];

  for (const prefix of STRIP_PREFIXES) {
    if (path.startsWith(prefix)) {
      const stripped = path.slice(prefix.length);
      if (PATH_LABELS[stripped]) return PATH_LABELS[stripped];
      if (LEAF_LABELS[stripped]) return LEAF_LABELS[stripped];
    }
  }

  const segments = path.split(".");
  for (let start = 0; start < segments.length - 1; start += 1) {
    const suffix = segments.slice(start).join(".");
    if (PATH_LABELS[suffix]) return PATH_LABELS[suffix];
  }

  const leaf = segments[segments.length - 1];
  if (LEAF_LABELS[leaf]) return LEAF_LABELS[leaf];

  return null;
}

/**
 * Resolve an audit field path to the same style of label used on member forms/grids.
 * @param {string|null|undefined} fieldPath
 */
export function resolveAuditFieldLabel(fieldPath) {
  if (fieldPath == null || fieldPath === "") {
    return "General event";
  }

  const path = String(fieldPath);
  const resolved = lookupPathLabel(path);
  if (resolved) return resolved;

  return applyLabelOverrides(formatColumnKeyToLabel(path));
}

/**
 * @param {string} action
 * @param {string|null|undefined} field
 */
export function describeAuditChangeLabel(action, field) {
  const label =
    ACTION_LABELS[action] ||
    String(action || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  if (!field) return label;
  return `${label}: ${resolveAuditFieldLabel(field)}`;
}
