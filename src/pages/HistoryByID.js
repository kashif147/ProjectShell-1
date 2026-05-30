import React from "react";
import MyTable from "../component/common/MyTable";

function HistoryByID() {
  const columns = [
    {
      title: "Change Description",
      dataIndex: "changeDescription",
      key: "changeDescription",
      ellipsis: true,
    },
    {
      title: "Datetime",
      dataIndex: "datetime",
      key: "datetime",
      ellipsis: true,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      ellipsis: true,
    },
    {
      title: "Old Value",
      dataIndex: "oldValue",
      key: "oldValue",
      ellipsis: true,
    },
    {
      title: "New Value",
      dataIndex: "newValue",
      key: "newValue",
      ellipsis: true,
    },
  ];

  const dataSource = [
    {
      key: "1",
      changeDescription: "Updated batch date",
      datetime: "2025-05-20 12:34",
      user: "Alice Johnson",
      oldValue: "2025-05-01",
      newValue: "2025-05-15",
    },
    {
      key: "2",
      changeDescription: "Corrected total amount",
      datetime: "2025-05-18 09:22",
      user: "Bob Smith",
      oldValue: "€4,000",
      newValue: "€4,200",
    },
  ];

  return (
    <MyTable
      columns={columns}
      dataSource={dataSource}
      selection={false}
      tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
    />
  );
}

export default HistoryByID;
