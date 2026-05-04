import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Spin,
  Empty,
  Typography,
  Button,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  FilePdfOutlined,
  BellOutlined,
  MailOutlined,
  MessageOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import MyTable from "../common/MyTable";
import { getNotificationServiceUrl } from "../../context/NotificationContext";
import { formatDateOnly } from "../../utils/Utilities";
import {
  SOFT_DELIVERY_STYLES,
  SOFT_READ_TAG,
} from "../../utils/softTagStyles";

const { Text } = Typography;

/** Letter icon only if metadata.channel is letter/postal — PDF attachments on in-app rows stay bell. */
function resolveCommunicationKind(n) {
  const meta = n.metadata || {};
  const explicit = String(
    meta.channel || meta.communicationChannel || meta.notificationChannel || "",
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (explicit === "email" || explicit === "e_mail") return "email";
  if (explicit === "sms" || explicit === "text") return "sms";
  if (explicit === "letter" || explicit === "postal" || explicit === "post") {
    return "letter";
  }
  if (
    explicit === "in_app" ||
    explicit === "inapp" ||
    explicit === "app" ||
    explicit === "push"
  ) {
    return "in_app";
  }

  const status = String(n.status || "").toLowerCase();
  if (status === "delivered" || status === "sent" || status === "pending") {
    return "in_app";
  }

  return "unknown";
}

function CommunicationChannelIcon({ kind }) {
  const s = { fontSize: 18 };
  const wrap = (node, title) => (
    <Tooltip title={title}>
      <span role="img" aria-label={title}>
        {node}
      </span>
    </Tooltip>
  );
  switch (kind) {
    case "email":
      return wrap(<MailOutlined style={{ ...s, color: "#45669d" }} />, "Email");
    case "sms":
      return wrap(
        <MessageOutlined style={{ ...s, color: "#389e0d" }} />,
        "SMS",
      );
    case "letter":
      return wrap(
        <FileTextOutlined style={{ ...s, color: "#722ed1" }} />,
        "Letter / printable document",
      );
    case "in_app":
      return wrap(
        <BellOutlined style={{ ...s, color: "#fa8c16" }} />,
        "In-app notification",
      );
    default:
      return wrap(
        <QuestionCircleOutlined style={{ ...s, color: "#bfbfbf" }} />,
        "Channel unknown",
      );
  }
}

/** If member read it, treat as delivered even when backend left status pending (e.g. offline/FCM gap). */
function displayDeliveryStatus(status, isRead) {
  const s = String(status ?? "").trim().toLowerCase();
  if (isRead && s === "pending") return "delivered";
  return status ?? "—";
}

function formatDeliveryLabel(status) {
  if (status == null || status === "" || status === "—") return "—";
  const s = String(status).trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function DeliveryStatusTag({ value }) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "—") {
    return (
      <Tag bordered={false} style={SOFT_DELIVERY_STYLES.default}>
        —
      </Tag>
    );
  }
  const lower = raw.toLowerCase();
  let key = "default";
  if (lower === "delivered") key = "delivered";
  else if (lower === "sent") key = "sent";
  else if (lower === "pending") key = "pending";
  else if (lower === "failed") key = "failed";

  return (
    <Tag
      bordered={false}
      style={SOFT_DELIVERY_STYLES[key] || SOFT_DELIVERY_STYLES.default}
    >
      {formatDeliveryLabel(raw)}
    </Tag>
  );
}

/** Centers content under sticky headers (.common-table can fight Ant Design align alone). */
function CellCenter({ children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

const centeredHeaderAndBodyProps = {
  onHeaderCell: () => ({
    style: { textAlign: "center" },
  }),
  onCell: () => ({
    style: { textAlign: "center", verticalAlign: "middle" },
  }),
};

const messageCellStyle = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
  fontSize: 13,
  lineHeight: 1.55,
  paddingTop: 8,
  paddingBottom: 8,
};

/** Raw base64 or data URL → blob URL for viewing in a new tab */
function attachmentToBlobUrl(attachment) {
  if (!attachment || typeof attachment !== "object") return null;
  let raw = attachment.dataBase64;
  if (raw == null || raw === "") return null;
  raw = String(raw);
  let mime = attachment.mimeType || "application/pdf";
  if (raw.startsWith("data:")) {
    const comma = raw.indexOf(",");
    if (comma !== -1) {
      const header = raw.slice(5, comma);
      const semi = header.indexOf(";");
      mime = semi !== -1 ? header.slice(0, semi) : mime;
      raw = raw.slice(comma + 1);
    }
  }
  try {
    const binary = atob(raw.replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/** Navigate-to-blob is unreliable on child windows; embed blob URL in iframe instead. */
function openBlobPdfInTab(win, blobUrl) {
  if (!win || !blobUrl) return;
  try {
    win.document.open();
    win.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>PDF</title></head><body style="margin:0;background:#525659;"><iframe src="${blobUrl}" title="PDF" style="border:0;width:100%;height:100vh;display:block;"></iframe></body></html>`,
    );
    win.document.close();
  } catch {
    try {
      win.location.assign(blobUrl);
    } catch {
      /* ignore */
    }
  }
}

const CommunicationHistory = () => {
  const profileDetails = useSelector((s) => s.profileDetails?.profileDetails);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [openingAttachmentId, setOpeningAttachmentId] = useState(null);

  const blobUrlsRef = useRef([]);

  const memberUserId = useMemo(() => {
    const uid = profileDetails?.userId;
    if (!uid) return null;
    return String(uid._id ?? uid);
  }, [profileDetails?.userId]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          /* ignore */
        }
      });
      blobUrlsRef.current = [];
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!memberUserId) {
      setRows([]);
      setError(null);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${getNotificationServiceUrl()}/notifications/admin`,
        {
          params: { userId: memberUserId, page: 1, limit: 500 },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const list = res.data?.data?.data ?? [];
      setRows(
        list.map((n) => {
          const meta = n.metadata || {};
          const attachments = meta.attachments;
          const hasAttachment =
            Array.isArray(attachments) &&
            attachments.some(
              (a) =>
                a &&
                (a.hasData === true ||
                  (typeof a.filename === "string" && a.filename.length > 0)),
            );
          const at =
            n.sentAt || n.createdAt
              ? new Date(n.sentAt || n.createdAt)
              : null;
          const dateStr =
            at && !Number.isNaN(at.getTime())
              ? formatDateOnly(at)
              : "—";
          const bodyFull = n.body ?? "";
          return {
            key: String(n._id),
            notificationId: String(n._id),
            channelKind: resolveCommunicationKind({
              metadata: meta,
              status: n.status,
              firebaseMessageId: n.firebaseMessageId,
            }),
            title: n.title || "—",
            date: dateStr,
            notes: bodyFull,
            deliveryStatus: displayDeliveryStatus(n.status, !!n.isRead),
            isRead: !!n.isRead,
            hasAttachment,
          };
        }),
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to load notifications";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [memberUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const onHeaderRefresh = () => {
      if (memberUserId) fetchNotifications();
    };
    window.addEventListener("projectshell:details-refresh", onHeaderRefresh);
    return () =>
      window.removeEventListener("projectshell:details-refresh", onHeaderRefresh);
  }, [fetchNotifications, memberUserId]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && memberUserId) {
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchNotifications, memberUserId]);

  const openAttachmentInNewTab = useCallback(
    async (notificationId) => {
      const token = localStorage.getItem("token");
      if (!token || !memberUserId) return;

      // Do not use noopener — it can prevent navigating the returned window to a blob URL.
      const tab = window.open("about:blank", "_blank");
      if (!tab) {
        message.warning(
          "Pop-up blocked. Allow pop-ups for this site to view the PDF.",
        );
        return;
      }

      setOpeningAttachmentId(notificationId);
      try {
        const res = await axios.get(
          `${getNotificationServiceUrl()}/notifications/admin/preview`,
          {
            params: {
              id: notificationId,
              forUserId: memberUserId,
            },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const notification = res.data?.data?.notification;
        const attachments = notification?.metadata?.attachments;
        if (!Array.isArray(attachments) || attachments.length === 0) {
          tab.close();
          message.error("No attachments on this notification.");
          return;
        }

        const blobUrls = [];
        attachments.forEach((att) => {
          const url = attachmentToBlobUrl(att);
          if (url) blobUrls.push(url);
        });

        if (blobUrls.length === 0) {
          tab.close();
          message.error(
            "Attachments could not be loaded (missing or invalid PDF data).",
          );
          return;
        }

        blobUrls.forEach((u) => blobUrlsRef.current.push(u));

        openBlobPdfInTab(tab, blobUrls[0]);

        for (let i = 1; i < blobUrls.length; i++) {
          const extra = window.open("about:blank", "_blank");
          if (extra) openBlobPdfInTab(extra, blobUrls[i]);
        }
      } catch (err) {
        tab.close();
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error?.message ||
          err.message ||
          "Failed to load attachment";
        message.error(msg);
      } finally {
        setOpeningAttachmentId(null);
      }
    },
    [memberUserId],
  );

  const columns = [
    {
      title: "",
      key: "channelKind",
      width: 44,
      align: "center",
      render: (_, record) => (
        <CommunicationChannelIcon kind={record.channelKind} />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 132,
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 104,
    },
    {
      title: "Message",
      dataIndex: "notes",
      key: "notes",
      width: 208,
      ellipsis: false,
      onCell: () => ({ style: { verticalAlign: "top" } }),
      render: (text) => <div style={messageCellStyle}>{text}</div>,
    },
    {
      title: "Delivery",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 100,
      align: "center",
      ...centeredHeaderAndBodyProps,
      render: (text) => (
        <CellCenter>
          <DeliveryStatusTag value={text} />
        </CellCenter>
      ),
    },
    {
      title: "Read",
      dataIndex: "isRead",
      key: "isRead",
      width: 82,
      align: "center",
      ...centeredHeaderAndBodyProps,
      render: (v) => (
        <CellCenter>
          {v ? (
            <Tag bordered={false} style={SOFT_READ_TAG.read}>
              Read
            </Tag>
          ) : (
            <Tag bordered={false} style={SOFT_READ_TAG.unread}>
              Unread
            </Tag>
          )}
        </CellCenter>
      ),
    },
    {
      title: "Attachment",
      key: "attachment",
      width: 96,
      align: "center",
      ...centeredHeaderAndBodyProps,
      render: (_, record) => (
        <CellCenter>
          {record.hasAttachment ? (
            <Button
              type="text"
              aria-label="Open PDF in new tab"
              title="Open PDF in new tab"
              loading={openingAttachmentId === record.notificationId}
              onClick={(e) => {
                e.stopPropagation();
                openAttachmentInNewTab(record.notificationId);
              }}
            >
              <FilePdfOutlined style={{ fontSize: 22, color: "#d4380d" }} />
            </Button>
          ) : (
            <span style={{ color: "#bfbfbf" }}>—</span>
          )}
        </CellCenter>
      ),
    },
  ];

  if (!profileDetails) {
    return (
      <div className="cases-main" style={{ padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (!memberUserId) {
    return (
      <div className="cases-main" style={{ padding: 24 }}>
        <Empty description="No portal user is linked to this profile. Notification history applies once a user account is associated." />
      </div>
    );
  }

  return (
    <div className="cases-main">
      {error ? (
        <div style={{ marginBottom: 12 }}>
          <Text type="danger">{error}</Text>
        </div>
      ) : null}
      <MyTable
        dataSource={rows}
        columns={columns}
        selection={false}
        loading={loading}
      />
    </div>
  );
};

export default CommunicationHistory;
