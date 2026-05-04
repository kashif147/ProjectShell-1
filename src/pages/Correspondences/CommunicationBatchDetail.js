import React, { useState, useMemo } from "react";
import { Card, Button, Tag, Tooltip } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
  SendOutlined,
  GlobalOutlined,
  AppleOutlined,
  AndroidOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
import { useLocation, useNavigate } from "react-router-dom";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import Toolbar from "../../component/common/Toolbar";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  getNotificationTokens,
  sendNotification,
  clearNotificationState,
} from "../../features/NotificationSlice";
import MyAlert from "../../component/common/MyAlert";

/** Profile shape from GET …/profile/internal/by-user-ids (notification tokens enrichment). */
function resolveRecipientDisplayName(profile, fallbackUserId) {
  if (!profile || typeof profile !== "object") {
    const u = fallbackUserId && String(fallbackUserId) !== "N/A" ? String(fallbackUserId) : "";
    return u ? `User (${u.slice(0, 8)}…)` : "—";
  }
  const pi = profile.personalInfo;
  if (pi && typeof pi === "object") {
    const fn = typeof pi.fullName === "string" ? pi.fullName.trim() : "";
    if (fn) return fn;
    const parts = [pi.forename, pi.surname]
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  if (profile.userFullName && String(profile.userFullName).trim()) {
    return String(profile.userFullName).trim();
  }
  if (profile.name && String(profile.name).trim()) return String(profile.name).trim();
  if (profile.fullName && String(profile.fullName).trim()) {
    return String(profile.fullName).trim();
  }
  const u = fallbackUserId && String(fallbackUserId) !== "N/A" ? String(fallbackUserId) : "";
  return u ? `User (${u.slice(0, 8)}…)` : "—";
}

function membershipIdFromProfile(profile) {
  if (!profile || typeof profile !== "object") return "—";
  const n = profile.membershipNumber;
  return n != null && String(n).trim() !== "" ? String(n).trim() : "—";
}

function extractNotificationTokenRows(tokensPayload) {
  if (!tokensPayload) return [];
  if (Array.isArray(tokensPayload)) return tokensPayload;
  if (Array.isArray(tokensPayload.tokens)) return tokensPayload.tokens;
  if (Array.isArray(tokensPayload.data?.tokens)) return tokensPayload.data.tokens;
  if (Array.isArray(tokensPayload.data)) return tokensPayload.data;
  return [];
}

const PLATFORM_ICON_STYLE = { fontSize: 18, color: "#215e97" };

function platformIconAndLabel(platform) {
  const raw = String(platform ?? "").trim();
  const p = raw.toLowerCase();
  if (!p || p === "unknown") {
    return {
      label: raw || "Unknown",
      icon: <MobileOutlined style={{ ...PLATFORM_ICON_STYLE, color: "#8c8c8c" }} />,
    };
  }
  if (p === "web" || p === "browser" || p.includes("web")) {
    return {
      label: "Web",
      icon: <GlobalOutlined style={PLATFORM_ICON_STYLE} />,
    };
  }
  if (p === "ios" || p.includes("iphone") || p.includes("ipad")) {
    return {
      label: "iOS",
      icon: <AppleOutlined style={PLATFORM_ICON_STYLE} />,
    };
  }
  if (p === "android" || p.includes("android")) {
    return {
      label: "Android",
      icon: <AndroidOutlined style={PLATFORM_ICON_STYLE} />,
    };
  }
  if (p === "mobile" || p.includes("mobile")) {
    return {
      label: raw,
      icon: <MobileOutlined style={PLATFORM_ICON_STYLE} />,
    };
  }
  return {
    label: raw,
    icon: <MobileOutlined style={{ ...PLATFORM_ICON_STYLE, color: "#8c8c8c" }} />,
  };
}

const CommunicationBatchDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tokens, loading, sending, successMessage, error } = useSelector(
    (state) => state.notification,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (successMessage) {
      MyAlert("success", "Success", successMessage);
      dispatch(clearNotificationState());
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
    if (error) {
      MyAlert(
        "error",
        "Error",
        typeof error === "string" ? error : "Failed to send notifications",
      );
      dispatch(clearNotificationState());
    }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    dispatch(getNotificationTokens());
  }, [dispatch]);
  // Fallback to static values if no state is passed, but keep it simple
  const batchName = location.state?.batchName || "August Newsletter - Email";
  const batchId = location.state?.batchId || "#BTH-2023-08-15";
  const notificationTitle = location.state?.title || "Notification Title";
  const notificationMessage =
    location.state?.message ||
    "This is the content of the notification message.";

  const tableColumns = useMemo(
    () => [
      {
        key: "recipient",
        dataIndex: "recipientName",
        title: "Recipient",
        width: 260,
        ellipsis: true,
        render: (text) => (
          <span style={{ whiteSpace: "nowrap", color: "#262626", fontWeight: 500 }}>
            {text || "—"}
          </span>
        ),
      },
      {
        key: "membershipNumber",
        dataIndex: "membershipNumber",
        title: "Membership ID",
        width: 140,
        ellipsis: true,
        render: (text) => (
          <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            {text || "—"}
          </span>
        ),
      },
      {
        key: "channel",
        dataIndex: "channel",
        title: "Platform",
        width: 88,
        align: "center",
        render: (channel) => {
          const { label, icon } = platformIconAndLabel(channel);
          return (
            <Tooltip title={label}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "timestamp",
        dataIndex: "timestamp",
        title: "Timestamp",
        width: 200,
        ellipsis: true,
        render: (text) => (
          <span style={{ whiteSpace: "nowrap" }}>{text}</span>
        ),
      },
      {
        key: "status",
        dataIndex: "status",
        title: "Status",
        width: 140,
        render: (status) => {
          let color = "default";
          let icon = null;

          if (status === "Delivered") {
            color = "success";
            icon = "✓";
          }
          if (status === "Read") {
            color = "processing";
            icon = "👁";
          }
          if (status === "Failed") {
            color = "error";
            icon = "!";
          }

          return (
            <Tag
              color={color}
              style={{ borderRadius: "12px", padding: "0 10px" }}
            >
              {icon} {status}
            </Tag>
          );
        },
      },
      // {
      //     title: "Actions",
      //     key: "actions",
      //     width: 100,
      //     render: () => (
      //         <Button type="text" icon={<MoreOutlined />} />
      //     )
      // }
    ],
    [],
  );

  // Static Stats Data
  const stats = {
    totalMembers: 12500,
    delivered: 11850,
    read: 9200,
    failed: 650,
    sentProgress: 100,
    deliveredRate: 94.8,
    openRate: 73.6,
    failureRate: 5.2,
  };

  // Static Table Data
  // const data = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
  //     key: i,
  //     memberName: i % 2 === 0 ? "Alex Smith" : "Bonnie Johnson",
  //     memberId: i % 2 === 0 ? "#MEM-00124" : "#MEM-00982",
  //     initials: i % 2 === 0 ? "AS" : "BJ",
  //     avatarColor: i % 2 === 0 ? "#1890ff" : "#fa8c16",
  //     channel: "Email",
  //     recipientDetail: i % 2 === 0 ? "alex.smith@example.com" : "bonnie.j@invalid-domain",
  //     timestamp: "Aug 15, 11:02 AM",
  //     status: i % 3 === 0 ? "Failed" : i % 2 === 0 ? "Read" : "Delivered"
  // })), []);

  const data = useMemo(() => {
    const tokenList = extractNotificationTokenRows(tokens);

    return tokenList.map((token, index) => {
      const profile = token.profile;
      const uid = token.userId ?? token.memberId;
      return {
        key: String(uid ?? `row-${index}`),
        userId: token.userId || "N/A",
        tenantId: token.tenantId,
        profileId: profile?._id != null ? String(profile._id) : null,
        subscriptionId:
          profile?.currentSubscriptionId != null
            ? String(profile.currentSubscriptionId)
            : null,
        recipientName: resolveRecipientDisplayName(profile, token.userId),
        membershipNumber: membershipIdFromProfile(profile),
        channel: token.platform || "Unknown",
        timestamp: token.createdAt
          ? new Date(token.createdAt).toLocaleString()
          : "N/A",
        status: token.isActive ? "Active" : "Inactive",
      };
    });
  }, [tokens]);

  const navyButtonStyle = {
    backgroundColor: "#1d5b95",
    borderColor: "#1d5b95",
    color: "white",
    borderRadius: "4px",
    height: "38px",
    padding: "0 30px",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const outlineButtonStyle = {
    color: "#595959",
    borderColor: "#d9d9d9",
    borderRadius: "4px",
    height: "38px",
    padding: "0 16px",
    fontWeight: "400",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
  };

  const retryButtonStyle = {
    backgroundColor: "#1677ff",
    borderColor: "#1677ff",
    color: "white",
    borderRadius: "4px",
    height: "38px",
    padding: "0 16px",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const handleSendNotification = () => {
    if (selectedRows.length === 0) {
      MyAlert(
        "warning",
        "Selection Required",
        "Please select at least one user to send notification.",
      );
      return;
    }

    const payload = {
      title: notificationTitle,
      body: notificationMessage,
      userId: selectedRows.map((row) => row.userId),
      tenantId: selectedRows.map(
        (row) => row.tenantId || "68cbf7806080b4621d469d34",
      ),
    };

    dispatch(sendNotification(payload));
  };

  return (
    <div
      style={{ padding: "0", minHeight: "100vh", backgroundColor: "#f5f7fa" }}
    >
      <div style={{ padding: "16px 24px 0 24px" }}>
        {/* Breadcrumbs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            fontSize: "12px",
            color: "#8c8c8c",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "2px",
                border: "2px solid #adc6ff",
              }}
            ></div>{" "}
            Correspondence
          </span>
          <span>&gt;</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "2px",
                border: "2px solid #adc6ff",
              }}
            ></div>{" "}
            Batch Details
          </span>
          <span>&gt;</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: 12,
                height: 12,
                border: "2px solid #d9d9d9",
                opacity: 0.5,
              }}
            ></div>{" "}
            {batchName}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                {batchName}
              </h1>
              <Tag
                color="blue"
                style={{ borderRadius: "4px", margin: 0, fontWeight: "bold" }}
              >
                ACTIVE
              </Tag>
            </div>
            <div
              style={{ color: "#8c8c8c", marginTop: "4px", fontSize: "13px" }}
            >
              Batch ID: {batchId} • Created on Aug 15, 2023 at 10:45 AM
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <CommonPopConfirm
              title={`Are you sure you want to send notifications to ${selectedRows.length} selected members?`}
              onConfirm={handleSendNotification}
            >
              <Button
                style={retryButtonStyle}
                icon={<SendOutlined />}
                loading={sending}
                disabled={selectedRows.length === 0}
              >
                Send Notification
              </Button>
            </CommonPopConfirm>
            <Button style={navyButtonStyle}>Include</Button>
            <CommonPopConfirm title="Are you sure you want to exclude members?">
              <Button style={navyButtonStyle}>Exclude Members</Button>
            </CommonPopConfirm>
            <Button style={outlineButtonStyle} icon={<ExportOutlined />}>
              Export CSV
            </Button>
            <Button style={retryButtonStyle} icon={<ReloadOutlined />}>
              Retry Failed
            </Button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "stretch",
            marginBottom: "24px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              flex: "1 1 0",
              minWidth: 0,
              boxSizing: "border-box",
              backgroundColor: "#fff",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                  marginRight: "8px",
                }}
              >
                Subject:
              </span>
              <span
                style={{
                  fontWeight: "500",
                  color: "#262626",
                  fontSize: "14px",
                }}
              >
                {notificationTitle}
              </span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                  marginRight: "8px",
                  verticalAlign: "top",
                }}
              >
                Message:
              </span>
              <span
                style={{
                  color: "#595959",
                  fontSize: "13px",
                  lineHeight: "1.45",
                }}
              >
                {notificationMessage}
              </span>
            </div>
          </div>
          <div
            style={{
              flex: "0 0 auto",
              flexShrink: 0,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "stretch",
              gap: "8px",
              boxSizing: "border-box",
            }}
          >
            {[
              {
                label: "Total Members",
                value: stats.totalMembers,
                sub: `+${stats.sentProgress}% Sent`,
                subColor: "#52c41a",
                icon: (
                  <UserOutlined
                    style={{ color: "#1890ff", fontSize: "13px" }}
                  />
                ),
              },
              {
                label: "Delivered",
                value: stats.delivered,
                sub: `${stats.deliveredRate}% Success`,
                subColor: "#8c8c8c",
                icon: (
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", fontSize: "13px" }}
                  />
                ),
              },
              {
                label: "Read",
                value: stats.read,
                sub: `${stats.openRate}% Open`,
                subColor: "#8c8c8c",
                icon: (
                  <EyeOutlined style={{ color: "#1890ff", fontSize: "13px" }} />
                ),
              },
              {
                label: "Failed",
                value: stats.failed,
                sub: `${stats.failureRate}% Fail`,
                subColor: "#ff4d4f",
                icon: (
                  <ExclamationCircleOutlined
                    style={{ color: "#ff4d4f", fontSize: "13px" }}
                  />
                ),
              },
            ].map((tile) => (
              <Card
                key={tile.label}
                bordered={false}
                styles={{ body: { padding: "8px 10px" } }}
                style={{
                  flex: "0 1 auto",
                  width: 112,
                  minWidth: 88,
                  maxWidth: 130,
                  borderRadius: "6px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: "600",
                      color: "#8c8c8c",
                      textTransform: "uppercase",
                      lineHeight: 1.2,
                    }}
                  >
                    {tile.label}
                  </div>
                  {tile.icon}
                </div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    margin: "4px 0 2px",
                    color: "#262626",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {tile.value.toLocaleString()}
                </div>
                <div
                  style={{
                    color: tile.subColor,
                    fontSize: "11px",
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {tile.sub}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <Toolbar />
      </div>

      {/* Table */}
      <MyTable
        dataSource={data}
        columns={tableColumns}
        loading={loading}
        scroll={{ x: 1040, y: 590 }}
        onRowClick={(record) => {
          navigate("/Details", {
            state: {
              id: record.profileId || record.membershipNumber || record.userId,
              ...record,
            },
          });
        }}
        selection={true}
        rowSelection={{ selectedRowKeys }}
        onSelectionChange={(selectedKeys, selectedRows) => {
          setSelectedRowKeys(selectedKeys);
          setSelectedRows(selectedRows);
        }}
      />
    </div>
  );
};

export default CommunicationBatchDetail;
