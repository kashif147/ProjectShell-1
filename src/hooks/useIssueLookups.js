import { useEffect, useState } from "react";
import { fetchIssueDropdownLookups, fetchIssueStatuses } from "../services/issuesApi";

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
};

/**
 * Issue Type + Origin + Issue Source + Priority + Complaint Type dropdown options, sourced
 * from user-service's Lookup system via issue-service's single GET /issue-dropdown-lookups
 * proxy - replaces the formerly-hardcoded ISSUE_TYPES/ORIGINS/ISSUE_SOURCES/PRIORITIES/
 * COMPLAINT_TYPES constants in issueOptions.js. All 5 are flat from the frontend's
 * perspective (Complaint Type is scoped server-side to the fixed COMPLAINT Issue Type, not
 * caller-supplied), fetched together in one request - calling these as separate endpoints on
 * the same mount was enough concurrent traffic from one client to trip the gateway's
 * per-client rate limit on an ordinary page load. Use useIssueStatusOptions() separately for
 * Issue Status, which genuinely depends on the selected Issue Type and can't be prefetched
 * up front.
 */
export function useIssueDropdownLookups() {
  const [lookups, setLookups] = useState(EMPTY_DROPDOWN_LOOKUPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return { ...lookups, loading };
}

/**
 * Issue Status dropdown options for a given Issue Type code, sourced from user-service's
 * Lookup system (LookupType code "ISSUSTATUS", scoped to the Issue Type via the Lookup
 * hierarchy - see issue-service/services/lookup.service.client.js's fetchIssueStatuses).
 * Statuses are type-dependent: refetches whenever `issueTypeCode` changes, and returns an
 * empty list (not an error) when no issue type is selected yet.
 */
export function useIssueStatusOptions(issueTypeCode) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issueTypeCode) {
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
  }, [issueTypeCode]);

  return { options, loading };
}
