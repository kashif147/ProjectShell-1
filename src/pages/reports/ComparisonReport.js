import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  InputNumber,
  Table,
  Statistic,
  Space,
  message,
  Switch,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import reportService from "../../features/shared/services/reportService";
import "../../features/reports/cancelled-members/CancelledMembersReport.css";

const { Option } = Select;

const ComparisonReport = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [periodA, setPeriodA] = useState({ type: "year_end", year: 2025 });
  const [periodB, setPeriodB] = useState({ type: "month_end", year: 2026, month: 5 });
  const [includeStudents, setIncludeStudents] = useState(false);
  const [includeHonorary, setIncludeHonorary] = useState(false);

  const runReport = async (preset) => {
    setLoading(true);
    try {
      const body = preset
        ? { preset, includeStudents, includeHonorary }
        : {
            periodA,
            periodB,
            includeStudents,
            includeHonorary,
            dimensions: ["membershipCategory", "grade", "branch", "region"],
          };
      const data = await reportService.getComparisonReport(body);
      setResult(data);
    } catch (e) {
      message.error(e.message || "Failed to load comparison report");
    } finally {
      setLoading(false);
    }
  };

  const kpiColumns = [
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Period A", dataIndex: "a", key: "a" },
    { title: "Period B", dataIndex: "b", key: "b" },
    { title: "Change", dataIndex: "change", key: "change" },
  ];

  const kpiRows = result
    ? [
        {
          key: "active",
          metric: "Active members",
          a: result.periodA?.kpis?.activeTotal,
          b: result.periodB?.kpis?.activeTotal,
          change: result.kpiChange?.activeTotal,
        },
        {
          key: "paid",
          metric: "Paid active",
          a: result.periodA?.kpis?.paidActive,
          b: result.periodB?.kpis?.paidActive,
          change: result.kpiChange?.paidActive,
        },
      ]
    : [];

  return (
    <div className="cancelled-members-report" style={{ padding: 24 }}>
      <Card title="Membership comparison report">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space wrap>
              <Button onClick={() => runReport("last_month_vs_current")} loading={loading}>
                Last month vs current
              </Button>
              <Button onClick={() => runReport("same_month_last_year")} loading={loading}>
                Same month last year vs this year
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <label>Period A type</label>
            <Select
              style={{ width: "100%" }}
              value={periodA.type}
              onChange={(v) => setPeriodA((p) => ({ ...p, type: v }))}
            >
              <Option value="year_end">Year end</Option>
              <Option value="month_end">Month end</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <label>Year A</label>
            <InputNumber
              style={{ width: "100%" }}
              value={periodA.year}
              onChange={(v) => setPeriodA((p) => ({ ...p, year: v }))}
            />
          </Col>
          {periodA.type === "month_end" && (
            <Col xs={12} md={4}>
              <label>Month A</label>
              <InputNumber
                min={1}
                max={12}
                style={{ width: "100%" }}
                value={periodA.month}
                onChange={(v) => setPeriodA((p) => ({ ...p, month: v }))}
              />
            </Col>
          )}
          <Col xs={24} md={8}>
            <label>Period B type</label>
            <Select
              style={{ width: "100%" }}
              value={periodB.type}
              onChange={(v) => setPeriodB((p) => ({ ...p, type: v }))}
            >
              <Option value="year_end">Year end</Option>
              <Option value="month_end">Month end</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <label>Year B</label>
            <InputNumber
              style={{ width: "100%" }}
              value={periodB.year}
              onChange={(v) => setPeriodB((p) => ({ ...p, year: v }))}
            />
          </Col>
          {periodB.type === "month_end" && (
            <Col xs={12} md={4}>
              <label>Month B</label>
              <InputNumber
                min={1}
                max={12}
                style={{ width: "100%" }}
                value={periodB.month}
                onChange={(v) => setPeriodB((p) => ({ ...p, month: v }))}
              />
            </Col>
          )}
          <Col span={24}>
            <Space>
              <span>Include students</span>
              <Switch checked={includeStudents} onChange={setIncludeStudents} />
              <span>Include honorary</span>
              <Switch checked={includeHonorary} onChange={setIncludeHonorary} />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={() => runReport()}
              >
                Run comparison
              </Button>
            </Space>
          </Col>
        </Row>

        {result && (
          <>
            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={12}>
                <Statistic title="Period A" value={result.periodA?.label} />
              </Col>
              <Col span={12}>
                <Statistic title="Period B" value={result.periodB?.label} />
              </Col>
            </Row>
            <Table
              style={{ marginTop: 16 }}
              columns={kpiColumns}
              dataSource={kpiRows}
              pagination={false}
              size="small"
            />
            {result.breakdown?.membershipCategory && (
              <Table
                style={{ marginTop: 24 }}
                title={() => "By membership category"}
                columns={[
                  { title: "Category", dataIndex: "name" },
                  { title: "Period A", dataIndex: "periodA" },
                  { title: "Period B", dataIndex: "periodB" },
                  { title: "Change", dataIndex: "change" },
                ]}
                dataSource={result.breakdown.membershipCategory}
                rowKey="name"
                size="small"
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ComparisonReport;
