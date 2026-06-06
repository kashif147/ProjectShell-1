import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

/**
 * Small help icon with tooltip for finance labels and column headers.
 */
export default function FinanceInfoIcon({
  title,
  ariaLabel = "More information",
  style,
}) {
  if (!title) return null;
  return (
    <Tooltip title={title}>
      <InfoCircleOutlined
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
        style={{
          color: "#8c8c8c",
          fontSize: 12,
          flexShrink: 0,
          cursor: "help",
          ...style,
        }}
      />
    </Tooltip>
  );
}

export function FinanceLabelWithInfo({ label, help, labelStyle, style }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        minWidth: 0,
        maxWidth: "100%",
        ...style,
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          ...labelStyle,
        }}
      >
        {label}
      </span>
      <FinanceInfoIcon title={help} ariaLabel={`About ${label}`} />
    </span>
  );
}

export function FinanceColumnTitle({ label, help }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}
      <FinanceInfoIcon title={help} ariaLabel={`About column ${label}`} />
    </span>
  );
}
