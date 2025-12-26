import React from "react";
import TableComponent from "../../component/common/TableComponent";
import { useTableColumns } from "../../context/TableColumnsContext ";

function ChangCateSumm() {
  const { gridData } = useTableColumns();
  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent data={gridData} screenName="ChangCateSumm" />
    </div>
  );
}

export default ChangCateSumm;
