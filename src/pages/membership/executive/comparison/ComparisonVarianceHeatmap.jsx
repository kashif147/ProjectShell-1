import React from "react";
import {
  formatVarianceCell,
  normalizeVarianceRows,
  shortPeriodLabel,
  truncateLabel,
  varianceTone,
} from "./comparisonVarianceUtils";
import { formatCount } from "../executiveDashboardUtils";
import { VARIANCE_COLORS } from "./comparisonVarianceTheme";
import ChartTitleBar from "../ChartTitleBar";

function heatBackground(change, maxAbs) {
  const n = Math.abs(Number(change) || 0);
  if (!maxAbs || !n) return "transparent";
  const alpha = Math.min(0.72, 0.18 + (n / maxAbs) * 0.54);
  const rgb = change >= 0 ? VARIANCE_COLORS.heatUp : VARIANCE_COLORS.heatDown;
  return `rgba(${rgb}, ${alpha})`;
}

export default function ComparisonVarianceHeatmap({
  title,
  rows,
  periodALabel,
  periodBLabel,
  dimensionLabel = "Region",
  limit = 8,
  expanded = false,
  expandPayload = null,
}) {
  const { rows: data } = normalizeVarianceRows(rows, expanded ? null : limit);
  const maxAbs = Math.max(...data.map((r) => Math.abs(r.change)), 1);

  if (!data.length) {
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
  const tableClass = expanded
    ? "exec-variance-table exec-variance-table--heatmap"
    : "exec-variance-table exec-variance-table--heatmap exec-variance-table--compact";

  return (
    <div className={panelClass}>
      {!expanded ? (
        <ChartTitleBar
          title={title}
          expandPayload={expandPayload}
          className="exec-variance-panel__title"
        />
      ) : null}
      <div className="exec-variance-table-wrap">
        <table className={tableClass}>
          <thead>
            <tr>
              <th title={dimensionLabel}>{dimensionLabel}</th>
              <th title={periodALabel}>
                {expanded ? periodALabel : shortPeriodLabel(periodALabel)}
              </th>
              <th title={periodBLabel}>
                {expanded ? periodBLabel : shortPeriodLabel(periodBLabel)}
              </th>
              <th>Var</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const tone = varianceTone(row.change);
              return (
                <tr key={row.name}>
                  <td title={row.name}>
                    {expanded ? row.name : truncateLabel(row.name, 14)}
                  </td>
                  <td>{formatCount(row.periodA)}</td>
                  <td>{formatCount(row.periodB)}</td>
                  <td
                    className={`exec-variance-heat exec-variance-heat--${tone}`}
                    style={{ background: heatBackground(row.change, maxAbs) }}
                  >
                    <span className={`exec-variance-val exec-variance-val--${tone}`}>
                      {formatVarianceCell(row.change)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="exec-variance-legend">
        <span className="exec-variance-legend__item exec-variance-legend__item--down">
          Decrease
        </span>
        <span className="exec-variance-legend__item exec-variance-legend__item--up">
          <span className="exec-variance-legend__gradient" aria-hidden="true" />
          Increase
        </span>
      </div>
    </div>
  );
}
