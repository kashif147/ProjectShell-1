
import React from "react";
import { Table } from "antd";
import { MailOutlined, FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import MyDrawer from "../common/MyDrawer";


function Reminder({ open, onClose }) {
    const formatBatchName = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `Batch-${year}-${month}`;
    };
    const columns = [
        {
            title: "Reminder",
            dataIndex: "reminder",
            key: "reminder",
        },
        {
            title: "Reminder Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Batch",
            key: "batch",
            render: (record) => formatBatchName(record.date),
        },
        {
            title: "Medium",
            dataIndex: "medium",
            key: "medium",
            render: (medium) => {
                if (medium === "email") return <MailOutlined style={{ color: "#1890ff", fontSize: 18 }} />;
                if (medium === "pdf") return <FilePdfOutlined style={{ color: "red", fontSize: 18 }} />;
                if (medium === "letter") return <FileTextOutlined style={{ color: "#52c41a", fontSize: 18 }} />;
                return medium;
            },
        },
    ];

    const data = [
        {
            key: "1",
            reminder: "Reminder 1",
            date: "02/07/2024",
            batch: "Batch A",
            medium: "email",
        },
        {
            key: "2",
            reminder: "Reminder 2",
            date: "02/09/2024",
            batch: "Batch B",
            medium: "pdf",
        },
       
    ];
    return (
        <MyDrawer title="Reminder History" open={open} onClose={onClose}>
            <Table
                pagination={false}
                columns={columns}
                dataSource={data}
                bordered
                className="drawer-tbl"
                rowClassName={(record, index) => (index % 2 !== 0 ? "odd-row" : "even-row")}
            />
        </MyDrawer>
    )
}

export default Reminder
