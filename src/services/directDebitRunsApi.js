import { getAccountServiceBaseUrl } from "../config/serviceUrls";

function authHeaders() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const tenantId =
    localStorage.getItem("tenantId") || sessionStorage.getItem("tenantId");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;
  return headers;
}

async function request(path, options = {}) {
  const base = getAccountServiceBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.message ||
      json?.data?.message ||
      json?.errors?.[0]?.msg ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json?.data ?? json;
}

export const directDebitRunsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.limit) q.set("limit", params.limit);
    if (params.skip) q.set("skip", params.skip);
    const qs = q.toString();
    return request(`/direct-debit-runs${qs ? `?${qs}` : ""}`);
  },
  get: (id) => request(`/direct-debit-runs/${id}`),
  getItems: (id, params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.limit != null) q.set("limit", params.limit);
    if (params.skip != null) q.set("skip", params.skip);
    const qs = q.toString();
    return request(`/direct-debit-runs/${id}/items${qs ? `?${qs}` : ""}`);
  },
  /** Fetches all run items using paginated requests (respects API limit cap). */
  getAllItems: async function getAllItems(id, params = {}) {
    const pageSize = params.pageSize ?? 500;
    let skip = 0;
    let all = [];
    let total = null;

    while (total == null || skip < total) {
      const page = await this.getItems(id, {
        status: params.status,
        limit: pageSize,
        skip,
      });
      const batch = page?.items || [];
      total = page?.total ?? batch.length;
      all = all.concat(batch);
      skip += batch.length;
      if (batch.length === 0) break;
    }

    return { items: all, total: total ?? all.length };
  },
  create: (body) =>
    request("/direct-debit-runs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  prepare: (id) =>
    request(`/direct-debit-runs/${id}/prepare`, { method: "POST" }),
  getPrepareStatus: (id) =>
    request(`/direct-debit-runs/${id}/prepare-status`),
  validate: (id) =>
    request(`/direct-debit-runs/${id}/validate`, { method: "POST" }),
  approve: (id, notes) =>
    request(`/direct-debit-runs/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),
  generatePain008: (id) =>
    request(`/direct-debit-runs/${id}/generate-pain008?includeXml=1`, {
      method: "POST",
    }),
  markSubmitted: (id, body) =>
    request(`/direct-debit-runs/${id}/mark-submitted`, {
      method: "POST",
      body: JSON.stringify(body || {}),
    }),
  cancel: (id, reason) =>
    request(`/direct-debit-runs/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  delete: (id) =>
    request(`/direct-debit-runs/${id}`, { method: "DELETE" }),
  importPain002: (id, body) =>
    request(`/direct-debit-runs/${id}/import-pain002`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  downloadPain008Url: (id) =>
    `${getAccountServiceBaseUrl()}/direct-debit-runs/${id}/download-pain008`,
};

export default directDebitRunsApi;
