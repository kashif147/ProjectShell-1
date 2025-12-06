import React from "react";
import { Card, Row, Col, Button, Typography } from "antd";
import { FileTextOutlined, BarChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ReportsIndex.css";

const { Title } = Typography;

const ReportsIndex = () => {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Cancelled Members Report",
      description: "View and export cancelled members data",
      icon: <FileTextOutlined style={{ fontSize: "48px" }} />,
      path: "/CancelledMembersReport",
      color: "#1890ff",
    },
    {
      title: "Report Viewer",
      description: "View and manage various reports",
      icon: <BarChartOutlined style={{ fontSize: "48px" }} />,
      path: "/ReportViewerDemo",
      color: "#52c41a",
    },
  ];

  return (
    <div className="reports-index">
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "32px" }}>
          Reports
        </Title>

        <Row gutter={[24, 24]}>
          {reportCards.map((report, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                className="report-card"
                onClick={() => navigate(report.path)}
                style={{
                  height: "100%",
                  textAlign: "center",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    color: report.color,
                    marginBottom: "16px",
                  }}
                >
                  {report.icon}
                </div>
                <Title level={4} style={{ marginBottom: "8px" }}>
                  {report.title}
                </Title>
                <p style={{ color: "#666", marginBottom: "16px" }}>
                  {report.description}
                </p>
                <Button type="primary" style={{ backgroundColor: report.color }}>
                  Open Report
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ReportsIndex;

