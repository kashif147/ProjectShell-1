import React from "react";
import {
  STATS_JOINER_COLUMNS,
  STATS_LEAVER_COLUMNS,
} from "./statisticsReportColumns";

const MOVEMENT_KEYS = [
  ...STATS_JOINER_COLUMNS.map((col) => col.key),
  ...STATS_LEAVER_COLUMNS.map((col) => col.key),
];

const DATE_COLUMN_KEYS = new Set(["openingActive", "closingActive"]);

function colClassForKey(key) {
  return DATE_COLUMN_KEYS.has(key)
    ? "stats-report__col--date"
    : "stats-report__col--movement";
}

function MovementCols() {
  return MOVEMENT_KEYS.map((key) => (
    <col key={key} className="stats-report__col--movement" />
  ));
}

/** Fixed column widths shared across statistics report tables. */
export default function StatisticsReportColGroup({
  variant,
  dataColumnCount = 0,
  columns = [],
}) {
  if (variant === "category") {
    const dataCols =
      columns.length > 0
        ? columns
        : Array.from({ length: dataColumnCount }, (_, index) => ({
            key: `cat-col-${index}`,
          }));
    return (
      <colgroup>
        <col className="stats-report__col--label-single" />
        {dataCols.map((col) => (
          <col key={col.key} className={colClassForKey(col.key)} />
        ))}
      </colgroup>
    );
  }

  if (variant === "locationSingle") {
    return (
      <colgroup>
        <col className="stats-report__col--label-single" />
        <MovementCols />
      </colgroup>
    );
  }

  if (variant === "locationHierarchy") {
    return (
      <colgroup>
        <col className="stats-report__col--region" />
        <col className="stats-report__col--branch" />
        <col className="stats-report__col--work-location" />
        <MovementCols />
      </colgroup>
    );
  }

  if (variant === "regionGrandTotal") {
    return (
      <colgroup>
        <col className="stats-report__col--label-single" />
        <MovementCols />
      </colgroup>
    );
  }

  return null;
}
