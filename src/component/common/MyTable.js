import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Table } from "antd";
import UnifiedPagination, { getDefaultPageSize } from "./UnifiedPagination";
import { LuRefreshCw } from "react-icons/lu";
import { Link } from "react-router-dom";

const MyTable = ({
  columns,
  dataSource = [],
  selection = true,
  rowSelection: externalRowSelection,
  onSelectionChange,
  selectionType = "checkbox",
  loading = false,
  onRowClick,
  tablePadding = { paddingLeft: "34px", paddingRight: "34px" },
  scroll = { x: "max-content", y: 590 },
  /** `pagination` (default): page numbers. `infinite`: compact footer; optional feed-style chunk loading (see infiniteLoadOnScroll). */
  footerVariant = "pagination",
  infiniteInitialRows = 60,
  infiniteChunkSize = 60,
  /** When false with footerVariant=infinite, all rows stay mounted; only the table body scrolls (scroll.y). */
  infiniteLoadOnScroll = true,
  /** When set with defaultSortOrder, table starts sorted (e.g. date latest first). */
  defaultSortField,
  defaultSortOrder,
  /**
   * When sorting by any other column, compare this column first (then the active sort).
   * Use with alwaysFirstSortOrder so multi-column sort stays stable (e.g. ledger Created).
   */
  alwaysFirstSortField,
  alwaysFirstSortOrder = "ascend",
}) => {
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState(() =>
    defaultSortField && defaultSortOrder
      ? { field: defaultSortField, order: defaultSortOrder }
      : {}
  );

  const isExternallyControlled =
    externalRowSelection !== undefined && onSelectionChange !== undefined;

  useEffect(() => {
    if (!isExternallyControlled && internalSelectedRowKeys.length > 0) {
      const validKeys = internalSelectedRowKeys.filter(
        (key) =>
          dataSource &&
          dataSource.some((item) => {
            const itemKey = item.key || item.id || item._id;
            return itemKey === key || String(itemKey) === String(key);
          })
      );
      if (validKeys.length !== internalSelectedRowKeys.length) {
        setInternalSelectedRowKeys(validKeys);
      }
    }
  }, [dataSource, isExternallyControlled, internalSelectedRowKeys]);

  const handleSelectionChange = useCallback(
    (selectedKeys, selectedRows) => {
      if (isExternallyControlled) {
        onSelectionChange(selectedKeys, selectedRows);
      } else {
        setInternalSelectedRowKeys(selectedKeys);
      }
    },
    [isExternallyControlled, onSelectionChange]
  );

  const rowSelectionConfig = useMemo(() => {
    if (!selection) return null;

    const currentSelectedKeys = isExternallyControlled
      ? (externalRowSelection && externalRowSelection.selectedRowKeys) || []
      : internalSelectedRowKeys;

    return {
      type: selectionType,
      selectedRowKeys: currentSelectedKeys,
      onChange: handleSelectionChange,
      ...(externalRowSelection || {}),
    };
  }, [
    selection,
    isExternallyControlled,
    externalRowSelection,
    internalSelectedRowKeys,
    selectionType,
    handleSelectionChange,
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    const next = Array.isArray(sorter) ? sorter[0] : sorter;
    setSortedInfo(next && next.field && next.order ? next : {});
    if (footerVariant === "infinite" && infiniteLoadOnScroll) {
      setVisibleRowCount(infiniteInitialRows);
    } else if (footerVariant !== "infinite") {
      setCurrentPage(1); // Reset to first page on filter/sort change
    }
  };

  /** Active sort: user choice, or defaultSort* when sort cleared. */
  const effectiveSort = useMemo(() => {
    if (sortedInfo.field && sortedInfo.order) return sortedInfo;
    if (defaultSortField && defaultSortOrder) {
      return { field: defaultSortField, order: defaultSortOrder };
    }
    return {};
  }, [sortedInfo, defaultSortField, defaultSortOrder]);

  const applySortOrderSign = (result, order) =>
    order === "descend" ? -result : result;

  // Process data for filtering and sorting
  const processedData = useMemo(() => {
    let data = Array.isArray(dataSource) ? [...dataSource] : [];

    // Filter data
    Object.keys(filteredInfo).forEach((key) => {
      const filterValues = filteredInfo[key];
      if (filterValues && filterValues.length > 0) {
        const column = columns.find(
          (col) => col.dataIndex === key || col.key === key
        );
        if (column && column.onFilter) {
          data = data.filter((record) =>
            filterValues.some((value) => column.onFilter(value, record))
          );
        } else {
          // Default filtering if onFilter is missing but filters are provided
          data = data.filter((record) => {
            const val = record[key];
            return filterValues.includes(String(val));
          });
        }
      }
    });

    // Sort data
    if (effectiveSort.field && effectiveSort.order) {
      const { field, order } = effectiveSort;
      const column = columns.find(
        (col) => col.dataIndex === field || col.key === field
      );

      const useCompound =
        alwaysFirstSortField &&
        field !== alwaysFirstSortField &&
        (alwaysFirstSortOrder === "ascend" || alwaysFirstSortOrder === "descend");

      if (order) {
        if (useCompound) {
          const firstCol = columns.find(
            (col) =>
              col.dataIndex === alwaysFirstSortField ||
              col.key === alwaysFirstSortField
          );
          data.sort((a, b) => {
            let first = 0;
            if (
              firstCol?.sorter &&
              typeof firstCol.sorter.compare === "function"
            ) {
              first = firstCol.sorter.compare(a, b);
            }
            first = applySortOrderSign(first, alwaysFirstSortOrder);
            if (first !== 0) return first;

            let result = 0;
            if (
              column &&
              column.sorter &&
              typeof column.sorter.compare === "function"
            ) {
              result = column.sorter.compare(a, b);
            } else {
              const valA = a[field];
              const valB = b[field];
              if (typeof valA === "string") {
                result = valA.localeCompare(valB);
              } else {
                result = (valA ?? 0) - (valB ?? 0);
              }
            }
            return applySortOrderSign(result, order);
          });
        } else {
          data.sort((a, b) => {
            let result = 0;
            if (
              column &&
              column.sorter &&
              typeof column.sorter.compare === "function"
            ) {
              result = column.sorter.compare(a, b);
            } else {
              // Default sorting
              const valA = a[field];
              const valB = b[field];
              if (typeof valA === "string") {
                result = valA.localeCompare(valB);
              } else {
                result = valA - valB;
              }
            }
            return applySortOrderSign(result, order);
          });
        }
      }
    }

    return data;
  }, [
    dataSource,
    filteredInfo,
    effectiveSort,
    columns,
    alwaysFirstSortField,
    alwaysFirstSortOrder,
  ]);

  const defaultPageSize = useMemo(
    () => getDefaultPageSize(processedData.length),
    [processedData.length]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [visibleRowCount, setVisibleRowCount] = useState(infiniteInitialRows);
  const [infiniteBodyHeight, setInfiniteBodyHeight] = useState(320);
  const tableWrapRef = useRef(null);
  const tableBodyHostRef = useRef(null);
  const processedLenRef = useRef(0);
  processedLenRef.current = processedData.length;

  const mergedScroll = useMemo(() => {
    const x = scroll?.x ?? "max-content";
    if (footerVariant === "infinite") {
      return { x, y: infiniteBodyHeight };
    }
    return { ...scroll, x };
  }, [scroll, footerVariant, infiniteBodyHeight]);

  useLayoutEffect(() => {
    if (footerVariant !== "infinite") return undefined;
    const el = tableBodyHostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const measureBodyScrollHeight = () => {
      const host = tableBodyHostRef.current;
      if (!host) return;
      let h = Math.floor(host.getBoundingClientRect().height);
      if (h < 80) {
        h = Math.max(160, Math.floor(window.innerHeight * 0.35));
      }
      // scroll.y is only for .ant-table-body; host also contains .ant-table-header — without this,
      // body max-height equals full host and the last rows sit under the external tbl-footer.
      const headerEl = host.querySelector(".ant-table-header");
      const headerH = headerEl
        ? Math.ceil(headerEl.getBoundingClientRect().height)
        : 0;
      const stickyScrollEl = host.querySelector(".ant-table-sticky-scroll");
      const stickyH =
        stickyScrollEl &&
        stickyScrollEl.offsetParent !== null &&
        stickyScrollEl.getBoundingClientRect().height > 2
          ? Math.ceil(stickyScrollEl.getBoundingClientRect().height)
          : 0;
      const bodyY = Math.max(80, h - headerH - stickyH - 2);
      setInfiniteBodyHeight((prev) => (prev === bodyY ? prev : bodyY));
    };

    const ro = new ResizeObserver(() => {
      measureBodyScrollHeight();
    });
    ro.observe(el);
    measureBodyScrollHeight();
    let raf = requestAnimationFrame(() => measureBodyScrollHeight());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [footerVariant, loading, processedData.length, columns]);

  useEffect(() => {
    if (footerVariant === "infinite") {
      if (infiniteLoadOnScroll) {
        setVisibleRowCount(
          Math.min(
            infiniteInitialRows,
            Math.max(processedData.length || 0, 0)
          )
        );
      }
      return;
    }
    const newDefaultPageSize = getDefaultPageSize(processedData.length || 0);
    setPageSize(newDefaultPageSize);
    setCurrentPage(1);
  }, [
    dataSource,
    processedData.length,
    footerVariant,
    infiniteInitialRows,
    infiniteLoadOnScroll,
  ]);

  useEffect(() => {
    if (footerVariant === "infinite") {
      if (!infiniteLoadOnScroll) {
        setCurrentPageData(processedData);
        return;
      }
      const take = Math.min(visibleRowCount, processedData.length);
      setCurrentPageData(processedData.slice(0, take));
      return;
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(processedData.slice(startIndex, endIndex));
  }, [
    footerVariant,
    infiniteLoadOnScroll,
    visibleRowCount,
    currentPage,
    pageSize,
    processedData,
  ]);

  useEffect(() => {
    if (footerVariant !== "infinite" || !infiniteLoadOnScroll) return undefined;

    let cancelled = false;
    let bodyEl = null;
    let onScroll = null;

    const t = window.setTimeout(() => {
      if (cancelled) return;
      bodyEl = tableWrapRef.current?.querySelector(".ant-table-body");
      if (!bodyEl) return;

      onScroll = () => {
        const len = processedLenRef.current;
        if (len <= 0) return;
        const nearBottom =
          bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight < 120;
        if (!nearBottom) return;
        setVisibleRowCount((c) => {
          if (c >= len) return c;
          return Math.min(c + infiniteChunkSize, len);
        });
      };

      bodyEl.addEventListener("scroll", onScroll, { passive: true });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (bodyEl && onScroll) bodyEl.removeEventListener("scroll", onScroll);
    };
  }, [
    footerVariant,
    infiniteLoadOnScroll,
    infiniteChunkSize,
    infiniteBodyHeight,
    loading,
    processedData.length,
  ]);

  // Enhance columns with filtered/sorted info
  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      const newCol = {
        ...col,
        filteredValue: filteredInfo[col.dataIndex || col.key] || null,
        sortOrder:
          effectiveSort.field === (col.dataIndex || col.key)
            ? effectiveSort.order
            : null,
      };

      if (
        (newCol.title === "Batch Name" || newCol.dataIndex === "batchName") &&
        !newCol.render
      ) {
        newCol.render = (text, record) => (
          <Link
            to="/BatchMemberSummary"
            state={{
              batchName: text,
              batchId: record?.key || record?.id || record?._id,
              batchStatus: record?.batchStatus || record?.status,
            }}
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {text}
          </Link>
        );
      }

      return newCol;
    });
  }, [columns, filteredInfo, effectiveSort]);

  const infiniteShown = infiniteLoadOnScroll
    ? Math.min(visibleRowCount, processedData.length)
    : processedData.length;
  const infiniteHasMore =
    footerVariant === "infinite" &&
    infiniteLoadOnScroll &&
    infiniteShown < processedData.length;

  const outerStyle =
    footerVariant === "infinite"
      ? {
          ...tablePadding,
          width: "100%",
          flex: "1 1 0%",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 0,
        }
      : {
          ...tablePadding,
          width: "100%",
          overflowX: "auto",
          paddingBottom: "80px",
        };

  const tableNode = (
    <Table
      rowKey={(record) => record.key || record.id || record._id}
      loading={loading}
      columns={enhancedColumns}
      dataSource={currentPageData || []}
      rowSelection={rowSelectionConfig}
      pagination={false}
      onChange={handleTableChange}
      bordered
      tableLayout="fixed"
      sticky
      scroll={mergedScroll}
      size="middle"
      onRow={(record, rowIndex) => ({
        onClick: () => onRowClick && onRowClick(record, rowIndex),
      })}
      locale={{
        emptyText: "No Data",
      }}
    />
  );

  return (
    <div ref={tableWrapRef} className="common-table" style={outerStyle}>
      {footerVariant === "infinite" ? (
        <div
          ref={tableBodyHostRef}
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            /* Let flex parent set height so Table scroll.y keeps scroll inside .ant-table-body */
            alignSelf: "stretch",
          }}
        >
          {tableNode}
        </div>
      ) : (
        tableNode
      )}
      {footerVariant === "infinite" ? (
        <div
          className="d-flex justify-content-center align-items-center tbl-footer"
          style={{
            flexShrink: 0,
            marginTop: 0,
            padding: "6px 10px",
            backgroundColor: "#fafafa",
            position: "relative",
            zIndex: 10,
            fontSize: 12,
            color: "#65676b",
            gap: 8,
            lineHeight: 1.35,
          }}
        >
          <span>
            {processedData.length === 0
              ? "No transactions"
              : infiniteHasMore
                ? `Showing ${infiniteShown} of ${processedData.length} — scroll the list for more`
                : `${processedData.length} transaction${processedData.length === 1 ? "" : "s"} — scroll inside the table`}
          </span>
          <LuRefreshCw
            style={{
              cursor: "pointer",
              fontSize: "14px",
              color: "#215e97",
              transition: "color 0.3s ease",
            }}
            onClick={() => window.location.reload()}
            title="Refresh"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1890ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#215e97")}
          />
        </div>
      ) : (
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
            total={processedData.length}
            current={currentPage}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
              }
            }}
            onShowSizeChange={(current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
            itemName="items"
            style={{ margin: 0, padding: 0 }}
            showTotalFormatter={(total, range) => (
              <span
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {`${range[0]}-${range[1]} of ${total} items`}
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1890ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#215e97")
                  }
                />
              </span>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default MyTable;
