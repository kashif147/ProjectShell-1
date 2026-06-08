/** Primary green for chart series (active members, positive variance, waterfalls). */
export const EXEC_CHART_GREEN = "#51c791";

/** Stacked movement metrics — order and colours for analytics charts. */
export const MOVEMENT_SERIES = [
  { key: "active", label: "Active members", color: EXEC_CHART_GREEN },
  { key: "newJoin", label: "New", color: "#3b82f6" },
  { key: "rejoin", label: "Re-joiners", color: "#06b6d4" },
  { key: "reinstate", label: "Reinstated", color: "#8b5cf6" },
  { key: "resigned", label: "Resigned", color: "#f59e0b" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

export function movementStackTotal(row) {
  if (!row) return 0;
  return MOVEMENT_SERIES.reduce((sum, s) => sum + (Number(row[s.key]) || 0), 0);
}

export function formatMovementTooltipValue(value, name) {
  const series = MOVEMENT_SERIES.find((s) => s.key === name);
  return [value, series?.label || name];
}

/** Pixel width for horizontal bar chart category (Y) axis from label text. */
export function movementCategoryYAxisWidth(
  rows = [],
  { min = 96, max = 168, charWidth = 5.75, pad = 12 } = {},
) {
  const maxLen = Math.max(
    ...rows.map((r) => String(r.name ?? "").trim().length),
    4,
  );
  return Math.min(max, Math.max(min, Math.ceil(maxLen * charWidth) + pad));
}
