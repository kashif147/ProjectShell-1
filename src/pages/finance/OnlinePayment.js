import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Dropdown, Button, message } from "antd"; // Add message here
import { MoreOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchStripePayments } from "../../features/AccountSlice";
import RefundDrawer from "../../component/finanace/RefundDrawer";
import { formatCurrency } from "../../utils/Utilities";
import { formatMobileNumber } from "../../utils/Utilities";
import { formatDateOnly } from "../../utils/Utilities";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import { buildApplicationMgtSearch } from "../../utils/applicationMgtRoute";
import { useLocation, useNavigate } from "react-router-dom";

const APPROVED_MEMBERSHIP_STATUSES = new Set([
  "active",
  "resigned",
  "cancelled",
  "suspended",
  "archived",
]);

function isApprovedRow(row) {
  const status = String(row?.membershipStatus || "").trim().toLowerCase();
  const hasMembershipNo = String(
    row?.membershipNumber || row?.memberId || ""
  ).trim() !== "";
  return hasMembershipNo || APPROVED_MEMBERSHIP_STATUSES.has(status);
}

const OnlinePayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { setGridData, getProfile } = useTableColumns();
  const { stripePayments, loading } = useSelector((state) => state.account);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [refundDrawerOpen, setRefundDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    dispatch(fetchStripePayments());
  }, [dispatch]);

  const normalizedStripePayments = useMemo(() => {
    if (!Array.isArray(stripePayments)) return [];

    return stripePayments.map((row) => ({
      isApproved: isApprovedRow(row),
      ...row,
      applicationId: row?.applicationId || row?.ApplicationId || row?.appId || null,
      memberNo: isApprovedRow(row)
        ? row?.membershipNumber || row?.memberId || row?.["Member No"] || "-"
        : row?.applicationId || row?.ApplicationId || row?.appId || "-",
      category: row?.category || row?.membershipCategory || "-",
      membershipStatus: row?.membershipStatus || row?.memberhsipStatus || "-",
      renewalDate: row?.renewalDate || row?.RenewalDate || null,
      billingCycle: row?.billingCycle || "-",
      email: row?.email || row?.normalizedEmail || "-",
      phone: row?.phone || row?.mobileNumber || null,
      joinDate: row?.joinDate || row?.JoinDate || null,
      paymentStatus: row?.settlement?.status || "-",
      transactionId: row?.transactionId || row?.docNo || row?.id || row?._id,
      fullName: row?.fullName || "-",
    }));
  }, [stripePayments]);

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log("Selected Row Keys:", selectedRowKeys);
      console.log("Selected Rows:", selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record?.paymentStatus?.toLowerCase() === "refunded",
      name: record?.transactionId,
    }),
  };

  const handleViewDetails = (record) => {
    console.log("View details:", record);
    // Add your view details logic here
  };

  const handleRefund = (record) => {
    setSelectedRecord(record);
    setRefundDrawerOpen(true);
  };

  const handleRefundSubmit = (refundData) => {
    console.log("Refund submitted:", refundData);
    console.log("For record:", selectedRecord);

    // Here you can dispatch an action to process the refund
    // dispatch(processRefund({ ...refundData, record: selectedRecord }));

    message.success(`Refund of ${refundData.refund} processed successfully for ${selectedRecord?.fullName || selectedRecord?.memberNo}`);
    setRefundDrawerOpen(false);
    setSelectedRecord(null);
  };

  const handleOpenMemberFinance = async (record) => {
    const approved = !!record?.isApproved;
    const memberOrApplicationNo = String(record?.memberNo || "").trim();
    if (!memberOrApplicationNo || memberOrApplicationNo === "-") {
      message.warning(
        approved
          ? "Membership No is not available for this row."
          : "Application ID is not available for this row."
      );
      return;
    }

    const applicationId = String(
      record?.applicationId || record?.ApplicationId || record?.appId || ""
    ).trim();
    if (!approved) {
      if (!applicationId) {
        message.warning("Application ID is not available for this row.");
        return;
      }
      const appUrl = `/applicationMgt${buildApplicationMgtSearch({
        applicationId,
        edit: true,
      })}`;
      navigate(appUrl);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.REACT_APP_PROFILE_SERVICE_URL;
      const response = await axios.get(
        `${baseUrl}/profile/search?q=${encodeURIComponent(memberOrApplicationNo)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const results = response?.data?.data?.results || [];
      const matchedProfile =
        results.find(
          (item) =>
            String(item?.membershipNumber || "").trim().toLowerCase() ===
            memberOrApplicationNo.toLowerCase()
        ) || results[0];

      if (!matchedProfile?._id) {
        message.warning(`No member file found for ${memberOrApplicationNo}.`);
        return;
      }

      const selectedIndex = normalizedStripePayments.findIndex(
        (item) => item === record
      );
      if (selectedIndex >= 0) {
        setGridData(normalizedStripePayments);
        getProfile([record], selectedIndex);
      }

      const detailsParams = new URLSearchParams(
        buildDetailsSearch(matchedProfile._id).replace("?", "")
      );
      detailsParams.set("activeTab", "2");
      detailsParams.set(
        "memberId",
        matchedProfile.membershipNumber || memberOrApplicationNo
      );
      if (record?.transactionId) {
        detailsParams.set("transactionId", String(record.transactionId));
      }
      navigate(
        {
          pathname: "/Details",
          search: `?${detailsParams.toString()}`,
        },
        {
          state: {
            ...location.state,
            search: location.state?.search || "Finance",
            activeTab: "2",
            memberId:
              matchedProfile.membershipNumber || memberOrApplicationNo || "",
            name: record?.fullName || "",
            code: matchedProfile.membershipNumber || memberOrApplicationNo || "",
            transactionId: record?.transactionId || "",
          },
        }
      );
    } catch (error) {
      console.error("Failed to open member finance tab:", error);
      message.error("Unable to open member file. Please try again.");
    }
  };

  const getMenuItems = (record) => [
    {
      key: "Refund",
      label: "Refund",
      onClick: () => handleRefund(record),
    },
    ...(record?.paymentStatus?.toLowerCase() === "paid" || record?.status?.toLowerCase() === "paid"
      ? [
        {
          key: "refund",
          label: "Refund",
          danger: true,
          onClick: () => handleRefund(record),
        },
      ]
      : []),
  ];

  const columns = [
    {
      title: "Member / Application No",
      dataIndex: "memberNo",
      key: "memberNo",
      ellipsis: true,
      width: 250,
      sorter: true,
      render: (text) => text || "-",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      ellipsis: true,
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      ellipsis: true,
      width: 200,
      sorter: true,
      render: (text, record) => {
        if (!text || text === "-") return "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleOpenMemberFinance(record);
            }}
            style={{ color: "#1677ff", textDecoration: "underline", cursor: "pointer" }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: "Membership Status",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      ellipsis: true,
      width: 180,
      render: (text) => text || "-",
    },
    {
      title: "Renewal Date",
      dataIndex: "renewalDate",
      key: "renewalDate",
      ellipsis: true,
      width: 150,
      render: (date) => (date ? formatDateOnly(date) : "-"),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "docNo",
      ellipsis: true,
      width: 180,
      render: (text) => text || "-",
    },
    {
      title: "Paid Amount",
      dataIndex: "entries",
      key: "entries",
      ellipsis: true,
      width: 150,
      align: "right",
      render: (entries) => {
        if (!Array.isArray(entries)) return formatCurrency(0);

        const bankEntry = entries.find(
          (e) => e.accountCode === "1220" && e.dc === "D"
        );

        const amountInEuros = bankEntry ? bankEntry.amount / 100 : 0;

        return formatCurrency(amountInEuros);
      },
    },
    {
      title: "Payment Date",
      dataIndex: "date",
      key: "date",
      ellipsis: true,
      width: 150,
      render: (date) => (date ? formatDateOnly(date) : "-"),
    },
    {
      title: "Payment Method",
      dataIndex: ["settlement", "provider"],
      key: "paymentMethod",
      ellipsis: true,
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Payment Status",
      dataIndex: ["settlement", "status"],
      key: "status",
      ellipsis: true,
      width: 150,
      render: (status) => {
        const value = status?.toLowerCase();
        let color = "default";

        if (value === "paid") color = "green";
        else if (value === "refunded") color = "red";
        else if (value === "pending") color = "orange";
        else if (value === "failed") color = "volcano";

        return <Tag color={color}>{status || "-"}</Tag>;
      },
    },
    {
      title: "Billing Cycle",
      dataIndex: "billingCycle",
      key: "billingCycle",
      ellipsis: true,
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
      width: 150,
      render: (value) => (value ? formatMobileNumber(value) : "-"),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      ellipsis: true,
      width: 150,
      render: (date) => (date ? formatDateOnly(date) : "-"),
    },

    // ✅ KEEPING YOUR ORIGINAL 3 DOT MENU
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: "20px" }} />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ width: "100%", padding: "0" }}>
      {/* Optional: Display selected count */}
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: "8px 12px", background: "#f0f0f0", borderRadius: 4 }}>
          Selected {selectedRowKeys.length} item(s)
        </div>
      )}
      <div
        className="common-table"
        style={{
          // ...tablePadding,
          paddingLeft: "34px",
          paddingRight: "34px",
          width: "100%",
          overflowX: "auto",
          paddingBottom: "80px",
        }}
      >
        <Table
          dataSource={normalizedStripePayments}
          columns={columns}
          loading={loading}
          rowSelection={rowSelection}
          rowKey={(record) => record.id || record.transactionId || record._id}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />

      </div>

      {/* Refund Drawer/Modal */}
      <RefundDrawer
        open={refundDrawerOpen}
        onClose={() => {
          setRefundDrawerOpen(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleRefundSubmit}
        paymentData={selectedRecord}
      />
    </div>
  );
};

export default OnlinePayment;