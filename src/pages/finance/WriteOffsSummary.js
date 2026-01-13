import React, { useState } from "react";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";

const WriteOffsSummary = () => {
    const { columns } = useTableColumns();
    const tableColumns = columns["WriteOffs"] || [];

    // Mock data for Write-offs Summary
    const [mockData] = useState([
        {
            key: "1",
            writeOff: "WO-001",
            writeOffDate: "2023-11-15",
            ref: "TRX-1001",
            type: "Direct Debit",
            createdBy: "Admin User",
            createdAt: "2023-11-15 10:00:00",
            updatedBy: "Admin User",
            updatedAt: "2023-11-15 10:00:00",
        },
        {
            key: "2",
            writeOff: "WO-002",
            writeOffDate: "2023-11-16",
            ref: "TRX-1002",
            type: "Credit Card",
            createdBy: "Finance Manager",
            createdAt: "2023-11-16 11:30:00",
            updatedBy: "Finance Manager",
            updatedAt: "2023-11-16 11:30:00",
        },
        {
            key: "3",
            writeOff: "WO-003",
            writeOffDate: "2023-11-17",
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

export default WriteOffsSummary;
