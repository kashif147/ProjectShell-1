import React, { useEffect, useRef } from "react";
import { Table, Pagination, Space } from "antd";
import { useTableColumns } from "../../context/TableColumnsContext ";
import Gridmenu from "./Gridmenu";
import { usePDF } from "react-to-pdf";
import { MoreOutlined } from "@ant-design/icons";
import { maleTblData } from "../../Data";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { LuRefreshCw } from "react-icons/lu";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import SimpleMenu from "./SimpleMenu";
import { tableData } from "../../Data";

function TableComponent({ dataSource, screenName, redirect }) {
  const inputRef = useRef(null);

  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const testing = {
    Delete: "false",
    Attached: "false",
    view: "false",
  };
  const { columns, state, isMale, gridData } = useTableColumns();
  const profilColumn = columns?.[screenName]?.filter((item) => item?.isVisible);
  console.log(columns, "columns");

  return (
    <div className="common-table" ref={inputRef}>
      <div className="common-table table-wrapper">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>
                <Gridmenu
                  title={
                    <PiSlidersHorizontalBold
                      style={{
                        fontSize: "24px",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  }
                  data={{
                    RegNo: true,
                    Name: true,
                    Rank: true,
                    Duty: true,
                    Station: true,
                    Distric: true,
                    Division: true,
                    Address: true,
                    Status: true,
                    Updated: true,
                    alpha: false,
                    beta: false,
                    giga: false,
                  }}
                  screenName={screenName}
                />
              </th>
              {profilColumn?.map((th) => (
                <th scope="col" key={th?.titleColumn}>
                  {th?.titleColumn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridData?.map((item, index) => (
              <tr key={item.key || index}>
                <td>
                  <Space size="small" className="action-buttons">
                    <CgAttachment
                      style={{ fontSize: "15px", fontWeight: 500 }}
                    />
                    <SimpleMenu
                      title={
                        <>
                          {" "}
                          <BsThreeDotsVertical
                            style={{ fontSize: "15px", fontWeight: 500 }}
                          />
                        </>
                      }
                      data={testing}
                      checkbox={false}
                      isSearched={false}
                      isTransparent={true}
                    />
                  </Space>
                </td>
                {profilColumn?.map((th) => (
                  <td key={th.titleColumn}>
                    {th?.titleColumn === "Name" ? (
                      <Link
                        to={redirect}
                        style={{ color: "blue" }}
                        state={{
                          search: screenName,
                          name: item.Name,
                          code: item?.RegNo,
                        }}
                      >
                        {item[th.titleColumn]}
                      </Link>
                    ) : (
                      item[th.titleColumn]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between tbl-footer">
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
            of {`${gridData.length}`}
          </span>
          <LuRefreshCw />
        </div>
        <Pagination defaultCurrent={1} total={gridData.length} pageSize={10} />
      </div>
    </div>
  );
}

export default TableComponent;
