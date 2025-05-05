import React from "react";

import TableComponent from "../../component/common/TableComponent";
function TransferSummary() {

  const transferDataSource = [
    {
      key: "1",
      regNo: "45217A",
      forename: "Jack",
      surname: "Smith",
      currentStation: "GALC",
      requestedStation: "DUBC",
      transferReason: "Closer to home",
      transferDate: "2024-01-15",
      approvalStatus: "Approved",
      address: "Phoenix Park, Saint James",
      duty: "Garda",
    },
    {
      key: "2",
      regNo: "36182B",
      forename: "Emily",
      surname: "Johnson",
      currentStation: "DUBC",
      requestedStation: "STOC",
      transferReason: "Promotion",
      transferDate: "2024-02-10",
      approvalStatus: "Pending",
      address: "Main Street, Cork",
      duty: "Sergeant",
    },
    {
      key: "3",
      regNo: "78923C",
      forename: "Michael",
      surname: "Brown",
      currentStation: "STOC",
      requestedStation: "GALC",
      transferReason: "Medical reasons",
      transferDate: "2024-03-05",
      approvalStatus: "Approved",
      address: "Broadway, Limerick",
      duty: "Inspector",
    },
    {
      key: "4",
      regNo: "45618D",
      forename: "Sophia",
      surname: "White",
      currentStation: "GALC",
      requestedStation: "STOC",
      transferReason: "Closer to family",
      transferDate: "2024-04-20",
      approvalStatus: "Rejected",
      address: "Greenway, Galway",
      duty: "Detective",
    },
    {
      key: "5",
      regNo: "32589E",
      forename: "James",
      surname: "Green",
      currentStation: "DUBC",
      requestedStation: "GALC",
      transferReason: "Career development",
      transferDate: "2024-05-15",
      approvalStatus: "Approved",
      address: "Lakeview, Waterford",
      duty: "Chief Superintendent",
    },
  ];

  return (
    <div className="">
   
      <TableComponent data={transferDataSource}  screenName="Transfer" redirect="/Details" />
    </div>
  );
}

export default TransferSummary;