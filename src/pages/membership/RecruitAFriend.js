import React from "react";
import TableComponent from "../../component/common/TableComponent";

function RecruitAFriend() {
  const tableData = [
    {
      key: "1",
      regNo: "RAF-001",
      fullName: "Emily White",
      stationPhone: "0876 543 210",
      batchName: "RAF-Batch-2024-01",
      batchDate: "01/01/2024",
      batchStatus: "Completed",
      createdAt: "01/01/2024 11:00",
      createdBy: "",
      Count: 10,
    },
    {
      key: "2",
      regNo: "RAF-002",
      fullName: "Michael Green",
      stationPhone: "1234 567 890",
      batchName: "RAF-Batch-2024-02",
      batchDate: "15/02/2024",
      batchStatus: "Inprogress",
      createdAt: "14/02/2024 12:30",
      createdBy: "",
      Count: 8,
    },
  ];
  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent data={tableData} screenName="RecruitAFriend" />
    </div>
  );
}

export default RecruitAFriend;