import React, { useMemo } from "react";
import { Card, Col, Row, Table } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
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

/** Amounts in whole euros (typically low tens of thousands). */
const REVENUE_TREND = [
  { month: "Jan", revenue: 4200, cancelled: 520, refunded: 180 },
  { month: "Feb", revenue: 7800, cancelled: 720, refunded: 290 },
  { month: "Mar", revenue: 11200, cancelled: 980, refunded: 410 },
  { month: "Apr", revenue: 12800, cancelled: 1100, refunded: 520 },
];

const REVENUE_BY_TYPE = [
  { name: "Conference", value: 38200, color: "#215e97" },
  { name: "Networking", value: 11800, color: "#7c3aed" },
  { name: "Seminar", value: 3200, color: "#16a34a" },
  { name: "Webinar", value: 6200, color: "#ea580c" },
  { name: "Workshop", value: 1350, color: "#dc2626" },
];

const RECENT_EVENTS = [
  {
    key: "1",
    name: "Global Tech Summit 2024",
    location: "San Francisco, CA",
    status: "ACTIVE",
    attendees: 1850,
    capacity: 2200,
    revenue: 19800,
    head: 2100,
    cancelled: 52,
    refunds: 14,
  },
  {
    key: "2",
    name: "Digital Health Webinar Series",
    location: "Virtual",
    status: "UPCOMING",
    attendees: 420,
    capacity: 800,
    revenue: 8200,
    head: 920,
    cancelled: 18,
    refunds: 4,
  },
  {
    key: "3",
    name: "Annual Leadership Workshop",
    location: "Chicago, IL",
    status: "PAST",
    attendees: 96,
    capacity: 120,
    revenue: 1950,
    head: 210,
    cancelled: 3,
    refunds: 1,
  },
];

function formatMoneyShort(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "€0";
  if (x >= 1_000_000) return `€${(x / 1_000_000).toFixed(2)}M`;
  if (x >= 1000) {
    const k = x / 1000;
    const s = Number.isInteger(k) ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
    return `€${s}k`;
  }
  return `€${Math.round(x)}`;
}

function EventsDashboard() {
  const kpis = useMemo(
    () => [
      {
        label: "Total Events",
        value: "8",
        trend: "↗ 12%",
        trendMuted: false,
        barColor: "#215e97",
        barPercent: 72,
      },
      {
        label: "Total Attendees",
        value: "3.0k",
        trend: "↗ 8.4%",
        trendMuted: false,
        barColor: "#dc2626",
        barPercent: 64,
      },
      {
        label: "Total Revenue",
        value: "€61k",
        trend: "↗ 24%",
        trendMuted: false,
        barColor: "#10b981",
        barPercent: 78,
      },
      {
        label: "Live Events",
        value: "2",
        trend: "4 UPCOMING",
        trendMuted: true,
        barColor: "#c4b5fd",
        barPercent: 40,
      },
    ],
    [],
  );

  const columns = [
    {
      title: "EVENT NAME",
      dataIndex: "name",
      key: "name",
      render: (_, row) => (
        <div>
          <div className="events-dashboard__event-name">{row.name}</div>
          <div className="events-dashboard__event-loc">
            <EnvironmentOutlined style={{ fontSize: 12 }} />
            {row.location}
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const cls =
          status === "ACTIVE"
            ? "events-dashboard__status events-dashboard__status--active"
            : status === "UPCOMING"
              ? "events-dashboard__status events-dashboard__status--upcoming"
              : "events-dashboard__status events-dashboard__status--past";
        return <span className={cls}>{status}</span>;
      },
    },
    {
      title: "ATTENDEES",
      key: "attendees",
      width: 140,
      render: (_, row) => {
        const pct = Math.min(
          100,
          Math.round((row.attendees / row.capacity) * 100),
        );
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>
              {row.attendees.toLocaleString()}
            </div>
            <div className="events-dashboard__attendee-bar">
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      title: "CANCELLED",
      key: "cancelled",
      width: 100,
      align: "right",
      render: (_, row) => (
        <span className="events-dashboard__count-cell">
          {(row.cancelled ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "REFUNDS",
      key: "refunds",
      width: 100,
      align: "right",
      render: (_, row) => (
        <span className="events-dashboard__count-cell">
          {(row.refunds ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "REVENUE",
      key: "revenue",
      width: 120,
      align: "right",
      render: (_, row) => (
        <div>
          <div className="events-dashboard__rev-main">
            {formatMoneyShort(row.revenue)}
          </div>
          <div className="events-dashboard__rev-sub">
            / {formatMoneyShort(row.head)} HEAD
          </div>
        </div>
      ),
    },
  ];

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
              REVENUE TREND ({new Date().getFullYear()})
            </p>
            <div className="events-dashboard__section-note">
              ↗ Projection: + €2.4k
            </div>
            <div style={{ height: 196 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="eventsRevFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#215e97" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#215e97" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatMoneyShort(v)}
                    domain={[0, 16000]}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v, name) => [formatMoneyShort(v), name]}
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
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#215e97"
                    strokeWidth={2}
                    fill="url(#eventsRevFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    name="Cancelled"
                    stroke="#64748b"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="refunded"
                    name="Refunded"
                    stroke="#ea580c"
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
            <p className="events-dashboard__section-title">REVENUE BY EVENT TYPE</p>
            <div style={{ height: 168 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={REVENUE_BY_TYPE}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {REVENUE_BY_TYPE.map((entry) => (
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
                          {formatMoneyShort(entry.payload.value)}
                        </span>
                      </span>
                    )}
                  />
                  <Tooltip formatter={(v) => formatMoneyShort(v)} />
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
                RECENT &amp; ACTIVE EVENTS
              </p>
              <button type="button" className="events-dashboard__link">
                View All &gt;
              </button>
            </div>
            <Table
              columns={columns}
              dataSource={RECENT_EVENTS}
              pagination={false}
              size="small"
              rowKey="key"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__drill-title">
              DRILL-DOWN FOCUS: GLOBAL TECH SUMMIT 2024
            </p>
            <div className="events-dashboard__metric-grid">
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">CHECK-IN RATE</div>
                <div className="events-dashboard__metric-value">82%</div>
              </div>
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">CAPACITY REACH</div>
                <div className="events-dashboard__metric-value">83%</div>
              </div>
            </div>
            <div className="events-dashboard__sentiment-label">LIVE SENTIMENT SCORE</div>
            <div className="events-dashboard__sentiment-score">4.8 / 5.0</div>
            <div className="events-dashboard__sentiment-bar">
              <span />
            </div>
            <p className="events-dashboard__sentiment-caption">
              Based on real-time social &amp; attendee feedback surveys.
            </p>
            <div className="events-dashboard__ticket-label">
              MEMBERS VS NON-MEMBERS
            </div>
            <div
              className="events-dashboard__ticket-bars"
              title="Members vs non-members (attendee mix)"
            >
              <span aria-label="Members share" />
              <span aria-label="Non-members share" />
            </div>
            <div className="events-dashboard__ticket-legend">
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--members" />
                Members ~72%
              </span>
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--nonmembers" />
                Non-members ~28%
              </span>
            </div>
            <button type="button" className="events-dashboard__report-btn">
              Generate Full Report
            </button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EventsDashboard;
