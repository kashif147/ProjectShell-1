import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '../../context/CampaignDetailsProvider';
import { useTableColumns } from '../../context/TableColumnsContext ';
import { campaigns } from '../../Data';
import ReminderListItem from '../../component/reminders/ReminderListItem';
import UnifiedPagination from '../../component/common/UnifiedPagination';

function RemindersSummary() {
  const navigate = useNavigate();
  const { getRemindersById } = useReminders();
  const { disableFtn } = useTableColumns();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);

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

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

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

      {/* Pagination - Fixed at Bottom, Centered */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #e8e8e8',
        flexShrink: 0
      }}>
        <UnifiedPagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={handlePageChange}
          onShowSizeChange={(current, size) => {
            setCurrentPage(1);
            setPageSize(size);
          }}
          itemName="reminders"
          showSizeChanger={true}
        />
      </div>
    </div>
  );
}

export default RemindersSummary;