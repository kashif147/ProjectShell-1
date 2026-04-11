import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useReminderBatchesFilter } from "../../context/ReminderBatchesFilterContext";
import { campaigns } from "../../Data";
import ReminderBatchesTable from "../../component/reminders/ReminderBatchesTable";
import { parseReminderDateToMs } from "../../utils/Utilities";

function enrichCampaign(item) {
  const parts = String(item.date || "").split("/");
  const month = parts[0] ? parseInt(parts[0], 10) : 0;
  const year = parts[2] ? parseInt(parts[2], 10) : null;
  const batchCode =
    item.batchCode ||
    (year && month
      ? `BATCH-${year}-${String(month).padStart(2, "0")}`
      : `BATCH-${item.id}`);
  const hash = Number(item.id) * 17;
  const perf = (i) => {
    const positive = (hash + i) % 3 !== 0;
    const pct = Math.round((((hash + i * 11) % 250) / 10) * 10) / 10;
    return { positive, pct };
  };
  return {
    ...item,
    batchCode,
    performance: item.performance || {
      R1: perf(1),
      R2: perf(2),
      R3: perf(3),
    },
  };
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

  const filteredData = useMemo(() => {
    const enriched = campaigns.map(enrichCampaign);
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

export default RemindersSummary;
