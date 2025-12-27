import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from "react";
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
import { getSubscriptionByProfileId } from "../../features/subscription/profileSubscriptionSlice";
import SimpleMenu from "./SimpleMenu";
import {
  filterTransferById,
  fetchAndFilterTransferById,
  filterTransferFromExistingData,
  clearFilteredTransfer,
  selectFilteredTransfer,
  selectFilteredLoading,
  selectFilteredError,
} from "../../features/profiles/filterTransferSlice";
import TransferRequests from "../TransferRequests";
import { formatDateOnly } from "../../utils/Utilities";

import { DndContext, DragOverlay } from "@dnd-kit/core";
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
import UnifiedPagination, { getUnifiedPaginationConfig, getDefaultPageSize } from "./UnifiedPagination";
import { getCornMarketBatchById } from "../../features/profiles/CornMarketBatchByIdSlice";

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
  selectedRowKeys,
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
  // Internal state for row selection when not provided via props
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState([]);

  // Determine if selection is externally controlled
  // Only consider it external if BOTH selectedRowKeys and onSelectionChange are explicitly provided
  const isExternallyControlled =
    selectedRowKeys !== undefined && onSelectionChange !== undefined;

  useEffect(() => {
    setdataSource(data);
    // When data changes, filter out selected keys that no longer exist
    if (!isExternallyControlled && internalSelectedRowKeys.length > 0) {
      const validKeys = internalSelectedRowKeys.filter(
        (key) =>
          data &&
          data.some((item) => {
            const itemKey = item.key || item.id || item._id;
            return itemKey === key || String(itemKey) === String(key);
          })
      );
      if (validKeys.length !== internalSelectedRowKeys.length) {
        setInternalSelectedRowKeys(validKeys);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isExternallyControlled]);

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

  // Memoized onChange handler to prevent unnecessary re-renders
  const handleSelectionChange = useCallback(
    (selectedKeys, selectedRows) => {
      if (isExternallyControlled) {
        // External control - call provided handler
        onSelectionChange(selectedKeys, selectedRows);
      } else {
        // Internal control - update internal state
        setInternalSelectedRowKeys(selectedKeys);
      }
    },
    [isExternallyControlled, onSelectionChange]
  );

  // **UPDATED: Fixed rowSelectionConfig with proper height and alignment**
  const rowSelectionConfig = useMemo(() => {
    if (!enableRowSelection) return null;

    // Use internal state if external props are not provided
    const currentSelectedKeys = isExternallyControlled
      ? selectedRowKeys || []
      : internalSelectedRowKeys;

    const config = {
      type: selectionType,
      selectedRowKeys: currentSelectedKeys,
      onChange: handleSelectionChange,
      onSelect: (record, selected, selectedRows) => {
        // Trigger row click logic only when checkbox is clicked
        console.log("Row clicked:", record); // ✅ your row clicked log
        setSelectedRowData([record]);
        setSelectedRowIndex(
          dataSource.findIndex((r) => {
            const rKey = r.key || r.id || r._id;
            const recordKey = record.key || record.id || record._id;
            return rKey === recordKey || String(rKey) === String(recordKey);
          })
        );
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        console.log("Select all triggered:", selectedRows);
        // Optional: handle select all logic
      },
      columnWidth: 60,
      fixed: true,
      // Optional: align checkbox properly
      columnStyle: { padding: "0 10px", verticalAlign: "middle" },
    };

    // Remove dropdown menu in header
    config.selections = undefined;

    return config;
  }, [
    enableRowSelection,
    isExternallyControlled,
    selectedRowKeys,
    internalSelectedRowKeys,
    selectionType,
    handleSelectionChange,
    dataSource,
  ]);

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
                  onClick={() => {
                    handleRowClick(record, index);
                    dispatch(getProfileDetailsById(record?._id));
                    dispatch(
                      getSubscriptionByProfileId({
                        profileId: record?._id,
                        isCurrent: true,
                      })
                    );
                  }}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );

            case "Subscription Status": // <-- NEW CASE
              return (
                <Link
                  to="/Details"
                  state={{
                    search: screenName,
                    name: record?.fullName,
                    code: record?.regNo,
                  }}
                  onClick={() => {
                    handleRowClick(record, index);
                    dispatch(
                      getSubscriptionByProfileId({
                        profileId: record?.profileId,
                        isCurrent: true,
                      })
                    );
                    dispatch(getProfileDetailsById(record?.profileId));
                    // dispatch(getProfileDetailsById(record?._id))
                  }}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  <span>{text}</span>
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
                  style={{ color: "inherit", textDecoration: "none" }}
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
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );

            case "Application ID":
              return (
                <span
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const { applicationStatus, applicationId } = record || {};
                    if (applicationStatus === "Draft") {
                      dispatch(
                        getApplicationById({
                          id: "draft",
                          draftId: applicationId,
                        })
                      );
                      navigate("/applicationMgt", {
                        state: { isEdit: true },
                      });
                    } else {
                      dispatch(getApplicationById({ id: applicationId }));
                      navigate("/applicationMgt", {
                        state: { isEdit: true },
                      });
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
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );

            case "Batch Name":
              const simpleBatchPaths = [
                "/CornMarket",
                "/NewGraduate",
                "/CornMarketRewards",
                "/RecruitAFriend",
              ];
              const isSimpleBatch = simpleBatchPaths.includes(
                location.pathname
              );
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
                  style={{ color: "inherit", textDecoration: "none" }}
                  onClick={() =>
                  {
                    console.log(record?._original?._id, "recordid");
                    debugger
                    dispatch(getCornMarketBatchById(record?._original?._id))
                  }

                  }
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
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <span style={{ textOverflow: "ellipsis" }}>{text}</span>
                </Link>
              );

            case "Membership No":
              return (
                <span
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const transferId = record?._id;
                    if (transferId) {
                      dispatch(fetchAndFilterTransferById(transferId));
                      settransferreq(!transferreq);
                    }
                  }}
                >
                  {text || "View"}
                </span>
              );

            case "Date of Birth":
            case "Date Of Birth":
              return (
                <span
                  style={{ textOverflow: "ellipsis" }}
                  onClick={() => handleRowClick(record, index)}
                >
                  {formatDateOnly(text)}
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
              : col.title === "Membership No"
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
                { text: "Approved", value: "APPROVED" },
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

  // Pagination logic with UnifiedPagination
  const defaultPageSize = useMemo(() => getDefaultPageSize(dataSource.length), [dataSource.length]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPageData, setCurrentPageData] = useState([]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(dataSource.slice(startIndex, endIndex));
  }, [currentPage, pageSize, dataSource]);

  // Reset to page 1 when dataSource changes significantly
  useEffect(() => {
    setCurrentPage(1);
    const newDefaultPageSize = getDefaultPageSize(dataSource.length);
    setPageSize(newDefaultPageSize);
  }, [dataSource.length]);

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

  // Calculate minimum width based on header text length for auto-sizing columns
  const calculateMinWidth = (title) => {
    if (!title) return 80; // Default minimum
    // Estimate width: ~8px per character for typical font, plus padding (20px total)
    // Add extra space for sorting/filter icons if present (~30px)
    const baseWidth = title.toString().length * 8 + 20;
    // Minimum width should be at least the header text width
    return Math.max(baseWidth, 80); // Minimum 80px
  };

  // Remove width from all non-fixed columns but add minWidth based on header text
  const processedColumns = editableColumns.map((col) => {
    if (!col.fixed) {
      const { width, ...rest } = col;
      return {
        ...rest,
        minWidth: calculateMinWidth(col.title),
      };
    }
    return col; // Keep width for fixed columns (checkbox, actions)
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
            paddingBottom: "80px", // Add padding to ensure pagination is visible
          }}
        >
          <Table
            rowKey={(record, index) => record.key || record.id || index}
            rowClassName={() => ""}
            loading={isGrideLoading}
            components={components}
            columns={processedColumns}
            dataSource={currentPageData || []}
            // **FIXED: Using the updated getRowSelectionConfig**
            rowSelection={rowSelectionConfig}
            pagination={false}
            style={{ tableLayout: "auto" }}
            bordered
            scroll={{ x: "max-content", y: 590 }}
            size="middle"
            locale={{
              emptyText: "No Data"
            }}
            // **UPDATED: Row click handler uses the prop-controlled function**
            onRow={(record, index) => ({
              onClick: () => handleRowClick(record, index),
            })}
          />
          <div
            className="d-flex justify-content-center align-items-center tbl-footer"
            style={{
              marginTop: "10px",
              padding: "8px 0",
              backgroundColor: "#fafafa",
              borderTop: "none",
              position: "relative",
              zIndex: 10
            }}
          >
            <UnifiedPagination
              total={dataSource.length}
              current={currentPage}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                }
              }}
              onShowSizeChange={(current, size) => {
                setCurrentPage(1);
                setPageSize(size);
              }}
              itemName="items"
              style={{ margin: 0, padding: 0 }}
              showTotalFormatter={(total, range) => {
                const start = isNaN(range[0]) ? 0 : range[0];
                const end = isNaN(range[1]) ? 0 : range[1];
                const totalCount = isNaN(total) ? 0 : total;
                return (
                  <span style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    {`${start}-${end} of ${totalCount} items`}
                    <LuRefreshCw
                      style={{
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#215e97",
                        transition: "color 0.3s ease",
                        marginLeft: "4px"
                      }}
                      onClick={() => window.location.reload()}
                      title="Refresh"
                      onMouseEnter={(e) => e.currentTarget.style.color = "#1890ff"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#215e97"}
                    />
                  </span>
                );
              }}
            />
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
