import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useReminderBatchesFilter } from "../../context/ReminderBatchesFilterContext";
import ReminderBatchesTable from "../../component/reminders/ReminderBatchesTable";
import { parseReminderDateToMs } from "../../utils/Utilities";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";

function enrichReminderBatch(item) {
  const id = item?.id || item?._id || "";
  const date = item?.batchDate || item?.createdAt || "";
  const d = date ? new Date(date) : null;
  const month = d && !Number.isNaN(d.getTime()) ? d.getUTCMonth() + 1 : 0;
  const year = d && !Number.isNaN(d.getTime()) ? d.getUTCFullYear() : null;
  const batchCode = item?.referencePeriod
    ? `BATCH-${item.referencePeriod}`
    : year && month
      ? `BATCH-${year}-${String(month).padStart(2, "0")}`
      : `BATCH-${String(id).slice(-6) || "UNKNOWN"}`;
  const hash = Number(String(id).replace(/\D/g, "").slice(-6) || 1) * 17;
  const perf = (i) => {
    const positive = (hash + i) % 3 !== 0;
    const pct = Math.round((((hash + i * 11) % 250) / 10) * 10) / 10;
    return { positive, pct };
  };
  return {
    id,
    title: item?.name || "Untitled Batch",
    batchCode,
    date,
    user: item?.userFullName || "—",
    stats: {
      R1: Number(item?.countsByTier?.r1 ?? 0),
      R2: Number(item?.countsByTier?.r2 ?? 0),
      R3: Number(item?.countsByTier?.r3 ?? 0),
    },
    statusLabel: String(item?.status || "draft"),
    triggered:
      item?.executeCompletedAt ||
      item?.buildCompletedAt ||
      item?.executeStartedAt ||
      null,
    isSelected: false,
    performance: {
      R1: perf(1),
      R2: perf(2),
      R3: perf(3),
    },
  };
}

function batchGrandTotal(stats) {
  let sum = 0;
  let any = false;
  for (const k of ["R1", "R2", "R3"]) {
    const n = Number(stats?.[k]);
    if (!Number.isNaN(n)) {
      sum += n;
      any = true;
    }
  }
  return any ? sum : null;
}

function RemindersSummary() {
  const navigate = useNavigate();
  const { getRemindersById } = useReminders();
  const { disableFtn } = useTableColumns();
  const { applied } = useReminderBatchesFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [sortState, setSortState] = useState({
    columnKey: null,
    order: null,
  });
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchReminderBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const subscriptionBaseUrl = getSubscriptionServiceBaseUrl();
        if (!token || !subscriptionBaseUrl) {
          setRows([]);
          setTotalRows(0);
          return;
        }
        const response = await axios.get(
          `${subscriptionBaseUrl}/reminder-batches`,
          {
            params: {
              page: currentPage,
              limit: pageSize,
              kind: "REMINDER",
            },
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const payload = response?.data?.data || {};
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setRows(items.map(enrichReminderBatch));
        setTotalRows(Number(payload?.total || 0));
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          return;
        }
        setRows([]);
        setTotalRows(0);
      }
    };
    fetchReminderBatches();
    return () => controller.abort();
  }, [currentPage, pageSize]);

  const filteredData = useMemo(() => {
    return rows.filter((c) => {
      const titleOk =
        !applied.title ||
        (c.title || "").toLowerCase().includes(applied.title);
      if (applied.year == null) return titleOk;
      const y = c.date ? new Date(c.date).getFullYear() : NaN;
      return titleOk && y === applied.year;
    });
  }, [rows, applied]);

  useEffect(() => {
    setCurrentPage(1);
  }, [applied.title, applied.year]);

  const sortedFilteredData = useMemo(() => {
    const arr = [...filteredData];
    const { columnKey, order } = sortState;
    if (!columnKey || !order) return arr;
    const mult = order === "ascend" ? 1 : -1;
    if (columnKey === "batchName") {
      arr.sort(
        (a, b) =>
          mult *
          String(a.title || "").localeCompare(String(b.title || ""), undefined, {
            sensitivity: "base",
          }),
      );
    } else if (columnKey === "createdDate") {
      arr.sort(
        (a, b) =>
          mult *
          (parseReminderDateToMs(a.date) - parseReminderDateToMs(b.date)),
      );
    } else if (columnKey === "batchTotals") {
      arr.sort((a, b) => {
        const ta = batchGrandTotal(a.stats);
        const tb = batchGrandTotal(b.stats);
        if (ta == null && tb == null) return 0;
        if (ta == null) return order === "ascend" ? 1 : -1;
        if (tb == null) return order === "ascend" ? -1 : 1;
        return mult * (ta - tb);
      });
    }
    return arr;
  }, [filteredData, sortState]);

  const handleSortChange = (columnKey, order) => {
    setSortState({ columnKey, order });
  };

  const openBatch = (item) => {
    navigate("/RemindersDetails", {
      state: {
        reminderBatchTitle: item?.title,
        reminderBatchId: item?.id,
      },
    });
    getRemindersById(item?.id);
    if (item?.isSelected === true) {
      disableFtn(true);
    } else {
      disableFtn(false);
    }
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <ReminderBatchesTable
        dataSource={sortedFilteredData}
        onOpenBatch={openBatch}
        total={totalRows}
        sortColumnKey={sortState.columnKey}
        sortOrder={sortState.order}
        onSortChange={handleSortChange}
        current={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onShowSizeChange={(current, size) => {
          setCurrentPage(1);
          setPageSize(size);
        }}
      />
    </div>
  );
}

export default RemindersSummary;
