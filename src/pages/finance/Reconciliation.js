import React from "react";
import { Card, Row, Col } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, CheckCircle, Shuffle, XCircle,Clock } from "lucide-react";

// Summary cards

const summaryCards = [
  {
    title: "Total Batches",
    value: 50,
    icon: <Activity size={24} color="#2563eb" />,
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    title: "Approved",
    value: 36,
    icon: <CheckCircle size={24} color="#22c55e" />,
    color: "#22c55e",
    bg: "#dcfce7",
  },
  {
    title: "Pending",
    value: 14,
    icon: <Clock size={24} color="#eab308" />,
    color: "#eab308",
    bg: "#fef9c3",
  },
  {
    title: "Rejected",
    value: "00",
    icon: <XCircle size={24} color="#ef4444" />,
    color: "#ef4444",
    bg: "#fee2e2",
  },
  {
    title: "Closing Balance",
    value: "€123,456.00",
    icon: <Shuffle size={24} color="#0891b2" />,
    color: "#0891b2",
    bg: "#cffafe",
  },
];

// Pie chart data
const chartData = [
  { name: "Approved", value: 36, color: "#45669d" },
  { name: "Pending", value: 14, color: "#60a5fa" },
  { name: "Rejected", value: 0, color: "#ef4444" },
];

// Bar chart data
const batchTypeData = [
  { name: "Cheque", count: 88 },
  { name: "Deducation", count: 20 },
  { name: "Direct Debit", count: 77 },
  { name: "Standing Orders", count: 40 },
  { name: "Refunds", count: 56 },
  { name: "Online", count: 105 },
];

const Reconciliation = () => {
  return (
    <div style={{ padding: "20px" }}>
      <div
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        whiteSpace: "nowrap",
        paddingBottom: 8,
        scrollbarWidth: "none", // hide scrollbar (Firefox)
      }}
    >
     <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${summaryCards.length}, 1fr)`,
        gap: 12,
        width: "100%",
      }}
    >
      {summaryCards.map((card) => (
        <Card
          key={card.title}
          style={{
            borderRadius: 3,
            backgroundColor: card.bg,
            border: "1px solid #e5e7eb",
            boxShadow: "none",
            width: "100%",
            transition: "all 0.3s ease",
          }}
          bodyStyle={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 18px",
          }}
        >
          <div>
            <div style={{ color: "#475569", fontSize: 13, fontWeight: 500 }}>
              {card.title}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: card.color,
                marginTop: 4,
              }}
            >
              {card.value}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "50%",
              padding: 8,
              border: `1px solid ${card.color}30`,
            }}
          >
            {card.icon}
          </div>
        </Card>
      ))}
    </div>
    </div>

      <Row gutter={[16, 16]}>
        {/* Left: Bar Chart */}
        <Col span={12}>
          <Card className="mt-4 pt-0">
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                paddingTop: "20px",
                paddingBottom: "20px",
                backgroundColor: "#123c63",
                fontSize: "16px",
                color: "white",
                textAlign: "center",
              }}
            >
              Batch Type Analysis
            </div>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" label={{ position: "top", fill: "#667ea7ff", fontSize: 12 }}>
                    {batchTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#45669d" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Right: Pie Chart */}
        <Col span={12}>
          <Card className="mt-4 pt-0">
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                paddingTop: "20px",
                paddingBottom: "20px",
                backgroundColor: "#123c63",
                fontSize: "16px",
                color: "white",
                textAlign: "center",
              }}
            >
              Batch Status Analysis
            </div>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reconciliation;
