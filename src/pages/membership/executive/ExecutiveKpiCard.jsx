import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  formatCount,
  pctChange,
  buildSparkline,
} from "./executiveDashboardUtils";

function MetricChip({ label, current, prior, invert }) {
  const delta = pctChange(current, prior);
  const up = delta >= 0;
  const tone =
    delta === 0
      ? "neutral"
      : invert
        ? up
          ? "down"
          : "up"
        : up
          ? "up"
          : "down";

  return (
    <span className="exec-kpi-chip">
      <span className="exec-kpi-chip__label">{label}</span>
      <span className="exec-kpi-chip__vals">
        {formatCount(current)}
        <span className="exec-kpi-chip__sep">vs</span>
        {formatCount(prior)}
      </span>
      {delta !== 0 ? (
        <span className={`exec-kpi-chip__delta exec-kpi-chip__delta--${tone}`}>
          {up ? "+" : ""}
          {delta}%
        </span>
      ) : null}
    </span>
  );
}

export default function ExecutiveKpiCard({
  title,
  icon: Icon,
  accent,
  iconBg,
  value,
  ytdCurrent,
  ytdPrior,
  monthCurrent,
  monthPrior,
  sparkPrior,
  invertDelta = false,
  onClick,
}) {
  const spark = buildSparkline(
    monthCurrent ?? value,
    sparkPrior ?? monthPrior ?? ytdPrior
  );

  return (
    <div
      className="exec-kpi-card"
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="exec-kpi-card__head">
        <span
          className="exec-kpi-card__icon"
          style={{ color: accent, background: iconBg || `${accent}14` }}
        >
          <Icon />
        </span>
        <span className="exec-kpi-card__title">{title}</span>
      </div>
      <div className="exec-kpi-card__body">
        <div className="exec-kpi-card__main">
          <div className="exec-kpi-card__value" style={{ color: accent }}>
            {formatCount(value)}
          </div>
          <div className="exec-kpi-card__spark">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accent}
                  fill={accent}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="exec-kpi-card__chips">
          <MetricChip label="YTD" current={ytdCurrent} prior={ytdPrior} invert={invertDelta} />
          <MetricChip label="MTD" current={monthCurrent} prior={monthPrior} invert={invertDelta} />
        </div>
      </div>
    </div>
  );
}
