import React from 'react';
import SubTableComp from '../../component/common/SubTableComp'; // Make sure the path is correct

const CommunicationHistory = () => {
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  const documentsData = [
    {
      key: '1',
      type: 'Call',
      date: '2024-09-01',
      notes: 'Spoke with member regarding benefits.',
    },
    {
      key: '2',
      type: 'Letter',
      date: '2024-09-05',
      notes: 'Sent confirmation letter.',
    },
    {
      key: '3',
      type: 'Mail',
      date: '2024-09-10',
      notes: 'Received claim support email.',
    },
  ];

  return <SubTableComp dataSource={documentsData} columns={columns} />;
};

export default CommunicationHistory;
