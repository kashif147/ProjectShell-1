import { useCallback, useEffect, useRef } from "react";

/**
 * Coalesces rapid report fetch triggers (template init, route mount) into one request.
 * Ignores stale responses when a newer request supersedes an in-flight call.
 */
export function useDebouncedReportFetch({
  enabled,
  fetchFn,
  deps = [],
  debounceMs = 400,
}) {
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const requestIdRef = useRef(0);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  const runFetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (inFlightRef.current) {
      pendingRef.current = true;
      return;
    }

    inFlightRef.current = true;
    const isStale = () => requestId !== requestIdRef.current;

    try {
      await fetchFnRef.current({ isStale });
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        if (requestId === requestIdRef.current) {
          runFetch();
        }
      }
    }
  }, []);

  const scheduleFetch = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runFetch();
    }, debounceMs);
  }, [debounceMs, runFetch]);

  const reloadNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return runFetch();
  }, [runFetch]);

  useEffect(() => {
    if (!enabled) return;
    scheduleFetch();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, scheduleFetch, ...deps]);

  return { reloadNow };
}
