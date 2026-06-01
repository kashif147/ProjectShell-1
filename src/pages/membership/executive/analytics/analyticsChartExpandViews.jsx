import React, { useMemo } from "react";
import MovementTrendComposedChart from "./MovementTrendComposedChart";
import MovementStackedBarChart from "./MovementStackedBarChart";
import CategoryMovementPanel from "./CategoryMovementPanel";
import { movementStackTotal } from "./movementChartConfig";

const EXPANDED_CHART_HEIGHT = 560;
const EXPANDED_AXIS_MAX_WIDTH = 280;

export function AnalyticsTrendExpand({ trendRows = [] }) {
  const rows = useMemo(
    () =>
      trendRows.map((p) => ({
        ...p,
        name: p.monthLabel || p.periodLabel,
      })),
    [trendRows]
  );

  return (
    <MovementTrendComposedChart
      data={rows}
      height={EXPANDED_CHART_HEIGHT}
      showLegend
    />
  );
}

export function AnalyticsCategoryExpand({ byCategory = [] }) {
  return (
    <div className="exec-analytics-expand-category">
      <CategoryMovementPanel data={byCategory} expanded />
    </div>
  );
}

export function AnalyticsStackedBarExpand({ data = [], maxRows = 50 }) {
  const rowCount = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => movementStackTotal(b) - movementStackTotal(a)
    );
    return (maxRows ? sorted.slice(0, maxRows) : sorted).length;
  }, [data, maxRows]);

  const height = Math.max(EXPANDED_CHART_HEIGHT, rowCount * 30);

  return (
    <MovementStackedBarChart
      data={data}
      layout="vertical"
      height={height}
      fitCategoryLabels
      categoryAxisMaxWidth={EXPANDED_AXIS_MAX_WIDTH}
      categoryAxisMinWidth={120}
      maxRows={maxRows}
    />
  );
}
