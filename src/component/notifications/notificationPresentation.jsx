import React from "react";
import { List, Typography, Badge, Avatar } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const iconMap = {
  DEFAULT: <FileTextOutlined style={{ color: "#1890ff" }} />,
  SUCCESS: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  USER: <UserOutlined style={{ color: "#fa8c16" }} />,
  MAIL: <MailOutlined style={{ color: "#722ed1" }} />,
};

export const isBatchProcessNotification = (type) =>
  type === "BATCH_PROCESS_COMPLETED" ||
  type === "BATCH_PROCESS_QUEUED" ||
  type === "DD_PREPARE_QUEUED" ||
  type === "DD_PREPARE_COMPLETED";

export const isDirectDebitPrepareNotification = (type) =>
  type === "DD_PREPARE_QUEUED" || type === "DD_PREPARE_COMPLETED";

/**
 * Single notification row for List renderItem (popover or full page).
 */
export function NotificationRow({ item, onRowClick, padding = "16px 24px" }) {
  const meta = item?.metadata || {};
  const isDdPrepare = isDirectDebitPrepareNotification(meta.type);
  const includedCount = Number(meta.included || 0);
  const excludedCount = Number(meta.excluded || 0);

  return (
    <List.Item
      onClick={() => onRowClick?.(item._id, item)}
      style={{
        padding,
        backgroundColor: item.isRead ? "#fff" : "#f6faff",
        cursor: onRowClick ? "pointer" : "default",
        transition: "background-color 0.3s",
      }}
      className="notification-item"
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={iconMap.DEFAULT}
            style={{ backgroundColor: "#e6f7ff" }}
            size="large"
          />
        }
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text strong>{item.title}</Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
              }}
            >
              {isBatchProcessNotification(meta.type) && (
                <Text strong style={{ color: "#1D4ED8", fontSize: 12 }}>
                  {Number(meta.totalTransactions || 0)}
                </Text>
              )}
              {!item.isRead && <Badge status="processing" color="#1890ff" />}
            </div>
          </div>
        }
        description={
          <div>
            {isBatchProcessNotification(meta.type) ? (
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                <div>{`Ref No: ${meta.referenceNumber || "-"} | Description: ${meta.description || "-"}`}</div>
                {isDdPrepare &&
                  meta.type === "DD_PREPARE_COMPLETED" &&
                  (includedCount > 0 || excludedCount > 0) && (
                    <div>
                      Included: {includedCount} | Excluded: {excludedCount}
                    </div>
                  )}
              </div>
            ) : (
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                {item.body}
              </div>
            )}
            <Text
              type="secondary"
              style={{
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ClockCircleOutlined />
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "—"}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
}
