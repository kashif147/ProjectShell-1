import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, notification, Spin } from "antd";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import {
  getProfileServiceApiBase,
  searchProfilesByQuery,
} from "../../services/profileSearchApi";
import TableComponent from "../../component/common/TableComponent";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { resolveCentsAmountEuro } from "../../utils/financeAmount";
import {
  subscribeGeneralLedgerReload,
} from "../../utils/generalLedgerWorkspace";

function profileDisplayName(p) {
  if (!p) return "";
  const n = `${p.personalInfo?.forename || ""} ${p.personalInfo?.surname || ""}`.trim();
  return n || String(p.fullName || "").trim() || "";
}

const GeneralLedger = () => {
  const location = useLocation();
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const filterMemberId = String(location.state?.memberId || "").trim();

  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const glColumns = columns.GeneralLedger || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memberEnrichment, setMemberEnrichment] = useState({});
  const [meta, setMeta] = useState({
    totalRows: 0,
    totalGlDocuments: 0,
    truncated: false,
  });

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { maxDocuments: 15000, includeDrafts: true };
      if (filterMemberId) params.memberId = filterMemberId;
      const res = await axios.get(
        `${getAccountServiceBaseUrl()}/reports/general-ledger`,
        { headers: authHeaders(), params },
      );
      const payload = res.data?.data ?? res.data;
      setItems(payload?.items || []);
      setMeta({
        totalRows: payload?.totalRows ?? payload?.items?.length ?? 0,
        totalGlDocuments: payload?.totalGlDocuments ?? 0,
        truncated: Boolean(payload?.truncated),
      });
    } catch (error) {
      notification.error({
        message: "Could not load general ledger",
        description: error?.response?.data?.message || error.message,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, filterMemberId]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    load();
  }, [activeTemplateId, isInitialized, load, templatesLoading]);

  useEffect(() => subscribeGeneralLedgerReload(load), [load]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!getProfileServiceApiBase() || !items.length) return;
      const ids = [
        ...new Set(
          items
            .map((i) => String(i.memberId || "").trim())
            .filter((m) => m.length >= 2),
        ),
      ];
      if (!ids.length) return;
      const updates = {};
      await Promise.all(
        ids.map(async (memberNo) => {
          try {
            const results = await searchProfilesByQuery(memberNo);
            const lower = memberNo.toLowerCase();
            const exact =
              results.find(
                (r) =>
                  String(r.membershipNumber || "").trim().toLowerCase() ===
                  lower,
              ) || results[0];
            if (exact) {
              updates[memberNo] = {
                memberDisplayName: profileDisplayName(exact),
                memberProfileId: exact._id,
              };
            }
          } catch {
            /* ignore */
          }
        }),
      );
      if (!cancelled && Object.keys(updates).length) {
        setMemberEnrichment((prev) => ({ ...prev, ...updates }));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const filterSourceRows = useMemo(
    () =>
      items.map((row, index) => {
        const mid = String(row.memberId || "").trim();
        const enriched = mid ? memberEnrichment[mid] : null;
        const docNo = row.docNo || "";
        return {
          ...row,
          key: row._id || `${docNo}-${mid}-${index}`,
          memberDisplayName: enriched?.memberDisplayName || "",
          memberProfileId: enriched?.memberProfileId || "",
          debitEuro: resolveCentsAmountEuro(row, "debit"),
          creditEuro: resolveCentsAmountEuro(row, "credit"),
          highlight:
            Boolean(highlightDocNo) &&
            String(docNo).trim() === highlightDocNo,
        };
      }),
    [items, memberEnrichment, highlightDocNo],
  );

  const rows = useMemo(
    () =>
      applyClientSideRowFilters(filterSourceRows, filtersState, glColumns),
    [filterSourceRows, filtersState, glColumns],
  );

  useRegisterGridFilterRows("GeneralLedger", filterSourceRows, glColumns);

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
      {meta.truncated ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 8 }}
          message="Partial general ledger load"
          description={`Showing ${meta.totalRows} rows from the most recent ${meta.totalGlDocuments} GL documents. Filter by member or date, or raise maxDocuments if more history is required.`}
        />
      ) : null}
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="GeneralLedger"
        enableRowSelection={false}
      />
    </div>
  );
};

export default GeneralLedger;
