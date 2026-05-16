import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  notification,
} from "antd";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { centsToEuro } from "../../utils/Utilities";

const CLEARING_OPTIONS = [
  { value: "1210", label: "1210 — Cheque clearing" },
  { value: "1220", label: "1220 — Card clearing" },
  { value: "1230", label: "1230 — Salary deduction" },
  { value: "1240", label: "1240 — Standing order" },
  { value: "1250", label: "1250 — Direct debit" },
];

const statusColor = {
  unmatched: "orange",
  manual_matched: "blue",
  suspense: "purple",
  settled: "green",
};

const Reconciliation = () => {
  const [clearingCode, setClearingCode] = useState("1220");
  const [statusFilter, setStatusFilter] = useState("");
  const [items, setItems] = useState([]);
  const [supported, setSupported] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${getAccountServiceBaseUrl()}/finance/reconciliation`,
        {
          headers: authHeaders(),
          params: {
            clearingAccountCode: clearingCode,
            reconciliationStatus: statusFilter || undefined,
            limit: 200,
          },
        },
      );
      const payload = res.data?.data ?? res.data;
      setItems(payload?.items || []);
      setSupported(payload?.supportedClearingAccounts || []);
    } catch (error) {
      notification.error({
        message: "Could not load reconciliation records",
        description: error?.response?.data?.message || error.message,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, clearingCode, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const counts = { unmatched: 0, manual_matched: 0, suspense: 0, settled: 0 };
    let pendingAmount = 0;
    for (const r of items) {
      const st = r.reconciliationStatus || "unmatched";
      if (counts[st] != null) counts[st] += 1;
      if (st !== "settled") pendingAmount += Number(r.amount) || 0;
    }
    return { counts, pendingAmount, total: items.length };
  }, [items]);

  const seed = async () => {
    setSeedLoading(true);
    try {
      const res = await axios.post(
        `${getAccountServiceBaseUrl()}/finance/reconciliation/seed`,
        { clearingAccountCode: clearingCode },
        { headers: authHeaders() },
      );
      const payload = res.data?.data ?? res.data;
      notification.success({
        message: `Seeded ${payload?.created ?? 0} record(s) from pending GL`,
      });
      await load();
    } catch (error) {
      notification.error({
        message: "Seed failed",
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setSeedLoading(false);
    }
  };

  const settle = async (recordId) => {
    try {
      await axios.post(
        `${getAccountServiceBaseUrl()}/finance/reconciliation/${recordId}/settle`,
        {},
        { headers: authHeaders() },
      );
      notification.success({ message: "Marked settled" });
      await load();
    } catch (error) {
      notification.error({
        message: "Settle failed",
        description: error?.response?.data?.message || error.message,
      });
    }
  };

  const moveSuspense = (recordId) => {
    let reason = "";
    Modal.confirm({
      title: "Move to suspense",
      content: (
        <Input.TextArea
          rows={3}
          placeholder="Reason"
          onChange={(e) => {
            reason = e.target.value;
          }}
        />
      ),
      onOk: async () => {
        await axios.post(
          `${getAccountServiceBaseUrl()}/finance/reconciliation/suspense`,
          { recordId, suspenseReason: reason || "Manual suspense" },
          { headers: authHeaders() },
        );
        notification.success({ message: "Moved to suspense" });
        await load();
      },
    });
  };

  const manualMatch = (recordId) => {
    let glDocNo = "";
    Modal.confirm({
      title: "Manual match",
      content: (
        <Input
          placeholder="Matched GL doc no."
          onChange={(e) => {
            glDocNo = e.target.value;
          }}
        />
      ),
      onOk: async () => {
        if (!glDocNo.trim()) return;
        await axios.post(
          `${getAccountServiceBaseUrl()}/finance/reconciliation/match`,
          { recordId, matchedGlDocNo: glDocNo.trim() },
          { headers: authHeaders() },
        );
        notification.success({ message: "Matched" });
        await load();
      },
    });
  };

  const columns = [
    { title: "GL doc", dataIndex: "glDocNo", key: "glDocNo", width: 140 },
    {
      title: "Clearing",
      dataIndex: "clearingAccountCode",
      key: "clearingAccountCode",
      width: 90,
    },
    {
      title: "Amount",
      key: "amount",
      width: 110,
      render: (_, r) => `€${centsToEuro(r.amount || 0).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "reconciliationStatus",
      key: "reconciliationStatus",
      width: 130,
      render: (st) => (
        <Tag color={statusColor[st] || "default"}>{st || "unmatched"}</Tag>
      ),
    },
    {
      title: "Settlement",
      dataIndex: "settlementStatus",
      key: "settlementStatus",
      width: 100,
    },
    { title: "Matched to", dataIndex: "matchedGlDocNo", key: "matchedGlDocNo" },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, r) => (
        <Space size="small" wrap>
          {r.reconciliationStatus !== "settled" ? (
            <>
              <Button type="link" size="small" onClick={() => manualMatch(r._id)}>
                Match
              </Button>
              <Button type="link" size="small" onClick={() => moveSuspense(r._id)}>
                Suspense
              </Button>
              <Button type="link" size="small" onClick={() => settle(r._id)}>
                Settle
              </Button>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card title="Clearing reconciliation" style={{ marginBottom: 16 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 260 }}
            value={clearingCode}
            onChange={setClearingCode}
            options={CLEARING_OPTIONS.filter(
              (o) => !supported.length || supported.includes(o.value),
            )}
          />
          <Select
            allowClear
            placeholder="Status filter"
            style={{ width: 180 }}
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
            options={[
              { value: "unmatched", label: "Unmatched" },
              { value: "manual_matched", label: "Matched" },
              { value: "suspense", label: "Suspense" },
              { value: "settled", label: "Settled" },
            ]}
          />
          <Button onClick={load} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" onClick={seed} loading={seedLoading}>
            Seed from pending GL
          </Button>
        </Space>
        <Space size="large" style={{ marginBottom: 12 }}>
          <span>Total: {summary.total}</span>
          <span>Unmatched: {summary.counts.unmatched}</span>
          <span>Matched: {summary.counts.manual_matched}</span>
          <span>Suspense: {summary.counts.suspense}</span>
          <span>Settled: {summary.counts.settled}</span>
          <span>
            Open amount: €{centsToEuro(summary.pendingAmount).toFixed(2)}
          </span>
        </Space>
        <Table
          rowKey="_id"
          size="small"
          loading={loading}
          dataSource={items}
          columns={columns}
          pagination={{ pageSize: 25 }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default Reconciliation;
