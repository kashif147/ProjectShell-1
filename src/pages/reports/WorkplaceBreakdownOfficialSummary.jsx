import React from "react";
import {
  deltaToneClass,
  formatDelta,
  formatDeltaPercent,
  formatReportNum,
} from "./workplaceBreakdownReportUtils";

export default function WorkplaceBreakdownOfficialSummary({
  officialSummary = [],
  momColumnLabel = "MoM",
  yoyColumnLabel = "YoY",
}) {
  if (!officialSummary.length) return null;

  return (
    <section className="wp-breakdown-report__official-summary">
      <h3 className="wp-breakdown-report__section-title">
        Summary by official (IRO)
      </h3>
      <div className="wp-breakdown-report__table-wrap">
        <table className="wp-breakdown-report__table">
          <thead>
            <tr>
              <th className="wp-breakdown-report__sticky-col">Official</th>
              <th className="wp-breakdown-report__num">Workplaces</th>
              <th className="wp-breakdown-report__num">Members</th>
              <th className="wp-breakdown-report__num" colSpan={2}>
                {momColumnLabel}
              </th>
              <th className="wp-breakdown-report__num" colSpan={2}>
                {yoyColumnLabel}
              </th>
            </tr>
            <tr>
              <th className="wp-breakdown-report__sticky-col" />
              <th className="wp-breakdown-report__num" />
              <th className="wp-breakdown-report__num" />
              <th className="wp-breakdown-report__num">Abs</th>
              <th className="wp-breakdown-report__num">%</th>
              <th className="wp-breakdown-report__num">Abs</th>
              <th className="wp-breakdown-report__num">%</th>
            </tr>
          </thead>
          <tbody>
            {officialSummary.map((entry) => {
              const key =
                entry.official?.userId ||
                entry.official?.initials ||
                entry.official?.displayName;
              const momTone = deltaToneClass(entry.mom);
              const yoyTone = deltaToneClass(entry.yoy);
              const label =
                entry.official?.displayName ||
                entry.official?.initials ||
                "—";
              return (
                <tr key={key}>
                  <td
                    className="wp-breakdown-report__sticky-col"
                    title={entry.official?.displayName || undefined}
                  >
                    {label}
                    {entry.official?.initials &&
                      entry.official?.displayName &&
                      entry.official.initials !== entry.official.displayName && (
                        <span className="wp-breakdown-report__official-initials">
                          {" "}
                          ({entry.official.initials})
                        </span>
                      )}
                  </td>
                  <td className="wp-breakdown-report__num">
                    {formatReportNum(entry.workplaceCount)}
                  </td>
                  <td className="wp-breakdown-report__num">
                    {formatReportNum(entry.totalMembersCurrent)}
                  </td>
                  <td className={`wp-breakdown-report__num ${momTone}`.trim()}>
                    {formatDelta(entry.mom?.absolute)}
                  </td>
                  <td className={`wp-breakdown-report__num ${momTone}`.trim()}>
                    {formatDeltaPercent(entry.mom?.percent)}
                  </td>
                  <td className={`wp-breakdown-report__num ${yoyTone}`.trim()}>
                    {formatDelta(entry.yoy?.absolute)}
                  </td>
                  <td className={`wp-breakdown-report__num ${yoyTone}`.trim()}>
                    {formatDeltaPercent(entry.yoy?.percent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
