import { NEW_JOIN_COLUMN_LABEL } from "../../utils/membershipMovementLabels";

/** Shared column definitions for statistics report tables and exports. */

export const STATS_REINSTATE_COLUMN_KEYS = new Set([
  "reinstatedFromSuspended",
  "reinstatedFromArchived",
]);

export const STATS_JOINER_COLUMNS = [
  { key: "newJoin", label: NEW_JOIN_COLUMN_LABEL, width: 10 },
  { key: "rejoin", label: "Re-Joined", width: 10 },
  { key: "reinstatedFromSuspended", label: "Reinstated (susp.)", width: 16 },
  { key: "reinstatedFromArchived", label: "Reinstated (arch.)", width: 16 },
  { key: "joiners", label: "Joiners", width: 10 },
];

export const STATS_LEAVER_COLUMNS = [
  { key: "resigned", label: "Resigned", width: 10 },
  { key: "cancelled", label: "Cancelled", width: 10 },
  { key: "leaversTotal", label: "Leavers", width: 10 },
];

export const STATS_CATEGORY_COLUMNS = [
  { key: "name", label: "Membership category", width: 28 },
  { key: "openingActive", label: "Opening", width: 10 },
  ...STATS_JOINER_COLUMNS,
  { key: "resigned", label: "Resigned", width: 10 },
  { key: "cancelled", label: "Cancelled", width: 10 },
  { key: "leavers", label: "Leavers", width: 10 },
  { key: "closingActive", label: "Closing", width: 10 },
  { key: "suspended", label: "Suspended", width: 10 },
  { key: "archived", label: "Archived", width: 10 },
];

export const STATS_LOCATION_COLUMNS = [
  { key: "region", label: "Region", width: 18 },
  { key: "branch", label: "Branch", width: 22 },
  { key: "workLocation", label: "Work location", width: 28 },
  ...STATS_JOINER_COLUMNS,
  ...STATS_LEAVER_COLUMNS,
];

/** Grand total by region — region totals only (no branch or work location). */
export const STATS_REGION_GRAND_TOTAL_COLUMNS = [
  { key: "region", label: "Region", width: 28 },
  ...STATS_JOINER_COLUMNS,
  ...STATS_LEAVER_COLUMNS,
];

export const STATS_CATEGORY_TABLE_COLUMNS = STATS_CATEGORY_COLUMNS.filter(
  (col) => col.key !== "name",
);

export const STATS_TEXT_COLUMN_KEYS = new Set([
  "name",
  "region",
  "branch",
  "workLocation",
]);

export const STATS_CALC_COLUMN_KEYS = new Set([
  "openingActive",
  "joiners",
  "leavers",
  "leaversTotal",
  "closingActive",
]);

export const STATS_TOTAL_HIGHLIGHT_KEYS = new Set([
  "joiners",
  "leavers",
  "leaversTotal",
]);

export function toStatisticsExcelColumns(columns = []) {
  return columns.map((col) => ({
    ...col,
    kind: STATS_TEXT_COLUMN_KEYS.has(col.key) ? "text" : "number",
    calc: STATS_CALC_COLUMN_KEYS.has(col.key),
    totalHighlight: STATS_TOTAL_HIGHLIGHT_KEYS.has(col.key),
  }));
}
