import axios from "axios";

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
