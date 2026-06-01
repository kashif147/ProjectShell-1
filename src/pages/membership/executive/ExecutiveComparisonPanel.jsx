import React, { useEffect, useRef, useState } from "react";
import { Alert, Spin, Empty } from "antd";
import { useFilters } from "../../../context/FilterContext";
import reportService from "../../../features/shared/services/reportService";
import ExecutiveComparisonPill from "./ExecutiveComparisonPill";
import {
  buildComparisonKpiPills,
  buildMembershipComparisonBody,
  formatComparisonPeriodLabel,
} from "./executiveDashboardUtils";
import ComparisonSectionCharts from "./comparison/ComparisonSectionCharts";

const COMPARISON_DIMENSIONS = [
  "membershipCategory",
  "grade",
  "section",
  "region",
  "branch",
];

function ComparisonBlock({ title, comparison, keyPrefix, loading }) {
  if (!comparison) {
    return (
      <div className="exec-compare-block exec-compare-block--placeholder">
        <h4 className="exec-compare-block__title">{title}</h4>
        <div className="exec-compare-block__placeholder-body">
          {loading ? (
            <Spin />
          ) : (
            <Empty
              description="Comparison data unavailable"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    );
  }

  const periodALabel = formatComparisonPeriodLabel(comparison.periodA);
  const periodBLabel = formatComparisonPeriodLabel(comparison.periodB);
  const pills = buildComparisonKpiPills(comparison);

  return (
    <div className="exec-compare-block">
      <h4 className="exec-compare-block__title">{title}</h4>
      <p className="exec-compare-block__periods">
        <span>{periodALabel}</span>
        <span className="exec-compare-block__vs">vs</span>
        <span>{periodBLabel}</span>
      </p>
      <div className="exec-compare-pill-row">
        {pills.map((p) => (
          <ExecutiveComparisonPill
            key={`${keyPrefix}-${p.key}`}
            compact
            title={p.title}
            periodALabel={periodALabel}
            periodBLabel={periodBLabel}
            valueA={p.valueA}
            valueB={p.valueB}
          />
        ))}
      </div>
      <ComparisonSectionCharts comparison={comparison} />
    </div>
  );
}

export default function ExecutiveComparisonPanel({ refreshToken = 0 }) {
  const { membershipDashboardHeader, filtersState } = useFilters();
  const filtersStateRef = useRef(filtersState);
  filtersStateRef.current = filtersState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sameMonth, setSameMonth] = useState(null);
  const [yearEnd, setYearEnd] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await reportService.getComparisonReport({
          ...buildMembershipComparisonBody(
            filtersStateRef.current,
            membershipDashboardHeader,
          ),
          dimensions: COMPARISON_DIMENSIONS,
        });
        if (cancelled) return;
        setSameMonth(data?.sameMonthLastYear ?? null);
        setYearEnd(data?.yearEndVsCurrent ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load comparison");
          setSameMonth(null);
          setYearEnd(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    membershipDashboardHeader.year,
    membershipDashboardHeader.month,
    membershipDashboardHeader.includeStudents,
    membershipDashboardHeader.includeHonorary,
    refreshToken,
  ]);

  return (
    <section className="exec-comparison">
      {error ? (
        <Alert type="error" message={error} showIcon className="exec-alert" />
      ) : null}

      <div className="exec-compare-split">
        <ComparisonBlock
          title="Same month last year vs this year"
          comparison={sameMonth}
          keyPrefix="sm"
          loading={loading && !sameMonth}
        />
        <ComparisonBlock
          title="Year end vs current month"
          comparison={yearEnd}
          keyPrefix="ye"
          loading={loading && !yearEnd}
        />
      </div>
    </section>
  );
}
