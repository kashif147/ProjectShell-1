import React, { useMemo } from "react";
import { movementStackTotal } from "./movementChartConfig";
import MovementBreakdownTable from "./MovementBreakdownTable";

const MAX_ROWS = 20;

export default function CategoryMovementPanel({ data = [], expanded = false }) {
  const rows = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => movementStackTotal(b) - movementStackTotal(a)
    );
    return sorted.slice(0, MAX_ROWS);
  }, [data]);

  if (!rows.length) {
    return (
      <div className="exec-analytics-category-panel exec-analytics-category-panel--empty">
        <p className="exec-analytics__empty">No data for this period.</p>
      </div>
    );
  }

  return (
    <div
      className={`exec-analytics-category-panel exec-analytics-category-panel--table-only${
        expanded ? " exec-analytics-category-panel--expanded" : ""
      }`}
    >
      <div
        className={`exec-analytics__table-wrap${
          expanded ? "" : " exec-analytics__table-wrap--pair"
        }`}
      >
        <MovementBreakdownTable data={rows} compact fillHeight={!expanded} />
      </div>
    </div>
  );
}
