import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { formatCount, formatCompactCount } from "../executiveDashboardUtils";
import { chartLabelListProps } from "../chartDataLabels";
import {
  EXEC_CHART_GREEN,
  MOVEMENT_SERIES,
  formatMovementTooltipValue,
} from "./movementChartConfig";

const ACTIVE_SERIES = MOVEMENT_SERIES.find((s) => s.key === "active");
const FLOW_SERIES = MOVEMENT_SERIES.filter((s) => s.key !== "active");

function MovementTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
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
    </div>
  );
}

export default function MovementTrendComposedChart({
  data = [],
  categoryKey = "name",
  height = 224,
  showLegend = true,
}) {
  if (!data?.length) {
    return (
      <p className="exec-analytics__empty">No trend data for this period.</p>
    );
  }

  return (
    <div
      className="exec-chart-area exec-chart-area--trend-composed"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ left: 4, right: 4, top: 22, bottom: showLegend ? 4 : 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey} tick={{ fontSize: 10 }} />
          <YAxis
            yAxisId="active"
            orientation="left"
            tickFormatter={(v) => formatCompactCount(v)}
            tick={{ fontSize: 10 }}
            width={44}
          />
          <YAxis
            yAxisId="flow"
            orientation="right"
            tickFormatter={(v) => formatCompactCount(v)}
            tick={{ fontSize: 10 }}
            width={40}
          />
          <Tooltip content={<MovementTrendTooltip />} />
          {showLegend ? (
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
              formatter={(value) =>
                MOVEMENT_SERIES.find((s) => s.key === value)?.label || value
              }
            />
          ) : null}
          <Bar
            yAxisId="active"
            dataKey="active"
            name="active"
            fill={ACTIVE_SERIES?.color || EXEC_CHART_GREEN}
            fillOpacity={0.85}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          >
            <LabelList
              dataKey="active"
              {...chartLabelListProps({
                compact: true,
                position: "top",
                offset: 6,
                fill: "#166534",
              })}
            />
          </Bar>
          {FLOW_SERIES.map((s) => (
            <Line
              key={s.key}
              yAxisId="flow"
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 2, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            >
              <LabelList
                dataKey={s.key}
                {...chartLabelListProps({
                  compact: true,
                  position: "top",
                  offset: 10,
                  fill: s.color,
                })}
              />
            </Line>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
