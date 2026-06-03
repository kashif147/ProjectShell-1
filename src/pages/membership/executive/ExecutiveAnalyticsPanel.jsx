import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Card } from "antd";
import {
  buildKpiPeriodLabels,
  formatCount,
  pctChange,
} from "./executiveDashboardUtils";
import { EXEC_MINI_KPI_ICONS, ExecDashboardIcon } from "./executiveDashboardIcons";
import { MOVEMENT_SERIES } from "./analytics/movementChartConfig";
import MovementStackLegend from "./analytics/MovementStackLegend";
import MovementStackedBarChart from "./analytics/MovementStackedBarChart";
import MovementTrendComposedChart from "./analytics/MovementTrendComposedChart";
import ChartExpandButton from "./ChartExpandButton";
import CategoryMovementPanel from "./analytics/CategoryMovementPanel";

/** Shared chart height for side-by-side category + trend panels */
const ANALYTICS_PAIR_CHART_HEIGHT = 224;

/** Grade / branch / section row — shared bar chart height */
const ANALYTICS_TRIO_CHART_HEIGHT = 440;
const ANALYTICS_TRIO_AXIS_MAX_WIDTH = 200;

const MINI_ICON_BY_KEY = {
  active: EXEC_MINI_KPI_ICONS.active,
  newJoin: EXEC_MINI_KPI_ICONS.joiners,
  rejoin: { ...EXEC_MINI_KPI_ICONS.joiners, accent: "#06b6d4" },
  reinstate: { ...EXEC_MINI_KPI_ICONS.joiners, accent: "#8b5cf6" },
  resigned: EXEC_MINI_KPI_ICONS.resigned,
  cancelled: EXEC_MINI_KPI_ICONS.cancelled,
};

function Panel({ title, children, expandPayload }) {
  return (
    <Card
      className="exec-panel exec-panel--nested"
      bordered={false}
      title={title}
      extra={
        expandPayload ? (
          <ChartExpandButton title={title} payload={expandPayload} />
        ) : null
      }
    >
      {children}
    </Card>
  );
}

function resolvePriorMovementRow(trendRows, periodYear, periodMonth) {
  const trend = trendRows || [];
  if (!trend.length) return null;

  if (periodYear >= 2000 && periodMonth >= 1 && periodMonth <= 12) {
    const priorAnchor = dayjs(
      `${periodYear}-${String(periodMonth).padStart(2, "0")}-01`
    ).subtract(1, "month");
    const py = priorAnchor.year();
    const pm = priorAnchor.month() + 1;
    const match = trend.find((r) => r.year === py && r.month === pm);
    if (match) return match;
  }

  return trend.length >= 2 ? trend[trend.length - 2] : null;
}

function formatMovementCompareDelta(current, prior) {
  const c = Number(current) || 0;
  const p = Number(prior) || 0;
  const change = c - p;
  if (change === 0) {
    return { text: "0 (0%)", tone: "neutral" };
  }
  const pct = pctChange(c, p);
  const changeLabel =
    change > 0 ? `+${formatCount(change)}` : formatCount(change);
  const pctLabel = pct > 0 ? `+${pct}` : String(pct);
  return {
    text: `${changeLabel} (${pctLabel}%)`,
    tone: change > 0 ? "up" : "down",
  };
}

function MovementMiniKpis({
  headline,
  trendRows,
  periodYear,
  periodMonth,
  priorMonthShort,
  hasPriorMonthSnapshot,
}) {
  const row = headline || {};
  const priorRow = useMemo(
    () => resolvePriorMovementRow(trendRows, periodYear, periodMonth),
    [trendRows, periodYear, periodMonth]
  );

  return (
    <div className="exec-mini-kpi-row exec-mini-kpi-row--movement">
      {MOVEMENT_SERIES.map((s) => {
        const spec = MINI_ICON_BY_KEY[s.key] || EXEC_MINI_KPI_ICONS.active;
        const current = row[s.key];
        const prior = priorRow?.[s.key];
        const compare =
          hasPriorMonthSnapshot === true && priorRow
            ? formatMovementCompareDelta(current, prior)
            : null;

        return (
          <div key={s.key} className="exec-mini-kpi exec-mini-kpi--card">
            <div className="exec-mini-kpi__top">
              <ExecDashboardIcon spec={spec} />
              <div className="exec-mini-kpi__meta">
                <span className="exec-mini-kpi__label">{s.label}</span>
                <span className="exec-mini-kpi__value">{formatCount(current)}</span>
              </div>
            </div>
            <div className="exec-mini-kpi__compare">
              <span className="exec-mini-kpi__compare-label">
                vs {priorMonthShort}
              </span>
              {compare ? (
                <span
                  className={`exec-mini-kpi__compare-delta exec-mini-kpi__compare-delta--${compare.tone}`}
                >
                  {compare.text}
                </span>
              ) : (
                <span className="exec-mini-kpi__compare-delta exec-mini-kpi__compare-delta--neutral">
                  —
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ExecutiveAnalyticsPanel({ data }) {
  const periodLabels = useMemo(() => buildKpiPeriodLabels(data), [data]);
  const mov = data?.movementAnalytics || {};
  const headline = mov.headline;
  const { selectedMonthLabel, priorMonthLabel } = periodLabels;
  const priorMonthShort = useMemo(() => {
    const year = Number(data?.periodYear);
    const month = Number(data?.periodMonth);
    if (year >= 2000 && month >= 1 && month <= 12) {
      return dayjs(`${year}-${String(month).padStart(2, "0")}-01`)
        .subtract(1, "month")
        .format("MMM YYYY");
    }
    return priorMonthLabel;
  }, [data?.periodYear, data?.periodMonth, priorMonthLabel]);

  const trendRows = useMemo(
    () =>
      (mov.trend12Months || []).map((p) => ({
        ...p,
        name: p.monthLabel || p.periodLabel,
      })),
    [mov.trend12Months]
  );

  const categoryPanelTitle = `Monthly stats by membership category — ${selectedMonthLabel}`;
  const gradePanelTitle = `Active members by grade — ${selectedMonthLabel}`;
  const branchPanelTitle = `Active members by branch — ${selectedMonthLabel}`;
  const sectionPanelTitle = `Active members by section — ${selectedMonthLabel}`;

  const categoryExpand = {
    type: "analytics-category",
    byCategory: mov.byCategory || [],
  };
  const trendExpand = {
    type: "analytics-trend",
    trendRows: mov.trend12Months || [],
  };
  const gradeExpand = {
    type: "analytics-stacked-bar",
    data: mov.byGrade || [],
    maxRows: 50,
  };
  const branchExpand = {
    type: "analytics-stacked-bar",
    data: mov.byBranch || [],
    maxRows: 50,
  };
  const sectionExpand = {
    type: "analytics-stacked-bar",
    data: mov.bySection || [],
    maxRows: 50,
  };

  return (
    <section className="exec-analytics">
      <MovementStackLegend />
      <MovementMiniKpis
        headline={headline}
        trendRows={mov.trend12Months}
        periodYear={data?.periodYear}
        periodMonth={data?.periodMonth}
        priorMonthShort={priorMonthShort}
        hasPriorMonthSnapshot={data?.hasPriorMonthSnapshot}
      />

      <div className="exec-analytics-duo exec-analytics-duo--pair">
        <Panel title={categoryPanelTitle} expandPayload={categoryExpand}>
          <CategoryMovementPanel data={mov.byCategory} />
        </Panel>

        <Panel title="Last 12 months — movement trend" expandPayload={trendExpand}>
          <div className="exec-analytics-chart-block exec-analytics-chart-block--trend">
            <MovementTrendComposedChart
              data={trendRows}
              categoryKey="name"
              height={ANALYTICS_PAIR_CHART_HEIGHT}
            />
          </div>
        </Panel>
      </div>

      <div className="exec-analytics-trio">
        <Panel title={gradePanelTitle} expandPayload={gradeExpand}>
          <MovementStackedBarChart
            data={mov.byGrade}
            layout="vertical"
            height={ANALYTICS_TRIO_CHART_HEIGHT}
            fitCategoryLabels
            categoryAxisMaxWidth={ANALYTICS_TRIO_AXIS_MAX_WIDTH}
            categoryAxisMinWidth={100}
            maxRows={12}
          />
        </Panel>
        <Panel title={branchPanelTitle} expandPayload={branchExpand}>
          <MovementStackedBarChart
            data={mov.byBranch}
            layout="vertical"
            height={ANALYTICS_TRIO_CHART_HEIGHT}
            fitCategoryLabels
            categoryAxisMaxWidth={ANALYTICS_TRIO_AXIS_MAX_WIDTH}
            categoryAxisMinWidth={100}
            maxRows={12}
          />
        </Panel>
        <Panel title={sectionPanelTitle} expandPayload={sectionExpand}>
          <MovementStackedBarChart
            data={mov.bySection}
            layout="vertical"
            height={ANALYTICS_TRIO_CHART_HEIGHT}
            fitCategoryLabels
            categoryAxisMaxWidth={ANALYTICS_TRIO_AXIS_MAX_WIDTH}
            categoryAxisMinWidth={100}
            maxRows={12}
          />
        </Panel>
      </div>
    </section>
  );
}
