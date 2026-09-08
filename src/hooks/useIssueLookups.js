import { useEffect, useState } from "react";
import { fetchIssueDropdownLookups, fetchIssueStatuses, fetchResolutions } from "../services/issuesApi";
import { subscribeAuthReady } from "../utils/authReadyEvent";

function toSelectOptions(lookups) {
  return (lookups || [])
    .filter((lookup) => lookup?.code)
    .map((lookup) => ({ label: lookup.displayName || lookup.code, value: lookup.code }));
}

function sortByLabel(options) {
  return [...options].sort((a, b) =>
    String(a.label || "").localeCompare(String(b.label || ""), undefined, { sensitivity: "base" }),
  );
}

const isLabel = (option, label) => String(option.label || "").trim().toLowerCase() === label;

/**
 * Alphabetical, except for IR: "Other" and "Closed" are pinned as the second-last and last
 * options respectively, regardless of where they'd otherwise sort - an IR-specific ask, not
 * a general rule for every issue type.
 */
function sortStatusOptions(options, issueTypeCode) {
  const sorted = sortByLabel(options);
  if (issueTypeCode !== "IR") return sorted;

  const other = sorted.find((o) => isLabel(o, "other"));
  const closed = sorted.find((o) => isLabel(o, "closed"));
  const rest = sorted.filter((o) => o !== other && o !== closed);
  return [...rest, ...(other ? [other] : []), ...(closed ? [closed] : [])];
}

const EMPTY_DROPDOWN_LOOKUPS = {
  issueTypeOptions: [],
  originOptions: [],
  issueSourceOptions: [],
  priorityOptions: [],
  complaintTypeOptions: [],
  criteriaLetterStatusOptions: [],
  legislationOptions: [],
  caseTypeOptions: [],
  allIssueStatusOptions: [],
};

/**
 * True once a JWT is actually in localStorage - checked directly rather than via
 * AuthorizationContext because these hooks are called both inside AND outside that context's
 * tree (FilterContext.js's FilterProvider is mounted in index.js *above*
 * <App />/<Entry />/AuthorizationProvider, so no context signal is available there at all).
 * A plain localStorage check works identically everywhere, no tree-position assumptions.
 */
function hasAuthToken() {
  return !!localStorage.getItem("token");
}

/**
 * Re-renders whenever a token becomes available (immediately, if one already exists at mount
 * - e.g. a page refresh while already logged in - and again on the `auth-token-ready` event
 * Login.js fires right after storing a fresh one). Lets a hook that skipped its fetch
 * pre-login retry automatically once login completes, instead of being permanently stuck
 * with no token and no fetch (see utils/authReadyEvent.js's doc comment).
 */
function useAuthTokenTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeAuthReady(() => setTick((t) => t + 1)), []);
  return tick;
}

/**
 * Issue Type + Origin + Issue Source + Priority + Complaint Type + Criteria Letter Status +
 * Legislation + Case Type dropdown options, sourced from user-service's Lookup system via
 * issue-service's single GET /issue-dropdown-lookups proxy - replaces the formerly-hardcoded
 * ISSUE_TYPES/ORIGINS/ISSUE_SOURCES/PRIORITIES/COMPLAINT_TYPES/CRITERIA_LETTER_STATUSES/
 * LEGISLATIONS/IR_CASE_TYPES constants in issueOptions.js. All 8 are flat from the frontend's
 * perspective (Complaint Type is scoped server-side to the fixed COMPLAINT Issue Type, not
 * caller-supplied), fetched together in one request - calling these as separate endpoints on
 * the same mount was enough concurrent traffic from one client to trip the gateway's
 * per-client rate limit on an ordinary page load. Use useIssueStatusOptions()/
 * useResolutionOptions() separately for Issue Status/Resolution, which genuinely depend on
 * the selected Issue Type and can't be prefetched up front.
 *
 * `reloadKey` (optional) re-runs the fetch whenever it changes - pass a value that only
 * changes when you actually want a fresh fetch (e.g. CreateCasesDrawer.jsx bumps one only on
 * open transitions). Without it, this only ever fetches once per component instance, which
 * silently starves any consumer that's mounted long before the user needs the data (e.g. a
 * drawer that's always in the tree, only toggled via an `open` prop).
 *
 * Gated on hasAuthToken() (previously fired unconditionally on mount) - FilterContext.js's
 * FilterProvider mounts this globally at app startup, before any login, so an ungated fetch
 * here 401s on every fresh/unauthenticated page load. useAuthTokenTick() re-triggers this
 * once login actually completes.
 */
export function useIssueDropdownLookups(reloadKey) {
  const authTick = useAuthTokenTick();
  const [lookups, setLookups] = useState(EMPTY_DROPDOWN_LOOKUPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasAuthToken()) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchIssueDropdownLookups()
      .then((data) => {
        if (cancelled) return;
        setLookups({
          issueTypeOptions: toSelectOptions(data?.issueTypes),
          originOptions: toSelectOptions(data?.origins),
          issueSourceOptions: toSelectOptions(data?.issueSources),
          priorityOptions: toSelectOptions(data?.priorities),
          complaintTypeOptions: toSelectOptions(data?.complaintTypes),
          criteriaLetterStatusOptions: toSelectOptions(data?.criteriaLetterStatuses),
          legislationOptions: toSelectOptions(data?.legislations),
          caseTypeOptions: toSelectOptions(data?.caseTypes),
          allIssueStatusOptions: toSelectOptions(data?.allIssueStatuses),
        });
      })
      .catch(() => {
        if (!cancelled) setLookups(EMPTY_DROPDOWN_LOOKUPS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, authTick]);

  return { ...lookups, loading };
}

/**
 * Issue Status dropdown options for a given Issue Type code, sourced from user-service's
 * Lookup system (LookupType code "ISSUSTATUS", scoped to the Issue Type via the Lookup
 * hierarchy - see issue-service/services/lookup.service.client.js's fetchIssueStatuses).
 * Statuses are type-dependent: refetches whenever `issueTypeCode` changes, and returns an
 * empty list (not an error) when no issue type is selected yet. Gated on hasAuthToken() for
 * the same reason useIssueDropdownLookups is above.
 */
export function useIssueStatusOptions(issueTypeCode) {
  const authTick = useAuthTokenTick();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issueTypeCode || !hasAuthToken()) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    fetchIssueStatuses(issueTypeCode)
      .then((data) => {
        if (!cancelled) setOptions(sortStatusOptions(toSelectOptions(data), issueTypeCode));
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [issueTypeCode, authTick]);

  return { options, loading };
}

/**
 * Resolution dropdown options for a given Issue Type code, sourced from user-service's
 * Lookup system (LookupType code "RESOLUTON", scoped to the Issue Type via the Lookup
 * hierarchy - currently only seeded under FTP/IR, see
 * issue-service/services/lookup.service.client.js's fetchResolutions). Type-dependent, same
 * shape as useIssueStatusOptions() above; returns an empty list (not an error) for an issue
 * type with no resolutions configured, or when no issue type is selected yet.
 */
export function useResolutionOptions(issueTypeCode) {
  const authTick = useAuthTokenTick();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issueTypeCode || !hasAuthToken()) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    fetchResolutions(issueTypeCode)
      .then((data) => {
        if (!cancelled) setOptions(toSelectOptions(data));
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [issueTypeCode, authTick]);

  return { options, loading };
}
