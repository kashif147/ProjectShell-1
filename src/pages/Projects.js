import React from 'react'
import { useLocation } from 'react-router-dom';
import { Table,Space, Button } from 'antd';
import { CiEdit } from "react-icons/ci";
import { FiDelete } from "react-icons/fi";

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
          dataIndex: 'age',
          key: 'age',
        },
        {
          title: 'Name',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Duty',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Station',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Division',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Status',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Attested',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Graduated',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Updated',
          dataIndex: 'address',
          key: 'address',
        },
      ];
      const dataSource = [
        {
          key: '1',
          name: 'Mike',
          age: 32,
          address: '10 Downing Street',
        },
        {
          key: '2',
          name: 'John',
          age: 42,
          address: '10 Downing Street',
        },
      ];
  return (
    
    <div>
      <Table dataSource={dataSource} columns={columns} bordered 
          rowClassName={(record, index) => (index % 2 !== 0 ? 'odd-row' : 'even-row')}
      />;
    </div>
  )
}
