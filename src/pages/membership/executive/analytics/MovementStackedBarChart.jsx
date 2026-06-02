import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { formatCount } from "../executiveDashboardUtils";
import { stackedSegmentLabelProps } from "../chartDataLabels";
import {
  MOVEMENT_SERIES,
  movementStackTotal,
  formatMovementTooltipValue,
  movementCategoryYAxisWidth,
} from "./movementChartConfig";

function CategoryYAxisTick({ x, y, payload, fontSize = 10 }) {
  if (x == null || y == null || !payload?.value) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      dominantBaseline="middle"
      fill="#334155"
      fontSize={fontSize}
      fontWeight={500}
    >
      {payload.value}
    </text>
  );
}

function MovementTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
  return (
    <div className="exec-movement-tooltip">
      <p className="exec-movement-tooltip__title">{label}</p>
      <ul>
        {payload
          .filter((p) => Number(p.value) > 0)
          .map((p) => {
            const [, name] = formatMovementTooltipValue(p.value, p.dataKey);
            return (
              <li key={p.dataKey}>
                <span
                  className="exec-movement-tooltip__dot"
                  style={{ background: p.color }}
                />
                {name}: <strong>{formatCount(p.value)}</strong>
              </li>
            );
          })}
      </ul>
      <p className="exec-movement-tooltip__total">
        Stack total: {formatCount(total)}
      </p>
    </div>
  );
}

export default function MovementStackedBarChart({
  data = [],
  layout = "vertical",
  categoryKey = "name",
  height = 280,
  yAxisWidth = 120,
  /** When true, widen Y-axis from category names so labels stay on one line. */
  fitCategoryLabels = false,
  categoryAxisMaxWidth = 168,
  categoryAxisMinWidth = 96,
  showLegend = false,
  maxRows,
  /** When null, render nothing if there is no data (parent handles empty state). */
  empty = "No data for this period.",
}) {
  const rows = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => movementStackTotal(b) - movementStackTotal(a),
    );
    return maxRows ? sorted.slice(0, maxRows) : sorted;
  }, [data, maxRows]);

  const isHorizontal = layout === "vertical";

  const resolvedYAxisWidth = useMemo(() => {
    if (!isHorizontal) return yAxisWidth;
    if (fitCategoryLabels) {
      return movementCategoryYAxisWidth(rows, {
        min: categoryAxisMinWidth,
        max: categoryAxisMaxWidth,
      });
    }
    return yAxisWidth;
  }, [
    isHorizontal,
    fitCategoryLabels,
    rows,
    yAxisWidth,
    categoryAxisMaxWidth,
    categoryAxisMinWidth,
  ]);

  if (!rows.length) {
    if (empty === null) return null;
    return (
      <p className="exec-analytics__empty">
        {typeof empty === "string" ? empty : "No data for this period."}
      </p>
    );
  }

  return (
    <div
      className={`exec-chart-area${fitCategoryLabels ? " exec-chart-area--fit-labels" : ""}`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={
            isHorizontal
              ? { left: 2, right: 8, top: 8, bottom: 4 }
              : { left: 8, right: 8, top: 20, bottom: 4 }
          }
          barCategoryGap={isHorizontal ? "12%" : undefined}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={!isHorizontal}
            vertical={isHorizontal}
          />
          {isHorizontal ? (
            <>
              <XAxis type="number" tickFormatter={(v) => formatCount(v)} />
              <YAxis
                type="category"
                dataKey={categoryKey}
                width={resolvedYAxisWidth}
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={
                  fitCategoryLabels
                    ? (props) => <CategoryYAxisTick {...props} fontSize={10} />
                    : { fontSize: 10 }
                }
              />
            </>
          ) : (
            <>
              <XAxis dataKey={categoryKey} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => formatCount(v)} />
            </>
          )}
          <Tooltip content={<MovementTooltip />} />
          {showLegend ? (
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) =>
                MOVEMENT_SERIES.find((s) => s.key === value)?.label || value
              }
            />
          ) : null}
          {MOVEMENT_SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.key}
              stackId="movement"
              fill={s.color}
              radius={isHorizontal ? [0, 0, 0, 0] : [0, 0, 0, 0]}
            >
              <LabelList
                dataKey={s.key}
                {...stackedSegmentLabelProps(!isHorizontal)}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
