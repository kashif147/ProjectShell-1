import React, { useState, useEffect } from "react";
import TableComponent from "../../component/common/TableComponent";

const DirectDebitAuthorization = () => {
    // Mock data for Direct Debit Summary
    const [mockData, setMockData] = useState([
        {
            key: "1",
            id: "DD-001",
            accountName: "John Doe",
            bankName: "HSBC Holdings",
            iban: "GB29 HSBC 1234 5678 9012 34",
            status: "Active",
            dateAuthorized: "2023-10-15",
        },
        {
            key: "2",
            id: "DD-002",
            accountName: "Jane Smith",
            bankName: "Barclays",
            iban: "GB45 BARC 9876 5432 1098 76",
            status: "Pending",
            dateAuthorized: "2023-11-02",
        },
        {
            key: "3",
            id: "DD-003",
            accountName: "Robert Brown",
            bankName: "Lloyds Banking Group",
            iban: "GB12 LLOY 5544 3322 1100 99",
            status: "Active",
            dateAuthorized: "2023-09-20",
        },
    ]);

    return (
        <div style={{ width: "100%", padding: "0" }}>
            <TableComponent
                data={mockData}
                screenName="DirectDebitAuthorization"
                isGrideLoading={false}
                enableRowSelection={true}
                selectionType="checkbox"
            />
        </div>
    );
};

export default DirectDebitAuthorization;
