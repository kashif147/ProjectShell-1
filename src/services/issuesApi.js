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
