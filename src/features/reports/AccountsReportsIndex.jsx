import React from "react";
import { Card, Row, Col, Button, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ReportsIndex.css";

const { Title } = Typography;

const AccountsReportsIndex = () => {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Creditors List Report",
      description:
        "Members owed money by the organisation — prepayments (2020), credit notes, and net credit balances as at the reporting date",
      icon: <FileTextOutlined style={{ fontSize: "48px" }} />,
      path: "/CreditorsListReport",
      color: "#fa8c16",
    },
    {
      title: "Debtors List Report",
      description:
        "Members with outstanding membership fees as at the reporting date, with age analysis (Current, 30, 60, 90, and Over 90 days)",
      icon: <FileTextOutlined style={{ fontSize: "48px" }} />,
      path: "/DebtorsListReport",
      color: "#cf1322",
    },
  ];

  return (
    <div className="reports-index">
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "32px" }}>
          Accounts Reports
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

export default AccountsReportsIndex;
