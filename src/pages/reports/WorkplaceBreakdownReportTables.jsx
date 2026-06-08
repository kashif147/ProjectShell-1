import React from "react";
import {
  deltaToneClass,
  formatDelta,
  formatDeltaPercent,
  formatReportNum,
} from "./workplaceBreakdownReportUtils";

function DeltaCells({ delta }) {
  const tone = deltaToneClass(delta);
  return (
    <>
      <td className={`wp-breakdown-report__num ${tone}`.trim()}>
        {formatDelta(delta?.absolute)}
      </td>
      <td className={`wp-breakdown-report__num ${tone}`.trim()}>
        {formatDeltaPercent(delta?.percent)}
      </td>
    </>
  );
}

function RegionSection({
  section,
  periodColumns,
  momColumnLabel,
  yoyColumnLabel,
}) {
  const rows = section.rows || [];
  if (!rows.length) return null;

  return (
    <section className="wp-breakdown-report__region">
      <h3 className="wp-breakdown-report__region-title">{section.label}</h3>
      <div className="wp-breakdown-report__table-wrap">
        <table className="wp-breakdown-report__table">
          <thead>
            <tr>
              <th className="wp-breakdown-report__sticky-col">Work Location</th>
              {(periodColumns || []).map((col) => (
                <th key={`${col.year}-${col.month}`} className="wp-breakdown-report__num">
                  {col.label}
                </th>
              ))}
              <th className="wp-breakdown-report__num" colSpan={2}>
                {momColumnLabel} Δ
              </th>
              <th className="wp-breakdown-report__num" colSpan={2}>
                {yoyColumnLabel} Δ
              </th>
              <th className="wp-breakdown-report__official-col">Official</th>
            </tr>
            <tr>
              <th className="wp-breakdown-report__sticky-col" />
              {(periodColumns || []).map((col) => (
                <th key={`sub-${col.year}-${col.month}`} className="wp-breakdown-report__num" />
              ))}
              <th className="wp-breakdown-report__num">Abs</th>
              <th className="wp-breakdown-report__num">%</th>
              <th className="wp-breakdown-report__num">Abs</th>
              <th className="wp-breakdown-report__num">%</th>
              <th className="wp-breakdown-report__official-col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.region}-${row.branch}-${row.workLocation}`}>
                <td className="wp-breakdown-report__sticky-col">
                  {row.workLocation}
                </td>
                {(periodColumns || []).map((col) => {
                  const count =
                    row.monthlyCounts?.find(
                      (c) => c.year === col.year && c.month === col.month,
                    )?.count ?? 0;
                  return (
                    <td
                      key={`${row.workLocation}-${col.year}-${col.month}`}
                      className="wp-breakdown-report__num"
                    >
                      {formatReportNum(count)}
                    </td>
                  );
                })}
                <DeltaCells delta={row.mom} />
                <DeltaCells delta={row.yoy} />
                <td
                  className="wp-breakdown-report__official-col"
                  title={row.official?.displayName || undefined}
                >
                  {row.official?.initials || "—"}
                </td>
              </tr>
            ))}
          </tbody>
          {section.totals && (
            <tfoot>
              <tr className="wp-breakdown-report__total-row">
                <td className="wp-breakdown-report__sticky-col">
                  <strong>Region total</strong>
                </td>
                {(periodColumns || []).map((col) => {
                  const count =
                    section.totals.monthlyCounts?.find(
                      (c) => c.year === col.year && c.month === col.month,
                    )?.count ?? 0;
                  return (
                    <td
                      key={`total-${col.year}-${col.month}`}
                      className="wp-breakdown-report__num"
                    >
                      <strong>{formatReportNum(count)}</strong>
                    </td>
                  );
                })}
                <DeltaCells delta={section.totals.mom} />
                <DeltaCells delta={section.totals.yoy} />
                <td className="wp-breakdown-report__official-col" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

export default function WorkplaceBreakdownReportTables({
  regions = [],
  periodColumns = [],
  momColumnLabel = "MoM",
  yoyColumnLabel = "YoY",
}) {
  if (!regions.length) {
    return (
      <p className="wp-breakdown-report__empty">
        No workplace data for the selected period and filters.
      </p>
    );
  }

  return (
    <div className="wp-breakdown-report__tables">
      {regions.map((section) => (
        <RegionSection
          key={section.region}
          section={section}
          periodColumns={periodColumns}
          momColumnLabel={momColumnLabel}
          yoyColumnLabel={yoyColumnLabel}
        />
      ))}
    </div>
  );
}
