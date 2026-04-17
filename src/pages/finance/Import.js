import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
import { getAllBatchDetails } from "../../features/profiles/BatchDetailsSlice";
import { getNotificationSocketConfig } from "../../context/NotificationContext";
import { formatCurrency } from "../../utils/Utilities";
import dayjs from "dayjs";

const IMPORT_COLUMN_ORDER = [
  "batchName",
  "PaymentType",
  "referenceNumber",
  "batchDate",
  "paymentDate",
  "workLocation",
  "batchStatus",
  "processingProgress",
  "totalArrears",
  "totalCurrent",
  "totalAdvance",
  "batchTotal",
  "comments",
  "createdAt",
  "createdBy",
];

const COLUMN_DEFS = {
  batchName: { dataIndex: "batchName", title: "Batch Name", ellipsis: true, width: 150 },
  PaymentType: { dataIndex: "PaymentType", title: "Batch Type", ellipsis: true, width: 120 },
  referenceNumber: { dataIndex: "referenceNumber", title: "Batch Ref No", ellipsis: true, width: 140 },
  batchDate: { dataIndex: "batchDate", title: "Batch Date", ellipsis: true, width: 120 },
  paymentDate: { dataIndex: "paymentDate", title: "Payment Date", ellipsis: true, width: 120 },
  workLocation: { dataIndex: "workLocation", title: "Work Location", ellipsis: true, width: 140 },
  batchStatus: { dataIndex: "batchStatus", title: "Batch Status", ellipsis: true, width: 120 },
  processingProgress: {
    dataIndex: "processingProgress",
    title: "Processed",
    width: 140,
    ellipsis: true,
  },
  comments: { dataIndex: "comments", title: "Comments", ellipsis: true, width: 160 },
  totalArrears: {
    dataIndex: "totalArrears",
    title: "Total Arrears",
    width: 120,
    align: "right",
    render: (val) => formatCurrency(val ?? 0),
  },
  totalCurrent: {
    dataIndex: "totalCurrent",
    title: "Total Current",
    width: 120,
    align: "right",
    render: (val) => formatCurrency(val ?? 0),
  },
  totalAdvance: {
    dataIndex: "totalAdvance",
    title: "Total Advance",
    width: 120,
    align: "right",
    render: (val) => formatCurrency(val ?? 0),
  },
  batchTotal: {
    dataIndex: "batchTotal",
    title: "Batch Total",
    width: 120,
    align: "right",
    render: (val) => formatCurrency(val ?? 0),
  },
  createdAt: { dataIndex: "createdAt", title: "Created At", ellipsis: true, width: 150 },
  createdBy: { dataIndex: "createdBy", title: "Created By", ellipsis: true, width: 150 },
};

const getBatchStatusLabel = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "processed") return "Completed";
  if (normalized === "processing_in_progress") return "In Progress";
  if (normalized === "queued") return "Queued";
  if (normalized === "failed") return "Failed";
  if (!normalized) return "-";
  return String(status);
};

function Import() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allBatches, allBatchesLoading } = useSelector(
    (state) => state.batchDetails,
  );

  const hasFetchedRef = useRef(false);
  const [liveProgressByBatchId, setLiveProgressByBatchId] = useState({});

  useEffect(() => {
    if (!hasFetchedRef.current) {
      dispatch(getAllBatchDetails());
      hasFetchedRef.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const { origin, path } = getNotificationSocketConfig();
    const socket = io(origin, {
      path,
      auth: { token },
      query: { token },
      transports: ["websocket"],
    });

    const handleProgress = (payload = {}) => {
      if (!payload.batchDetailId) return;
      setLiveProgressByBatchId((prev) => ({
        ...prev,
        [payload.batchDetailId]: {
          status: payload.status || "processing_in_progress",
          processedTransactions: Number(payload.processedTransactions || 0),
          failedTransactions: Number(payload.failedTransactions || 0),
          totalTransactions: Number(payload.totalTransactions || 0),
        },
      }));
    };

    const handleCompleted = (payload = {}) => {
      if (!payload.batchDetailId) return;
      setLiveProgressByBatchId((prev) => ({
        ...prev,
        [payload.batchDetailId]: {
          status: payload.status || "processed",
          processedTransactions: Number(payload.processedTransactions || 0),
          failedTransactions: Number(payload.failedTransactions || 0),
          totalTransactions: Number(payload.totalTransactions || 0),
        },
      }));
      dispatch(getAllBatchDetails());
    };

    socket.on("batchProcessProgress", handleProgress);
    socket.on("batchProcessCompleted", handleCompleted);

    return () => {
      socket.off("batchProcessProgress", handleProgress);
      socket.off("batchProcessCompleted", handleCompleted);
      socket.disconnect();
    };
  }, [dispatch]);

  const formattedData = useMemo(() => {
    const allowedTypes = new Set(["deduction", "standing order"]);
    const merged = allBatches
      .filter((item) =>
        allowedTypes.has(String(item.type || "").trim().toLowerCase()),
      )
      .map((item) => {
        const payments = item.batchPayments || [];
        const totalArrears = 0;
        const totalCurrent = payments.reduce(
          (sum, m) => sum + (parseFloat(m.fileRow?.valueForPeriodSelected) || 0) / 100,
          0
        );
        const totalAdvance = 0;
        const totalRecords = payments.length;
        const live = liveProgressByBatchId[item._id] || null;
        const totalTransactions =
          Number(live?.totalTransactions) > 0
            ? Number(live.totalTransactions)
            : Number(item.totalTransactions) > 0
              ? Number(item.totalTransactions)
              : totalRecords;
        const processedTransactions =
          Number(live?.processedTransactions) >= 0
            ? Number(live.processedTransactions)
            : Number(item.processedTransactions || 0);
        const failedTransactions =
          Number(live?.failedTransactions) >= 0
            ? Number(live.failedTransactions)
            : Number(item.failedTransactions || 0);
        const exceptionsCount = Array.isArray(item.batchExceptions)
          ? item.batchExceptions.length
          : 0;
        const batchStatus = live?.status || item.batchStatus || "-";
        const inProgress =
          batchStatus === "queued" ||
          batchStatus === "processing" ||
          batchStatus === "processing_in_progress";
        const batchTotal = totalCurrent + totalArrears + totalAdvance;
        const normalizedType = String(item.type || "").trim().toLowerCase();
        const paymentTypeLabel =
          normalizedType === "deduction" ? "Deduction" : "Standing Order";

        return {
          ...item,
          key: item._id,
          batchName: item.description,
          batchDate: item.batchDate ? dayjs(item.batchDate).format("MMM YYYY") : "-",
          paymentDate: item.paymentDate
            ? dayjs(item.paymentDate).format("DD/MM/YYYY")
            : item.date
              ? dayjs(item.date).format("DD/MM/YYYY")
              : "-",
          batchStatus,
          inProgress,
          processedTransactions,
          failedTransactions,
          exceptionsCount,
          totalTransactions,
          processingProgress: `${processedTransactions}/${totalTransactions}`,
          createdAtRaw: item.createdAt ? dayjs(item.createdAt).valueOf() : 0,
          createdAt: item.createdAt
            ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")
            : "-",
          createdBy: item.createdBy ?? "-",
          PaymentType: paymentTypeLabel,
          referenceNumber: item.referenceNumber ?? "-",
          workLocation: item.workLocation || item.bankName || "-",
          comments: item.comments ?? "-",
          totalArrears,
          totalCurrent,
          totalAdvance,
          batchTotal,
        };
      });

    return merged.sort((a, b) => (b.createdAtRaw || 0) - (a.createdAtRaw || 0));
  }, [allBatches, liveProgressByBatchId]);

  const tableColumns = useMemo(() => {
    return IMPORT_COLUMN_ORDER.map((key) => {
      const def = COLUMN_DEFS[key];
      if (!def) return null;
      const col = { ...def };
      if (key === "batchName") {
        col.render = (text, record) => (
          <span
            style={{
              color: "#0052CC",
              cursor: "pointer",
              fontWeight: "600",
              textDecoration: "underline",
            }}
            onClick={() =>
              navigate(`/BatchMemberSummary/${record._id}`, {
                state: { batchName: text, sidebarMenu: record.PaymentType === "Deduction" ? "Deductions" : "Standing Orders" },
              })
            }
          >
            {text || "Unnamed Batch"}
          </span>
        );
      }
      if (key === "batchStatus") {
        col.render = (text) => {
          const rawStatus = String(text || "-");
          const normalized = rawStatus.toLowerCase();
          const statusLabel = getBatchStatusLabel(rawStatus);
          const isActive =
            normalized === "queued" ||
            normalized === "processing" ||
            normalized === "processing_in_progress";
          const isCompleted = normalized === "processed";
          const isFailed = normalized === "failed";
          const color = isFailed
            ? "error"
            : isCompleted
              ? "success"
              : isActive
                ? "processing"
                : "default";
          return (
            <Tag
              color={color}
              style={{
                margin: 0,
                padding: "0px 8px",
                borderRadius: 4,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {statusLabel}
            </Tag>
          );
        };
      }
      if (key === "processingProgress") {
        col.render = (_, record) => {
          if (!record.inProgress) return <span>{record.processingProgress}</span>;
          const queued =
            String(record.batchStatus || "").toLowerCase() === "queued";
          const progressTagColor = queued ? "processing" : "success";
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag
                color={progressTagColor}
                style={{
                  margin: 0,
                  padding: "0px 8px",
                  borderRadius: 4,
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {record.processingProgress}
              </Tag>
              {record.exceptionsCount > 0 && (
                <span style={{ color: "#DC2626", fontWeight: 600 }}>
                  ({record.exceptionsCount})
                </span>
              )}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  border: "1px solid #D1D5DB",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onClick={() => dispatch(getAllBatchDetails())}
                title="Refresh"
              >
                <ReloadOutlined style={{ fontSize: 12, color: "#4B5563" }} />
              </span>
            </div>
          );
        };
        const originalRender = col.render;
        col.render = (_, record) => {
          if (!record.inProgress) {
            return (
              <span>
                {record.processingProgress}
                {record.exceptionsCount > 0 && (
                  <span style={{ color: "#DC2626", fontWeight: 600 }}>
                    {" "}
                    ({record.exceptionsCount})
                  </span>
                )}
              </span>
            );
          }
          return originalRender(_, record);
        };
      }
      return col;
    }).filter(Boolean);
  }, [navigate, dispatch]);

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <MyTable
        dataSource={formattedData}
        columns={tableColumns}
        loading={allBatchesLoading}
      />
    </div>
  );
}

export default Import;