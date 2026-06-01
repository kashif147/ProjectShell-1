import React, { useMemo } from "react";
import {
  buildActiveTrendSeries,
  buildWaterfallSteps,
  rollupChartSlices,
} from "./executiveDashboardUtils";
import { buildComparisonWaterfallSteps } from "./comparison/comparisonVarianceUtils";
import ComparisonVarianceTable from "./comparison/ComparisonVarianceTable";
import ComparisonVarianceBars from "./comparison/ComparisonVarianceBars";
import ComparisonVarianceHeatmap from "./comparison/ComparisonVarianceHeatmap";
import ComparisonWaterfall from "./comparison/ComparisonWaterfall";
import {
  ActiveTrendChart,
  CategoryDonutChart,
  RegionListChart,
  NetGrowthWaterfall,
  buildCategorySlices,
} from "./middleRowChartViews";

export default function ExecutiveChartExpandRenderer({ payload }) {
  const type = payload?.type;

  const middleCategory = useMemo(() => {
    if (type !== "middle-category") return null;
    return buildCategorySlices(payload.categoryData);
  }, [type, payload]);

  const middleWaterfall = useMemo(() => {
    if (type !== "middle-waterfall") return null;
    return buildWaterfallSteps(payload.dashboardData || {});
  }, [type, payload]);

  const comparisonWaterfall = useMemo(() => {
    if (type !== "variance-waterfall") return null;
    return buildComparisonWaterfallSteps(payload.comparison);
  }, [type, payload]);

  switch (type) {
    case "middle-trend": {
      const series = buildActiveTrendSeries(payload.dashboardData || {});
      return (
        <ActiveTrendChart
          expanded
          trend={series.points}
          lastYearLabel={series.lastYearLabel}
          thisYearLabel={series.thisYearLabel}
        />
      );
    }

    case "middle-category": {
      const categoryTotal =
        middleCategory.reduce((s, c) => s + (c.value || 0), 0) ||
        Number(payload.totalActive) ||
        0;
      const totalActive = Number(payload.totalActive) || categoryTotal;
      return (
        <CategoryDonutChart
          expanded
          category={middleCategory}
          categoryTotal={categoryTotal}
          totalActive={totalActive}
        />
      );
    }

    case "middle-region": {
      const allRegions = [...(payload.regionData || [])].sort(
        (a, b) => (b.count || 0) - (a.count || 0)
      );
      const regionTotal =
        allRegions.reduce((s, r) => s + (r.count || 0), 0) || 1;
      return (
        <RegionListChart expanded regions={allRegions} regionTotal={regionTotal} />
      );
    }

    case "middle-waterfall":
      return (
        <NetGrowthWaterfall
          expanded
          waterfallSteps={middleWaterfall.steps}
          waterfallDomain={middleWaterfall.yDomain}
        />
      );

    case "variance-table":
      return (
        <ComparisonVarianceTable
          title={payload.chartTitle}
          rows={payload.rows}
          periodALabel={payload.periodALabel}
          periodBLabel={payload.periodBLabel}
          dimensionLabel={payload.dimensionLabel}
          wideNameColumn={payload.wideNameColumn}
          showTotal={payload.showTotal}
          expanded
        />
      );

    case "variance-bars":
      return (
        <ComparisonVarianceBars
          title={payload.chartTitle}
          rows={payload.rows}
          periodALabel={payload.periodALabel}
          periodBLabel={payload.periodBLabel}
          expanded
        />
      );

    case "variance-heatmap":
      return (
        <ComparisonVarianceHeatmap
          title={payload.chartTitle}
          rows={payload.rows}
          periodALabel={payload.periodALabel}
          periodBLabel={payload.periodBLabel}
          dimensionLabel={payload.dimensionLabel}
          expanded
        />
      );

    case "variance-waterfall":
      return (
        <ComparisonWaterfall
          comparison={payload.comparison}
          title={payload.chartTitle}
          expanded
          steps={comparisonWaterfall.steps}
          yDomain={comparisonWaterfall.yDomain}
        />
      );

    default:
      return <p className="exec-chart-expand-page__error">Unknown chart type.</p>;
  }
}
