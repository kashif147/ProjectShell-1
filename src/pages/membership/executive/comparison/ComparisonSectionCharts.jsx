import React from "react";
import { COMPARISON_DIMENSIONS } from "./comparisonVarianceUtils";
import { formatComparisonPeriodLabel } from "../executiveDashboardUtils";
import ComparisonVarianceTable from "./ComparisonVarianceTable";
import ComparisonVarianceBars from "./ComparisonVarianceBars";
import ComparisonVarianceHeatmap from "./ComparisonVarianceHeatmap";
import ComparisonWaterfall from "./ComparisonWaterfall";

function dim(key) {
  return COMPARISON_DIMENSIONS.find((d) => d.key === key);
}

export default function ComparisonSectionCharts({ comparison }) {
  if (!comparison) return null;

  const periodALabel = formatComparisonPeriodLabel(comparison.periodA);
  const periodBLabel = formatComparisonPeriodLabel(comparison.periodB);
  const breakdown = comparison.breakdown || {};
  const rows = (key) => breakdown[key] || [];

  const category = dim("membershipCategory");
  const grade = dim("grade");
  const region = dim("region");
  const branch = dim("branch");
  const section = dim("section");

  const categoryTitle = `Active members variance by ${category.label.toLowerCase()}`;
  const branchTitle = `Active members variance by ${branch.label.toLowerCase()}`;
  const waterfallTitle = `Variance waterfall (${periodALabel} vs ${periodBLabel})`;
  const regionTitle = `Active members variance by ${region.label.toLowerCase()}`;
  const gradeTitle = `Active members variance by ${grade.label.toLowerCase()}`;
  const sectionTitle = `Active members variance by ${section.label.toLowerCase()}`;

  return (
    <div className="exec-compare-charts">
      <div className="exec-compare-charts__grid">
        <ComparisonVarianceTable
          title={categoryTitle}
          rows={rows("membershipCategory")}
          periodALabel={periodALabel}
          periodBLabel={periodBLabel}
          dimensionLabel={category.label}
          wideNameColumn
          expandPayload={{
            type: "variance-table",
            chartTitle: categoryTitle,
            rows: rows("membershipCategory"),
            periodALabel,
            periodBLabel,
            dimensionLabel: category.label,
            wideNameColumn: true,
            showTotal: true,
          }}
        />
        <ComparisonVarianceBars
          title={branchTitle}
          rows={rows("branch")}
          periodALabel={periodALabel}
          periodBLabel={periodBLabel}
          expandPayload={{
            type: "variance-bars",
            chartTitle: branchTitle,
            rows: rows("branch"),
            periodALabel,
            periodBLabel,
          }}
        />
        <ComparisonWaterfall
          comparison={comparison}
          title={waterfallTitle}
          expandPayload={{
            type: "variance-waterfall",
            chartTitle: waterfallTitle,
            comparison,
          }}
        />
        <ComparisonVarianceHeatmap
          title={regionTitle}
          rows={rows("region")}
          periodALabel={periodALabel}
          periodBLabel={periodBLabel}
          dimensionLabel={region.label}
          expandPayload={{
            type: "variance-heatmap",
            chartTitle: regionTitle,
            rows: rows("region"),
            periodALabel,
            periodBLabel,
            dimensionLabel: region.label,
          }}
        />
      </div>

      <div className="exec-compare-charts__extra">
        <ComparisonVarianceTable
          title={gradeTitle}
          rows={rows("grade")}
          periodALabel={periodALabel}
          periodBLabel={periodBLabel}
          dimensionLabel={grade.label}
          expandPayload={{
            type: "variance-table",
            chartTitle: gradeTitle,
            rows: rows("grade"),
            periodALabel,
            periodBLabel,
            dimensionLabel: grade.label,
            wideNameColumn: false,
            showTotal: true,
          }}
        />
        <ComparisonVarianceTable
          title={sectionTitle}
          rows={rows("section")}
          periodALabel={periodALabel}
          periodBLabel={periodBLabel}
          dimensionLabel={section.label}
          expandPayload={{
            type: "variance-table",
            chartTitle: sectionTitle,
            rows: rows("section"),
            periodALabel,
            periodBLabel,
            dimensionLabel: section.label,
            wideNameColumn: false,
            showTotal: true,
          }}
        />
      </div>
    </div>
  );
}
