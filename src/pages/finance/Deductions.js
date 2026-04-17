import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import MyTable from "../../component/common/MyTable";
import { getAllBatchDetails } from "../../features/profiles/BatchDetailsSlice";
import { getNotificationSocketConfig } from "../../context/NotificationContext";
import { formatCurrency } from "../../utils/Utilities";
import dayjs from "dayjs";

// Single ordered list of column keys for Deductions (no duplicates)
const DEDUCTIONS_COLUMN_ORDER = [
  "batchName",
  "PaymentType",
  "referenceNumber",
  "batchDate",
  "paymentDate",
  "workLocation",
  "batchStatus",
  "processingProgress",
  "comments",
  "totalArrears",
  "totalCurrent",
  "totalAdvance",
  "totalRecords",
  "batchTotal",
  "createdAt",
  "createdBy",
];

// Column definitions for batch summary (used to build final columns)
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
  totalRecords: { dataIndex: "totalRecords", title: "Total Records", width: 120, align: "right" },
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

const Deductions = () => {
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

  const formattedData = useMemo(
    () =>
      allBatches.map((item) => {
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
        const batchStatus = live?.status || item.batchStatus || "-";
        const inProgress =
          batchStatus === "queued" ||
          batchStatus === "processing" ||
          batchStatus === "processing_in_progress";
        const batchTotal = totalCurrent + totalArrears + totalAdvance;

        return {
          ...item,
          key: item._id,
          batchName: item.description,
          batchDate: item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-",
          paymentDate: item.paymentDate
            ? dayjs(item.paymentDate).format("DD/MM/YYYY")
            : item.date
              ? dayjs(item.date).format("DD/MM/YYYY")
              : "-",
          batchStatus,
          inProgress,
          processedTransactions,
          failedTransactions,
          totalTransactions,
          processingProgress: `${processedTransactions}/${totalTransactions}${
            failedTransactions > 0 ? ` (failed ${failedTransactions})` : ""
          }`,
          createdAt: item.createdAt
            ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")
            : "-",
          createdBy: item.createdBy ?? "-",
          Count: totalRecords,
          PaymentType: item.type ?? "-",
          referenceNumber: item.referenceNumber ?? "-",
          workLocation: item.workLocation ?? "-",
          description: item.description ?? "-",
          comments: item.comments ?? "-",
          totalArrears,
          totalCurrent,
          totalAdvance,
          totalRecords,
          batchTotal,
        };
      }),
    [allBatches, liveProgressByBatchId]
  );

  const tableColumns = useMemo(() => {
    return DEDUCTIONS_COLUMN_ORDER.map((key) => {
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
                state: { batchName: text, sidebarMenu: "Deductions" },
              })
            }
          >
            {text || "Unnamed Batch"}
          </span>
        );
      }
      if (key === "batchStatus") {
        col.render = (text) => {
          const status = String(text || "-");
          const isActive =
            status === "queued" ||
            status === "processing" ||
            status === "processing_in_progress";
          return (
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                color: isActive ? "#1D4ED8" : "#374151",
                background: isActive ? "#DBEAFE" : "#F3F4F6",
              }}
            >
              {status}
            </span>
          );
        };
      }
      if (key === "processingProgress") {
        col.render = (_, record) => {
          if (!record.inProgress) return <span>{record.processingProgress}</span>;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#065F46",
                  background: "#D1FAE5",
                }}
              >
                {record.processingProgress}
              </span>
              <button
                type="button"
                style={{
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  borderRadius: 6,
                  fontSize: 12,
                  padding: "2px 8px",
                  cursor: "pointer",
                }}
                onClick={() => dispatch(getAllBatchDetails())}
              >
                Refresh
              </button>
            </div>
          );
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
};

export default Deductions;
