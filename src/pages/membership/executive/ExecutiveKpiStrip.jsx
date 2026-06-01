import React from "react";
import ExecutiveKpiCard from "./ExecutiveKpiCard";
import { EXEC_KPI_ICONS } from "./executiveDashboardIcons";
import { priorPeriodValue } from "./executiveDashboardUtils";

function buildTiles(data) {
  const d = data || {};
  const net = (j, l) => (Number(d[j]) || 0) - (Number(d[l]) || 0);
  const activeYtdPrior = priorPeriodValue(
    d.totalActiveLY,
    d.hasPriorYearSnapshot
  );
  const activeMonthPrior = priorPeriodValue(
    d.totalActiveLastMonth,
    d.hasPriorMonthSnapshot
  );

  const defs = [
    {
      id: "active",
      title: "Active Members",
      iconKey: "active",
      value: d.totalActive,
      ytdCurrent: d.totalActiveYTD,
      ytdPrior: activeYtdPrior,
      monthCurrent: d.totalActiveThisMonth,
      monthPrior: activeMonthPrior,
      sparkPrior: activeMonthPrior,
    },
    { id: "joiners", title: "New Joiners", iconKey: "joiners", value: d.newJoiners, ytdCurrent: d.newJoinersYTD, ytdPrior: d.newJoinersLY, monthCurrent: d.newJoinersThisMonth, monthPrior: d.newJoinersLastMonth },
    { id: "leavers", title: "Leavers", iconKey: "leavers", invertDelta: true, value: d.leavers, ytdCurrent: d.leaversYTD, ytdPrior: d.leaversLY, monthCurrent: d.leaversThisMonth, monthPrior: d.leaversLastMonth },
    { id: "net", title: "Net Growth", iconKey: "net", value: net("newJoiners", "leavers"), ytdCurrent: net("newJoinersYTD", "leaversYTD"), ytdPrior: net("newJoinersLY", "leaversLY"), monthCurrent: net("newJoinersThisMonth", "leaversThisMonth"), monthPrior: net("newJoinersLastMonth", "leaversLastMonth") },
    { id: "paid", title: "Paid Members", iconKey: "paid", value: d.paidMembers, ytdCurrent: d.paidMembersYTD, ytdPrior: d.paidMembersLY, monthCurrent: d.paidMembersThisMonth, monthPrior: d.paidMembersLastMonth },
    { id: "student", title: "Student Members", iconKey: "student", value: d.studentMembers, ytdCurrent: d.studentMembersYTD, ytdPrior: d.studentMembersLY, monthCurrent: d.studentMembersThisMonth, monthPrior: d.studentMembersLastMonth },
    { id: "honorary", title: "Honorary Members", iconKey: "honorary", value: d.honoraryMembers, ytdCurrent: d.honoraryMembersYTD, ytdPrior: d.honoraryMembersLY, monthCurrent: d.honoraryMembersThisMonth, monthPrior: d.honoraryMembersLastMonth },
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
  const tiles = buildTiles(data);

  return (
    <div className="exec-kpi-strip">
      {tiles.map((tile) => (
        <ExecutiveKpiCard
          key={tile.id}
          {...tile}
          onClick={onKpiClick ? () => onKpiClick(tile.title) : undefined}
        />
      ))}
    </div>
  );
}
