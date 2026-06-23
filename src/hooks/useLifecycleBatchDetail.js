import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getSubscriptionServiceBaseUrl } from "../config/serviceUrls";

const TERMINAL_BATCH_STATUSES = new Set([
  "ready",
  "completed",
  "failed",
  "superseded",
]);

function isBatchBuildTerminal(status) {
  return TERMINAL_BATCH_STATUSES.has(String(status || "").toLowerCase());
}

/**
 * Loads a lifecycle batch + members from subscription-service.
 * While status is non-terminal (e.g. pending_build), re-fetches on an interval.
 * Build is triggered server-side on create; this hook only reads batch state.
 */
export function useLifecycleBatchDetail({
  batchId,
  batchTitle,
  membersIncluded = "true",
  membersTier,
  membersLimit = 1000,
  mapBatch,
  pollIntervalMs = 2500,
}) {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const refetch = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!batchId || typeof mapBatch !== "function") return undefined;

    const token = localStorage.getItem("token");
    const base = getSubscriptionServiceBaseUrl();
    if (!token || !base) return undefined;

    let cancelled = false;
    let pollTimer = null;

    const membersParams = {
      included: membersIncluded,
      limit: membersLimit,
    };
    if (membersTier) membersParams.tier = membersTier;

    const fetchBatch = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const [batchRes, membersRes] = await Promise.all([
        axios.get(`${base}/reminder-batches/${batchId}`, { headers }),
        axios.get(`${base}/reminder-batches/${batchId}/members`, {
          headers,
          params: membersParams,
        }),
      ]);
      const batchDoc = batchRes?.data?.data || {};
      const rows = membersRes?.data?.data?.items || [];
      return mapBatch({
        batchId,
        batchDoc,
        rows,
        batchTitle,
      });
    };

    const load = async ({ initial = false } = {}) => {
      if (initial) setLoading(true);
      try {
        const next = await fetchBatch();
        if (cancelled) return;
        setBatch(next);
        const status = next?.status ?? next?.batchStatus;
        if (!isBatchBuildTerminal(status)) {
          pollTimer = setTimeout(() => load({ initial: false }), pollIntervalMs);
        }
      } catch {
        if (!cancelled && initial) setBatch(null);
      } finally {
        if (!cancelled && initial) setLoading(false);
      }
    };

    load({ initial: true });

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [
    batchId,
    batchTitle,
    mapBatch,
    membersIncluded,
    membersTier,
    membersLimit,
    pollIntervalMs,
    reloadToken,
  ]);

  return { batch, loading, refetch };
}

export function lifecycleBatchBuildError(batch) {
  if (!batch) return null;
  return (
    batch.buildError ||
    batch.error ||
    batch.buildProgress?.lastError ||
    null
  );
}

export function lifecycleBatchIsBuilding(batch) {
  const status = String(batch?.status || batch?.batchStatus || "").toLowerCase();
  return status === "pending_build";
}
