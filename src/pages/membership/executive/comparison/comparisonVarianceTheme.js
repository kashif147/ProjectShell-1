import { EXEC_CHART_GREEN } from "../analytics/movementChartConfig";

/** Palette aligned with executive comparison mockup */
export const VARIANCE_COLORS = {
  up: EXEC_CHART_GREEN,
  upText: EXEC_CHART_GREEN,
  down: "#ef4444",
  downText: "#dc2626",
  neutral: "#94a3b8",
  total: "#2563eb",
  grid: "#e5e7eb",
  axis: "#94a3b8",
  headerBg: "#edf2f7",
  headerText: "#334155",
  panelBorder: "#e2e8f0",
  rowBorder: "#eef2f7",
  heatUp: "81, 199, 145",
  heatDown: "239, 68, 68",
};

export function varianceChartColor(tone) {
  if (tone === "down") return VARIANCE_COLORS.down;
  if (tone === "up") return VARIANCE_COLORS.up;
  return VARIANCE_COLORS.neutral;
}

export function varianceTextColor(tone) {
  if (tone === "down") return VARIANCE_COLORS.downText;
  if (tone === "up") return VARIANCE_COLORS.upText;
  return "#64748b";
}
