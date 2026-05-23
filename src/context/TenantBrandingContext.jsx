import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { applyTenantBranding, resetTenantBranding } from "../utils/applyTenantBranding";
import {
  clearTenantBrandingCache,
  fetchTenantBranding,
  resolveTenantId,
} from "../services/tenantBrandingService";

const TenantBrandingContext = createContext({
  branding: null,
  loading: false,
  refreshBranding: async () => {},
});

export const BRANDING_REFRESH_EVENT = "projectshell:tenant-branding-refresh";

export const TenantBrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshBranding = useCallback(async () => {
    const tenantId = resolveTenantId();
    const token = localStorage.getItem("token");

    if (!token || !tenantId) {
      resetTenantBranding();
      setBranding(null);
      return null;
    }

    setLoading(true);
    try {
      const resolved = await fetchTenantBranding(tenantId);
      applyTenantBranding(resolved);
      setBranding(resolved);
      return resolved;
    } catch (err) {
      console.warn("TenantBranding: failed to load branding", err?.message || err);
      const fallback = applyTenantBranding({});
      setBranding(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBranding();

    const onRefresh = () => refreshBranding();
    const onStorage = (e) => {
      if (e.key === "token" || e.key === "userData") {
        refreshBranding();
      }
    };

    window.addEventListener(BRANDING_REFRESH_EVENT, onRefresh);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(BRANDING_REFRESH_EVENT, onRefresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshBranding]);

  return (
    <TenantBrandingContext.Provider
      value={{ branding, loading, refreshBranding }}
    >
      {children}
    </TenantBrandingContext.Provider>
  );
};

export const useTenantBranding = () => useContext(TenantBrandingContext);

export const notifyBrandingRefresh = () => {
  window.dispatchEvent(new CustomEvent(BRANDING_REFRESH_EVENT));
};

export const clearBrandingOnLogout = () => {
  clearTenantBrandingCache();
  resetTenantBranding();
  notifyBrandingRefresh();
};

export default TenantBrandingContext;
