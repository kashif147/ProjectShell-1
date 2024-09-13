import React from 'react'
import { useLocation } from "react-router-dom";
import { Table, Space, Button, Pagination, Select, Dropdown, Menu } from "antd";
import { CiEdit } from "react-icons/ci";
import { FiDelete } from "react-icons/fi";
import { tableData } from "../../Data";
import { LuRefreshCw } from "react-icons/lu";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import TableComponent from "../../component/common/TableComponent";
import GridWithAGGrid from '../../GridWithAGGrid';


function Claims() {
    const navigate = useNavigate();

    const menu = (
      <Menu>
        <Menu.Item key="1">Option 1</Menu.Item>
        <Menu.Item key="2">Option 2</Menu.Item>
        <Menu.Item key="3">Option 3</Menu.Item>
      </Menu>
    );
  
    const location = useLocation();
    // const currentURL = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
    const currentURL = `${location.hash}`;
    let { state } = useLocation();
  
    const columns = [
      {
        title: "Action",
        render: (_, record) => (
          <Space size="middle" className="action-buttons">
            <CiEdit />
            <FiDelete color="red" />
            {/* <Button >Edit</Button>
                  <Button >Delete</Button> */}
          </Space>
        ),
        width: 100,
      },
      {
        title: "Reg No",
        dataIndex: "RegNo",
        key: "RegNo",
        width: 100,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        render: (_, record) => (
          <Space>
             <Link to="/CasesDetails" state={{ search: "Cases" }}>
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
      },
      {
        title: "Duty",
        dataIndex: "duty",
        key: "duty",
        width: 100,
      },
      {
        title: "Station",
        dataIndex: "station",
        key: "station",
        width: 100,
      },
      {
        title: "Distric",
        dataIndex: "distric",
        key: "distric",
        width: 100,
      },
      {
        title: "Division",
        dataIndex: "division",
        key: "division",
        width: 100,
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        width: 300,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
      },
      {
        title: "Attested",
        dataIndex: "attested",
        key: "attested",
        width: 100,
      },
      {
        title: "Graduated",
        dataIndex: "graduated",
        key: "graduated",
        width: 100,
      },
      {
        title: "Updated",
        dataIndex: "updated",
        key: "updated",
        width: 150,
      },
      {
        title: "Updated",
        dataIndex: "updated",
        key: "updated",
        width: 150,
      },
      {
        title: "Updated",
        dataIndex: "updated",
        key: "updated",
        width: 150,
      },
      {
        title: "Updated",
        dataIndex: "updated",
        key: "updated",
        width: 150,
      },
      {
        title: (
          <div className="fixed-header">
            {" "}
            <PiSlidersHorizontalBold style={{ fontSize: "24px" }} />{" "}
          </div>
        ),
        render: (_, record) => <Space size="middle"></Space>,
        width: 56,
        fixed: "right",
      },
    ];
  
    return (
      <div className="">
      {/* <TableComponent screenName="Cases" redirect="/CasesDetails" /> */}
      <GridWithAGGrid />
    </div>
    );
  }

export default Claims

