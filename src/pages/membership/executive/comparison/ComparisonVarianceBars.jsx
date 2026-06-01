import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LabelList,
} from "recharts";
import {
  formatChangePct,
  normalizeVarianceRows,
  varianceTone,
} from "./comparisonVarianceUtils";
import { formatCompactCount, formatCount } from "../executiveDashboardUtils";
import { VARIANCE_COLORS, varianceChartColor, varianceTextColor } from "./comparisonVarianceTheme";
import ChartTitleBar from "../ChartTitleBar";

const BRANCH_LABEL_FONT = 10;
const Y_AXIS_CHAR_WIDTH = 5.75;
const Y_AXIS_PAD = 10;

function branchYAxisWidth(chartData, expanded) {
  const maxLen = Math.max(
    ...chartData.map((d) => String(d.fullName || "").length),
    4
  );
  const cap = expanded ? 280 : 148;
  const floor = expanded ? 120 : 96;
  return Math.min(cap, Math.max(floor, Math.ceil(maxLen * Y_AXIS_CHAR_WIDTH) + Y_AXIS_PAD));
}

function BranchYAxisTick({ x, y, index, chartData, expanded }) {
  if (x == null || y == null) return null;
  const label = chartData?.[index]?.fullName ?? "";
  if (!label) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      dominantBaseline="middle"
      fill="#334155"
      fontSize={expanded ? 11 : BRANCH_LABEL_FONT}
      fontWeight={600}
    >
      {label}
    </text>
  );
}

function ChangeLabel({ x, y, width, height, index, chartData }) {
  const row = chartData?.[index];
  if (!row || x == null || y == null) return null;
  const cx = (Number(x) || 0) + (Number(width) || 0) + 6;
  const cy = (Number(y) || 0) + (Number(height) || 0) / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={varianceTextColor(row.tone)}
      fontSize={9}
      fontWeight={600}
      dominantBaseline="middle"
    >
      {row.changePct}
    </text>
  );
}

export default function ComparisonVarianceBars({
  title,
  rows,
  periodALabel,
  periodBLabel,
  limit = 6,
  expanded = false,
  expandPayload = null,
}) {
  const { rows: data } = normalizeVarianceRows(rows, expanded ? null : limit);
  const chartData = useMemo(
    () =>
      data.map((r) => ({
        name: r.name,
        fullName: r.name,
        variance: r.change,
        changePct: formatChangePct(r.periodA, r.periodB),
        tone: varianceTone(r.change),
      })),
    [data]
  );

  const yAxisWidth = useMemo(
    () => branchYAxisWidth(chartData, expanded),
    [chartData, expanded]
  );

  const chartHeight = useMemo(() => {
    if (!expanded) return null;
    return Math.max(360, chartData.length * 44 + 80);
  }, [chartData.length, expanded]);

  const xDomain = useMemo(() => {
    const maxAbs = Math.max(...chartData.map((d) => Math.abs(d.variance)), 1);
    const bound = Math.ceil(maxAbs * 1.08);
    return [-bound, bound];
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="exec-variance-panel exec-variance-panel--compact">
        {!expanded ? (
          <ChartTitleBar
            title={title}
            expandPayload={expandPayload}
            className="exec-variance-panel__title"
          />
        ) : null}
        <p className="exec-variance-panel__empty">No data for this period</p>
      </div>
    );
  }

  const panelClass = expanded
    ? "exec-variance-panel exec-variance-panel--expanded"
    : "exec-variance-panel exec-variance-panel--compact";
  const chartClass = expanded
    ? "exec-variance-chart exec-variance-chart--bars exec-variance-chart--bars-branch exec-variance-chart--expanded"
    : "exec-variance-chart exec-variance-chart--bars exec-variance-chart--bars-branch exec-variance-chart--compact";

  return (
    <div className={panelClass}>
      {!expanded ? (
        <ChartTitleBar
          title={title}
          expandPayload={expandPayload}
          className="exec-variance-panel__title"
        />
      ) : null}
      <div className="exec-variance-bars-wrap">
        <span className="exec-variance-bars-change__head">Chg</span>
        <div
          className={chartClass}
          style={chartHeight ? { height: chartHeight, minHeight: chartHeight } : undefined}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: expanded ? 48 : 30,
                top: expanded ? 12 : 4,
                bottom: expanded ? 8 : 2,
              }}
              barCategoryGap={expanded ? "18%" : "22%"}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke={VARIANCE_COLORS.grid}
              />
              <XAxis
                type="number"
                domain={xDomain}
                tick={{ fontSize: expanded ? 11 : 8, fill: VARIANCE_COLORS.axis }}
                tickFormatter={expanded ? formatCount : formatCompactCount}
                tickCount={expanded ? 5 : 3}
                axisLine={{ stroke: VARIANCE_COLORS.grid }}
                tickLine={false}
                height={expanded ? 28 : 18}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={yAxisWidth}
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={(props) => (
                  <BranchYAxisTick {...props} chartData={chartData} expanded={expanded} />
                )}
              />
              <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1.5} />
              <Tooltip
                formatter={(v, _n, p) => [formatCount(v), p.payload.fullName]}
                contentStyle={{
                  fontSize: 10,
                  borderRadius: 8,
                  border: `1px solid ${VARIANCE_COLORS.panelBorder}`,
                }}
              />
              <Bar
                dataKey="variance"
                radius={[0, 2, 2, 0]}
                maxBarSize={expanded ? 14 : 6}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.fullName} fill={varianceChartColor(entry.tone)} />
                ))}
                <LabelList content={(props) => <ChangeLabel {...props} chartData={chartData} />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
