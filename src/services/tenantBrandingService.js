import axios from "axios";
import AuthorizationAPI from "./AuthorizationAPI";
import { applyBrandingPlaceholders } from "../constants/tenantBrandingPlaceholders";

const TENANT_CACHE_PREFIX = "tenantRecordCache:";
const CACHE_TTL_MS = 5 * 60 * 1000;

const getTenantCache = (tenantId) => {
  try {
    const raw = sessionStorage.getItem(`${TENANT_CACHE_PREFIX}${tenantId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(`${TENANT_CACHE_PREFIX}${tenantId}`);
      return null;
    }
    return parsed.tenant;
  } catch {
    return null;
  }
};

const setTenantCache = (tenantId, tenant) => {
  sessionStorage.setItem(
    `${TENANT_CACHE_PREFIX}${tenantId}`,
    JSON.stringify({ tenant, ts: Date.now() }),
  );
};

export const clearTenantBrandingCache = (tenantId) => {
  if (tenantId) {
    sessionStorage.removeItem(`${TENANT_CACHE_PREFIX}${tenantId}`);
    sessionStorage.removeItem(`tenantBrandingCache:${tenantId}`);
  } else {
    Object.keys(sessionStorage).forEach((key) => {
      if (
        key.startsWith(TENANT_CACHE_PREFIX) ||
        key.startsWith("tenantBrandingCache:")
      ) {
        sessionStorage.removeItem(key);
      }
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

export async function fetchTenantRecord(tenantId) {
  const id = tenantId || resolveTenantId();
  if (!id) return null;

  const cached = getTenantCache(id);
  if (cached) return cached;

  const token = localStorage.getItem("token");
  if (!token) return null;

  const baseUrl = process.env.REACT_APP_POLICY_SERVICE_URL;
  const response = await axios.get(`${baseUrl}/tenants/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const tenant = response.data?.data || null;
  if (tenant) setTenantCache(id, tenant);
  return tenant;
}

export function mapOrganisationProfileToCreditorSnapshot(org = {}) {
  const name = String(org.legalName || org.tradingName || "").trim();
  const oin = String(org.sepaOriginatorIdentificationNumber || "").trim();
  const iban = String(org.iban || "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const bic = String(org.bic || "AIBKIE2DXXX")
    .replace(/\s+/g, "")
    .toUpperCase();

  return {
    name,
    oin,
    iban,
    bic,
    bankName: String(org.bankName || "").trim(),
  };
}

export function getCreditorSnapshotMissingFields(snapshot = {}) {
  const missing = [];
  if (!snapshot.name) missing.push("Creditor name (legal or trading name)");
  if (!snapshot.oin) missing.push("SEPA originator identification number (OIN)");
  if (!snapshot.iban) missing.push("Creditor IBAN");
  return missing;
}

export async function fetchTenantOrganisationProfile(tenantId) {
  const tenant = await fetchTenantRecord(tenantId);
  return tenant?.organisationProfile || null;
}

export function resolveTenantTradingName(org = {}, tenant = {}) {
  return String(
    org.tradingName ||
      org.legalName ||
      tenant?.name ||
      tenant?.tenantName ||
      tenant?.code ||
      "",
  ).trim();
}

export async function fetchTenantTradingName(tenantId) {
  const tenant = await fetchTenantRecord(tenantId);
  return resolveTenantTradingName(
    tenant?.organisationProfile || {},
    tenant || {},
  );
}

export const fetchTenantBranding = async (tenantId) => {
  const tenant = await fetchTenantRecord(tenantId);
  const branding = tenant?.branding || {};
  return applyBrandingPlaceholders(branding);
};
