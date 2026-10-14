import { useEffect, useState } from "react";
import { fetchDefaultRoleOptions } from "../services/tenantAuthConnectionsApi";

// Successful results per organisation + connection type, shared by the Tenant Management list.
const cache = new Map();
const cacheKey = (tenantId, type) => `${tenantId}|${type}`;

/** Forget cached options (after an organisation was saved, or for tests). */
export function clearDefaultRoleOptionsCache(tenantId) {
  for (const key of [...cache.keys()]) {
    if (!tenantId || key.startsWith(`${tenantId}|`)) cache.delete(key);
  }
}

/**
 * Default-role options of organisation `tenantId` for each connection type in `types`, from the
 * server (never the signed-in user's own organisation roles). Returns
 * `{ [type]: { status: "loading" | "loaded" | "error", roles } }`; a failed load (e.g. 403) is an
 * error, never an empty list. `fresh` skips the shared cache (the edit form).
 */
export default function useDefaultRoleOptions(tenantId, types = [], { fresh = false } = {}) {
  const typesKey = [...new Set((types || []).filter(Boolean))].sort().join("|");
  const [byType, setByType] = useState({});

  useEffect(() => {
    setByType({});
    if (!tenantId || !typesKey) return undefined;
    let active = true;
    typesKey.split("|").forEach((type) => {
      const key = cacheKey(tenantId, type);
      if (!fresh && cache.has(key)) {
        setByType((prev) => ({ ...prev, [type]: { status: "loaded", roles: cache.get(key) } }));
        return;
      }
      setByType((prev) => ({ ...prev, [type]: { status: "loading", roles: [] } }));
      fetchDefaultRoleOptions(tenantId, type)
        .then((roles) => {
          cache.set(key, roles);
          if (active) setByType((prev) => ({ ...prev, [type]: { status: "loaded", roles } }));
        })
        .catch(() => {
          if (active) setByType((prev) => ({ ...prev, [type]: { status: "error", roles: [] } }));
        });
    });
    return () => {
      active = false;
    };
  }, [tenantId, typesKey, fresh]);

  return byType;
}
