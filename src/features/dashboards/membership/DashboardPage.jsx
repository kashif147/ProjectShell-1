import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { reportService } from "../../shared/services/reportService";
import "./DashboardPage.css";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    revenueYTD: 0,
    refundsYTD: 0,
  });
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [revenueDaily, setRevenueDaily] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpi, monthly, daily] = await Promise.all([
        reportService.getKpiOverview(),
        reportService.getRevenueMonthly(
          dayjs().subtract(12, "months").format("YYYY-MM-DD"),
          dayjs().format("YYYY-MM-DD")
        ),
        reportService.getRevenueDaily(
          dayjs().subtract(30, "days").format("YYYY-MM-DD"),
          dayjs().format("YYYY-MM-DD")
        ),
      ]);

      setKpiData(kpi);
      setRevenueMonthly(monthly);
      setRevenueDaily(daily);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ padding: "24px" }}>
        <h1 style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "bold" }}>
          Reports Dashboard
        </h1>

        {/* KPI Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Members"
                value={kpiData.totalMembers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Members"
                value={kpiData.activeMembers}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Revenue YTD"
                value={formatCurrency(kpiData.revenueYTD)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Refunds YTD"
                value={formatCurrency(kpiData.refundsYTD)}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Revenue Monthly Trend" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueMonthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Revenue Daily (Last 30 Days)" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueDaily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#52c41a" name="Daily Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardPage;

