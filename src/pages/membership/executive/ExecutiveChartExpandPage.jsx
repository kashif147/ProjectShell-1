import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Spin } from "antd";
import { loadChartExpandPayload } from "./chartExpandStorage";
import ExecutiveChartExpandRenderer from "./ExecutiveChartExpandRenderer";
import "../../../styles/ExecutiveDashboard.css";

export default function ExecutiveChartExpandPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [record, setRecord] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecord(loadChartExpandPayload(key));
    setReady(true);
  }, [key]);

  if (!ready) {
    return (
      <div className="exec-chart-expand-page exec-chart-expand-page--centered">
        <Spin size="large" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="exec-chart-expand-page exec-chart-expand-page--centered">
        <Alert
          type="warning"
          showIcon
          message="Chart unavailable"
          description="Open the chart again from the dashboard. Data may have expired or the link is invalid."
        />
      </div>
    );
  }

  return (
    <div className="exec-chart-expand-page">
      <header className="exec-chart-expand-page__header">
        <h1 className="exec-chart-expand-page__title">{record.title}</h1>
      </header>
      <main className="exec-chart-expand-page__body">
        <ExecutiveChartExpandRenderer payload={record.payload} />
      </main>
    </div>
  );
}
