import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Empty, DatePicker } from "antd";
import dayjs from "dayjs";
import MyTable from "../component/common/MyTable";
import {
  fetchMemberAuditHistory,
  fetchCrmUsersForActorLookup,
} from "../services/auditApi";
import {
  describeAuditChangeLabel,
  resolveAuditFieldLabel,
} from "../utils/auditFieldLabels";
import {
  buildUserActorLookup,
  resolveAuditActorDisplay,
} from "../utils/auditActorDisplay";

const RESOURCE_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "profile", label: "Profile" },
  { value: "subscription", label: "Subscription" },
  { value: "application", label: "Application" },
  { value: "finance", label: "Finance" },
];

const { RangePicker } = DatePicker;

const AUDIT_COL_DEFAULTS = {
  occurredAt: 120,
  user: 100,
  resourceType: 80,
  attribute: 100,
  changeDescription: 140,
  oldValue: 230,
  newValue: 230,
};

const AUDIT_COL_MIN_WIDTH = 56;
const AUDIT_COL_MAX_WIDTH = 480;

function measureTextWidthPx(text) {
  if (typeof document === "undefined") return 80;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 80;
  ctx.font = '14px Roboto, sans-serif';
  return Math.ceil(ctx.measureText(String(text ?? "")).width) + 28;
}

function measureColumnContentWidth(rows, dataIndex, headerTitle, formatValue) {
  let max = measureTextWidthPx(headerTitle);
  for (const row of rows) {
    const raw = row[dataIndex];
    const display = formatValue ? formatValue(raw) : raw;
    max = Math.max(max, measureTextWidthPx(display));
  }
  return Math.max(
    AUDIT_COL_MIN_WIDTH,
    Math.min(AUDIT_COL_MAX_WIDTH, max),
  );
}

function AuditResizableColumnHeader({
  title,
  width,
  isExpanded,
  onWidthChange,
  onToggleExpand,
}) {
  const onResizeMouseDown = useCallback(
    (e) => {
      if (e.detail > 1) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = width;
      const onMove = (ev) => {
        onWidthChange(
          Math.max(
            AUDIT_COL_MIN_WIDTH,
            Math.min(AUDIT_COL_MAX_WIDTH, startW + ev.clientX - startX),
          ),
          { fromDrag: true },
        );
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width, onWidthChange],
  );

  const handleDoubleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleExpand();
    },
    [onToggleExpand],
  );

  const gripTitle = isExpanded
    ? "Drag to resize · Double-click to restore width"
    : "Drag to resize · Double-click to expand column";

  return (
    <>
      <span
        className="audit-history-col-header-title"
        onDoubleClick={handleDoubleClick}
      >
        {title}
      </span>
      <span
        className="audit-history-col-resize-handle"
        title={gripTitle}
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${title} column`}
        onMouseDown={onResizeMouseDown}
        onDoubleClick={handleDoubleClick}
      />
    </>
  );
}

function buildResizableAuditColumn({
  key,
  title,
  dataIndex,
  width,
  sorter,
  render,
  defaultSortOrder,
  isExpanded,
  onResize,
  onToggleExpand,
}) {
  return {
    title: (
      <AuditResizableColumnHeader
        title={title}
        width={width}
        isExpanded={isExpanded}
        onWidthChange={(nextWidth, options) => onResize(key, nextWidth, options)}
        onToggleExpand={() => onToggleExpand(key, title, dataIndex)}
      />
    ),
    dataIndex,
    key,
    width,
    ellipsis: isExpanded ? false : { showTitle: true },
    defaultSortOrder,
    sorter,
    render,
    className: `audit-history-col audit-history-col--${key}${
      isExpanded ? " audit-history-col--expanded" : ""
    }`,
    onHeaderCell: () => ({
      className: `audit-history-col audit-history-col--${key}`,
      style: {
        width,
        minWidth: width,
        maxWidth: width,
        position: "relative",
        overflow: "visible",
      },
    }),
    onCell: () => ({
      className: `audit-history-col audit-history-col--${key}${
        isExpanded ? " audit-history-col--expanded" : ""
      }`,
      style: {
        width,
        minWidth: width,
        maxWidth: width,
        overflow: isExpanded ? "visible" : "hidden",
        whiteSpace: isExpanded ? "normal" : "nowrap",
        verticalAlign: isExpanded ? "top" : undefined,
      },
    }),
  };
}

function getDefaultAuditDateRange() {
  return [dayjs().subtract(72, "hour"), dayjs()];
}

function isWithinDateRange(occurredAt, dateRange) {
  if (!dateRange?.[0] || !dateRange?.[1] || !occurredAt) return true;
  const t = new Date(occurredAt).getTime();
  if (Number.isNaN(t)) return false;
  const start = dateRange[0].valueOf();
  const end =
    dateRange[1].hour() === 0 &&
    dateRange[1].minute() === 0 &&
    dateRange[1].second() === 0
      ? dateRange[1].endOf("day").valueOf()
      : dateRange[1].valueOf();
  return t >= start && t <= end;
}

function hasDisplayableChange(item) {
  const oldValue = item?.oldValue ?? "—";
  const newValue = item?.newValue ?? "—";
  return oldValue !== newValue;
}

function formatAuditDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compareAuditText(a, b, field) {
  return String(a[field] ?? "").localeCompare(
    String(b[field] ?? ""),
    undefined,
    {
      numeric: true,
      sensitivity: "base",
    },
  );
}

function compareAuditDateTime(a, b) {
  const timeA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
  const timeB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
  if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
  if (Number.isNaN(timeA)) return -1;
  if (Number.isNaN(timeB)) return 1;
  if (timeA !== timeB) return timeA - timeB;
  return String(b.auditLogId ?? "").localeCompare(
    String(a.auditLogId ?? ""),
    undefined,
    {
      numeric: true,
      sensitivity: "base",
    },
  );
}

function sortAuditItemsMostRecentFirst(items) {
  return [...items].sort((a, b) => -compareAuditDateTime(a, b));
}

function HistoryByID({
  profileId,
  subscriptionIds = [],
  applicationIds = [],
  membershipNumber,
}) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resourceType, setResourceType] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dateRange, setDateRange] = useState(getDefaultAuditDateRange);
  const [actorLookup, setActorLookup] = useState(() => new Map());
  const [columnWidths, setColumnWidths] = useState(() => ({ ...AUDIT_COL_DEFAULTS }));
  const [expandedColumns, setExpandedColumns] = useState(() => new Set());

  const relatedSubscriptionIds = useMemo(
    () => [...new Set((subscriptionIds || []).map(String).filter(Boolean))],
    [subscriptionIds],
  );
  const relatedApplicationIds = useMemo(
    () => [...new Set((applicationIds || []).map(String).filter(Boolean))],
    [applicationIds],
  );

  const loadHistory = useCallback(async () => {
    if (!profileId) {
      setAllItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [result, users] = await Promise.all([
        fetchMemberAuditHistory({
          profileId: String(profileId),
          subscriptionIds: relatedSubscriptionIds,
          applicationIds: relatedApplicationIds,
          membershipNumber: membershipNumber || undefined,
          resourceType: resourceType || undefined,
        }),
        fetchCrmUsersForActorLookup(),
      ]);
      setActorLookup(buildUserActorLookup(users));
      setAllItems(
        sortAuditItemsMostRecentFirst(
          (Array.isArray(result.items) ? result.items : []).filter(
            hasDisplayableChange,
          ),
        ),
      );
      setSelectedFields([]);
    } catch (err) {
      setAllItems([]);
      setActorLookup(new Map());
      setError(err?.message || "Failed to load audit history");
    } finally {
      setLoading(false);
    }
  }, [profileId, relatedSubscriptionIds, relatedApplicationIds, membershipNumber, resourceType]);

  const fieldOptions = useMemo(() => {
    const fields = new Set();
    for (const item of allItems) {
      fields.add(item.field || "");
    }
    return [...fields]
      .sort((a, b) =>
        resolveAuditFieldLabel(a).localeCompare(resolveAuditFieldLabel(b)),
      )
      .map((field) => ({
        value: field,
        label: resolveAuditFieldLabel(field),
      }));
  }, [allItems]);

  const userOptions = useMemo(() => {
    const users = new Set();
    for (const item of allItems) {
      const label = resolveAuditActorDisplay(item, actorLookup);
      if (label && label !== "—") users.add(label);
    }
    return [...users]
      .sort((a, b) => a.localeCompare(b))
      .map((user) => ({ value: user, label: user }));
  }, [allItems, actorLookup]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (selectedFields.length) {
      items = items.filter((item) => selectedFields.includes(item.field || ""));
    }
    if (selectedUsers.length) {
      items = items.filter((item) =>
        selectedUsers.includes(resolveAuditActorDisplay(item, actorLookup)),
      );
    }
    if (dateRange?.[0] && dateRange?.[1]) {
      items = items.filter((item) =>
        isWithinDateRange(item.occurredAt, dateRange),
      );
    }
    return items;
  }, [allItems, selectedFields, selectedUsers, dateRange, actorLookup]);

  const rows = useMemo(() => {
    return filteredItems.map((item, index) => ({
      key: `${item.auditLogId || "log"}-${item.field || "event"}-${index}`,
      auditLogId: item.auditLogId || null,
      changeDescription:
        describeAuditChangeLabel(item.action, item.field) ||
        item.changeDescription ||
        item.action ||
        "—",
      resourceType:
        item.resourceType === "finance"
          ? "Finance"
          : item.resourceType
            ? String(item.resourceType).charAt(0).toUpperCase() +
              String(item.resourceType).slice(1)
            : "—",
      attribute: resolveAuditFieldLabel(item.field),
      occurredAt: item.occurredAt || null,
      user: resolveAuditActorDisplay(item, actorLookup),
      oldValue: item.oldValue ?? "—",
      newValue: item.newValue ?? "—",
    }));
  }, [filteredItems, actorLookup]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleColumnResize = useCallback((key, nextWidth, options) => {
    if (options?.fromDrag) {
      setExpandedColumns((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
    setColumnWidths((prev) => ({
      ...prev,
      [key]: Math.max(
        AUDIT_COL_MIN_WIDTH,
        Math.min(AUDIT_COL_MAX_WIDTH, Math.round(nextWidth)),
      ),
    }));
  }, []);

  const toggleColumnExpand = useCallback(
    (key, title, dataIndex) => {
      if (expandedColumns.has(key)) {
        setExpandedColumns((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setColumnWidths((prev) => ({
          ...prev,
          [key]: AUDIT_COL_DEFAULTS[key],
        }));
        return;
      }

      const formatValue = dataIndex === "occurredAt" ? formatAuditDateTime : null;
      const targetWidth = measureColumnContentWidth(
        rows,
        dataIndex,
        title,
        formatValue,
      );
      setExpandedColumns((prev) => new Set(prev).add(key));
      setColumnWidths((prev) => ({
        ...prev,
        [key]: targetWidth,
      }));
    },
    [expandedColumns, rows],
  );

  const tableScrollX = useMemo(
    () => Object.values(columnWidths).reduce((sum, width) => sum + width, 0),
    [columnWidths],
  );

  const columns = useMemo(
    () => [
      buildResizableAuditColumn({
        key: "occurredAt",
        title: "Datetime",
        dataIndex: "occurredAt",
        width: columnWidths.occurredAt,
        isExpanded: expandedColumns.has("occurredAt"),
        defaultSortOrder: "descend",
        sorter: { compare: compareAuditDateTime },
        render: (value) => formatAuditDateTime(value),
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
      buildResizableAuditColumn({
        key: "user",
        title: "User",
        dataIndex: "user",
        width: columnWidths.user,
        isExpanded: expandedColumns.has("user"),
        sorter: {
          compare: (a, b) => compareAuditText(a, b, "user"),
        },
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
      buildResizableAuditColumn({
        key: "resourceType",
        title: "Resource",
        dataIndex: "resourceType",
        width: columnWidths.resourceType,
        isExpanded: expandedColumns.has("resourceType"),
        sorter: {
          compare: (a, b) => compareAuditText(a, b, "resourceType"),
        },
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
      buildResizableAuditColumn({
        key: "attribute",
        title: "Attribute",
        dataIndex: "attribute",
        width: columnWidths.attribute,
        isExpanded: expandedColumns.has("attribute"),
        sorter: {
          compare: (a, b) => compareAuditText(a, b, "attribute"),
        },
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
      buildResizableAuditColumn({
        key: "changeDescription",
        title: "Change Description",
        dataIndex: "changeDescription",
        width: columnWidths.changeDescription,
        isExpanded: expandedColumns.has("changeDescription"),
        sorter: {
          compare: (a, b) => compareAuditText(a, b, "changeDescription"),
        },
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
      buildResizableAuditColumn({
        key: "oldValue",
        title: "Old Value",
        dataIndex: "oldValue",
        width: columnWidths.oldValue,
        isExpanded: expandedColumns.has("oldValue"),
        sorter: {
          compare: (a, b) => compareAuditText(a, b, "oldValue"),
        },
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
      buildResizableAuditColumn({
        key: "newValue",
        title: "New Value",
        dataIndex: "newValue",
        width: columnWidths.newValue,
        isExpanded: expandedColumns.has("newValue"),
        sorter: {
          compare: (a, b) => compareAuditText(a, b, "newValue"),
        },
        onResize: handleColumnResize,
        onToggleExpand: toggleColumnExpand,
      }),
    ],
    [columnWidths, expandedColumns, handleColumnResize, toggleColumnExpand],
  );

  if (!profileId) {
    return <Empty description="No profile selected" />;
  }

  return (
    <div>
      <div
        style={{
          marginTop: 6,
          marginBottom: 6,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Select
          style={{ minWidth: 220, flex: "0 1 220px" }}
          value={resourceType}
          options={RESOURCE_TYPE_OPTIONS}
          onChange={setResourceType}
          placeholder="Filter by resource type"
        />
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 280, flex: "1 1 280px", maxWidth: 480 }}
          value={selectedFields}
          options={fieldOptions}
          onChange={setSelectedFields}
          placeholder="Filter by attribute"
          disabled={!fieldOptions.length}
          maxTagCount="responsive"
        />
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 220, flex: "1 1 220px", maxWidth: 320 }}
          value={selectedUsers}
          options={userOptions}
          onChange={setSelectedUsers}
          placeholder="Filter by user"
          disabled={!userOptions.length}
          maxTagCount="responsive"
        />
        <RangePicker
          allowClear
          format="DD/MM/YYYY"
          style={{ minWidth: 240, flex: "0 1 240px" }}
          value={dateRange}
          onChange={setDateRange}
          placeholder={["From date", "To date"]}
        />
      </div>
      {error ? (
        <div style={{ color: "#cf1322", marginBottom: 8 }}>{error}</div>
      ) : null}
      <div className="audit-history-table">
        <MyTable
          columns={columns}
          dataSource={rows}
          loading={loading}
          selection={false}
          defaultSortField="occurredAt"
          defaultSortOrder="descend"
          scroll={{ x: tableScrollX, y: 590 }}
          tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
          locale={{
            emptyText: loading ? "Loading…" : "No audit history for this member",
          }}
        />
      </div>
    </div>
  );
}

export default HistoryByID;
