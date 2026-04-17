import React from "react";
import { Card, Col, Progress, Row, Tag } from "antd";
import MyTable from "../../component/common/MyTable";

function EventsDashboard() {
  const kpis = [
    { title: "Total Events/Courses", value: 42, subtitle: "Across current year" },
    { title: "Upcoming Active", value: 16, subtitle: "Next 90 days" },
    { title: "Total Attendees", value: 1284, subtitle: "Registered" },
    { title: "Revenue", value: "EUR 142,560", subtitle: "Collected fees" },
  ];

  const upcoming = [
    { key: "1", event: "Annual Nursing Conference", type: "Event", date: "2026-07-20", attendees: 210, status: "Active" },
    { key: "2", event: "Advanced Clinical Skills", type: "Course", date: "2026-08-04", attendees: 145, status: "Active" },
    { key: "3", event: "Infection Control Essentials", type: "Course", date: "2026-08-21", attendees: 98, status: "Planning" },
  ];

  const attendeeByStatus = [
    { key: "1", status: "Registered", count: 1098, percent: 86 },
    { key: "2", status: "Pending", count: 124, percent: 10 },
    { key: "3", status: "Cancelled", count: 62, percent: 4 },
  ];

  const eventColumns = [
    { title: "EVENT/COURSE", dataIndex: "event", key: "event" },
    { title: "TYPE", dataIndex: "type", key: "type" },
    { title: "DATE", dataIndex: "date", key: "date" },
    { title: "ATTENDEES", dataIndex: "attendees", key: "attendees" },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "Active" ? "green" : "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const statusColumns = [
    { title: "REGISTRATION STATUS", dataIndex: "status", key: "status" },
    { title: "COUNT", dataIndex: "count", key: "count" },
    {
      title: "DISTRIBUTION",
      dataIndex: "percent",
      key: "percent",
      render: (percent) => <Progress percent={percent} size="small" strokeColor="#215e97" />,
    },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ padding: "0 34px 12px 34px" }}>
        <Row gutter={[12, 12]}>
          {kpis.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <Card size="small">
                <div style={{ fontSize: 12, color: "#64748b" }}>{item.title}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{item.subtitle}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ padding: "0 34px", marginBottom: 8, fontSize: 16, fontWeight: 600, color: "#1f2937" }}>
        Upcoming Events/Courses
      </div>
      <MyTable columns={eventColumns} dataSource={upcoming} selection={false} tablePadding={{ paddingLeft: "34px", paddingRight: "34px" }} />

      <div style={{ padding: "0 34px", margin: "12px 0 8px 0", fontSize: 16, fontWeight: 600, color: "#1f2937" }}>
        Attendee Status Overview
      </div>
      <MyTable columns={statusColumns} dataSource={attendeeByStatus} selection={false} tablePadding={{ paddingLeft: "34px", paddingRight: "34px" }} />
    </div>
  );
}

export default EventsDashboard;
