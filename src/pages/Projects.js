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
      const dataSource = [
        {
          key: '1',
          name: 'Jack Smith',
          RegNo: "56606L",
          rank:"0001",
          duty:"Garda",
          station:"STOC",
          distric:"0109",
          division:"0026",
          address:"Phoenix Park, Saint James",
          status:"Member",
          attested:"01/01/1988",
          graduated:"01/09/1987",
          updated:'12/04/2022 13:29'
        },
        {
          key: '1',
          name: 'Jack Smith',
          RegNo: "56606L",
          rank:"0001",
          duty:"Garda",
          station:"STOC",
          distric:"0109",
          division:"0026",
          address:"Phoenix Park, Saint James",
          status:"Member",
          attested:"01/01/1988",
          graduated:"01/09/1987",
          updated:'12/04/2022 13:29'
        },
        {
          key: '2',
          name: 'Jack Smith',
          RegNo: "56606L",
          rank:"0001",
          duty:"Garda",
          station:"STOC",
          distric:"0109",
          division:"0026",
          address:"Phoenix Park, Saint James",
          status:"Member",
          attested:"01/01/1988",
          graduated:"01/09/1987",
          updated:'12/04/2022 13:29'
        },
        {
          key: '3',
          name: 'Jack Smith',
          RegNo: "56606L",
          rank:"0001",
          duty:"Garda",
          station:"STOC",
          distric:"0109",
          division:"0026",
          address:"Phoenix Park, Saint James",
          status:"Member",
          attested:"01/01/1988",
          graduated:"01/09/1987",
          updated:'12/04/2022 13:29'
        },
        {
          key: '4',
          name: 'Jack Smith',
          RegNo: "56606L",
          rank:"0001",
          duty:"Garda",
          station:"STOC",
          distric:"0109",
          division:"0026",
          address:"Phoenix Park, Saint James",
          status:"Member",
          attested:"01/01/1988",
          graduated:"01/09/1987",
          updated:'12/04/2022 13:29'
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
