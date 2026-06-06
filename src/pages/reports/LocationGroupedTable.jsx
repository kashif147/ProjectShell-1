import React from "react";
import { formatReportNum, getReportCellValue } from "./statisticsReportUtils";
import {
  STATS_JOINER_COLUMNS as JOINER_MOVEMENT_COLUMNS,
  STATS_LEAVER_COLUMNS as LOCATION_LEAVER_COLUMNS,
  STATS_REINSTATE_COLUMN_KEYS,
} from "./statisticsReportColumns";
import { buildGroupedLocationSectionsForRegion } from "./statisticsReportLocationGrouping";
import GrandTotalByRegionTable from "./GrandTotalByRegionTable";
import StatisticsReportColGroup from "./StatisticsReportColGroup";

const LOCATION_BREAKDOWN_COLUMNS = [
  ...JOINER_MOVEMENT_COLUMNS,
  ...LOCATION_LEAVER_COLUMNS,
];

const CALCULATED_COLUMN_KEYS = new Set([
  "openingActive",
  "joiners",
  "leavers",
  "leaversTotal",
  "closingActive",
]);

const TOTAL_ROW_HIGHLIGHT_KEYS = new Set(["joiners", "leavers", "leaversTotal"]);

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

function NumCell({ row, columnKey, isTotalRow = false }) {
  return (
    <td className={calcColClass(columnKey, "stats-report__num", { isTotalRow })}>
      {formatReportNum(getReportCellValue(row, columnKey))}
    </td>
  );
}

function LocationHierarchyTableHead() {
  return (
    <thead>
      <tr>
        <th className="stats-report__desc">Region</th>
        <th className="stats-report__desc">Branch</th>
        <th className="stats-report__desc">Work location</th>
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
        <th className="stats-report__desc" />
        <th className="stats-report__desc" />
        <th className="stats-report__desc" />
        {LOCATION_BREAKDOWN_COLUMNS.map((col) => {
          const wrapClass = STATS_REINSTATE_COLUMN_KEYS.has(col.key)
            ? " stats-report__col-header stats-report__col-header--wrap"
            : " stats-report__col-header";
          return (
            <th
              key={col.key}
              className={`${calcColClass(col.key)}${wrapClass}`.trim()}
            >
              {col.label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function GroupedRow({ row }) {
  const { rowType } = row;
  const isTotalRow = rowType === "branch-total" || rowType === "grand-total";

  if (rowType === "region") {
    return (
      <tr className="stats-report__region-row">
        <td className="stats-report__desc stats-report__region-label" colSpan={3}>
          {row.region}
        </td>
        {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
          <td key={col.key} className="stats-report__num stats-report__region-metrics">
            {formatReportNum(getReportCellValue(row, col.key))}
          </td>
        ))}
      </tr>
    );
  }

  if (rowType === "branch") {
    return (
      <tr className="stats-report__branch-row stats-report__branch-total-row">
        <td className="stats-report__desc" />
        <td className="stats-report__desc stats-report__branch-label" colSpan={2}>
          {row.branch}
        </td>
        {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
          <NumCell
            key={col.key}
            row={row}
            columnKey={col.key}
            isTotalRow
          />
        ))}
      </tr>
    );
  }

  const rowClass =
    rowType === "grand-total"
      ? "stats-report__subtotal-row stats-report__grand-total-row"
      : rowType === "branch-total"
        ? "stats-report__subtotal-row stats-report__branch-total-row"
        : isTotalRow
          ? "stats-report__subtotal-row"
          : "";

  return (
    <tr className={rowClass}>
      <td className="stats-report__desc">{row.region}</td>
      <td className="stats-report__desc">{row.branch}</td>
      <td
        className={`stats-report__desc ${
          isTotalRow ? "stats-report__total-label" : ""
        }`}
      >
        {row.workLocation}
      </td>
      {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
        <NumCell
          key={col.key}
          row={row}
          columnKey={col.key}
          isTotalRow={isTotalRow}
        />
      ))}
    </tr>
  );
}

function LocationRegionTable({ sections, regionKey }) {
  if (!sections?.length) return null;

  return (
    <div className="stats-report__region-block stats-report__region-block--page-break">
      <div className="stats-report__table-wrap">
        <table className="stats-report__table stats-report__table--location-hierarchy stats-report__grouped-location-table">
          <StatisticsReportColGroup variant="locationHierarchy" />
          <LocationHierarchyTableHead />
          <tbody>
            {sections.map((row, index) => (
              <GroupedRow key={`${regionKey}-${row.rowType}-${index}`} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LocationGroupedTable({ hierarchy, variant = "print" }) {
  const groups = hierarchy?.groups || [];
  if (!groups.length) return null;

  return (
    <section
      className={`stats-report__section stats-report__grouped-location stats-report__grouped-location--${variant}`}
    >
      <h3 className="stats-report__section-title">
        By region, branch and work location
      </h3>

      {groups.map((region) => (
        <LocationRegionTable
          key={region.region}
          regionKey={region.region}
          sections={buildGroupedLocationSectionsForRegion(region)}
        />
      ))}

      <div className="stats-report__grand-total-section">
        <h4 className="stats-report__subsection-title">Grand total by region</h4>
        <GrandTotalByRegionTable
          groups={groups}
          grandTotal={hierarchy?.grandTotal || {}}
        />
      </div>
    </section>
  );
}
