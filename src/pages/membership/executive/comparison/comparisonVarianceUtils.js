import {
  formatCount,
  pctChange,
  formatComparisonPeriodLabel,
} from "../executiveDashboardUtils";
import { buildWaterfallBridge } from "../waterfallUtils";

export const COMPARISON_DIMENSIONS = [
  { key: "membershipCategory", label: "Category", viz: "table" },
  { key: "grade", label: "Grade", viz: "table" },
  { key: "region", label: "Region", viz: "heatmap" },
  { key: "branch", label: "Branch", viz: "bars" },
  { key: "section", label: "Section", viz: "table" },
];

export function normalizeVarianceRows(rows, limit = 8) {
  const items = (rows || [])
    .map((r) => {
      const periodA = Number(r.periodA ?? r.a) || 0;
      const periodB = Number(r.periodB ?? r.b) || 0;
      return {
        name: r.name || "(blank)",
        periodA,
        periodB,
        change: Number(r.change) ?? periodB - periodA,
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const top = limit == null ? items : items.slice(0, limit);
  const totals = top.reduce(
    (acc, r) => ({
      periodA: acc.periodA + r.periodA,
      periodB: acc.periodB + r.periodB,
      change: acc.change + r.change,
    }),
    { periodA: 0, periodB: 0, change: 0 }
  );

  return { rows: top, totals };
}

export function varianceTone(change) {
  const n = Number(change) || 0;
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "neutral";
}

export function formatVarianceCell(change) {
  const n = Number(change) || 0;
  const prefix = n > 0 ? "+" : "";
  return `${prefix}${formatCount(n)}`;
}

export function formatChangePct(periodA, periodB) {
  const pct = pctChange(periodB, periodA);
  const prefix = pct > 0 ? "+" : "";
  return `${prefix}${pct}%`;
}

/** Shorter axis/header label for narrow comparison columns */
export function shortPeriodLabel(label) {
  if (!label) return "—";
  const text = String(label);
  const monthYear = text.match(/^([A-Za-z]{3,})\s+(\d{4})$/);
  if (monthYear) return `${monthYear[1]} '${monthYear[2].slice(-2)}`;
  if (text.toLowerCase().includes("year end")) {
    return text.replace(/year\s*end\s*/i, "YE ");
  }
  if (text.length > 10) return `${text.slice(0, 9)}…`;
  return text;
}

export function truncateLabel(name, max = 12) {
  const text = String(name || "");
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 1))}…`;
}

function deltaKpi(change, periodA, periodB, key) {
  const fromChange = Number(change?.[key]);
  if (Number.isFinite(fromChange)) return fromChange;
  return (Number(periodB?.[key]) || 0) - (Number(periodA?.[key]) || 0);
}

/** Bridge between comparison period A and B */
export function buildComparisonWaterfallSteps(comparison) {
  if (!comparison?.periodA || !comparison?.periodB) {
    return { steps: [], yDomain: [0, 1] };
  }

  const a = comparison.periodA.kpis || {};
  const b = comparison.periodB.kpis || {};
  const change = comparison.kpiChange || {};
  const opening = Math.max(0, Number(a.activeTotal) || 0);
  const closing = Math.max(0, Number(b.activeTotal) || 0);
  const labelA = formatComparisonPeriodLabel(comparison.periodA);
  const labelB = formatComparisonPeriodLabel(comparison.periodB);

  return buildWaterfallBridge({
    opening,
    closing,
    joiners: Math.max(0, deltaKpi(change, a, b, "joiners")),
    leavers: Math.max(0, deltaKpi(change, a, b, "leavers")),
    startLabel: labelA,
    endLabel: labelB,
  });
}
