import React, { useState } from "react";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";

const RefundsSummary = () => {
    const { columns } = useTableColumns();
    const tableColumns = columns["Refunds"] || [];

    // Mock data for Refunds Summary
    const [mockData] = useState([
        {
            key: "1",
            refundId: "RF-10001",
            refNo: "TRX-1001",
            memo: "Duplicate payment reversal",
            refundDate: "2023-11-15",
            refundAmount: 125.5,
            refundType: "Bank Transfer",
            memberNo: "M-4521",
            createdBy: "Admin User",
            createdAt: "2023-11-15T10:00:00.000Z",
        },
        {
            key: "2",
            refundId: "RF-10002",
            refNo: "TRX-1002",
            memo: "Membership cancellation credit",
            refundDate: "2023-11-16",
            refundAmount: 89.0,
            refundType: "Credit Card",
            applicationNo: "APP-8832",
            createdBy: "Finance Manager",
            createdAt: "2023-11-16T11:30:00.000Z",
        },
        {
            key: "3",
            refundId: "RF-10003",
            refNo: "TRX-1003",
            memo: "Overpayment adjustment",
            refundDate: "2023-11-17",
            refundAmount: 210.25,
            refundType: "Bank Transfer",
            memberNo: "M-9901",
            createdBy: "Admin User",
            createdAt: "2023-11-17T09:15:00.000Z",
        },
    ]);

    return (
        <div style={{ width: "100%", padding: "0" }}>
            <MyTable
                dataSource={mockData}
                columns={tableColumns}
                loading={false}
                selection={true}
                selectionType="checkbox"
            />
        </div>
    );
};

export default RefundsSummary;
