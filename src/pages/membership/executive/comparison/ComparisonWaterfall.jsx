import React, { useMemo } from "react";
import { buildComparisonWaterfallSteps } from "./comparisonVarianceUtils";
import ExecWaterfallChart from "../ExecWaterfallChart";
import ChartTitleBar from "../ChartTitleBar";

export default function ComparisonWaterfall({
  comparison,
  title,
  expanded = false,
  expandPayload = null,
  steps: stepsProp,
  yDomain: yDomainProp,
}) {
  const computed = useMemo(
    () => buildComparisonWaterfallSteps(comparison),
    [comparison]
  );
  const steps = stepsProp ?? computed.steps;
  const yDomain = yDomainProp ?? computed.yDomain;

  const panelClass = expanded
    ? "exec-variance-panel exec-variance-panel--expanded"
    : "exec-variance-panel exec-variance-panel--compact";
  const chartClass = expanded
    ? "exec-variance-chart exec-variance-chart--waterfall exec-variance-chart--expanded"
    : "exec-variance-chart exec-variance-chart--waterfall exec-variance-chart--compact";

  return (
    <div className={panelClass}>
      {!expanded ? (
        <ChartTitleBar
          title={title}
          expandPayload={expandPayload}
          className="exec-variance-panel__title"
        />
      ) : null}
      <ExecWaterfallChart
        steps={steps}
        yDomain={yDomain}
        compact={!expanded}
        className={chartClass}
      />
    </div>
  );
}
