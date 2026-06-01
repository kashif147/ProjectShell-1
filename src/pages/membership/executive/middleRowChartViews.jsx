import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CHART_PALETTE, formatCount } from "./executiveDashboardUtils";
import ExecWaterfallChart from "./ExecWaterfallChart";

function CategoryDonutTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: slice } = payload[0];
  const count = Number(value) || 0;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
  const color = slice?.color || payload[0]?.color;

  return (
    <div className="exec-donut-tooltip">
      <div className="exec-donut-tooltip__title">
        {color ? (
          <span
            className="exec-donut-tooltip__swatch"
            style={{ background: color }}
          />
        ) : null}
        <span>{name}</span>
      </div>
      <div className="exec-donut-tooltip__stat">
        {formatCount(count)} ({pct}%)
      </div>
    </div>
  );
}

function chartAreaClass(expanded, extra = "") {
  const base = expanded
    ? "exec-chart-area exec-chart-area--expanded"
    : "exec-chart-area exec-chart-area--tall";
  return extra ? `${base} ${extra}` : base;
}

export function ActiveTrendChart({ expanded, trend, lastYearLabel, thisYearLabel }) {
  return (
    <div className={chartAreaClass(expanded)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={trend}
          margin={expanded ? { top: 12, right: 24, left: 8, bottom: 8 } : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="month" tick={{ fontSize: expanded ? 12 : 11 }} />
          <YAxis tick={{ fontSize: expanded ? 12 : 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: expanded ? 12 : 11 }} />
          <Line
            type="monotone"
            dataKey="lastYear"
            name={lastYearLabel}
            stroke="#64748b"
            strokeDasharray="4 4"
            dot={expanded}
            strokeWidth={expanded ? 2.5 : 2}
          />
          <Line
            type="monotone"
            dataKey="thisYear"
            name={thisYearLabel}
            stroke="#3b82f6"
            dot={{ r: expanded ? 4 : 3 }}
            strokeWidth={expanded ? 3 : 2.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonutChart({ expanded, category, categoryTotal, totalActive }) {
  const areaClass = expanded
    ? "exec-chart-area exec-chart-area--expanded"
    : "exec-chart-area";

  return (
    <div
      className={`exec-donut-wrap exec-donut-wrap--tooltip-only${
        expanded ? " exec-donut-wrap--expanded" : ""
      }`}
    >
      <div className={areaClass}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={category}
              dataKey="value"
              nameKey="name"
              innerRadius={expanded ? "52%" : "58%"}
              outerRadius={expanded ? "88%" : "84%"}
              paddingAngle={2}
              cx="50%"
              cy="50%"
            >
              {category.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color || CHART_PALETTE[i % CHART_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CategoryDonutTooltip total={categoryTotal} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="exec-donut-center">
          <div
            className={`exec-donut-center__value${
              expanded ? " exec-donut-center__value--lg" : ""
            }`}
          >
            {formatCount(totalActive)}
          </div>
          <div className="exec-donut-center__label">Active</div>
        </div>
      </div>
    </div>
  );
}

export function RegionListChart({ expanded, regions, regionTotal }) {
  return (
    <div
      className={`exec-region-list${expanded ? " exec-region-list--expanded" : ""}`}
    >
      {regions.map((r, i) => {
        const pct = (((r.count || 0) / regionTotal) * 100).toFixed(1);
        return (
          <div
            key={r.name || i}
            className={`exec-region-row${expanded ? " exec-region-row--expanded" : ""}`}
          >
            <span className="exec-region-row__name" title={r.name}>
              {r.name || "—"}
            </span>
            <div className="exec-region-row__bar-wrap">
              <div
                className="exec-region-row__bar"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="exec-region-row__stat">
              {formatCount(r.count)} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function NetGrowthWaterfall({ expanded, waterfallSteps, waterfallDomain }) {
  const className = expanded
    ? "exec-chart-area exec-chart-area--expanded exec-chart-area--waterfall"
    : "exec-chart-area exec-chart-area--tall exec-chart-area--waterfall";

  return (
    <ExecWaterfallChart
      steps={waterfallSteps}
      yDomain={waterfallDomain}
      compact={!expanded}
      className={className}
    />
  );
}

export function buildCategorySlices(categoryData) {
  return (categoryData || [])
    .map((row, i) => ({
      name: row.name || "(blank)",
      value: Number(row.value ?? row.count) || 0,
      color: row.color || CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}
