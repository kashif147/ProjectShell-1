import React, { useState } from "react";
import {
  Drawer,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Table,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import Checkbox from "antd/es/checkbox/Checkbox";
import ReminderSubCard from "./ReminderSubCard";

const { TabPane } = Tabs;

const BatchDrawer = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [tabChecks, setTabChecks] = useState({
    summary: false,
    reminder1: false,
    reminder2: false,
    reminder3: false,
  });

  const handleTabCheck = (key, e) => {
    setTabChecks((prev) => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };

  const columns = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{record.customer}</div>
          {/* <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div> */}
        </div>
      ),
    },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Payment Method", dataIndex: "method", key: "method" },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Sent" ? (
          <Tag color="green">Sent</Tag>
        ) : status === "Pending" ? (
          <Tag color="orange">Pending</Tag>
        ) : (
          <Tag color="red">Failed</Tag>
        ),
    },
    { title: "Last Sent", dataIndex: "lastSent", key: "lastSent" },
  ];

  const data = [
    {
      key: 1,
      customer: "Customer 1",
      email: "customer1@example.com",
      amount: "$410",
      method: "Bank Transfer",
      dueDate: "20/09/2025",
      status: "Pending",
      lastSent: "Never",
    },
    {
      key: 2,
      customer: "Customer 2",
      email: "customer2@example.com",
      amount: "$615",
      method: "Credit Card",
      dueDate: "15/09/2025",
      status: "Sent",
      lastSent: "25/08/2025",
    },
  ];

  const [selectedKeysMap, setSelectedKeysMap] = useState({
    R1: [],
    R2: [],
    R3: [],
  });

  const getRowSelection = (reminderKey) => ({
    selectedRowKeys: selectedKeysMap[reminderKey],
    onChange: (selectedRowKeys) => {
      setSelectedKeysMap((prev) => ({
        ...prev,
        [reminderKey]: selectedRowKeys,
      }));
    },
  });

  const handleExecute = (reminderKey, selectedRows) => {
    console.log("Executing for", reminderKey, selectedRows);
  };

  const handleExport = (reminderKey) => {
    console.log("Exporting for", reminderKey);
  };

  // ✅ Config for reminders
  const reminders = [
    {
      key: "reminder1",
      reminderKey: "R1",
      title: "Reminder 1 Details",
      count: 245,
      stats: { sent: 73, pending: 77, failed: 95, total: "$135,957" },
    },
    {
      key: "reminder2",
      reminderKey: "R2",
      title: "Reminder 2 Details",
      count: 128,
      stats: { sent: 50, pending: 30, failed: 20, total: "€99,000" },
    },
    {
      key: "reminder3",
      reminderKey: "R3",
      title: "Reminder 3 Details",
      count: 67,
      stats: { sent: 20, pending: 10, failed: 15, total: "€55,000" },
    },
  ];

  return (
    <Drawer
      title="Batch Management"
      width={1200}
      open={open}
      onClose={onClose}
      extra={<Button className="btun primary-btn">Trigger Batch</Button>}
    >
      {/* Header Info */}
      <div className="p-3">
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Checkbox />
            <CalendarOutlined />
            <span>2024-12-15</span>
            <UserOutlined />
            <span>Created by John Smith</span>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="pt-2">
          {/* ✅ Summary Tab */}
          <TabPane
            key="summary"
            tab={
              <span>
                {/* <Checkbox
                  checked={tabChecks.summary}
                  onChange={(e) => handleTabCheck("summary", e)}
                  style={{ marginRight: 8 }}
                /> */}
                Summary
              </span>
            }
          >
            <Row className="pt-2" gutter={16}>
              <Col span={6}>
                <Card>Reminder 1 <h3>245</h3></Card>
              </Col>
              <Col span={6}>
                <Card>Reminder 2 <h3>128</h3></Card>
              </Col>
              <Col span={6}>
                <Card>Reminder 3 <h3>67</h3></Card>
              </Col>
              <Col span={6}>
                <Card>Total Items <h3>440</h3></Card>
              </Col>
            </Row>

            <Row gutter={16} className="pt-2" style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Payment Methods Distribution">
                  <Progress type="circle" percent={41} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Payment Breakdown">
                  <p>Credit Card: 180 (40.9%)</p>
                  <p>Debit Card: 145 (33.0%)</p>
                  <p>Bank Card: 95 (21.6%)</p>
                  <p>Cash: 20 (4.5%)</p>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* ✅ Dynamic Reminder Tabs */}
          {reminders.map((rem) => (
            <TabPane
              key={rem.key}
              tab={
                <span>
                  <Checkbox
                    checked={tabChecks[rem.key]}
                    onChange={(e) => handleTabCheck(rem.key, e)}
                    style={{ marginRight: 8 }}
                  />
                  {`${rem.title.split(" ")[0]} (${rem.count})`}
                </span>
              }
            >
              <ReminderSubCard
                reminderKey={rem.reminderKey}
                title={rem.title}
                totalItems={rem.count}
                stats={rem.stats}
                columns={columns}
                data={data}
                getRowSelection={getRowSelection}
                selectedKeysMap={selectedKeysMap}
                onExecute={handleExecute}
                onExport={handleExport}
              />
            </TabPane>
          ))}
        </Tabs>
      </div>
    </Drawer>
  );
};

export default BatchDrawer;
