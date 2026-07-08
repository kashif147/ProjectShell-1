import axios from "axios";
import { getAuditServiceBaseUrl } from "../config/serviceUrls";

const USER_SERVICE_BASE =
  process.env.REACT_APP_POLICY_SERVICE_URL ||
  process.env.REACT_APP_USER_SERVICE_URL ||
  "";

export function getAuditAuthHeaders() {
  const token = localStorage.getItem("token");
  const tenantId =
    localStorage.getItem("tenantId") || sessionStorage.getItem("tenantId");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;
  return headers;
}

function unwrapAuditPayload(body) {
  if (!body || typeof body !== "object") return body;
  if (body.data !== undefined && body.status != null) return body.data;
  return body;
}

/**
 * Member profile audit history with field-level diffs (not full JSON).
 * @param {object} params
 * @param {string} params.profileId
 * @param {string[]} [params.subscriptionIds]
 * @param {string[]} [params.applicationIds]
 * @param {string} [params.resourceType] - profile | subscription | application | finance
 * @param {string} [params.membershipNumber] - match finance rows by membership number
 */
export async function fetchMemberAuditHistory({
  profileId,
  subscriptionIds = [],
  applicationIds = [],
  membershipNumber,
  resourceType,
}) {
  const base = getAuditServiceBaseUrl();
  if (!base) {
    throw new Error(
      "REACT_APP_AUDIT_SERVICE_URL is not configured (e.g. https://host/audit-service/api)",
    );
  }

  const qs = new URLSearchParams();
  if (subscriptionIds.length) {
    qs.set("subscriptionIds", subscriptionIds.join(","));
  }
  if (applicationIds.length) {
    qs.set("applicationIds", applicationIds.join(","));
  }
  if (membershipNumber) {
    qs.set("membershipNumber", String(membershipNumber));
  }
  if (resourceType) qs.set("resourceType", resourceType);
  qs.set("diffOnly", "true");

  const url = `${base}/audit-logs/member/${encodeURIComponent(profileId)}?${qs.toString()}`;
  try {
    const { data } = await axios.get(url, { headers: getAuditAuthHeaders() });
    const payload = unwrapAuditPayload(data);
    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      total: payload?.total ?? 0,
      changeCount: payload?.changeCount ?? 0,
    };
  } catch (err) {
    const status = err?.response?.status;
    if (status === 502 || status === 503 || status === 504) {
      throw new Error(
        "Audit service is unavailable (gateway 502). On the VM, check that the audit-service container is running on gateway_app-net and that default.conf proxies /audit-service/api/ to audit-service:4006.",
      );
    }
    if (status === 401 || status === 403) {
      throw new Error(
        "Not authorized to view audit history. Your CRM role needs audit:read permission.",
      );
    }
    throw err;
  }
}

/**
 * CRM users for resolving audit actor ids to display names (fallback when API has no actorDisplayName).
 */
export async function fetchCrmUsersForActorLookup() {
  const base = USER_SERVICE_BASE.replace(/\/$/, "");
  if (!base) return [];

  try {
    const { data } = await axios.get(`${base}/users`, {
      headers: getAuditAuthHeaders(),
    });
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}
