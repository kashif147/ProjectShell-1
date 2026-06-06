import React, { useCallback } from "react";
import { message } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import { openChartInNewTab } from "./chartExpandStorage";

export default function ChartExpandButton({ title, payload, className = "" }) {
  const onExpand = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const opened = openChartInNewTab(title, payload);
      if (!opened) {
        message.error("Could not open chart tab. Allow pop-ups or try again.");
      }
    },
    [title, payload]
  );

  if (!payload?.type) return null;

  return (
    <button
      type="button"
      className={`exec-chart-expand-btn${className ? ` ${className}` : ""}`}
      onClick={onExpand}
      aria-label={`Open ${title} in new tab`}
      title="Open in new tab"
    >
      <ExpandOutlined />
    </button>
  );
}
