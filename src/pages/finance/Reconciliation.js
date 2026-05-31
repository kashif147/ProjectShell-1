import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Modal, notification, Space, Spin } from "antd";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { resolveCentsAmountEuro } from "../../utils/financeAmount";
import reconciliationWorkspace, {
  subscribeReconciliationReload,
} from "../../utils/reconciliationWorkspace";
import { financeLedgerActionIcon } from "../../component/finanace/financeActionIcons";
import ReconciliationClearingTabBar from "../../component/finanace/ReconciliationClearingPillCard";
import { CLEARING_ACCOUNT_OPTIONS } from "../../constants/reconciliation";

const CLEARING_CODES = CLEARING_ACCOUNT_OPTIONS.filter(
  (o) => o.value !== "all",
).map((o) => o.value);

function getSelectedClearingAccount(filtersState) {
  const vals = filtersState["Clearing Account"]?.selectedValues || [];
  const code = String(vals[0] || "").trim();
  return code || "all";
}

function mapReconciliationRow(item) {
  const bankRef =
    item.bankRef || item.externalReference || item.glDocNo || "";
  return {
    ...item,
    key: item._id,
    bankRef,
    amountEuro: resolveCentsAmountEuro(item, "amount"),
    expectedAmountEuro: resolveCentsAmountEuro(item, "expectedAmount"),
    amountDifferenceEuro: resolveCentsAmountEuro(item, "amountDifference"),
    reconciliationStatus: item.reconciliationStatus || "unmatched",
  };
}

const Reconciliation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtersState, updateFilterValues } = useFilters();
  const { columns } = useTableColumns();
  const reconciliationColumns = columns.Reconciliation || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [filterSourceRows, setFilterSourceRows] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const urlFiltersAppliedRef = useRef(false);

  const clearingCode = getSelectedClearingAccount(filtersState);
  const bankRefFilter = String(
    filtersState["Bank ref"]?.selectedValues?.[0] || "",
  ).trim();

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
          params: { limit: 500 },
        },
      );
      const payload = res.data?.data ?? res.data;
      const items = payload?.items || [];
      setFilterSourceRows(items.map(mapReconciliationRow));
      reconciliationWorkspace.setSupportedClearing(
        payload?.supportedClearingAccounts ||
          reconciliationWorkspace.getSupportedClearing(),
      );
    } catch (error) {
      notification.error({
        message: "Could not load reconciliation records",
        description: error?.response?.data?.message || error.message,
      });
      setFilterSourceRows([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, loadDashboard]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    load();
  }, [activeTemplateId, isInitialized, load, templatesLoading]);

  useEffect(() => subscribeReconciliationReload(load), [load]);

  useEffect(() => {
    if (!isInitialized || urlFiltersAppliedRef.current) return;
    const ref = String(searchParams.get("ref") || "").trim();
    const clearing = String(searchParams.get("clearing") || "").trim();
    const status = String(searchParams.get("status") || "").trim();
    if (!ref && !clearing && !status) return;

    if (ref) {
      updateFilterValues("Bank ref", [ref]);
    }
    if (clearing && clearing !== "all") {
      updateFilterValues("Clearing Account", [clearing]);
    }
    if (status) {
      updateFilterValues("Rec Status", [status]);
    }

    urlFiltersAppliedRef.current = true;
    if (ref || clearing || status) {
      setSearchParams({}, { replace: true });
    }
  }, [
    isInitialized,
    searchParams,
    setSearchParams,
    updateFilterValues,
  ]);

  const rows = useMemo(
    () =>
      applyClientSideRowFilters(
        filterSourceRows,
        filtersState,
        reconciliationColumns,
      ).map((row) => ({
        ...row,
        highlight: bankRefFilter
          ? String(row.bankRef || "").includes(bankRefFilter)
          : false,
      })),
    [bankRefFilter, filterSourceRows, filtersState, reconciliationColumns],
  );

  useRegisterGridFilterRows(
    "Reconciliation",
    filterSourceRows,
    reconciliationColumns,
  );

  const summary = useMemo(() => {
    const counts = {
      unmatched: 0,
      auto_matched: 0,
      manual_matched: 0,
      suspense: 0,
      settled: 0,
    };
    let pendingAmount = 0;
    for (const r of rows) {
      const st = r.reconciliationStatus || "unmatched";
      if (counts[st] != null) counts[st] += 1;
      if (st !== "settled") pendingAmount += Number(r.amount) || 0;
    }
    return { counts, pendingAmount, total: rows.length };
  }, [rows]);

  const seed = useCallback(async () => {
    const codes =
      clearingCode === "all" ? CLEARING_CODES : [clearingCode];
    let totalCreated = 0;
    for (const code of codes) {
      const res = await axios.post(
        `${getAccountServiceBaseUrl()}/finance/reconciliation/seed`,
        { clearingAccountCode: code },
        { headers: authHeaders() },
      );
      const payload = res.data?.data ?? res.data;
      totalCreated += payload?.created ?? 0;
    }
    notification.success({
      message: `Seeded ${totalCreated} record(s) from pending GL`,
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

  const bulkSettle = useCallback(
    async (recordIds) => {
      const ids = (recordIds || []).filter(Boolean);
      if (!ids.length) return;
      try {
        for (const recordId of ids) {
          await axios.post(
            `${getAccountServiceBaseUrl()}/finance/reconciliation/${recordId}/settle`,
            {},
            { headers: authHeaders() },
          );
        }
        notification.success({
          message: `Marked ${ids.length} record(s) settled`,
        });
        setSelectedRowKeys([]);
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

  const bulkMoveSuspense = useCallback(
    (recordIds) => {
      const ids = (recordIds || []).filter(Boolean);
      if (!ids.length) return;
      let reason = "";
      Modal.confirm({
        title:
          ids.length > 1
            ? `Move ${ids.length} records to suspense`
            : "Move to suspense",
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
          for (const recordId of ids) {
            await axios.post(
              `${getAccountServiceBaseUrl()}/finance/reconciliation/suspense`,
              {
                recordId,
                suspenseReason: reason || "Manual suspense",
              },
              { headers: authHeaders() },
            );
          }
          notification.success({
            message: `Moved ${ids.length} record(s) to suspense`,
          });
          setSelectedRowKeys([]);
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

  const bulkManualMatch = useCallback(
    (recordIds) => {
      const ids = (recordIds || []).filter(Boolean);
      if (!ids.length) return;
      let glDocNo = "";
      Modal.confirm({
        title:
          ids.length > 1
            ? `Match ${ids.length} records`
            : "Manual match",
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
          try {
            for (const recordId of ids) {
              await axios.post(
                `${getAccountServiceBaseUrl()}/finance/reconciliation/match`,
                { recordId, matchedGlDocNo: glDocNo.trim() },
                { headers: authHeaders() },
              );
            }
            notification.success({
              message: `Matched ${ids.length} record(s)`,
            });
            setSelectedRowKeys([]);
            await load();
          } catch (error) {
            notification.error({
              message: "Match failed",
              description: error?.response?.data?.message || error.message,
            });
          }
        },
      });
    },
    [authHeaders, load],
  );

  const autoMatch = useCallback(async () => {
    try {
      const res = await axios.post(
        `${getAccountServiceBaseUrl()}/finance/reconciliation/auto-match`,
        {
          clearingAccountCode: clearingCode === "all" ? "all" : clearingCode,
          apply: true,
        },
        { headers: authHeaders() },
      );
      const payload = res.data?.data ?? res.data;
      notification.success({
        message: `Auto-matched ${payload?.matched ?? 0} record(s)`,
      });
      await load();
    } catch (error) {
      notification.error({
        message: "Auto-match failed",
        description: error?.response?.data?.message || error.message,
      });
    }
  }, [authHeaders, clearingCode, load]);

  const parseImportLines = (text) => {
    const lines = [];
    for (const raw of String(text || "").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const [refPart, amountPart] = line.split(/[,;\t]/).map((s) => s.trim());
      if (!refPart || !amountPart) continue;
      const euro = Number(amountPart.replace(/[€£$]/g, ""));
      if (!Number.isFinite(euro) || euro <= 0) continue;
      lines.push({
        externalReference: refPart,
        amount: Math.round(euro * 100),
      });
    }
    return lines;
  };

  const importBank = useCallback(
    async (text) => {
      const lines = parseImportLines(text);
      if (!lines.length) {
        notification.warning({ message: "No valid import lines found" });
        return;
      }
      if (clearingCode === "all") {
        notification.warning({
          message: "Select a clearing account before importing bank lines",
        });
        return;
      }
      const res = await axios.post(
        `${getAccountServiceBaseUrl()}/finance/reconciliation/import`,
        {
          clearingAccountCode: clearingCode,
          lines,
        },
        { headers: authHeaders() },
      );
      const payload = res.data?.data ?? res.data;
      notification.success({
        message: `Imported ${payload?.created ?? 0} bank line(s)`,
        description: payload?.skipped
          ? `${payload.skipped} line(s) skipped`
          : undefined,
      });
      await load();
    },
    [authHeaders, clearingCode, load],
  );

  useEffect(() => {
    reconciliationWorkspace.registerHandlers({
      seed,
      settle,
      moveSuspense,
      manualMatch,
      autoMatch,
      importBank,
    });
    return () => reconciliationWorkspace.clearHandlers();
  }, [seed, settle, moveSuspense, manualMatch, autoMatch, importBank]);

  const setClearingFilter = useCallback(
    (code) => {
      if (!code || code === "all") {
        updateFilterValues("Clearing Account", []);
        return;
      }
      updateFilterValues("Clearing Account", [code]);
    },
    [updateFilterValues],
  );

  const activeAccount = useMemo(() => {
    if (clearingCode === "all") return dashboard?.totals || null;
    return dashboard?.accounts?.find(
      (a) => a.clearingAccountCode === clearingCode,
    );
  }, [dashboard, clearingCode]);

  const showAllTotals = clearingCode === "all" && dashboard?.totals;

  const openAmountCents = activeAccount?.openAmount ?? summary.pendingAmount;
  const openAmountLabel = showAllTotals ? "All open" : "Account open";
  const unmatchedCount = summary.counts.unmatched;
  const suspenseCount = summary.counts.suspense;

  if (!isInitialized || templatesLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "50px",
        }}
      >
        <Spin tip="Initializing Template...">
          <div style={{ minHeight: 200, width: "100%" }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: 0 }}>
      <div style={{ padding: "0 34px", boxSizing: "border-box" }}>
        <ReconciliationClearingTabBar
          clearingCode={clearingCode}
          dashboard={dashboard}
          onSelect={setClearingFilter}
          summaryOnly={!dashboard?.accounts?.length}
          summary={{
            openAmountLabel,
            openAmountCents,
            unmatchedCount,
            autoMatched: summary.counts.auto_matched,
            manualMatched: summary.counts.manual_matched,
            suspenseCount,
            settled: summary.counts.settled,
            filterTotal: summary.total,
          }}
        />
      </div>
      {bankRefFilter ? (
        <div
          style={{
            padding: "0 34px 6px",
            fontSize: 12,
            fontWeight: 600,
            color: "#215E97",
          }}
        >
          Bank ref filter: {bankRefFilter}
        </div>
      ) : null}
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="Reconciliation"
        hideLegacyRowChrome
        rowActionsInGridmenu
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={(keys) => setSelectedRowKeys(keys)}
        disableRowFn={(record) => record.reconciliationStatus === "settled"}
        selectionToolbar={
          selectedRowKeys.length > 0 ? (
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  background: "#f0f0f0",
                  borderRadius: 4,
                }}
              >
                Selected {selectedRowKeys.length} item(s)
              </span>
              <Space size="small">
                <Button
                  size="small"
                  icon={financeLedgerActionIcon("match")}
                  onClick={() => bulkManualMatch(selectedRowKeys)}
                >
                  Match
                </Button>
                <Button
                  size="small"
                  icon={financeLedgerActionIcon("suspense")}
                  onClick={() => bulkMoveSuspense(selectedRowKeys)}
                >
                  Suspense
                </Button>
                <Button
                  size="small"
                  icon={financeLedgerActionIcon("settle")}
                  onClick={() => bulkSettle(selectedRowKeys)}
                >
                  Settle
                </Button>
                <Button
                  size="small"
                  type="link"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Clear
                </Button>
              </Space>
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default Reconciliation;
