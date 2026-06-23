import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getSubscriptionServiceBaseUrl } from "../config/serviceUrls";

const TERMINAL_BATCH_STATUSES = new Set([
  "ready",
  "completed",
  "failed",
  "superseded",
]);

function sumCountsByTier(countsByTier) {
  if (!countsByTier || typeof countsByTier !== "object") return 0;
  return (
    (countsByTier.r1 || 0) +
    (countsByTier.r2 || 0) +
    (countsByTier.r3 || 0) +
    (countsByTier.cancel || 0)
  );
}

function isBuildStillRunning(batchDoc) {
  if (!batchDoc) return false;
  const status = String(batchDoc?.status || "").toLowerCase();
  if (status === "pending_build") return true;
  const started = batchDoc?.buildStartedAt
    ? new Date(batchDoc.buildStartedAt).getTime()
    : NaN;
  const completed = batchDoc?.buildCompletedAt
    ? new Date(batchDoc.buildCompletedAt).getTime()
    : NaN;
  if (!Number.isFinite(started)) return false;
  if (!Number.isFinite(completed)) return true;
  return completed < started;
}

function shouldContinuePolling(batchDoc, itemCount) {
  const status = String(batchDoc?.status || "").toLowerCase();
  if (isBuildStillRunning(batchDoc)) return true;
  if (status === "ready") {
    const expected = sumCountsByTier(batchDoc.countsByTier);
    if (expected > 0 && itemCount === 0) return true;
  }
  return !TERMINAL_BATCH_STATUSES.has(status);
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
  pollIntervalMs = 10000,
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

    const schedulePoll = () => {
      pollTimer = setTimeout(() => load({ initial: false }), pollIntervalMs);
    };

    const fetchBatch = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const batchRes = await axios.get(`${base}/reminder-batches/${batchId}`, {
        headers,
      });
      const batchDoc = batchRes?.data?.data || {};

      let rows = [];
      try {
        const membersRes = await axios.get(
          `${base}/reminder-batches/${batchId}/members`,
          {
            headers,
            params: membersParams,
          },
        );
        rows = membersRes?.data?.data?.items || [];
      } catch {
        // Members may be empty or the enrich call may fail while build is running.
      }

      return {
        batchDoc,
        mapped: mapBatch({
          batchId,
          batchDoc,
          rows,
          batchTitle,
        }),
        itemCount: rows.length,
      };
    };

    const load = async ({ initial = false } = {}) => {
      if (initial) setLoading(true);
      try {
        const { batchDoc, mapped, itemCount } = await fetchBatch();
        if (cancelled) return;
        setBatch(mapped);
        if (shouldContinuePolling(batchDoc, itemCount)) {
          schedulePoll();
        }
      } catch {
        if (!cancelled && initial) setBatch(null);
        if (!cancelled) schedulePoll();
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
  if (!batch) return false;
  const status = String(batch?.status || batch?.batchStatus || "").toLowerCase();
  if (status === "pending_build") return true;
  const started = batch?.buildStartedAt
    ? new Date(batch.buildStartedAt).getTime()
    : NaN;
  const completed = batch?.buildCompletedAt
    ? new Date(batch.buildCompletedAt).getTime()
    : NaN;
  if (!Number.isFinite(started)) return false;
  if (!Number.isFinite(completed)) return true;
  return completed < started;
}
