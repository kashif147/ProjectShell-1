import React from 'react';
import SubTableComp from '../../component/common/SubTableComp';

function FinanceByID() {
  const columns = [
    {
      title: 'Batch Ref No',
      dataIndex: 'batchRefNo',
      key: 'batchRefNo',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Bank Account',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Advance',
      dataIndex: 'advance',
      key: 'advance',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Arrears',
      dataIndex: 'arrears',
      key: 'arrears',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      ellipsis: true,
      width: 200,
    },
  ];

  const dataSource = [
    {
      key: '1',
      batchRefNo: 'BRN001',
      paymentType: 'Bank Transfer',
      bankAccount: '1234567890',
      advance: '€200.00',
      totalAmount: '€300.00',
      arrears: '€100.00',
      comments: 'Late payment',
    },
    {
      key: '2',
      batchRefNo: 'BRN002',
      paymentType: 'Bank Transfer',
      bankAccount: '0987654321',
      advance: '€500.00',
      totalAmount: '€500.00',
      arrears: '€0.00',
      comments: 'On time',
    },
  ];

  return (
    <div className='cases-main'>
      <SubTableComp
        columns={columns}
        dataSource={dataSource}
        className='claims-table'
      />
    </div>
  );
}

export default FinanceByID;
