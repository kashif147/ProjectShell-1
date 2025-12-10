import React, { useEffect, useState, useRef, useContext } from "react";
import { Table, Pagination, Space, Form, Input, Checkbox } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { LuRefreshCw } from "react-icons/lu";
import { BsSliders, BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import { MdKeyboard } from "react-icons/md";
import { ExcelContext } from "../../context/ExcelContext";
import { getApplicationById } from "../../features/ApplicationDetailsSlice";
import SimpleMenu from "./SimpleMenu"; import {
  filterTransferById,
  fetchAndFilterTransferById,
  filterTransferFromExistingData,
  clearFilteredTransfer,
  selectFilteredTransfer,
  selectFilteredLoading,
  selectFilteredError
} from '../../features/profiles/filterTransferSlice';
import TransferRequests from "../TransferRequests";


import {
  DndContext,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import CornMarketDrawer from "../cornmarket/CornMarketDrawer";
import Gridmenu from "./Gridmenu";
import { tableData } from "../../constants/Batch";
import TrigerReminderDrawer from "../reminders/TrigerReminderDrawer";
import CancallationDrawer from "./cancallation/CancallationDrawer";
import TrigerBatchMemberDrawer from "../finanace/TrigerBatchMemberDrawer";
import MyDrawer from "./MyDrawer";
import { getProfileDetailsById } from "../../features/profiles/ProfileDetailsSlice";

const EditableContext = React.createContext(null);

const DraggableHeaderCell = ({ id, style, children, ...props }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
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
    <div
      className="custom-header"
      ref={setNodeRef}
      style={customStyle}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </div>
  );
};

const TableComponent = ({
  data,
  screenName,
  redirect,
  isGrideLoading,
  rowSelection = null,
  selectedRowKeys = [],
  onSelectionChange,
  selectionType = "checkbox",
  enableRowSelection = true,
  onRowClick: externalOnRowClick = null,
  disableDefaultRowClick = false,
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedRowIndex,
    setSelectedRowIndex,
    selectedRowData,
    setSelectedRowData,
    setExcelData,
  } = useContext(ExcelContext);
  const [TriggerReminderDrawer, setTriggerReminderDrawer] = useState(false);
  const [transferDrawerOpen, setTransferDrawerOpen] = useState(false);
  const [selectedTransferRecord, setSelectedTransferRecord] = useState(null);
  const mainData = useSelector((state) => state.transferRequest.data);
  const { applications, applicationsLoading } = useSelector(
    (state) => state.applications
  );
  const [manualPayment, setmanualPayment] = useState(false);
  const {
    columns,
    gridData,
    setGridData,
    getProfile,
    profilNextBtnFtn,
    ColumnProp,
    disableFtn,
  } = useTableColumns();
  const [dataSource, setdataSource] = useState(data);

  useEffect(() => {
    setdataSource(data);
  }, [data]);

  const [iscancellationOpen, setIscancellationOpen] = useState(false);
  const [isCornMarOpen, setisCornMarOpen] = useState(false);
  const [isBatchmemberOpen, setIsBatchmemberOpen] = useState(false);
  const [transferreq, settransferreq] = useState(false);

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

  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // **UPDATED: Row click handler that can be overridden by props**
  const handleRowClick = (record, rowIndex) => {
    // Call external handler first if provided
    if (externalOnRowClick) {
      externalOnRowClick(record, rowIndex);
      // If external handler is provided and we want to skip default behavior
      if (disableDefaultRowClick) {
        return;
      }
    }

    // Default behavior (only if not disabled)
    if (!disableDefaultRowClick) {
      setSelectedRowData([record]);
      setSelectedRowIndex(rowIndex);
    }
  };

  // Alternative: Separate handlers for different scenarios
  const handleRowClickWithDefault = (record, rowIndex) => {
    // Always call external handler if provided
    if (externalOnRowClick) {
      externalOnRowClick(record, rowIndex);
    }

    // Always do default behavior
    setSelectedRowData([record]);
    setSelectedRowIndex(rowIndex);
  };

  // Handle file upload
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event, key) => {
    const file = event.target.files[0];
    if (file) {
      addAttributeToTableData(key);
    }
  };

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

  // Handle drag and drop
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

  const addAttributeToTableData = (key) => {
    setdataSource(
      dataSource?.map((item) =>
        item.key === key ? { ...item, isAttachment: true } : item
      )
    );
  };

  // **UPDATED: Fixed getRowSelectionConfig with proper height and alignment**
  const getRowSelectionConfig = () => {
    // If external rowSelection is provided
    if (rowSelection !== null) {
      // Handle different types of rowSelection
      if (typeof rowSelection === 'object') {
        // Clone and remove selections property to remove dropdown menu
        const config = { ...rowSelection };
        config.selections = undefined; // This removes the dropdown menu

        // Ensure proper styling for alignment and height
        if (!config.columnStyle) {
          config.columnStyle = {};
        }
        config.columnStyle = {
          ...config.columnStyle,
          padding: '12px 8px',
          verticalAlign: 'middle',
        };

        return config;
      }
      // If it's a function or other type, return as is
      return rowSelection;
    }

    // If selection is disabled
    if (!enableRowSelection) {
      return null;
    }

    // Default configuration WITHOUT selections menu
    const config = {
      type: selectionType,
      selectedRowKeys,
      onChange: (selectedKeys, selectedRows) => {
        if (onSelectionChange) {
          onSelectionChange(selectedKeys, selectedRows);
        }
      },
      columnWidth: 60,
      fixed: true,
      // Add proper styling for alignment and height
      columnStyle: {
        padding: '12px 8px',
        verticalAlign: 'middle',
        height: 'auto',
        minHeight: '48px',
      },
      // Custom render for checkbox to fix alignment
      renderCell: (checked, record, index, originNode) => {
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '48px',
            padding: '12px 0',
          }}>
            {originNode}
          </div>
        );
      },
    };

    // Ensure selections is undefined to prevent dropdown menu
    config.selections = undefined;

    // Merge any additional rowSelection props
    if (props.rowSelectionProps && typeof props.rowSelectionProps === 'object') {
      const { selections, ...safeProps } = props.rowSelectionProps;
      Object.assign(config, safeProps);
      // Re-enforce no selections menu
      config.selections = undefined;
    }

    return config;
  };

  // Build columns
  const draggableColumns = [
    {
      title: (
        <Gridmenu
          title={
            <BsSliders
              style={{ fontSize: "20px", color: "white", fontWeight: 600 }}
            />
          }
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
      render: (record, index) => (
        <Space size="small">
          <CgAttachment
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: record?.isAttachment ? "green" : "inherit",
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, record?.key)}
            style={{ display: "none" }}
          />
          {/* Three dots menu */}
          <SimpleMenu
            title={
              <BsThreeDotsVertical
                style={{ fontSize: "15px", fontWeight: 500 }}
              />
            }
            data={{
              Delete: "false",
              Attached: "false",
              View: "false",
              "Print Label": "false",
              "Transfer Requests": false,
              "Career Break": false,
              "Generate NFC tag": false,
              "Change Category": false,
            }}
            isCheckBox={false}
            isSearched={false}
            isTransparent={true}
            actions={() => { }}
            attachedFtn={() => {
              handleUploadClick();
            }}
            record={record}
            index={index}
          />
          {location?.pathname === "/BatchMemberSummary" && (
            <MdKeyboard
              style={{ fontSize: "15px", color: "#595959" }}
              onClick={() => {
                setmanualPayment(!isBatchmemberOpen);
                handleRowClick(record, index);
              }}
            />
          )}
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
      render: col.render
        ? col.render
        : (text, record, index) => {
          switch (col.title) {
            case "Full Name":
              return (
                <Link
                  to="/Details"
                  state={{
                    search: screenName,
                    name: record?.fullName,
                    code: record?.regNo,
                  }}
                  onClick={(e) => {
                    // e.preventDefault();
                    handleRowClick(record, index);
                    dispatch(getProfileDetailsById(record?._id));
                  }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );
            case "Claim No":
              return (
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleRowClick(record, index);
                    getProfile([record], index);
                  }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );
            case "Roster ID":
              return (
                <Link
                  to="/Roster"
                  state={{
                    search: screenName,
                    name: record?.fullName,
                    code: record?.regNo,
                    Forename: record?.forename,
                    Fullname: record?.surname,
                    DateOfBirth: record?.dateOfBirth,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRowClick(record, index);
                    getProfile([record], index);
                  }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );
            case "Application ID":
              return (
                <span
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    const { applicationStatus, applicationId } = record || {};
                    if (applicationStatus === "Draft") {
                      dispatch(
                        getApplicationById({ id: "draft", draftId: applicationId })
                      );
                      navigate("/applicationMgt", { state: { isEdit: true } });
                    } else {
                      dispatch(getApplicationById({ id: applicationId }));
                      navigate("/applicationMgt", { state: { isEdit: true } });
                    }
                  }}
                >
                  View
                </span>
              );
            case "Change To":
              return (
                <Link
                  to="/ChangeCatById"
                  state={{
                    search: screenName,
                    name: record?.fullName,
                    code: record?.regNo,
                    Forename: record?.forename,
                    Fullname: record?.surname,
                    DateOfBirth: record?.dateOfBirth,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRowClick(record, index);
                    getProfile([record], index);
                  }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );
            case "Batch Name":
              const simpleBatchPaths = [
                "/CornMarket",
                "/NewGraduate",
                "/CornMarketRewards",
              ];
              const isSimpleBatch = simpleBatchPaths.includes(location.pathname);
              const targetPath = isSimpleBatch
                ? "/SimpleBatchMemberSummary"
                : "/BatchMemberSummary";

              return (
                <Link
                  to={targetPath}
                  state={{
                    search: screenName,
                    batchName: text,
                    batchId: record?.id || record?.key,
                  }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {text}
                </Link>
              );
            case "Correspondence ID":
              return (
                <Link
                  to="/CorspndncDetail"
                  state={{
                    search: screenName,
                    name: record?.fullName,
                    code: record?.regNo,
                    Forename: record?.forename,
                    Fullname: record?.surname,
                    DateOfBirth: record?.dateOfBirth,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRowClick(record, index);
                    getProfile([record], index);
                  }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );
            // ADD THIS CASE FOR /Transfers PATH
            case "Reg No":
              return (
                <span
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    const transferId = record?._id;
                    if (transferId) {
                      debugger
                      dispatch(fetchAndFilterTransferById(transferId));
                      settransferreq(!transferreq);
                    }
                  }}
                >
                  {text || "View"}
                </span>
              );
            default:
              return (
                <span
                  style={{ textOverflow: "ellipsis" }}
                  onClick={() => handleRowClick(record, index)}
                >
                  {text}
                </span>
              );
          }
        },
      sorter:
        col.title === "Full Name"
          ? {
            compare: (a, b) =>
              a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
            multiple: 3,
          }
          : col.title === "Station"
            ? {
              compare: (a, b) =>
                a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
              multiple: 2,
            }
            : col.title === "Duty"
              ? {
                compare: (a, b) =>
                  a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
                multiple: 1,
              }
              : col.title === "Reg No"
                ? {
                  compare: (a, b) =>
                    a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
                  multiple: 1,
                }
                : col.title === "Correspondence ID"
                  ? {
                    compare: (a, b) =>
                      a[col.dataIndex]?.localeCompare(b[col.dataIndex]),
                    multiple: 1,
                  }
                  : undefined,
      sortDirections: ["ascend", "descend"],
      filters:
        col.title === "Station" || col.title === "Current Station"
          ? [
            { text: "GALC", value: "GALC" },
            { text: "DUBC", value: "DUBC" },
            { text: "STOC", value: "STOC" },
          ]
          : col.title === "Division"
            ? [
              { text: "0026", value: "0026" },
              { text: "0031", value: "0031" },
              { text: "0045", value: "0045" },
            ]
            : col.title === "Approval Status"
              ? [
                { text: "Approved", value: "Approved" },
                { text: "Pending", value: "Pending" },
                { text: "Rejected", value: "Rejected" },
              ]
              : col.title === "Current Station"
                ? [
                  { text: "0026", value: "0026" },
                  { text: "0031", value: "0031" },
                  { text: "0045", value: "0045" },
                ]
                : col.title === "Method of Contact"
                  ? [
                    { text: "Call", value: "Call" },
                    { text: "Email", value: "Email" },
                    { text: "Letter", value: "Letter" },
                  ]
                  : undefined,
      onFilter: (value, record) => {
        if (col.title === "Station" || col.title === "Current Station")
          return record[col.dataIndex] === value;
        if (col.title === "Division") return record[col.dataIndex] === value;
        if (col.title === "Approval Status")
          return record[col.dataIndex] === value;
        if (col.title === "Method of Contact")
          return record[col.dataIndex] === value;
        return true;
      },
    })),
  ];
  // Pagination logic
  const pageSize = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageData, setCurrentPageData] = useState([]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(dataSource.slice(startIndex, endIndex));
  }, [currentPage, dataSource]);

  const getBatchById = (batchId) => {
    if (!Array.isArray(tableData)) return null;
    const batch = tableData.find((b) => b.id === batchId) || null;
    if (batch) setExcelData(batch);
    return batch;
  };

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
      } catch (errInfo) { }
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
            width: "1px",
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
        <div
          className="common-table "
          style={{
            paddingLeft: "34px",
            paddingRight: "34px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Table
            rowKey={(record, index) => record.key || record.id || index}
            rowClassName={() => ""}
            loading={isGrideLoading}
            components={components}
            columns={editableColumns}
            dataSource={currentPageData}
            // **FIXED: Using the updated getRowSelectionConfig**
            rowSelection={getRowSelectionConfig()}
            pagination={false}
            style={{ tableLayout: "fixed" }}
            bordered
            scroll={{ x: 1500, y: 800 }}
            size="small"
            // **UPDATED: Row click handler uses the prop-controlled function**
            onRow={(record, index) => ({
              onClick: () => handleRowClick(record, index),
            })}
          />
          <div
            className="d-flex justify-content-between align-items-center tbl-footer"
            style={{ marginTop: "10px" }}
          >
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ flex: 1 }}
            >
              <span
                style={{
                  marginRight: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {`${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  dataSource.length
                )}`}
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
      <TrigerReminderDrawer
        isOpen={TriggerReminderDrawer}
        onClose={() => setTriggerReminderDrawer(!TriggerReminderDrawer)}
      />
      <CancallationDrawer
        isOpen={iscancellationOpen}
        onClose={() => setIscancellationOpen(!iscancellationOpen)}
      />
      <TrigerBatchMemberDrawer
        isOpen={isBatchmemberOpen}
        onClose={() => setIsBatchmemberOpen(!isBatchmemberOpen)}
      />
      <CornMarketDrawer
        isOpen={isCornMarOpen}
        onClose={() => setisCornMarOpen(!isCornMarOpen)}
      />
      <MyDrawer
        open={manualPayment}
        onClose={() => setmanualPayment(!manualPayment)}
        title={"Manual Payment Entry"}
        width={850}
        isManual={true}
      >
        <div className="drawer-main-cntainer p-4">
          {/* <ManualPaymentEntry /> */}
        </div>
      </MyDrawer>
      <TransferRequests
        open={transferreq}
        onClose={() => {
          settransferreq(false);
          dispatch(clearFilteredTransfer());
        }}
        isSearch={false}

        isChangeCat={true}
      />
    </DndContext>
  );
};

export default TableComponent;