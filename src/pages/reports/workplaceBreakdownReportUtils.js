import dayjs from "dayjs";
import { readPositiveFilterSelections } from "../../utils/workplaceBreakdownReportWorkspace";
import { WORKPLACE_BREAKDOWN_REPORT_TITLE } from "../../utils/workplaceBreakdownReportWorkspace";

const FILTER_DISPLAY_LABELS = [
  ["Membership Category", "Membership category"],
  ["Membership Status", "Membership status"],
  ["Grade", "Grade"],
  ["Work Location", "Work location"],
  ["Region", "Region"],
  ["Branch", "Branch"],
  ["Payment Type", "Payment type"],
];

function resolveReportOperator(user) {
  if (!user) return "—";
  const name =
    user.userFullName ||
    [user.userFirstName, user.userLastName].filter(Boolean).join(" ") ||
    user.name ||
    user.email;
  return name || "—";
}

function formatFilterValueList(values) {
  if (!values?.length) return "—";
  if (values.length <= 4) return values.join(", ");
  return `${values.slice(0, 4).join(", ")} (+${values.length - 4} more)`;
}

export function formatReportNum(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-IE");
}

export function formatDelta(value, { showSign = true } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const prefix = showSign && n > 0 ? "+" : "";
  return `${prefix}${n.toLocaleString("en-IE")}`;
}

export function formatDeltaPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0%";
  const prefix = n > 0 ? "+" : "";
  return `${prefix}${n}%`;
}

/** Absolute and percent delta for display e.g. "+12 (+4.5%)". */
export function formatDeltaPair(delta) {
  if (!delta || (!Number.isFinite(Number(delta.absolute)) && !Number.isFinite(Number(delta.percent)))) {
    return "—";
  }
  const abs = formatDelta(delta.absolute);
  const pct = formatDeltaPercent(delta.percent);
  if (abs === "—" && pct === "—") return "—";
  return `${abs} (${pct})`;
}

export function deltaToneClass(delta) {
  const value = Number(delta?.absolute);
  if (value > 0) return "wp-breakdown-report__delta--up";
  if (value < 0) return "wp-breakdown-report__delta--down";
  return "";
}

export function buildWorkplaceBreakdownFilterSummary(
  filtersState = {},
  membershipDashboardHeader = {},
) {
  const lines = [];

  if (membershipDashboardHeader.includeStudents === false) {
    lines.push("Excluding students");
  }
  if (membershipDashboardHeader.includeHonorary === false) {
    lines.push("Excluding honorary members");
  }
  if (membershipDashboardHeader.audienceScope === "official") {
    lines.push("Audience: Individual official");
  } else if (membershipDashboardHeader.audienceScope === "manager") {
    lines.push("Audience: Manager summary");
  }

  for (const [filterKey, displayLabel] of FILTER_DISPLAY_LABELS) {
    const values = readPositiveFilterSelections(filtersState, filterKey);
    if (values.length) {
      lines.push(`${displayLabel}: ${formatFilterValueList(values)}`);
    }
  }

  if (!lines.length) {
    return {
      filterLines: ["All workplaces (no dimension filters applied)"],
      filtersSummary: "All workplaces",
    };
  }

  return {
    filterLines: lines,
    filtersSummary: lines.join("; "),
  };
}

export function buildWorkplaceBreakdownReportMeta({
  report,
  filtersState,
  membershipDashboardHeader,
  organisationName,
  operatorUser,
}) {
  const period = report?.period || {};
  const columns = period.columns || [];
  const dateFrom = columns[0]?.label || "—";
  const dateTo = columns[columns.length - 1]?.label || "—";
  const rollingMonths = period.rollingMonths || membershipDashboardHeader?.rollingMonths || 12;

  const { filterLines, filtersSummary } = buildWorkplaceBreakdownFilterSummary(
    filtersState,
    membershipDashboardHeader,
  );

  return {
    organisationName: organisationName || "Organisation",
    reportTitle: WORKPLACE_BREAKDOWN_REPORT_TITLE,
    generatedAt: dayjs().format("DD MMM YYYY, HH:mm"),
    operator: resolveReportOperator(operatorUser),
    filterLines,
    filtersSummary,
    dateFrom,
    dateTo,
    rollingMonths,
    momColumnLabel: period.momColumn?.label || "MoM",
    yoyColumnLabel: period.yoyColumn?.label || "YoY",
    summary: report?.summary || {},
  };
}

export function applyClientWorkplaceFilters(regions = [], filtersState = {}) {
  const regionFilter = readPositiveFilterSelections(filtersState, "Region");
  const branchFilter = readPositiveFilterSelections(filtersState, "Branch");
  const wlFilter = readPositiveFilterSelections(filtersState, "Work Location");

  if (!regionFilter.length && !branchFilter.length && !wlFilter.length) {
    return regions;
  }

  return regions
    .map((section) => {
      let rows = section.rows || [];
      if (regionFilter.length) {
        rows = rows.filter((r) => regionFilter.includes(r.region));
      }
      if (branchFilter.length) {
        rows = rows.filter((r) => branchFilter.includes(r.branch));
      }
      if (wlFilter.length) {
        rows = rows.filter((r) => wlFilter.includes(r.workLocation));
      }
      return { ...section, rows };
    })
    .filter((section) => section.rows?.length);
}

export function filterEmptyWorkplaceRows(rows = [], { includeEmptyRows = false } = {}) {
  if (includeEmptyRows) return rows;
  return rows.filter((row) =>
    (row.monthlyCounts || []).some((c) => Number(c.count) > 0),
  );
}
