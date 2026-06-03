import React, { useMemo } from "react";
import ExecutiveKpiCard from "./ExecutiveKpiCard";
import { EXEC_KPI_ICONS } from "./executiveDashboardIcons";
import {
  priorPeriodValue,
  buildKpiPeriodLabels,
  KPI_METRIC_KIND,
} from "./executiveDashboardUtils";

function buildTiles(data, periodLabels) {
  const d = data || {};
  const net = (j, l) => (Number(d[j]) || 0) - (Number(d[l]) || 0);
  const activeYtdPrior = priorPeriodValue(
    d.totalActiveLY,
    d.hasPriorYearSnapshot,
  );
  const activeMonthPrior = priorPeriodValue(
    d.totalActiveLastMonth,
    d.hasPriorMonthSnapshot,
  );
  const { selectedMonthLabel } = periodLabels;

  const headcountCaption = `At end of ${selectedMonthLabel}`;
  const movementCaption = `During ${selectedMonthLabel}`;

  const defs = [
    {
      id: "active",
      title: "Active Members",
      iconKey: "active",
      metricKind: KPI_METRIC_KIND.HEADCOUNT,
      valueCaption: headcountCaption,
      value: d.totalActive,
      ytdCurrent: d.totalActiveYTD,
      ytdPrior: activeYtdPrior,
      monthCurrent: d.totalActiveThisMonth,
      monthPrior: activeMonthPrior,
      sparkPrior: activeMonthPrior,
    },
    {
      id: "joiners",
      title: "New Joiners",
      iconKey: "joiners",
      metricKind: KPI_METRIC_KIND.MOVEMENT,
      valueCaption: movementCaption,
      value: d.newJoiners,
      ytdCurrent: d.newJoinersYTD,
      ytdPrior: d.newJoinersLY,
      monthCurrent: d.newJoinersThisMonth,
      monthPrior: d.newJoinersLastMonth,
    },
    {
      id: "leavers",
      title: "Leavers",
      iconKey: "leavers",
      metricKind: KPI_METRIC_KIND.MOVEMENT,
      valueCaption: movementCaption,
      invertDelta: true,
      value: d.leavers,
      ytdCurrent: d.leaversYTD,
      ytdPrior: d.leaversLY,
      monthCurrent: d.leaversThisMonth,
      monthPrior: d.leaversLastMonth,
    },
    {
      id: "net",
      title: "Net Growth",
      iconKey: "net",
      metricKind: KPI_METRIC_KIND.MOVEMENT,
      valueCaption: movementCaption,
      value: net("newJoiners", "leavers"),
      ytdCurrent: net("newJoinersYTD", "leaversYTD"),
      ytdPrior: net("newJoinersLY", "leaversLY"),
      monthCurrent: net("newJoinersThisMonth", "leaversThisMonth"),
      monthPrior: net("newJoinersLastMonth", "leaversLastMonth"),
    },
    {
      id: "paid",
      title: "Paid Members",
      iconKey: "paid",
      metricKind: KPI_METRIC_KIND.HEADCOUNT,
      valueCaption: headcountCaption,
      value: d.paidMembers,
      ytdCurrent: d.paidMembersYTD,
      ytdPrior: d.paidMembersLY,
      monthCurrent: d.paidMembersThisMonth,
      monthPrior: d.paidMembersLastMonth,
    },
    {
      id: "student",
      title: "Student Members",
      iconKey: "student",
      metricKind: KPI_METRIC_KIND.HEADCOUNT,
      valueCaption: headcountCaption,
      value: d.studentMembers,
      ytdCurrent: d.studentMembersYTD,
      ytdPrior: d.studentMembersLY,
      monthCurrent: d.studentMembersThisMonth,
      monthPrior: d.studentMembersLastMonth,
    },
    {
      id: "honorary",
      title: "Honorary Members",
      iconKey: "honorary",
      metricKind: KPI_METRIC_KIND.HEADCOUNT,
      valueCaption: headcountCaption,
      value: d.honoraryMembers,
      ytdCurrent: d.honoraryMembersYTD,
      ytdPrior: d.honoraryMembersLY,
      monthCurrent: d.honoraryMembersThisMonth,
      monthPrior: d.honoraryMembersLastMonth,
    },
  ];

  return defs.map(({ iconKey, ...rest }) => {
    const spec = EXEC_KPI_ICONS[iconKey];
    return {
      ...rest,
      icon: spec.icon,
      accent: spec.accent,
      iconBg: spec.iconBg,
    };
  });
}

export default function ExecutiveKpiStrip({ data, onKpiClick }) {
  const periodLabels = useMemo(() => buildKpiPeriodLabels(data), [data]);
  const tiles = useMemo(
    () => buildTiles(data, periodLabels),
    [data, periodLabels],
  );

  return (
    <section className="exec-kpi-section" aria-label="Membership KPIs">
      <div className="exec-kpi-strip">
        {tiles.map((tile) => (
          <ExecutiveKpiCard
            key={tile.id}
            {...tile}
            periodLabels={periodLabels}
            hasPriorMonthSnapshot={data?.hasPriorMonthSnapshot}
            hasPriorYearSnapshot={data?.hasPriorYearSnapshot}
            onClick={onKpiClick ? () => onKpiClick(tile.title) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
