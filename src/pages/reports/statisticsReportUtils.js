import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { readPositiveFilterSelections } from "../../utils/membershipStatisticsReportWorkspace";
import { formatMembershipMovementLabel } from "../../utils/membershipMovementLabels";

dayjs.extend(utc);

export const STATISTICS_REPORT_TITLE = "Statistics Report";

/**
 * Calendar-year statistics period: 01 Jan {year} through selected month-end,
 * or today when the selected month is the current calendar month.
 */
export function resolveStatisticsReportPeriod({
  year,
  throughMonth,
  closingAsOfDate,
  now = dayjs.utc(),
} = {}) {
  const y = Number(year);
  const m = Math.min(Math.max(Number(throughMonth) || 12, 1), 12);
  if (!y) return null;

  const opening = dayjs.utc(`${y}-01-01`);
  let closing;
  if (closingAsOfDate) {
    closing = dayjs.utc(closingAsOfDate);
  } else {
    const monthEnd = dayjs
      .utc(`${y}-${String(m).padStart(2, "0")}-01`)
      .endOf("month");
    const isCurrentMonth = y === now.year() && m === now.month() + 1;
    closing = isCurrentMonth ? now.startOf("day") : monthEnd;
  }

  const fmt = (d) => d.format("DD MMM YYYY");
  const fmtColumn = (d) => d.format("MMM YY");

  return {
    year: y,
    throughMonth: m,
    dateFrom: fmt(opening),
    dateTo: fmt(closing),
    openingColumnLabel: fmtColumn(opening),
    closingColumnLabel: fmtColumn(closing),
    openingAsOfDate: opening.format("YYYY-MM-DD"),
    closingAsOfDate: closing.format("YYYY-MM-DD"),
  };
}

export function applyPeriodToCategoryColumns(columns = [], period) {
  if (!period) return columns;
  return columns.map((col) => {
    if (col.key === "openingActive") {
      return { ...col, label: period.openingColumnLabel };
    }
    if (col.key === "closingActive") {
      return { ...col, label: period.closingColumnLabel };
    }
    return col;
  });
}

/** @deprecated Use STATISTICS_REPORT_TITLE */
export const LIVE_STATS_REPORT_TITLE = STATISTICS_REPORT_TITLE;

export function compareReportLabels(a, b) {
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    sensitivity: "base",
  });
}

/** Sort data rows alphabetically by label column (default `name`). */
export function sortStatisticsRows(rows = [], labelKey = "name") {
  return [...rows].sort((a, b) =>
    compareReportLabels(a[labelKey] ?? a.name, b[labelKey] ?? b.name),
  );
}

/** Sort region → branch → work location hierarchy alphabetically at each level. */
export function sortStatisticsLocationHierarchy(hierarchy) {
  if (!hierarchy) return hierarchy;
  const groups = sortStatisticsRows(hierarchy.groups || [], "region").map(
    (region) => ({
      ...region,
      branches: sortStatisticsRows(region.branches || [], "branch").map(
        (branch) => ({
          ...branch,
          rows: sortStatisticsRows(branch.rows || [], "name"),
        }),
      ),
    }),
  );
  return { ...hierarchy, groups };
}

export const STATS_CATEGORY_METRIC_KEYS = [
  "openingActive",
  "newJoin",
  "rejoin",
  "reinstatedFromSuspended",
  "reinstatedFromArchived",
  "joiners",
  "resigned",
  "cancelled",
  "leavers",
  "closingActive",
  "suspended",
  "archived",
];

export const STATS_LOCATION_METRIC_KEYS = [
  "newJoin",
  "rejoin",
  "reinstatedFromSuspended",
  "reinstatedFromArchived",
  "joiners",
  "resigned",
  "cancelled",
  "leaversTotal",
];

/** True when every numeric metric on the row is zero or blank. */
export function isStatisticsDataRowEmpty(
  row,
  metricKeys = STATS_CATEGORY_METRIC_KEYS,
) {
  return metricKeys.every((key) => (Number(getReportCellValue(row, key)) || 0) === 0);
}

export function filterEmptyCategoryRows(
  rows = [],
  { includeEmptyRows = false } = {},
) {
  if (includeEmptyRows) return rows;
  return rows.filter((row) => !isStatisticsDataRowEmpty(row));
}

function sumLocationMetricTotals(rows = []) {
  return sumRowFields(rows, STATS_LOCATION_METRIC_KEYS);
}

/** Drop work locations (and empty branches/regions) with no numeric data. */
export function filterEmptyLocationHierarchy(
  hierarchy,
  { includeEmptyRows = false } = {},
) {
  if (!hierarchy || includeEmptyRows) return hierarchy;

  const groups = (hierarchy.groups || [])
    .map((region) => {
      const branches = (region.branches || [])
        .map((branch) => {
          const rows = (branch.rows || []).filter(
            (row) => !isStatisticsDataRowEmpty(row, STATS_LOCATION_METRIC_KEYS),
          );
          if (!rows.length) return null;
          return { ...branch, rows, totals: sumLocationMetricTotals(rows) };
        })
        .filter(Boolean);

      if (!branches.length) return null;

      const regionRows = branches.flatMap((branch) => branch.rows || []);
      return {
        ...region,
        branches,
        totals: sumLocationMetricTotals(regionRows),
      };
    })
    .filter(Boolean);

  const allRows = groups.flatMap((region) =>
    (region.branches || []).flatMap((branch) => branch.rows || []),
  );

  return {
    ...hierarchy,
    groups,
    grandTotal: sumLocationMetricTotals(allRows),
  };
}

export function formatReportNum(value) {
  if (value == null || value === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "-";
  return n.toLocaleString("en-IE");
}

export function sumRowFields(rows, keys) {
  const totals = {};
  const deriveJoiners = keys.includes("joiners");
  const deriveLeavers = keys.includes("leavers");
  const sumKeys = keys.filter((key) => key !== "joiners" && key !== "leavers");

  for (const key of keys) totals[key] = 0;

  for (const row of rows) {
    for (const key of sumKeys) {
      totals[key] += Number(getReportCellValue(row, key)) || 0;
    }
  }

  if (deriveJoiners) {
    totals.joiners = rows.reduce(
      (sum, row) => sum + computeJoiners(row),
      0,
    );
  }
  if (deriveLeavers) {
    totals.leavers = rows.reduce(
      (sum, row) => sum + computeLeavers(row),
      0,
    );
  }

  return totals;
}

/** Joiners = new + re-joined + reinstated from suspended and archived. */
export function computeJoiners(row = {}) {
  const newJoin = Number(row.newJoin) || 0;
  const rejoin = Number(row.rejoin) || 0;
  const reinstated =
    (Number(row.reinstatedFromSuspended) || 0) +
    (Number(row.reinstatedFromArchived) || 0);
  return newJoin + rejoin + reinstated;
}

/** Leavers = resigned + cancelled/lapsed. */
export function computeLeavers(row = {}) {
  const resigned = Number(row.resigned) || 0;
  const cancelled = Number(row.cancelled) || Number(row.lapsed) || 0;
  if (row.leavers != null && Number.isFinite(Number(row.leavers))) {
    return Number(row.leavers);
  }
  if (row.leaversTotal != null && Number.isFinite(Number(row.leaversTotal))) {
    return Number(row.leaversTotal);
  }
  return resigned + cancelled;
}

export function getReportCellValue(row, key) {
  if (key === "joiners") return computeJoiners(row);
  if (key === "leavers" || key === "leaversTotal") return computeLeavers(row);
  if (key === "cancelled") {
    return Number(row.cancelled) || Number(row.lapsed) || 0;
  }
  return row[key];
}

/** Normalise API category row — derive joiners/leavers and backfill opening when snapshot missing. */
export function normalizeStatisticsCategoryRow(row, index = 0) {
  const newJoin = row.newJoin ?? 0;
  const rejoin = row.rejoin ?? 0;
  const reinstatedFromSuspended = row.reinstatedFromSuspended ?? 0;
  const reinstatedFromArchived = row.reinstatedFromArchived ?? 0;
  const joiners = computeJoiners({
    newJoin,
    rejoin,
    reinstatedFromSuspended,
    reinstatedFromArchived,
  });
  const joined = newJoin + rejoin;
  const resigned = row.resigned ?? 0;
  const cancelled = row.cancelled ?? row.lapsed ?? 0;
  const leavers = computeLeavers({ resigned, cancelled, leavers: row.leavers });

  let openingActive = Number(row.openingActive) || 0;
  const closingActive = Number(row.closingActive) || 0;

  if (openingActive === 0 && closingActive > 0) {
    const derivedOpening = closingActive - joiners + leavers;
    if (derivedOpening > 0) openingActive = derivedOpening;
  }

  return {
    key: `cat-${row.name}-${index}`,
    name: row.name,
    openingActive,
    newJoin,
    rejoin,
    joined,
    reinstatedFromSuspended,
    reinstatedFromArchived,
    joiners,
    resigned,
    cancelled,
    leavers,
    closingActive,
    suspended: row.suspended ?? 0,
    archived: row.archived ?? 0,
  };
}

/** Footer totals — sum of the rows currently shown in the table. */
export function buildCategoryFooterTotals(rows, columnKeys) {
  return sumRowFields(rows, columnKeys);
}

export function resolveReportOperator(user) {
  const readStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  };

  const userData =
    user && typeof user === "object" && Object.keys(user).length
      ? user
      : readStoredUser();

  const given = userData?.given_name || userData?.givenName;
  const family = userData?.family_name || userData?.familyName;
  const fullFromParts = [given, family].filter(Boolean).join(" ").trim();

  return (
    userData?.name ||
    userData?.fullName ||
    fullFromParts ||
    userData?.unique_name ||
    userData?.preferred_username ||
    userData?.email ||
    "—"
  );
}

const FILTER_DISPLAY_LABELS = [
  ["Membership Category", "Membership category"],
  ["Grade", "Grade"],
  ["Region", "Region"],
  ["Branch", "Branch"],
  ["Work Location", "Work location"],
  ["Section (Primary Section)", "Section"],
  ["Payment Type", "Payment type"],
  ["Membership Status", "Membership status"],
  ["Membership Movement", "Membership movement"],
];

function formatFilterValueList(values = [], { filterKey } = {}) {
  const rendered = (values || [])
    .map((value) => {
      const text = String(value ?? "").trim();
      if (!text) return "";
      if (filterKey === "Membership Movement") {
        return formatMembershipMovementLabel(text);
      }
      return text;
    })
    .filter(Boolean);

  if (!rendered.length) return "";
  if (rendered.length === 1) return rendered[0];
  if (rendered.length <= 3) return rendered.join(", ");
  return `${rendered.slice(0, 3).join(", ")} (+${rendered.length - 3} more)`;
}

/** Human-readable active filters for report header and exports. */
export function buildStatisticsReportFilterSummary(
  filtersState = {},
  header = {},
) {
  const lines = [];

  const excludeSegments = [];
  if (header.includeStudents === false) excludeSegments.push("students");
  if (header.includeHonorary === false) excludeSegments.push("honorary");
  if (excludeSegments.length) {
    lines.push(`Exclude ${excludeSegments.join(" and ")}`);
  }

  if (header.includeEmptyRows !== true) {
    lines.push("Exclude empty rows");
  }

  const manual = header.manualMembershipCategories;
  const categoryValues =
    manual?.operator === "==" && manual.selectedValues?.length
      ? manual.selectedValues.map((v) => String(v).trim()).filter(Boolean)
      : readPositiveFilterSelections(filtersState, "Membership Category");

  if (categoryValues.length) {
    lines.push(
      `Membership category: ${formatFilterValueList(categoryValues)}`,
    );
  }

  for (const [filterKey, displayLabel] of FILTER_DISPLAY_LABELS) {
    if (filterKey === "Membership Category") continue;
    const values = readPositiveFilterSelections(filtersState, filterKey);
    if (values.length) {
      lines.push(
        `${displayLabel}: ${formatFilterValueList(values, { filterKey })}`,
      );
    }
  }

  if (!lines.length) {
    return {
      filterLines: ["All members (no dimension filters applied)"],
      filtersSummary: "All members",
    };
  }

  return {
    filterLines: lines,
    filtersSummary: lines.join("; "),
  };
}

export function buildReportMeta({
  report,
  filtersState,
  membershipDashboardHeader,
  organisationName,
  operatorUser,
}) {
  const includeBreakdown = membershipDashboardHeader?.includeBreakdown !== false;
  const year = report?.year;
  const throughMonth = report?.period?.monthsIncluded ?? report?.throughMonth ?? 12;
  const period = resolveStatisticsReportPeriod({
    year,
    throughMonth,
    closingAsOfDate: report?.period?.closing?.asOfDate,
  });

  const { filterLines, filtersSummary } = buildStatisticsReportFilterSummary(
    filtersState,
    membershipDashboardHeader,
  );

  const generatedAt = dayjs();
  return {
    organisationName: organisationName || "Organisation",
    reportTitle: STATISTICS_REPORT_TITLE,
    generatedAt: generatedAt.format("DD MMM YYYY, HH:mm"),
    operator: resolveReportOperator(operatorUser),
    reportBy: filtersSummary,
    filterLines,
    filtersSummary,
    dateFrom: period?.dateFrom ?? "—",
    dateTo: period?.dateTo ?? "—",
    breakdown: includeBreakdown ? "Yes" : "No",
    year,
    throughMonth,
    period,
  };
}

export function flattenLocationGroupsForExport(groups = []) {
  const rows = [];
  for (const region of groups) {
    for (const branch of region.branches || []) {
      for (const loc of branch.rows || []) {
        rows.push({
          region: region.region,
          branch: branch.branch,
          name: loc.name,
          newJoin: loc.newJoin,
          rejoin: loc.rejoin,
          reinstatedFromSuspended:
            loc.reinstatedFromSuspended ?? loc.reinstateFromSuspended,
          reinstatedFromArchived:
            loc.reinstatedFromArchived ?? loc.reinstateFromArchived,
          joiners: computeJoiners(loc),
          resigned: loc.resigned,
          cancelled: loc.cancelled,
          leaversTotal: loc.leaversTotal,
        });
      }
    }
  }
  return rows;
}
