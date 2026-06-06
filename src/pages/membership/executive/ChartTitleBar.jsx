import React from "react";
import ChartExpandButton from "./ChartExpandButton";

export default function ChartTitleBar({ title, expandPayload, className = "" }) {
  return (
    <div className={`exec-chart-title-bar${className ? ` ${className}` : ""}`}>
      <span className="exec-chart-title-bar__text">{title}</span>
      {expandPayload ? (
        <ChartExpandButton title={title} payload={expandPayload} />
      ) : null}
    </div>
  );
}
