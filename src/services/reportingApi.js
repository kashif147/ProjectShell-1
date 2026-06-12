import axios from "axios";
import { getReportingServiceBaseUrl } from "../config/serviceUrls";

function getBaseUrl() {
  const url = getReportingServiceBaseUrl();
  if (!url) {
    throw new Error(
      "REACT_APP_REPORTING_SERVICE_URL is not configured (e.g. http://localhost/reporting-service/api)"
    );
  }
  return url;
}

export function getReportingAuthHeaders() {
  const token = localStorage.getItem("token");
  const tenantId =
    localStorage.getItem("tenantId") || sessionStorage.getItem("tenantId");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;
  return headers;
}

function formatReportingError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const upstream =
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.error?.message === "string" && data.error.message) ||
    (typeof data?.error === "string" && data.error) ||
    (typeof data === "string" ? data : null);

  if (status === 502 || status === 503 || status === 504) {
    return new Error(
      upstream ||
        "Reporting service timed out (gateway error). For workplace breakdown, use Filter with fewer rolling months, or build snapshots via the admin snapshot job first.",
    );
  }
  if (status === 401 || status === 403) {
    return new Error(upstream || "Not authorized to run this report.");
  }
  if (status === 400) {
    return new Error(upstream || "Invalid report request.");
  }
  return new Error(
    upstream || error?.message || "Reporting service request failed",
  );
}

/** Unwrap `{ status, data, meta }` from reporting-service or return body as-is. */
function unwrapReportingPayload(body) {
  if (!body || typeof body !== "object") return body;
  if (body.data !== undefined && (body.status != null || body.meta != null)) {
    return body.data;
  }
  return body;
}

async function post(path, body = {}) {
  try {
    const response = await axios.post(`${getBaseUrl()}${path}`, body, {
      headers: getReportingAuthHeaders(),
      timeout: 120000,
    });
    return unwrapReportingPayload(response.data);
  } catch (error) {
    throw formatReportingError(error);
  }
}

export const reportingApi = {
  getMembershipDashboard: (filters = {}) =>
    post("/dashboard/membership", { filters }),

  getMembershipListing: (filters = {}) =>
    post("/reports/membership/listing", filters),

  getPresetReport: (reportType, body = {}) =>
    post(`/reports/membership/preset/${reportType}`, body),

  getComparisonReport: (body) => post("/reports/membership/compare", body),

  getLiveStats: (body) => post("/reports/membership/live-stats", body),

  getMembershipStatistics: (body) =>
    post("/reports/membership/statistics", body),

  getWorkplaceBreakdown: (body) =>
    post("/reports/membership/workplace-breakdown", body),

  getCreditorsList: (body) =>
    post("/reports/membership/creditors-list", body),

  getDebtorsList: (body) =>
    post("/reports/membership/debtors-list", body),

  buildSnapshot: (period) =>
    post("/reports/membership/snapshots/build", { period }),
};

export default reportingApi;
