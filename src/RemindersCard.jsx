import React from "react";
import { Card, Button, Tag } from "antd";
import { CalendarOutlined, UserOutlined, BarChartOutlined } from "@ant-design/icons";


const campaigns = [
  {
    title: "Monthly Payment Reminders - December 2024",
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
];

const RemindersCard = () => {
  return (
    <div className="mt-4">
      <div className="row">
        {campaigns.map((item, index) => (
          <div key={index} className="col-md-4 mb-4">
            <Card
              className="shadow-sm"
              bordered
              title={
                <div className="d-flex justify-content-between align-items-center">
                  <span>{item.title}</span>
                  <Tag color={item.selected ? "blue" : "default"}>
                    {item.selected ? "Selected" : "Unselected"}
                  </Tag>
                </div>
              }
            >
              {/* Date + User */}
              <div className="d-flex mb-3 text-muted" style={{ fontSize: "14px" }}>
                <CalendarOutlined className="me-2" /> {item.date}
                <span className="ms-3">
                  <UserOutlined className="me-2" /> {item.user}
                </span>
              </div>

              {/* Stats */}
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

              {/* Triggered Info */}
              {item.triggered && (
                <div className="p-2 mb-3 rounded text-center" style={{ backgroundColor: "#eaffea" }}>
                  <small className="text-success">
                    Triggered at {item.triggered} <br /> by {item.user}
                  </small>
                </div>
              )}

              {/* View Details */}
              <Button type="primary" block icon={<BarChartOutlined />}>
                View Details
              </Button>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemindersCard;
