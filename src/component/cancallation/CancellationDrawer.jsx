import React, { useState } from "react";
import { Drawer, Button, Tabs, Card, Row, Col, Tag, Table, Checkbox } from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const CancellationDrawer = ({ open, onClose }) => {
    const [activeTab, setActiveTab] = useState("summary");

    const columns = [
        {
            title: "Member",
            dataIndex: "member",
            key: "member",
            render: (_, record) => (
                <div>
                    <div>{record.member}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
                </div>
            ),
        },
        { title: "Join Date", dataIndex: "joinDate", key: "joinDate" },
        { title: "Cancelled On", dataIndex: "cancelDate", key: "cancelDate" },
        { title: "Reason", dataIndex: "reason", key: "reason" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) =>
                status === "Cancelled" ? (
                    <Tag color="red">Cancelled</Tag>
                ) : (
                    <Tag color="orange">Pending</Tag>
                ),
        },
    ];

    const data = [
        {
            key: 1,
            member: "John Doe",
            email: "john@example.com",
            joinDate: "01/02/2022",
            cancelDate: "15/01/2025",
            reason: "Relocation",
            status: "Cancelled",
        },
        {
            key: 2,
            member: "Jane Smith",
            email: "jane@example.com",
            joinDate: "10/06/2023",
            cancelDate: "20/01/2025",
            reason: "Financial",
            status: "Cancelled",
        },
    ];

    return (
        <Drawer
            title="Membership Cancellation - January 2025"
            width={1000}
            open={open}
            onClose={onClose}
            extra={<Button className="btun primary-btn">Export Report</Button>}
        >
            <div className="p-4">
                {/* Header Info */}
                <Card style={{ marginBottom: 16 }} >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Checkbox></Checkbox>
                        <CalendarOutlined />
                        <span>2025-01-20</span>
                        <UserOutlined />
                        <span>Processed by Admin</span>
                    </div>
                </Card>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    {/* ✅ Summary Tab */}
                    <TabPane key="summary" tab="Summary">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center", 
                                alignItems: "center", 
                                width: "100%",
                                marginTop: "40px",
                            }}
                        >
                            <Card
                                style={{
                                    width: 220,
                                    textAlign: "center",
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    borderRadius: "10px",
                                }}
                                bodyStyle={{ padding: "20px" }}
                            >
                                <UserOutlined
                                    style={{
                                        fontSize: "30px",
                                        color: "#ff4d4f",
                                        marginBottom: "8px",
                                    }}
                                />
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                                    25
                                </div>
                                <div style={{ fontSize: "14px", color: "#888" }}>Total Members</div>
                            </Card>
                            <Card
                                style={{
                                    width: 220,
                                    textAlign: "center",
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    borderRadius: "10px",
                                }}
                                bodyStyle={{ padding: "20px" }}
                            >
                                <UserOutlined
                                    style={{
                                        fontSize: "30px",
                                        color: "#ff4d4f",
                                        marginBottom: "8px",
                                    }}
                                />
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                                    25
                                </div>
                                <div style={{ fontSize: "14px", color: "#888" }}>Total Members</div>
                            </Card>
                        </div>
                    </TabPane>

                    {/* ✅ Cancellation Tab */}
                    <TabPane key="cancellations" tab="Cancellations">
                        <Table
                            columns={columns}
                            dataSource={data}
                            pagination={{ pageSize: 5 }}
                        />
                    </TabPane>
                </Tabs>
            </div>
        </Drawer>
    );
};

export default CancellationDrawer;
