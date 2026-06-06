import React, { useMemo } from "react";
import { Card } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatReportNum } from "./workplaceBreakdownReportUtils";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="wp-breakdown-report__chart-tooltip">
      <div className="wp-breakdown-report__chart-tooltip-label">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name || entry.dataKey}>
          {entry.name}: {formatReportNum(entry.value)}
        </div>
      ))}
    </div>
  );
}

export default function WorkplaceBreakdownCharts({ trendSeries }) {
  const orgTrend = useMemo(
    () =>
      (trendSeries?.orgMonthlyTotals || []).map((p) => ({
        name: p.label || `${p.month}/${p.year}`,
        count: p.count,
      })),
    [trendSeries],
  );

  const topWorkplaces = useMemo(
    () =>
      (trendSeries?.topWorkplaces || []).map((p) => ({
        name:
          p.workLocation?.length > 28
            ? `${p.workLocation.slice(0, 26)}…`
            : p.workLocation,
        fullName: p.workLocation,
        region: p.region,
        count: p.currentCount,
      })),
    [trendSeries],
  );

  const movers = useMemo(() => {
    const gainers = (trendSeries?.movers?.gainers || []).map((m) => ({
      name:
        m.workLocation?.length > 24
          ? `${m.workLocation.slice(0, 22)}…`
          : m.workLocation,
      change: m.momAbsolute,
      type: "gain",
    }));
    const losers = (trendSeries?.movers?.losers || []).map((m) => ({
      name:
        m.workLocation?.length > 24
          ? `${m.workLocation.slice(0, 22)}…`
          : m.workLocation,
      change: m.momAbsolute,
      type: "loss",
    }));
    return [...gainers, ...losers];
  }, [trendSeries]);

  if (!orgTrend.length && !topWorkplaces.length) return null;

  return (
    <section className="wp-breakdown-report__charts no-print">
      <div className="wp-breakdown-report__charts-grid">
        {orgTrend.length > 0 && (
          <Card className="wp-breakdown-report__chart-card" title="Organisation trend">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={orgTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Members"
                  stroke="#45669d"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {topWorkplaces.length > 0 && (
          <Card className="wp-breakdown-report__chart-card" title="Top workplaces (current month)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topWorkplaces} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload;
                    return (
                      <div className="wp-breakdown-report__chart-tooltip">
                        <div>{row?.fullName || row?.name}</div>
                        <div>{row?.region}</div>
                        <div>Members: {formatReportNum(payload[0]?.value)}</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" name="Members" fill="#45669d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {movers.length > 0 && (
          <Card className="wp-breakdown-report__chart-card" title="MoM movers">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={movers} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="change" name="MoM change">
                  {movers.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.type === "gain" ? "#389e0d" : "#cf1322"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </section>
  );
}
