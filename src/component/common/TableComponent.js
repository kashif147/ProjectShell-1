import React, { useState } from 'react';
import { Table, Pagination, Space } from 'antd';
// import { useTableColumns } from '../../context/TableColumnsContext';
import { useTableColumns } from '../../context/TableColumnsContext ';
import { LuRefreshCw } from 'react-icons/lu';
import { BsSliders, BsThreeDotsVertical } from 'react-icons/bs';
import { CgAttachment } from 'react-icons/cg';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import Gridmenu from './Gridmenu';
import { Link } from "react-router-dom";


const SimpleMenu = ({ title, data, isCheckBox, isSearched, isTransparent }) => {
  // SimpleMenu implementation here
  return <div>{title}</div>;
};

const DraggableHeaderCell = ({ id, style, ...props }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
  // const dragState = useContext(DragIndexContext);

  const customStyle = {
    
    cursor: 'move',
     border: `2px solid green`,
    ...(isDragging ? { position: 'relative', zIndex: 9999, userSelect: 'none', backgroundColor:"red", color:"white" } : {}),
  };

  return (
    <th className="custom-header" ref={setNodeRef} style={customStyle} {...attributes} {...listeners} {...props} />
  );
};

const TableComponent = ({ dataSource, screenName,redirect }) => {
  const { columns, gridData } = useTableColumns();
  const [columnsDragbe, setColumnsDragbe] = useState(() =>
    columns?.[screenName]?.filter(item => item?.isGride)?.map((item, index) => ({
      ...item,
      key: `${index}`,
      onHeaderCell: () => ({ id: `${index}` }),
      onCell: () => ({ id: `${index}` }),
    }))
  );
  const [dragIndex, setDragIndex] = useState({ active: null, over: null });

  const reorderColumns = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setColumnsDragbe(prevColumns => {
        const activeIndex = prevColumns.findIndex(column => column.key === active.id);
        const overIndex = prevColumns.findIndex(column => column.key === over.id);
        return arrayMove(prevColumns, activeIndex, overIndex);
      });
    }
    setDragIndex({ active: null, over: null });
  };

  const onDragOver = ({ active, over }) => {
    const activeIndex = columnsDragbe.findIndex(column => column.key === active.id);
    const overIndex = columnsDragbe.findIndex(column => column.key === over?.id);
    setDragIndex({
      active: active.id,
      over: over?.id,
      direction: overIndex > activeIndex ? 'right' : 'left',
    });
  };

  const draggableColumns = [
    {
      title: (
        <Gridmenu
          title={<BsSliders style={{ fontSize: '20px', color: 'white', fontWeight: 600 }} />}
          data={columns?.[screenName]}
          screenName={screenName}
        />
      ),
      key: 'gridmenu',
      width: 100,
      fixed: 'left', // Ensure this column is fixed
      render: () => (
        <Space size="small" className="action-buttons">
          <CgAttachment style={{ fontSize: '15px', fontWeight: 500 }} />
          <SimpleMenu
            title={<BsThreeDotsVertical style={{ fontSize: '15px', fontWeight: 500 }} />}
            data={{ Delete: 'false', Attached: 'false', View: 'false' }}
            isCheckBox={false}
            isSearched={false}
            isTransparent={true}
          />
        </Space>
      ),
    },
    ...columnsDragbe.map((col, index) => ({
      ...col,
      title: (
        <DraggableHeaderCell
          id={col.key}
          key={col.key}
        >
          {col.title}
        </DraggableHeaderCell>
      ),
      render: (text, record) =>
        col.title === 'Full Name' ? (
          <Link
            to={redirect} // Replace with actual path and dynamic part if needed
            state={{
              search: screenName,
              name: record?.fullName, 
              code: record?.regNo, 
            }}
          >
            {text}
          </Link>
        ) : (
          text
        ),
        sorter: col.title === 'Full Name' ? (a, b) => a[col.dataIndex]?.localeCompare(b[col.dataIndex]) : undefined,
        sortDirections: ['ascend', 'descend'],
      })),
  ];
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <SortableContext items={columnsDragbe.map(column => column.key)} strategy={horizontalListSortingStrategy}>
        <div className="common-table">
          <Table
            columns={draggableColumns}
            dataSource={gridData}
            pagination={false}
            bordered
            virtual
            rowKey="key"
            scroll={{ x: 'max-content', y: '100px' }}
          />
          <div className="d-flex justify-content-between tbl-footer" style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '4px', fontSize: '12px', fontWeight: '500' }}>
                1-{gridData.length}
              </span>
              <span style={{ marginRight: '4px', fontSize: '12px', fontWeight: '500' }}>
                of {gridData.length}
              </span>
              <LuRefreshCw style={{ cursor: 'pointer' }} onClick={() => window.location.reload()} />
            </div>
            {/* <Pagination defaultCurrent={1} total={gridData.length} pageSize={5} /> */}
            <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={gridData.length}
        onChange={page => setCurrentPage(page)} // Update page on pagination change
      />
          </div>
        </div>
      </SortableContext>
      <DragOverlay>
        {dragIndex.active && (
          <th style={{ backgroundColor: 'lightgrey', padding: 16 }}>
            {columnsDragbe.find(column => column.key === dragIndex.active)?.title}
          </th>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default TableComponent;
