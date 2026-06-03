import React from "react";
import { formatCount, formatCompactCount } from "./executiveDashboardUtils";

export function chartLabelText(value, { compact = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "";
  return compact ? formatCompactCount(n) : formatCount(n);
}

/** Recharts LabelList `formatter` */
export function chartLabelFormatter(compact = false) {
  return (value) => chartLabelText(value, { compact });
}

const LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 600,
  fill: "#334155",
};

const LABEL_STYLE_ON_FILL = {
  fontSize: 9,
  fontWeight: 600,
  fill: "#ffffff",
};

export function chartLabelListProps({
  compact = false,
  position = "top",
  offset = 6,
  fill,
  fontSize,
} = {}) {
  return {
    position,
    offset,
    formatter: chartLabelFormatter(compact),
    style: {
      ...LABEL_STYLE,
      ...(fill ? { fill } : {}),
      ...(fontSize ? { fontSize } : {}),
    },
  };
}

export function stackedSegmentLabelProps(compact = true) {
  return {
    position: "center",
    formatter: chartLabelFormatter(compact),
    style: LABEL_STYLE_ON_FILL,
  };
}

export function renderDonutSliceLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  percent,
}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (percent != null && percent < 0.04) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const text = chartLabelText(n, { compact: true });

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={700}
      stroke="#334155"
      strokeWidth={0.35}
      paintOrder="stroke"
    >
      {text}
    </text>
  );
}
