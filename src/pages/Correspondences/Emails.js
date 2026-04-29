import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Empty, Row, Space, Table, Tag, message } from "antd";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { communicationServicePath } from "../../utils/communicationServiceUrl";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function statusColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent" || s === "delivered") return "green";
  if (s === "processing" || s === "scheduled") return "blue";
  if (s === "failed" || s === "bounced" || s === "complained") return "red";
  if (s === "cancelled") return "default";
  return "gold";
}

function Emails() {
  const [params, setParams] = useSearchParams();
  const selectedCampaignId = params.get("campaignId");

  const [campaigns, setCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const loadCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await axios.get(communicationServicePath("campaigns"), {
        headers: authHeaders(),
      });
      const rows = res.data?.data?.campaigns || res.data?.campaigns || [];
      setCampaigns(Array.isArray(rows) ? rows : []);
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to load campaigns");
    } finally {
      setCampaignLoading(false);
    }
  };

  const loadCampaignDetail = async (id) => {
    if (!id) {
      setActiveCampaign(null);
      setRecipients([]);
      return;
    }
    try {
      const [campaignRes, recipientsRes] = await Promise.all([
        axios.get(communicationServicePath(`campaigns/${id}`), {
          headers: authHeaders(),
        }),
        axios.get(communicationServicePath(`campaigns/${id}/recipients`), {
          params: { page: 1, limit: 200 },
          headers: authHeaders(),
        }),
      ]);
      const c = campaignRes.data?.data?.campaign || campaignRes.data?.campaign || null;
      const r =
        recipientsRes.data?.data?.recipients || recipientsRes.data?.recipients || [];
      setActiveCampaign(c);
      setRecipients(Array.isArray(r) ? r : []);
    } catch (e) {
      setActiveCampaign(null);
      setRecipients([]);
      message.error(e.response?.data?.message || "Failed to load campaign detail");
    } finally {
      setRecipientLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) {
      setActiveCampaign(null);
      setRecipients([]);
      return;
    }
    setRecipientLoading(true);
    loadCampaignDetail(selectedCampaignId);
  }, [selectedCampaignId]);

  const handleOpenCampaign = (id) => {
    setParams({ campaignId: id });
  };

  const handleTrigger = async () => {
    if (!activeCampaign?._id) return;
    setTriggering(true);
    try {
      await axios.post(
        communicationServicePath(`campaigns/${activeCampaign._id}/send`),
        {},
        { headers: authHeaders() }
      );
      message.success("Campaign trigger started");
      await Promise.all([loadCampaigns(), loadCampaignDetail(activeCampaign._id)]);
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to trigger campaign");
    } finally {
      setTriggering(false);
    }
  };

  const campaignColumns = useMemo(
    () => [
      { title: "Campaign", dataIndex: "name", key: "name" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (v) => <Tag color={statusColor(v)}>{String(v || "-").toUpperCase()}</Tag>,
      },
      {
        title: "Audience",
        key: "audience",
        width: 110,
        render: (_, row) => row?.audienceProfileIds?.length || 0,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 170,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: "Action",
        key: "action",
        width: 100,
        render: (_, row) => (
          <Button size="small" onClick={() => handleOpenCampaign(row._id)}>
            Open
          </Button>
        ),
      },
    ],
    []
  );

  const recipientColumns = useMemo(
    () => [
      { title: "Member ID", dataIndex: "memberId", key: "memberId", width: 200 },
      { title: "Email", dataIndex: "email", key: "email" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (v) => <Tag color={statusColor(v)}>{String(v || "-").toUpperCase()}</Tag>,
      },
      {
        title: "Sent At",
        dataIndex: "sentAt",
        key: "sentAt",
        width: 170,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
    ],
    []
  );

  return (
    <div className="p-3">
      <Row gutter={16}>
        <Col span={10}>
          <Card title="Email Campaigns">
            <Table
              rowKey={(r) => r._id}
              columns={campaignColumns}
              dataSource={campaigns}
              loading={campaignLoading}
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
        <Col span={14}>
          <Card
            title={
              activeCampaign
                ? `Campaign Batch: ${activeCampaign.name}`
                : "Campaign Batch"
            }
            extra={
              activeCampaign ? (
                <Space>
                  <Tag color={statusColor(activeCampaign.status)}>
                    {String(activeCampaign.status || "-").toUpperCase()}
                  </Tag>
                  <Button
                    type="primary"
                    className="butn primary-btn"
                    disabled={
                      ["sent", "processing", "cancelled"].includes(
                        String(activeCampaign.status || "").toLowerCase()
                      )
                    }
                    loading={triggering}
                    onClick={handleTrigger}
                  >
                    Trigger Campaign
                  </Button>
                </Space>
              ) : null
            }
          >
            {activeCampaign ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <strong>Campaign ID:</strong> {activeCampaign._id}
                  <br />
                  <strong>Audience selected:</strong>{" "}
                  {activeCampaign?.audienceProfileIds?.length || 0}
                  <br />
                  <strong>Recipients expanded:</strong>{" "}
                  {activeCampaign?.stats?.totalRecipients ?? 0}
                </div>
                <Table
                  rowKey={(r) => r._id}
                  columns={recipientColumns}
                  dataSource={recipients}
                  loading={recipientLoading}
                  size="small"
                  pagination={{ pageSize: 20 }}
                  locale={{ emptyText: "No recipients yet. Trigger campaign to expand and send." }}
                />
              </>
            ) : (
              <Empty description="Open a campaign to view members and trigger send" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Emails;
