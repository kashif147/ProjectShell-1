import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useReminderBatchesFilter } from "../../context/ReminderBatchesFilterContext";
import ReminderBatchesTable from "../../component/reminders/ReminderBatchesTable";
import { parseReminderDateToMs } from "../../utils/Utilities";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";

const REMINDER_TIERS = ["R1", "R2", "R3"];

function getReminderStats(item) {
  return {
    R1: Number(item?.countsByTier?.r1 ?? 0),
    R2: Number(item?.countsByTier?.r2 ?? 0),
    R3: Number(item?.countsByTier?.r3 ?? 0),
  };
}

function compareReminderTier(currentCount, previousCount) {
  if (previousCount == null) {
    return { positive: null, pct: null, hasComparison: false };
  }

  const current = Number(currentCount || 0);
  const previous = Number(previousCount || 0);
  const delta = current - previous;

  if (previous === 0) {
    return {
      positive: delta >= 0,
      pct: current === 0 ? 0 : null,
      hasComparison: true,
    };
  }

  return {
    positive: delta >= 0,
    pct: Math.round((Math.abs(delta) / previous) * 1000) / 10,
    hasComparison: true,
  };
}

function buildReminderPerformance(stats, previousStats) {
  return REMINDER_TIERS.reduce((acc, tier) => {
    acc[tier] = compareReminderTier(stats?.[tier], previousStats?.[tier]);
    return acc;
  }, {});
}

function getReminderBatchMonthKey(item) {
  const ref = String(item?.referencePeriod || "").trim();
  if (/^\d{4}-\d{2}$/.test(ref)) return ref;

  const date = item?.batchDate || item?.createdAt;
  const d = date ? new Date(date) : null;
  if (!d || Number.isNaN(d.getTime())) return null;

  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getPreviousMonthKey(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, "0")}`;
}

function enrichReminderBatch(item, previousItem = null) {
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
  const stats = getReminderStats(item);
  const previousStats = previousItem ? getReminderStats(previousItem) : null;
  return {
    id,
    title: item?.name || "Untitled Batch",
    batchCode,
    date,
    user: item?.userFullName || "—",
    stats,
    statusLabel: String(item?.status || "draft"),
    isDraft: String(item?.status || "draft").toLowerCase() === "draft",
    triggered: item?.executeCompletedAt || null,
    isSelected: false,
    performance: buildReminderPerformance(stats, previousStats),
  };
}

function enrichReminderBatches(items) {
  const byMonth = new Map();
  for (const item of items) {
    const monthKey = getReminderBatchMonthKey(item);
    if (monthKey && !byMonth.has(monthKey)) byMonth.set(monthKey, item);
  }

  return items.map((item) => {
    const monthKey = getReminderBatchMonthKey(item);
    const previousItem = byMonth.get(getPreviousMonthKey(monthKey)) || null;
    return enrichReminderBatch(item, previousItem);
  });
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
  const [deletingBatchId, setDeletingBatchId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchReminderBatches = useCallback(
    async (signal) => {
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
            signal,
          },
        );
        const payload = response?.data?.data || {};
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setRows(enrichReminderBatches(items));
        setTotalRows(Number(payload?.total || 0));
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          return;
        }
        setRows([]);
        setTotalRows(0);
      }
    },
    [currentPage, pageSize],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReminderBatches(controller.signal);
    return () => controller.abort();
  }, [fetchReminderBatches, refreshKey]);

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

  const handleDeleteBatch = async (item) => {
    const batchId = item?.id;
    if (!batchId) return;
    try {
      setDeletingBatchId(batchId);
      const token = localStorage.getItem("token");
      const subscriptionBaseUrl = getSubscriptionServiceBaseUrl();
      if (!token || !subscriptionBaseUrl) {
        message.error("Unable to delete batch");
        return;
      }
      await axios.delete(`${subscriptionBaseUrl}/reminder-batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Draft batch deleted");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      message.error(
        error?.response?.data?.data ||
          error?.response?.data?.message ||
          "Failed to delete batch",
      );
    } finally {
      setDeletingBatchId(null);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <ReminderBatchesTable
        dataSource={sortedFilteredData}
        onOpenBatch={openBatch}
        onDeleteBatch={handleDeleteBatch}
        deletingBatchId={deletingBatchId}
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
