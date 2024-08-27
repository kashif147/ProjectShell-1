import React from "react";
import { Table, Pagination } from "antd";
import { useTableColumns } from "../../context/TableColumnsContext ";
import Gridmenu from "./Gridmenu";
import { MoreOutlined } from "@ant-design/icons";
import { tableData } from "../../Data";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { LuRefreshCw } from "react-icons/lu";

function TableComponent({ dataSource }) {
  const { columns } = useTableColumns();

  const actionColumn = {
    title: () => (
      <Gridmenu
        title={<PiSlidersHorizontalBold />}
        data={{ RegNo: true, Name: true, Rank: true, Duty: true, Station:true, Distric:true, Division:true, Address:true, Status:true, Updated:true, }}
      />
    ),
    key: "actions",
    width: 50,
  };

  return (
    <div className="common-table">
   <Table
  columns={[actionColumn, ...columns]}
  dataSource={tableData}
  scroll={{ x: '70%', y: 300 }}
  pagination={false}
  footer={() => (
    <div className="d-flex justify-content-between">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <span
          style={{
            marginRight: "4px",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          1-{tableData.length}
        </span>
        <span
          style={{
            marginRight: "4px",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          {" "}
          of {`${tableData.length}`}
        </span>
        <LuRefreshCw />
      </div>
      <Pagination
        defaultCurrent={1}
        total={tableData.length}
        pageSize={10}
      />
    </div>
  )}
  rowClassName={(record, index) =>
    index % 2 !== 0 ? "odd-row" : "even-row"
  }
/>
    </div>

  );
}

export default TableComponent;