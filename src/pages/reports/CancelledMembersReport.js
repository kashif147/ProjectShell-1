import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  Spin,
  Statistic,
  Progress,
  Badge,
  Tooltip,
  Collapse,
  Tabs,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  UserDeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import ReportViewer from "../../component/common/ReportViewer";
import "../../styles/CancelledMembersReport.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

function CancelledMembersReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample data - replace with actual API call
  const sampleData = [
    {
      key: "1",
      membershipNo: "MEM001",
      fullName: "John Doe",
      email: "john.doe@email.com",
      mobileNo: "+1234567890",
      membershipStatus: "Cancelled",
      membershipCategory: "Regular",
      workLocation: "Dublin",
      branch: "Main Branch",
      region: "Leinster",
      grade: "Senior",
      section: "Operations",
      joiningDate: "2020-01-15",
      expiryDate: "2024-01-15",
      lastPaymentAmount: "€150.00",
      lastPaymentDate: "2023-12-15",
      membershipFee: "€150.00",
      outstandingBalance: "€0.00",
      reminderNo: "REM001",
      reminderDate: "2023-11-15",
      cancellationFlag: true,
      cancellationDate: "2024-01-10",
      cancellationReason: "Voluntary",
    },
    {
      key: "2",
      membershipNo: "MEM002",
      fullName: "Jane Smith",
      email: "jane.smith@email.com",
      mobileNo: "+1234567891",
      membershipStatus: "Cancelled",
      membershipCategory: "Premium",
      workLocation: "Cork",
      branch: "Cork Branch",
      region: "Munster",
      grade: "Manager",
      section: "Finance",
      joiningDate: "2019-06-20",
      expiryDate: "2023-06-20",
      lastPaymentAmount: "€200.00",
      lastPaymentDate: "2023-05-20",
      membershipFee: "€200.00",
      outstandingBalance: "€50.00",
      reminderNo: "REM002",
      reminderDate: "2023-04-20",
      cancellationFlag: true,
      cancellationDate: "2023-06-15",
      cancellationReason: "Non-payment",
    },
    {
      key: "3",
      membershipNo: "MEM003",
      fullName: "Michael Johnson",
      email: "michael.johnson@email.com",
      mobileNo: "+1234567892",
      membershipStatus: "Cancelled",
      membershipCategory: "Student",
      workLocation: "Galway",
      branch: "Galway Branch",
      region: "Connacht",
      grade: "Junior",
      section: "IT",
      joiningDate: "2021-03-10",
      expiryDate: "2024-03-10",
      lastPaymentAmount: "€75.00",
      lastPaymentDate: "2023-02-10",
      membershipFee: "€75.00",
      outstandingBalance: "€25.00",
      reminderNo: "REM003",
      reminderDate: "2023-01-10",
      cancellationFlag: true,
      cancellationDate: "2023-03-05",
      cancellationReason: "Graduation",
    },
  ];

  // Initialize data
  useEffect(() => {
    setData(sampleData);
    setFilteredData(sampleData);
  }, []);

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = data;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.membershipNo.toLowerCase().includes(searchText.toLowerCase()) ||
          item.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (item) => item.membershipStatus === selectedStatus
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.membershipCategory === selectedCategory
      );
    }

    // Date range filter
    if (selectedDateRange && selectedDateRange.length === 2) {
      const [startDate, endDate] = selectedDateRange;
      filtered = filtered.filter((item) => {
        const cancellationDate = moment(item.cancellationDate);
        return cancellationDate.isBetween(startDate, endDate, "day", "[]");
      });
    }

    setFilteredData(filtered);
  }, [data, searchText, selectedStatus, selectedCategory, selectedDateRange]);

  // Calculate statistics
  const totalOutstandingBalance = filteredData.reduce(
    (sum, item) =>
      sum +
      parseFloat(item.outstandingBalance.replace("€", "").replace(",", "")),
    0
  );

  const averageMembershipFee =
    filteredData.length > 0
      ? filteredData.reduce(
          (sum, item) =>
            sum +
            parseFloat(item.membershipFee.replace("€", "").replace(",", "")),
          0
        ) / filteredData.length
      : 0;

  const cancellationRate =
    filteredData.length > 0
      ? (filteredData.filter((item) => item.outstandingBalance !== "€0.00")
          .length /
          filteredData.length) *
        100
      : 0;

  // Chart data
  const monthlyCancellations = [
    { month: "Jan", cancelled: 5 },
    { month: "Feb", cancelled: 8 },
    { month: "Mar", cancelled: 12 },
    { month: "Apr", cancelled: 7 },
    { month: "May", cancelled: 15 },
    { month: "Jun", cancelled: 9 },
  ];

  const cancellationReasons = [
    { name: "Voluntary", value: 45 },
    { name: "Non-payment", value: 30 },
    { name: "Graduation", value: 15 },
    { name: "Other", value: 10 },
  ];

  const cancellationTrend = [
    { month: "Jan", cancelled: 5 },
    { month: "Feb", cancelled: 8 },
    { month: "Mar", cancelled: 12 },
    { month: "Apr", cancelled: 7 },
    { month: "May", cancelled: 15 },
    { month: "Jun", cancelled: 9 },
  ];

  const COLORS = ["#ff4d4f", "#1890ff", "#52c41a", "#faad14", "#722ed1"];

  // Table columns
  const columns = [
    {
      title: "Membership No",
      dataIndex: "membershipNo",
      key: "membershipNo",
      width: 120,
      fixed: "left",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      fixed: "left",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
      width: 130,
    },
    {
      title: "Status",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      width: 100,
      render: (status) => (
        <Badge
          status={status === "Cancelled" ? "error" : "success"}
          text={status}
        />
      ),
    },
    {
      title: "Category",
      dataIndex: "membershipCategory",
      key: "membershipCategory",
      width: 100,
    },
    {
      title: "Work Location",
      dataIndex: "workLocation",
      key: "workLocation",
      width: 120,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 120,
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 100,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: 80,
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      width: 100,
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      key: "joiningDate",
      width: 110,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 110,
    },
    {
      title: "Last Payment Amount",
      dataIndex: "lastPaymentAmount",
      key: "lastPaymentAmount",
      width: 150,
    },
    {
      title: "Last Payment Date",
      dataIndex: "lastPaymentDate",
      key: "lastPaymentDate",
      width: 130,
    },
    {
      title: "Membership Fee",
      dataIndex: "membershipFee",
      key: "membershipFee",
      width: 120,
    },
    {
      title: "Outstanding Balance",
      dataIndex: "outstandingBalance",
      key: "outstandingBalance",
      width: 140,
      render: (balance) => (
        <span
          style={{
            color: balance === "€0.00" ? "#52c41a" : "#ff4d4f",
            fontWeight: "bold",
          }}
        >
          {balance}
        </span>
      ),
    },
    {
      title: "Reminder No",
      dataIndex: "reminderNo",
      key: "reminderNo",
      width: 100,
    },
    {
      title: "Reminder Date",
      dataIndex: "reminderDate",
      key: "reminderDate",
      width: 110,
    },
    {
      title: "Cancellation Date",
      dataIndex: "cancellationDate",
      key: "cancellationDate",
      width: 130,
    },
    {
      title: "Cancellation Reason",
      dataIndex: "cancellationReason",
      key: "cancellationReason",
      width: 150,
    },
  ];

  // Export functions
  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      doc.text("Cancelled Members Report", 20, 20);
      doc.text(
        `Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        20,
        30
      );
      doc.text(`Total Records: ${filteredData.length}`, 20, 40);

      doc.autoTable({
        head: [columns.map((col) => col.title)],
        body: filteredData.map((item) =>
          columns.map((col) => item[col.dataIndex])
        ),
        startY: 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [33, 94, 151] },
      });

      doc.save(`cancelled_members_report_${moment().format("YYYY-MM-DD")}.pdf`);
      message.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      message.error("Failed to export PDF");
    }
  };

  const exportToExcel = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cancelled Members");
      XLSX.writeFile(
        workbook,
        `cancelled_members_report_${moment().format("YYYY-MM-DD")}.xlsx`
      );
      message.success("Excel file exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      message.error("Failed to export Excel file");
    }
  };

  const printReport = async () => {
    try {
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      message.error("Failed to print report");
    }
  };

  // Custom export functions for the ReportViewer
  const handleExportPDF = async () => {
    await exportToPDF();
  };

  const handleExportExcel = async () => {
    await exportToExcel();
  };

  const handlePrint = async () => {
    await printReport();
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success("Data refreshed successfully");
    }, 1000);
  };

  // Render the dashboard content
  const renderDashboardContent = () => (
    <Tabs defaultActiveKey="dashboard" className="report-tabs">
      <TabPane tab="Dashboard" key="dashboard">
        {/* KPI Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card">
              <Statistic
                title="Total Cancelled"
                value={filteredData.length}
                prefix={<UserDeleteOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card">
              <Statistic
                title="Outstanding Balance"
                value={totalOutstandingBalance}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card">
              <Statistic
                title="Avg. Membership Fee"
                value={averageMembershipFee}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#52c41a" }}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card">
              <Statistic
                title="Cancellation Rate"
                value={cancellationRate}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: "#1890ff" }}
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card className="chart-card" title="Cancellations by Month">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyCancellations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="cancelled" fill="#ff4d4f" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card className="chart-card" title="Cancellation Reasons">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cancellationReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cancellationReasons.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card className="chart-card" title="Cancellation Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cancellationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#ff4d4f"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </TabPane>

      <TabPane tab="Data View" key="data">
        {/* Data Table */}
        <Spin spinning={loading}>
          <Table
            className="report-table"
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 2000, y: 600 }}
            pagination={{
              pageSize: 100,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["50", "100", "200", "500"],
              defaultPageSize: 100,
            }}
            bordered
            size="small"
            title={() => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong style={{ fontSize: "16px" }}>
                  Cancelled Members Detail View
                </Text>
                <Space>
                  <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={handleExportPDF}
                    size="small"
                  >
                    Export PDF
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    size="small"
                  >
                    Print
                  </Button>
                </Space>
              </div>
            )}
          />
        </Spin>
      </TabPane>
    </Tabs>
  );

  return (
    <div className="cancelled-members-report">
      <ReportViewer
        title="Cancelled Members Report"
        subtitle="Comprehensive analysis of cancelled membership data"
        data={filteredData}
        columns={columns}
        loading={loading}
        onRefresh={handleRefresh}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        reportType="cancelled-members"
        className="cancelled-members-report-viewer"
      >
        {/* Filters */}
        <Card
          className="filters-card"
          title="Filters"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Search members..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <RangePicker
                placeholder={["Start Date", "End Date"]}
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Select Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: "100%" }}
              >
                <Option value="all">All Status</Option>
                <Option value="Cancelled">Cancelled</Option>
                <Option value="Active">Active</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Select Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: "100%" }}
              >
                <Option value="all">All Categories</Option>
                <Option value="Regular">Regular</Option>
                <Option value="Premium">Premium</Option>
                <Option value="Student">Student</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Report Content */}
        {renderDashboardContent()}
      </ReportViewer>
    </div>
  );
}

export default CancelledMembersReport;
