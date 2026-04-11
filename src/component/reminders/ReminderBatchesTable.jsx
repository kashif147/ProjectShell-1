import React, { useMemo } from "react";
import { Table, Tag } from "antd";
import "./ReminderBatchesTable.css";
import { RightOutlined } from "@ant-design/icons";
import { LuRefreshCw } from "react-icons/lu";
import UnifiedPagination from "../common/UnifiedPagination";
import { formatDateDdMmYyyy } from "../../utils/Utilities";

/** Same height for row 1 in stack columns so row 2 (ID / trigger / created date / breakdown) lines up */
const STACK_ROW1_H = 26;
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

function formatCount(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return n ?? "—";
  return num.toLocaleString();
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

function PerfCell({ positive, pct, size = 13 }) {
  const p = typeof pct === "number" ? pct.toFixed(1) : pct;
  return (
    <span
      style={{
        fontWeight: 600,
        fontSize: size,
        color: positive ? "#389e0d" : "#cf1322",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ marginRight: 4 }} aria-hidden>
        {positive ? "↗" : "↘"}
      </span>
      {p}%
    </span>
  );
}

function perfSecondaryLabel(k, perf) {
  const p = typeof perf.pct === "number" ? perf.pct.toFixed(1) : perf.pct;
  const arrow = perf.positive ? "↗" : "↘";
  return `${k} (${arrow}${p}%)`;
}

function ReminderBatchesTable({
  dataSource,
  onOpenBatch,
  total,
  current,
  pageSize,
  onPageChange,
  onShowSizeChange,
  sortColumnKey,
  sortOrder,
  onSortChange,
}) {
  const columns = useMemo(
    () => [
      {
        title: "Batch name",
        key: "batchName",
        dataIndex: "title",
        width: 280,
        ellipsis: true,
        sorter: () => 0,
        sortOrder:
          sortColumnKey === "batchName" ? sortOrder ?? undefined : undefined,
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
                {record.title}
              </div>
            </div>
            <div style={{ ...stackRow2, color: "#8c8c8c" }}>
              ID: {record.batchCode}
            </div>
          </>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 128,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const completed = Boolean(record.triggered);
          return (
            <div>
              <div style={stackRow1}>
                <Tag
                  color={completed ? "success" : "warning"}
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "0 6px",
                  }}
                >
                  {completed ? "Completed" : "Pending"}
                </Tag>
              </div>
              <div
                style={{
                  ...stackRow2,
                  color: completed ? "#722ed1" : "#bfbfbf",
                }}
              >
                {completed
                  ? formatDateDdMmYyyy(record.triggered)
                  : "Not triggered"}
              </div>
            </div>
          );
        },
      },
      {
        title: "Created by",
        key: "createdDate",
        dataIndex: "user",
        width: 168,
        sorter: () => 0,
        sortOrder:
          sortColumnKey === "createdDate" ? sortOrder ?? undefined : undefined,
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
                {record.user}
              </div>
            </div>
            <div style={{ ...stackRow2, color: "#8c8c8c" }}>
              {formatDateDdMmYyyy(record.date)}
            </div>
          </div>
        ),
      },
      {
        title: "Batch totals",
        key: "subtotals",
        width: 240,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const grand = batchGrandTotal(record.stats);
          const r1 = formatCount(record.stats?.R1);
          const r2 = formatCount(record.stats?.R2);
          const r3 = formatCount(record.stats?.R3);
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
                  {grand != null ? formatCount(grand) : "—"}
                </div>
              </div>
              <div style={{ ...stackRow2, color: "#8c8c8c" }}>
                R1 ({r1}) R2 ({r2}) R3 ({r3})
              </div>
            </div>
          );
        },
      },
      {
        title: "Performance (vs prev month)",
        key: "performance",
        width: 240,
        onCell: () => ({
          className: "reminder-batches-table__cell-stack",
        }),
        render: (_, record) => {
          const keys = ["R1", "R2", "R3"];
          const perfs = keys.map(
            (k) =>
              record.performance?.[k] || {
                positive: true,
                pct: 0,
              },
          );
          return (
            <div>
              <div
                style={{
                  ...stackRow1,
                  gap: 12,
                  flexWrap: "nowrap",
                }}
              >
                {keys.map((k, i) => (
                  <PerfCell key={k} positive={perfs[i].positive} pct={perfs[i].pct} size={13} />
                ))}
              </div>
              <div style={{ ...stackRow2, color: "#8c8c8c" }}>
                {keys.map((k, i) => perfSecondaryLabel(k, perfs[i])).join(" ")}
              </div>
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
    [sortColumnKey, sortOrder],
  );

  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s?.order) {
      onSortChange?.(null, null);
      return;
    }
    const colKey =
      s.columnKey ??
      (s.field === "title"
        ? "batchName"
        : s.field === "date" || s.field === "user"
          ? "createdDate"
          : null);
    if (colKey) {
      onSortChange?.(colKey, s.order);
    }
  };

  return (
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
        rowKey={(r) => r.id}
        rowClassName={() => ""}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        tableLayout="fixed"
        sticky
        scroll={{ x: "max-content", y: "calc(100vh - 380px)" }}
        size="small"
        locale={{ emptyText: "No Data" }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => onOpenBatch(record),
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
          total={total}
          current={current}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onShowSizeChange}
          itemName="batches"
          style={{ margin: 0, padding: 0 }}
          showTotalFormatter={(tot, range) => {
            const start = isNaN(range[0]) ? 0 : range[0];
            const end = isNaN(range[1]) ? 0 : range[1];
            const totalCount = isNaN(tot) ? 0 : tot;
            return (
              <span
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {`${start}-${end} of ${totalCount} batches`}
                <LuRefreshCw
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#215e97",
                    transition: "color 0.3s ease",
                    marginLeft: "4px",
                  }}
                  onClick={() => window.location.reload()}
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
  );
}

export default ReminderBatchesTable;
