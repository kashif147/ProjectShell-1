// Read-time compatibility for stored issue-grid views (Save View templates) that predate the Issue
// Display Names columns. Pure: inputs are never mutated and nothing is written back - the stored
// views are reshaped only for the current render. The later system-default reseed is separate.
//
// Every issue route (Open Issues, Closed, Complaints, FTP, IR, Data Protection) renders the shared
// "Issues" column set (TableColumnsContext staticColumns.Issues; CasesSummary/TableComponent read
// columns.Issues), so one stored view applied to "Issues" shapes all of them.
//
// Stored views on DEV still:
//  - title ownerTeam "Owner" (it was the team column before the assigned-person Owner column existed);
//  - list only the old columns (no ownerName / createdBy), which applyTemplate turns into hidden;
//  - and some have an EMPTY column list (blank-named views): applyTemplate shows a column only if the
//    view lists it, so an empty list hides every column - rows load but no cells render.

export const ISSUE_GRID_SCREEN = "Issues";

/** Canonical titles - a stored legacy label must not rename the Team column back to "Owner". */
export const ISSUE_CANONICAL_TITLES = Object.freeze({
  ownerName: "Owner",
  ownerTeam: "Team",
  createdBy: "Created By",
});

const keyOf = (k) => String(k || "").trim();

/**
 * Add the new display columns to an older column list with deterministic placement:
 * Owner (ownerName) immediately before Team (ownerTeam), Created By immediately after it; appended
 * (Owner, then Created By) when the view has no Team column. Never duplicates an existing key.
 */
export function withIssueDisplayColumns(columns = []) {
  const out = (Array.isArray(columns) ? columns : []).map(keyOf).filter(Boolean);
  const has = (k) => out.includes(k);
  const teamAt = out.indexOf("ownerTeam");
  if (teamAt >= 0) {
    if (!has("ownerName")) out.splice(out.indexOf("ownerTeam"), 0, "ownerName");
    if (!has("createdBy")) out.splice(out.indexOf("ownerTeam") + 1, 0, "createdBy");
  } else {
    if (!has("ownerName")) out.push("ownerName");
    if (!has("createdBy")) out.push("createdBy");
  }
  return out;
}

const withCanonicalTitles = (labels) => ({ ...(labels && typeof labels === "object" ? labels : {}), ...ISSUE_CANONICAL_TITLES });

/**
 * Inputs for applyTemplate("Issues", ...) reshaped for read:
 *  - an empty stored column list falls back to the system default's columns, then to the built-in
 *    default column set (never "hide everything");
 *  - the new Owner / Created By columns are added to older lists (no duplicates);
 *  - ownerName / ownerTeam / createdBy always carry their canonical titles (Owner / Team / Created By).
 * Returns new arrays/objects; the arguments are left untouched.
 */
export function normalizeIssueTemplateForRead({
  templateColumns,
  masterColumns,
  templateColumnLabels,
  masterColumnLabels,
  fallbackColumns = [],
} = {}) {
  const stored = (Array.isArray(templateColumns) ? templateColumns : []).map(keyOf).filter(Boolean);
  const master = (Array.isArray(masterColumns) ? masterColumns : []).map(keyOf).filter(Boolean);
  const fallback = (Array.isArray(fallbackColumns) ? fallbackColumns : []).map(keyOf).filter(Boolean);
  const base = stored.length ? stored : master.length ? master : fallback;
  return {
    templateColumns: withIssueDisplayColumns(base),
    masterColumns: master.length ? withIssueDisplayColumns(master) : [],
    templateColumnLabels: withCanonicalTitles(templateColumnLabels),
    masterColumnLabels: withCanonicalTitles(masterColumnLabels),
  };
}
