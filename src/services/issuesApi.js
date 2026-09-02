import axios from "axios";
import { getIssueServiceBaseUrl } from "../config/serviceUrls";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

// Issues
export async function fetchIssues(params = {}) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issues`, {
    params,
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Not consumed by the Issues grid yet - needed by the CasesDetails.js rewrite
// (a separate, later task), building it now since it's trivial and belongs
// alongside fetchIssues in the same client module.
export async function fetchIssueById(id) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issues/${id}`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Used by CreateCasesDrawer.jsx's Save button. `payload.issueType` selects the
// discriminator on the backend (issue.controller.js's createIssue) - issue-service rejects
// anything else with a 400.
export async function createIssue(payload) {
  const { data } = await axios.post(`${getIssueServiceBaseUrl()}/issues`, payload, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Generic field update (PUT /issues/:id) - base + discriminator fields, member/group
// linking. NOT for issueStatus/resolution/dateResolved-only changes - use
// updateIssueStatus for those (issue-service's dedicated endpoint, matches its own
// audit/notification side effects on referredToThirdParty/outcomeReceivedFromThirdParty).
export async function updateIssue(id, payload) {
  const { data } = await axios.put(`${getIssueServiceBaseUrl()}/issues/${id}`, payload, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// PUT /issues/:id/status - accepts only issueStatus, issueStatusOther, resolution,
// resolutionOther, dateResolved (see issue.controller.js's updateIssueStatus).
export async function updateIssueStatus(id, payload) {
  const { data } = await axios.put(
    `${getIssueServiceBaseUrl()}/issues/${id}/status`,
    payload,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

export async function fetchActivities(issueId, params = {}) {
  const { data } = await axios.get(
    `${getIssueServiceBaseUrl()}/issues/${issueId}/activities`,
    { params, headers: authHeaders() },
  );
  return unwrap({ data });
}

// sendNotification defaults true server-side (Activity model) unless explicitly false - the
// log-activity form's checkbox should be checked by default to match.
export async function createActivity(issueId, payload) {
  const { data } = await axios.post(
    `${getIssueServiceBaseUrl()}/issues/${issueId}/activities`,
    payload,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// PUT /activities/:activityId - edits an already-logged activity (body/subject/
// pertinentToFileReview/sendNotification/visibleToMember/etc). issue-service strips
// _id/tenantId/issueId/createdBy from the payload server-side regardless of what's sent.
export async function updateActivity(activityId, payload) {
  const { data } = await axios.put(
    `${getIssueServiceBaseUrl()}/activities/${activityId}`,
    payload,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// DELETE /activities/:activityId - soft-delete (issue-service preserves the content so the
// History tab's DELETED entry can show what was actually removed - see
// models/activity.model.js's meta field doc comment).
export async function deleteActivity(activityId) {
  const { data } = await axios.delete(`${getIssueServiceBaseUrl()}/activities/${activityId}`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /issues/:id/history - the Case Details "History" tab's real data source
// (controllers/issueActivity.controller.js's listHistory), replacing what was previously a
// hardcoded single mock entry. Each row: {entityType, entityId, action, summary,
// changedFields, actorId, actorEmail, createdAt}.
export async function fetchIssueHistory(issueId) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issues/${issueId}/history`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /issues/search?q= - "Find Issues" (see issue.controller.js's searchIssues). One
// unified query string matched against internalReferenceNumber/caseFileNumber/wrcCaseNumber
// locally, issueType on exact match, and membership no/email/surname/forename/mobile via
// profile-service's member search - NOT dob/NMBI/address/workplace, a documented backend
// gap, not something to work around here. Same Issue document shape as fetchIssues.
export async function searchIssues(q) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issues/search`, {
    params: { q },
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// IR-only. GET /issue-designations?search= - a thin read-through proxy over user-service's
// Lookup system, no "fetch all" - always pass a query (see
// issue-service/services/lookup.service.client.js's searchIssueDesignations).
export async function searchIssueDesignations(query) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issue-designations`, {
    params: { search: query },
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /issue-dropdown-lookups - Issue Type + Origin + Issue Source + Priority + Complaint
// Type + Criteria Letter Status + Legislation + Case Type + all-types Issue Status (for the
// Issues grid's "Case Status" toolbar filter) in one round trip. Prefer this over calling
// the individual endpoints separately: firing several as independent requests on every
// Create/Edit Cases mount was enough concurrent traffic from one client to trip the
// gateway's per-client rate limit (nginx api_rate zone, see frontend default.conf) on an
// ordinary page load. Returns {issueTypes, origins, issueSources, priorities, complaintTypes,
// criteriaLetterStatuses, legislations, caseTypes, allIssueStatuses}, each
// [{id, code, displayName}].
export async function fetchIssueDropdownLookups() {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issue-dropdown-lookups`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /issue-types - a thin read-through proxy over user-service's Lookup system (LookupType
// code "ISST"), replacing the formerly-hardcoded ISSUE_TYPES constant. Returns
// [{id, code, displayName}]; `code` is the value to submit as `issueType`. Prefer
// fetchIssueDropdownLookups() when also fetching origins/issue sources on the same mount.
export async function fetchIssueTypes() {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issue-types`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /issue-statuses?issueType=<code> - Issue Status options are scoped to a given Issue
// Type (Lookup hierarchy: each status is a child of its Issue Type's Lookup value, see
// issue-service/services/lookup.service.client.js's fetchIssueStatuses). Returns
// [{id, code, displayName}]; `code` is the value to submit as `issueStatus`.
export async function fetchIssueStatuses(issueType) {
  if (!issueType) return [];
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issue-statuses`, {
    params: { issueType },
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /resolutions?issueType=<code> - Resolution options are scoped to a given Issue Type
// (Lookup hierarchy, currently only seeded under FTP/IR - see
// issue-service/services/lookup.service.client.js's fetchResolutions). Returns
// [{id, code, displayName}]; `code` is the value to submit as `resolution`.
export async function fetchResolutions(issueType) {
  if (!issueType) return [];
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/resolutions`, {
    params: { issueType },
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /origins - a thin read-through proxy over user-service's Lookup system (LookupType code
// "ORIGIN"), replacing the formerly-hardcoded ORIGINS constant. Flat list, no issue-type
// dependency. Returns [{id, code, displayName}]; `code` is the value to submit as `origin`.
export async function fetchOrigins() {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/origins`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /issues/:id/attachments - flattened list of every attachment logged against this
// issue (issueActivity.controller.js's listIssueAttachments). Each entry carries
// {activityId, index} - the pair getAttachmentDownloadUrl/uploadIssueAttachment need.
export async function fetchIssueAttachments(issueId) {
  const { data } = await axios.get(
    `${getIssueServiceBaseUrl()}/issues/${issueId}/attachments`,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// POST /issues/:id/attachments (multipart) - uploads a file and files it against the issue
// as a bare Activity (see issueActivity.controller.js's uploadIssueAttachment doc comment
// for why there's no separate Issue-level document model). 25MB/PDF+image limit, enforced
// by middlewares/upload.mw.js server-side.
export async function uploadIssueAttachment(issueId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axios.post(
    `${getIssueServiceBaseUrl()}/issues/${issueId}/attachments`,
    formData,
    { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } },
  );
  return unwrap({ data });
}

// GET /activities/:activityId/attachments/:index/download - resolves to a short-lived
// (15 min) Azure Blob SAS url, NOT a redirect (the route needs our Authorization header,
// which a plain browser navigation wouldn't send - see the backend controller's comment).
// Fetch this first, then window.open()/set as a download link's href - the SAS url itself
// needs no further auth.
export async function getAttachmentDownloadUrl(activityId, index) {
  const { data } = await axios.get(
    `${getIssueServiceBaseUrl()}/activities/${activityId}/attachments/${index}/download`,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// GET /issue-sources - a thin read-through proxy over user-service's Lookup system
// (LookupType code "ISSUESRC"), replacing the formerly-hardcoded ISSUE_SOURCES constant.
// Flat list, no issue-type dependency. Returns [{id, code, displayName}]; `code` is the
// value to submit as `issueSource`.
export async function fetchIssueSources() {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issue-sources`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}
