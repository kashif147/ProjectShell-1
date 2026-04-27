import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Row,
  Col,
  Button,
  Tabs,
  Table,
  message,
  Tag,
  Space,
  Card,
  Input as AntInput,
  Select,
  Spin,
  Dropdown,
  Modal,
  Tooltip,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import TrigerBatchMemberDrawer from "../../component/finanace/TrigerBatchMemberDrawer";
import "../../styles/ManualEntry.css";
import "../../styles/BatchMemberSummary.css";
import ManualPaymentEntryDrawer from "../../component/finanace/ManualPaymentEntryDrawer";
import MyDrawer from "../../component/common/MyDrawer";
import MemberSearch from "../../component/profile/MemberSearch";
import CreateBatchPayment from "../../component/common/CreateBatchPayment";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { formatCurrency } from "../../utils/Utilities";
import { paymentTypes } from "../../Data";
import {
  getBatchDetailsById,
  clearBatchDetails,
  deleteBatchDetail,
} from "../../features/profiles/BatchDetailsSlice";
import CustomSelect from "../../component/common/CustomSelect";
import MyDatePicker from "../../component/common/MyDatePicker";
import MyInput from "../../component/common/MyInput";
import Breadcrumb from "../../component/common/Breadcrumb";
import UnifiedPagination, {
  getDefaultPageSize,
} from "../../component/common/UnifiedPagination";
import moment from "moment";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SearchOutlined,
  HistoryOutlined,
  RiseOutlined,
  CarryOutOutlined,
  UnorderedListOutlined,
  CloudUploadOutlined,
  ThunderboltFilled,
  FolderOpenOutlined,
  CalculatorOutlined,
  DownloadOutlined,
  LoadingOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { BsThreeDots } from "react-icons/bs";
import { AlertCircle } from "lucide-react";

const cardStyle = {
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  border: "1px solid #e2e8f0",
};

const SummaryCard = ({ title, value, icon, color, iconBg }) => (
  <Card style={cardStyle} styles={{ body: { padding: "12px" } }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: "8px",
            letterSpacing: "0.025em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>
          {value}
        </div>
      </div>
      <div
        style={{
          width: "32px",
          height: "24px",
          borderRadius: "8px",
          backgroundColor: iconBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: color,
          fontSize: "16px",
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

const MembershipNoResolver = ({
  batchId,
  exceptionId,
  exceptionMembershipNumber,
  onResolved,
}) => {
  const [loading, setLoading] = useState(false);

  const handleResolve = async (memberData) => {
    if (!memberData?.membershipNumber) return;
    setLoading(true);
    try {
      const baseUrl = getAccountServiceBaseUrl();
      const token = localStorage.getItem("token");

      // Resolve the exception directly with selected member info
      await axios.post(
        `${getAccountServiceBaseUrl()}/batch-details/resolve-exception/${batchId}`,
        {
          membershipNumber: memberData.membershipNumber,
          exceptionMembershipNumber: exceptionMembershipNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      message.success("Exception resolved successfully");
      if (onResolved) onResolved();
    } catch (error) {
      console.error("Resolution error:", error);
      message.error(
        error.response?.data?.message || "Failed to resolve exception",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberSearch
      headerStyle={true}
      fullWidth={true}
      disable={loading}
      showStatus={false}
      onSelectBehavior="callback"
      onSelectCallback={(memberData) => handleResolve(memberData)}
      getPopupContainer={() => document.body}
      style={{ minWidth: "150px" }}
    />
  );
};

function isFileRefMembershipMismatch(record) {
  const fileRef = record?.fileRow?.membershipNumber;
  const memberNo = record?.membershipNumber;
  if (fileRef == null || memberNo == null) return false;
  const a = String(fileRef).trim();
  const b = String(memberNo).trim();
  if (!a || !b) return false;
  return a.toUpperCase() !== b.toUpperCase();
}

function normalizeComparableName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** As stored from the spreadsheet: full name cell or first + last. */
function batchPaymentNameOnFile(record) {
  if (record == null) return "";
  const fr = record.fileRow || {};
  if (fr.fullName != null && String(fr.fullName).trim() !== "") {
    return String(fr.fullName).trim();
  }
  const parts = [fr.firstName, fr.lastName]
    .map((p) => String(p || "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : "";
}

/**
 * From CRM profile on the payment (forename + surname). Do not use record.fullName
 * here — it is file-prefixed on the server (fullNameFromFileOrProfile).
 */
function batchPaymentCrmFullName(record) {
  if (record == null) return "";
  const parts = [record.forename, record.surname]
    .map((p) => String(p || "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : "";
}

function isFileVsCrmNameMismatch(record) {
  const file = normalizeComparableName(batchPaymentNameOnFile(record));
  const crm = normalizeComparableName(batchPaymentCrmFullName(record));
  if (!file && !crm) return false;
  return file !== crm;
}

/** subscription-service `subscription.subscriptionStatus` (API may expose as subscriptionStatus or membershipStatus) */
function rowSubscriptionStatus(record) {
  if (record == null) return null;
  return record.subscriptionStatus ?? record.membershipStatus ?? null;
}

/** True when a status is known and it is not active. */
function isSubscriptionStatusNotActive(record) {
  const v = rowSubscriptionStatus(record);
  if (v == null || String(v).trim() === "") return false;
  return String(v).toLowerCase() !== "active";
}

/** One left-edge accent per row: ref > name > membership (highest first). */
function batchPaymentLeftAccentClassName(record) {
  if (record == null) return "";
  if (isFileRefMembershipMismatch(record)) return "batch-row-left--ref";
  if (isFileVsCrmNameMismatch(record)) return "batch-row-left--name";
  if (isSubscriptionStatusNotActive(record)) return "batch-row-left--membership";
  return "";
}

function batchPaymentRowHighlightMessages(record) {
  const out = [];
  if (isFileRefMembershipMismatch(record)) {
    out.push(
      "File ref. no. and membership no. do not match the resolved member.",
    );
  }
  if (isFileVsCrmNameMismatch(record)) {
    out.push("Name on file and full name do not match.");
  }
  if (isSubscriptionStatusNotActive(record)) {
    const st = rowSubscriptionStatus(record);
    out.push(
      `Membership is not active${st != null && String(st).trim() !== "" ? ` (status: ${String(st).trim()})` : ""}.`,
    );
  }
  return out;
}

function membershipStatusTagColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "success";
  if (s === "cancelled") return "error";
  if (s === "resigned") return "error";
  if (s === "suspended" || s === "archived") return "warning";
  return "default";
}

function profileIdForDetailsLink(record) {
  if (record == null) return null;
  const p = record.profileId;
  if (p == null) return null;
  if (typeof p === "object" && p._id != null) return String(p._id);
  const s = String(p).trim();
  if (s === "" || s === "null" || s === "undefined") return null;
  return s;
}

/** Matches `TableComponent` member name → /Details link styling */
const MEMBER_FILE_LINK_STYLE = {
  color: "blue",
  textDecoration: "underline",
  cursor: "pointer",
};

export default function BatchMemberSummary() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeKey, setActiveKey] = useState("1");
  const { batchId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: batchDetails, loading } = useSelector(
    (state) => state.batchDetails,
  );

  const hasFetchedRef = useRef(null);

  // Fetch batch details if batchId is available
  useEffect(() => {
    if (batchId && hasFetchedRef.current !== batchId) {
      dispatch(getBatchDetailsById(batchId));
      hasFetchedRef.current = batchId;
    }
    return () => {
      // Cleanup is handled by new instance creation; ref reset is removed
      // to support React 18's StrictMode double-mount simulation.
    };
  }, [batchId, dispatch]);

  const refreshData = useCallback(() => {
    if (batchId) {
      dispatch(getBatchDetailsById(batchId));
    }
  }, [batchId, dispatch]);

  // Strict Data Source: Only use data from Redux
  const batchInfo = batchDetails || {};
  const isPendingBatch =
    batchInfo?.batchStatus != null &&
    String(batchInfo.batchStatus).trim().toLowerCase() === "pending";
  const isBatchEditable = isPendingBatch;

  const [excludeToExceptionsLoading, setExcludeToExceptionsLoading] =
    useState(false);
  const handleExcludeMembersToExceptions = useCallback(async () => {
    if (!isBatchEditable) {
      message.warning("Batch can only be edited while status is pending");
      return;
    }
    if (activeKey !== "1") {
      message.warning(
        "Open the Batch Payments tab, select one or more rows, then exclude.",
      );
      return;
    }
    if (!selectedRowKeys.length) {
      message.warning(
        "Select at least one member in Batch Payments to exclude.",
      );
      return;
    }
    if (!batchId) return;
    setExcludeToExceptionsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${getAccountServiceBaseUrl()}/batch-details/exclude-payments/${batchId}`,
        { paymentEntryIds: selectedRowKeys },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      message.success("Selected member(s) moved to exceptions.");
      setSelectedRowKeys([]);
      await dispatch(getBatchDetailsById(batchId));
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Failed to move members to exceptions",
      );
    } finally {
      setExcludeToExceptionsLoading(false);
    }
  }, [
    isBatchEditable,
    activeKey,
    selectedRowKeys,
    batchId,
    dispatch,
  ]);

  // Helper function to safely parse dates
  const getSafeDate = (dateValue) => {
    if (!dateValue) return null;
    if (moment.isMoment(dateValue)) return dateValue;
    return moment(dateValue);
  };

  const members = useMemo(
    () =>
      Array.isArray(batchInfo?.batchPayments) ? batchInfo.batchPayments : [],
    [batchInfo?.batchPayments],
  );
  const exceptions = useMemo(
    () =>
      Array.isArray(batchInfo?.batchExceptions)
        ? batchInfo.batchExceptions
        : [],
    [batchInfo?.batchExceptions],
  );

  const onSelectAll = (checked) => {
    const dataSource = activeKey === "1" ? members : exceptions;
    if (checked) {
      const allKeys = dataSource.map(
        (item, index) => item._id || item.id || index,
      );
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const onSelectSingle = (record, selected) => {
    if (selected) {
      setSelectedRowKeys((prev) => [...prev, record._id || record.id]);
    } else {
      setSelectedRowKeys((prev) =>
        prev.filter((key) => key !== (record._id || record.id)),
      );
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onSelect: onSelectSingle,
    onSelectAll: (selected, selectedRows) => {
      if (selected) {
        const dataSource = activeKey === "1" ? members : exceptions;
        const allKeys = dataSource.map((row) => row._id || row.id);
        setSelectedRowKeys(allKeys);
      } else {
        setSelectedRowKeys([]);
      }
    },
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const [isBatchmemberOpen, setIsBatchmemberOpen] = useState(false);
  const paymentTableRowClassName = useCallback(
    (record) =>
      activeKey === "1" ? batchPaymentLeftAccentClassName(record) : "",
    [activeKey],
  );
  /** Single control: file ref/membership × name (3×3 + all). */
  const [batchRefNameViewFilter, setBatchRefNameViewFilter] =
    useState("all");
  const [manualPayment, setManualPayment] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isBatchDetailsDrawerOpen, setIsBatchDetailsDrawerOpen] =
    useState(false);
  const [isEditBatchDetails, setIsEditBatchDetails] = useState(false);
  const [triggerBatchLoading, setTriggerBatchLoading] = useState(false);
  const batchFormRef = useRef(null);

  // Helper function to get unique filter values
  const getUniqueFilterValues = (dataSource, getValue) => {
    const uniqueValues = new Set();
    dataSource.forEach((record) => {
      const value = getValue(record);
      if (value !== null && value !== undefined && value !== "") {
        uniqueValues.add(value.toString());
      }
    });
    return Array.from(uniqueValues)
      .sort()
      .map((value) => ({ text: value, value }));
  };

  // Filter Dropdown Component
  const FilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
    dataSource,
    getValue,
  }) => {
    const [searchText, setSearchText] = useState("");
    const uniqueValues = getUniqueFilterValues(dataSource, getValue);
    const filteredOptions = uniqueValues.filter((option) =>
      option.text.toLowerCase().includes(searchText.toLowerCase()),
    );

    const handleReset = () => {
      setSearchText("");
      setSelectedKeys([]);
      clearFilters();
    };

    const handleConfirm = () => {
      confirm();
    };

    return (
      <div style={{ padding: 8, width: 280, boxSizing: "border-box" }}>
        <AntInput
          placeholder="Search filter"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleConfirm}
          style={{
            marginBottom: 8,
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            maxHeight: 200,
            overflowY: "auto",
            marginBottom: 8,
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  const newSelectedKeys = selectedKeys?.includes(option.value)
                    ? selectedKeys.filter((key) => key !== option.value)
                    : [...(selectedKeys || []), option.value];
                  setSelectedKeys(newSelectedKeys);
                }}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  backgroundColor: selectedKeys?.includes(option.value)
                    ? "#e6f7ff"
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys?.includes(option.value) || false}
                  readOnly
                  style={{ marginRight: 8 }}
                />
                {option.text}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px", color: "#999" }}>
              No options found
            </div>
          )}
        </div>
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button size="small" onClick={handleReset} style={{ width: 90 }}>
            Clear
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={handleConfirm}
            style={{ width: 90 }}
          >
            Apply
          </Button>
        </Space>
      </div>
    );
  };

  // Helper function to create searchable filter dropdown
  const createFilterDropdown = (dataSource, getValue) => {
    return (props) => (
      <FilterDropdown {...props} dataSource={dataSource} getValue={getValue} />
    );
  };

  // Memoize columns to prevent infinite loops
  const columns = useMemo(() => {
    const dataSource = members;
    return [
      {
        key: "rowHighlightInfo",
        width: 44,
        align: "center",
        title: (
          <Tooltip title="When a row has a file ref., name, or membership status issue, use the info icon in this column for details.">
            <InfoCircleOutlined
              style={{ color: "#94a3b8", fontSize: 14, cursor: "default" }}
              aria-hidden
            />
          </Tooltip>
        ),
        className: "batch-member-summary-col-highlight-info",
        render: (_, record) => {
          const messages = batchPaymentRowHighlightMessages(record);
          if (messages.length === 0) return null;
          return (
            <Tooltip
              color="#fff"
              title={
                <div
                  style={{
                    color: "rgba(0, 0, 0, 0.88)",
                    maxWidth: 320,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    Notes for this row:
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                    }}
                  >
                    {messages.map((m, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              }
            >
              <InfoCircleOutlined
                style={{ color: "#1677ff", fontSize: 16, cursor: "default" }}
                role="img"
                aria-label="Row issue details"
              />
            </Tooltip>
          );
        },
      },
      {
        title: "FILE REF NO",
        dataIndex: ["fileRow", "membershipNumber"],
        key: "refNo",
        ellipsis: true,
        width: 150,
        sorter: (a, b) => {
          const aVal = String(a.fileRow?.membershipNumber ?? "");
          const bVal = String(b.fileRow?.membershipNumber ?? "");
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = record?.fileRow?.membershipNumber;
          return v != null && String(v).trim() !== "" ? String(v) : "-";
        },
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record.fileRow?.membershipNumber,
        ),
        onFilter: (value, record) =>
          String(record.fileRow?.membershipNumber ?? "") === String(value),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onCell: (record) => ({
          className: isFileRefMembershipMismatch(record)
            ? "batch-file-ref-cell-mismatch"
            : "",
        }),
      },
      {
        title: "NAME ON FILE",
        key: "nameOnFile",
        ellipsis: true,
        width: 180,
        sorter: (a, b) =>
          batchPaymentNameOnFile(a).localeCompare(batchPaymentNameOnFile(b)),
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = batchPaymentNameOnFile(record);
          return v ? v : "—";
        },
        filterDropdown: createFilterDropdown(dataSource, (record) =>
          batchPaymentNameOnFile(record),
        ),
        onFilter: (value, record) =>
          String(batchPaymentNameOnFile(record)) === String(value),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "AMOUNT",
        dataIndex: ["fileRow", "valueForPeriodSelected"], // Corrected path
        key: "valueForPeriodSelected",
        ellipsis: true,
        width: 120,
        align: "right",
        sorter: (a, b) => {
          const aVal = parseFloat(a.fileRow?.valueForPeriodSelected) || 0;
          const bVal = parseFloat(b.fileRow?.valueForPeriodSelected) || 0;
          return aVal - bVal;
        },
        sortDirections: ["ascend", "descend"],
        render: (value) => formatCurrency((value || 0) / 100),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => {
          const amountRanges = [
            { text: "0 - 100", value: "0-100" },
            { text: "100 - 500", value: "100-500" },
            { text: "500 - 1000", value: "500-1000" },
            { text: "1000+", value: "1000+" },
          ];

          const handleReset = () => {
            setSelectedKeys([]);
            clearFilters();
          };

          return (
            <div style={{ padding: 8 }}>
              <div style={{ marginBottom: 8 }}>
                {amountRanges.map((range) => (
                  <div
                    key={range.value}
                    onClick={() => {
                      const newSelectedKeys = selectedKeys?.includes(
                        range.value,
                      )
                        ? selectedKeys.filter((key) => key !== range.value)
                        : [...(selectedKeys || []), range.value];
                      setSelectedKeys(newSelectedKeys);
                    }}
                    style={{
                      padding: "4px 8px",
                      cursor: "pointer",
                      backgroundColor: selectedKeys?.includes(range.value)
                        ? "#e6f7ff"
                        : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys?.includes(range.value) || false}
                      readOnly
                      style={{ marginRight: 8 }}
                    />
                    {range.text}
                  </div>
                ))}
              </div>
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={handleReset}
                  style={{ width: 90 }}
                >
                  Clear
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => confirm()}
                  style={{ width: 90 }}
                >
                  Apply
                </Button>
              </Space>
            </div>
          );
        },
        onFilter: (value, record) => {
          const amount =
            parseFloat(record.fileRow?.valueForPeriodSelected) || 0;
          if (value === "0-100") return amount >= 0 && amount < 100;
          if (value === "100-500") return amount >= 100 && amount < 500;
          if (value === "500-1000") return amount >= 500 && amount < 1000;
          if (value === "1000+") return amount >= 1000;
          return true;
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "MEMBERSHIP NO",
        key: "membershipNumber",
        ellipsis: true,
        width: 250,
        sorter: (a, b) => {
          const aVal = (a.membershipNumber || "").toString();
          const bVal = (b.membershipNumber || "").toString();
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = record?.membershipNumber;
          return v != null && String(v).trim() !== "" ? String(v) : "—";
        },
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record.membershipNumber,
        ),
        onFilter: (value, record) => {
          const recordValue = (record.membershipNumber || "").toString();
          return recordValue === value;
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onCell: (record) => ({
          className: isFileRefMembershipMismatch(record)
            ? "batch-file-ref-cell-mismatch"
            : "",
        }),
      },
      {
        title: "FULL NAME",
        key: "crmFullName",
        ellipsis: true,
        width: 200,
        sorter: (a, b) =>
          batchPaymentCrmFullName(a).localeCompare(batchPaymentCrmFullName(b)),
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = batchPaymentCrmFullName(record);
          if (!v) return "—";
          const pid = profileIdForDetailsLink(record);
          if (!pid) return v;
          return (
            <Link
              to={`/Details${buildDetailsSearch(pid)}`}
              style={MEMBER_FILE_LINK_STYLE}
            >
              {v}
            </Link>
          );
        },
        filterDropdown: createFilterDropdown(dataSource, (record) =>
          batchPaymentCrmFullName(record),
        ),
        onFilter: (value, record) =>
          String(batchPaymentCrmFullName(record)) === String(value),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "MEMBERSHIP STATUS",
        dataIndex: "subscriptionStatus",
        key: "membershipStatus",
        ellipsis: true,
        width: 160,
        sorter: (a, b) => {
          const aVal = (rowSubscriptionStatus(a) || "").toString();
          const bVal = (rowSubscriptionStatus(b) || "").toString();
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = rowSubscriptionStatus(record);
          if (v == null || String(v).trim() === "") {
            return <span style={{ color: "#94a3b8" }}>—</span>;
          }
          const t = String(v);
          return <Tag color={membershipStatusTagColor(t)}>{t}</Tag>;
        },
        filterDropdown: createFilterDropdown(dataSource, (record) =>
          rowSubscriptionStatus(record),
        ),
        onFilter: (value, record) => {
          const r = String(rowSubscriptionStatus(record) ?? "");
          return r === String(value);
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "PAYROLL NO",
        dataIndex: "Payroll No",
        key: "payrollNo",
        ellipsis: true,
        width: 120,
        sorter: (a, b) => {
          const aVal = (a["Payroll No"] || "").toString();
          const bVal = (b["Payroll No"] || "").toString();
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record["Payroll No"],
        ),
        onFilter: (value, record) => {
          const recordValue = (record["Payroll No"] || "").toString();
          return recordValue === value;
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "BATCH REF",
        key: "batchRefNo",
        ellipsis: true,
        width: 150,
        render: () => batchInfo.referenceNumber || "",
      },
      {
        title: "DESCRIPTION",
        key: "description",
        ellipsis: true,
        width: 250,
        render: () => batchInfo.description || "",
      },
    ];
  }, [batchInfo.referenceNumber, batchInfo.description, members]);

  const exceptionColumns = useMemo(() => {
    const dataSource = exceptions;
    return [
      {
        title: "MEMBERSHIP NO",
        key: "resolution",
        width: 250,
        align: "left",
        onCell: () => ({ style: { verticalAlign: "middle" } }),
        render: (_, record) =>
          isBatchEditable ? (
            <MembershipNoResolver
              batchId={batchId}
              exceptionId={record?._id}
              exceptionMembershipNumber={
                record?.fileRow?.membershipNumber ?? record?.membershipNumber
              }
              onResolved={refreshData}
            />
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 12 }}>
              Locked (batch not pending)
            </span>
          ),
      },
      {
        title: "FILE REF NO",
        key: "refNo",
        ellipsis: true,
        width: 150,
        sorter: (a, b) => {
          const aVal = String(a.fileRow?.membershipNumber ?? "");
          const bVal = String(b.fileRow?.membershipNumber ?? "");
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = record?.fileRow?.membershipNumber;
          return v != null && String(v).trim() !== "" ? String(v) : "—";
        },
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record.fileRow?.membershipNumber,
        ),
        onFilter: (value, record) =>
          String(record.fileRow?.membershipNumber ?? "") === String(value),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "FULL NAME",
        dataIndex: "fullName",
        key: "fullName",
        ellipsis: true,
        width: 180,
        sorter: (a, b) => {
          const aVal = (a.fullName || "").toString();
          const bVal = (b.fullName || "").toString();
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record.fullName,
        ),
        onFilter: (value, record) => {
          const recordValue = (record.fullName || "").toString();
          return recordValue === value;
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        render: (_, record) => {
          const v = record?.fullName;
          if (v == null || String(v).trim() === "")
            return <span style={{ color: "#94a3b8" }}>—</span>;
          const text = String(v);
          const pid = profileIdForDetailsLink(record);
          if (!pid) return text;
          return (
            <Link
              to={`/Details${buildDetailsSearch(pid)}`}
              style={MEMBER_FILE_LINK_STYLE}
            >
              {text}
            </Link>
          );
        },
      },
      {
        title: "MEMBERSHIP STATUS",
        dataIndex: "subscriptionStatus",
        key: "exceptionMembershipStatus",
        ellipsis: true,
        width: 160,
        sorter: (a, b) => {
          const aVal = (rowSubscriptionStatus(a) || "").toString();
          const bVal = (rowSubscriptionStatus(b) || "").toString();
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        render: (_, record) => {
          const v = rowSubscriptionStatus(record);
          if (v == null || String(v).trim() === "") {
            return <span style={{ color: "#94a3b8" }}>—</span>;
          }
          const t = String(v);
          return <Tag color={membershipStatusTagColor(t)}>{t}</Tag>;
        },
        filterDropdown: createFilterDropdown(dataSource, (record) =>
          rowSubscriptionStatus(record),
        ),
        onFilter: (value, record) => {
          const r = String(rowSubscriptionStatus(record) ?? "");
          return r === String(value);
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "PAYROLL NO",
        dataIndex: "Payroll No",
        key: "payrollNo",
        ellipsis: true,
        width: 120,
        sorter: (a, b) => {
          const aVal = (a["Payroll No"] || "").toString();
          const bVal = (b["Payroll No"] || "").toString();
          return aVal.localeCompare(bVal);
        },
        sortDirections: ["ascend", "descend"],
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record["Payroll No"],
        ),
        onFilter: (value, record) => {
          const recordValue = (record["Payroll No"] || "").toString();
          return recordValue === value;
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "AMOUNT",
        dataIndex: "valueForPeriodSelected",
        key: "amount",
        ellipsis: true,
        width: 120,
        align: "right",
        sorter: (a, b) => {
          const aVal = parseFloat(a.valueForPeriodSelected) || 0;
          const bVal = parseFloat(b.valueForPeriodSelected) || 0;
          return aVal - bVal;
        },
        sortDirections: ["ascend", "descend"],
        render: (value) => formatCurrency((value || 0) / 100),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => {
          const amountRanges = [
            { text: "0 - 100", value: "0-100" },
            { text: "100 - 500", value: "100-500" },
            { text: "500 - 1000", value: "500-1000" },
            { text: "1000+", value: "1000+" },
          ];

          const handleReset = () => {
            setSelectedKeys([]);
            clearFilters();
          };

          return (
            <div style={{ padding: 8 }}>
              <div style={{ marginBottom: 8 }}>
                {amountRanges.map((range) => (
                  <div
                    key={range.value}
                    onClick={() => {
                      const newSelectedKeys = selectedKeys?.includes(
                        range.value,
                      )
                        ? selectedKeys.filter((key) => key !== range.value)
                        : [...(selectedKeys || []), range.value];
                      setSelectedKeys(newSelectedKeys);
                    }}
                    style={{
                      padding: "4px 8px",
                      cursor: "pointer",
                      backgroundColor: selectedKeys?.includes(range.value)
                        ? "#e6f7ff"
                        : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys?.includes(range.value) || false}
                      readOnly
                      style={{ marginRight: 8 }}
                    />
                    {range.text}
                  </div>
                ))}
              </div>
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={handleReset}
                  style={{ width: 90 }}
                >
                  Clear
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => confirm()}
                  style={{ width: 90 }}
                >
                  Apply
                </Button>
              </Space>
            </div>
          );
        },
        onFilter: (value, record) => {
          const amount = parseFloat(record.valueForPeriodSelected) || 0;
          if (value === "0-100") return amount >= 0 && amount < 100;
          if (value === "100-500") return amount >= 100 && amount < 500;
          if (value === "500-1000") return amount >= 500 && amount < 1000;
          if (value === "1000+") return amount >= 1000;
          return true;
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "BATCH REF",
        key: "batchRefNo",
        render: () => batchInfo.referenceNumber || "",
      },
      {
        title: "DESCRIPTION",
        key: "description",
        ellipsis: true,
        width: 250,
        render: () => batchInfo.description || "",
      },
    ];
  }, [
    batchInfo.referenceNumber,
    batchInfo.description,
    exceptions,
    refreshData,
    isBatchEditable,
  ]);

  // Pagination state
  const rawDataSource = useMemo(
    () => (activeKey === "1" ? members : exceptions),
    [activeKey, members, exceptions],
  );
  const defaultPageSize = getDefaultPageSize(rawDataSource.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPageData, setCurrentPageData] = useState([]);

  // Process data with filtering and sorting before pagination
  const processedDataSource = useMemo(() => {
    let data = [...rawDataSource];

    // Apply filters
    Object.keys(filteredInfo).forEach((key) => {
      const filterValues = filteredInfo[key];
      if (filterValues && filterValues.length > 0) {
        const column = (activeKey === "1" ? columns : exceptionColumns).find(
          (col) => col.dataIndex === key || col.key === key,
        );
        if (column && column.onFilter) {
          data = data.filter((record) =>
            filterValues.some((value) => column.onFilter(value, record)),
          );
        }
      }
    });

    if (activeKey === "1" && batchRefNameViewFilter !== "all") {
      const refM = (r) => isFileRefMembershipMismatch(r);
      const nameM = (r) => isFileVsCrmNameMismatch(r);
      data = data.filter((record) => {
        switch (batchRefNameViewFilter) {
          case "ref_mismatch":
            return refM(record);
          case "ref_match":
            return !refM(record);
          case "name_mismatch":
            return nameM(record);
          case "name_match":
            return !nameM(record);
          case "both_mismatch":
            return refM(record) && nameM(record);
          case "both_match":
            return !refM(record) && !nameM(record);
          case "ref_mismatch_name_match":
            return refM(record) && !nameM(record);
          case "ref_match_name_mismatch":
            return !refM(record) && nameM(record);
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortedInfo.columnKey && sortedInfo.order) {
      const column = (activeKey === "1" ? columns : exceptionColumns).find(
        (col) => col.key === sortedInfo.columnKey,
      );
      if (column && column.sorter) {
        data.sort((a, b) => {
          const result = column.sorter(a, b);
          return sortedInfo.order === "descend" ? -result : result;
        });
      }
    }

    return data;
  }, [
    rawDataSource,
    filteredInfo,
    sortedInfo,
    activeKey,
    columns,
    exceptionColumns,
    batchRefNameViewFilter,
  ]);

  // Update paginated data when page, pageSize, or processedDataSource changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(processedDataSource.slice(startIndex, endIndex));
  }, [currentPage, pageSize, processedDataSource]);

  // Use processed data source for pagination total
  const dataSource = processedDataSource;

  // Reset to page 1 and update page size when processedDataSource changes
  useEffect(() => {
    setCurrentPage(1);
    const newDefaultPageSize = getDefaultPageSize(processedDataSource.length);
    setPageSize((prevSize) => {
      if (prevSize !== newDefaultPageSize) {
        return newDefaultPageSize;
      }
      return prevSize;
    });
  }, [processedDataSource.length]);

  // Reset pagination and filters when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRowKeys([]);
    setFilteredInfo({});
    setSortedInfo({});
    setBatchRefNameViewFilter("all");
  }, [activeKey]);

  const onChange = (key) => setActiveKey(key);

  // Handle file download with authentication
  const handleFileDownload = async (e) => {
    e.preventDefault();

    const fileUrl = batchInfo.fileUrl || batchInfo.filePath || batchInfo.file;
    if (!fileUrl || !batchInfo.fileName) {
      message.warning("File download URL not available");
      return;
    }

    const isAzureUrl = fileUrl.includes("blob.core.windows.net");

    if (isAzureUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = batchInfo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required to download file");
      return;
    }

    const hide = message.loading("Downloading file...", 0);
    try {
      const response = await axios.get(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = batchInfo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      hide();
      message.success("File downloaded successfully");
    } catch (error) {
      hide();
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to download file",
      );
      console.error("Download error:", error);
    }
  };

  // Get display values from Redux state
  const displayBatchDate = getSafeDate(batchInfo.batchDate);
  const displayPaymentDate = getSafeDate(batchInfo.paymentDate);
  const displayPaymentType = batchInfo.type;
  const displayComments = batchInfo.comments;

  // Calculate totals strictly from the Redux lists
  const calcTotalCurrent = members.reduce(
    (sum, m) =>
      sum + (parseFloat(m.fileRow?.valueForPeriodSelected) || 0) / 100,
    0,
  );
  const calcTotalExceptions = exceptions.reduce(
    (sum, e) => sum + (parseFloat(e.valueForPeriodSelected) || 0) / 100,
    0,
  );
  const calcTotalRecords = members.length + exceptions.length;

  const displayArrears = 0;
  const displayAdvance = 0; // Resetting/fallback for now as not in API schema
  const displayTotalCurrent = calcTotalCurrent;
  const displayTotal = displayTotalCurrent + displayArrears;
  const displayRecords = members.length;

  const displayBatchStatus = (() => {
    const raw = String(batchInfo?.batchStatus || "").trim();
    if (!raw) return "-";
    const normalized = raw.toLowerCase();
    if (normalized === "processed") return "Completed";
    if (normalized === "processing_in_progress") return "In Progress";
    return raw;
  })();
  const displayBatchStatusColor = (() => {
    const normalized = String(batchInfo?.batchStatus || "")
      .trim()
      .toLowerCase();
    if (normalized === "failed") return "error";
    if (normalized === "processed") return "success";
    if (
      normalized === "queued" ||
      normalized === "processing" ||
      normalized === "processing_in_progress"
    ) {
      return "processing";
    }
    return "default";
  })();
  const isBatchAlreadyQueuedOrProcessing =
    batchInfo?.batchStatus != null &&
    ["queued", "processing", "processing_in_progress", "processed"].includes(
      String(batchInfo.batchStatus).trim().toLowerCase(),
    );

  const handleTriggerBatch = async () => {
    if (!batchId || triggerBatchLoading || isBatchAlreadyQueuedOrProcessing) {
      return;
    }
    setTriggerBatchLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${getAccountServiceBaseUrl()}/batch-details/process/${batchId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      message.success("Batch queued successfully");
      refreshData();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Failed to queue batch for processing",
      );
    } finally {
      setTriggerBatchLoading(false);
    }
  };

  const confirmDeleteBatch = () => {
    const openDeleteModal = () => {
      Modal.confirm({
        wrapClassName: "batch-member-summary-delete-confirm",
        icon: <ExclamationCircleFilled />,
        title: "Delete batch",
        content: (
          <div className="batch-member-summary-delete-confirm-content">
            <div className="batch-member-summary-delete-message">
              <p style={{ margin: 0 }}>
                Deleting this batch will permanently remove the uploaded file
                and any changes made to the batch. This action cannot be undone.
              </p>
              <div style={{ height: "1em" }} aria-hidden />
              <p style={{ margin: 0, fontWeight: 600 }}>
                Are you sure you want to proceed?
              </p>
            </div>
          </div>
        ),
        okText: "Yes",
        cancelText: "No",
        okType: "primary",
        okButtonProps: { danger: true, type: "primary" },
        autoFocusButton: null,
        onOk: async () => {
          if (!batchId) return;
          try {
            await dispatch(deleteBatchDetail(batchId)).unwrap();
            message.success("Batch detail deleted");
            dispatch(clearBatchDetails());
            const t = (batchInfo?.type || "").toLowerCase();
            if (t.includes("deduction")) navigate("/Deductions");
            else if (t.includes("standing")) navigate("/StandingOrders");
            else navigate(-1);
          } catch (err) {
            message.error(
              typeof err === "string"
                ? err
                : err?.message || "Failed to delete batch",
            );
            return Promise.reject(err);
          }
        },
      });
    };
    // Defer until after the dropdown menu closes; otherwise focus/CSS for the OK
    // button can be wrong on first paint (danger styles not applied until a click).
    setTimeout(openDeleteModal, 0);
  };

  const batchHeaderMenuItems = [
    {
      key: "edit",
      disabled: !isPendingBatch,
      label: (
        <Tooltip
          title={
            isPendingBatch
              ? "Edit (batch details) — open the drawer to change batch metadata, dates, work location or bank, comments, and optionally replace the uploaded file."
              : "Edit is only available while the batch status is pending."
          }
          placement="left"
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              ...(!isPendingBatch ? { pointerEvents: "auto" } : {}),
            }}
          >
            <EditOutlined
              style={{
                fontSize: 16,
                color: isPendingBatch ? undefined : "rgba(0, 0, 0, 0.25)",
              }}
            />
          </span>
        </Tooltip>
      ),
      ...(isPendingBatch
        ? {
            onClick: () => {
              setIsEditBatchDetails(true);
              setIsBatchDetailsDrawerOpen(true);
            },
          }
        : {}),
    },
    {
      key: "delete",
      disabled: !isPendingBatch,
      label: (
        <Tooltip
          title={
            isPendingBatch
              ? "Delete batch — permanently removes this batch and its uploaded file from storage. You will be asked to confirm before anything is deleted."
              : "Delete is only available while the batch status is pending."
          }
          placement="left"
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              ...(!isPendingBatch ? { pointerEvents: "auto" } : {}),
            }}
          >
            <DeleteOutlined
              style={{
                fontSize: 16,
                color: isPendingBatch ? "#ff4d4f" : "rgba(0, 0, 0, 0.25)",
              }}
            />
          </span>
        </Tooltip>
      ),
      ...(isPendingBatch ? { onClick: () => confirmDeleteBatch() } : {}),
    },
  ];

  if (loading && !batchDetails) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "15px",
        paddingBottom: "12px",
      }}
    >
      {/* Absolute Top Unified Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Breadcrumb />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Dropdown
            menu={{ items: batchHeaderMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              className="me-1 gray-btn butn"
              icon={
                <BsThreeDots style={{ fontSize: "15px", fontWeight: 500 }} />
              }
              aria-label="Batch actions"
            />
          </Dropdown>
          <Button
            className="butn primary-btn"
            icon={<ThunderboltFilled />}
            loading={triggerBatchLoading}
            disabled={triggerBatchLoading || isBatchAlreadyQueuedOrProcessing}
            onClick={handleTriggerBatch}
          >
            {isBatchAlreadyQueuedOrProcessing
              ? "Batch Queued"
              : "Trigger Batch"}
          </Button>
        </div>
      </div>

      {/* Batch info strip - all batch fields */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "10px 16px",
          marginBottom: "8px",
          border: "1px solid #e2e8f0",
          minHeight: "56px",
          overflowX: "auto",
          gap: "0",
        }}
      >
        {/* Batch Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "160px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            Batch Name
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "140px",
            }}
          >
            {batchInfo.name || batchInfo.description || "-"}
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "#e2e8f0",
            margin: "0 12px",
            flexShrink: 0,
          }}
        />
        {/* Batch Ref */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            Batch Ref
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}
          >
            {batchInfo.referenceNumber || "-"}
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "#e2e8f0",
            margin: "0 12px",
            flexShrink: 0,
          }}
        />
        {/* Type */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            Type
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}
          >
            {batchInfo.type || "-"}
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "#e2e8f0",
            margin: "0 12px",
            flexShrink: 0,
          }}
        />
        {/* Batch Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            Batch Date
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}
          >
            {displayBatchDate ? displayBatchDate.format("MM/YYYY") : "-"}
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "#e2e8f0",
            margin: "0 12px",
            flexShrink: 0,
          }}
        />
        {/* Payment Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            Payment Date
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}
          >
            {displayPaymentDate ? displayPaymentDate.format("DD/MM/YYYY") : "-"}
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "#e2e8f0",
            margin: "0 12px",
            flexShrink: 0,
          }}
        />
        {/* Work Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "120px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            Work Location
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}
          >
            {batchInfo.workLocation || "-"}
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "#e2e8f0",
            margin: "0 12px",
            flexShrink: 0,
          }}
        />
        {/* Comments (if present) */}
        {batchInfo.comments != null && batchInfo.comments !== "" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "120px",
                maxWidth: "200px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                Comments
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {batchInfo.comments}
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "28px",
                backgroundColor: "#e2e8f0",
                margin: "0 12px",
                flexShrink: 0,
              }}
            />
          </>
        )}
        {/* Status (if present) */}
        {batchInfo.batchStatus != null && batchInfo.batchStatus !== "" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "100px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                Status
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                <Tag
                  color={displayBatchStatusColor}
                  style={{
                    margin: 0,
                    padding: "0px 8px",
                    borderRadius: 4,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {displayBatchStatus}
                </Tag>
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "28px",
                backgroundColor: "#e2e8f0",
                margin: "0 12px",
                flexShrink: 0,
              }}
            />
          </>
        )}
        {/* Created (if present) */}
        {(batchInfo.createdAt || batchInfo.createdBy) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "160px",
              marginLeft: "auto",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "500",
                whiteSpace: "nowrap",
              }}
            >
              Created
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}
            >
              {batchInfo.createdAt
                ? getSafeDate(batchInfo.createdAt).format("DD/MM/YYYY HH:mm")
                : ""}
              {batchInfo.createdAt && batchInfo.createdBy ? " · " : ""}
              {batchInfo.createdBy || ""}
            </div>
          </div>
        )}
      </div>

      {/* Compact KPI Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "8px",
          border: "1px solid #e2e8f0",
          height: "60px",
          overflowX: "auto",
          gap: "0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {/* Total Arrears */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: displayArrears !== 0 ? "#fee2e2" : "#f1f5f9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: displayArrears !== 0 ? "#ef4444" : "#0f172a",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <HistoryOutlined />
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Total Arrears
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: displayArrears !== 0 ? "#ef4444" : "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                {formatCurrency(displayArrears)}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#e2e8f0",
              margin: "0 16px",
              flexShrink: 0,
            }}
          />

          {/* Total Current */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#dbeafe",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#3b82f6",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <FolderOpenOutlined />
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Total Current
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                {formatCurrency(displayTotalCurrent)}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#e2e8f0",
              margin: "0 16px",
              flexShrink: 0,
            }}
          />

          {/* Total Advance */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: displayAdvance !== 0 ? "#dcfce7" : "#f1f5f9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: displayAdvance !== 0 ? "#22c55e" : "#94a3b8",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <RiseOutlined />
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Total Advance
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: displayAdvance !== 0 ? "#22c55e" : "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                {formatCurrency(displayAdvance)}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#e2e8f0",
              margin: "0 16px",
              flexShrink: 0,
            }}
          />

          {/* Batch Total */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#dbeafe",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#3b82f6",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <CalculatorOutlined />
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Batch Total
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                {formatCurrency(displayTotal)}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#e2e8f0",
              margin: "0 16px",
              flexShrink: 0,
            }}
          />

          {/* Exception Total */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: exceptions.length > 0 ? "#fee2e2" : "#f1f5f9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: exceptions.length > 0 ? "#ef4444" : "#94a3b8",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={14} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Exception Total
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: exceptions.length > 0 ? "#ef4444" : "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                {formatCurrency(calcTotalExceptions)}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#e2e8f0",
              margin: "0 16px",
              flexShrink: 0,
            }}
          />

          {/* Total Records */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#f1f5f9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#64748b",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <UnorderedListOutlined />
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Total Records
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                {displayRecords}
              </div>
            </div>
          </div>
        </div>

        {/* Source - Right aligned */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              backgroundColor: "#f1f5f9",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#64748b",
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            <CloudUploadOutlined />
          </div>
          <div>
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "500",
                lineHeight: "1.2",
              }}
            >
              Source
            </div>
            {batchInfo.fileName ? (
              <a
                href="#"
                onClick={handleFileDownload}
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#2563eb",
                  lineHeight: "1.2",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "200px",
                  textDecoration: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                <DownloadOutlined style={{ fontSize: "12px" }} />
                {batchInfo.fileName}
              </a>
            ) : (
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#94a3b8",
                  lineHeight: "1.2",
                }}
              >
                No file
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Filter Row */}

      {/* Unified Action Bar, Tabs and Table section */}
      <Card
        style={{
          ...cardStyle,
          maxHeight: "calc(100vh - 100px)",
          display: "flex",
          flexDirection: "column",
        }}
        styles={{
          body: {
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "visible",
          },
        }}
      >
        <div
          style={{
            padding: "8px 34px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f1f5f9",
            gap: "20px",
            backgroundColor: "rgba(9, 30, 66, 0.04)",
            flexShrink: 0,
            marginBottom: "8px",
          }}
        >
          {/* Left: Tabs */}
          <div style={{ flex: "0 0 auto" }}>
            <Tabs
              activeKey={activeKey}
              onChange={onChange}
              className="batch-tabs-new"
              style={{ marginBottom: "-9px" }}
              items={[
                {
                  key: "1",
                  label: (
                    <span style={{ fontWeight: "600" }}>Batch Payments</span>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span style={{ fontWeight: "600" }}>
                      Exceptions{" "}
                      <Tag
                        style={{
                          borderRadius: "10px",
                          backgroundColor: "#fee2e2",
                          border: "none",
                          color: "#ef4444",
                          marginLeft: "4px",
                        }}
                      >
                        {exceptions.length}
                      </Tag>
                    </span>
                  ),
                },
              ]}
            />
          </div>

          {/* Center: file ref + name combined filter (batch payments only) */}
          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {activeKey === "1" && (
              <Select
                aria-label="Filter by file ref vs membership and name on file vs full name"
                value={batchRefNameViewFilter}
                onChange={setBatchRefNameViewFilter}
                style={{ minWidth: 360, maxWidth: "100%", height: 36 }}
                popupMatchSelectWidth={false}
                options={[
                  { value: "all", label: "All rows" },
                  {
                    value: "ref_mismatch",
                    label: "File ref. no. ≠ membership (any name)",
                  },
                  {
                    value: "ref_match",
                    label: "File ref. = membership or n/a (any name)",
                  },
                  {
                    value: "name_mismatch",
                    label: "Name on file ≠ full name (any file ref.)",
                  },
                  {
                    value: "name_match",
                    label: "Name on file = full name (or both empty, any file ref.)",
                  },
                  {
                    value: "both_mismatch",
                    label: "Both: file ref. issue and name issue",
                  },
                  {
                    value: "both_match",
                    label: "Both ok: no file ref. issue and no name issue",
                  },
                  {
                    value: "ref_mismatch_name_match",
                    label: "File ref. issue only (names match)",
                  },
                  {
                    value: "ref_match_name_mismatch",
                    label: "Name issue only (file ref. ok)",
                  },
                ]}
              />
            )}
          </div>

          {/* Right: Actions */}
          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Space size="small">
              <Button
                icon={<PlusOutlined />}
                style={{
                  borderRadius: "8px",
                  fontWeight: "600",
                  height: "36px",
                  padding: "0 12px",
                }}
                onClick={() => {
                  if (!isBatchEditable) {
                    message.warning(
                      "Batch can only be edited while status is pending",
                    );
                    return;
                  }
                  setManualPayment(true);
                }}
                disabled={!isBatchEditable}
              >
                Add Members
              </Button>
              <CommonPopConfirm
                title="Move selected member(s) from Batch Payments to Exceptions?"
                description="They will be removed from the payment file list and appear under the Exceptions tab."
                onConfirm={handleExcludeMembersToExceptions}
                okText="Move to exceptions"
              >
                <Button
                  danger
                  icon={<MinusCircleOutlined />}
                  loading={excludeToExceptionsLoading}
                  style={{
                    borderRadius: "8px",
                    fontWeight: "600",
                    height: "36px",
                    padding: "0 12px",
                    backgroundColor: "transparent",
                    borderColor: "#fee2e2",
                    color: "#ef4444",
                  }}
                  disabled={
                    !isBatchEditable ||
                    activeKey !== "1" ||
                    selectedRowKeys.length === 0
                  }
                >
                  Exclude Members
                </Button>
              </CommonPopConfirm>
            </Space>
          </div>
        </div>

        <div
          className="common-table batch-member-summary-table"
          style={{
            padding: "0px",
            paddingLeft: "34px",
            paddingRight: "34px",
            width: "100%",
          }}
        >
          <Table
            loading={loading}
            bordered={true}
            rowClassName={paymentTableRowClassName}
            scroll={{ x: 1550, y: "calc(100vh - 440px)" }}
            size="middle"
            sticky
            columns={activeKey === "1" ? columns : exceptionColumns}
            dataSource={currentPageData}
            rowSelection={rowSelection}
            rowKey={(record) => record._id || record.id}
            pagination={false}
            onChange={(pagination, filters, sorter) => {
              setFilteredInfo(filters);
              setSortedInfo({
                columnKey: sorter.columnKey,
                order: sorter.order,
              });
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "60px 0" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#f1f5f9",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "0 auto 16px",
                      color: "#94a3b8",
                      fontSize: "24px",
                    }}
                  >
                    <UnorderedListOutlined />
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#0f172a",
                      marginBottom: "4px",
                    }}
                  >
                    No data available
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      maxWidth: "300px",
                      margin: "0 auto 20px",
                      lineHeight: "1.5",
                    }}
                  >
                    No payment records found for this batch in the system.
                  </div>
                </div>
              ),
            }}
          />
        </div>
      </Card>

      {/* Pagination Footer - Outside Card to ensure visibility */}
      <div
        className="d-flex justify-content-center align-items-center tbl-footer"
        style={{
          marginTop: "10px",
          padding: "8px 0",
          backgroundColor: "#fafafa",
          borderTop: "none",
          position: "relative",
          zIndex: 10,
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
              <span
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {`${start}-${end} of ${totalCount} items`}
              </span>
            );
          }}
        />
      </div>

      {/* Drawers */}
      <TrigerBatchMemberDrawer
        isOpen={isBatchmemberOpen}
        onClose={() => setIsBatchmemberOpen(!isBatchmemberOpen)}
      />

      <ManualPaymentEntryDrawer
        open={manualPayment}
        onClose={() => setManualPayment(!manualPayment)}
        batchId={batchId}
        onSuccess={refreshData}
        batchSummryData={{
          PaymentType: displayPaymentType,
          total: displayTotalCurrent,
          batchRef: batchInfo?.referenceNumber,
        }}
      />

      {/* Batch Details Drawer */}
      <MyDrawer
        title={isEditBatchDetails ? "Edit batch details" : "Batch Details"}
        open={isBatchDetailsDrawerOpen}
        onClose={() => {
          setIsBatchDetailsDrawerOpen(false);
          setIsEditBatchDetails(false);
        }}
        width={1200}
        isPagination={false}
        add={async () => {
          if (
            batchFormRef &&
            batchFormRef.current &&
            typeof batchFormRef.current.submit === "function"
          ) {
            const result = await batchFormRef.current.submit();
            if (!result) return;

            setIsBatchDetailsDrawerOpen(false);
            setIsEditBatchDetails(false);
            if (batchId) {
              dispatch(getBatchDetailsById(batchId));
            }
          } else {
            message.error("Failed to submit batch form");
          }
        }}
      >
        <CreateBatchPayment
          key={
            isBatchDetailsDrawerOpen && isEditBatchDetails && batchId
              ? `edit-batch-${batchId}`
              : "batch-drawer-form"
          }
          ref={batchFormRef}
          editBatchId={isEditBatchDetails && batchId ? batchId : null}
          editSource={isEditBatchDetails && batchDetails ? batchDetails : null}
        />
      </MyDrawer>
    </div>
  );
}
