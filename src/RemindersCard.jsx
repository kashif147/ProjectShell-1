import React from "react";
import { Card, Button, Tag } from "antd";
import { CalendarOutlined, UserOutlined, BarChartOutlined } from "@ant-design/icons";
import BatchDrawer from "./component/reminders/BatchDrawer";
import { useState } from "react";
import { useView } from "./context/ViewContext";

const campaigns = [
  {
    title: "Monthly Payment Reminders December 2024",
    date: "2024-12-15",
    user: "John Smith",
    selected: false,
    stats: { R1: 245, R2: 128, R3: 67 },
  },
  {
    title: "Quarterly Invoice Reminders - Q4 2024",
    date: "2024-12-10",
    user: "Sarah Johnson",
    selected: true,
    stats: { R1: 180, R2: 95, R3: 42 },
    triggered: "2024-12-10 14:30:00",
  },
  {
    title: "Overdue Account Notifications",
    date: "2024-12-08",
    user: "Mike Davis",
    selected: false,
    stats: { R1: 85, R2: 52, R3: 28 },
  },
  {
    title: "Overdue Account Notifications",
    date: "2024-12-08",
    user: "Mike Davis",
    selected: false,
    stats: { R1: 85, R2: 52, R3: 28 },
  },
];

const RemindersCard = () => {
  const [isbatchOpen, setisbatchOpen] = useState(false);
  return (
    <div className="mt-4">
      <div className="row">
        {campaigns.map((item, index) => (
          <div key={index} className="col-md-3 mb-4">
            <Card
              className="shadow-sm"
              bordered
              headStyle={{
                padding: "8px 12px",
                backgroundColor: item.triggered ? "#adf368ff" : "#f5f5f5", // 👈 header bg only
              }}
              bodyStyle={{ padding: "12px" }}
              title={
                <div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "13px" }}>{item.title}</span>
                  <Tag color={item.selected ? "blue" : "default"}>
                    {item.selected ? "Selected" : "Unselected"}
                  </Tag>
                </div>
                  {
                    item?.triggered &&
                    <p style={{ fontSize: "11px", margin:'0px' }}>{`${item?.triggered} Jack Smith`}</p>
                  }

                </div>
              }
            >
              <div className="d-flex mb-3 text-muted" style={{ fontSize: "14px" }}>
                <CalendarOutlined className="me-2" /> {item.date}
                <span className="ms-3">
                  <UserOutlined className="me-2" /> {item.user}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="text-center bg-light p-2 rounded flex-fill me-2">
                  <div className="fw-bold text-primary">{item.stats.R1}</div>
                  <small className="text-muted">R1</small>
                </div>
                <div className="text-center bg-light p-2 rounded flex-fill me-2" style={{ backgroundColor: "#f6fff6" }}>
                  <div className="fw-bold text-success">{item.stats.R2}</div>
                  <small className="text-muted">R2</small>
                </div>
                <div className="text-center bg-light p-2 rounded flex-fill" style={{ backgroundColor: "#fffaf6" }}>
                  <div className="fw-bold text-warning">{item.stats.R3}</div>
                  <small className="text-muted">R3</small>
                </div>
              </div>
              <Button className="primary-btn"  onClick={() => setisbatchOpen(!isbatchOpen)} block icon={<BarChartOutlined />}>
                View Details
              </Button>
            </Card>
          </div>
        ))}
      </div>
      <BatchDrawer open={isbatchOpen} onClose={() => setisbatchOpen(!isbatchOpen)} />
    </div>
  );
};

export default RemindersCard;
