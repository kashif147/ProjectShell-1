import React from "react";
import { formatCount, pctChange } from "./executiveDashboardUtils";

export default function ExecutiveComparisonPill({
  title,
  periodALabel,
  periodBLabel,
  valueA,
  valueB,
  compact = false,
}) {
  const a = Number(valueA) || 0;
  const b = Number(valueB) || 0;
  const variance = b - a;
  const changePct = pctChange(b, a);
  const up = variance >= 0;

  return (
    <div
      className={`exec-compare-pill${compact ? " exec-compare-pill--compact" : ""}`}
    >
      <h4 className="exec-compare-pill__title">{title}</h4>
      <div className="exec-compare-pill__periods">
        <div className="exec-compare-pill__period">
          <span className="exec-compare-pill__period-label">{periodALabel}</span>
          <span className="exec-compare-pill__period-value">{formatCount(a)}</span>
        </div>
        <div className="exec-compare-pill__period">
          <span className="exec-compare-pill__period-label">{periodBLabel}</span>
          <span className="exec-compare-pill__period-value">{formatCount(b)}</span>
        </div>
      </div>
      <div className="exec-compare-pill__divider" />
      <div className="exec-compare-pill__footer">
        <div className="exec-compare-pill__metric">
          <span className="exec-compare-pill__metric-label">Variance</span>
          <span
            className={`exec-compare-pill__metric-value exec-compare-pill__metric-value--${up ? "up" : "down"}`}
          >
            {variance >= 0 ? "+" : ""}
            {formatCount(variance)}
          </span>
        </div>
        <div className="exec-compare-pill__metric">
          <span className="exec-compare-pill__metric-label">Change</span>
          <span
            className={`exec-compare-pill__metric-value exec-compare-pill__metric-value--${up ? "up" : "down"}`}
          >
            {changePct >= 0 ? "+" : ""}
            {changePct}%
          </span>
        </div>
      </div>
    </div>
  );
}
