import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Collapse, Switch } from "antd";
import {
  applyPeriodToCategoryColumns,
  buildCategoryFooterTotals,
  formatReportNum,
  getReportCellValue,
} from "./statisticsReportUtils";

import LocationGroupedTable from "./LocationGroupedTable";
import GrandTotalByRegionTable from "./GrandTotalByRegionTable";
import StatisticsReportColGroup from "./StatisticsReportColGroup";
import {
  STATS_JOINER_COLUMNS as JOINER_MOVEMENT_COLUMNS,
  STATS_LEAVER_COLUMNS as LOCATION_LEAVER_COLUMNS,
  STATS_CATEGORY_TABLE_COLUMNS as CATEGORY_COLUMNS,
  STATS_REINSTATE_COLUMN_KEYS,
} from "./statisticsReportColumns";

const LOCATION_BREAKDOWN_COLUMNS = [
  ...JOINER_MOVEMENT_COLUMNS,
  ...LOCATION_LEAVER_COLUMNS,
];

/** Snapshot / derived totals used in reconciliation (opening + joiners − leavers = closing). */
const CALCULATED_COLUMN_KEYS = new Set([
  "openingActive",
  "joiners",
  "leavers",
  "leaversTotal",
  "closingActive",
]);

const TOTAL_ROW_HIGHLIGHT_KEYS = new Set([
  "joiners",
  "leavers",
  "leaversTotal",
]);

function calcColClass(key, baseClass = "", { isTotalRow = false } = {}) {
  let classes = baseClass;
  if (CALCULATED_COLUMN_KEYS.has(key)) {
    classes += " stats-report__calc-col";
    if (isTotalRow && TOTAL_ROW_HIGHLIGHT_KEYS.has(key)) {
      classes += " stats-report__calc-col--total-highlight";
    } else if (isTotalRow) {
      classes += " stats-report__calc-col--total";
    }
  }
  return classes.trim();
}

function ColumnHeader({ columnKey, label, rowSpan, colSpan }) {
  const wrapClass = STATS_REINSTATE_COLUMN_KEYS.has(columnKey)
    ? " stats-report__col-header--wrap"
    : "";
  return (
    <th
      className={`${calcColClass(columnKey)} stats-report__col-header${wrapClass}`.trim()}
      rowSpan={rowSpan}
      colSpan={colSpan}
      title={STATS_REINSTATE_COLUMN_KEYS.has(columnKey) ? undefined : label}
    >
      {label}
    </th>
  );
}

function columnHasData(rows, key) {
  return rows.some((row) => Number(row[key]) > 0);
}

function NumCell({ row, columnKey }) {
  return (
    <td className={calcColClass(columnKey, "stats-report__num")}>
      {formatReportNum(getReportCellValue(row, columnKey))}
    </td>
  );
}

function LocationTableHead({ labelHeader = "Work location" }) {
  return (
    <thead>
      <tr>
        <th
          rowSpan={2}
          className="stats-report__desc stats-report__location-group-header"
        >
          {labelHeader}
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

function ReportTable({
  columns,
  rows,
  labelColumn,
  labelHeader,
  footerLabel,
}) {
  const totals = useMemo(
    () =>
      buildCategoryFooterTotals(
        rows,
        columns.map((col) => col.key),
      ),
    [rows, columns],
  );

  if (!rows?.length) {
    return null;
  }

  return (
    <div className="stats-report__table-wrap">
      <table className="stats-report__table stats-report__table--category">
        <StatisticsReportColGroup variant="category" columns={columns} />
        <thead>
          <tr>
            <th className="stats-report__desc stats-report__col-header">
              {labelHeader}
            </th>
            {columns.map((col) => (
              <ColumnHeader key={col.key} columnKey={col.key} label={col.label} />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key || row.name}>
              <td
                className="stats-report__desc"
                title={row[labelColumn] ?? row.name}
              >
                {row[labelColumn] ?? row.name}
              </td>
              {columns.map((col) => (
                <NumCell key={col.key} row={row} columnKey={col.key} />
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="stats-report__total-row">
            <td className="stats-report__desc stats-report__total-label">
              {footerLabel}
            </td>
            {columns.map((col) => (
              <td
                key={col.key}
                className={calcColClass(col.key, "stats-report__num", {
                  isTotalRow: true,
                })}
              >
                {formatReportNum(totals[col.key])}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CategorySummaryTable({ rows, period }) {
  const visibleColumns = useMemo(() => {
    const alwaysShow = [
      "openingActive",
      "newJoin",
      "rejoin",
      "reinstatedFromSuspended",
      "reinstatedFromArchived",
      "joiners",
      "resigned",
      "cancelled",
      "leavers",
      "closingActive",
    ];
    const columns = CATEGORY_COLUMNS.filter(
      (col) =>
        alwaysShow.includes(col.key) || columnHasData(rows, col.key),
    );
    return applyPeriodToCategoryColumns(columns, period);
  }, [rows, period]);

  return (
    <section className="stats-report__section">
      <h3 className="stats-report__section-title">Membership category</h3>
      {!rows?.length ? (
        <p className="stats-report__empty">
          No membership category data for this period.
        </p>
      ) : (
      <ReportTable
        columns={visibleColumns}
        rows={rows}
        labelColumn="name"
        labelHeader="Membership category"
        footerLabel="Total"
      />
      )}
    </section>
  );
}

function MovementSubtotalRow({
  label,
  totals,
  columns = LOCATION_BREAKDOWN_COLUMNS,
  variant = "subtotal",
}) {
  const rowClass =
    variant === "grand"
      ? "stats-report__subtotal-row stats-report__grand-total-row"
      : variant === "branch-total"
        ? "stats-report__subtotal-row stats-report__branch-total-row"
        : "stats-report__subtotal-row";

  return (
    <tr className={rowClass}>
      <td className="stats-report__desc stats-report__total-label" title={label}>
        {label}
      </td>
      {columns.map((col) => (
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

const GRAND_TOTAL_COLLAPSE_KEY = "__grand_total__";

function LocationBreakdownSection({ hierarchy }) {
  const groups = hierarchy?.groups || [];
  const grandTotal = hierarchy?.grandTotal || {};
  const [activeKeys, setActiveKeys] = useState([]);

  const allCollapseKeys = useMemo(
    () => [...groups.map((g) => g.region), GRAND_TOTAL_COLLAPSE_KEY],
    [groups],
  );

  useEffect(() => {
    setActiveKeys([]);
  }, [allCollapseKeys.join("|")]);

  const allExpanded = useMemo(
    () =>
      allCollapseKeys.length > 0 &&
      allCollapseKeys.every((key) => activeKeys.includes(key)),
    [activeKeys, allCollapseKeys],
  );

  const handleExpandToggle = useCallback(
    (expanded) => {
      setActiveKeys(expanded ? allCollapseKeys : []);
    },
    [allCollapseKeys],
  );

  const collapseItems = useMemo(() => {
    const regionItems = groups.map((region) => ({
      key: region.region,
      label: (
        <span className="stats-report__group-label">
          {region.label}
          <span className="stats-report__group-summary">
            Joiners {formatReportNum(getReportCellValue(region.totals, "joiners"))}
            {" · "}
            Leavers{" "}
            {formatReportNum(getReportCellValue(region.totals, "leaversTotal"))}
          </span>
        </span>
      ),
      children: (
        <div className="stats-report__nested-groups">
          {(region.branches || []).map((branch) => (
            <div
              key={`${region.region}-${branch.branch}`}
              className="stats-report__branch-block"
            >
              <div className="stats-report__branch-title">{branch.branch}</div>
              <table className="stats-report__table stats-report__table--location-single">
                <StatisticsReportColGroup variant="locationSingle" />
                <LocationTableHead />
                <tbody>
                  {(branch.rows || []).map((row) => (
                    <tr key={`${branch.branch}-${row.name}`}>
                      <td className="stats-report__desc" title={row.name}>
                        {row.name}
                      </td>
                      {LOCATION_BREAKDOWN_COLUMNS.map((col) => (
                        <NumCell key={col.key} row={row} columnKey={col.key} />
                      ))}
                    </tr>
                  ))}
                  <MovementSubtotalRow
                    label={`${branch.branch} Total`}
                    totals={branch.totals}
                    variant="branch-total"
                  />
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ),
    }));

    regionItems.push({
      key: GRAND_TOTAL_COLLAPSE_KEY,
      label: (
        <span className="stats-report__group-label">
          Grand total by region
          <span className="stats-report__group-summary">
            Joiners {formatReportNum(getReportCellValue(grandTotal, "joiners"))}
            {" · "}
            Leavers{" "}
            {formatReportNum(getReportCellValue(grandTotal, "leaversTotal"))}
          </span>
        </span>
      ),
      children: (
        <GrandTotalByRegionTable groups={groups} grandTotal={grandTotal} />
      ),
    });

    return regionItems;
  }, [groups, grandTotal]);

  if (!groups.length) {
    return null;
  }

  return (
    <section className="stats-report__section">
      <div className="stats-report__section-heading">
        <h3 className="stats-report__section-title">
          By region, branch and work location
        </h3>
        <label className="stats-report__expand-switch no-print">
          <span className="stats-report__expand-switch-label">Expand all</span>
          <Switch
            size="small"
            checked={allExpanded}
            onChange={handleExpandToggle}
          />
        </label>
      </div>
      <Collapse
        className="stats-report__collapse"
        destroyInactivePanel={false}
        activeKey={activeKeys}
        onChange={(keys) =>
          setActiveKeys(Array.isArray(keys) ? keys : keys ? [keys] : [])
        }
        items={collapseItems}
      />
    </section>
  );
}

export default function StatisticsReportTables({
  categoryRows,
  locationHierarchy,
  includeBreakdown,
  period,
}) {
  return (
    <div className="stats-report__body">
      <CategorySummaryTable rows={categoryRows} period={period} />

      {includeBreakdown && (
        <>
          <LocationBreakdownSection hierarchy={locationHierarchy} />
          <LocationGroupedTable hierarchy={locationHierarchy} variant="print" />
        </>
      )}
    </div>
  );
}
