import React, { useState } from 'react';
import { Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '../../context/CampaignDetailsProvider';
import { useTableColumns } from '../../context/TableColumnsContext ';
import { campaigns } from '../../Data';
import ReminderListItem from '../../component/reminders/ReminderListItem';

function RemindersSummary() {
  const navigate = useNavigate();
  const { getRemindersById } = useReminders();
  const { disableFtn } = useTableColumns();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const handleView = (item) => {
    navigate('/RemindersDetails');
    getRemindersById(item?.id);
    if (item?.isSelected === true) {
      disableFtn(true);
    } else {
      disableFtn(false);
    }
  };

  const handleEdit = (item) => {
    console.log('Edit item:', item);
  };

  const filteredData = campaigns;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f5f5f5', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* List Items - Scrollable Area */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginBottom: '16px',
        paddingRight: '8px',
      }}>
        {paginatedData.map((item) => (
          <ReminderListItem
            key={item.id}
            item={item}
            onView={handleView}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Pagination - Fixed at Bottom */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #e8e8e8',
        flexShrink: 0
      }}>
        <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
          Pagination
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
        <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
          Pagination
        </div>
      </div>
    </div>
  );
}

export default RemindersSummary;