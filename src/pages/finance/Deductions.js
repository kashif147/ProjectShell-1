import React, { useEffect } from "react";
import MyTable from "../../component/common/MyTable";
// import { useTableColumns } from "../../context/TableColumnsContext "; // Context not needed for static definition

const tableColumns = [
  {
    title: "Member No",
    dataIndex: "memberId",
    key: "memberId",
    width: 150,
  },
  {
    title: "Full Name",
    dataIndex: "fullName",
    key: "fullName",
    width: 200,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 150,
  },
  {
    title: "Deduction Date",
    dataIndex: "deductionDate",
    key: "deductionDate",
    width: 150,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 150,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    width: 250,
  },
];

const staticData = [
  {
    key: "1",
    memberId: "M001",
    fullName: "John Doe",
    amount: "€50.00",
    deductionDate: "01/02/2024",
    status: "Successful",
    description: "Monthly Subscription Deduction",
  },
  {
    key: "2",
    memberId: "M002",
    fullName: "Jane Smith",
    amount: "€50.00",
    deductionDate: "01/02/2024",
    status: "Successful",
    description: "Monthly Subscription Deduction",
  },
  {
    key: "3",
    memberId: "M003",
    fullName: "Michael Brown",
    amount: "€50.00",
    deductionDate: "01/02/2024",
    status: "Failed",
    description: "Insufficient Funds",
  },
];

const Deductions = () => {
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

export default Deductions;
