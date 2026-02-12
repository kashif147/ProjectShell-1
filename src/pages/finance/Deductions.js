import React, { useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import MyTable from "../../component/common/MyTable";
import { getAllBatchDetails } from "../../features/profiles/BatchDetailsSlice";
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

  useEffect(() => {
    if (!hasFetchedRef.current) {
      dispatch(getAllBatchDetails());
      hasFetchedRef.current = true;
    }
  }, [dispatch]);

  const formattedData = useMemo(
    () =>
      allBatches.map((item) => {
        const payments = item.batchPayments || [];
        const exceptions = item.batchExceptions || [];
        const totalFromPayments = payments.reduce(
          (sum, m) => sum + (parseFloat(m.amount) || 0),
          0
        );
        const totalFromExceptions = exceptions.reduce(
          (sum, e) => sum + (parseFloat(e.valueForPeriodSelected) || 0),
          0
        );
        const totalArrears = 0;
        const totalCurrent = totalFromPayments + totalFromExceptions;
        const totalAdvance = 0;
        const totalRecords = payments.length + exceptions.length;
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
          batchStatus: item.batchStatus ?? "-",
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
    [allBatches]
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
                state: { batchName: text },
              })
            }
          >
            {text || "Unnamed Batch"}
          </span>
        );
      }
      return col;
    }).filter(Boolean);
  }, [navigate]);

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
