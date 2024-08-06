import React from 'react'
import { useLocation } from 'react-router-dom';
import { Table,Space, Button, Pagination } from 'antd';
import { CiEdit } from "react-icons/ci";
import { FiDelete } from "react-icons/fi";
import { tableData } from '../Data';
import { LuRefreshCw } from "react-icons/lu";

export default function Projects() {
    const location = useLocation();
    // const currentURL = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
    const currentURL = `${location.hash}`;
    let { state } = useLocation();
    console.log(currentURL,"submenu")
    const columns = [
        {
          title: 'Action',
          render: (_, record) => (
            <Space size="middle" className="action-buttons">
              <CiEdit />
              <FiDelete color='red' />
              {/* <Button >Edit</Button>
              <Button >Delete</Button> */}
            </Space>)
        },
        {
          title: 'Reg No',
          dataIndex: 'RegNo',
          key: 'RegNo',
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Rank',
          dataIndex: 'rank',
          key: 'rank',
        },
        {
          title: 'Duty',
          dataIndex: 'duty',
          key: 'duty',
        },
        {
          title: 'Station',
          dataIndex: 'station',
          key: 'station',
        },
        {
          title: 'Distric',
          dataIndex: 'distric',
          key: 'distric',
        },
        {
          title: 'Division',
          dataIndex: 'division',
          key: 'division',
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: 'Attested',
          dataIndex: 'attested',
          key: 'attested',
        },
        {
          title: 'Graduated',
          dataIndex: 'graduated',
          key: 'graduated',
        },
        {
          title: 'Updated',
          dataIndex: 'updated',
          key: 'updated',
        },
      ];
     
  return (
    
    <div>
      <Table dataSource={tableData} columns={columns} 
      className='Project-table'
        pagination={false}
          rowClassName={(record, index) => (index % 2 !== 0 ? 'odd-row' : 'even-row')}
          footer={() => (
            <div className='d-flex justify-content-between'>
            <div style={{ display: 'flex',  alignItems: 'center', justifyContent:'center', width:'100%' }}>
              <span style={{marginRight:'4px', fontSize:'12px', fontWeight:"500"}}>1-{tableData.length}</span>
              <span style={{marginRight:'4px',fontSize:'12px', fontWeight:"500" }}> of  {`${tableData.length}`}</span>
             <LuRefreshCw />
            </div>
              <Pagination defaultCurrent={1} total={tableData.length} pageSize={5} />
            </div>
          )}
      />
    </div>
  )
}
