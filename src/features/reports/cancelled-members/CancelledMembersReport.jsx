import React, { useState, useEffect, useCallback } from "react";
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

  const columnDefs = [
    {
      headerName: "ID",
      field: "id",
      width: 80,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Member Name",
      field: "memberName",
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Member Type",
      field: "memberType",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Payment Status",
      field: "paymentStatus",
      width: 150,
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
      width: 120,
      sortable: true,
      filter: true,
      valueFormatter: (params) => `€${params.value?.toFixed(2) || "0.00"}`,
    },
    {
      headerName: "Payment Date",
      field: "paymentDate",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Transaction ID",
      field: "transactionId",
      width: 180,
      sortable: true,
      filter: true,
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (pagination.current - 1) * pagination.pageSize;
      const take = pagination.pageSize;

      const result = await reportService.getPayments(filters, skip, take);
      setRowData(result.data || []);
      setTotalRows(result.total || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      }));
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
  };

  const handleExportPdf = async () => {
    try {
      setLoading(true);
      await reportService.exportPdf(filters, "cancelled-members");
      message.success("PDF export started");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      message.error("Failed to export PDF");
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
      console.error("Error exporting Excel:", error);
      message.error("Failed to export Excel");
    } finally {
      setLoading(false);
    }
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };

  const onPaginationChanged = (params) => {
    const currentPage = params.api.paginationGetCurrentPage() + 1;
    const pageSize = params.api.paginationGetPageSize();
    setPagination({ current: currentPage, pageSize });
  };

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
              style={{ height: "600px", width: "100%" }}
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

