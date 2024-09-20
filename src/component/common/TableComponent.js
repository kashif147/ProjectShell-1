import React, { useEffect, useState, useRef, useContext } from "react";
import { Table, Pagination, Space, Form, Input } from "antd";
// import { useTableColumns } from '../../context/TableColumnsContext';
import { useTableColumns } from "../../context/TableColumnsContext ";
import { LuRefreshCw } from "react-icons/lu";
import { BsSliders, BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";

import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { arrayMove } from "@dnd-kit/sortable";

import Gridmenu from "./Gridmenu";
import { Link } from "react-router-dom";
const EditableContext = React.createContext(null);

const SimpleMenu = ({ title, data, isCheckBox, isSearched, isTransparent }) => {
  // SimpleMenu implementation here
  return <div>{title}</div>;
};

const DraggableHeaderCell = ({ id, style, ...props }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
  // const dragState = useContext(DragIndexContext);

  const customStyle = {
    cursor: "move",
    border: `2px solid green`,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 9999,
          userSelect: "none",
          backgroundColor: "red",
          color: "white",
        }
      : {}),
  };

  return (
    <th
      className="custom-header"
      ref={setNodeRef}
      style={customStyle}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
};

const TableComponent = ({ dataSource, screenName, redirect }) => {
  const { columns, gridData, setGridData } = useTableColumns();
  const [columnsDragbe, setColumnsDragbe] = useState(() =>
    columns?.[screenName]
      ?.filter((item) => item?.isGride)
      ?.map((item, index) => ({
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
      setColumnsDragbe((prevColumns) => {
        const activeIndex = prevColumns.findIndex(
          (column) => column.key === active.id
        );
        const overIndex = prevColumns.findIndex(
          (column) => column.key === over.id
        );
        return arrayMove(prevColumns, activeIndex, overIndex);
      });
    }
    setDragIndex({ active: null, over: null });
  };

  const onDragOver = ({ active, over }) => {
    const activeIndex = columnsDragbe.findIndex(
      (column) => column.key === active.id
    );
    const overIndex = columnsDragbe.findIndex(
      (column) => column.key === over?.id
    );
    setDragIndex({
      active: active.id,
      over: over?.id,
      direction: overIndex > activeIndex ? "right" : "left",
    });
  };

  const draggableColumns = [
    {
      title: (
        <Gridmenu
          title={
            <BsSliders
              style={{ fontSize: "20px", color: "white", fontWeight: 600 }}
            />
          }
          data={columns?.[screenName]}
          screenName={screenName}
        />
      ),
      key: "gridmenu",
      width: 100,
      fixed: "left", // Ensure this column is fixed
      render: () => (
        <Space size="small" className="action-buttons">
          <CgAttachment style={{ fontSize: "15px", fontWeight: 500 }} />
          <SimpleMenu
            title={
              <BsThreeDotsVertical
                style={{ fontSize: "15px", fontWeight: 500 }}
              />
            }
            data={{ Delete: "false", Attached: "false", View: "false" }}
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
        <DraggableHeaderCell id={col.key} key={col.key}>
          {col.title}
        </DraggableHeaderCell>
      ),
      render: (text, record) =>
        col.title === "Full Name" ? (
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
      sorter:
        col.title === "Full Name"
          ? (a, b) => a[col.dataIndex]?.localeCompare(b[col.dataIndex])
          : undefined,
      sortDirections: ["ascend", "descend"],
    })),
  ];

  // Pagination Starts

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [currentPageData, setCurrentPageData] = useState(
    gridData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );
  useEffect(() => {
    setCurrentPageData(
      gridData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    );
  }, [currentPage, gridData]);

  // Pagination Ends

  //Editing Cell Starts Here
  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };
  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current?.focus();
      }
    }, [editing]);
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };
    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      } catch (errInfo) {
        console.log("Save failed:", errInfo);
      }
    };
    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingInlineEnd: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };
  const handleSave = (row) => {
    // console.log({ currentPageData });
    const newData = [...currentPageData];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setCurrentPageData(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const editableColumns = draggableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  // Editing Cell Ends Here

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <SortableContext
        items={columnsDragbe.map((column) => column.key)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="common-table">
          <Table
            // rowClassName={() => "editable-row"}
            components={components}
            columns={editableColumns}
            dataSource={currentPageData}
            pagination={false}
            bordered
            rowClassName={(record, index) => (index % 2 === 0 ? "even-row" : "odd-row" )}
            virtual
            rowKey="key"
            scroll={{ x: "100%", y: 440 }}
          />
         <div
  className="d-flex justify-content-between align-items-center tbl-footer"
  style={{ marginTop: "10px" }}
>
  {/* Centered refresh icon and text */}
  <div className="d-flex justify-content-center align-items-center w-100">
    <span
      style={{
        marginRight: "4px",
        fontSize: "12px",
        fontWeight: "500",
      }}
    >
      {currentPage}-{gridData.length}
    </span>
    <span
      style={{
        marginRight: "4px",
        fontSize: "12px",
        fontWeight: "500",
      }}
    >
      of {gridData.length}
    </span>
    <LuRefreshCw
      style={{ cursor: "pointer" }}
      onClick={() => window.location.reload()}
    />
  </div>

  {/* Pagination aligned to the right */}
  <div className="d-flex justify-content-end">
    <Pagination
      current={currentPage}
      pageSize={pageSize}
      total={gridData.length}
      onChange={(page) => setCurrentPage(page)} // Update page on pagination change
    />
  </div>
</div>

        </div>
      </SortableContext>
      <DragOverlay>
        {dragIndex.active && (
          <th style={{ backgroundColor: "lightgrey", padding: 16 }}>
            {
              columnsDragbe.find((column) => column.key === dragIndex.active)
                ?.title
            }
          </th>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default TableComponent;
