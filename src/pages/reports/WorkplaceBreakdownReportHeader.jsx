import React from "react";

export default function WorkplaceBreakdownReportHeader({ meta }) {
  if (!meta) return null;

  const filterLines = meta.filterLines?.length
    ? meta.filterLines
    : meta.filtersSummary
      ? [meta.filtersSummary]
      : ["All workplaces"];

  return (
    <header className="wp-breakdown-report__header">
      <div className="wp-breakdown-report__title-block">
        <h1 className="wp-breakdown-report__org">{meta.organisationName}</h1>
        <h2 className="wp-breakdown-report__title">{meta.reportTitle}</h2>
      </div>

      <div className="wp-breakdown-report__header-details">
        <div className="wp-breakdown-report__meta-block">
          <div>
            <span className="wp-breakdown-report__meta-label">Generated:</span>{" "}
            {meta.generatedAt}
          </div>
          <div>
            <span className="wp-breakdown-report__meta-label">Operator:</span>{" "}
            {meta.operator}
          </div>
        </div>

        <div className="wp-breakdown-report__params">
          <span>
            <strong>Period:</strong> {meta.dateFrom} – {meta.dateTo}
          </span>
          <span>
            <strong>Rolling months:</strong> {meta.rollingMonths}
          </span>
        </div>
      </div>

      <div className="wp-breakdown-report__filter-summary">
        <span className="wp-breakdown-report__meta-label">Report filters</span>
        <ul className="wp-breakdown-report__filter-list">
          {filterLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </header>
  );
}
