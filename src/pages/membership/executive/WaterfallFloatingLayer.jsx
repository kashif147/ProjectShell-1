import React from "react";
import { usePlotArea, useXAxisTicks, useYAxisScale } from "recharts";
import { VARIANCE_COLORS } from "./comparison/comparisonVarianceTheme";

function bridgeEndpoints(i, p0, p1) {
  if (i === 0) return { y1: p0.yTop, y2: p1.yBottom };
  if (i === 1) return { y1: p0.yTop, y2: p1.yTop };
  return { y1: p0.yBottom, y2: p1.yTop };
}

function layoutWaterfallItems(steps, yScale, plotArea, xTicks, compact) {
  const n = steps.length;
  const bandSize =
    xTicks && xTicks.length > 1
      ? Math.abs(Number(xTicks[1].coordinate) - Number(xTicks[0].coordinate))
      : plotArea.width / Math.max(n, 1);
  const barW = Math.max(compact ? 14 : 20, bandSize * (compact ? 0.4 : 0.48));

  return steps
    .map((step, index) => {
      const tick = xTicks?.[index];
      const cx =
        tick?.coordinate != null
          ? Number(tick.coordinate) + bandSize / 2
          : plotArea.x + (index + 0.5) * (plotArea.width / n);

      const bottom = Number(step.offset) || 0;
      const top = bottom + (Number(step.value) || 0);
      const yTop = yScale(top);
      const yBottom = yScale(bottom);
      if (yTop == null || yBottom == null) return null;

      const height = Math.max(0, yBottom - yTop);
      return {
        step,
        cx,
        x: cx - barW / 2,
        yTop,
        yBottom,
        height,
        barW,
      };
    })
    .filter(Boolean);
}

/**
 * True waterfall: each segment draws from `offset` to `offset + value`
 * (not from y=0). Totals span baseline → value; deltas float on prior level.
 */
export default function WaterfallFloatingLayer({ steps, compact = false }) {
  const yScale = useYAxisScale();
  const plotArea = usePlotArea();
  const xTicks = useXAxisTicks();

  if (!yScale || !plotArea || !steps?.length) return null;

  const labelSize = compact ? 8 : 11;
  const labelOffset = compact ? 5 : 7;
  const items = layoutWaterfallItems(steps, yScale, plotArea, xTicks, compact);
  if (!items.length) return null;

  return (
    <g className="exec-waterfall-floating">
      <g className="exec-waterfall-connectors" aria-hidden="true">
        {items.slice(0, -1).map((p0, i) => {
          const p1 = items[i + 1];
          const { y1, y2 } = bridgeEndpoints(i, p0, p1);
          return (
            <line
              key={`wf-bridge-${i}`}
              x1={p0.cx}
              y1={y1}
              x2={p1.cx}
              y2={y2}
              stroke="#cbd5e1"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          );
        })}
      </g>

      {items.map(({ step, x, yTop, height, cx, barW }) => {
        const value = Number(step.value) || 0;
        if (step.type === "delta" && value === 0) return null;

        const h = Math.max(height, value > 0 ? (step.type === "delta" ? 3 : 2) : 0);
        if (h <= 0) return null;

        return (
          <g key={step.name} className="exec-waterfall-column">
            <rect
              x={x}
              y={yTop}
              width={barW}
              height={h}
              fill={step.fill}
              rx={4}
              ry={4}
            >
              <title>{`${step.name}: ${step.label}`}</title>
            </rect>
            <text
              x={cx}
              y={yTop - labelOffset}
              textAnchor="middle"
              fontSize={labelSize}
              fontWeight={600}
              fill={VARIANCE_COLORS.headerText}
            >
              {step.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
