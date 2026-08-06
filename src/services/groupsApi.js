import axios from "axios";
import { getProfileServiceBaseUrl } from "../config/serviceUrls";

// Client for profile-service's Group feature (models/group.model.js, routes/group.routes.js,
// mounted at /api/groups) - the "To link multiple issues, user should be able to create a
// group..." requirement. Lives in profile-service (it already owns every Profile field used
// by DYNAMIC criteria), consumed here by the Issue Management pages' GroupPicker
// (component/cases/GroupPicker.jsx) - see that file for the UI. Same
// authHeaders()/unwrap() pattern as issuesApi.js, pointed at profile-service instead.

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

// GET /groups?search=&workplace=&branch=&region=&iroUserId=&page=&limit= - returns
// { groups, total, page, limit } (services/group.service.js#listGroups).
export async function fetchGroups(params = {}) {
  const { data } = await axios.get(`${getProfileServiceBaseUrl()}/groups`, {
    params,
    headers: authHeaders(),
  });
  return unwrap({ data });
}

export async function fetchGroupById(id) {
  const { data } = await axios.get(`${getProfileServiceBaseUrl()}/groups/${id}`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// GET /groups/:id/members - STATIC resolves the saved id list, DYNAMIC re-evaluates the
// criteria live against Profile on every call (never cached, per
// services/group.service.js#resolveGroupMembers). Returns
// { groupId, name, membershipMode, total, members, unresolvedCriteria }.
export async function fetchGroupMembers(groupId) {
  const { data } = await axios.get(`${getProfileServiceBaseUrl()}/groups/${groupId}/members`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// payload: { name, description?, membershipMode: "STATIC"|"DYNAMIC", staticMemberIds?,
// criteria? } - see profile-service's controllers/group.controller.js#buildGroupPayload for
// exact validation.
export async function createGroup(payload) {
  const { data } = await axios.post(`${getProfileServiceBaseUrl()}/groups`, payload, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}
