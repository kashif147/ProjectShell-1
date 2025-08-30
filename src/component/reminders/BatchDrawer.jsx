import React, { useState } from "react";
import {
  Drawer,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Tag,
  Progress,
  Table,
  Input,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import Checkbox from "antd/es/checkbox/Checkbox";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const { TabPane } = Tabs;

const BatchDrawer = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const columns = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{record.customer}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Payment Method",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
    },
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
    {
      title: "Last Sent",
      dataIndex: "lastSent",
      key: "lastSent",
    },
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

  const data1 = [
    { name: "Credit Card", value: 400 },
    { name: "Debit Card", value: 300 },
    { name: "Bank Transfer", value: 300 },
    { name: "Cash", value: 200 },
  ];
  return (
    <Drawer
      title="Batch Management"
      width={1200}
      open={open}
      onClose={onClose}

      extra={<Button type="primary">Trigger Batch</Button>}
    >
      {/* Header Info */}
      <div className="p-3">

        <Card style={{ marginBottom: 16 }} >

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Checkbox></Checkbox>
            <CalendarOutlined />
            <span>2024-12-15</span>
            <UserOutlined />
            <span>Created by John Smith</span>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="pt-2">
          <TabPane tab="Summary" key="summary">
            <Row className="pt-2" gutter={16}>
              <Col span={6}>
                <Card
                  style={{
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <div>Reminder 1</div>
                  <h3>245</h3>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  style={{
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <div>Reminder 2</div>
                  <h3>128</h3>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  style={{
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <div>Reminder 3</div>
                  <h3>67</h3>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  style={{
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <div>Total Items</div>
                  <h3>440</h3>
                </Card>
              </Col>
            </Row>


            <Row gutter={16} className="pt-2" style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Payment Methods Distribution">
                  {/* Pie/Chart placeholder */}
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

          <TabPane tab="Reminder 1 (245)" key="reminder1"  >
            <Card className="mt-2">
              <Row gutter={16} style={{ marginBottom: 16, textAlign: "center" }}>
                <Col span={6}>
                  <div
                    style={{
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "green" }}>
                      73
                    </div>
                    <div style={{ fontSize: "14px", color: "green" }}>Sent</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#fff7e6",
                      border: "1px solid #ffd591",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "orange" }}>
                      77
                    </div>
                    <div style={{ fontSize: "14px", color: "orange" }}>Pending</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#fff1f0",
                      border: "1px solid #ffa39e",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "red" }}>
                      95
                    </div>
                    <div style={{ fontSize: "14px", color: "red" }}>Failed</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#f0f5ff",
                      border: "1px solid #adc6ff",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#001529" }}>
                      $135,957
                    </div>
                    <div style={{ fontSize: "14px", color: "#001529" }}>Total</div>
                  </div>
                </Col>
              </Row>

              <Input.Search
                placeholder="Search customers or emails..."
                style={{ marginBottom: 16 }}
              />
              <Table columns={columns} dataSource={data} pagination={false} />
            </Card>

          </TabPane>

          <TabPane tab="Reminder 2 (128)" key="reminder2">
            <Card className="mt-2">
              <Row gutter={16} style={{ marginBottom: 16, textAlign: "center" }}>
                <div>
                  <h5>Reminder 1 Details</h5>
                </div>
                <Col span={6}>
                  <div
                    style={{
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "green" }}>
                      73
                    </div>
                    <div style={{ fontSize: "14px", color: "green" }}>Sent</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#fff7e6",
                      border: "1px solid #ffd591",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "orange" }}>
                      77
                    </div>
                    <div style={{ fontSize: "14px", color: "orange" }}>Pending</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#fff1f0",
                      border: "1px solid #ffa39e",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "red" }}>
                      95
                    </div>
                    <div style={{ fontSize: "14px", color: "red" }}>Failed</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#f0f5ff",
                      border: "1px solid #adc6ff",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#001529" }}>
                      $135,957
                    </div>
                    <div style={{ fontSize: "14px", color: "#001529" }}>Total</div>
                  </div>
                </Col>
              </Row>

              <Input.Search
                placeholder="Search customers or emails..."
                style={{ marginBottom: 16 }}
              />
              <Table columns={columns} dataSource={data} pagination={false} />
            </Card>
          </TabPane>
          <TabPane tab="Reminder 3 (67)" key="reminder3">
            <Card className="mt-2">
              <Row gutter={16} style={{ marginBottom: 16, textAlign: "center" }}>
                <Col span={6}>
                  <div
                    style={{
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "green" }}>
                      73
                    </div>
                    <div style={{ fontSize: "14px", color: "green" }}>Sent</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#fff7e6",
                      border: "1px solid #ffd591",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "orange" }}>
                      77
                    </div>
                    <div style={{ fontSize: "14px", color: "orange" }}>Pending</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#fff1f0",
                      border: "1px solid #ffa39e",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "red" }}>
                      95
                    </div>
                    <div style={{ fontSize: "14px", color: "red" }}>Failed</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      background: "#f0f5ff",
                      border: "1px solid #adc6ff",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#001529" }}>
                      $135,957
                    </div>
                    <div style={{ fontSize: "14px", color: "#001529" }}>Total</div>
                  </div>
                </Col>
              </Row>

              <Input.Search
                placeholder="Search customers or emails..."
                style={{ marginBottom: 16 }}
              />
              <Table columns={columns} dataSource={data} pagination={false} />
            </Card>
          </TabPane>
        </Tabs>
      </div>

    </Drawer>
  );
};

export default BatchDrawer;
