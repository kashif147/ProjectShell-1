import axios from "axios";
import { getCommunicationServiceBaseUrl } from "../config/serviceUrls";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Generated letters for a member profile (Documents tab).
 */
export async function listProfileGeneratedLetters(profileId) {
  const base = getCommunicationServiceBaseUrl();
  if (!base || !profileId) return [];
  const res = await axios.get(`${base}/letters/profile/${profileId}`, {
    headers: authHeaders(),
  });
  return res.data?.data?.letters ?? [];
}

export async function downloadGeneratedLetterUrl(letter) {
  return letter?.downloadUrl || null;
}
