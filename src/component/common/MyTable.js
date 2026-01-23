import React, { useState, useEffect, useMemo, useCallback } from "react";
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
}) => {
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const isExternallyControlled = externalRowSelection !== undefined && onSelectionChange !== undefined;

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
    setSortedInfo(sorter);
    setCurrentPage(1); // Reset to first page on filter/sort change
  };

  // Process data for filtering and sorting
  const processedData = useMemo(() => {
    let data = [...dataSource];

    // Filter data
    Object.keys(filteredInfo).forEach((key) => {
      const filterValues = filteredInfo[key];
      if (filterValues && filterValues.length > 0) {
        const column = columns.find((col) => col.dataIndex === key || col.key === key);
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
    if (sortedInfo.column && sortedInfo.field) {
      const { field, order } = sortedInfo;
      const column = columns.find((col) => col.dataIndex === field || col.key === field);

      if (order) {
        data.sort((a, b) => {
          let result = 0;
          if (column && column.sorter && typeof column.sorter.compare === 'function') {
            result = column.sorter.compare(a, b);
          } else {
            // Default sorting
            const valA = a[field];
            const valB = b[field];
            if (typeof valA === 'string') {
              result = valA.localeCompare(valB);
            } else {
              result = valA - valB;
            }
          }
          return order === 'descend' ? -result : result;
        });
      }
    }

    return data;
  }, [dataSource, filteredInfo, sortedInfo, columns]);

  const defaultPageSize = useMemo(() => getDefaultPageSize(processedData.length), [processedData.length]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPageData, setCurrentPageData] = useState([]);

  useEffect(() => {
    const newDefaultPageSize = getDefaultPageSize(processedData.length || 0);
    setPageSize(newDefaultPageSize);
    setCurrentPage(1);
  }, [dataSource, processedData.length]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(processedData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, processedData]);

  // Enhance columns with filtered/sorted info
  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      const newCol = {
        ...col,
        filteredValue: filteredInfo[col.dataIndex || col.key] || null,
        sortOrder: sortedInfo.field === (col.dataIndex || col.key) ? sortedInfo.order : null,
      };

      if ((newCol.title === "Batch Name" || newCol.dataIndex === "batchName") && !newCol.render) {
        newCol.render = (text, record) => (
          <Link
            to="/BatchMemberSummary"
            state={{
              batchName: text,
              batchId: record?.key || record?.id || record?._id,
              batchStatus: record?.batchStatus || record?.status,
            }}
            style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
          >
            {text}
          </Link>
        );
      }

      return newCol;
    });
  }, [columns, filteredInfo, sortedInfo]);

  return (
    <div
      className="common-table"
      style={{
        paddingLeft: "34px",
        paddingRight: "34px",
        width: "100%",
        overflowX: "auto",
        paddingBottom: "80px",
      }}
    >
      <Table
        rowKey={(record) => record.key || record.id || record._id}
        loading={loading}
        columns={enhancedColumns}
        dataSource={currentPageData || []}
        rowSelection={rowSelectionConfig}
        pagination={false}
        onChange={handleTableChange}
        bordered
        scroll={{ x: "max-content", y: 590 }}
        size="middle"
        onRow={(record, rowIndex) => ({
          onClick: () => onRowClick && onRowClick(record, rowIndex),
        })}
        locale={{
          emptyText: "No Data"
        }}
      />
      <div
        className="d-flex justify-content-center align-items-center tbl-footer"
        style={{
          marginTop: "10px",
          padding: "8px 0",
          backgroundColor: "#fafafa",
          borderTop: "none",
          position: "relative",
          zIndex: 10
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
            <span style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              {`${range[0]}-${range[1]} of ${total} items`}
              <LuRefreshCw
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#215e97",
                  transition: "color 0.3s ease",
                  marginLeft: "4px"
                }}
                onClick={() => window.location.reload()}
                title="Refresh"
                onMouseEnter={(e) => e.currentTarget.style.color = "#1890ff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#215e97"}
              />
            </span>
          )
          }
        />
      </div>
    </div>
  );
};

export default MyTable;
