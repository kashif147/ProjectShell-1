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
      title: "Membership Listing Report",
      description:
        "Filterable membership listing with executive dashboard dimensions and date range",
      icon: <FileTextOutlined style={{ fontSize: "48px" }} />,
      path: "/MembershipListingReport",
      color: "#722ed1",
    },
    {
      title: "Statistics Report",
      description:
        "Year membership movement: opening, joiners, reinstatements, leavers, closing — by Membership Category and region, branch and work location",
      icon: <BarChartOutlined style={{ fontSize: "48px" }} />,
      path: "/StatisticsReport",
      color: "#13c2c2",
    },
    {
      title: "Workplace Membership Breakdown",
      description:
        "Rolling monthly member counts per work location with MoM change and official assignment",
      icon: <BarChartOutlined style={{ fontSize: "48px" }} />,
      path: "/WorkplaceBreakdownReport",
      color: "#2f54eb",
    },
  ];

  return (
    <div className="reports-index">
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "32px" }}>
          Membership Reports
        </Title>

        <Row gutter={[24, 24]}>
          {reportCards.map((report, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                className="report-card"
                onClick={() =>
                  navigate(report.path, { state: { search: report.title } })
                }
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
                <Button
                  type="primary"
                  style={{ backgroundColor: report.color }}
                >
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
