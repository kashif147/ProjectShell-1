import React, { useState, useEffect } from "react";
import { Card, Button, Spin, message } from "antd";
import { FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { reportService } from "../../shared/services/reportService";
import "./ReportViewer.css";

const ReportViewer = ({ reportType = "default", filters = {} }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const data = await reportService.getPayments(filters, 0, 100);
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      message.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setLoading(true);
      await reportService.exportPdf(filters, reportType);
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
      await reportService.exportExcel(filters, reportType);
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

  if (loading && !reportData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="report-viewer">
      <Card
        title={`Report: ${reportType}`}
        extra={
          <div>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={handleExportPdf}
              loading={loading}
              style={{ marginRight: "8px" }}
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
          </div>
        }
      >
        {reportData && (
          <div>
            <p>Total Records: {reportData.total || 0}</p>
            {/* Add custom report rendering here */}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportViewer;

