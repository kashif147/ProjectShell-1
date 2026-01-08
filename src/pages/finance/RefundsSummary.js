import React, { useState } from "react";
import TableComponent from "../../component/common/TableComponent";

const RefundsSummary = () => {
    // Mock data for Refunds Summary
    const [mockData, setMockData] = useState([
        {
            key: "1",
            refund: "REF-001",
            refundDate: "2023-11-15",
            ref: "TRX-1001",
            type: "Direct Debit",
            createdBy: "Admin User",
            createdAt: "2023-11-15 10:00:00",
            updatedBy: "Admin User",
            updatedAt: "2023-11-15 10:00:00",
        },
        {
            key: "2",
            refund: "REF-002",
            refundDate: "2023-11-16",
            ref: "TRX-1002",
            type: "Credit Card",
            createdBy: "Finance Manager",
            createdAt: "2023-11-16 11:30:00",
            updatedBy: "Finance Manager",
            updatedAt: "2023-11-16 11:30:00",
        },
        {
            key: "3",
            refund: "REF-003",
            refundDate: "2023-11-17",
            ref: "TRX-1003",
            type: "Bank Transfer",
            createdBy: "Admin User",
            createdAt: "2023-11-17 09:15:00",
            updatedBy: "Admin User",
            updatedAt: "2023-11-17 09:15:00",
        },
    ]);

    return (
        <div style={{ width: "100%", padding: "0" }}>
            <TableComponent
                data={mockData}
                screenName="Refunds"
                isGrideLoading={false}
                enableRowSelection={true}
                selectionType="checkbox"
            />
        </div>
    );
};

export default RefundsSummary;
