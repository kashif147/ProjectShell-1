import React from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import KPICard from "./KPICard";

const ReminderListItem = ({ item, onView, onEdit }) => {
  const kpis = [
    { value: item.stats?.R1 || 0, change: 11, label: "R1", isPositive: true },
    { value: item.stats?.R2 || 0, change: 8, label: "R2", isPositive: false },
    { value: item.stats?.R3 || 0, change: 11, label: "R3", isPositive: true },
  ];

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div style={{ flex: 1 }}>
        <h3
          onClick={() => onView?.(item)}
          style={{
            fontSize: "16px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#215e97",
            cursor: "pointer",
            display: "inline-block",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
            e.target.style.color = "#1a4d7a";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
            e.target.style.color = "#215e97";
          }}
        >
          {item.title}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#8c8c8c",
            marginBottom: "10px",
          }}
        >
          This is a description. {item.date}
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1a4d7a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#215e97";
            }}
            style={{ 
              padding: 0,
              color: "#215e97",
              fontSize: "13px",
            }}
          >
            Edit
          </Button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginLeft: "20px",
          alignItems: "stretch",
        }}
      >
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            value={kpi.value}
            change={kpi.change}
            label={kpi.label}
            isPositive={kpi.isPositive}
          />
        ))}
      </div>
    </div>
  );
};

export default ReminderListItem;

