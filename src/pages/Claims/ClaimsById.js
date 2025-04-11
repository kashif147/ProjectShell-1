import { Table } from 'antd'
import React, { createContext, useContext, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
  } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";


const DragIndexContext = createContext({
    active: -1,
    over: -1,
  });
  const TableBodyCell = (props) => {
    const dragState = useContext(DragIndexContext);
    return (
      <td
        {...props}
        style={{
          ...props.style,
          ...dragActiveStyle(dragState, props.id),
        }}
      />
    );
  };
  const dragActiveStyle = (dragState, id) => {
    const { active, over, direction } = dragState;
    // drag active style
    let style = {};
    if (active && active === id) {
      style = {
        backgroundColor: 'gray',
        opacity: 0.5,
      };
    }
    // dragover dashed style
    else if (over && id === over && active !== over) {
      style =
        direction === 'right'
          ? {
              borderRight: '1px dashed gray',
            }
          : {
              borderLeft: '1px dashed gray',
            };
    }
    return style;
  };
  const TableHeaderCell = (props) => {
    const dragState = useContext(DragIndexContext);
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
      id: props.id,
    });
    const style = {
      ...props.style,
      cursor: 'move',
      ...(isDragging
        ? {
            position: 'relative',
            zIndex: 9999,
            userSelect: 'none',
          }
        : {}),
      ...dragActiveStyle(dragState, props.id),
    };
    return <th {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
  };

  const baseColumns = [
    {
        title: 'Claim Date',
        dataIndex: 'ClaimDate',
        key: 'ClaimDate',
        fixed: 'left',
        width: 120,
    },
    {
        title: 'Claim Type',
        dataIndex: 'ClaimType',
        key: 'ClaimType',
        width: 150,
    },
    {
        title: 'Start Date',
        dataIndex: 'StartDate',
        key: 'StartDate',
        // filters: [
        //     { text: 'Pending', value: 'Pending' },
        //     { text: 'Approved', value: 'Approved' },
        //     { text: 'Denied', value: 'Denied' },
        // ],
        // onFilter: (value, record) => record.claimStatus.includes(value),
        width: 130,
    },
    
    {
        title: 'End Date',
        dataIndex: 'EndDate',
        key: 'EndDate',
        // filters: [
        //     { text: 'Pending', value: 'Pending' },
        //     { text: 'Approved', value: 'Approved' },
        //     { text: 'Denied', value: 'Denied' },
        // ],
        // onFilter: (value, record) => record.claimStatus.includes(value),
        width: 130,
    },
    {
        title: 'Number Of Days',
        dataIndex: 'NumberOfDays',
        key: 'NumberOfDays',
        width: 150,
        render: (amount) => `${amount.toFixed(2)}`,
    },
    {
        title: 'Pay Amount',
        dataIndex: 'PayAmount',
        key: 'PayAmount',
        width: 150,
    },
    {
        title: 'Cheque No',
        dataIndex: 'ChequeNo',
        key: 'ChequeNo',
        width: 180,
    },
    {
        title: 'Description',
        dataIndex: 'Description',
        key: 'Description',
        width: 150,
    },
    
];

const dataSource = [
  {
    key: '1',
    ClaimDate: '2024-01-01',
    ClaimCategory: 'Medical',
    ClaimType: 'Reimbursement',
    StartDate: '2024-01-01',
    EndDate: '2024-01-05',
    NumberOfDays: 5,
    PayAmount: 1200.50,
    ChequeNo: 'CHK12345',
    Description: 'Claim for medical expenses',
  },
  {
    key: '2',
    ClaimDate: '2024-01-10',
    ClaimCategory: 'Travel',
    ClaimType: 'Advance',
    StartDate: '2024-01-08',
    EndDate: '2024-01-12',
    NumberOfDays: 4,
    PayAmount: 800.00,
    ChequeNo: 'CHK67890',
    Description: 'Travel expenses for conference',
  },
  {
    key: '3',
    ClaimDate: '2024-02-01',
    ClaimCategory: 'Office',
    ClaimType: 'Equipment',
    StartDate: '2024-01-25',
    EndDate: '2024-01-30',
    NumberOfDays: 6,
    PayAmount: 450.75,
    ChequeNo: 'CHK09876',
    Description: 'Office equipment purchase',
  },
  {
    key: '4',
    ClaimDate: '2024-02-15',
    ClaimCategory: 'Other',
    ClaimType: 'Miscellaneous',
    StartDate: '2024-02-10',
    EndDate: '2024-02-12',
    NumberOfDays: 2,
    PayAmount: 150.00,
    ChequeNo: 'CHK54321',
    Description: 'Miscellaneous expenses',
  },
];

  

function ClaimsById() {

    const [dragIndex, setDragIndex] = useState({
        active: -1,
        over: -1,
      });
      const [columns, setColumns] = useState(() =>
        baseColumns.map((column, i) => ({
          ...column,
          key: `${i}`,
          onHeaderCell: () => ({
            id: `${i}`,
          }),
          onCell: () => ({
            id: `${i}`,
          }),
        })),
      );
      const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
            distance: 1,
          },
        }),
      );

      const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
          setColumns((prevState) => {
            const activeIndex = prevState.findIndex((i) => i.key === active?.id);
            const overIndex = prevState.findIndex((i) => i.key === over?.id);
            return arrayMove(prevState, activeIndex, overIndex);
          });
        }
        setDragIndex({
          active: -1,
          over: -1,
        });
      };

      const onDragOver = ({ active, over }) => {
        const activeIndex = columns.findIndex((i) => i.key === active.id);
        const overIndex = columns.findIndex((i) => i.key === over?.id);
        setDragIndex({
          active: active.id,
          over: over?.id,
          direction: overIndex > activeIndex ? 'right' : 'left',
        });
      };

      const TableHeaderCell = (props) => {
        const dragState = useContext(DragIndexContext);
        const { attributes, listeners, setNodeRef, isDragging } = useSortable({
          id: props.id,
        });
        const style = {
          ...props.style,
          cursor: 'move',
          ...(isDragging
            ? {
                position: 'relative',
                zIndex: 9999,
                userSelect: 'none',
              }
            : {}),
          ...dragActiveStyle(dragState, props.id),
        };
        return <th {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
      };
    return (
      <div style={{width:'100%'}}>
        <DndContext
        sensors={sensors}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        collisionDetection={closestCenter}
      >
        <SortableContext items={columns.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
          <DragIndexContext.Provider value={dragIndex}>
          
            <Table
              rowKey="key"
              className='claims-table'
              columns={columns}
              bordered
              dataSource={dataSource}
              components={{
                header: {
                  cell: TableHeaderCell,
                },
                body: {
                  cell: TableBodyCell,
                },
              }}
              pagination={false}
            />
           
          </DragIndexContext.Provider>
        </SortableContext>
        <DragOverlay>
          <th
            style={{
              backgroundColor: 'gray',
              padding: 16,
            }}
          >
            {columns[columns.findIndex((i) => i.key === dragIndex.active)]?.title}
          </th>
        </DragOverlay>
      </DndContext>
      </div>
    )
}

export default ClaimsById