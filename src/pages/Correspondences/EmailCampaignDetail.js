import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import {
  CalendarOutlined,
  MailOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { communicationServicePath } from "../../utils/communicationServiceUrl";
import { formatDateDdMmYyyy } from "../../utils/Utilities";
import {
  SOFT_BATCH_STATUS_TAGS,
  SOFT_DELIVERY_STYLES,
} from "../../utils/softTagStyles";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

const AMBER_BG = "#fff7e6";
const AMBER_BORDER = "#ffd591";
const AMBER_TEXT = "#d48806";
const INACTIVE_LABEL = "#8c8c8c";

function campaignHeaderStatusStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent") return SOFT_BATCH_STATUS_TAGS.completed;
  if (s === "draft" || s === "scheduled") return SOFT_BATCH_STATUS_TAGS.pending;
  if (s === "processing") return SOFT_DELIVERY_STYLES.sent;
  if (s === "failed") return SOFT_DELIVERY_STYLES.failed;
  if (s === "cancelled") return SOFT_DELIVERY_STYLES.default;
  return SOFT_BATCH_STATUS_TAGS.pending;
}

function formatCampaignStatusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function recipientStatusTagColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent" || s === "delivered") return "success";
  if (s === "processing" || s === "pending") return "processing";
  if (s === "failed" || s === "bounced" || s === "complained") return "error";
  if (s === "skipped" || s === "cancelled") return "default";
  return "default";
}

export default function EmailCampaignDetail() {
  const [params] = useSearchParams();
  const campaignId = params.get("campaignId");

  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const loadCampaignDetail = async (id) => {
    if (!id) {
      setCampaign(null);
      setRecipients([]);
      return;
    }
    setLoading(true);
    try {
      const [campaignRes, recipientsRes] = await Promise.all([
        axios.get(communicationServicePath(`campaigns/${id}`), {
          headers: authHeaders(),
        }),
        axios.get(communicationServicePath(`campaigns/${id}/recipients`), {
          params: { page: 1, limit: 500 },
          headers: authHeaders(),
        }),
      ]);
      const c = campaignRes.data?.data?.campaign || campaignRes.data?.campaign || null;
      const r =
        recipientsRes.data?.data?.recipients || recipientsRes.data?.recipients || [];
      setCampaign(c);
      setRecipients(Array.isArray(r) ? r : []);
    } catch (e) {
      setCampaign(null);
      setRecipients([]);
      message.error(e.response?.data?.message || "Failed to load campaign batch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaignDetail(campaignId);
  }, [campaignId]);

  const handleTrigger = async () => {
    if (!campaign?._id) return;
    setTriggering(true);
    try {
      await axios.post(
        communicationServicePath(`campaigns/${campaign._id}/send`),
        {},
        { headers: authHeaders() },
      );
      message.success("Campaign trigger started");
      await loadCampaignDetail(campaign._id);
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to trigger campaign");
    } finally {
      setTriggering(false);
    }
  };

  const audienceCount = campaign?.audienceProfileIds?.length ?? 0;
  const stats = campaign?.stats || {};
  const totalRecipientRows = recipients.length;

  const recipientColumns = useMemo(
    () => [
      {
        title: "Member ID",
        dataIndex: "memberId",
        key: "memberId",
        width: 220,
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ellipsis: true,
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (v) => (
          <Tag color={recipientStatusTagColor(v)}>{String(v || "—")}</Tag>
        ),
      },
      {
        title: "Sent at",
        dataIndex: "sentAt",
        key: "sentAt",
        width: 180,
        render: (v) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {v ? `${formatDateDdMmYyyy(v)} ${dayjs(v).format("HH:mm")}` : "—"}
          </span>
        ),
      },
      {
        title: "Delivery",
        dataIndex: "deliveryStatus",
        key: "deliveryStatus",
        ellipsis: true,
        render: (v) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {v ? String(v) : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const triggerDisabled =
    campaign &&
    ["sent", "processing", "cancelled"].includes(
      String(campaign.status || "").toLowerCase(),
    );

  if (!campaignId) {
    return (
      <div className="p-3">
        <Card styles={{ body: { padding: 20 } }}>
          <Empty description="No campaign selected" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="p-3">
        <Card
          style={{ marginBottom: 16 }}
          styles={{ body: { padding: 20 } }}
        >
          <Row gutter={[16, 16]} align="top">
            <Col xs={24} lg={14}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#262626",
                }}
              >
                {campaign?.name || "Email campaign batch"}
              </h2>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px 24px",
                  color: "#595959",
                  fontSize: 14,
                }}
              >
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  {campaign?.createdByName || campaign?.createdBy || "—"}
                </span>
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {campaign?.createdAt
                    ? formatDateDdMmYyyy(campaign.createdAt)
                    : "—"}
                </span>
                <span>
                  <MailOutlined style={{ marginRight: 8 }} />
                  <span style={{ wordBreak: "break-all" }}>
                    ID: {campaign?._id ?? "—"}
                  </span>
                </span>
              </div>
              {campaign ? (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#595959",
                    lineHeight: 1.55,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 20px",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    <strong style={{ color: "#262626" }}>
                      {(stats.totalRecipients ?? totalRecipientRows).toLocaleString()}
                    </strong>{" "}
                    recipients (expanded)
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    <strong style={{ color: "var(--mainBlue)" }}>
                      {audienceCount.toLocaleString()}
                    </strong>{" "}
                    selected
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    Sent {Number(stats.sent ?? 0).toLocaleString()} · Delivered{" "}
                    {Number(stats.delivered ?? 0).toLocaleString()} · Bounced{" "}
                    {Number(stats.bounced ?? 0).toLocaleString()}
                  </span>
                </div>
              ) : null}
            </Col>
            <Col xs={24} lg={10}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: INACTIVE_LABEL,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Campaign status
                  </span>
                  {campaign ? (
                    <Tag
                      bordered={false}
                      style={campaignHeaderStatusStyle(campaign.status)}
                    >
                      {formatCampaignStatusLabel(campaign.status)}
                    </Tag>
                  ) : (
                    <span
                      style={{
                        margin: 0,
                        padding: "2px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: AMBER_BG,
                        border: `1px solid ${AMBER_BORDER}`,
                        color: AMBER_TEXT,
                      }}
                    >
                      Loading
                    </span>
                  )}
                </div>
                <Space wrap>
                  <Button
                    type="primary"
                    className="butn primary-btn"
                    disabled={!campaign || triggerDisabled}
                    loading={triggering}
                    onClick={handleTrigger}
                  >
                    Trigger campaign
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        <Card
          styles={{ body: { paddingTop: 0 } }}
          title={
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TeamOutlined style={{ color: "var(--mainBlue)" }} />
              Recipient listings
            </span>
          }
          extra={
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#595959",
              }}
            >
              Total: {totalRecipientRows.toLocaleString()} rows
            </span>
          }
        >
          {!campaign && !loading ? (
            <Empty description="Campaign not found" />
          ) : (
            <div
              className="common-table reminder-cancellation-members-wrap"
              style={{
                width: "100%",
                overflowX: "auto",
                paddingBottom: "16px",
              }}
            >
              <Table
                rowKey={(r) => r._id}
                columns={recipientColumns}
                dataSource={recipients}
                loading={loading}
                pagination={false}
                bordered
                tableLayout="fixed"
                sticky
                scroll={{ x: "max-content", y: 590 }}
                size="middle"
                locale={{
                  emptyText:
                    "No recipients yet. Trigger campaign to expand and send.",
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
