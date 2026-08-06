import axios from "axios";
import { getProfileServiceBaseUrl } from "../config/serviceUrls";

/**
 * Base URL for profile-service API (e.g. https://host/profile-service/api).
 * Search URL: `${base}/profile/search?q=...`
 */
export function getProfileServiceApiBase() {
  return String(process.env.REACT_APP_PROFILE_SERVICE_URL || "")
    .trim()
    .replace(/\/$/, "");
}

function normalizeSearchResults(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/**
 * GET /profile/search?q= — same contract as MemberSearch / SearchProfile.
 * @param {string} query
 * @returns {Promise<object[]>} profile rows (membershipNumber, personalInfo, etc.)
 */
export async function searchProfilesByQuery(query) {
  const base = getProfileServiceApiBase();
  const q = String(query || "").trim();
  if (!base) {
    throw new Error("REACT_APP_PROFILE_SERVICE_URL is not configured");
  }
  if (q.length < 2) {
    return [];
  }
  const url = `${base}/profile/search?q=${encodeURIComponent(q)}`;
  const token = localStorage.getItem("token");
  const { data } = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const root = data?.data ?? data;
  return normalizeSearchResults(root);
}

/**
 * POST /profile/batch-lookup — CRM-authenticated (gateway JWT) batch fetch by profile `_id`,
 * profile-service's `controllers/profile.controller.js` `getProfilesBatchAuthenticated`. This
 * is the frontend counterpart issue-service's own `services/profileService.client.js`
 * `getProfilesBatch` uses server-to-server (a *different*, unauthenticated `/profile/batch`
 * route) — no equivalent existed under `src/services`/`src/api` before this, so this is a new
 * client, not a duplicate. Used to hydrate the Issues grid's `memberIds[0]` into a real
 * member name / membership number / work location (see `CasesSummary.js`).
 *
 * Response shape per profile (service's `BATCH_PROFILE_LOOKUP_SELECT`): `{ _id,
 * membershipNumber, personalInfo: { fullName, ... }, contactInfo, professionalDetails: {
 * workLocation, ... }, preferences, tenantId }`.
 * @param {string[]} profileIds
 * @returns {Promise<object[]>}
 */
export async function fetchProfilesBatchLookup(profileIds) {
  const ids = Array.from(
    new Set(
      (Array.isArray(profileIds) ? profileIds : [])
        .filter(Boolean)
        .map((id) => String(id)),
    ),
  );
  if (!ids.length) return [];
  const base = getProfileServiceBaseUrl();
  if (!base) return [];
  const token = localStorage.getItem("token");
  const { data } = await axios.post(
    `${base}/profile/batch-lookup`,
    { profileIds: ids },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  const root = data?.data ?? data;
  return Array.isArray(root) ? root : [];
}
