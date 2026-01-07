import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    Card, Row, Col, DatePicker, Select, Button, Space, message,
} from "antd";
import { FilePdfOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import reportService from "../../features/shared/services/reportService";
import "../../features/reports/cancelled-members/CancelledMembersReport.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const JoinersReport = () => {
    const [loading, setLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [filters, setFilters] = useState({
        startDate: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
        source: null,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
    });
    const gridApiRef = useRef(null);
    const lastPaginationRef = useRef({ current: 1, pageSize: 20 });

    const columnDefs = [
        { headerName: "ID", field: "id", width: 80, sortable: true, filter: true },
        { headerName: "Membership No", field: "membershipNo", width: 150, sortable: true, filter: true },
        { headerName: "Full Name", field: "fullName", flex: 1, sortable: true, filter: true },
        { headerName: "Email", field: "email", width: 200, sortable: true, filter: true },
        {
            headerName: "Joining Date", field: "joiningDate", width: 150, sortable: true, filter: true,
            valueFormatter: (params) => params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""
        },
        // { headerName: "Source", field: "source", width: 150, sortable: true, filter: true },
        {
            headerName: "Status", field: "status", width: 120, sortable: true, filter: true,
            cellRenderer: (params) => <span style={{ color: "#1890ff", fontWeight: "bold" }}>{params.value}</span>
        },
    ];

    const fetchData = useCallback(async (currentPage, pageSize) => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * pageSize;
            const take = pageSize;
            const result = await reportService.getJoiners(filters, skip, take);
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

    useEffect(() => { fetchData(pagination.current, pagination.pageSize); }, [filters, pagination.current, pagination.pageSize, fetchData]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
        if (gridApiRef.current) gridApiRef.current.paginationGoToPage(0);
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setFilters((prev) => ({ ...prev, startDate: dates[0].format("YYYY-MM-DD"), endDate: dates[1].format("YYYY-MM-DD") }));
            setPagination((prev) => ({ ...prev, current: 1 }));
            if (gridApiRef.current) gridApiRef.current.paginationGoToPage(0);
        }
    };

    const handleExportPdf = async () => {
        try { setLoading(true); await reportService.exportPdf(filters, "joiners"); message.success("PDF export started"); } catch (error) { message.error(error.message || "Failed to export PDF"); } finally { setLoading(false); }
    };

    const handleExportExcel = async () => {
        try { setLoading(true); await reportService.exportExcel(filters, "joiners"); message.success("Excel export started"); } catch (error) { message.error(error.message || "Failed to export Excel"); } finally { setLoading(false); }
    };

    const onGridReady = (params) => {
        gridApiRef.current = params.api;
        setTimeout(() => { params.api.sizeColumnsToFit(); }, 100);
    };

    const onPaginationChanged = useCallback((params) => {
        if (!gridApiRef.current) return;
        const currentPage = params.api.paginationGetCurrentPage() + 1;
        const pageSize = params.api.paginationGetPageSize();
        setPagination((prev) => {
            const lastPagination = lastPaginationRef.current;
            const hasChanged = prev.current !== currentPage || prev.pageSize !== pageSize;
            const isDifferentFromLastFetch = lastPagination.current !== currentPage || lastPagination.pageSize !== pageSize;
            if (hasChanged && isDifferentFromLastFetch) return { current: currentPage, pageSize };
            return prev;
        });
    }, []);

    return (
        <div className="cancelled-members-report">
            <div style={{ padding: "24px" }}>
                <Card>
                    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                        <Col xs={24} sm={12} md={8}>
                            <label style={{ display: "block", marginBottom: "8px" }}>Date Range</label>
                            <RangePicker style={{ width: "100%" }} defaultValue={[dayjs().subtract(30, "days"), dayjs()]} onChange={handleDateRangeChange} format="DD/MM/YYYY" />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <label style={{ display: "block", marginBottom: "8px" }}>Source</label>
                            <Select style={{ width: "100%" }} placeholder="All Sources" allowClear onChange={(value) => handleFilterChange("source", value)}>
                                <Option value="Online">Online</Option>
                                <Option value="Referral">Referral</Option>
                                <Option value="Walk-in">Walk-in</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={10} style={{ textAlign: "right", marginTop: "24px" }}>
                            <Space>
                                <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportPdf} loading={loading}>Export PDF</Button>
                                <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel} loading={loading}>Export Excel</Button>
                                <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current, pagination.pageSize)} loading={loading}>Refresh</Button>
                            </Space>
                        </Col>
                    </Row>
                    <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
                        <AgGridReact columnDefs={columnDefs} rowData={rowData} pagination={true} paginationPageSize={pagination.pageSize} paginationPageSizeSelector={[10, 20, 50, 100]} onGridReady={onGridReady} onPaginationChanged={onPaginationChanged} loading={loading} animateRows={true} rowSelection="multiple" suppressRowClickSelection={true} defaultColDef={{ resizable: true, sortable: true, filter: true }} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default JoinersReport;
