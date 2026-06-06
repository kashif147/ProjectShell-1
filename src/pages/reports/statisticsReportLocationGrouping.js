import {
  STATS_JOINER_COLUMNS,
  STATS_LEAVER_COLUMNS,
  STATS_LOCATION_COLUMNS,
} from "./statisticsReportColumns";
import { exportCellValue } from "./statisticsReportExportHelpers";

const MOVEMENT_KEYS = [
  ...STATS_JOINER_COLUMNS.map((c) => c.key),
  ...STATS_LEAVER_COLUMNS.map((c) => c.key),
];

function pickMovementValues(source = {}) {
  const out = {};
  MOVEMENT_KEYS.forEach((key) => {
    out[key] = exportCellValue(source, key);
  });
  return out;
}

function appendRegionSections(sections, region) {
  sections.push({
    rowType: "region",
    region: region.label || region.region,
    branch: "",
    workLocation: "",
    ...pickMovementValues(region.totals),
  });

  for (const branch of region.branches || []) {
    sections.push({
      rowType: "branch",
      region: "",
      branch: branch.branch,
      workLocation: "",
      ...pickMovementValues(branch.totals),
    });

    for (const loc of branch.rows || []) {
      sections.push({
        rowType: "data",
        region: region.region,
        branch: branch.branch,
        workLocation: loc.name,
        ...pickMovementValues(loc),
      });
    }
  }
}

/** Flat rows for a single region (print/PDF page). */
export function buildGroupedLocationSectionsForRegion(region) {
  const sections = [];
  if (region) appendRegionSections(sections, region);
  return sections;
}

/**
 * Flat grouped rows for exports/print — region → branch (with totals) → locations.
 * No merged cells; hierarchy is conveyed by row type and column values.
 */
export function buildGroupedLocationSections(locationHierarchy) {
  const sections = [];
  for (const region of locationHierarchy?.groups || []) {
    appendRegionSections(sections, region);
  }
  return sections;
}

/** Split flat location rows into one array per region (for PDF page breaks). */
export function splitGroupedLocationSectionsByRegion(sections = []) {
  const chunks = [];
  let current = null;

  for (const row of sections) {
    if (row.rowType === "region") {
      if (current?.length) chunks.push(current);
      current = [row];
    } else if (current) {
      current.push(row);
    }
  }

  if (current?.length) chunks.push(current);
  return chunks;
}

/** Region totals plus overall grand total — for summary tables. */
export function buildRegionGrandTotalSections(locationHierarchy) {
  const sections = [];

  for (const region of locationHierarchy?.groups || []) {
    sections.push({
      rowType: "region-total",
      region: region.label || region.region,
      ...pickMovementValues(region.totals),
    });
  }

  const grand = locationHierarchy?.grandTotal;
  if (grand) {
    sections.push({
      rowType: "grand-total",
      region: "Grand total",
      ...pickMovementValues(grand),
    });
  }

  return sections;
}

export function groupedLocationRowFlags(row = {}) {
  switch (row.rowType) {
    case "grand-total":
      return { isTotal: true, isGrandTotal: true };
    case "branch-total":
      return { isTotal: true, isBranchTotal: true };
    case "region-total":
      return { isTotal: true };
    case "region":
      return { isRegionHeader: true };
    case "branch":
      return { isBranchHeader: true, isTotal: true, isBranchTotal: true };
    default:
      return {};
  }
}

export const GROUPED_LOCATION_EXPORT_COLUMNS = STATS_LOCATION_COLUMNS;

export { STATS_REGION_GRAND_TOTAL_COLUMNS } from "./statisticsReportColumns";
