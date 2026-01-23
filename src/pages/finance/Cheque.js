import React from "react";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";

const Cheque = () => {
  const { columns } = useTableColumns();
  const tableColumns = columns["Batches"] || [];

  const staticData = [
    {
      key: "1",
      batchName: "Cheque Batch 001",
      batchDate: "10/01/2024",
      batchStatus: "Processed",
      createdAt: "10/01/2024 10:00",
      createdBy: "Admin",
      noOfMembers: 15,
      totalAmount: "€1125",
      PaymentType: "Cheque",
    },
    {
      key: "2",
      batchName: "Cheque Batch 002",
      batchDate: "12/02/2024",
      batchStatus: "Pending",
      createdAt: "12/02/2024 14:30",
      createdBy: "Admin",
      noOfMembers: 10,
      totalAmount: "€750",
      PaymentType: "Cheque",
    },
    {
      key: "3",
      batchName: "Cheque Batch 003",
      batchDate: "15/03/2024",
      batchStatus: "Processed",
      createdAt: "15/03/2024 11:00",
      createdBy: "UserA",
      noOfMembers: 20,
      totalAmount: "€1500",
      PaymentType: "Cheque",
    },
  ];

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <MyTable
        dataSource={staticData}
        columns={tableColumns}
        loading={false}
      />
    </div>
  );
};

export default Cheque;
