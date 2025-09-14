import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  Spin,
  Statistic,
  Progress,
  Badge,
  Tooltip,
  Collapse,
  Tabs,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  UserDeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import "../../styles/CancelledMembersReport.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function CancelledMembersReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample data - replace with actual API call
  const sampleData = [
    {
      key: "1",
      membershipNo: "MEM001",
      fullName: "John Doe",
      email: "john.doe@email.com",
      mobileNo: "+1234567890",
      membershipStatus: "Cancelled",
      membershipCategory: "Regular",
      workLocation: "Dublin",
      branch: "Main Branch",
      region: "Leinster",
      grade: "Senior",
      section: "Operations",
      joiningDate: "2020-01-15",
      expiryDate: "2024-01-15",
      lastPaymentAmount: "€150.00",
      lastPaymentDate: "2023-12-15",
      membershipFee: "€150.00",
      outstandingBalance: "€0.00",
      reminderNo: "REM001",
      reminderDate: "2023-11-15",
      cancellationFlag: true,
      cancellationDate: "2024-01-10",
      cancellationReason: "Voluntary",
    },
    {
      key: "2",
      membershipNo: "MEM002",
      fullName: "Jane Smith",
      email: "jane.smith@email.com",
      mobileNo: "+1234567891",
      membershipStatus: "Cancelled",
      membershipCategory: "Premium",
      workLocation: "Cork",
      branch: "Cork Branch",
      region: "Munster",
      grade: "Manager",
      section: "Finance",
      joiningDate: "2019-06-20",
      expiryDate: "2023-06-20",
      lastPaymentAmount: "€200.00",
      lastPaymentDate: "2023-05-20",
      membershipFee: "€200.00",
      outstandingBalance: "€50.00",
      reminderNo: "REM002",
      reminderDate: "2023-04-20",
      cancellationFlag: true,
      cancellationDate: "2023-06-15",
      cancellationReason: "Non-payment",
    },
    {
      key: "3",
      membershipNo: "MEM003",
      fullName: "Michael Johnson",
      email: "michael.j@email.com",
      mobileNo: "+1234567892",
      membershipStatus: "Cancelled",
      membershipCategory: "Student",
      workLocation: "Galway",
      branch: "Galway Branch",
      region: "Connacht",
      grade: "Junior",
      section: "IT",
      joiningDate: "2021-03-10",
      expiryDate: "2024-03-10",
      lastPaymentAmount: "€75.00",
      lastPaymentDate: "2023-02-10",
      membershipFee: "€75.00",
      outstandingBalance: "€25.00",
      reminderNo: "REM003",
      reminderDate: "2023-01-10",
      cancellationFlag: true,
      cancellationDate: "2023-03-05",
      cancellationReason: "Graduation",
    },
    {
      key: "4",
      membershipNo: "MEM004",
      fullName: "Sarah Wilson",
      email: "sarah.w@email.com",
      mobileNo: "+1234567893",
      membershipStatus: "Cancelled",
      membershipCategory: "Regular",
      workLocation: "Belfast",
      branch: "Belfast Branch",
      region: "Ulster",
      grade: "Senior",
      section: "HR",
      joiningDate: "2018-09-01",
      expiryDate: "2023-09-01",
      lastPaymentAmount: "€150.00",
      lastPaymentDate: "2023-08-01",
      membershipFee: "€150.00",
      outstandingBalance: "€0.00",
      reminderNo: "REM004",
      reminderDate: "2023-07-01",
      cancellationFlag: true,
      cancellationDate: "2023-08-25",
      cancellationReason: "Career Change",
    },
    {
      key: "5",
      membershipNo: "MEM005",
      fullName: "David Brown",
      email: "david.b@email.com",
      mobileNo: "+1234567894",
      membershipStatus: "Cancelled",
      membershipCategory: "Premium",
      workLocation: "Limerick",
      branch: "Limerick Branch",
      region: "Munster",
      grade: "Manager",
      section: "Sales",
      joiningDate: "2017-11-15",
      expiryDate: "2023-11-15",
      lastPaymentAmount: "€200.00",
      lastPaymentDate: "2023-10-15",
      membershipFee: "€200.00",
      outstandingBalance: "€100.00",
      reminderNo: "REM005",
      reminderDate: "2023-09-15",
      cancellationFlag: true,
      cancellationDate: "2023-11-10",
      cancellationReason: "Relocation",
    },
  ];

  // Chart data
  const cancellationTrendData = [
    { month: "Jan", cancellations: 12, revenue: 1800 },
    { month: "Feb", cancellations: 8, revenue: 1200 },
    { month: "Mar", cancellations: 15, revenue: 2250 },
    { month: "Apr", cancellations: 10, revenue: 1500 },
    { month: "May", cancellations: 18, revenue: 2700 },
    { month: "Jun", cancellations: 22, revenue: 3300 },
    { month: "Jul", cancellations: 14, revenue: 2100 },
    { month: "Aug", cancellations: 16, revenue: 2400 },
    { month: "Sep", cancellations: 20, revenue: 3000 },
    { month: "Oct", cancellations: 25, revenue: 3750 },
    { month: "Nov", cancellations: 19, revenue: 2850 },
    { month: "Dec", cancellations: 28, revenue: 4200 },
  ];

  const reasonDistributionData = [
    { name: "Voluntary", value: 35, color: "#8884d8" },
    { name: "Non-payment", value: 25, color: "#82ca9d" },
    { name: "Career Change", value: 15, color: "#ffc658" },
    { name: "Relocation", value: 12, color: "#ff7300" },
    { name: "Graduation", value: 8, color: "#00ff00" },
    { name: "Other", value: 5, color: "#ff0000" },
  ];

  const regionData = [
    { region: "Leinster", cancellations: 45, percentage: 35 },
    { region: "Munster", cancellations: 32, percentage: 25 },
    { region: "Connacht", cancellations: 28, percentage: 22 },
    { region: "Ulster", cancellations: 23, percentage: 18 },
  ];

  const categoryData = [
    { category: "Regular", count: 65, revenue: 9750 },
    { category: "Premium", count: 35, revenue: 7000 },
    { category: "Student", count: 20, revenue: 1500 },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setData(sampleData);
      setFilteredData(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = data;

    // Search filter
    if (searchText) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Date range filter
    if (selectedDateRange && selectedDateRange.length === 2) {
      filtered = filtered.filter((item) => {
        const cancellationDate = moment(item.cancellationDate);
        return cancellationDate.isBetween(
          selectedDateRange[0],
          selectedDateRange[1],
          "day",
          "[]"
        );
      });
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (item) => item.membershipStatus === selectedStatus
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.membershipCategory === selectedCategory
      );
    }

    setFilteredData(filtered);
  }, [data, searchText, selectedDateRange, selectedStatus, selectedCategory]);

  const columns = [
    {
      title: "Membership No",
      dataIndex: "membershipNo",
      key: "membershipNo",
      width: 120,
      fixed: "left",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      fixed: "left",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
      width: 130,
    },
    {
      title: "Membership Status",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      width: 140,
      render: (text) => (
        <span
          className={
            text === "Cancelled" ? "status-cancelled" : "status-active"
          }
        >
          {text}
        </span>
      ),
    },
    {
      title: "Membership Category",
      dataIndex: "membershipCategory",
      key: "membershipCategory",
      width: 150,
    },
    {
      title: "Work Location",
      dataIndex: "workLocation",
      key: "workLocation",
      width: 120,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 120,
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 100,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: 100,
    },
    {
      title: "Section (Primary)",
      dataIndex: "section",
      key: "section",
      width: 130,
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      key: "joiningDate",
      width: 120,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Last Payment Amount",
      dataIndex: "lastPaymentAmount",
      key: "lastPaymentAmount",
      width: 150,
      align: "right",
    },
    {
      title: "Last Payment Date",
      dataIndex: "lastPaymentDate",
      key: "lastPaymentDate",
      width: 140,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Membership Fee",
      dataIndex: "membershipFee",
      key: "membershipFee",
      width: 130,
      align: "right",
    },
    {
      title: "Outstanding Balance",
      dataIndex: "outstandingBalance",
      key: "outstandingBalance",
      width: 150,
      align: "right",
      render: (text) => (
        <span
          className={text !== "€0.00" ? "balance-outstanding" : "balance-clear"}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Reminder No",
      dataIndex: "reminderNo",
      key: "reminderNo",
      width: 120,
    },
    {
      title: "Reminder Date",
      dataIndex: "reminderDate",
      key: "reminderDate",
      width: 130,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Cancellation Date",
      dataIndex: "cancellationDate",
      key: "cancellationDate",
      width: 140,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Cancellation Reason",
      dataIndex: "cancellationReason",
      key: "cancellationReason",
      width: 150,
    },
  ];

  const exportToExcel = () => {
    try {
      // Create header information
      const headerInfo = [
        ["CANCELLED MEMBERS ANALYTICS REPORT"],
        ["Executive Dashboard Report"],
        [`Generated on: ${moment().format("DD MMMM YYYY, HH:mm")}`],
        [`Total Records: ${filteredData.length}`],
        [""],
        ["EXECUTIVE SUMMARY"],
        [`Total Cancellations: ${totalCancelled} members`],
        [`Outstanding Balance: €${totalOutstanding.toFixed(2)}`],
        [`This Month Cancellations: ${thisMonthCancellations}`],
        [`Revenue Impact: €${(totalOutstanding * 12).toFixed(2)}/year`],
        [""],
      ];

      // Add filter information if any filters are applied
      if (
        searchText ||
        selectedDateRange ||
        selectedStatus !== "all" ||
        selectedCategory !== "all"
      ) {
        headerInfo.push(["REPORT FILTERS"]);
        if (searchText) headerInfo.push([`Search: "${searchText}"`]);
        if (selectedDateRange) {
          headerInfo.push([
            `Date Range: ${selectedDateRange[0].format(
              "DD/MM/YYYY"
            )} - ${selectedDateRange[1].format("DD/MM/YYYY")}`,
          ]);
        }
        if (selectedStatus !== "all")
          headerInfo.push([`Status: ${selectedStatus}`]);
        if (selectedCategory !== "all")
          headerInfo.push([`Category: ${selectedCategory}`]);
        headerInfo.push([""]);
      }

      // Prepare data for export
      const exportData = filteredData.map((item) => {
        const row = {};
        columns.forEach((col) => {
          const value = item[col.dataIndex];
          if (col.render && typeof col.render === "function") {
            // For Excel, use formatted values
            if (
              col.dataIndex === "joiningDate" ||
              col.dataIndex === "expiryDate" ||
              col.dataIndex === "lastPaymentDate" ||
              col.dataIndex === "reminderDate" ||
              col.dataIndex === "cancellationDate"
            ) {
              row[col.title] = moment(value).format("DD/MM/YYYY");
            } else {
              row[col.title] = value;
            }
          } else {
            row[col.title] = value;
          }
        });
        return row;
      });

      // Create worksheet with header info
      const worksheet = XLSX.utils.json_to_sheet(exportData, {
        header: columns.map((col) => col.title),
      });

      // Insert header information at the beginning
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const headerRows = headerInfo.length;

      // Shift existing data down
      for (let row = range.e.r; row >= 0; row--) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: row + headerRows,
            c: col,
          });
          const originalCellAddress = XLSX.utils.encode_cell({
            r: row,
            c: col,
          });
          if (worksheet[originalCellAddress]) {
            worksheet[cellAddress] = worksheet[originalCellAddress];
            delete worksheet[originalCellAddress];
          }
        }
      }

      // Add header information
      headerInfo.forEach((row, rowIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        worksheet[cellAddress] = { v: row[0], t: "s" };

        // Style header rows
        if (rowIndex === 0) {
          worksheet[cellAddress].s = { font: { bold: true, size: 16 } };
        } else if (rowIndex === 1) {
          worksheet[cellAddress].s = { font: { bold: true, size: 12 } };
        } else if (
          rowIndex === 5 ||
          (headerInfo.length > 11 && rowIndex === headerInfo.length - 3)
        ) {
          worksheet[cellAddress].s = { font: { bold: true, size: 11 } };
        }
      });

      // Update worksheet range
      worksheet["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: range.e.r + headerRows, c: range.e.c },
      });

      // Set column widths
      const colWidths = columns.map((col) => {
        let width = 15;
        if (col.dataIndex === "fullName" || col.dataIndex === "email") {
          width = 25;
        } else if (
          col.dataIndex === "membershipNo" ||
          col.dataIndex === "mobileNo"
        ) {
          width = 12;
        } else if (
          col.dataIndex === "outstandingBalance" ||
          col.dataIndex === "lastPaymentAmount"
        ) {
          width = 18;
        }
        return { wch: width };
      });
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cancelled Members");

      XLSX.writeFile(
        workbook,
        `Cancelled_Members_Report_${moment().format("YYYY-MM-DD")}.xlsx`
      );
      message.success("Excel file exported successfully!");
    } catch (error) {
      message.error("Failed to export Excel file");
      console.error("Excel export error:", error);
    }
  };

  const exportToPDF = () => {
    try {
      // Determine orientation based on column count
      const isLandscape = columns.length > 12;
      const doc = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      let yPosition = 20;

      // Add Report Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("CANCELLED MEMBERS ANALYTICS REPORT", 14, yPosition);
      yPosition += 10;

      // Add subtitle and metadata
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Executive Dashboard Report", 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(
        `Generated on: ${moment().format("DD MMMM YYYY, HH:mm")}`,
        14,
        yPosition
      );
      doc.text(`Total Records: ${filteredData.length}`, 14, yPosition + 5);
      yPosition += 15;

      // Add KPI Summary
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("EXECUTIVE SUMMARY", 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `• Total Cancellations: ${totalCancelled} members`,
        14,
        yPosition
      );
      doc.text(
        `• Outstanding Balance: €${totalOutstanding.toFixed(2)}`,
        14,
        yPosition + 4
      );
      doc.text(
        `• This Month Cancellations: ${thisMonthCancellations}`,
        14,
        yPosition + 8
      );
      doc.text(
        `• Revenue Impact: €${(totalOutstanding * 12).toFixed(2)}/year`,
        14,
        yPosition + 12
      );
      yPosition += 20;

      // Add Filter Information
      if (
        searchText ||
        selectedDateRange ||
        selectedStatus !== "all" ||
        selectedCategory !== "all"
      ) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("REPORT FILTERS", 14, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if (searchText) doc.text(`• Search: "${searchText}"`, 14, yPosition);
        if (selectedDateRange) {
          doc.text(
            `• Date Range: ${selectedDateRange[0].format(
              "DD/MM/YYYY"
            )} - ${selectedDateRange[1].format("DD/MM/YYYY")}`,
            14,
            yPosition + (searchText ? 4 : 0)
          );
        }
        if (selectedStatus !== "all")
          doc.text(
            `• Status: ${selectedStatus}`,
            14,
            yPosition + (searchText ? 8 : 4)
          );
        if (selectedCategory !== "all")
          doc.text(
            `• Category: ${selectedCategory}`,
            14,
            yPosition + (searchText ? 12 : 8)
          );
        yPosition += 15;
      }

      // Prepare data for table
      const tableHeaders = columns.map((col) => col.title);
      const tableData = filteredData.map((item) =>
        columns.map((col) => {
          const value = item[col.dataIndex];
          if (col.render && typeof col.render === "function") {
            // For PDF, we'll use the raw value or a simplified version
            if (
              col.dataIndex === "joiningDate" ||
              col.dataIndex === "expiryDate" ||
              col.dataIndex === "lastPaymentDate" ||
              col.dataIndex === "reminderDate" ||
              col.dataIndex === "cancellationDate"
            ) {
              return moment(value).format("DD/MM/YYYY");
            }
            return value;
          }
          return value;
        })
      );

      // Calculate column widths based on orientation and content
      const pageWidth = isLandscape ? 280 : 190;
      const baseWidth = pageWidth / columns.length;
      const columnStyles = {};

      columns.forEach((col, index) => {
        let width = baseWidth;
        // Adjust width for specific columns
        if (col.dataIndex === "fullName" || col.dataIndex === "email") {
          width = baseWidth * 1.5;
        } else if (
          col.dataIndex === "membershipNo" ||
          col.dataIndex === "mobileNo"
        ) {
          width = baseWidth * 0.8;
        }
        columnStyles[index] = { cellWidth: width };
      });

      // Add table
      doc.autoTable({
        startY: yPosition,
        head: [tableHeaders],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: isLandscape ? 8 : 7,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [64, 64, 64],
          textColor: [255, 255, 255],
          halign: "center",
          fontStyle: "bold",
          fontSize: isLandscape ? 8 : 7,
        },
        bodyStyles: {
          halign: "center",
          valign: "middle",
          fontSize: isLandscape ? 8 : 7,
          textColor: [0, 0, 0],
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        columnStyles,
        didDrawPage: (data) => {
          // Add page numbers and footer
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Page ${data.pageNumber} of ${data.totalPages}`,
            doc.internal.pageSize.width - 30,
            doc.internal.pageSize.height - 10
          );

          // Add report footer
          doc.text(
            `Cancelled Members Report - Generated ${moment().format(
              "DD/MM/YYYY HH:mm"
            )}`,
            14,
            doc.internal.pageSize.height - 10
          );
        },
        margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
      });

      doc.save(`Cancelled_Members_Report_${moment().format("YYYY-MM-DD")}.pdf`);
      message.success("PDF file exported successfully!");
    } catch (error) {
      message.error("Failed to export PDF file");
      console.error("PDF export error:", error);
    }
  };

  const printReport = () => {
    // Create a print-friendly version
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cancelled Members Report</title>
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: black;
              background: white;
              margin: 0;
              padding: 0;
            }
            .report-header {
              border: 2px solid black;
              padding: 20px;
              margin-bottom: 20px;
              background: white;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: black;
            }
            .report-subtitle {
              font-size: 14px;
              color: #333;
              margin-bottom: 5px;
            }
            .kpi-summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .kpi-card {
              border: 1px solid black;
              padding: 15px;
              background: white;
            }
            .kpi-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .kpi-value {
              font-size: 18px;
              font-weight: bold;
              color: black;
            }
            .filters-section {
              border: 1px solid black;
              padding: 15px;
              margin-bottom: 20px;
              background: #f5f5f5;
            }
            .filters-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: black;
            }
            .filter-item {
              margin-bottom: 5px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid black;
              padding: 6px 4px;
              text-align: center;
              background: white;
            }
            th {
              background: #f0f0f0;
              font-weight: bold;
              color: black;
            }
            tr:nth-child(even) td {
              background: #f9f9f9;
            }
            .status-cancelled {
              background: #ffebee;
              border: 1px solid black;
              padding: 2px 4px;
              font-weight: bold;
            }
            .status-active {
              background: #e8f5e8;
              border: 1px solid black;
              padding: 2px 4px;
              font-weight: bold;
            }
            .balance-outstanding {
              background: #ffebee;
              border: 1px solid black;
              padding: 2px 4px;
              font-weight: bold;
            }
            .balance-clear {
              background: #e8f5e8;
              border: 1px solid black;
              padding: 2px 4px;
              font-weight: bold;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-title">CANCELLED MEMBERS ANALYTICS REPORT</div>
            <div class="report-subtitle">Executive Dashboard Report</div>
            <div class="report-subtitle">Generated: ${moment().format(
              "DD MMMM YYYY, HH:mm"
            )}</div>
            <div class="report-subtitle">Total Records: ${
              filteredData.length
            }</div>
          </div>

          <div class="kpi-summary">
            <div class="kpi-card">
              <div class="kpi-title">Total Cancellations</div>
              <div class="kpi-value">${totalCancelled} members</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Outstanding Balance</div>
              <div class="kpi-value">€${totalOutstanding.toFixed(2)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">This Month</div>
              <div class="kpi-value">${thisMonthCancellations}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Revenue Impact</div>
              <div class="kpi-value">€${(totalOutstanding * 12).toFixed(
                2
              )}/year</div>
            </div>
          </div>

          ${
            searchText ||
            selectedDateRange ||
            selectedStatus !== "all" ||
            selectedCategory !== "all"
              ? `
          <div class="filters-section">
            <div class="filters-title">REPORT FILTERS</div>
            ${
              searchText
                ? `<div class="filter-item">• Search: "${searchText}"</div>`
                : ""
            }
            ${
              selectedDateRange
                ? `<div class="filter-item">• Date Range: ${selectedDateRange[0].format(
                    "DD/MM/YYYY"
                  )} - ${selectedDateRange[1].format("DD/MM/YYYY")}</div>`
                : ""
            }
            ${
              selectedStatus !== "all"
                ? `<div class="filter-item">• Status: ${selectedStatus}</div>`
                : ""
            }
            ${
              selectedCategory !== "all"
                ? `<div class="filter-item">• Category: ${selectedCategory}</div>`
                : ""
            }
          </div>
          `
              : ""
          }

          <table>
            <thead>
              <tr>
                ${columns.map((col) => `<th>${col.title}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (item) => `
                <tr>
                  ${columns
                    .map((col) => {
                      const value = item[col.dataIndex];
                      let displayValue = value;
                      let className = "";

                      if (col.render && typeof col.render === "function") {
                        if (
                          col.dataIndex === "joiningDate" ||
                          col.dataIndex === "expiryDate" ||
                          col.dataIndex === "lastPaymentDate" ||
                          col.dataIndex === "reminderDate" ||
                          col.dataIndex === "cancellationDate"
                        ) {
                          displayValue = moment(value).format("DD/MM/YYYY");
                        } else if (col.dataIndex === "membershipStatus") {
                          className =
                            value === "Cancelled"
                              ? "status-cancelled"
                              : "status-active";
                          displayValue = value;
                        } else if (col.dataIndex === "outstandingBalance") {
                          className =
                            value !== "€0.00"
                              ? "balance-outstanding"
                              : "balance-clear";
                          displayValue = value;
                        }
                      }
                      return `<td class="${className}">${displayValue}</td>`;
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedDateRange(null);
    setSelectedStatus("all");
    setSelectedCategory("all");
  };

  // Calculate summary statistics
  const totalCancelled = filteredData.length;
  const totalOutstanding = filteredData.reduce((sum, item) => {
    const balance = parseFloat(
      item.outstandingBalance.replace("€", "").replace(",", "")
    );
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);
  const thisMonthCancellations = filteredData.filter((item) =>
    moment(item.cancellationDate).isSame(moment(), "month")
  ).length;

  const { TabPane } = Tabs;

  return (
    <div className="cancelled-members-report">
      {/* Professional Report Header */}
      <div className="report-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title
              level={1}
              className="report-title"
              style={{ margin: 0, fontSize: "32px" }}
            >
              <BarChartOutlined
                style={{ marginRight: "16px", color: "#fff" }}
              />
              Cancelled Members Analytics Report
            </Title>
            <Text
              className="report-subtitle"
              style={{ fontSize: "16px", opacity: 0.9 }}
            >
              Executive Dashboard • Generated:{" "}
              {moment().format("DD MMMM YYYY, HH:mm")} •
              <Badge
                count={filteredData.length}
                style={{ backgroundColor: "#52c41a", marginLeft: "8px" }}
              />
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            >
              Refresh
            </Button>
            <Button
              icon={<SettingOutlined />}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderColor: "rgba(255,255,255,0.3)",
                color: "white",
              }}
              onClick={() => message.info("Settings coming soon!")}
            >
              Settings
            </Button>
          </Space>
        </div>
      </div>

      {/* KPI Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="kpi-card"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Total Cancellations
                </span>
              }
              value={totalCancelled}
              valueStyle={{
                color: "#fff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={<UserDeleteOutlined style={{ color: "#fff" }} />}
              suffix={
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}
                >
                  members
                </span>
              }
            />
            <div style={{ marginTop: "8px" }}>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}
              >
                <Badge
                  status="processing"
                  text={`${thisMonthCancellations} this month`}
                />
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="kpi-card"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Outstanding Balance
                </span>
              }
              value={totalOutstanding}
              precision={2}
              valueStyle={{
                color: "#fff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={<DollarOutlined style={{ color: "#fff" }} />}
              suffix={
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}
                >
                  €
                </span>
              }
            />
            <div style={{ marginTop: "8px" }}>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}
              >
                <Badge status="error" text="Requires attention" />
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="kpi-card"
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Avg. Cancellation Rate
                </span>
              }
              value={
                filteredData.length > 0
                  ? (
                      (filteredData.filter(
                        (item) => item.outstandingBalance !== "€0.00"
                      ).length /
                        filteredData.length) *
                      100
                    ).toFixed(1)
                  : 0
              }
              valueStyle={{
                color: "#fff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              suffix={
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}
                >
                  %
                </span>
              }
            />
            <div style={{ marginTop: "8px" }}>
              <Progress
                percent={
                  filteredData.length > 0
                    ? (filteredData.filter(
                        (item) => item.outstandingBalance !== "€0.00"
                      ).length /
                        filteredData.length) *
                      100
                    : 0
                }
                size="small"
                strokeColor="#fff"
                trailColor="rgba(255,255,255,0.3)"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="kpi-card"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Revenue Impact
                </span>
              }
              value={totalOutstanding * 12}
              precision={2}
              valueStyle={{
                color: "#fff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={<DollarOutlined style={{ color: "#fff" }} />}
              suffix={
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}
                >
                  €/year
                </span>
              }
            />
            <div style={{ marginTop: "8px" }}>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}
              >
                <Badge status="warning" text="Annual projection" />
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Report Tabs */}
      <Card
        className="report-card"
        style={{
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <Tabs
          defaultActiveKey="dashboard"
          type="card"
          size="large"
          tabBarStyle={{ marginBottom: "24px" }}
        >
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Executive Dashboard
              </span>
            }
            key="dashboard"
          >
            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col xs={24} lg={12}>
                <Card title="Cancellation Trends" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cancellationTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="cancellations"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        name="Cancellations"
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                        name="Revenue Impact (€)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title="Cancellation Reasons Distribution"
                  className="chart-card"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reasonDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reasonDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col xs={24} lg={12}>
                <Card title="Regional Distribution" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar
                        dataKey="cancellations"
                        fill="#8884d8"
                        name="Cancellations"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Membership Category Impact" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#82ca9d" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <EyeOutlined />
                Detailed Data
              </span>
            }
            key="data"
          >
            {/* Professional Filters */}
            <Card
              size="small"
              className="filters-card"
              title={
                <span>
                  <FilterOutlined style={{ marginRight: "8px" }} />
                  Report Parameters
                </span>
              }
              style={{ marginBottom: "16px" }}
              extra={
                <Space>
                  <Button onClick={clearFilters} size="small">
                    Reset Filters
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={exportToExcel}
                    size="small"
                  >
                    Export
                  </Button>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Search all fields..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <RangePicker
                    placeholder={["From Date", "To Date"]}
                    value={selectedDateRange}
                    onChange={setSelectedDateRange}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Membership Status"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="Cancelled">Cancelled</Option>
                    <Option value="Active">Active</Option>
                    <Option value="Suspended">Suspended</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Membership Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">All Categories</Option>
                    <Option value="Regular">Regular</Option>
                    <Option value="Premium">Premium</Option>
                    <Option value="Student">Student</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            {/* Data Table */}
            <Spin spinning={loading}>
              <Table
                className="report-table"
                columns={columns}
                dataSource={filteredData}
                scroll={{ x: 2000, y: 600 }}
                pagination={{
                  pageSize: 100,
                  showSizeChanger: true,
                  showQuickJumper: false,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                  pageSizeOptions: ["50", "100", "200", "500"],
                  defaultPageSize: 100,
                }}
                bordered
                size="small"
                title={() => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong style={{ fontSize: "16px" }}>
                      Cancelled Members Detail View
                    </Text>
                    <Space>
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={exportToPDF}
                        size="small"
                      >
                        Export PDF
                      </Button>
                      <Button
                        icon={<PrinterOutlined />}
                        onClick={printReport}
                        size="small"
                      >
                        Print
                      </Button>
                    </Space>
                  </div>
                )}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default CancelledMembersReport;
