import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { RightOutlined } from "@ant-design/icons";
import { LuRefreshCw } from "react-icons/lu";
import { communicationServicePath } from "../../utils/communicationServiceUrl";
import { formatDateDdMmYyyy } from "../../utils/Utilities";
import {
  SOFT_BATCH_STATUS_TAGS,
  SOFT_DELIVERY_STYLES,
} from "../../utils/softTagStyles";
import UnifiedPagination from "../../component/common/UnifiedPagination";
import "../../component/reminders/ReminderBatchesTable.css";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

const STACK_ROW1_H = 24;
const stackRow1 = {
  height: STACK_ROW1_H,
  minHeight: STACK_ROW1_H,
  maxHeight: STACK_ROW1_H,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
};
const stackRow2 = {
  fontSize: 11,
  marginTop: 2,
  lineHeight: 1.3,
};

function campaignStatusSoftStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent") return SOFT_BATCH_STATUS_TAGS.completed;
  if (s === "draft" || s === "scheduled") return SOFT_BATCH_STATUS_TAGS.pending;
  if (s === "processing") return SOFT_DELIVERY_STYLES.sent;
  if (s === "failed") return SOFT_DELIVERY_STYLES.failed;
  if (s === "cancelled") return SOFT_DELIVERY_STYLES.default;
  return SOFT_BATCH_STATUS_TAGS.pending;
}

function formatCampaignStatusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusSubtitle(row) {
  const s = String(row?.status || "").toLowerCase();
  if (s === "scheduled" && row?.scheduledAt) {
    return `Scheduled ${formatDateDdMmYyyy(row.scheduledAt)}`;
  }
  if (s === "sent" && row?.completedAt) {
    return formatDateDdMmYyyy(row.completedAt);
  }
  if (s === "sent") return "Send completed";
  if (s === "processing") return "Sending…";
  if (s === "failed") return row?.lastError ? "Error — see batch" : "Failed";
  if (s === "cancelled") return "Cancelled";
  if (s === "draft") return "Not sent";
  return "—";
}

function audienceBreakdown(record) {
  const audience = Number(record?.audienceProfileIds?.length || 0);
  const stats = record?.stats || {};
  const expanded = Number(stats.totalRecipients || 0);
  const total = Math.max(expanded, audience);
  const delivered = Number(stats.delivered || 0);
  const failed =
    Number(stats.failed || 0) +
    Number(stats.bounced || 0) +
    Number(stats.complaints || 0);
  const excluded = Number(stats.skippedOptOut || 0);
  const pending = Math.max(total - delivered - failed - excluded, 0);
  return { pending, delivered, failed, excluded };
}

function Emails() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [sortState, setSortState] = useState({
    columnKey: null,
    order: null,
  });

  const loadCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await axios.get(communicationServicePath("campaigns"), {
        headers: authHeaders(),
      });
      const rows = res.data?.data?.campaigns || res.data?.campaigns || [];
      setCampaigns(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setCampaigns([]);
      message.error(e.response?.data?.message || "Failed to load campaigns");
    } finally {
      setCampaignLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const sortedData = useMemo(() => {
    const arr = [...campaigns];
    const { columnKey, order } = sortState;
    if (!columnKey || !order) return arr;
    const mult = order === "ascend" ? 1 : -1;
    if (columnKey === "campaignName") {
      arr.sort(
        (a, b) =>
          mult *
          String(a.name || "").localeCompare(String(b.name || ""), undefined, {
            sensitivity: "base",
          }),
      );
    } else if (columnKey === "createdDate") {
      arr.sort(
        (a, b) =>
          mult *
          (new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()),
      );
    } else if (columnKey === "audience") {
      arr.sort(
        (a, b) =>
          mult *
          ((a.audienceProfileIds?.length || 0) -
            (b.audienceProfileIds?.length || 0)),
      );
    }
    return arr;
  }, [campaigns, sortState]);

  const totalRows = sortedData.length;
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [campaigns.length, sortState.columnKey, sortState.order]);

  const handleOpenCampaign = (row) => {
    const id = row?._id;
    if (!id) return;
    navigate(`/EmailCampaignDetail?campaignId=${encodeURIComponent(id)}`);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) setPageSize(size);
  };

  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s?.order) {
      setSortState({ columnKey: null, order: null });
      return;
    }
    const colKey =
      s.columnKey ??
      (typeof s.column?.key === "string" ? s.column.key : null) ??
      (s.field === "name"
        ? "campaignName"
        : s.field === "createdAt"
          ? "createdDate"
          : s.field === "audienceProfileIds"
            ? "audience"
            : null);
    if (colKey) setSortState({ columnKey: colKey, order: s.order });
  };

  const columns = useMemo(
    () => [
      {
        title: "Campaign",
        key: "campaignName",
        dataIndex: "name",
        width: 280,
        ellipsis: true,
        sorter: () => 0,
        sortOrder:
          sortState.columnKey === "campaignName"
            ? sortState.order ?? undefined
            : undefined,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => (
          <>
            <div style={stackRow1}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#262626",
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {record.name || "Untitled"}
              </div>
            </div>
            <div style={{ ...stackRow2, color: "#8c8c8c" }}>
              ID: {String(record._id || "").slice(-8) || "—"}
            </div>
          </>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 148,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const style = campaignStatusSoftStyle(record.status);
          return (
            <div>
              <div style={stackRow1}>
                <Tag bordered={false} style={style}>
                  {formatCampaignStatusLabel(record.status)}
                </Tag>
              </div>
              <div style={{ ...stackRow2, color: "#8c8c8c" }}>
                {statusSubtitle(record)}
              </div>
            </div>
          );
        },
      },
      {
        title: "Created",
        key: "createdDate",
        width: 168,
        sorter: () => 0,
        sortOrder:
          sortState.columnKey === "createdDate"
            ? sortState.order ?? undefined
            : undefined,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => (
          <div>
            <div style={stackRow1}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#262626",
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {record.createdByName || record.createdBy || "—"}
              </div>
            </div>
            <div style={{ ...stackRow2, color: "#8c8c8c" }}>
              {record.createdAt
                ? formatDateDdMmYyyy(record.createdAt)
                : "—"}{" "}
              {record.createdAt
                ? dayjs(record.createdAt).format("HH:mm")
                : ""}
            </div>
          </div>
        ),
      },
      {
        title: "Audience",
        key: "audience",
        width: 290,
        sorter: () => 0,
        sortOrder:
          sortState.columnKey === "audience"
            ? sortState.order ?? undefined
            : undefined,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const n = record?.audienceProfileIds?.length || 0;
          return (
            <div>
              <div style={stackRow1}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#262626",
                    lineHeight: 1.3,
                  }}
                >
                  {n.toLocaleString()}
                </div>
              </div>
              <div style={{ ...stackRow2, color: "#8c8c8c" }}>
                Profiles selected
              </div>
            </div>
          );
        },
      },
      {
        title: "Pending",
        key: "pendingCount",
        width: 120,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const { pending } = audienceBreakdown(record);
          return (
            <div style={stackRow1}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#262626" }}>
                {pending.toLocaleString()}
              </div>
            </div>
          );
        },
      },
      {
        title: "Delivered",
        key: "deliveredCount",
        width: 120,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const { delivered } = audienceBreakdown(record);
          return (
            <div style={stackRow1}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#262626" }}>
                {delivered.toLocaleString()}
              </div>
            </div>
          );
        },
      },
      {
        title: "Failed",
        key: "failedCount",
        width: 120,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const { failed } = audienceBreakdown(record);
          return (
            <div style={stackRow1}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#262626" }}>
                {failed.toLocaleString()}
              </div>
            </div>
          );
        },
      },
      {
        title: "Opt-out",
        key: "excludedCount",
        width: 130,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const { excluded } = audienceBreakdown(record);
          return (
            <div>
              <div style={stackRow1}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#262626" }}>
                  {excluded.toLocaleString()}
                </div>
              </div>
              <div style={{ ...stackRow2, color: "#8c8c8c" }}>Consent</div>
            </div>
          );
        },
      },
      {
        title: "",
        key: "chevron",
        width: 48,
        fixed: "right",
        align: "center",
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
          style: { verticalAlign: "top" },
        }),
        render: () => (
          <div>
            <div style={{ ...stackRow1, justifyContent: "center" }}>
              <RightOutlined style={{ color: "#d9d9d9", fontSize: 12 }} />
            </div>
            <div style={stackRow2} aria-hidden>
              &nbsp;
            </div>
          </div>
        ),
      },
    ],
    [sortState.columnKey, sortState.order],
  );

  return (
    <div style={{ width: "100%" }}>
      <div
        className="common-table "
        style={{
          paddingLeft: "34px",
          paddingRight: "34px",
          width: "100%",
          overflowX: "auto",
          paddingBottom: "80px",
        }}
      >
        <div className="reminder-batches-table-wrap">
          <Table
            rowKey={(r) => String(r._id)}
            columns={columns}
            dataSource={pagedRows}
            loading={campaignLoading}
            pagination={false}
            bordered
            tableLayout="fixed"
            sticky
            scroll={{ x: "max-content", y: "calc(100vh - 380px)" }}
            size="small"
            locale={{ emptyText: "No email campaigns" }}
            onChange={handleTableChange}
            onRow={(record) => ({
              onClick: () => handleOpenCampaign(record),
              style: { cursor: "pointer" },
            })}
          />
        </div>
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
            total={totalRows}
            current={currentPage}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={(page, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
            itemName="campaigns"
            style={{ margin: 0, padding: 0 }}
            showTotalFormatter={(tot, range) => {
              const start = Number.isNaN(range[0]) ? 0 : range[0];
              const end = Number.isNaN(range[1]) ? 0 : range[1];
              const totalCount = Number.isNaN(tot) ? 0 : tot;
              return (
                <span
                  style={{
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {`${start}-${end} of ${totalCount} campaigns`}
                  <LuRefreshCw
                    style={{
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#215e97",
                      transition: "color 0.3s ease",
                      marginLeft: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadCampaigns();
                    }}
                    title="Refresh"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#1890ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#215e97";
                    }}
                  />
                </span>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Emails;
