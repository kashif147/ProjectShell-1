import React from "react";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";

const OnlinePayment = () => {
  const { columns } = useTableColumns();
  const tableColumns = columns["onlinePayment"] || [];

  const staticData = [
    {
      key: "1",
      memberId: "M001",
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      joinDate: "01/01/2023",
      category: "Standard",
      membershipStatus: "Active",
      renewalDate: "01/01/2025",
      transactionId: "TXN123456789",
      paidAmount: "€75.00",
      paymentDate: "15/01/2024",
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      billingCycle: "Annual",
    },
    {
      key: "2",
      memberId: "M002",
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "098-765-4321",
      joinDate: "15/03/2022",
      category: "Premium",
      membershipStatus: "Active",
      renewalDate: "15/03/2025",
      transactionId: "TXN987654321",
      paidAmount: "€150.00",
      paymentDate: "20/03/2024",
      paymentMethod: "PayPal",
      paymentStatus: "Paid",
      billingCycle: "Annual",
    },
    {
      key: "3",
      memberId: "M003",
      fullName: "Peter Jones",
      email: "peter.jones@example.com",
      phone: "555-555-5555",
      joinDate: "10/07/2023",
      category: "Standard",
      membershipStatus: "Pending",
      renewalDate: "10/07/2024",
      transactionId: "TXN555555555",
      paidAmount: "€75.00",
      paymentDate: "10/07/2023",
      paymentMethod: "Credit Card",
      paymentStatus: "Pending",
      billingCycle: "Annual",
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

export default OnlinePayment;
