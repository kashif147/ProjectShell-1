import React from "react";
import TableComponent from "../../component/common/TableComponent";

function NewGraduate() {
  const tableData = [
    {
      key: "1",
      regNo: "45217A",
      fullName: "Jack Smith",
      stationPhone: "0946 744 188",
      batchName: "Batch-2023-11",
      batchDate: "15/11/2023",
      batchStatus: "Inprogress",
      createdAt: "10/11/2023 09:30",
      createdBy: "admin1",
      Count: 5,
    },
    {
      key: "2",
      regNo: "93824B",
      fullName: "Mary Johnson",
      stationPhone: "1234 567 890",
      batchName: "Batch-2023-11",
      batchDate: "15/11/2023",
      batchStatus: "Done",
      createdAt: "10/11/2023 10:15",
      createdBy: "admin2",
      Count: 3,
    },
    {
      key: "27",
      regNo: "19463AA",
      fullName: "Ethan Moore",
      stationPhone: "0876 543 210",
      batchName: "Batch-2023-12",
      batchDate: "01/12/2023",
      batchStatus: "Done",
      createdAt: "28/11/2023 14:45",
      createdBy: "admin3",
      Count: 7,
    },
  ];
  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent data={tableData} screenName="NewGraduate" />
    </div>
  );
}

export default NewGraduate;