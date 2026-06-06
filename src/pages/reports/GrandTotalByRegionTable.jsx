import React from "react";
import { formatReportNum, getReportCellValue } from "./statisticsReportUtils";
import {
  STATS_JOINER_COLUMNS as JOINER_MOVEMENT_COLUMNS,
  STATS_LEAVER_COLUMNS as LOCATION_LEAVER_COLUMNS,
  STATS_REINSTATE_COLUMN_KEYS,
} from "./statisticsReportColumns";
import StatisticsReportColGroup from "./StatisticsReportColGroup";

const LOCATION_BREAKDOWN_COLUMNS = [
  ...JOINER_MOVEMENT_COLUMNS,
  ...LOCATION_LEAVER_COLUMNS,
];

const CALCULATED_COLUMN_KEYS = new Set(["joiners", "leaversTotal"]);
const TOTAL_ROW_HIGHLIGHT_KEYS = new Set(["joiners", "leaversTotal"]);

function calcColClass(key, baseClass = "", { isTotalRow = false } = {}) {
  let classes = baseClass;
  if (CALCULATED_COLUMN_KEYS.has(key)) {
    classes += " stats-report__calc-col";
    if (isTotalRow && TOTAL_ROW_HIGHLIGHT_KEYS.has(key)) {
      classes += " stats-report__calc-col--total-highlight";
    }
  }
  return classes.trim();
}

function ColumnHeader({ columnKey, label }) {
  const wrapClass = STATS_REINSTATE_COLUMN_KEYS.has(columnKey)
    ? " stats-report__col-header--wrap"
    : "";
  return (
    <th
      className={`${calcColClass(columnKey)} stats-report__col-header${wrapClass}`.trim()}
      title={STATS_REINSTATE_COLUMN_KEYS.has(columnKey) ? undefined : label}
    >
      {label}
    </th>
  );
}

function RegionGrandTotalTableHead() {
  return (
    <thead>
      <tr>
        <th
          rowSpan={2}
          className="stats-report__desc stats-report__location-group-header"
        >
          Region
        </th>
        <th
          colSpan={JOINER_MOVEMENT_COLUMNS.length}
          className="stats-report__location-group-header stats-report__location-group-header--joiners"
        >
          Joiners
        </th>
        <th
          colSpan={LOCATION_LEAVER_COLUMNS.length}
          className="stats-report__location-group-header stats-report__location-group-header--leavers"
        >
          Leavers
        </th>
      </tr>
      <tr>
        {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
          <ColumnHeader key={col.key} columnKey={col.key} label={col.label} />
        ))}
      </tr>
    </thead>
  );
}

function RegionGrandTotalRow({ region }) {
  const totals = region.totals || {};
  const label = region.label || region.region;
  return (
    <tr className="stats-report__subtotal-row stats-report__region-total-row">
      <td className="stats-report__desc stats-report__region-label" title={label}>
        {label}
      </td>
      {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
        <td
          key={col.key}
          className={calcColClass(col.key, "stats-report__num", {
            isTotalRow: true,
          })}
        >
          {formatReportNum(getReportCellValue(totals, col.key))}
        </td>
      ))}
    </tr>
  );
}

export default function GrandTotalByRegionTable({ groups = [], grandTotal = {} }) {
  if (!groups.length) return null;

  return (
    <div className="stats-report__table-wrap stats-report__grand-total-by-region">
      <table className="stats-report__table stats-report__table--region-grand-total stats-report__grand-total-table">
        <StatisticsReportColGroup variant="regionGrandTotal" />
        <RegionGrandTotalTableHead />
        <tbody>
          {groups.map((region) => (
            <RegionGrandTotalRow key={region.region} region={region} />
          ))}
          <tr className="stats-report__subtotal-row stats-report__grand-total-row">
            <td className="stats-report__desc stats-report__total-label">
              Grand total
            </td>
            {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
              <td
                key={col.key}
                className={calcColClass(col.key, "stats-report__num", {
                  isTotalRow: true,
                })}
              >
                {formatReportNum(getReportCellValue(grandTotal, col.key))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
