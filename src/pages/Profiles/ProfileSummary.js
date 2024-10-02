import React from "react";
import { useLocation } from "react-router-dom";
import { Table, Space, Button, Pagination, Select, Dropdown, Menu } from "antd";
import { CiEdit } from "react-icons/ci";
import { FiDelete } from "react-icons/fi";
import { tableData } from "../../Data";
import { LuRefreshCw } from "react-icons/lu";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { MdOutlineAttachment } from "react-icons/md";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { BsThreeDots } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import {useTableColumns} from "../../context/TableColumnsContext "

import SimpleMenu from "../../component/common/SimpleMenu";
import TableComponent from "../../component/common/TableComponent";
function ProfileSummary() {
  const navigate = useNavigate();
   const{gridData} = useTableColumns()
  const menu = (
    <Menu>
      <Menu.Item key="1">Option 1</Menu.Item>
      <Menu.Item key="2">Option 2</Menu.Item>
      <Menu.Item key="3">Option 3</Menu.Item>
    </Menu>
  );
  const testing = {
    Delete: "false",
    Attached:"false",
    view:'false'
  };
  const configuration = {
    Graduated: "false",
    Updated:"false",
    
  };
  const dataSource = [
   
  ];
  const location = useLocation();
  // const currentURL = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
  const currentURL = `${location.hash}`;
  let { state } = useLocation();

  const columns = [
    {
      title: "Action",
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
      width: 100,
    },
    {
      title: "Reg No",
      dataIndex: "RegNo",
      key: "RegNo",
      width: 100,
      // render: (text) => <div className="table-cell-content">{text}</div>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100,
      render: (_, record) => (
        <Space>
          <Link to="/Details" state={{ search: "Profile" }}>
            {record?.name}
          </Link>
        </Space>
      ),
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 100,
      align: 'center',
    },
    {
      title: "Duty",
      dataIndex: "duty",
      key: "duty",
      width: 100,
      align: 'center',
    },
    {
      title: "Station",
      dataIndex: "station",
      key: "station",
      width: 100,
      align: 'center',
    },
    {
      title: "Distric",
      dataIndex: "distric",
      key: "distric",
      width: 100,
      align: 'center',
    },
    {
      title: "Division",
      dataIndex: "division",
      key: "division",
      width: 100,
      align: 'center',
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 300,
      align: 'center',
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: 'center',
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: 'center',
    },
    {
      title: "Attested",
      dataIndex: "attested",
      key: "attested",
      width: 100,
      align: 'center',
    },
    {
      title: "Graduated",
      dataIndex: "graduated",
      key: "graduated",
      width: 100,
      align: 'center',
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      width: 150,
      align: 'center',
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      width: 150,
      align: 'center',
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      width: 150,
      align: 'center',
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      width: 150,
      align: 'left',
    },
    {
      title: (
        <div className="fixed-header">
          {" "}
          <SimpleMenu
            title={
              <>
                {" "}
                <PiSlidersHorizontalBold
                  style={{ fontSize: "24px", color: "#fff" }}
                />
              </>
            }
            data={configuration}
            isSearched={true}
            isTransparent={true}
          />
        </div>
      ),
      render: (_, record) => <Space size="middle"></Space>,
      width: 56,
      fixed: "right",
    },
  ];

  return (
    <div className="">
    <TableComponent dataSource={gridData}  screenName="Profile" redirect="/Details" />
    </div>
  );
}
export default ProfileSummary;