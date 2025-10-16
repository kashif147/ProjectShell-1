import React from "react";
import TableComponent from "../../component/common/TableComponent";
import { tableData } from "../../constants/Batch";
import moment from "moment";

function Batches() {
  // Convert & format date fields
  const formattedData = tableData.map((item) => ({
    ...item,
    batchDate: moment(item.batchDate, "DD/MM/YYYY").format("DD/MM/YYYY"),
    createdAt: moment(item.createdAt, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm"),
  }));

  return (
    <div style={{ width: "100%" }}>
      <TableComponent data={formattedData} screenName="Batches" />
    </div>
  );
}

export default Batches;
