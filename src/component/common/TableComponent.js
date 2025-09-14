import React, { useEffect, useState, useRef, useContext } from "react";
import { Table, Pagination, Space, Form, Input, Checkbox, Upload } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { LuRefreshCw } from "react-icons/lu";
import { BsSliders, BsThreeDotsVertical } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { MdKeyboard } from "react-icons/md";
import { ExcelContext } from "../../context/ExcelContext";
import { getApplicationById } from "../../features/ApplicationDetailsSlice";
import SimpleMenu from "./SimpleMenu";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import ManualPaymentEntry from "../finanace/ManualPaymentEntry";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { arrayMove } from "@dnd-kit/sortable";
import CornMarketDrawer from "../cornmarket/CornMarketDrawer";
import Gridmenu from "./Gridmenu";
import AddNewGarda from "../details/AddNewGarda";
import TrigerReminderDrawer from "../reminders/TrigerReminderDrawer";
import CancallationDrawer from "./cancallation/CancallationDrawer";
import TrigerBatchMemberDrawer from "../finanace/TrigerBatchMemberDrawer";
import MyDrawer from "./MyDrawer";
import { set } from "react-hook-form";
import ApplicationMgtDrawer from "../applications/ApplicationMgtDrawer";
const EditableContext = React.createContext(null);

const DraggableHeaderCell = ({ id, style, ...props }) => {
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

const TableComponent = ({ data, screenName, redirect, isGrideLoading }) => {
  const location = useLocation();
  const {
    selectedRowIndex,
    setSelectedRowIndex,
    selectedRowData,
    setSelectedRowData,
  } = useContext(ExcelContext);
  const [TriggerReminderDrawer, setTriggerReminderDrawer] = useState(false);
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
  const handleRowClick = (record, rowIndex) => {
    setSelectedRowData([record]);
    setSelectedRowIndex(rowIndex);
  };
  // Function to trigger file input
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset value to allow re-selection of same file
      fileInputRef.current.click();
    }
  };
  const handleFileUpload = (event, key) => {
    const file = event.target.files[0]; // Get the selected file
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
  const [AddNewGardaDrwr, setAddNewGardaDrwr] = useState(false);
  const [dragIndex, setDragIndex] = useState({ active: null, over: null });

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (key) => {
    const newSelectedRowKeys = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter((k) => k !== key)
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
  const addAttributeToTableData = (key) => {
    setdataSource(
      dataSource?.map((item) =>
        item.key === key ? { ...item, isAttachment: true } : item
      )
    );
  };
  // make columns dragable and also rendered three dots icon in each row
  const draggableColumns = [
    {
      title: () => (
        <Checkbox
          // style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
          style={{ marginLeft: "9px" }}
          indeterminate={
            selectedRowKeys.length > 0 &&
            selectedRowKeys.length < dataSource.length
          }
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedRowKeys(
              checked ? dataSource.map((item) => item.key) : []
            );
          }}
        />
      ),
      key: "selection",
      width: 50,
      fixed: "left",
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
          {/* Three dots icon in each columns */}
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
            actions={() => {}}
            attachedFtn={() => {
              handleUploadClick();
            }}
            record={record}
            index={index}
          />
          {location?.pathname === "/BatchMemberSummary" && (
            <MdKeyboard
              style={{ fontSize: "15px", color: "#595959", color: "inherit" }}
              onClick={() => {
                setmanualPayment(!isBatchmemberOpen);
                handleRowClick(record, index);
              }}
            />
          )}
          {/* {location.pathname === "/RemindersSummary" && <AiOutlineThunderbolt onClick={() =>  />} */}
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
      render: (text, record, index) =>
        col.title === "Full Name" ? (
          <Link
            to="/Details"
            state={{
              search: screenName,
              name: record?.fullName,
              code: record?.regNo,
            }}
            onClick={() => getProfile([record], index)}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
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
            onClick={() => getProfile([record], index)}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
          </Link>
        ) : col.title === "Roster ID" ? (
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
            onClick={() => getProfile([record], index)}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
          </Link>
        ) : col.title === "Application ID" ? (
          <Link
            // to="/AproveMembersip"
            onClick={() => {
              const { applicationStatus, ApplicationId } = record || {};
              if (applicationStatus === "Draft") {
                dispatch(
                  getApplicationById({ id: "draft", draftId: ApplicationId })
                );
                setAddNewGardaDrwr(true);
              } else if (applicationStatus === "submitted") {
                dispatch(getApplicationById({ id: ApplicationId }));
                setAddNewGardaDrwr(true);
                disableFtn(false);
              }
            }}
            state={{
              search: screenName,
              name: record?.fullName,
              Forename: record?.forename,
              Fullname: record?.surname,
              DateOfBirth: record?.dateOfBirth,
            }}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
          </Link>
        ) : col.title === "Change To" ? (
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
            onClick={() => getProfile([record], index)}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
          </Link>
        ) : col.title === "Batch Name" && location.pathname != "/Batches" ? (
          <Link
            onClick={() => {
              if (location.pathname === "/RemindersSummary") {
                setTriggerReminderDrawer(!TriggerReminderDrawer);
              }
              if (location.pathname === "/Batches") {
                setIsBatchmemberOpen(!isBatchmemberOpen);
              }
              // if (location.pathname === "/Batches") {
              //   setmanualPayment(!manualPayment)
              //   getProfile([record], index)
              // }
              else if (location.pathname === "/Cancallation") {
                setIscancellationOpen(!iscancellationOpen);
              } else if (location.pathname === "/CornMarket") {
                setisCornMarOpen(!isCornMarOpen);
              }
            }}
            state={{ search: screenName }}
            // onClick={() => getProfile([record], index)}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
          </Link>
        ) : col.title === "Batch Name" && location.pathname === "/Batches" ? (
          <Link
            to="/BatchMemberSummary"
            state={{
              search: screenName,
              batchName: text,
              batchId: record?.batchId || record?.key,
            }}
          >
            {`${text}`}
          </Link>
        ) : col.title === "Correspondence ID" ? (
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
            onClick={() => getProfile([record], index)}
          >
            <span style={{ textOverflow: "ellipsis" }}>{text}</span>
          </Link>
        ) : (
          <span style={{ textOverflow: "ellipsis" }}>{text}</span>
        ),
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
              { text: "Letter", value: "Letter" },
            ]
          : undefined,
      onFilter: (value, record) => {
        if (col.title === "Station" || col.title === "Current Station") {
          return record[col.dataIndex] === value;
        } else if (col.title === "Division") {
          return record[col.dataIndex] === value;
        } else if (col.title === "Approval Status") {
          return record[col.dataIndex] === value;
        } else if (col.title == "Method of Contact") {
          return record[col.dataIndex] === value;
        }
        // else if (col.title=="Method of Contact"){
        //   return record[col.dataIndex]===value;
        // }
        return true;
      },
    })),
  ];

  const pageSize = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const [currentPageData, setCurrentPageData] = useState([]);
  // pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(dataSource.slice(startIndex, endIndex));
  }, [currentPage, dataSource]);

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
      } catch (errInfo) {}
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

  // reports (apply filters)
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
          style={{ paddingLeft: "34px", paddingRight: "34px", width: "93vw" }}
        >
          <Table
            rowClassName={() => ""}
            loading={isGrideLoading}
            components={components}
            columns={editableColumns}
            dataSource={currentPageData}
            pagination={false}
            style={{ tableLayout: "fixed" }}
            bordered
            virtual
            scroll={{ x: "100%", y: 800 }}
            sticky
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
      <ApplicationMgtDrawer
        open={AddNewGardaDrwr}
        onClose={() => setAddNewGardaDrwr(!AddNewGardaDrwr)}
        isEdit={true}
        title="Registration Request"
      />
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
        width={760}
        isManual={true}
      >
        <ManualPaymentEntry />
      </MyDrawer>
    </DndContext>
  );
};

export default TableComponent;
