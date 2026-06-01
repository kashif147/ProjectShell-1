import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCompactCount, formatCount } from "./executiveDashboardUtils";
import { VARIANCE_COLORS } from "./comparison/comparisonVarianceTheme";
import WaterfallFloatingLayer from "./WaterfallFloatingLayer";

function WaterfallTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="exec-donut-tooltip" style={{ padding: "8px 10px" }}>
      <div className="exec-donut-tooltip__title">{row.name}</div>
      <div className="exec-donut-tooltip__stat">{row.label}</div>
    </div>
  );
}

export default function ExecWaterfallChart({
  steps = [],
  yDomain = [0, 1],
  className = "exec-variance-chart exec-variance-chart--waterfall",
  emptyMessage = "No data for this period",
  compact = false,
}) {
  const hasTotals = steps.some((s) => s.type === "total" && s.value > 0);

  if (!steps.length || !hasTotals) {
    return <p className="exec-variance-panel__empty">{emptyMessage}</p>;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={steps}
          margin={{ top: 32, left: 4, right: 8, bottom: 8 }}
          barCategoryGap="22%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={VARIANCE_COLORS.grid}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: compact ? 8 : 11, fill: VARIANCE_COLORS.headerText }}
            interval={0}
            axisLine={{ stroke: VARIANCE_COLORS.grid }}
            tickLine={false}
            height={44}
          />
          <YAxis
            domain={yDomain}
            allowDataOverflow
            tick={{ fontSize: compact ? 7 : 11, fill: VARIANCE_COLORS.axis }}
            tickFormatter={(v) => (compact ? formatCompactCount(v) : formatCount(v))}
            width={48}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={false}
            content={<WaterfallTooltip />}
            formatter={(_v, _n, entry) => {
              const row = entry?.payload;
              return row ? [row.label, row.name] : ["", ""];
            }}
          />
          <WaterfallFloatingLayer steps={steps} compact={compact} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
