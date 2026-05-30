import React from "react";
import {
  MailOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import MyDrawer from "../common/MyDrawer";
import MyTable from "../common/MyTable";

export const formatReminderBatchName = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `Batch-${year}-${month}`;
};

export const reminderHistoryColumns = [
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
    render: (_, record) => formatReminderBatchName(record.date),
  },
  {
    title: "Medium",
    dataIndex: "medium",
    key: "medium",
    render: (medium) => {
      if (medium === "email")
        return <MailOutlined style={{ color: "#1890ff", fontSize: 18 }} />;
      if (medium === "pdf")
        return <FilePdfOutlined style={{ color: "red", fontSize: 18 }} />;
      if (medium === "letter")
        return <FileTextOutlined style={{ color: "#52c41a", fontSize: 18 }} />;
      return medium;
    },
  },
];

export const defaultReminderHistoryRows = [
  {
    key: "1",
    reminder: "Reminder 1",
    date: "02/07/2024",
    medium: "email",
  },
  {
    key: "2",
    reminder: "Reminder 2",
    date: "02/09/2024",
    medium: "pdf",
  },
];

export function ReminderTable({ dataSource, loading = false }) {
  return (
    <MyTable
      pagination={false}
      columns={reminderHistoryColumns}
      dataSource={dataSource}
      loading={loading}
      selection={false}
      tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
    />
  );
}

function Reminder({ open, onClose, dataSource = defaultReminderHistoryRows }) {
  return (
    <MyDrawer title="Reminder History" open={open} onClose={onClose}>
      <ReminderTable dataSource={dataSource} />
    </MyDrawer>
  );
}

export default Reminder;
