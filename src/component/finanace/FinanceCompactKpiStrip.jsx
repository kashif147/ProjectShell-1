import React from "react";

const stripStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "12px 16px",
  border: "1px solid #e2e8f0",
  minHeight: "60px",
  overflowX: "auto",
  gap: 0,
  boxSizing: "border-box",
};

export function FinanceCompactKpiDivider() {
  return (
    <div
      style={{
        width: "1px",
        height: "32px",
        backgroundColor: "#e2e8f0",
        margin: "0 16px",
        flexShrink: 0,
      }}
    />
  );
}

export function FinanceCompactKpiTile({
  title,
  value,
  icon,
  iconColor = "#0f172a",
  iconBg = "#f1f5f9",
  valueColor = "#0f172a",
  minWidth = 140,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "6px",
          backgroundColor: iconBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: iconColor,
          fontSize: "14px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: "500",
            lineHeight: "1.2",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: valueColor,
            lineHeight: "1.2",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function FinanceCompactKpiStrip({ children, style }) {
  return (
    <div style={{ ...stripStyle, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {children}
      </div>
    </div>
  );
}
