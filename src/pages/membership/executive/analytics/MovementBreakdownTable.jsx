import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Table } from "antd";
import { MOVEMENT_SERIES } from "./movementChartConfig";

const COMPACT_COLUMN_LABELS = {
  active: "Active",
  newJoin: "New",
  rejoin: "Re-join",
  reinstate: "Reinst.",
  resigned: "Resigned",
  cancelled: "Cancel.",
};

function buildColumns(compact) {
  const metricWidth = compact ? 58 : 96;
  return [
    {
      title: compact ? "Category" : "Membership category",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      ...(compact ? {} : { width: 160 }),
    },
    ...MOVEMENT_SERIES.map((s) => ({
      title: compact ? COMPACT_COLUMN_LABELS[s.key] : s.label,
      dataIndex: s.key,
      key: s.key,
      align: "right",
      width: metricWidth,
      render: (v) => (Number(v) || 0).toLocaleString("en-IE"),
    })),
  ];
}

export default function MovementBreakdownTable({
  data = [],
  compact = false,
  fillHeight = false,
}) {
  const wrapRef = useRef(null);
  const [scrollY, setScrollY] = useState(undefined);
  const columns = useMemo(() => buildColumns(compact), [compact]);

  useLayoutEffect(() => {
    if (!fillHeight || !wrapRef.current) return undefined;

    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const header =
        el.querySelector(".ant-table-header") ||
        el.querySelector(".ant-table-thead");
      const headerH = header?.getBoundingClientRect().height ?? 36;
      setScrollY(Math.max(64, Math.floor(el.clientHeight - headerH - 2)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fillHeight, data.length]);

  const scroll = fillHeight
    ? { x: "max-content", y: scrollY }
    : compact
      ? undefined
      : { x: 720 };

  return (
    <div
      ref={wrapRef}
      className={`exec-movement-table${compact ? " exec-movement-table--compact" : ""}${
        fillHeight ? " exec-movement-table--fill" : ""
      }`}
    >
      <Table
        size="small"
        pagination={false}
        tableLayout={compact ? "fixed" : undefined}
        scroll={scroll}
        dataSource={data.map((row, i) => ({ ...row, key: row.name || i }))}
        columns={columns}
      />
    </div>
  );
}
