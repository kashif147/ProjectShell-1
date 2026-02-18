import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Button,
  Tabs,
  Table,
  message,
  Tag,
  Space,
  Card,
  Input as AntInput,
  Spin,
} from "antd";
import {
  FileExcelOutlined,
  DownloadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
  CloudUploadOutlined,
  ThunderboltFilled,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { BsThreeDots } from "react-icons/bs";
import * as XLSX from "xlsx";
import moment from "moment";
import { tableData } from "../../Data";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { getUnifiedPaginationConfig } from "../../component/common/UnifiedPagination";
import dayjs from "dayjs";
import Breadcrumb from "../../component/common/Breadcrumb";
import { formatCurrency } from "../../utils/Utilities";

const cardStyle = {
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  border: "1px solid #e2e8f0",
};

const SummaryCard = ({ title, value, icon, color, iconBg }) => (
  <Card style={cardStyle} styles={{ body: { padding: "12px" } }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: "8px",
            letterSpacing: "0.025em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>
          {value}
        </div>
      </div>
      <div
        style={{
          width: "32px",
          height: "24px",
          borderRadius: "8px",
          backgroundColor: iconBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: color,
          fontSize: "16px",
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);





function SimpleBatchMemberSummary() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { data: apiData, loading, error } = useSelector(
    (state) => state.cornMarketBatchById
  );
  debugger
  const { batchName, batchId, search } = location.state || {};
  const [activeKey, setActiveKey] = useState("1");

  const isSimpleSummary = ["RecruitAFriend", "CornMarketRewards", "NewGraduate"].includes(search);
  const normalizeProfiles = (profiles = []) =>
    profiles.map((p, index) => ({
      key: p._id || p.id || index,

      // Full Name (API OR mock)
      fullName:
        p.fullName ??
        `${p.forenames ?? ""} ${p.surname ?? ""}`.trim(),

      // Membership
      membershipNo:
        p.membershipNo ??
        p.membershipNumber ??
        "",

      // Address (API OR mock)
      addressLine1: p.addressLine1 ?? p.address ?? "",
      addressLine2: p.addressLine2 ?? p.addr2 ?? "",
      addressLine3: p.addressLine3 ?? p.addr3 ?? "",
      addressCity: p.addressCity ?? p.addr4 ?? "",
      addressCounty: p.addressCounty ?? "",
      addressPostcode: p.addressPostcode ?? p.eircode ?? "",

      // Contact
      email: p.email ?? p.emailAddress ?? "",
      mobileNumber: p.mobileNumber ?? p.telephoneMobile ?? "",

      // Recruitment Details (Specific for RecruitAFriend)
      recruitedBy: p.recruitmentDetails?.recruitedBy || p.recruitmentDetails?.recuritedBy || "",
      recruitedByMembershipNo: p.recruitmentDetails?.recruitedByMembershipNo || "",
    }));

  const isRecruitAFriend = search === "RecruitAFriend";

  const columns = useMemo(() => {
    const baseColumns = [
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

    if (isRecruitAFriend) {
      baseColumns.push(
        {
          title: "Recruited By",
          dataIndex: "recruitedBy",
          key: "recruitedBy",
          ellipsis: true,
          width: 180,
        },
        {
          title: "Recruited By Membership No",
          dataIndex: "recruitedByMembershipNo",
          key: "recruitedByMembershipNo",
          ellipsis: true,
          width: 200,
        }
      );
    }

    return baseColumns;
  }, [isRecruitAFriend]);

  // Use API data if available, otherwise use mock data for Direct Debit
  const data = useMemo(() => {
    // 🔹 Scenario 1: API response (different keys)
    if (apiData) {
      return {
        ...apiData,
        profiles: normalizeProfiles(apiData.profiles),
      };
    }

    // 🔹 Scenario 2: Direct Debit Summary (already correct keys)
    if (search === "DirectDebitSummary") {
      return {
        id: batchId,
        name: batchName || "Monthly DD Batch - January 2024",
        date: "2024-01-05",
        createdBy: "John Doe",
        profiles: normalizeProfiles([
          {
            id: "M001",
            fullName: "Alice Thompson",
            membershipNo: "45217A",
            addressLine1: "123 Main St",
            addressCity: "Dublin",
            addressCounty: "Dublin",
            email: "alice@example.com",
            mobileNumber: "0871234567",
          },
          {
            id: "M002",
            fullName: "Bob Murphy",
            membershipNo: "93824B",
            addressLine1: "45 Park Lane",
            addressCity: "Cork",
            addressCounty: "Cork",
            email: "bob@example.com",
            mobileNumber: "0867654321",
          },
        ]),
      };
    }

    return null;
  }, [apiData, search, batchId, batchName]);

  console.log("btch", data?.profiles)
  console.log("btch1", apiData?.profiles)
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
      ...(isRecruitAFriend ? {
        "Recruited By": member.recruitedBy || "",
        "Recruited By Membership No": member.recruitedByMembershipNo || "",
      } : {}),
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
    message.success("Batch Triggered Successfully");
    console.log("Trigger button clicked");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "15px",
        paddingBottom: "12px",
      }}
    >
      {/* Absolute Top Unified Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Breadcrumb />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            className="me-1 gray-btn butn"
            icon={<BsThreeDots style={{ fontSize: "15px", fontWeight: 500 }} />}
          />
          {isRecruitAFriend && (
            <Button
              className="butn primary-btn"
              icon={<ThunderboltFilled />}
              onClick={handleTrigger}
            >
              Trigger Batch
            </Button>
          )}
        </div>
      </div>

      {/* Batch info strip - all batch fields */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "10px 16px",
          marginBottom: "8px",
          border: "1px solid #e2e8f0",
          minHeight: "56px",
          overflowX: "auto",
          gap: "0",
        }}
      >
        {/* Batch Name & Source */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "300px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
            Batch Name
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
            {data?.name || "-"}
          </div>
          <div style={{ width: "1px", height: "16px", backgroundColor: "#e2e8f0", margin: "0 4px" }} />
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
            Type
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
            {data?.fileName || "Recruit a Friend"}
          </div>
        </div>
        <div style={{ width: "1px", height: "28px", backgroundColor: "#e2e8f0", margin: "0 12px", flexShrink: 0 }} />

        {/* Batch Date */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "140px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
            Batch Date
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
            {data?.date ? dayjs(data.date).format("DD/MM/YYYY") : "-"}
          </div>
        </div>
        <div style={{ width: "1px", height: "28px", backgroundColor: "#e2e8f0", margin: "0 12px", flexShrink: 0 }} />

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
            Status
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
            {data?.batchStatus || "N/A"}
          </div>
        </div>
        <div style={{ width: "1px", height: "28px", backgroundColor: "#e2e8f0", margin: "0 12px", flexShrink: 0 }} />

        {/* Created By */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
            Created By
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
            {data?.createdBy || "N/A"}
          </div>
        </div>
        <div style={{ width: "1px", height: "28px", backgroundColor: "#e2e8f0", margin: "0 12px", flexShrink: 0 }} />

      </div>


      {/* Unified Action Bar, Tabs and Table section */}
      <Card
        style={{
          ...cardStyle,
          maxHeight: "calc(100vh - 100px)",
          display: "flex",
          flexDirection: "column",
        }}
        styles={{
          body: {
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "visible",
          },
        }}
      >
        <div
          style={{
            padding: "8px 34px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f1f5f9",
            gap: "20px",
            backgroundColor: "rgba(9, 30, 66, 0.04)",
            flexShrink: 0,
            marginBottom: "8px",
          }}
        >
          {/* Left: Tabs */}
          <div style={{ flex: "0 0 auto" }}>
            <Tabs
              activeKey={activeKey}
              onChange={onChange}
              className="batch-tabs-new"
              style={{ marginBottom: "-9px" }}
              items={isSimpleSummary ? [
                {
                  key: "1",
                  label: <span style={{ fontWeight: "600" }}>Batch Members</span>,
                }
              ] : [
                {
                  key: "1",
                  label: <span style={{ fontWeight: "600" }}>Batch Members</span>,
                },
                {
                  key: "2",
                  label: <span style={{ fontWeight: "600" }}>Exceptions</span>,
                }
              ]}
            />
          </div>

          {/* Center: Search */}
          <div style={{ flex: "1 1 auto", display: "flex", justifyContent: "center" }}>
            <AntInput
              placeholder="Search records..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              style={{
                maxWidth: "400px",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                height: "36px",
              }}
            />
          </div>

          {/* Right: Actions */}
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              icon={<FilterOutlined />}
              style={{
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
            />
            <Space size="small">
              <Button
                icon={<FileExcelOutlined />}
                style={{ borderRadius: "8px", fontWeight: "600", height: "36px", padding: "0 12px" }}
                onClick={exportToExcel}
              >
                Export
              </Button>
              {!isSimpleSummary && (
                <>
                  <Button
                    icon={<PlusOutlined />}
                    style={{ borderRadius: "8px", fontWeight: "600", height: "36px", padding: "0 12px" }}
                  >
                    Add Members
                  </Button>
                  <CommonPopConfirm title="Do you want to exclude member?">
                    <Button
                      danger
                      icon={<MinusCircleOutlined />}
                      style={{
                        borderRadius: "8px",
                        fontWeight: "600",
                        height: "36px",
                        padding: "0 12px",
                        backgroundColor: "transparent",
                        borderColor: "#fee2e2",
                        color: "#ef4444",
                      }}
                    >
                      Exclude
                    </Button>
                  </CommonPopConfirm>
                </>
              )}
            </Space>
          </div>
        </div>

        <div
          className="common-table"
          style={{
            padding: "0px",
            paddingLeft: "34px",
            paddingRight: "34px",
            width: "100%",
          }}
        >
          <Table
            bordered={true}
            rowClassName={() => ""}
            scroll={{ x: 'max-content', y: "calc(100vh - 440px)" }}
            size="middle"
            sticky
            columns={columns}
            dataSource={data?.profiles}
            rowKey={(record) => record.key}
            pagination={getUnifiedPaginationConfig({ itemName: "items" })}
          />
        </div>
      </Card>
    </div>
  );
}

export default SimpleBatchMemberSummary;
