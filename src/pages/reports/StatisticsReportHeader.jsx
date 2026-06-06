import React from "react";

export default function StatisticsReportHeader({ meta }) {
  if (!meta) return null;

  const filterLines = meta.filterLines?.length
    ? meta.filterLines
    : meta.filtersSummary
      ? [meta.filtersSummary]
      : ["All members"];

  return (
    <header className="stats-report__header">
      <div className="stats-report__title-block">
        <h1 className="stats-report__org">{meta.organisationName}</h1>
        <h2 className="stats-report__title">{meta.reportTitle}</h2>
      </div>

      <div className="stats-report__header-details">
        <div className="stats-report__meta-block">
          <div>
            <span className="stats-report__meta-label">Generated:</span>{" "}
            {meta.generatedAt}
          </div>
          <div>
            <span className="stats-report__meta-label">Operator:</span>{" "}
            {meta.operator}
          </div>
        </div>

        <div className="stats-report__params">
          <span>
            <strong>Period:</strong> {meta.dateFrom} – {meta.dateTo}
          </span>
          <span>
            <strong>Breakdown:</strong> {meta.breakdown}
          </span>
        </div>
      </div>

      <div className="stats-report__filter-summary">
        <span className="stats-report__meta-label">Report filters</span>
        <ul className="stats-report__filter-list">
          {filterLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </header>
  );
}
