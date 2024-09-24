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
        title: 'Claim ID',
        dataIndex: 'claimId',
        key: 'claimId',
        fixed: 'left',
        width: 120,
    },
    {
        title: 'Claimant Name',
        dataIndex: 'claimantName',
        key: 'claimantName',
        width: 150,
    },
    {
        title: 'Claim Type',
        dataIndex: 'claimType',
        key: 'claimType',
        width: 150,
    },
    {
        title: 'Claim Status',
        dataIndex: 'claimStatus',
        key: 'claimStatus',
        filters: [
            { text: 'Pending', value: 'Pending' },
            { text: 'Approved', value: 'Approved' },
            { text: 'Denied', value: 'Denied' },
        ],
        onFilter: (value, record) => record.claimStatus.includes(value),
        width: 130,
    },
    {
        title: 'Amount Claimed',
        dataIndex: 'amountClaimed',
        key: 'amountClaimed',
        width: 150,
        render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
        title: 'Date Filed',
        dataIndex: 'dateFiled',
        key: 'dateFiled',
        width: 150,
    },
    {
        title: 'Assigned Adjuster',
        dataIndex: 'assignedAdjuster',
        key: 'assignedAdjuster',
        width: 180,
    },
    {
        title: 'Last Updated',
        dataIndex: 'lastUpdated',
        key: 'lastUpdated',
        width: 150,
    },
];

const dataSource = [
    {
        key: '1',
        claimId: 'CLM-00123',
        claimantName: 'John Doe',
        claimType: 'Auto Insurance',
        claimStatus: 'Pending',
        amountClaimed: 1500,
        dateFiled: '2024-09-21',
        assignedAdjuster: 'Jane Smith',
        lastUpdated: '2024-09-23',
    },
    {
        key: '2',
        claimId: 'CLM-00124',
        claimantName: 'Mary Jane',
        claimType: 'Health Insurance',
        claimStatus: 'Approved',
        amountClaimed: 5000,
        dateFiled: '2024-08-15',
        assignedAdjuster: 'Mike Johnson',
        lastUpdated: '2024-09-22',
    },
    {
        key: '3',
        claimId: 'CLM-00125',
        claimantName: 'Richard Roe',
        claimType: 'Property Insurance',
        claimStatus: 'Denied',
        amountClaimed: 12000,
        dateFiled: '2024-07-30',
        assignedAdjuster: 'Sarah Connor',
        lastUpdated: '2024-09-20',
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

    )
}

export default ClaimsById