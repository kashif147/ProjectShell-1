import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Spin,
  message,
} from "antd";
import { FilePdfOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { reportService } from "../../shared/services/reportService";
import "./CancelledMembersReport.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const CancelledMembersReport = () => {
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    memberType: null,
    paymentStatus: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const gridApiRef = useRef(null);
  const lastPaginationRef = useRef({ current: 1, pageSize: 20 });

  const columnDefs = [
    {
      headerName: "ID",
      field: "id",
      width: 100,
      minWidth: 80,
      maxWidth: 120,
      sortable: true,
      filter: true,
      pinned: null,
    },
    {
      headerName: "Member Name",
      field: "memberName",
      width: 220,
      minWidth: 150,
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Member Type",
      field: "memberType",
      width: 160,
      minWidth: 120,
      maxWidth: 200,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Payment Status",
      field: "paymentStatus",
      width: 160,
      minWidth: 130,
      maxWidth: 200,
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const status = params.value;
        const colorMap = {
          Completed: "#52c41a",
          Pending: "#faad14",
          Failed: "#ff4d4f",
        };
        return (
          <span style={{ color: colorMap[status] || "#666" }}>{status}</span>
        );
      },
    },
    {
      headerName: "Amount",
      field: "amount",
      width: 140,
      minWidth: 100,
      maxWidth: 180,
      sortable: true,
      filter: true,
      valueFormatter: (params) => `€${params.value?.toFixed(2) || "0.00"}`,
    },
    {
      headerName: "Payment Date",
      field: "paymentDate",
      width: 160,
      minWidth: 130,
      maxWidth: 200,
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD/MM/YYYY") : "",
    },
    {
      headerName: "Transaction ID",
      field: "transactionId",
      width: 200,
      minWidth: 150,
      flex: 1,
      sortable: true,
      filter: true,
    },
  ];

  const fetchData = useCallback(async (currentPage, pageSize) => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const take = pageSize;

      const result = await reportService.getPayments(filters, skip, take);
      setRowData(result.data || []);
      setTotalRows(result.total || 0);
      lastPaginationRef.current = { current: currentPage, pageSize };
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, [filters, pagination.current, pagination.pageSize, fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => {
      if (prev.current !== 1) {
        return { ...prev, current: 1 };
      }
      return prev;
    });
    // Reset grid to first page
    if (gridApiRef.current) {
      gridApiRef.current.paginationGoToPage(0);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      }));
      setPagination((prev) => {
        if (prev.current !== 1) {
          return { ...prev, current: 1 };
        }
        return prev;
      });
      // Reset grid to first page
      if (gridApiRef.current) {
        gridApiRef.current.paginationGoToPage(0);
      }
    }
  };

  const handleExportPdf = async () => {
    try {
      setLoading(true);
      await reportService.exportPdf(filters, "cancelled-members");
      message.success("PDF export started");
    } catch (error) {
      const errorMsg = error.message || "Failed to export PDF";
      message.error(errorMsg);
      // Only log to console if it's not a 404 (expected when backend not implemented)
      if (error.status !== 404) {
        console.error("Error exporting PDF:", error.originalError || error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      await reportService.exportExcel(filters, "cancelled-members");
      message.success("Excel export started");
    } catch (error) {
      const errorMsg = error.message || "Failed to export Excel";
      message.error(errorMsg);
      // Only log to console if it's not a 404 (expected when backend not implemented)
      if (error.status !== 404) {
        console.error("Error exporting Excel:", error.originalError || error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onGridReady = (params) => {
    gridApiRef.current = params.api;
    // Size columns to fit the available width
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  };

  const onPaginationChanged = useCallback((params) => {
    if (!gridApiRef.current) return;

    const currentPage = params.api.paginationGetCurrentPage() + 1;
    const pageSize = params.api.paginationGetPageSize();

    // Only update state if pagination actually changed
    // Check both against last fetched pagination and current state to prevent loops
    setPagination((prev) => {
      const lastPagination = lastPaginationRef.current;
      const hasChanged =
        prev.current !== currentPage ||
        prev.pageSize !== pageSize;
      const isDifferentFromLastFetch =
        lastPagination.current !== currentPage ||
        lastPagination.pageSize !== pageSize;

      // Only update if pagination changed AND it's different from what we last fetched
      if (hasChanged && isDifferentFromLastFetch) {
        return { current: currentPage, pageSize };
      }
      return prev;
    });
  }, []);

  return (
    <div className="cancelled-members-report">
      <div style={{ padding: "24px" }}>
        <Card>
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={8}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Date Range
                </label>
                <RangePicker
                  style={{ width: "100%" }}
                  defaultValue={[
                    dayjs().subtract(30, "days"),
                    dayjs(),
                  ]}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Member Type
                </label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="All Types"
                  allowClear
                  onChange={(value) => handleFilterChange("memberType", value)}
                >
                  <Option value="Paid">Paid</Option>
                  <Option value="Honorary">Honorary</Option>
                  <Option value="Student">Student</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Payment Status
                </label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="All Statuses"
                  allowClear
                  onChange={(value) =>
                    handleFilterChange("paymentStatus", value)
                  }
                >
                  <Option value="Completed">Completed</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Failed">Failed</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space style={{ marginTop: "32px" }}>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={handleExportPdf}
                  loading={loading}
                >
                  Export PDF
                </Button>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  loading={loading}
                >
                  Export Excel
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>

          <div style={{ marginTop: "24px" }}>
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                Total Records: <strong>{totalRows}</strong>
              </span>
            </div>
            <div
              className="ag-theme-alpine"
              style={{
                height: "600px",
                width: "100%",
                overflow: "hidden"
              }}
            >
              <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                pagination={true}
                paginationPageSize={pagination.pageSize}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                onGridReady={onGridReady}
                onPaginationChanged={onPaginationChanged}
                loading={loading}
                animateRows={true}
                rowSelection="multiple"
                suppressRowClickSelection={true}
                suppressHorizontalScroll={false}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  filter: true,
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CancelledMembersReport;

