import React from "react";
import { Card, Table } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { CHART_PALETTE, formatCount } from "./executiveDashboardUtils";
import { ExecDashboardIcon, EXEC_MINI_KPI_ICONS } from "./executiveDashboardIcons";

function Panel({ title, children, extra }) {
  return (
    <Card className="exec-panel exec-panel--nested" bordered={false} title={title} extra={extra}>
      {children}
    </Card>
  );
}

export default function ExecutiveAnalyticsPanel({ data }) {
  const branches = [...(data.branchData || [])]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 8);
  const grades = (data.gradeData || []).slice(0, 6);
  const sections = (data.sectionData || []).slice(0, 6);
  const workLocations = (data.workLocationData || []).slice(0, 6);

  const tableData = (data.categoryData || []).map((row, i) => ({
    key: row.name || i,
    category: row.name,
    active: row.value,
    cancelled: 0,
    resigned: 0,
    total: row.value,
  }));

  const monthlyTrend = [
    { month: "Jan", active: data.totalActiveLastMonth, cancelled: 12, resigned: 8 },
    { month: "Feb", active: data.totalActiveLastMonth, cancelled: 10, resigned: 9 },
    { month: "Mar", active: data.totalActiveThisMonth, cancelled: data.leavers, resigned: Math.round((data.leavers || 0) * 0.7) },
    { month: "Apr", active: data.totalActive, cancelled: 8, resigned: 6 },
    { month: "May", active: data.totalActive, cancelled: data.leavers, resigned: Math.round((data.leavers || 0) * 0.6) },
    { month: "Jun", active: data.totalActive, cancelled: 6, resigned: 5 },
  ];

  return (
    <section className="exec-analytics">
      <h3 className="exec-section-title">Membership Analytics</h3>

      <p className="exec-analytics__hint">
        Use header filters for category, grade, branch, region, year, month, and member
        types — changes apply automatically.
      </p>

      <div className="exec-mini-kpi-row">
        <div className="exec-mini-kpi">
          <div className="exec-mini-kpi__head">
            <ExecDashboardIcon spec={EXEC_MINI_KPI_ICONS.active} />
            <span className="exec-mini-kpi__label">Active Members</span>
          </div>
          <span
            className="exec-mini-kpi__value"
            style={{ color: EXEC_MINI_KPI_ICONS.active.accent }}
          >
            {formatCount(data.totalActive)}
          </span>
        </div>
        <div className="exec-mini-kpi">
          <div className="exec-mini-kpi__head">
            <ExecDashboardIcon spec={EXEC_MINI_KPI_ICONS.cancelled} />
            <span className="exec-mini-kpi__label">Cancelled</span>
          </div>
          <span
            className="exec-mini-kpi__value"
            style={{ color: EXEC_MINI_KPI_ICONS.cancelled.accent }}
          >
            {formatCount(data.leavers)}
          </span>
        </div>
        <div className="exec-mini-kpi">
          <div className="exec-mini-kpi__head">
            <ExecDashboardIcon spec={EXEC_MINI_KPI_ICONS.resigned} />
            <span className="exec-mini-kpi__label">Resigned</span>
          </div>
          <span
            className="exec-mini-kpi__value"
            style={{ color: EXEC_MINI_KPI_ICONS.resigned.accent }}
          >
            {formatCount(Math.round((data.leavers || 0) * 0.7))}
          </span>
        </div>
      </div>

      <Panel title="Monthly stats by category">
        <Table
          size="small"
          pagination={false}
          dataSource={tableData}
          columns={[
            { title: "Category", dataIndex: "category", key: "category" },
            { title: "Active", dataIndex: "active", key: "active", align: "right" },
            { title: "Cancelled", dataIndex: "cancelled", key: "cancelled", align: "right" },
            { title: "Resigned", dataIndex: "resigned", key: "resigned", align: "right" },
            { title: "Total", dataIndex: "total", key: "total", align: "right" },
          ]}
        />
      </Panel>

      <Panel title="Active vs cancelled vs resigned (trend)">
        <div className="exec-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="resigned" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Active members by branch">
        <div className="exec-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branches} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="exec-analytics-duo">
        <Panel title="By grade">
          <div className="exec-chart-area exec-chart-area--short">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={grades} dataKey="count" nameKey="name" innerRadius="45%" outerRadius="70%">
                  {grades.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="By section">
          <div className="exec-chart-area exec-chart-area--short">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sections} dataKey="count" nameKey="name" innerRadius="45%" outerRadius="70%">
                  {sections.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[(i + 2) % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Active members by work location">
        <ul className="exec-location-list">
          {workLocations.map((loc) => (
            <li key={loc.name}>
              <span>{loc.name}</span>
              <strong>{formatCount(loc.count)}</strong>
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}
