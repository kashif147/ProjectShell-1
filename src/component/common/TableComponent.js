import React, { useEffect, useState, useRef, useContext } from "react";
import { Table, Pagination, Space, Form, Input, Checkbox } from "antd";
// import { useTableColumns } from '../../context/TableColumnsContext';
import { useTableColumns } from "../../context/TableColumnsContext ";
import { LuRefreshCw } from "react-icons/lu";
import { BsSliders, BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import SimpleMenu from "./SimpleMenu";

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
  const { columns, gridData, setGridData, getProfile } = useTableColumns();
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

  const [columnsForFilter, setColumnsForFilter] = useState(() =>
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

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (key) => {
    const newSelectedRowKeys = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter(k => k !== key)
      : [...selectedRowKeys, key];
    setSelectedRowKeys(newSelectedRowKeys);
  };
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
      title: () => (
        <Checkbox
          style={{ marginLeft: "12px" }}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < dataSource.length}
          onChange={e => {
            const checked = e.target.checked;
            setSelectedRowKeys(checked ? dataSource.map(item => item.key) : []);
          }}
        />
      ),
      key: 'selection',
      width: 50,
      fixed: 'left',
      render: (text, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={() => onSelectChange(record.key)}
        />
      ),
    },
    {
      title: (
        <Gridmenu
          title={<BsSliders style={{ fontSize: "20px", color: "white", fontWeight: 600 }} />}
          columnsForFilter={columnsForFilter}
          setColumnsForFilter={setColumnsForFilter}
          screenName={screenName}
          data={columnsDragbe}
          setColumnsDragbe={setColumnsDragbe}
        />
      ),
      key: "gridmenu",
      width: 75,
      fixed: "left",
      render: () => (
        <Space size="small" className="action-buttons">
          <CgAttachment style={{ fontSize: "15px", fontWeight: 500 }} />
          <SimpleMenu
            title={<BsThreeDotsVertical style={{ fontSize: "15px", fontWeight: 500 }} />}
            data={{ Delete: "false", Attached: "false", View: "false", "Print Label": "false" }}
            isCheckBox={false}
            isSearched={false}
            isTransparent={true}
          />
        </Space>
      ),
    },
    ...columnsDragbe.map((col) => ({
      ...col,
      title: (
        <DraggableHeaderCell id={col.key} key={col.key}>
          {col.title}
        </DraggableHeaderCell>
      ),
      render: (text, record) =>
        col.title === "Full Name" ? (
          <Link
            to="/Details"
            state={{
              search: screenName,
              name: record?.fullName,
              code: record?.regNo,
            }}
            onClick={() => getProfile([record])}
          >
            <span style={{ textOverflow: "ellipsis" }}>
              {text}
            </span>
          </Link>
        ) : col.title === "Claim No" ? (
          <Link
            to="/ClaimsById"
            state={{
              search: screenName,
              name: record?.fullName,
              code: record?.regNo,
              Forename: record?.forename,
              Fullname: record?.surname,
              DateOfBirth: record?.dateOfBirth,
            }}
            onClick={() => getProfile(record)}
          >
            <span style={{ textOverflow: "ellipsis" }}>
              {text}
            </span>
          </Link>
        ) : (
          <span style={{ textOverflow: "ellipsis" }}>
            {text}
          </span>
        ),
        sorter:
        col.title === "Full Name"
          ? {
              compare: (a, b) => a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
              multiple: 3,
            }
          : col.title === "Station"
          ? {
              compare: (a, b) => a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
              multiple: 2,
            }
            :col.title === "Duty"?
            {
              compare: (a, b) => a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
              multiple: 1,
            }
          : undefined,
      sortDirections: ["ascend", "descend"],
      filters: col.title === "Station" ? [
        { text: 'GALC', value: 'GALC' },
        { text: 'DUBC', value: 'DUBC' },
        { text: 'STOC', value: 'STOC' },
      ] : col.title === "Division" ? [
        { text: '0026', value: '0026' },
        { text: '0031', value: '0031' },
        { text: '0045', value: '0045' },
      ] : undefined,
      onFilter: (value, record) => {
        if (col.title === "Station") {
          return record[col.dataIndex] === value;
        } else if (col.title === "Division") {
          return record[col.dataIndex] === value;
        }
        return true;
      },
    })),
  ];

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [currentPageData, setCurrentPageData] = useState([]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(dataSource.slice(startIndex, endIndex));
  }, [currentPage, dataSource]); // Runs whenever currentPage or gridData changes

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
            width: '1px'
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
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setGridData(newData);
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
            rowClassName={() => ""}
            components={components}
            columns={editableColumns}
            dataSource={currentPageData}
            pagination={false}
            bordered
            virtual
            scroll={{ x: "100%", y: 350 }}
            sticky
          />
          <div
            className="d-flex justify-content-between align-items-center tbl-footer"
            style={{ marginTop: "10px" }}
          >
            <div className="d-flex justify-content-center align-items-center" style={{ flex: 1 }}>
              <span
                style={{
                  marginRight: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, dataSource.length)}`}
              </span>
              <span
                style={{
                  marginRight: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                of {dataSource.length}
              </span>
              <LuRefreshCw
                style={{ cursor: "pointer", marginLeft: "10px" }}
                onClick={() => window.location.reload()}
              />
            </div>
            <div className="d-flex justify-content-end">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={dataSource.length}
                onChange={(page) => setCurrentPage(page)}
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
