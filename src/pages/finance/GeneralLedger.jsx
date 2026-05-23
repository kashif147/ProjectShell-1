import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, notification } from "antd";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import {
  getProfileServiceApiBase,
  searchProfilesByQuery,
} from "../../services/profileSearchApi";
import TableComponent from "../../component/common/TableComponent";

function profileDisplayName(p) {
  if (!p) return "";
  const n = `${p.personalInfo?.forename || ""} ${p.personalInfo?.surname || ""}`.trim();
  return n || String(p.fullName || "").trim() || "";
}

const GeneralLedger = () => {
  const location = useLocation();
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const filterMemberId = String(location.state?.memberId || "").trim();

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
    load();
  }, [load]);

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

  const rows = useMemo(
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
          highlight:
            Boolean(highlightDocNo) &&
            String(docNo).trim() === highlightDocNo,
        };
      }),
    [items, memberEnrichment, highlightDocNo],
  );

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
