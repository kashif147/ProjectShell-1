import React from "react";
import { Tooltip } from "antd";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  formatCount,
  pctChange,
  buildSparkline,
  KPI_METRIC_KIND,
} from "./executiveDashboardUtils";

function MetricChip({ chipLabel, subLabel, current, prior, invert, tooltip }) {
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
    <Tooltip title={tooltip} placement="bottom">
      <span className="exec-kpi-chip">
        <span className="exec-kpi-chip__head">
          <span className="exec-kpi-chip__label">{chipLabel}</span>
          {subLabel ? (
            <span className="exec-kpi-chip__sub">{subLabel}</span>
          ) : null}
        </span>
        <span className="exec-kpi-chip__vals">
          {formatCount(current)}
          <span className="exec-kpi-chip__sep">vs</span>
          {formatCount(prior)}
        </span>
        {delta !== 0 ? (
          <span
            className={`exec-kpi-chip__delta exec-kpi-chip__delta--${tone}`}
          >
            {up ? "+" : ""}
            {delta}%
          </span>
        ) : null}
      </span>
    </Tooltip>
  );
}

export default function ExecutiveKpiCard({
  title,
  icon: Icon,
  accent,
  iconBg,
  value,
  valueCaption,
  metricKind = KPI_METRIC_KIND.HEADCOUNT,
  periodLabels,
  ytdCurrent,
  ytdPrior,
  monthCurrent,
  monthPrior,
  sparkPrior,
  invertDelta = false,
  hasPriorMonthSnapshot,
  hasPriorYearSnapshot,
  onClick,
}) {
  const spark = buildSparkline(
    monthCurrent ?? value,
    sparkPrior ?? monthPrior ?? ytdPrior,
  );

  const isMovement = metricKind === KPI_METRIC_KIND.MOVEMENT;
  const {
    selectedMonthLabel = "Selected month",
    priorMonthLabel = "Prior month",
    ytdRangeLabel = "Year to date",
    lytdRangeLabel = "Same months last year",
  } = periodLabels || {};

  const priorMonthChipLabel = isMovement ? "Prior month" : "Prior month end";
  const priorMonthSub = priorMonthLabel;
  const ytdChipLabel = "Year to date";
  const ytdSub = isMovement ? ytdRangeLabel : `Headcount · ${ytdRangeLabel}`;

  const priorTooltip = isMovement
    ? `Activity in ${selectedMonthLabel} compared with ${priorMonthLabel}. Counts new joiners, leavers, or net for each full calendar month.`
    : `Members active at the end of ${selectedMonthLabel} compared with the end of ${priorMonthLabel}.${
        hasPriorMonthSnapshot === false
          ? " Prior month snapshot is not available yet."
          : ""
      }`;

  const ytdTooltip = isMovement
    ? `Cumulative from ${ytdRangeLabel} compared with ${lytdRangeLabel} (same calendar months last year).`
    : `Active headcount on the year-to-date date (${ytdRangeLabel}) compared with the same point last year (${lytdRangeLabel}).${
        hasPriorYearSnapshot === false
          ? " Last-year snapshot is not available yet."
          : ""
      }`;

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
        <div className="exec-kpi-card__title-wrap">
          <span className="exec-kpi-card__title">{title}</span>
          {valueCaption ? (
            <span className="exec-kpi-card__caption">{valueCaption}</span>
          ) : null}
        </div>
      </div>
      <div className="exec-kpi-card__body">
        <div className="exec-kpi-card__main">
          <div className="exec-kpi-card__value" style={{ color: accent }}>
            {formatCount(value)}
          </div>
          <div className="exec-kpi-card__spark">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={spark}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
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
          <MetricChip
            chipLabel={priorMonthChipLabel}
            subLabel={priorMonthSub}
            current={monthCurrent}
            prior={monthPrior}
            invert={invertDelta}
            tooltip={priorTooltip}
          />
          <MetricChip
            chipLabel={ytdChipLabel}
            subLabel={ytdSub}
            current={ytdCurrent}
            prior={ytdPrior}
            invert={invertDelta}
            tooltip={ytdTooltip}
          />
        </div>
      </div>
    </div>
  );
}
