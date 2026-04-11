import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useCancellationBatchesFilter } from "../../context/CancellationBatchesFilterContext";
import { cancellations, cancellationDetail } from "../../Data";
import CancellationBatchesTable from "../../component/cancellations/CancellationBatchesTable";
import { parseReminderDateToMs } from "../../utils/Utilities";

function parseMemberCount(m) {
  if (m == null) return 0;
  const digits = String(m).replace(/\D/g, "");
  if (digits) return parseInt(digits, 10) || 0;
  const n = Number(m);
  return Number.isFinite(n) ? n : 0;
}

function countReminder3(members) {
  let r3Count = 0;
  if (!members?.length) return r3Count;
  for (const m of members) {
    if (m == null || typeof m !== "object") continue;
    const rn = String(m.reminderNo || "")
      .trim()
      .toUpperCase();
    if (rn === "R3") r3Count++;
  }
  return r3Count;
}

function enrichCancellation(item) {
  const parts = String(item.date || "").split("/");
  const month = parts[0] ? parseInt(parts[0], 10) : 0;
  const year = parts[2] ? parseInt(parts[2], 10) : null;
  const batchCode =
    year && month
      ? `CBATCH-${year}-${String(month).padStart(2, "0")}`
      : `CBATCH-${item.id}`;
  const detail = cancellationDetail.find(
    (d) => String(d.id) === String(item.id),
  );
  const r3Count = countReminder3(detail?.members);
  const batchTotal = parseMemberCount(item.members);
  return {
    ...item,
    batchCode,
    batchTotal,
    r3Count,
    hasCancellationDetail: detail != null,
  };
}

function CancellationSummary() {
  const navigate = useNavigate();
  const { getCancellationById } = useReminders();
  const { disableFtn } = useTableColumns();
  const { applied } = useCancellationBatchesFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [sortState, setSortState] = useState({
    columnKey: null,
    order: null,
  });

  const filteredData = useMemo(() => {
    const enriched = cancellations.map(enrichCancellation);
    return enriched.filter((c) => {
      const titleOk =
        !applied.title ||
        (c.title || "").toLowerCase().includes(applied.title);
      if (applied.year == null) return titleOk;
      const p = String(c.date || "").split("/");
      const y = p[2] ? parseInt(p[2], 10) : NaN;
      return titleOk && y === applied.year;
    });
  }, [applied]);

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

  const paginatedData = sortedFilteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSortChange = (columnKey, order) => {
    setSortState({ columnKey, order });
    setCurrentPage(1);
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
        dataSource={paginatedData}
        onOpenBatch={openBatch}
        total={sortedFilteredData.length}
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
