import React from 'react';
import { Table, Button } from 'antd';
import SubTableComp from '../common/SubTableComp';

// Example dataSource for documents
const documentsData = [
  {
    key: '1',
    name: 'Membership Form',
    dateUploaded: '2024-05-10 13:00',
    // fileUrl: '/files/membership-form.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    key: '2',
    name: 'Proof of Address',
    dateUploaded: '2024-04-15 16:00',
    fileUrl: 'https://filebin.net/5quhmub9s0izo9cv',
  },
];

const columns = [
  {
    title: 'Document Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Date Uploaded',
    dataIndex: 'dateUploaded',
    key: 'dateUploaded',
  },
  {
  title: 'Download',
  key: 'download',
  render: (_, record) => (
    <Button
      type="link"
      href={record.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      View
    </Button>
  ),
}
];

export default function DoucmentsById() {
  return (

    <SubTableComp dataSource={documentsData} columns={columns} />
  );
}
