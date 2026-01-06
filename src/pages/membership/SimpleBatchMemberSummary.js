import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Button, Space, Tabs, Table } from "antd";
import { FileExcelOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import moment from "moment";
import { tableData } from "../../Data"; // Assuming batch data comes from here
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { useEffect } from "react";
import { getUnifiedPaginationConfig } from "../../component/common/UnifiedPagination";
import dayjs from "dayjs";

const inputStyle = {
  width: "100%",
  padding: "6px 11px",
  borderRadius: "6px",
  border: "1px solid #d9d9d9",
  backgroundColor: "#f5f5f5",
  color: "rgba(0, 0, 0, 0.85)",
  display: "block",
  marginTop: "4px",
};

const buttonStyle = {
  backgroundColor: "#215e97",
  color: "white",
  borderRadius: "3px",
  minWidth: "150px",
};

const columns = [
  {
    title: "Full Name",
    dataIndex: "fullName",
    key: "fullName",
    ellipsis: true,
    width: 180,
  },
  {
    title: "Membership No",
    dataIndex: "membershipNo",
    key: "membershipNo",
    ellipsis: true,
    width: 140,
  },
  {
    title: "Address",
    key: "address",
    ellipsis: true,
    width: 300,
    render: (_, record) => (
      <>
        {[
          record.addressLine1,
          record.addressLine2,
          record.addressLine3,
          record.addressCity,
          record.addressCounty,
          record.addressPostcode,
        ]
          .filter(Boolean)
          .join(", ")}
      </>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    ellipsis: true,
    width: 200,
  },
  {
    title: "Mobile",
    dataIndex: "mobileNumber",
    key: "mobileNumber",
    ellipsis: true,
    width: 150,
  },
];

function SimpleBatchMemberSummary() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { data: apiData, loading, error } = useSelector(
    (state) => state.cornMarketBatchById
  );
  const { batchName, batchId, search } = location.state || {};
  const [activeKey, setActiveKey] = useState("1");

  // Use API data if available, otherwise use mock data for Direct Debit
  const data = useMemo(() => {
    if (apiData) return apiData;

    if (search === "DirectDebitSummary") {
      return {
        id: batchId || "DD-001",
        name: batchName || "Monthly DD Batch - January 2024",
        date: "2024-01-05",
        createdBy: "John Doe",
        profiles: [
          {
            id: "M001",
            fullName: "Alice Thompson",
            membershipNo: "45217A",
            addressLine1: "123 Main St",
            addressCity: "Dublin",
            addressCounty: "Dublin",
            email: "alice@example.com",
            mobileNumber: "0871234567"
          },
          {
            id: "M002",
            fullName: "Bob Murphy",
            membershipNo: "93824B",
            addressLine1: "45 Park Lane",
            addressCity: "Cork",
            addressCounty: "Cork",
            email: "bob@example.com",
            mobileNumber: "0867654321"
          },
          {
            id: "M003",
            fullName: "Charlie Kelly",
            membershipNo: "12345C",
            addressLine1: "78 High St",
            addressCity: "Galway",
            addressCounty: "Galway",
            email: "charlie@example.com",
            mobileNumber: "0851122334"
          }
        ]
      };
    }
    return null;
  }, [apiData, search, batchId, batchName]);

  // Function to export to Excel with batch name as filename
  const exportToExcel = () => {
    // Check if we have data and profiles
    if (!data?.profiles || data.profiles.length === 0) {
      console.warn("No data to export");
      return;
    }

    // Prepare the data for Excel
    const excelData = data.profiles.map((member) => ({
      "Full Name": member.fullName || "",
      "Membership No": member.membershipNo || "",
      "Address": [
        member.addressLine1,
        member.addressLine2,
        member.addressLine3,
        member.addressCity,
        member.addressCounty,
        member.addressPostcode,
      ]
        .filter(Boolean)
        .join(", "),
      "Email": member.email || "",
      "Mobile": member.mobileNumber || "",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Batch Members");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Use batch name for filename, sanitize it
    const batchNameForFile = data?.name
      ? data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : "batch_members";

    a.download = `${batchNameForFile}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSafeDate = (dateValue) => {
    if (!dateValue) return null;
    if (moment.isMoment(dateValue)) return dateValue;
    return moment(dateValue);
  };

  const items = [
    {
      key: "1",
      label: "Batch Payments",
      children: (
        <div
          className="common-table"
          style={{
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Table
            columns={columns}
            dataSource={data?.profiles}
            className="mt-2"
            pagination={getUnifiedPaginationConfig({
              itemName: "items",
            })}
            scroll={{ x: 'max-content' }}
            bordered
            size="middle"
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Exceptions",
      children: (
        <div
          className="common-table"
          style={{
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Table
            columns={columns}
            className="mt-2"
            dataSource={data?.profiles}
            rowKey={(record) => record.id || record["Membership No"]}
            pagination={getUnifiedPaginationConfig({
              itemName: "items",
            })}
            scroll={{ x: 'max-content' }}
            bordered
            size="middle"
            locale={{ emptyText: "No exceptions found" }}
          />
        </div>
      ),
    },
  ];

  const onChange = (key) => {
    setActiveKey(key);
  };

  const handleTrigger = () => {
    console.log("Trigger button clicked");
  };

  return (
    <div>
      {/* Header Info */}
      <Row
        gutter={[16, 16]}
        style={{
          padding: "0px 35px 20px 35px",
          alignItems: "flex-end",
        }}
      >
        <Col span={6}>
          <label>Batch Name</label>
          <input
            value={data?.name || ""}
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Batch Date</label>
          <input
            value={dayjs(data?.date).format("DD/MM/YYYY") || ""}
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Batch Status</label>
          <input
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Created By</label>
          <input
            value={data?.createdBy || ""}
            disabled
            style={inputStyle}
          />
        </Col>
      </Row>

      {/* Buttons */}
      <Row
        style={{
          paddingLeft: "35px",
          paddingRight: "35px",
          paddingBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side Buttons */}
        <Col>
          <Space size="middle">
            <Button style={buttonStyle}>Include</Button>
            <CommonPopConfirm title="Do you want to exclude member?">
              <Button style={buttonStyle}>Exclude Members</Button>
            </CommonPopConfirm>
          </Space>
        </Col>

        {/* Right Side Export Button */}
        <Col>
          <a
            onClick={exportToExcel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              color: "#0969da",
              textDecoration: "none",
              padding: "10px 16px",
              border: "1px solid #d0d7de",
              borderRadius: "6px",
              backgroundColor: "white",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f6f8fa";
              e.currentTarget.style.borderColor = "#0969da";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#d0d7de";
            }}
          >
            <FileExcelOutlined />
            <span>
              {data?.name
                ? `${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`
                : "batch_data.xlsx"
              }
            </span>
            <DownloadOutlined style={{ fontSize: "12px" }} />
          </a>
        </Col>
      </Row>

      {/* Tabs */}
      <div style={{ padding: "0 35px" }}>
        <Tabs
          activeKey={activeKey}
          items={items}
          onChange={onChange}
          className="batch-tabs"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export default SimpleBatchMemberSummary;