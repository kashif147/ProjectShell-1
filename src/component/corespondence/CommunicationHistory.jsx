import { FaFileDownload } from 'react-icons/fa';
import SubTableComp from '../../component/common/SubTableComp'; // Make sure the path is correct

const CommunicationHistory = () => {
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width:150,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width:150,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      width:300,
    },
    {
      title: 'Document',
      dataIndex: 'document',
      key: 'document',
      width:120,
      render: (text, record) => (
        record.documentUrl ? (
          <a href={record.documentUrl} download target="_blank" rel="noopener noreferrer">
            <FaFileDownload style={{ fontSize: '18px', color: '#1890ff' }} />
          </a>
        ) : (
          '—'
        )
      ),
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
      documentUrl: '/files/dummy.pdf', // Put the correct path here
    },
    {
      key: '3',
      type: 'Mail',
      date: '2024-09-10',
      notes: 'Received claim support email.',
      documentUrl: '/files/dummy.pdf', // Put the correct path here
    },
  ];

  // return ;
  return  <div className='cases-main'><SubTableComp   className='claims-table' dataSource={documentsData} columns={columns} /></div> ;
};

export default CommunicationHistory;
