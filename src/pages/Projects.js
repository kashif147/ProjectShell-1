import React from 'react'
import { useLocation } from 'react-router-dom';
import { Table,Space, Button, Pagination,Select, Dropdown, Menu, } from 'antd';
import { CiEdit } from "react-icons/ci";
import { FiDelete } from "react-icons/fi";
import { tableData } from '../Data';
import { LuRefreshCw } from "react-icons/lu";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';

export default function Projects() {
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
          title: 'Action',
          render: (_, record) => (
            <Space size="middle" className="action-buttons">
              <CiEdit />
              <FiDelete color='red' />
              {/* <Button >Edit</Button>
              <Button >Delete</Button> */}
            </Space>),
            width:100,
        },
        {
          title: 'Reg No',
          dataIndex: 'RegNo',
          key: 'RegNo',
          width:100,
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width:100,
          render:(_,record)=>(
            <Space>
              {/* <p onClick={()=>navigate("Details")}>
              {record?.name }
              </p> */}
           <Link to="Details" state={{ search: "" }}>
           {record?.name}
           </Link>
            </Space>
          )
        },
        {
          title: 'Rank',
          dataIndex: 'rank',
          key: 'rank',
          width:100,
        },
        {
          title: 'Duty',
          dataIndex: 'duty',
          key: 'duty',
          width:100,
        },
        {
          title: 'Station',
          dataIndex: 'station',
          key: 'station',
          width:100,
        },
        {
          title: 'Distric',
          dataIndex: 'distric',
          key: 'distric',
          width:100,
        },
        {
          title: 'Division',
          dataIndex: 'division',
          key: 'division',
          width:100,
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
          width:300,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width:100,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width:100,
        },
        {
          title: 'Attested',
          dataIndex: 'attested',
          key: 'attested',
          width:100,
        },
        {
          title: 'Graduated',
          dataIndex: 'graduated',
          key: 'graduated',
          width:100,
        },
        {
          title: 'Updated',
          dataIndex: 'updated',
          key: 'updated',
          width:150,
        },
        {
          title: 'Updated',
          dataIndex: 'updated',
          key: 'updated',
          width:150,
        },
        {
          title: 'Updated',
          dataIndex: 'updated',
          key: 'updated',
          width:150,
        },
        {
          title: 'Updated',
          dataIndex: 'updated',
          key: 'updated',
          width:150,
        },
        {
          title: <MdOutlineSettingsInputComponent />,
          render: (_, record) => (
            <Space size="middle" className="">

            </Space>),
            width:56,
            fixed: 'right',
        },

      ];
     
  return (
    <div className=''>
      <Table dataSource={tableData} columns={columns} 
       scroll={{ x: 300, y: 300 }}
      className='Project-table '
        pagination={false}
          rowClassName={(record, index) => (index % 2 !== 0 ? 'odd-row' : 'even-row')}
          footer={() => (
            <div className='d-flex justify-content-between'>
            <div style={{ display: 'flex',  alignItems: 'center', justifyContent:'center', width:'100%' }}>
              <span style={{marginRight:'4px', fontSize:'12px', fontWeight:"500"}}>1-{tableData.length}</span>
              <span style={{marginRight:'4px',fontSize:'12px', fontWeight:"500" }}> of  {`${tableData.length}`}</span>
             <LuRefreshCw />
            </div>
              <Pagination defaultCurrent={1} total={tableData.length} pageSize={10} />
            </div>
          )}
      />
    </div>
  )
}
