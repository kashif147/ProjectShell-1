import React from "react";
import {
  formatDeltaPair,
  formatReportNum,
} from "./workplaceBreakdownReportUtils";

function KpiCard({ label, value }) {
  const tone =
    typeof value === "string" && value.startsWith("+")
      ? "wp-breakdown-report__delta--up"
      : typeof value === "string" && value.startsWith("-") && value !== "—"
        ? "wp-breakdown-report__delta--down"
        : "";
  return (
    <div className="wp-breakdown-report__kpi-card">
      <span className="wp-breakdown-report__kpi-label">{label}</span>
      <span className={`wp-breakdown-report__kpi-value ${tone}`.trim()}>
        {value}
      </span>
    </div>
  );
}

export default function WorkplaceBreakdownSummary({ summary, period }) {
  if (!summary) return null;

  const momLabel = period?.momColumn?.label
    ? `MoM (${period.momColumn.label})`
    : "MoM";
  const yoyLabel = period?.yoyColumn?.label
    ? `YoY (${period.yoyColumn.label})`
    : "YoY";

  return (
    <section className="wp-breakdown-report__summary no-print">
      <div className="wp-breakdown-report__kpi-row">
        <KpiCard
          label="Workplaces"
          value={formatReportNum(summary.totalWorkplaces)}
        />
        <KpiCard
          label="Total members (current month)"
          value={formatReportNum(summary.totalMembersCurrent)}
        />
        <KpiCard label={momLabel} value={formatDeltaPair(summary.mom)} />
        <KpiCard label={yoyLabel} value={formatDeltaPair(summary.yoy)} />
      </div>
    </section>
  );
}
