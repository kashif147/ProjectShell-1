import React, { useEffect, useState } from "react";
import MyTable from "../../component/common/MyTable";
import { Table, Tag, Dropdown, Button, message } from "antd"; // Add message here
import { MoreOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useDispatch, useSelector } from "react-redux";
import { fetchStripePayments } from "../../features/AccountSlice";
import RefundDrawer from "../../component/finanace/RefundDrawer";

const OnlinePayment = () => {
  const dispatch = useDispatch();
  const { stripePayments, loading } = useSelector((state) => state.account);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [refundDrawerOpen, setRefundDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    dispatch(fetchStripePayments());
  }, [dispatch]);

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
      disabled: record?.status?.toLowerCase() === "refunded",
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

    message.success(`Refund of ${refundData.refund} processed successfully for ${selectedRecord?.memberName}`);
    setRefundDrawerOpen(false);
    setSelectedRecord(null);
  };

  const getMenuItems = (record) => [
    {
      key: "view",
      label: "View Details",
      onClick: () => handleViewDetails(record),
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
      title: "Member ID",
      dataIndex: "memberId",
      key: "memberId",
      render: (text) => text || "-",
    },
    {
      title: "Full Name",
      dataIndex: "memberName",
      key: "memberName",
      render: (text) => text || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "-",
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (text) => text || "-",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => text || "-",
    },
    {
      title: "Membership Status",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      render: (text) => text || "-",
    },
    {
      title: "Renewal Date",
      dataIndex: "renewalDate",
      key: "renewalDate",
      render: (text) => text || "-",
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text) => text || "-",
    },
    {
      title: "Paid Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `Rs. ${amount || 0}`,
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (text) => text || "-",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text) => text || "-",
    },
    {
      title: "Payment Status",
      dataIndex: "status",
      key: "status",
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
      render: (text) => text || "-",
    },
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
          dataSource={stripePayments}
          columns={columns}
          loading={loading}
          rowSelection={rowSelection}
          rowKey={(record) => record.id || record.transactionId}
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