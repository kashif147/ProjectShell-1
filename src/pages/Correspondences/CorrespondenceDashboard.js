import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row, Tag, Button } from "antd";
import {
  MailOutlined,
  MessageOutlined,
  FileTextOutlined,
  BellOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
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
import "../../styles/CorrespondenceDashboard.css";

const CHANNEL_MIX = [
  { name: "Email", value: 52, color: "#215e97" },
  { name: "SMS", value: 24, color: "#7c3aed" },
  { name: "Letter", value: 16, color: "#14b8a6" },
  { name: "Push", value: 8, color: "#ea580c" },
];

const VOLUME_TREND = [
  { month: "Jan", sent: 38200, failed: 380, bounced: 260 },
  { month: "Feb", sent: 42100, failed: 410, bounced: 290 },
  { month: "Mar", sent: 46800, failed: 395, bounced: 305 },
  { month: "Apr", sent: 51200, failed: 420, bounced: 318 },
];

const CAMPAIGNS = [
  {
    key: "1",
    campaignId: "#CMP-9832",
    channel: "Email",
    name: "Marketing_Q4_Email",
    status: "SENT",
    sentDate: "Oct 24, 2025 10:45",
    successRate: 98,
  },
  {
    key: "2",
    campaignId: "#CMP-9831",
    channel: "SMS",
    name: "Alert_System_Maintenance",
    status: "PROCESSING",
    sentDate: "Oct 24, 2025 09:12",
    successRate: 45,
  },
  {
    key: "3",
    campaignId: "#CMP-9830",
    channel: "Letter",
    name: "Policy_Renewal_Letters",
    status: "QUEUED",
    sentDate: "Oct 23, 2025 16:30",
    successRate: 0,
  },
  {
    key: "4",
    campaignId: "#CMP-9829",
    channel: "Push",
    name: "Security_Breach_Push",
    status: "FAILED",
    sentDate: "Oct 23, 2025 11:20",
    successRate: 12,
  },
];

function formatVolumeShort(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(2)}M`;
  if (x >= 1000) {
    const k = x / 1000;
    const s = Number.isInteger(k) ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
    return `${s}k`;
  }
  return String(Math.round(x));
}

function channelIcon(channel) {
  switch (channel) {
    case "Email":
      return <MailOutlined style={{ color: "#215e97", fontSize: 14 }} />;
    case "SMS":
      return <MessageOutlined style={{ color: "#7c3aed", fontSize: 14 }} />;
    case "Letter":
      return <FileTextOutlined style={{ color: "#14b8a6", fontSize: 14 }} />;
    case "Push":
      return <BellOutlined style={{ color: "#ea580c", fontSize: 14 }} />;
    default:
      return <MailOutlined style={{ fontSize: 14 }} />;
  }
}

function statusTag(status) {
  let color = "default";
  if (status === "SENT") color = "success";
  if (status === "PROCESSING") color = "processing";
  if (status === "QUEUED") color = "default";
  if (status === "FAILED") color = "error";
  return <Tag color={color}>{status}</Tag>;
}

const CorrespondenceDashboard = () => {
  const navigate = useNavigate();

  const kpis = useMemo(
    () => [
      {
        label: "Campaign sends (YTD)",
        value: "128k",
        trend: "↗ 5.2%",
        trendMuted: false,
        barColor: "#215e97",
        barPercent: 72,
      },
      {
        label: "Delivered rate",
        value: "98.2%",
        trend: "↗ 0.4%",
        trendMuted: false,
        barColor: "#10b981",
        barPercent: 98,
      },
      {
        label: "Opened / read",
        value: "46.0%",
        trend: "↘ 1.2%",
        trendMuted: true,
        barColor: "#7c3aed",
        barPercent: 46,
      },
      {
        label: "Failed",
        value: "0.8%",
        trend: "Under 1% target",
        trendMuted: true,
        barColor: "#dc2626",
        barPercent: 8,
      },
    ],
    [],
  );

  const columns = useMemo(
    () => [
      {
        dataIndex: "name",
        title: "Campaign",
        width: 320,
        render: (text, record) => (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#e6f7ff",
                color: "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {channelIcon(record.channel)}
            </div>
            <div>
              <div
                style={{ fontWeight: 600, color: "#1890ff", cursor: "pointer" }}
              >
                {text}
              </div>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {record.campaignId} · {record.channel}
              </div>
            </div>
          </div>
        ),
      },
      {
        dataIndex: "sentDate",
        title: "Sent",
        width: 200,
        render: (text) => (
          <span style={{ color: "#64748b", fontSize: 13 }}>{text}</span>
        ),
      },
      {
        dataIndex: "status",
        title: "Status",
        width: 150,
        render: (status) => statusTag(status),
      },
      {
        dataIndex: "successRate",
        title: "Delivery",
        width: 160,
        render: (pct) => {
          const n = Math.min(100, Math.max(0, Number(pct) || 0));
          const stroke =
            n > 90 ? "#10b981" : n > 40 ? "#f59e0b" : "#dc2626";
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 500, minWidth: 36 }}>{n}%</span>
              <div
                style={{
                  flex: 1,
                  maxWidth: 100,
                  height: 6,
                  borderRadius: 3,
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${n}%`,
                    height: "100%",
                    background: stroke,
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: () => (
          <Button
            type="text"
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
              CAMPAIGN SEND VOLUME ({new Date().getFullYear()})
            </p>
            <div className="events-dashboard__section-note">↗ Peak day Thu (+18% vs avg)</div>
            <div style={{ height: 196 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VOLUME_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="corrSentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#215e97" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#215e97" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatVolumeShort(v)}
                    domain={[0, 60000]}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v, name) => [formatVolumeShort(v), name]}
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
                    dataKey="sent"
                    name="Sent"
                    stroke="#215e97"
                    strokeWidth={2}
                    fill="url(#corrSentFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    name="Failed"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bounced"
                    name="Bounced"
                    stroke="#64748b"
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
            <p className="events-dashboard__section-title">CHANNEL MIX (COUNT)</p>
            <div style={{ height: 168 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CHANNEL_MIX}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {CHANNEL_MIX.map((entry) => (
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
                  <Tooltip formatter={(v) => `${v}% of sends`} />
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
                RECENT CAMPAIGNS
              </p>
              <button type="button" className="events-dashboard__link">
                View all &gt;
              </button>
            </div>
            <MyTable
              columns={columns}
              dataSource={CAMPAIGNS}
              loading={false}
              tablePadding={{
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingTop: "4px",
                paddingBottom: "24px",
              }}
              onRowClick={(record) => {
                navigate("/CommunicationBatchDetail", {
                  state: {
                    batchId: record.campaignId,
                    batchName: record.name,
                    campaignId: record.campaignId,
                    ...record,
                  },
                });
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__drill-title">
              FOCUS CAMPAIGN: MARKETING_Q4_EMAIL
            </p>
            <div className="events-dashboard__metric-grid">
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">DELIVERY SCORE</div>
                <div className="events-dashboard__metric-value">98%</div>
              </div>
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">READ RATE</div>
                <div className="events-dashboard__metric-value">44%</div>
              </div>
            </div>
            <div className="events-dashboard__sentiment-label">QUEUE HEALTH</div>
            <div className="events-dashboard__sentiment-score">Low backlog</div>
            <div className="events-dashboard__sentiment-bar">
              <span style={{ width: "22%" }} />
            </div>
            <p className="events-dashboard__sentiment-caption">
              Most campaigns clear within SLA; letter campaigns skew slower.
            </p>
            <div className="events-dashboard__ticket-label">DIGITAL VS PHYSICAL</div>
            <div className="events-dashboard__ticket-bars" title="Email, SMS & push vs letter">
              <span aria-label="Digital channels" style={{ flex: 78, background: "#215e97" }} />
              <span aria-label="Physical mail" style={{ flex: 22, background: "#94a3b8" }} />
            </div>
            <div className="events-dashboard__ticket-legend">
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--members" />
                Digital 78%
              </span>
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--nonmembers" />
                Letter 22%
              </span>
            </div>
            <button type="button" className="events-dashboard__report-btn">
              Open campaign
            </button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CorrespondenceDashboard;
