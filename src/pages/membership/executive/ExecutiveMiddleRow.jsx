import React, { useMemo } from "react";
import { Card } from "antd";
import {
  buildActiveTrendSeries,
  buildWaterfallSteps,
  rollupChartSlices,
} from "./executiveDashboardUtils";
import ChartExpandButton from "./ChartExpandButton";
import {
  ActiveTrendChart,
  CategoryDonutChart,
  RegionListChart,
  NetGrowthWaterfall,
  buildCategorySlices,
} from "./middleRowChartViews";

const TREND_TITLE = "Active Members Trend";
const CATEGORY_TITLE = "Members by Category";
const REGION_TITLE = "Members by Region";
const WATERFALL_TITLE = "Net Growth (This Month)";

function Panel({ title, children, className = "", expandPayload }) {
  return (
    <Card
      className={`exec-panel ${className}`}
      bordered={false}
      title={title}
      extra={<ChartExpandButton title={title} payload={expandPayload} />}
    >
      {children}
    </Card>
  );
}

export default function ExecutiveMiddleRow({ data }) {
  const { points: trend, lastYearLabel, thisYearLabel } = buildActiveTrendSeries(data);

  const categoryPreview = useMemo(
    () => rollupChartSlices(data.categoryData || [], { maxSlices: 6 }),
    [data.categoryData]
  );
  const categoryFull = useMemo(
    () => buildCategorySlices(data.categoryData),
    [data.categoryData]
  );

  const categoryTotal =
    categoryFull.reduce((s, c) => s + (c.value || 0), 0) ||
    Number(data.totalActive) ||
    0;
  const totalActive = Number(data.totalActive) || categoryTotal;

  const allRegions = useMemo(
    () =>
      [...(data.regionData || [])].sort(
        (a, b) => (b.count || 0) - (a.count || 0)
      ),
    [data.regionData]
  );
  const regionTotal =
    allRegions.reduce((s, r) => s + (r.count || 0), 0) || 1;
  const regionsPreview = allRegions.slice(0, 8);

  const { steps: waterfallSteps, yDomain: waterfallDomain } = useMemo(
    () => buildWaterfallSteps(data),
    [data]
  );

  const trendExpand = {
    type: "middle-trend",
    dashboardData: data,
  };
  const categoryExpand = {
    type: "middle-category",
    categoryData: data.categoryData || [],
    totalActive,
  };
  const regionExpand = {
    type: "middle-region",
    regionData: data.regionData || [],
  };
  const waterfallExpand = {
    type: "middle-waterfall",
    dashboardData: data,
  };

  return (
    <div className="exec-middle-grid">
      <Panel title={TREND_TITLE} className="exec-middle-grid__trend" expandPayload={trendExpand}>
        <ActiveTrendChart
          expanded={false}
          trend={trend}
          lastYearLabel={lastYearLabel}
          thisYearLabel={thisYearLabel}
        />
      </Panel>

      <Panel
        title={CATEGORY_TITLE}
        className="exec-middle-grid__donut"
        expandPayload={categoryExpand}
      >
        <CategoryDonutChart
          expanded={false}
          category={categoryPreview}
          categoryTotal={categoryTotal}
          totalActive={totalActive}
        />
      </Panel>

      <Panel title={REGION_TITLE} className="exec-middle-grid__region" expandPayload={regionExpand}>
        <RegionListChart
          expanded={false}
          regions={regionsPreview}
          regionTotal={regionTotal}
        />
      </Panel>

      <Panel
        title={WATERFALL_TITLE}
        className="exec-middle-grid__waterfall"
        expandPayload={waterfallExpand}
      >
        <NetGrowthWaterfall
          expanded={false}
          waterfallSteps={waterfallSteps}
          waterfallDomain={waterfallDomain}
        />
      </Panel>
    </div>
  );
}
