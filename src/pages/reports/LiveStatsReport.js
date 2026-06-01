import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Table,
  Space,
  message,
  Switch,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import reportService from "../../features/shared/services/reportService";
import "../../features/reports/cancelled-members/CancelledMembersReport.css";

const { Option } = Select;

const LiveStatsReport = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const now = new Date();
  const [years, setYears] = useState([now.getFullYear()]);
  const [months, setMonths] = useState([now.getMonth() + 1]);
  const [includeStudents, setIncludeStudents] = useState(false);
  const [includeHonorary, setIncludeHonorary] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await reportService.getLiveStats({
        years,
        months,
        dimensions: [
          "membershipCategory",
          "grade",
          "branch",
          "region",
          "section",
        ],
        includeStudents,
        includeHonorary,
        recompute: true,
      });
      setRows(data.rows || []);
    } catch (e) {
      message.error(e.message || "Failed to load live stats");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Year", dataIndex: "periodYear", width: 80 },
    { title: "Month", dataIndex: "periodMonth", width: 80 },
    { title: "Dimension", dataIndex: "dimension", width: 140 },
    { title: "Value", dataIndex: "dimensionValue", flex: 1 },
    { title: "Segment", dataIndex: "memberSegment", width: 100 },
    { title: "Active", dataIndex: "activeCount", width: 90 },
    { title: "Cancelled", dataIndex: "cancelledInMonth", width: 100 },
    { title: "Resigned", dataIndex: "resignedInMonth", width: 100 },
    { title: "Joiners", dataIndex: "joinersInMonth", width: 90 },
    { title: "Leavers", dataIndex: "leaversInMonth", width: 90 },
  ];

  return (
    <div className="cancelled-members-report" style={{ padding: 24 }}>
      <Card title="Live membership stats (monthly)">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <label>Years</label>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={years}
              onChange={setYears}
              options={[2024, 2025, 2026].map((y) => ({ label: String(y), value: y }))}
            />
          </Col>
          <Col xs={24} md={8}>
            <label>Months</label>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={months}
              onChange={setMonths}
              options={Array.from({ length: 12 }, (_, i) => ({
                label: String(i + 1),
                value: i + 1,
              }))}
            />
          </Col>
          <Col span={24}>
            <Space>
              <span>Students</span>
              <Switch checked={includeStudents} onChange={setIncludeStudents} />
              <span>Honorary</span>
              <Switch checked={includeHonorary} onChange={setIncludeHonorary} />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={load}
              >
                Load stats
              </Button>
            </Space>
          </Col>
        </Row>
        <Table
          style={{ marginTop: 24 }}
          columns={columns}
          dataSource={rows}
          rowKey={(r) =>
            `${r.periodYear}-${r.periodMonth}-${r.dimension}-${r.dimensionValue}-${r.memberSegment}`
          }
          loading={loading}
          scroll={{ x: 1100, y: 520 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default LiveStatsReport;
