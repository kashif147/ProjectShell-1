import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Tag, message } from "antd";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import directDebitRunsApi from "../../services/directDebitRunsApi";

const STATUS_COLORS = {
  DRAFT: "default",
  VALIDATED: "processing",
  APPROVED: "blue",
  FILE_GENERATED: "cyan",
  SUBMITTED: "geekblue",
  PARTIALLY_RECONCILED: "orange",
  RECONCILED: "green",
  CANCELLED: "red",
};

const DEFAULT_DD_COLUMNS = [
  { title: "Run No", dataIndex: "runNo", key: "runNo" },
  { title: "Type", dataIndex: "runType", key: "runType" },
  { title: "Collection date", dataIndex: "collectionDate", key: "collectionDate" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Included", dataIndex: ["totals", "includedCount"], key: "included" },
  { title: "Amount EUR", dataIndex: ["totals", "includedAmountEur"], key: "amount" },
];

const isDdRunColumnSet = (cols) =>
  Array.isArray(cols) &&
  cols.some(
    (col) =>
      col.dataIndex === "runNo" ||
      col.key === "runNo" ||
      (Array.isArray(col.dataIndex) && col.dataIndex[0] === "runNo"),
  );

function DirectDebitSummary() {
  const navigate = useNavigate();
  const { columns } = useTableColumns();
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState([]);

  const openRun = useCallback(
    (record) => {
      const runId = record?._id || record?.id || record?.key;
      if (!runId) return;
      navigate("/DirectDebitBatchDetails", {
        state: { runId, run: record },
      });
    },
    [navigate],
  );

  const loadRuns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await directDebitRunsApi.list({ limit: 200 });
      setRuns(data?.items || []);
    } catch (err) {
      message.error(err.message || "Failed to load DD runs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    let debounceTimer;
    const onChanged = () => {
      if (window.location.pathname !== "/DirectDebit") return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadRuns(), 400);
    };
    window.addEventListener("direct-debit-runs-changed", onChanged);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("direct-debit-runs-changed", onChanged);
    };
  }, [loadRuns]);

  const tableColumns = useMemo(() => {
    const contextCols = columns["DirectDebitSummary"];
    const baseColumns = isDdRunColumnSet(contextCols)
      ? contextCols.filter((col) => col.isVisible !== false)
      : DEFAULT_DD_COLUMNS;

    return baseColumns.map((col) => {
      if (col.dataIndex === "runNo" || col.key === "runNo") {
        return {
          ...col,
          render: (text, record) => (
            <span
              style={{ color: "#1890ff", cursor: "pointer", fontWeight: 500 }}
              onClick={(e) => {
                e.stopPropagation();
                openRun(record);
              }}
            >
              {text || "—"}
            </span>
          ),
        };
      }
      if (col.dataIndex === "status" || col.key === "status") {
        return {
          ...col,
          render: (s) => <Tag color={STATUS_COLORS[s] || "default"}>{s}</Tag>,
        };
      }
      if (col.dataIndex === "collectionDate" || col.key === "collectionDate") {
        return {
          ...col,
          render: (d) => (d ? dayjs(d).format("DD MMM YYYY") : "—"),
        };
      }
      if (col.key === "amount" || col.dataIndex?.[1] === "includedAmountEur") {
        return {
          ...col,
          render: (_, r) =>
            r.totals?.includedAmountEur != null
              ? `€${Number(r.totals.includedAmountEur).toFixed(2)}`
              : "—",
        };
      }
      if (col.key === "included" || col.dataIndex?.[1] === "includedCount") {
        return {
          ...col,
          render: (_, r) =>
            r.totals?.includedCount != null ? r.totals.includedCount : "—",
        };
      }
      return col;
    });
  }, [columns, openRun]);

  const tableData = runs.map((r) => ({ ...r, key: r._id }));

  return (
    <div style={{ padding: "0 35px" }}>
      <MyTable
        loading={loading}
        columns={tableColumns}
        dataSource={tableData}
        pagination={{ pageSize: 50 }}
        onRowClick={openRun}
      />
    </div>
  );
}

export default DirectDebitSummary;
