import React, { useEffect,useRef } from "react";
import { Table, Pagination,Space } from "antd";
import { useTableColumns } from "../../context/TableColumnsContext ";
import Gridmenu from "./Gridmenu";
import { usePDF } from 'react-to-pdf';
import { MoreOutlined } from "@ant-design/icons";
import { maleTblData } from "../../Data";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { LuRefreshCw } from "react-icons/lu";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import SimpleMenu from "./SimpleMenu";
import { tableData } from "../../Data";

function TableComponent({ dataSource }) {
  const inputRef = useRef(null);
  const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});
  const testing = {
    Delete: "false",
    Attached:"false",
    view:'false'
  };
  const { columns, state,isMale,gridData } = useTableColumns();
  const nameColumnIndex = columns.findIndex((col) => col.key === "Name");
  const modifiedColumns = columns.map((col, index) => {
    if (index === nameColumnIndex) {
      return {
        ...col,
        render: (text, record) => (
          <Link
            to={`/Details`}
            style={{ color: "blue" }}
            state={{ search: "Profile", name: record.Name }}
          >
            {text}
          </Link>
        ),
      };
    }
    return col;
  });

  const actionColumn = {
    title: () => (
      <Gridmenu
        title={
          <PiSlidersHorizontalBold
            style={{ fontSize: "24px", color: "white", fontWeight: 600 }}
          />
        }
        data={{
          RegNo: true,
          Name: true,
          Rank: false,
          Duty: false,
          Station: false,
          Distric: false,
          Division: false,
          Address: true,
          Status: false,
          Updated: false,
          alpha: false,
          beta: false,
          giga: false,
        }}
      />
    ),
    key: "actions",
    width: 100,
    render: (_, record) => (
      <Space size="middle" className="action-buttons">
        <CgAttachment />
        <SimpleMenu
          title={
            <>
              {" "}
              <BsThreeDotsVertical />
            </>
          }
          data={testing}
          checkbox={false}
          isSearched={false}
          isTransparent={true}
        />
      </Space>
    ),
  };
console.log(gridData,"gridData")


  return (
    <div className="common-table" ref={inputRef}>
      <Table 
        columns={[actionColumn, ...modifiedColumns]}
        dataSource={gridData}
        scroll={{ x: "100%", y: 300 }}
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
                1-{gridData.length}
              </span>
              <span
                style={{
                  marginRight: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {" "}
                of {`${gridData.length}`}
              </span>
              <LuRefreshCw />
            </div>
            <Pagination
              defaultCurrent={1}
              total={gridData.length}
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
