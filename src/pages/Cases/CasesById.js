import React from 'react'
import SubTableComp from '../../component/common/SubTableComp'
import { Space } from 'antd';
import  "../../styles/CasesById.css";




  
function CasesById() {
    const viewCase = (caseId) => {
        console.log(`Viewing case: ${caseId}`);
        // View case logic
      };
      
      const editCase = (caseId) => {
        console.log(`Editing case: ${caseId}`);
        // Edit case logic
      };
      
      const deleteCase = (caseId) => {
        console.log(`Deleting case: ${caseId}`);
        // Delete case logic
      };
      const caseColumns = [
        {
          title: 'Case ID',
          dataIndex: 'caseId',
          key: 'caseId',
          width: 100,
        },
        {
          title: 'Case Title',
          dataIndex: 'caseTitle',
          key: 'caseTitle',
          width: 200,
        },
        {
          title: 'Assigned To',
          dataIndex: 'assignedTo',
          key: 'assignedTo',
          width: 150,
        },
        {
          title: 'Start Date',
          dataIndex: 'startDate',
          key: 'startDate',
          width: 150,
        },
        {
          title: 'Due Date',
          dataIndex: 'dueDate',
          key: 'dueDate',
          width: 150,
        },
        {
          title: 'Status',
          dataIndex: 'caseStatus',
          key: 'caseStatus',
          filters: [
            { text: 'Open', value: 'Open' },
            { text: 'In Progress', value: 'In Progress' },
            { text: 'Closed', value: 'Closed' },
          ],
          onFilter: (value, record) => record.caseStatus.indexOf(value) === 0,
          width: 150,
        },
        {
          title: 'Priority',
          dataIndex: 'priority',
          key: 'priority',
          filters: [
            { text: 'High', value: 'High' },
            { text: 'Medium', value: 'Medium' },
            { text: 'Low', value: 'Low' },
          ],
          onFilter: (value, record) => record.priority.indexOf(value) === 0,
          width: 120,
        },
        {
          title: 'Action',
          key: 'action',
          fixed: 'right',
          width: 100,
          render: (text, record) => (
            <Space size="middle">
              <a onClick={() => viewCase(record.caseId)}>View</a>
              <a onClick={() => editCase(record.caseId)}>Edit</a>
              <a onClick={() => deleteCase(record.caseId)}>Delete</a>
            </Space>
          ),
        },
      ];
      
      const caseDataSource = [
        {
          key: '1',
          caseId: 'C001',
          caseTitle: 'John Doe vs. ABC Corp',
          assignedTo: 'Jane Smith',
          startDate: '2024-09-15',
          dueDate: '2024-10-01',
          caseStatus: 'Open',
          priority: 'High',
        },
        {
          key: '2',
          caseId: 'C002',
          caseTitle: 'XYZ Ltd. vs. DEF Corp',
          assignedTo: 'John Johnson',
          startDate: '2024-08-01',
          dueDate: '2024-09-30',
          caseStatus: 'In Progress',
          priority: 'Medium',
        },
        {
          key: '3',
          caseId: 'C003',
          caseTitle: 'Mary Johnson vs. Hospital X',
          assignedTo: 'Sarah Davis',
          startDate: '2024-07-10',
          dueDate: '2024-08-20',
          caseStatus: 'Closed',
          priority: 'Low',
        },
      ];
  return (
    <div className='cases-main'>
<SubTableComp columns={caseColumns} dataSource={caseDataSource} />

    </div>
  )
}

export default CasesById