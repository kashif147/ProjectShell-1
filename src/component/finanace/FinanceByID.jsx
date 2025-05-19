import React from 'react'
import { Table } from 'antd';
// import "../../styles/ClaimsById.css";
import SubTableComp from '../../component/common/SubTableComp';

function FinanceByID() {
    
const columns = [
//   {
//     title: 'Member Name',
//     dataIndex: 'Member Name',
//     key: 'Member Name',
//     ellipsis: true,
//     width: 150,
//   },
  {
    title: 'Bank Account',
    dataIndex: 'Bank Account',
    key: 'Bank Account',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Payroll No',
    dataIndex: 'Payroll No',
    key: 'Payroll No',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Arrears',
    dataIndex: 'Arrears',
    key: 'Arrears',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Comments',
    dataIndex: 'Comments',
    key: 'Comments',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Advance',
    dataIndex: 'Advance',
    key: 'Advance',
    ellipsis: true,
    width: 100,
  },
  {
    title: 'Total Amount',
    dataIndex: 'Total Amount',
    key: 'Total Amount',
    ellipsis: true,
    width: 100,
  },
];
const dataSource = [
  {
    key: '1',
    'Member Name': 'John Doe',
    'Bank Account': '1234567890',
    'Payroll No': 'P001',
    Arrears: '100.00',
    Comments: 'Late payment',
    Advance: '200.00',
    'Total Amount': '300.00',
  },
  {
    key: '2',
    'Member Name': 'Jane Smith',
    'Bank Account': '0987654321',
    'Payroll No': 'P002',
    Arrears: '0.00',
    Comments: 'On time',
    Advance: '500.00',
    'Total Amount': '500.00',
  },
];
  return (
    <div className='cases-main'>
<Table columns={columns} dataSource={dataSource}  className='claims-table'/>
<SubTableComp columns={columns} dataSource={dataSource} className='claims-table'/>
    </div>
  )
}

export default FinanceByID