import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useCancellationBatchesFilter } from "../../context/CancellationBatchesFilterContext";
import CancellationBatchesTable from "../../component/cancellations/CancellationBatchesTable";
import { parseReminderDateToMs } from "../../utils/Utilities";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";

function enrichCancellation(item) {
  const id = item?.id || item?._id || "";
  const date = item?.batchDate || item?.createdAt || "";
  const d = date ? new Date(date) : null;
  const month = d && !Number.isNaN(d.getTime()) ? d.getUTCMonth() + 1 : 0;
  const year = d && !Number.isNaN(d.getTime()) ? d.getUTCFullYear() : null;
  const batchCode = item?.referencePeriod
    ? `CBATCH-${item.referencePeriod}`
    : year && month
      ? `CBATCH-${year}-${String(month).padStart(2, "0")}`
      : `CBATCH-${String(id).slice(-6) || "UNKNOWN"}`;
  const r3Count = Number(item?.countsByTier?.r3 ?? 0);
  const cancelCount = Number(item?.countsByTier?.cancel ?? 0);
  const fallbackTotal = Number(item?.countsByTier?.r1 ?? 0) + Number(item?.countsByTier?.r2 ?? 0) + r3Count + cancelCount;
  const batchTotal = cancelCount || fallbackTotal;
  return {
    id,
    title: item?.name || "Untitled Batch",
    date,
    user: item?.userFullName || "—",
    batchCode,
    batchTotal,
    r3Count,
    processed:
      item?.executeCompletedAt ||
      item?.buildCompletedAt ||
      (String(item?.status || "").toLowerCase() === "completed"
        ? item?.updatedAt || item?.createdAt || true
        : null),
    hasCancellationDetail: false,
  };
}

function CancellationSummary() {
  const navigate = useNavigate();
  const { getCancellationById } = useReminders();
  const { disableFtn } = useTableColumns();
  const { applied } = useCancellationBatchesFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortState, setSortState] = useState({
    columnKey: null,
    order: null,
  });
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCancellationBatches = async () => {
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
              kind: "CANCELLATION",
            },
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const payload = response?.data?.data || {};
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setRows(items.map(enrichCancellation));
        setTotalRows(Number(payload?.total || 0));
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          return;
        }
        setRows([]);
        setTotalRows(0);
      }
    };
    fetchCancellationBatches();
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
    } else if (columnKey === "batchTotal") {
      arr.sort((a, b) => mult * (a.batchTotal - b.batchTotal));
    } else if (columnKey === "reminder3Totals") {
      arr.sort((a, b) => mult * (a.r3Count - b.r3Count));
    }
    return arr;
  }, [filteredData, sortState]);

  const handleSortChange = (columnKey, order) => {
    setSortState({ columnKey, order });
  };

  const openBatch = (item) => {
    navigate("/CancellationDetail", {
      state: {
        cancellationBatchTitle: item?.title,
        cancellationBatchId: item?.id,
      },
    });
    getCancellationById(item?.id);
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
      <CancellationBatchesTable
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

export default CancellationSummary;
