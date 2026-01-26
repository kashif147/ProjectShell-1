import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Statistic,
    Button,
    Select,
    Table,
    Badge,
    Progress,
    Space,
    Radio,
} from "antd";
import {
    SendOutlined,
    CheckCircleOutlined,
    ReadOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
    MailOutlined,
    MessageOutlined,
    FileTextOutlined,
    BellOutlined,
    MoreOutlined
} from "@ant-design/icons";
import {
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
} from "recharts";
import "../../styles/MembershipDashboard.css";

const { Option } = Select;

const CorrespondenceDashboard = () => {
    const navigate = useNavigate();
    // Mock Data for Stats
    const statsData = [
        {
            title: "Total Sent",
            value: "1,240,500",
            trend: "5.2%",
            trendUp: true,
            icon: <SendOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
            color: "#1890ff"
        },
        {
            title: "Delivered Rate",
            value: "98.2%",
            trend: "0.4%",
            trendUp: true,
            icon: <CheckCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
            color: "#52c41a"
        },
        {
            title: "Opened/Read",
            value: "45.3%",
            trend: "1.2%",
            trendUp: false,
            icon: <ReadOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
            color: "#1890ff"
        },
        {
            title: "Failed",
            value: "0.8%",
            trend: "2.0%",
            trendUp: true, // "Good" that failures are down
            icon: <ExclamationCircleOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />,
            color: "#ff4d4f"
        }
    ];

    // Mock Data for Channel Distribution (Donut Chart)
    const channelData = [
        { name: "Email", value: 45, color: "#1890ff" },
        { name: "SMS", value: 25, color: "#722ed1" },
        { name: "Letter", value: 20, color: "#13c2c2" },
        { name: "Push", value: 10, color: "#52c41a" },
    ];

    // Mock Data for Delivery Trend (Line/Area Chart)
    const trendData = [
        { name: "Mon", value: 4000 },
        { name: "Tue", value: 5000 },
        { name: "Wed", value: 5500 },
        { name: "Thu", value: 8000 },
        { name: "Fri", value: 10000 },
        { name: "Sat", value: 6000 },
        { name: "Sun", value: 9000 },
    ];

    // Mock Data for Recent Batches Table
    const batchesData = [
        {
            key: "1",
            batchId: "#COR-9832",
            channel: "Email",
            name: "Marketing_Q4_Email",
            status: "SENT",
            sentDate: "Oct 24, 2023 10:45 AM",
            successRate: 98,
        },
        {
            key: "2",
            batchId: "#COR-9831",
            channel: "SMS",
            name: "Alert_System_Maintenance",
            status: "PROCESSING",
            sentDate: "Oct 24, 2023 09:12 AM",
            successRate: 45,
        },
        {
            key: "3",
            batchId: "#COR-9830",
            channel: "Letter",
            name: "Policy_Renewal_Letters",
            status: "QUEUED",
            sentDate: "Oct 23, 2023 04:30 PM",
            successRate: 0,
        },
        {
            key: "4",
            batchId: "#COR-9829",
            channel: "Push",
            name: "Security_Breach_Push",
            status: "FAILED",
            sentDate: "Oct 23, 2023 11:20 AM",
            successRate: 12,
        },
    ];

    const getChannelIcon = (channel) => {
        switch (channel) {
            case "Email": return <MailOutlined style={{ color: "#1890ff" }} />;
            case "SMS": return <MessageOutlined style={{ color: "#722ed1" }} />;
            case "Letter": return <FileTextOutlined style={{ color: "#13c2c2" }} />;
            case "Push": return <BellOutlined style={{ color: "#52c41a" }} />;
            default: return <MailOutlined />;
        }
    };

    const getStatusTag = (status) => {
        let color = "default";
        if (status === "SENT") color = "success";
        if (status === "PROCESSING") color = "warning";
        if (status === "FAILED") color = "error";
        if (status === "QUEUED") color = "default";

        return (
            <Badge
                count={status}
                style={{
                    backgroundColor: color === 'success' ? '#52c41a' :
                        color === 'warning' ? '#faad14' :
                            color === 'error' ? '#ff4d4f' : '#d9d9d9',
                    color: '#fff',
                    boxShadow: 'none',
                    padding: '0 8px',
                    borderRadius: '4px'
                }}
            />
        );
    };

    const columns = [
        {
            title: "BATCH ID",
            dataIndex: "batchId",
            key: "batchId",
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: "CHANNEL",
            key: "channel",
            render: (_, record) => (
                <Space>
                    {getChannelIcon(record.channel)}
                    <span>{record.name}</span>
                </Space>
            )
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (text) => getStatusTag(text)
        },
        {
            title: "SENT DATE",
            dataIndex: "sentDate",
            key: "sentDate",
            render: (text) => <span style={{ color: "#8c8c8c" }}>{text}</span>
        },
        {
            title: "SUCCESS RATE",
            key: "successRate",
            render: (_, record) => (
                <div style={{ width: 150 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12 }}>{record.successRate}%</span>
                    </div>
                    <Progress
                        percent={record.successRate}
                        showInfo={false}
                        size="small"
                        strokeColor={
                            record.successRate > 90 ? "#52c41a" :
                                record.successRate > 40 ? "#faad14" : "#ff4d4f"
                        }
                    />
                </div>
            )
        },
        {
            title: "",
            key: "action",
            render: () => <Button type="text" icon={<MoreOutlined />} />
        },
    ];

    return (
        <div className="membership-dashboard">
            <div style={{ padding: "24px", minHeight: "100vh" }}>
                <h1 style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "bold" }}>
                    Correspondence Dashboard
                </h1>

                {/* Top Stats Row - Mimicking MembershipDashboard Statistic Card Style */}
                <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
                    {statsData.map((stat, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <Card style={{ height: "180px", borderRadius: "12px" }}>
                                <Statistic
                                    title={
                                        <span style={{ fontSize: "16px", fontWeight: "600", color: "#262626" }}>
                                            {stat.title}
                                        </span>
                                    }
                                    value={stat.value}
                                    prefix={<span style={{ marginRight: "8px" }}>{stat.icon}</span>}
                                    valueStyle={{
                                        color: stat.color, // Use the color defined in data
                                        fontSize: "32px",
                                        fontWeight: "700",
                                    }}
                                    suffix={
                                        <div style={{ fontSize: "14px", color: "#666", marginTop: "12px", lineHeight: "1.6" }}>
                                            <div>
                                                <span style={{
                                                    color: stat.trendUp === (stat.title !== "Failed" && stat.title !== "Opened/Read" ? true : stat.trendUp) ? "#52c41a" : "#ff4d4f",
                                                    fontWeight: 500
                                                }}>
                                                    {stat.trendUp ? "+" : "-"}{stat.trend}
                                                </span>
                                                <span style={{ marginLeft: "4px" }}>vs last month</span>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Filter Row */}
                <Card bordered={false} style={{ marginBottom: "24px", borderRadius: "12px" }} bodyStyle={{ padding: "12px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <Radio.Group defaultValue="day" buttonStyle="solid">
                                <Radio.Button value="day">Day</Radio.Button>
                                <Radio.Button value="week">Week</Radio.Button>
                                <Radio.Button value="month">Month</Radio.Button>
                            </Radio.Group>
                            <Select defaultValue="all" style={{ width: 150 }} bordered={false}>
                                <Option value="all">All Channels</Option>
                                <Option value="email">Email</Option>
                                <Option value="sms">SMS</Option>
                                <Option value="letter">Letter</Option>
                            </Select>
                        </div>

                        <Button type="primary" className="primary-btn" icon={<FilterOutlined />}>Advanced Filters</Button>
                    </div>
                </Card>

                {/* Charts Row */}
                <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
                    <Col xs={24} lg={8}>
                        <Card
                            title="Channel Distribution"
                            bordered={false}
                            style={{ height: "400px", borderRadius: "12px" }}
                            className="dashboard-card"
                        >
                            <div style={{ height: "300px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={channelData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, value, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {channelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                                    <span>Delivery Success Trend</span>
                                    <span style={{ fontSize: "12px", color: "#52c41a", fontWeight: "normal" }}>+0.5% Average Growth</span>
                                </div>
                            }
                            bordered={false}
                            style={{ height: "400px", borderRadius: "12px" }}
                            className="dashboard-card"
                        >
                            <div style={{ height: "300px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="value" stroke="#1890ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Batches Table */}
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                            <span>Recent Communication Batches</span>
                            <Button type="link">View All Batches</Button>
                        </div>
                    }
                    bordered={false}
                    style={{ borderRadius: "12px" }}
                >
                    <Table
                        columns={columns.map(col => ({
                            ...col,
                            onHeaderCell: () => ({
                                style: { backgroundColor: '#fafafa', color: '#1f1f1f', fontWeight: 600 }
                            })
                        }))}
                        dataSource={batchesData}
                        pagination={false}
                        onRow={(record) => ({
                            onClick: () => {
                                navigate("/CommunicationBatchDetail", { state: { batchId: record.batchId, batchName: "August Newsletter - Email", ...record } });
                            },
                            style: { cursor: 'pointer' }
                        })}
                    />
                </Card>
            </div>
        </div>
    );
};

export default CorrespondenceDashboard;
