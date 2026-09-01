import { useEffect, useState } from "react";
import { fetchUsersByPermission } from "../services/roleUsersService";

// {value, label} - works directly with both CustomSelect (isIDs falls back to opt.value when
// opt.key is absent) and plain antd Select (CasesDetails.js's summary panel), unlike
// utils/officerRoles.js's mapUsersToSelectOptions() which is {key, label}-shaped for
// CustomSelect specifically.
function toUserOptions(users) {
  return (Array.isArray(users) ? users : []).map((user) => ({
    value: user._id || user.id,
    label:
      user.userFullName ||
      [user.userFirstName, user.userLastName].filter(Boolean).join(" ") ||
      user.userEmail ||
      "Unknown",
  }));
}

/**
 * Select options for users holding write permission on a given RBAC resource - backs the
 * Owner (User Id) / Resolved By (User Id) pickers, scoped per Issue Type via
 * issueOptions.js's ISSUE_TYPE_TO_TEAM_RESOURCE. Empty resource (e.g. no Issue Type picked
 * yet) returns an empty list rather than fetching, same "type-dependent, no request until a
 * type is selected" convention as hooks/useIssueLookups.js's useIssueStatusOptions().
 */
export function useTeamUserOptions(resource, action = "write") {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resource) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    fetchUsersByPermission(resource, action)
      .then((users) => {
        if (!cancelled) setOptions(toUserOptions(users));
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
  }, [resource, action]);

  return { options, loading };
}
