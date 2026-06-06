import React from "react";
import {
  formatChangePct,
  formatVarianceCell,
  normalizeVarianceRows,
  shortPeriodLabel,
  truncateLabel,
  varianceTone,
} from "./comparisonVarianceUtils";
import { formatCount } from "../executiveDashboardUtils";
import ChartTitleBar from "../ChartTitleBar";

export default function ComparisonVarianceTable({
  title,
  rows,
  periodALabel,
  periodBLabel,
  dimensionLabel = "Category",
  limit = 8,
  showTotal = true,
  wideNameColumn = false,
  expanded = false,
  expandPayload = null,
}) {
  const rowLimit = expanded ? null : limit;
  const { rows: data, totals } = normalizeVarianceRows(rows, rowLimit);

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

  const useWideName = wideNameColumn || expanded;
  const panelClass = expanded
    ? "exec-variance-panel exec-variance-panel--expanded"
    : "exec-variance-panel exec-variance-panel--compact";
  const tableClass = expanded
    ? `exec-variance-table${useWideName ? " exec-variance-table--wide-name" : ""}`
    : `exec-variance-table exec-variance-table--compact${
        useWideName ? " exec-variance-table--wide-name" : ""
      }`;

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
              <th>Chg</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name}>
                <td title={row.name}>
                  {expanded ? row.name : truncateLabel(row.name, useWideName ? 28 : 14)}
                </td>
                <td>{formatCount(row.periodA)}</td>
                <td>{formatCount(row.periodB)}</td>
                <td>
                  <span className={`exec-variance-val exec-variance-val--${varianceTone(row.change)}`}>
                    {formatVarianceCell(row.change)}
                  </span>
                </td>
                <td>
                  <span className={`exec-variance-val exec-variance-val--${varianceTone(row.change)}`}>
                    {formatChangePct(row.periodA, row.periodB)}
                  </span>
                </td>
              </tr>
            ))}
            {showTotal ? (
              <tr className="exec-variance-table__total">
                <td>Total</td>
                <td>{formatCount(totals.periodA)}</td>
                <td>{formatCount(totals.periodB)}</td>
                <td>
                  <span className={`exec-variance-val exec-variance-val--${varianceTone(totals.change)}`}>
                    {formatVarianceCell(totals.change)}
                  </span>
                </td>
                <td>
                  <span className={`exec-variance-val exec-variance-val--${varianceTone(totals.change)}`}>
                    {formatChangePct(totals.periodA, totals.periodB)}
                  </span>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
