import dayjs from "dayjs";
import { buildWaterfallBridge } from "./waterfallUtils";

export const CHART_PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#64748b",
];

export function formatCount(value) {
  if (value == null || value === "") return "0";
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-IE", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(n));
}

/** Short numeric ticks for narrow chart Y-axes (plot width unchanged). */
export function formatCompactCount(value) {
  const n = Math.round(Number(value) || 0);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    return `${sign}${v >= 10 ? Math.round(v) : v.toFixed(1)}M`;
  }
  if (abs >= 10_000) return `${sign}${Math.round(abs / 1000)}k`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  return formatCount(n);
}

export function pctChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (!p) return c === 0 ? 0 : Number(100);
  return Number((((c - p) / p) * 100).toFixed(1));
}

export function buildSparkline(current, prior, points = 8) {
  const c = Number(current) || 0;
  const p = Number(prior) || 0;
  return Array.from({ length: points }, (_, i) => ({
    i,
    v: Math.max(0, Math.round(p + ((c - p) * i) / (points - 1 || 1))),
  }));
}

/** Last year vs this year active trend (synthetic until historical series API exists) */
export function buildActiveTrendSeries(data) {
  const active = Number(data.totalActive) || 0;
  const ly = Number(data.totalActiveLY) || 0;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const thisYear = dayjs(data.asOfDate || undefined).year() || dayjs().year();
  const lastYear = thisYear - 1;

  const seriesForYear = (base) =>
    months.map((_, i) =>
      Math.round((base || 0) * (0.92 + (i / 11) * 0.16))
    );

  const lastYearValues = ly > 0 ? seriesForYear(ly) : months.map(() => 0);
  const thisYearValues = active > 0 ? seriesForYear(active) : months.map(() => 0);

  return {
    points: months.map((month, i) => ({
      month,
      lastYear: lastYearValues[i] ?? 0,
      thisYear: thisYearValues[i] ?? 0,
    })),
    lastYearLabel: String(lastYear),
    thisYearLabel: String(thisYear),
  };
}

/** Top N slices + "Other" for readable donut/bar charts with many categories */
export function rollupChartSlices(
  items,
  { maxSlices = 6, valueKey = "value", nameKey = "name", otherLabel = "Other" } = {}
) {
  const rows = (items || [])
    .map((row, i) => ({
      name: row[nameKey] || "(blank)",
      value: Number(row[valueKey] ?? row.count) || 0,
      color: row.color,
      _i: i,
    }))
    .filter((r) => r.value > 0);

  rows.sort((a, b) => b.value - a.value);
  if (rows.length <= maxSlices) {
    return rows.map((r, i) => ({
      name: r.name,
      value: r.value,
      color: r.color || CHART_PALETTE[i % CHART_PALETTE.length],
    }));
  }

  const top = rows.slice(0, maxSlices - 1);
  const otherValue = rows
    .slice(maxSlices - 1)
    .reduce((sum, r) => sum + r.value, 0);

  const result = top.map((r, i) => ({
    name: r.name,
    value: r.value,
    color: r.color || CHART_PALETTE[i % CHART_PALETTE.length],
  }));
  result.push({
    name: otherLabel,
    value: otherValue,
    color: "#94a3b8",
  });
  return result;
}

/** Net growth (this month) — same floating waterfall as comparison panel */
export function buildWaterfallSteps(data) {
  const joiners = Number(data.newJoinersThisMonth ?? data.newJoiners) || 0;
  const leavers = Number(data.leaversThisMonth ?? data.leavers) || 0;
  const closing = Number(data.totalActiveThisMonth ?? data.totalActive) || 0;

  let opening;
  if (data.hasPriorMonthSnapshot === true && Number(data.totalActiveLastMonth) > 0) {
    opening = Number(data.totalActiveLastMonth);
  } else {
    opening = Math.max(0, closing - joiners + leavers);
  }

  const asOf = dayjs(data.asOfDate || undefined);
  const startLabel =
    data.hasPriorMonthSnapshot && opening > 0 && asOf.isValid()
      ? asOf.subtract(1, "month").format("MMM YYYY")
      : "Opening";
  const endLabel = asOf.isValid() ? asOf.format("MMM YYYY") : "Current";

  return buildWaterfallBridge({
    opening,
    closing,
    joiners,
    leavers,
    startLabel,
    endLabel,
  });
}

/** Prior-period value for KPI chips when no historical snapshot exists */
/** Human label for comparison period (e.g. "May 2025", "Year end 2025") */
export function formatComparisonPeriodLabel(period) {
  if (!period) return "—";
  if (period.label && String(period.label).toLowerCase().includes("year end")) {
    return period.label.replace(/^Year end\s*/i, "Year end ");
  }
  if (period.asOfDate) {
    return dayjs(period.asOfDate).format("MMM YYYY");
  }
  if (period.year && period.month) {
    return dayjs(`${period.year}-${String(period.month).padStart(2, "0")}-01`).format(
      "MMM YYYY"
    );
  }
  return period.label || "—";
}

export function buildComparisonKpiPills(comparison) {
  if (!comparison?.periodA || !comparison?.periodB) return [];
  const a = comparison.periodA.kpis || {};
  const b = comparison.periodB.kpis || {};
  const d = comparison.kpiChange || {};
  return [
    {
      key: "active",
      title: "Active Members",
      valueA: a.activeTotal,
      valueB: b.activeTotal,
      change: d.activeTotal,
    },
    {
      key: "joiners",
      title: "New Joiners",
      valueA: a.joiners,
      valueB: b.joiners,
      change: d.joiners,
    },
    {
      key: "leavers",
      title: "Leavers",
      valueA: a.leavers,
      valueB: b.leavers,
      change: d.leavers,
    },
    {
      key: "net",
      title: "Net Growth",
      valueA: a.netGrowth ?? (Number(a.joiners) || 0) - (Number(a.leavers) || 0),
      valueB: b.netGrowth ?? (Number(b.joiners) || 0) - (Number(b.leavers) || 0),
      change: d.netGrowth,
    },
  ];
}

export function priorPeriodValue(value, hasSnapshot) {
  if (hasSnapshot !== true) return 0;
  return Number(value) || 0;
}

export function normalizeDashboardStats(stats) {
  const s = stats && typeof stats === "object" ? stats : {};
  const hasPriorYear = s.hasPriorYearSnapshot === true;
  const hasPriorMonth = s.hasPriorMonthSnapshot === true;
  return {
    ...s,
    totalActiveLY: priorPeriodValue(s.totalActiveLY, hasPriorYear),
    totalActiveLastMonth: priorPeriodValue(s.totalActiveLastMonth, hasPriorMonth),
    categoryData: Array.isArray(s.categoryData) ? s.categoryData : [],
    gradeData: Array.isArray(s.gradeData) ? s.gradeData : [],
    sectionData: Array.isArray(s.sectionData) ? s.sectionData : [],
    branchData: Array.isArray(s.branchData) ? s.branchData : [],
    regionData: Array.isArray(s.regionData) ? s.regionData : [],
    workLocationData: Array.isArray(s.workLocationData) ? s.workLocationData : [],
  };
}

export const EMPTY_DASHBOARD_DATA = normalizeDashboardStats({});

export function getDefaultMembershipPeriod() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export const MEMBERSHIP_MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function buildMembershipYearOptions(yearsBack = 12) {
  const currentYear = new Date().getUTCFullYear();
  return Array.from({ length: yearsBack + 1 }, (_, i) => {
    const year = currentYear - i;
    return { value: year, label: String(year) };
  });
}

const MEMBERSHIP_DIMENSION_FILTER_LABELS = [
  "Membership Category",
  "Grade",
  "Section (Primary Section)",
  "Region",
  "Branch",
  "Work Location",
];

const MEMBERSHIP_DIMENSION_LABEL_TO_API = {
  "Membership Category": "membershipCategories",
  Grade: "grades",
  "Section (Primary Section)": "sections",
  Region: "regions",
  Branch: "branches",
  "Work Location": "workLocations",
};

function readDimensionSelections(filtersState, label) {
  const raw = filtersState?.[label]?.selectedValues;
  return Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter(Boolean)
    : [];
}

export function buildMembershipDashboardFilters(filtersState, header = {}) {
  const out = {};
  MEMBERSHIP_DIMENSION_FILTER_LABELS.forEach((label) => {
    const sel = readDimensionSelections(filtersState, label);
    if (sel.length) out[label] = sel;
  });

  const year = Number(header.year);
  const month = Number(header.month);
  if (year >= 2000 && month >= 1 && month <= 12) {
    out.year = year;
    out.month = month;
  }

  if (header.includeStudents) out.includeStudents = true;
  if (header.includeHonorary) out.includeHonorary = true;
  return out;
}

/** Comparison API body: header flags + API dimension keys from toolbar filters. */
export function buildMembershipComparisonBody(filtersState, header = {}) {
  const dashboard = buildMembershipDashboardFilters(filtersState, header);
  const body = {
    dual: true,
    includeStudents: dashboard.includeStudents === true,
    includeHonorary: dashboard.includeHonorary === true,
    referenceYear: dashboard.year,
    referenceMonth: dashboard.month,
  };
  Object.entries(MEMBERSHIP_DIMENSION_LABEL_TO_API).forEach(([label, key]) => {
    if (dashboard[label]?.length) body[key] = dashboard[label];
  });
  return body;
}
