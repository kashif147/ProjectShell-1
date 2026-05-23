import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input, Modal, notification } from "antd";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import TableComponent from "../../component/common/TableComponent";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { centsToEuro } from "../../utils/Utilities";
import reconciliationWorkspace from "../../utils/reconciliationWorkspace";
import { CLEARING_ACCOUNT_OPTIONS } from "../../constants/reconciliation";

const CLEARING_LABEL_BY_CODE = Object.fromEntries(
  CLEARING_ACCOUNT_OPTIONS.map(({ value, label }) => {
    const sep = label.indexOf(" — ");
    return [
      value,
      sep >= 0
        ? { code: label.slice(0, sep), name: label.slice(sep + 3) }
        : { code: value, name: label },
    ];
  }),
);

const Reconciliation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearingCode = searchParams.get("clearing") || "1220";
  const statusFilter = searchParams.get("status") || "";

  const [items, setItems] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await axios.get(
        `${getAccountServiceBaseUrl()}/finance/reconciliation/dashboard`,
        { headers: authHeaders() },
      );
      const payload = res.data?.data ?? res.data;
      setDashboard(payload);
      reconciliationWorkspace.setSupportedClearing(
        payload?.supportedClearingAccounts || [],
      );
    } catch {
      setDashboard(null);
    }
  }, [authHeaders]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await loadDashboard();
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
      reconciliationWorkspace.setSupportedClearing(
        payload?.supportedClearingAccounts ||
          reconciliationWorkspace.getSupportedClearing(),
      );
    } catch (error) {
      notification.error({
        message: "Could not load reconciliation records",
        description: error?.response?.data?.message || error.message,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, clearingCode, statusFilter, loadDashboard]);

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

  const seed = useCallback(async () => {
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
  }, [authHeaders, clearingCode, load]);

  const settle = useCallback(
    async (recordId) => {
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
    },
    [authHeaders, load],
  );

  const moveSuspense = useCallback(
    (recordId) => {
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
    },
    [authHeaders, load],
  );

  const manualMatch = useCallback(
    (recordId) => {
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
    },
    [authHeaders, load],
  );

  useEffect(() => {
    reconciliationWorkspace.registerHandlers({
      seed,
      settle,
      moveSuspense,
      manualMatch,
    });
    return () => reconciliationWorkspace.clearHandlers();
  }, [seed, settle, moveSuspense, manualMatch]);

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        key: item._id,
      })),
    [items],
  );

  const activeAccount = useMemo(
    () =>
      dashboard?.accounts?.find((a) => a.clearingAccountCode === clearingCode),
    [dashboard, clearingCode],
  );

  return (
    <div style={{ width: "100%", padding: 0 }}>
      {dashboard?.accounts?.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 8,
            width: "100%",
            boxSizing: "border-box",
            padding: "4px 34px 4px",
          }}
        >
          {dashboard.accounts.map((acc) => {
            const meta =
              CLEARING_LABEL_BY_CODE[acc.clearingAccountCode] || null;
            const isActive = acc.clearingAccountCode === clearingCode;
            return (
              <button
                key={acc.clearingAccountCode}
                type="button"
                onClick={() =>
                  navigate(
                    `/Reconciliation?clearing=${acc.clearingAccountCode}${
                      statusFilter ? `&status=${statusFilter}` : ""
                    }`,
                  )
                }
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  padding: "8px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                  border: isActive
                    ? "1px solid #1677ff"
                    : "1px solid #d9d9d9",
                  borderRadius: 4,
                  background: isActive ? "#e6f4ff" : "#fafafa",
                  fontSize: 11,
                  lineHeight: 1.3,
                }}
              >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={
                  meta
                    ? `${meta.code} — ${meta.name}`
                    : acc.clearingAccountCode
                }
              >
                {acc.clearingAccountCode}
                {meta?.name ? (
                  <span style={{ fontWeight: 500, color: "#595959" }}>
                    {" "}
                    · {meta.name}
                  </span>
                ) : null}
              </div>
              <div style={{ color: "#595959", fontSize: 10 }}>
                Unreconciled: {acc.unreconciledCount} · Open: €
                {centsToEuro(acc.openAmount || 0).toFixed(2)}
              </div>
              <div style={{ color: "#595959", fontSize: 10 }}>
                Pending GL: {acc.pendingGlCount}
                {acc.lastReconciledAt
                  ? ` · Last: ${new Date(acc.lastReconciledAt).toLocaleDateString("en-IE")}`
                  : ""}
              </div>
            </button>
            );
          })}
        </div>
      ) : null}
      <div
        style={{
          padding: "4px 34px 2px",
          fontSize: 12,
          color: "#595959",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span>Filter total: {summary.total}</span>
        {activeAccount ? (
          <span>
            Account open: €
            {centsToEuro(activeAccount.openAmount || 0).toFixed(2)}
          </span>
        ) : null}
        <span>Unmatched: {summary.counts.unmatched}</span>
        <span>Matched: {summary.counts.manual_matched}</span>
        <span>Suspense: {summary.counts.suspense}</span>
        <span>Settled: {summary.counts.settled}</span>
        <span>
          Open amount: €{centsToEuro(summary.pendingAmount).toFixed(2)}
        </span>
      </div>
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="Reconciliation"
        enableRowSelection={false}
      />
    </div>
  );
};

export default Reconciliation;
