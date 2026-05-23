import axios from "axios";
import AuthorizationAPI from "./AuthorizationAPI";
import { applyBrandingPlaceholders } from "../constants/tenantBrandingPlaceholders";

const CACHE_PREFIX = "tenantBrandingCache:";
const CACHE_TTL_MS = 5 * 60 * 1000;

const getCache = (tenantId) => {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${tenantId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${tenantId}`);
      return null;
    }
    return parsed.branding;
  } catch {
    return null;
  }
};

const setCache = (tenantId, branding) => {
  sessionStorage.setItem(
    `${CACHE_PREFIX}${tenantId}`,
    JSON.stringify({ branding, ts: Date.now() })
  );
};

export const clearTenantBrandingCache = (tenantId) => {
  if (tenantId) {
    sessionStorage.removeItem(`${CACHE_PREFIX}${tenantId}`);
  } else {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(key);
    });
  }
};

export const resolveTenantId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = AuthorizationAPI.decodeToken(token);
  if (decoded?.tenantId) return decoded.tenantId;

  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    return userData.tenantId || userData.tenant_id || null;
  } catch {
    return null;
  }
};

export const fetchTenantBranding = async (tenantId) => {
  if (!tenantId) return applyBrandingPlaceholders({});

  const cached = getCache(tenantId);
  if (cached) return applyBrandingPlaceholders(cached);

  const token = localStorage.getItem("token");
  if (!token) return applyBrandingPlaceholders({});

  const baseUrl = process.env.REACT_APP_POLICY_SERVICE_URL;
  const response = await axios.get(`${baseUrl}/tenants/${tenantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const branding = response.data?.data?.branding || {};
  const withPlaceholders = applyBrandingPlaceholders(branding);
  setCache(tenantId, branding);
  return withPlaceholders;
};
