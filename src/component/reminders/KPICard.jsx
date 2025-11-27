import React from "react";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const KPICard = ({ value, change, label, isPositive }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 8px",
        backgroundColor: "#fff",
        borderRadius: "6px",
        border: "1px solid #e8e8e8",
        minWidth: "90px",
        height: "100%",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          marginBottom: "8px",
          fontSize: "12px",
          fontWeight: 600,
          color: isPositive ? "#52c41a" : "#ff4d4f",
          lineHeight: "1.2",
        }}
      >
        {isPositive ? (
          <ArrowUpOutlined style={{ fontSize: "12px" }} />
        ) : (
          <ArrowDownOutlined style={{ fontSize: "12px" }} />
        )}
        <span>{change}%</span>
      </div>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "#215e97",
          marginBottom: "6px",
          lineHeight: "1.2",
        }}
      >
        {value.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#595959",
          textAlign: "center",
          fontWeight: 500,
          lineHeight: "1.3",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default KPICard;

