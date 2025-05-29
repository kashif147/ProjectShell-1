import React from 'react';
import { Table } from 'antd';
import { FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import SubTableComp from '../common/SubTableComp';

// Example dataSource for documents
const documentsData = [
  {
    key: '1',
    name: 'Membership Form',
    dateUploaded: '2024-05-10 13:00',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    key: '2',
    name: 'Proof of Address',
    dateUploaded: '2024-04-15 16:00',
    fileUrl: 'https://filebin.net/5quhmub9s0izo9cv/proof.docx', // Ensure file name has extension
  },
  {
    key: '3',
    name: 'Financial Report',
    dateUploaded: '2024-03-20 09:30',
    fileUrl: 'https://filebin.net/5quhmub9s0izo9cv/financial.xlsx',
  },
];

// Utility to get icon based on file extension
const getFileIcon = (fileUrl) => {
  const extension = fileUrl.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return <FaFilePdf style={{ color: '#d9534f', fontSize: '20px' }} />;
    case 'doc':
    case 'docx':
      return <FaFileWord style={{ color: '#337ab7', fontSize: '20px' }} />;
    case 'xls':
    case 'xlsx':
      return <FaFileExcel style={{ color: '#5cb85c', fontSize: '20px' }} />;
    default:
      return <span>📄</span>;
  }
};

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
      <a
        href={record.fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
      >
        {getFileIcon(record.fileUrl)}
      </a>
    ),
  },
];

export default function DoucmentsById() {
  return <SubTableComp dataSource={documentsData} columns={columns} />;
}
