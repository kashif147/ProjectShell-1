import React, { useState, useEffect, useRef } from "react";
import {
    Row,
    Col,
    Button,
    Tabs,
    Table,
    Tag,
    Card,
    Tooltip,
    message,
    Upload,
    Divider
} from "antd";
import {
    MdCloudDownload,
    MdCloudUpload,
    MdFilePresent,
    MdCheckCircle,
    MdError,
    MdInfo,
    MdAccountBalance,
    MdHistory
} from "react-icons/md";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

const DirectDebitBatchDetails = () => {
    const location = useLocation();
    const [activeKey, setActiveKey] = useState("1");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [batchInfo, setBatchInfo] = useState({
        id: "DD-BATCH-2024-001",
        name: "Monthly Direct Debit Run - Feb 2024",
        status: "Processing",
        totalAmount: 14500.50,
        payerCount: 124,
        createdAt: "2024-02-01T10:00:00Z",
        submittedDate: null,
        bankAcknowledgeDate: null
    });

    // Mock data for members in the batch
    const [members, setMembers] = useState([
        {
            key: "1",
            membershipNo: "MEM-1001",
            fullName: "ALEX MORGAN",
            iban: "GB29 HSBC 1234 5678 9012 34",
            amount: 45.00,
            status: "Pending"
        },
        {
            key: "2",
            membershipNo: "MEM-1002",
            fullName: "JORDAN SMITH",
            iban: "GB45 BARC 9876 5432 1098 76",
            amount: 120.00,
            status: "Pending"
        },
        {
            key: "3",
            membershipNo: "MEM-1003",
            fullName: "RILEY COOPER",
            iban: "GB12 LLOY 5544 3322 1100 99",
            amount: 75.50,
            status: "Pending"
        },
        // ... more mock data
    ]);

    useEffect(() => {
        if (location.state?.batchId) {
            setBatchInfo(prev => ({
                ...prev,
                id: location.state.batchId,
                name: location.state.batchName || prev.name
            }));
        }
    }, [location.state]);

    const handleDownloadExcel = () => {
        const dataToExport = members.map(m => ({
            "Membership No": m.membershipNo,
            "Full Name": m.fullName,
            "IBAN": m.iban,
            "Amount": m.amount,
            "Currency": "EUR",
            "Reference": `DD-${batchInfo.id}-${m.membershipNo}`
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DirectDebitBatch");
        XLSX.writeFile(wb, `${batchInfo.id}_BankFile.xlsx`);
        message.success("Bank file generated successfully");

        // Mock update status
        if (batchInfo.status === "Processing") {
            setBatchInfo(prev => ({ ...prev, status: "Submitted", submittedDate: dayjs().toISOString() }));
        }
    };

    const handleFileUpload = (info) => {
        const { status } = info.file;
        if (status === 'done' || status === 'uploading') {
            // In a real app we'd wait for completion
            setUploadedFile(info.file);
            setBatchInfo(prev => ({
                ...prev,
                status: "Acknowledged",
                bankAcknowledgeDate: dayjs().toISOString()
            }));

            // Randomly update some member statuses to "Received" or "Failed" for demo
            setMembers(prev => prev.map(m => ({
                ...m,
                status: Math.random() > 0.1 ? "Received" : "Failed"
            })));

            message.success(`${info.file.name} file uploaded successfully. Batch processed.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const columns = [
        {
            title: "Membership No",
            dataIndex: "membershipNo",
            key: "membershipNo"
        },
        {
            title: "Full Name",
            dataIndex: "fullName",
            key: "fullName"
        },
        {
            title: "IBAN",
            dataIndex: "iban",
            key: "iban"
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (text) => `€${text.toFixed(2)}`
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "blue";
                let icon = <MdInfo />;
                if (status === "Received") { color = "green"; icon = <MdCheckCircle />; }
                if (status === "Failed") { color = "red"; icon = <MdError />; }
                return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
            }
        }
    ];

    const tabItems = [
        {
            key: "1",
            label: "Batch Members",
            children: (
                <div style={{ padding: "20px" }}>
                    <Table
                        dataSource={members}
                        columns={columns}
                        pagination={{ pageSize: 10 }}
                        className="custom-ant-table"
                    />
                </div>
            )
        },
        {
            key: "2",
            label: "Exceptions & Failures",
            children: (
                <div style={{ padding: "20px" }}>
                    <Table
                        dataSource={members.filter(m => m.status === "Failed")}
                        columns={columns}
                        pagination={false}
                        locale={{ emptyText: "No exceptions found in this batch." }}
                    />
                </div>
            )
        }
    ];

    const styles = {
        container: {
            padding: "24px",
            background: "#f8fafc",
            minHeight: "100%",
            fontFamily: "'Inter', sans-serif"
        },
        summaryCard: {
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            background: "#fff",
            marginBottom: "24px",
            overflow: "hidden"
        },
        summaryHeader: {
            padding: "20px 24px",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        },
        headerTitle: {
            margin: 0,
            color: "#fff",
            fontSize: "20px",
            fontWeight: "700"
        },
        statBox: {
            padding: "20px",

            textAlign: "center",
            borderRight: "1px solid #f1f5f9"
        },
        statLabel: {
            fontSize: "12px",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "8px",
            display: "block"
        },
        statValue: {
            fontSize: "18px",
            fontWeight: "700",
            color: "#1e293b"
        },
        actionSection: {
            background: "#fff",
            padding: "16px 24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            gap: "16px",
            alignItems: "center"
        }
    };

    return (
        <div style={styles.container}>
            {/* Summary Stats Card */}
            <div style={styles.summaryCard}>
                <Row>
                    <Col span={6}>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Total Payer Count</span>
                            <div style={styles.statValue}>{batchInfo.payerCount} Members</div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Total Batch Amount</span>
                            <div style={styles.statValue}>€{batchInfo.totalAmount.toLocaleString()}</div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Created On</span>
                            <div style={styles.statValue}>{dayjs(batchInfo.createdAt).format("DD MMM YYYY")}</div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{ ...styles.statBox, borderRight: "none" }}>
                            <span style={styles.statLabel}>Status</span>
                            <div style={styles.statValue}>
                                {batchInfo.bankAcknowledgeDate
                                    ? dayjs(batchInfo.bankAcknowledgeDate).format("DD MMM HH:mm")
                                    : batchInfo.submittedDate
                                        ? dayjs(batchInfo.submittedDate).format("DD MMM HH:mm")
                                        : "N/A"}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Actions Bar */}
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={styles.actionSection}>
                    <Button
                        type="primary"
                        icon={<MdCloudDownload size={20} />}
                        onClick={handleDownloadExcel}
                        style={{ background: "#2563eb", height: "40px", borderRadius: "8px" }}
                    >
                        Generate Bank File
                    </Button>

                    <Divider type="vertical" style={{ height: "30px" }} />

                    <Upload
                        customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 1000)}
                        onChange={handleFileUpload}
                        showUploadList={false}
                    >
                        <Button
                            icon={<MdCloudUpload size={20} />}
                            style={{ height: "40px", borderRadius: "8px", border: "1.5px solid #cbd5e1" }}
                        >
                            Upload Bank Return
                        </Button>
                    </Upload>

                    {uploadedFile && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px", padding: "4px 12px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                            <MdFilePresent color="#166534" size={20} />
                            <span style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>{uploadedFile.name}</span>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <Tooltip title="View Batch History">
                        <Button shape="circle" icon={<MdHistory size={20} />} />
                    </Tooltip>
                    <Tooltip title="Bank Connections">
                        <Button shape="circle" icon={<MdAccountBalance size={20} />} />
                    </Tooltip>
                </div>
            </div>

            {/* Tabs & Table */}
            <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    items={tabItems}
                    className="custom-tabs"
                    style={{ padding: "0 10px" }}
                />
            </Card>
        </div>
    );
};

export default DirectDebitBatchDetails;
