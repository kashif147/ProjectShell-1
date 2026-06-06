import React from "react";
import { Card } from "antd";

function formatTileCount(value) {
  if (value == null || value === "") return "0";
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-IE", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(n));
}

function pctChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (!p) return c === 0 ? 0 : 100;
  return (((c - p) / p) * 100).toFixed(1);
}

function ComparisonChip({ label, current, prior, invertDelta = false }) {
  const change = pctChange(current, prior);
  const changeNum = Number(change);
  const isUp = changeNum >= 0;
  const deltaClass =
    changeNum === 0
      ? "neutral"
      : invertDelta
        ? isUp
          ? "down"
          : "up"
        : isUp
          ? "up"
          : "down";

  return (
    <span className="membership-kpi-chip" title={`${label}: current vs prior period`}>
      <span className="membership-kpi-chip__label">{label}</span>
      <span className="membership-kpi-chip__body">
        <span className="membership-kpi-chip__nums">
          {formatTileCount(current)}
          <span className="membership-kpi-chip__sep">vs</span>
          {formatTileCount(prior)}
        </span>
        {changeNum !== 0 ? (
          <span className={`membership-kpi-chip__delta membership-kpi-chip__delta--${deltaClass}`}>
            {isUp ? "+" : ""}
            {change}%
          </span>
        ) : null}
      </span>
    </span>
  );
}

export default function MembershipKpiPillCard({
  title,
  icon: Icon,
  color,
  iconBg,
  value,
  ytdCurrent,
  ytdPrior,
  monthCurrent,
  monthPrior,
  invertDelta = false,
  onValueClick,
}) {
  return (
    <Card className="membership-kpi-pill" bordered={false}>
      <div className="membership-kpi-pill__header">
        <span
          className="membership-kpi-pill__icon"
          style={{ color, background: iconBg }}
          aria-hidden
        >
          <Icon />
        </span>
        <span className="membership-kpi-pill__title">{title}</span>
      </div>
      <div
        className="membership-kpi-pill__value"
        style={{ color }}
        onClick={onValueClick}
        onKeyDown={(e) => {
          if (onValueClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onValueClick();
          }
        }}
        role={onValueClick ? "button" : undefined}
        tabIndex={onValueClick ? 0 : undefined}
      >
        {formatTileCount(value)}
      </div>
      <div className="membership-kpi-pill__chips">
        <ComparisonChip
          label="YTD"
          current={ytdCurrent}
          prior={ytdPrior}
          invertDelta={invertDelta}
        />
        <ComparisonChip
          label="MTD"
          current={monthCurrent}
          prior={monthPrior}
          invertDelta={invertDelta}
        />
      </div>
    </Card>
  );
}

export { formatTileCount, pctChange };
