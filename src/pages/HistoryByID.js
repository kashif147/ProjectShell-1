import React from 'react';
import SubTableComp from '../../component/common/SubTableComp';

function HistoryByID() {
  const columns = [
    {
      title: 'Change Description',
      dataIndex: 'changeDescription',
      key: 'changeDescription',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Datetime',
      dataIndex: 'datetime',
      key: 'datetime',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      ellipsis: true,
      width: 180,
    },
  ];

  const dataSource = [
    {
      key: '1',
      changeDescription: 'Updated batch date',
      datetime: '2025-05-20 12:34',
      user: 'Alice Johnson',
      oldValue: '2025-05-01',
      newValue: '2025-05-15',
    },
    {
      key: '2',
      changeDescription: 'Corrected total amount',
      datetime: '2025-05-18 09:22',
      user: 'Bob Smith',
      oldValue: '€4,000',
      newValue: '€4,200',
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

export default HistoryByID;
