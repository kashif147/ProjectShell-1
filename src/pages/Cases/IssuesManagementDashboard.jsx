import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row, Tag, Button, Table } from "antd";
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../../styles/EventsDashboard.css";

const PRIORITY_MIX = [
  { name: "Critical", value: 8, color: "#dc2626" },
  { name: "High", value: 22, color: "#ea580c" },
  { name: "Medium", value: 45, color: "#215e97" },
  { name: "Low", value: 25, color: "#94a3b8" },
];

const ISSUE_TREND = [
  { month: "Jan", opened: 42, closed: 38, escalated: 4 },
  { month: "Feb", opened: 48, closed: 44, escalated: 5 },
  { month: "Mar", opened: 55, closed: 50, escalated: 6 },
  { month: "Apr", opened: 51, closed: 47, escalated: 3 },
];

const RECENT_ISSUES = [
  {
    key: "1",
    issueId: "ISS-24081",
    title: "Payroll deduction mismatch — March cycle",
    priority: "High",
    status: "Open",
    assignee: "Legal Team",
    updated: "Apr 16, 2026 14:20",
  },
  {
    key: "2",
    issueId: "ISS-24076",
    title: "Member portal timeout on Safari",
    priority: "Medium",
    status: "In review",
    assignee: "IT Team",
    updated: "Apr 15, 2026 09:05",
  },
  {
    key: "3",
    issueId: "ISS-24070",
    title: "GDPR data export request overdue",
    priority: "Critical",
    status: "Open",
    assignee: "Compliance",
    updated: "Apr 14, 2026 16:40",
  },
  {
    key: "4",
    issueId: "ISS-24065",
    title: "Duplicate correspondence to retired member",
    priority: "Low",
    status: "Pending",
    assignee: "Support Team",
    updated: "Apr 12, 2026 11:15",
  },
];

function formatCountShort(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  if (x >= 1000) {
    const k = x / 1000;
    const s = Number.isInteger(k) ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
    return `${s}k`;
  }
  return String(Math.round(x));
}

function priorityTag(priority) {
  const map = {
    Critical: "error",
    High: "warning",
    Medium: "processing",
    Low: "default",
  };
  return <Tag color={map[priority] || "default"}>{priority}</Tag>;
}

function statusTag(status) {
  let color = "default";
  if (status === "Open") color = "processing";
  if (status === "In review") color = "warning";
  if (status === "Pending") color = "default";
  if (status === "Closed") color = "success";
  return <Tag color={color}>{status}</Tag>;
}

function issueIcon(priority) {
  const sz = 16;
  if (priority === "Critical") {
    return <WarningOutlined style={{ color: "#dc2626", fontSize: sz }} />;
  }
  if (priority === "High") {
    return <ExclamationCircleOutlined style={{ color: "#ea580c", fontSize: sz }} />;
  }
  return <ExclamationCircleOutlined style={{ color: "#215e97", fontSize: sz }} />;
}

function IssuesManagementDashboard() {
  const navigate = useNavigate();

  const kpis = useMemo(
    () => [
      {
        label: "Open issues",
        value: "186",
        trend: "↘ 6 vs last week",
        trendMuted: true,
        barColor: "#215e97",
        barPercent: 62,
      },
      {
        label: "Resolved (30d)",
        value: "214",
        trend: "↗ 12%",
        trendMuted: false,
        barColor: "#10b981",
        barPercent: 78,
      },
      {
        label: "Avg. age (open)",
        value: "4.2d",
        trend: "Within SLA",
        trendMuted: true,
        barColor: "#7c3aed",
        barPercent: 44,
      },
      {
        label: "SLA at risk",
        value: "11",
        trend: "Needs attention",
        trendMuted: true,
        barColor: "#dc2626",
        barPercent: 18,
      },
    ],
    [],
  );

  const columns = useMemo(
    () => [
      {
        dataIndex: "title",
        title: "ISSUE",
        width: 340,
        render: (text, record) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: "#e6f7ff",
                color: "#215e97",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {issueIcon(record.priority)}
            </div>
            <div>
              <div className="events-dashboard__event-name">{text}</div>
              <div className="events-dashboard__event-loc">
                {record.issueId} · {record.assignee}
              </div>
            </div>
          </div>
        ),
      },
      {
        dataIndex: "priority",
        title: "PRIORITY",
        width: 112,
        render: (p) => priorityTag(p),
      },
      {
        dataIndex: "status",
        title: "STATUS",
        width: 120,
        render: (s) => statusTag(s),
      },
      {
        dataIndex: "updated",
        title: "UPDATED",
        width: 168,
        render: (text) => (
          <span className="events-dashboard__count-cell" style={{ fontWeight: 500 }}>
            {text}
          </span>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 48,
        align: "right",
        render: () => (
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="events-dashboard">
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {kpis.map((k) => (
          <Col xs={24} sm={12} lg={6} key={k.label}>
            <Card className="events-dashboard__card events-dashboard__kpi" bordered={false}>
              <div className="events-dashboard__kpi-label">{k.label}</div>
              <div
                className={
                  k.trendMuted
                    ? "events-dashboard__kpi-trend events-dashboard__kpi-trend--muted"
                    : "events-dashboard__kpi-trend"
                }
              >
                {k.trend}
              </div>
              <div className="events-dashboard__kpi-value">{k.value}</div>
              <div className="events-dashboard__kpi-bar">
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "#e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${k.barPercent}%`,
                      height: "100%",
                      background: k.barColor,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} lg={14}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">
              ISSUE FLOW ({new Date().getFullYear()})
            </p>
            <div className="events-dashboard__section-note">
              ↗ Closures outpacing opens in April
            </div>
            <div style={{ height: 196 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ISSUE_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="issuesOpenedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#215e97" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#215e97" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatCountShort(v)}
                    domain={[0, 80]}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v, name) => [formatCountShort(v), name]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                    iconType="line"
                    verticalAlign="bottom"
                    height={28}
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    name="Opened"
                    stroke="#215e97"
                    strokeWidth={2}
                    fill="url(#issuesOpenedFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="closed"
                    name="Closed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="escalated"
                    name="Escalated"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">OPEN ISSUES BY PRIORITY</p>
            <div style={{ height: 168 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PRIORITY_MIX}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {PRIORITY_MIX.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry) => (
                      <span style={{ color: "#475569", fontSize: 12 }}>
                        {value}{" "}
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>
                          {entry.payload.value}%
                        </span>
                      </span>
                    )}
                  />
                  <Tooltip formatter={(v) => `${v}% of open`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={14}>
          <Card className="events-dashboard__card" bordered={false}>
            <div className="events-dashboard__table-head">
              <p className="events-dashboard__section-title" style={{ margin: 0 }}>
                RECENT ISSUES
              </p>
              <button
                type="button"
                className="events-dashboard__link"
                onClick={() => navigate("/CasesSummary", { state: { search: "All Issues" } })}
              >
                View all &gt;
              </button>
            </div>
            <div className="events-dashboard__dash-table-wrap">
              <Table
                columns={columns}
                dataSource={RECENT_ISSUES}
                pagination={false}
                size="small"
                rowKey="key"
                showHeader
                onRow={(record) => ({
                  onClick: () =>
                    navigate("/CasesDetails", {
                      state: { caseId: record.issueId },
                    }),
                })}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__drill-title">
              FOCUS ISSUE: ISS-24070
            </p>
            <div className="events-dashboard__metric-grid">
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">DAYS OPEN</div>
                <div className="events-dashboard__metric-value">6</div>
              </div>
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">RESPONSES</div>
                <div className="events-dashboard__metric-value">14</div>
              </div>
            </div>
            <div className="events-dashboard__sentiment-label">SLA CLOCK</div>
            <div className="events-dashboard__sentiment-score">18h remaining</div>
            <div className="events-dashboard__sentiment-bar">
              <span style={{ width: "72%", background: "#f59e0b" }} />
            </div>
            <p className="events-dashboard__sentiment-caption">
              Escalation path engaged; compliance owner notified.
            </p>
            <div className="events-dashboard__ticket-label">BACKLOG VS NEW</div>
            <div className="events-dashboard__ticket-bars" title="Existing backlog vs new intakes">
              <span aria-label="Backlog" style={{ flex: 58, background: "#215e97" }} />
              <span aria-label="New" style={{ flex: 42, background: "#94a3b8" }} />
            </div>
            <div className="events-dashboard__ticket-legend">
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--members" />
                Backlog 58%
              </span>
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--nonmembers" />
                New 42%
              </span>
            </div>
            <button
              type="button"
              className="events-dashboard__report-btn"
              onClick={() =>
                navigate("/CasesDetails", { state: { caseId: "ISS-24070" } })
              }
            >
              Open issue
            </button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default IssuesManagementDashboard;
