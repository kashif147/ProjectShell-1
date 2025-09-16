import React, { useState } from "react";
import { Card, Button, Space, Typography, Table, Tag } from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import ReportViewer from "../component/common/ReportViewer";

const { Title, Text } = Typography;

const ReportViewerDemo = () => {
  const [loading, setLoading] = useState(false);

  // Sample data for demonstration
  const sampleData = [
    {
      key: "1",
      id: "RPT001",
      name: "Monthly Sales Report",
      type: "Sales",
      status: "Active",
      createdDate: "2024-01-15",
      lastModified: "2024-01-20",
      records: 1250,
    },
    {
      key: "2",
      id: "RPT002",
      name: "Customer Analytics",
      type: "Analytics",
      status: "Draft",
      createdDate: "2024-01-10",
      lastModified: "2024-01-18",
      records: 890,
    },
    {
      key: "3",
      id: "RPT003",
      name: "Financial Summary",
      type: "Finance",
      status: "Published",
      createdDate: "2024-01-05",
      lastModified: "2024-01-15",
      records: 2100,
    },
  ];

  const columns = [
    {
      title: "Report ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Report Name",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => {
        const colors = {
          Sales: "blue",
          Analytics: "green",
          Finance: "purple",
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const colors = {
          Active: "green",
          Draft: "orange",
          Published: "blue",
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
    },
    {
      title: "Last Modified",
      dataIndex: "lastModified",
      key: "lastModified",
      width: 120,
    },
    {
      title: "Records",
      dataIndex: "records",
      key: "records",
      width: 100,
      render: (records) => records.toLocaleString(),
    },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleCustomAction = () => {
    console.log("Custom action triggered");
  };

  const customActions = [
    {
      label: "Custom Action",
      icon: <BarChartOutlined />,
      onClick: handleCustomAction,
      type: "dashed",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Report Viewer Demo</Title>
      <Text
        type="secondary"
        style={{ fontSize: 16, marginBottom: 24, display: "block" }}
      >
        This demonstrates the embedded ReportViewer component with various
        features
      </Text>

      <ReportViewer
        title="Sample Reports Dashboard"
        subtitle="Interactive report management and viewing system"
        data={sampleData}
        columns={columns}
        loading={loading}
        onRefresh={handleRefresh}
        reportType="dashboard"
        customActions={customActions}
        showFullscreen={true}
        showExport={true}
        showPrint={true}
        showRefresh={true}
      >
        <Card title="Report Statistics" style={{ marginBottom: 16 }}>
          <Space size="large">
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                {sampleData.length}
              </Title>
              <Text type="secondary">Total Reports</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "#52c41a", margin: 0 }}>
                {sampleData.filter((r) => r.status === "Active").length}
              </Title>
              <Text type="secondary">Active Reports</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "#faad14", margin: 0 }}>
                {sampleData
                  .reduce((sum, r) => sum + r.records, 0)
                  .toLocaleString()}
              </Title>
              <Text type="secondary">Total Records</Text>
            </div>
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={sampleData}
          pagination={false}
          size="small"
          bordered
        />
      </ReportViewer>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Report Viewer Features</Title>
        <ul>
          <li>
            <strong>Export Options:</strong> PDF, Excel export functionality
          </li>
          <li>
            <strong>Print Support:</strong> Print-friendly formatting
          </li>
          <li>
            <strong>Fullscreen Mode:</strong> Toggle fullscreen viewing
          </li>
          <li>
            <strong>Refresh Data:</strong> Real-time data refresh capability
          </li>
          <li>
            <strong>Custom Actions:</strong> Add custom action buttons
          </li>
          <li>
            <strong>Settings Drawer:</strong> Quick access to report settings
          </li>
          <li>
            <strong>Responsive Design:</strong> Works on all screen sizes
          </li>
          <li>
            <strong>Loading States:</strong> Built-in loading indicators
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ReportViewerDemo;
