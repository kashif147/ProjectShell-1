import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "antd";
import UnifiedPagination, { getDefaultPageSize } from "./UnifiedPagination";
import { LuRefreshCw } from "react-icons/lu";

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

  const defaultPageSize = useMemo(() => getDefaultPageSize(dataSource.length), [dataSource.length]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPageData, setCurrentPageData] = useState([]);

  useEffect(() => {
    const newDefaultPageSize = getDefaultPageSize(dataSource.length || 0);
    setPageSize(newDefaultPageSize);
    setCurrentPage(1);
  }, [dataSource]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentPageData(dataSource.slice(startIndex, endIndex));
  }, [currentPage, pageSize, dataSource]);

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
        columns={columns}
        dataSource={currentPageData || []}
        rowSelection={rowSelectionConfig}
        pagination={false}
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
          total={dataSource.length}
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
