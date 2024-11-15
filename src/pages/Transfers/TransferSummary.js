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

import SimpleMenu from "../../component/common/SimpleMenu";
import TableComponent from "../../component/common/TableComponent";
function TransferSummary() {
  const navigate = useNavigate();

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
   
      <TableComponent dataSource={transferDataSource}  screenName="Transfer" redirect="/Details" />
    </div>
  );
}

export default TransferSummary;