import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Button,
  Spin,
  Table,
  Space,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  DollarOutlined,
  GiftOutlined,
  BookOutlined,
  ExpandOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
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
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  DoughnutChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import membershipDashboardAPI from "../../services/membershipDashboardAPI";
import "../../styles/MembershipDashboard.css";

const MembershipDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [backupModal, setBackupModal] = useState({
    visible: false,
    data: [],
    title: "",
    loading: false,
  });

  // Helper function to calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Helper function to format comparison data
  const formatComparisonData = (current, previous, label) => {
    const change = calculatePercentageChange(current, previous);
    const isPositive = change >= 0;
    return (
      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
        <div>
          <span style={{ color: "#1890ff", fontWeight: 500 }}>YTD:</span>{" "}
          {current || 0} vs LY: {previous || 0}
          {change !== 0 && (
            <span
              style={{
                color: isPositive ? "#52c41a" : "#ff4d4f",
                marginLeft: "4px",
              }}
            >
              ({isPositive ? "+" : ""}
              {change}%)
            </span>
          )}
        </div>
      </div>
    );
  };

  // Helper function to handle backup data fetching
  const handleBackupClick = async (type, period = "current") => {
    setBackupModal({
      visible: true,
      data: [],
      title: `${type} - ${period}`,
      loading: true,
    });

    try {
      // Mock data - replace with actual API call
      const mockData = generateMockBackupData(type, period);
      setBackupModal((prev) => ({ ...prev, data: mockData, loading: false }));
    } catch (error) {
      console.error("Error fetching backup data:", error);
      setBackupModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Generate mock backup data
  const generateMockBackupData = (type, period) => {
    const baseData = {
      "Total Active Members": [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          joinDate: "2023-01-15",
          status: "Active",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          joinDate: "2023-02-20",
          status: "Active",
        },
        {
          id: 3,
          name: "Bob Johnson",
          email: "bob@example.com",
          joinDate: "2023-03-10",
          status: "Active",
        },
      ],
      "New Joiners": [
        {
          id: 1,
          name: "Alice Brown",
          email: "alice@example.com",
          joinDate: "2024-01-15",
          status: "New",
        },
        {
          id: 2,
          name: "Charlie Wilson",
          email: "charlie@example.com",
          joinDate: "2024-01-20",
          status: "New",
        },
      ],
      Leavers: [
        {
          id: 1,
          name: "David Lee",
          email: "david@example.com",
          leaveDate: "2024-01-10",
          reason: "Resignation",
        },
        {
          id: 2,
          name: "Eva Garcia",
          email: "eva@example.com",
          leaveDate: "2024-01-15",
          reason: "Retirement",
        },
      ],
      "Paid Members": [
        {
          id: 1,
          name: "Frank Miller",
          email: "frank@example.com",
          membershipType: "Paid",
          amount: 150,
        },
        {
          id: 2,
          name: "Grace Taylor",
          email: "grace@example.com",
          membershipType: "Paid",
          amount: 150,
        },
      ],
      "Honorary Members": [
        {
          id: 1,
          name: "Henry Davis",
          email: "henry@example.com",
          membershipType: "Honorary",
          awardedDate: "2023-06-01",
        },
        {
          id: 2,
          name: "Ivy Martinez",
          email: "ivy@example.com",
          membershipType: "Honorary",
          awardedDate: "2023-08-15",
        },
      ],
      "Student Members": [
        {
          id: 1,
          name: "Jack Anderson",
          email: "jack@example.com",
          membershipType: "Student",
          institution: "University College",
        },
        {
          id: 2,
          name: "Kate Thompson",
          email: "kate@example.com",
          membershipType: "Student",
          institution: "Trinity College",
        },
      ],
    };

    return baseData[type] || [];
  };

  // Export functionality
  const handleExport = (data, title) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}_backup.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          stats,
          categoryData,
          gradeData,
          sectionData,
          branchData,
          regionData,
          workLocationData,
        ] = await Promise.all([
          membershipDashboardAPI.getDashboardStats(),
          membershipDashboardAPI.getMembershipByCategory(),
          membershipDashboardAPI.getMembershipByGrade(),
          membershipDashboardAPI.getMembershipBySection(),
          membershipDashboardAPI.getMembershipByBranch(),
          membershipDashboardAPI.getMembershipByRegion(),
          membershipDashboardAPI.getMembershipByWorkLocation(),
        ]);

        setDashboardData({
          ...stats,
          categoryData,
          gradeData,
          sectionData,
          branchData,
          regionData,
          workLocationData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleChartExpand = (chartType) => {
    setExpandedChart(chartType);
  };

  const handleChartClose = () => {
    setExpandedChart(null);
  };

  const renderChartCard = (
    title,
    icon,
    data,
    chartType,
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]
  ) => {
    const isExpanded = expandedChart === chartType;

    const renderChart = () => {
      switch (chartType) {
        case "category":
          return (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name}\n${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={isExpanded ? 120 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          );

        case "grade":
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Bar
                dataKey="count"
                fill="#8884d8"
                label={{ position: "top", fill: "#666", fontSize: 12 }}
              />
            </BarChart>
          );

        case "section":
          return (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                label={{ position: "top", fill: "#666", fontSize: 12 }}
              />
            </AreaChart>
          );

        case "branch":
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                label={{ position: "top", fill: "#666", fontSize: 12 }}
              />
            </LineChart>
          );

        case "region":
          return (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={isExpanded ? 60 : 40}
                outerRadius={isExpanded ? 120 : 80}
                paddingAngle={5}
                dataKey="count"
                label={({ name, count, percent }) =>
                  `${name}\n${count} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          );

        case "workLocation":
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Bar
                dataKey="count"
                fill="#8884d8"
                label={{ position: "top", fill: "#666", fontSize: 12 }}
              />
            </BarChart>
          );

        default:
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Bar
                dataKey="count"
                fill="#8884d8"
                label={{ position: "top", fill: "#666", fontSize: 12 }}
              />
            </BarChart>
          );
      }
    };

    return (
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {icon}
            <span>{title}</span>
          </div>
        }
        extra={
          <Button
            type="text"
            icon={<ExpandOutlined />}
            onClick={() => handleChartExpand(chartType)}
            size="small"
          />
        }
        style={{ height: isExpanded ? "auto" : "400px" }}
        className="dashboard-card"
      >
        <div style={{ height: isExpanded ? "500px" : "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </Card>
    );
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
    <div className="membership-dashboard">
      {/* Breadcrumb */}

      <div style={{ padding: "24px", minHeight: "100vh" }}>
        <h1
          style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "bold" }}
        >
          Membership Dashboard
        </h1>

        {/* Main Statistics Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    Total Active Members
                  </span>
                }
                value={dashboardData.totalActive}
                prefix={
                  <UserOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#3f8600",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("Total Active Members")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {dashboardData.totalActiveYTD || 0} vs LY:{" "}
                      {dashboardData.totalActiveLY || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.totalActiveYTD,
                          dashboardData.totalActiveLY
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {dashboardData.totalActiveThisMonth || 0} vs LM:{" "}
                      {dashboardData.totalActiveLastMonth || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.totalActiveThisMonth,
                          dashboardData.totalActiveLastMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    New Joiners
                  </span>
                }
                value={dashboardData.newJoiners}
                prefix={
                  <UsergroupAddOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("New Joiners")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {dashboardData.newJoinersYTD || 0} vs LY:{" "}
                      {dashboardData.newJoinersLY || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.newJoinersYTD,
                          dashboardData.newJoinersLY
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {dashboardData.newJoinersThisMonth || 0} vs LM:{" "}
                      {dashboardData.newJoinersLastMonth || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.newJoinersThisMonth,
                          dashboardData.newJoinersLastMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    Leavers
                  </span>
                }
                value={dashboardData.leavers}
                prefix={
                  <UsergroupDeleteOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#cf1322",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("Leavers")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {dashboardData.leaversYTD || 0} vs LY:{" "}
                      {dashboardData.leaversLY || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.leaversYTD,
                          dashboardData.leaversLY
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#ff4d4f" : "#52c41a",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {dashboardData.leaversThisMonth || 0} vs LM:{" "}
                      {dashboardData.leaversLastMonth || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.leaversThisMonth,
                          dashboardData.leaversLastMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#ff4d4f" : "#52c41a",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    Net Growth
                  </span>
                }
                value={dashboardData.newJoiners - dashboardData.leavers}
                prefix={
                  <TeamOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#722ed1",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("Net Growth")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {(dashboardData.newJoinersYTD || 0) -
                        (dashboardData.leaversYTD || 0)}{" "}
                      vs LY:{" "}
                      {(dashboardData.newJoinersLY || 0) -
                        (dashboardData.leaversLY || 0)}
                      {(() => {
                        const currentYTD =
                          (dashboardData.newJoinersYTD || 0) -
                          (dashboardData.leaversYTD || 0);
                        const previousYTD =
                          (dashboardData.newJoinersLY || 0) -
                          (dashboardData.leaversLY || 0);
                        const change = calculatePercentageChange(
                          currentYTD,
                          previousYTD
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {(dashboardData.newJoinersThisMonth || 0) -
                        (dashboardData.leaversThisMonth || 0)}{" "}
                      vs LM:{" "}
                      {(dashboardData.newJoinersLastMonth || 0) -
                        (dashboardData.leaversLastMonth || 0)}
                      {(() => {
                        const currentMonth =
                          (dashboardData.newJoinersThisMonth || 0) -
                          (dashboardData.leaversThisMonth || 0);
                        const previousMonth =
                          (dashboardData.newJoinersLastMonth || 0) -
                          (dashboardData.leaversLastMonth || 0);
                        const change = calculatePercentageChange(
                          currentMonth,
                          previousMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "4px",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Membership Type Distribution */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} md={8}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    Paid Members
                  </span>
                }
                value={dashboardData.paidMembers}
                prefix={
                  <DollarOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#3f8600",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("Paid Members")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {dashboardData.paidMembersYTD || 0} vs LY:{" "}
                      {dashboardData.paidMembersLY || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.paidMembersYTD,
                          dashboardData.paidMembersLY
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {dashboardData.paidMembersThisMonth || 0} vs LM:{" "}
                      {dashboardData.paidMembersLastMonth || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.paidMembersThisMonth,
                          dashboardData.paidMembersLastMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "4px",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    Honorary Members
                  </span>
                }
                value={dashboardData.honoraryMembers}
                prefix={
                  <GiftOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("Honorary Members")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {dashboardData.honoraryMembersYTD || 0} vs LY:{" "}
                      {dashboardData.honoraryMembersLY || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.honoraryMembersYTD,
                          dashboardData.honoraryMembersLY
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {dashboardData.honoraryMembersThisMonth || 0} vs LM:{" "}
                      {dashboardData.honoraryMembersLastMonth || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.honoraryMembersThisMonth,
                          dashboardData.honoraryMembersLastMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "4px",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={{ height: "180px", borderRadius: "12px" }}>
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#262626",
                    }}
                  >
                    Student Members
                  </span>
                }
                value={dashboardData.studentMembers}
                prefix={
                  <BookOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                }
                valueStyle={{
                  color: "#722ed1",
                  fontSize: "32px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onValueClick={() => handleBackupClick("Student Members")}
                suffix={
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#1890ff", fontWeight: 500 }}>
                        YTD:
                      </span>{" "}
                      {dashboardData.studentMembersYTD || 0} vs LY:{" "}
                      {dashboardData.studentMembersLY || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.studentMembersYTD,
                          dashboardData.studentMembersLY
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "6px",
                                fontWeight: "500",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: "#52c41a", fontWeight: 500 }}>
                        This Month:
                      </span>{" "}
                      {dashboardData.studentMembersThisMonth || 0} vs LM:{" "}
                      {dashboardData.studentMembersLastMonth || 0}
                      {(() => {
                        const change = calculatePercentageChange(
                          dashboardData.studentMembersThisMonth,
                          dashboardData.studentMembersLastMonth
                        );
                        return (
                          change !== 0 && (
                            <span
                              style={{
                                color: change >= 0 ? "#52c41a" : "#ff4d4f",
                                marginLeft: "4px",
                              }}
                            >
                              ({change >= 0 ? "+" : ""}
                              {change}%)
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row 1 */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={12}>
            {renderChartCard(
              "Membership by Category",
              <UserOutlined />,
              dashboardData.categoryData,
              "category",
              ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]
            )}
          </Col>
          <Col xs={24} lg={12}>
            {renderChartCard(
              "Membership by Grade",
              <TeamOutlined />,
              dashboardData.gradeData.slice(0, 10),
              "grade"
            )}
          </Col>
        </Row>

        {/* Charts Row 2 */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={12}>
            {renderChartCard(
              "Membership by Section",
              <UserOutlined />,
              dashboardData.sectionData.slice(0, 10),
              "section"
            )}
          </Col>
          <Col xs={24} lg={12}>
            {renderChartCard(
              "Membership by Branch",
              <TeamOutlined />,
              dashboardData.branchData.slice(0, 10),
              "branch"
            )}
          </Col>
        </Row>

        {/* Charts Row 3 */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={12}>
            {renderChartCard(
              "Membership by Region",
              <UserOutlined />,
              dashboardData.regionData,
              "region",
              ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"]
            )}
          </Col>
          <Col xs={24} lg={12}>
            {renderChartCard(
              "Membership by Work Location",
              <TeamOutlined />,
              dashboardData.workLocationData,
              "workLocation",
              ["#8884d8", "#82ca9d", "#ffc658"]
            )}
          </Col>
        </Row>

        {/* Add bottom padding for better scrolling experience */}
        <div style={{ height: "100px" }}></div>
      </div>

      {/* Backup Data Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EyeOutlined />
            <span>{backupModal.title} - Detailed List</span>
          </div>
        }
        open={backupModal.visible}
        onCancel={() =>
          setBackupModal({
            visible: false,
            data: [],
            title: "",
            loading: false,
          })
        }
        footer={[
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(backupModal.data, backupModal.title)}
            disabled={!backupModal.data || backupModal.data.length === 0}
          >
            Export CSV
          </Button>,
          <Button
            key="close"
            onClick={() =>
              setBackupModal({
                visible: false,
                data: [],
                title: "",
                loading: false,
              })
            }
          >
            Close
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
      >
        {backupModal.loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>Loading data...</div>
          </div>
        ) : (
          <Table
            dataSource={backupModal.data}
            columns={
              backupModal.data.length > 0
                ? Object.keys(backupModal.data[0]).map((key) => ({
                    title:
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1"),
                    dataIndex: key,
                    key: key,
                    sorter: (a, b) => {
                      if (typeof a[key] === "string") {
                        return a[key].localeCompare(b[key]);
                      }
                      return a[key] - b[key];
                    },
                  }))
                : []
            }
            pagination={{
              pageSize: 100,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["50", "100", "200", "500"],
              defaultPageSize: 100,
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        )}
      </Modal>

      {/* Expanded Chart Modal */}
      <Modal
        title={`${
          expandedChart
            ? expandedChart.charAt(0).toUpperCase() + expandedChart.slice(1)
            : ""
        } - Full View`}
        open={!!expandedChart}
        onCancel={handleChartClose}
        footer={[
          <Button key="close" onClick={handleChartClose}>
            Close
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
      >
        {expandedChart && (
          <div style={{ height: "600px" }}>
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const data = dashboardData[`${expandedChart}Data`];
                const colors = [
                  "#8884d8",
                  "#82ca9d",
                  "#ffc658",
                  "#ff7300",
                  "#00ff00",
                ];

                switch (expandedChart) {
                  case "category":
                    return (
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) =>
                            `${name}\n${value} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={200}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    );

                  case "grade":
                    return (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          label={{
                            position: "top",
                            fill: "#666",
                            fontSize: 14,
                          }}
                        />
                      </BarChart>
                    );

                  case "section":
                    return (
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                          label={{
                            position: "top",
                            fill: "#666",
                            fontSize: 14,
                          }}
                        />
                      </AreaChart>
                    );

                  case "branch":
                    return (
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          strokeWidth={3}
                          dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                          label={{
                            position: "top",
                            fill: "#666",
                            fontSize: 14,
                          }}
                        />
                      </LineChart>
                    );

                  case "region":
                    return (
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={100}
                          outerRadius={200}
                          paddingAngle={5}
                          dataKey="count"
                          label={({ name, count, percent }) =>
                            `${name}\n${count} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    );

                  case "workLocation":
                    return (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          label={{
                            position: "top",
                            fill: "#666",
                            fontSize: 14,
                          }}
                        />
                      </BarChart>
                    );

                  default:
                    return (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          label={{
                            position: "top",
                            fill: "#666",
                            fontSize: 14,
                          }}
                        />
                      </BarChart>
                    );
                }
              })()}
            </ResponsiveContainer>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MembershipDashboard;
