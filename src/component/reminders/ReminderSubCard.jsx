// ReminderCard.jsx
import React from "react";
import { Card, Row, Col, Button, Table } from "antd";
import { PlayCircleOutlined, CloseOutlined  } from "@ant-design/icons";
import MySearchInput from "../common/MySearchInput";

const ReminderSubCard = ({
    reminderKey, // e.g. "R1", "R2", "R3"
    title,
    totalItems,
    stats = {}, // { sent: 0, pending: 0, failed: 0, total: 0 }
    columns,
    data,
    getRowSelection,
    selectedKeysMap,
    onExport,
    onExecute,
}) => {
    return (
        <div className="mt-1 ms-2 me-2 w-100">
            <Card className="mb-2">
                {/* Header */}
                <div className="d-flex justify-content-between" style={{ marginBottom: "24px" }}>
                    <h5 className="m-0">{title}</h5>
                    <div className="p-2 rounded-pill bg-light shadow-sm fw-semibold">
                        <p className="m-0">{totalItems} Items</p>
                    </div>
                </div>

                {/* Search + Actions */}
                <div className="d-flex align-items-center pb-2">
                    <div className="flex-grow-1 me-2">
                        <MySearchInput placeholder="Search by name, email or membership no." />
                    </div>

                    {/* Execute Button */}
                    {selectedKeysMap?.[reminderKey]?.length > 0 && (
                        <>
                        <Button
                        
                            className="butn primary-btn me-2"
                            style={{ height: "40px", backgroundColor:'red'}}
                            icon={<CloseOutlined  />}
                            onClick={() => onExecute(reminderKey, selectedKeysMap[reminderKey])}
                        >
                            Exclude ({selectedKeysMap[reminderKey].length})
                        </Button>
                        <Button
                            className="butn primary-btn me-2"
                            style={{ height: "40px" }}
                            icon={<PlayCircleOutlined />}
                            onClick={() => onExecute(reminderKey, selectedKeysMap[reminderKey])}
                        >
                            Execute ({selectedKeysMap[reminderKey].length})
                        </Button>
                        </>
                    )}

                    {/* Export Button */}
                    <Button
                        className="butn primary-btn"
                        style={{ height: "40px" }}
                        onClick={() => onExport(reminderKey)}
                    >
                        Export
                    </Button>
                </div>

                {/* Stats Row */}
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
                                {stats.sent}
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
                                {stats.pending}
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
                                {stats.failed}
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
                                {stats.total}
                            </div>
                            <div style={{ fontSize: "14px", color: "#001529" }}>Total</div>
                        </div>
                    </Col>
                </Row>
            </Card>
            <Table
            className="claims-table"
                rowSelection={getRowSelection(reminderKey)}
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered
            />
        </div>
    );
};

export default ReminderSubCard;
