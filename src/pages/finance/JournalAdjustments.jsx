import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notification, Spin } from "antd";
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
import {
  registerJournalAdjustmentApprove,
  clearJournalAdjustmentApprove,
  subscribeJournalAdjustmentsReload,
} from "../../utils/journalAdjustmentsWorkspace";

function profileDisplayName(p) {
  if (!p) return "";
  const n = `${p.personalInfo?.forename || ""} ${p.personalInfo?.surname || ""}`.trim();
  return n || String(p.fullName || "").trim() || "";
}

const JournalAdjustments = () => {
  const location = useLocation();
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const journalColumns = columns.JournalAdjustments || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [items, setItems] = useState([]);
  const [filterSourceItems, setFilterSourceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memberEnrichment, setMemberEnrichment] = useState({});

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${getAccountServiceBaseUrl()}/finance/journal-adjustments`,
        { headers: authHeaders(), params: { limit: 500 } },
      );
      const payload = res.data?.data ?? res.data;
      const rawItems = payload?.items || [];
      const mappedRows = rawItems.map((row, index) => {
        const docNo = row.docNo || "";
        return {
          ...row,
          key: docNo || `journal-adjustment-${index}`,
          highlight:
            Boolean(highlightDocNo) &&
            String(docNo).trim() === highlightDocNo,
        };
      });
      setFilterSourceItems(mappedRows);
      setItems(
        applyClientSideRowFilters(mappedRows, filtersState, journalColumns),
      );
    } catch (error) {
      notification.error({
        message: "Could not load journal adjustments",
        description: error?.response?.data?.message || error.message,
      });
      setFilterSourceItems([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, filtersState, highlightDocNo, journalColumns]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    load();
  }, [activeTemplateId, isInitialized, load, templatesLoading]);

  useEffect(() => subscribeJournalAdjustmentsReload(load), [load]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!getProfileServiceApiBase() || !items.length) return;
      const need = items.filter(
        (i) => i.memberId && !(i.memberProfileId || i.memberName),
      );
      const ids = [
        ...new Set(
          need.map((i) => String(i.memberId).trim()).filter((m) => m.length >= 2),
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
                  String(r.membershipNumber || "").trim().toLowerCase() === lower,
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

  const approve = useCallback(
    async (docNo) => {
      try {
        await axios.post(
          `${getAccountServiceBaseUrl()}/finance/journal-adjustments/${encodeURIComponent(docNo)}/approve`,
          {},
          { headers: authHeaders() },
        );
        notification.success({ message: `Approved ${docNo}` });
        await load();
      } catch (error) {
        notification.error({
          message: "Approve failed",
          description: error?.response?.data?.message || error.message,
        });
      }
    },
    [authHeaders, load],
  );

  useEffect(() => {
    registerJournalAdjustmentApprove(approve);
    return () => clearJournalAdjustmentApprove();
  }, [approve]);

  const rows = useMemo(
    () =>
      items.map((row) => {
        const mid = String(row.memberId || "").trim();
        const enriched = mid ? memberEnrichment[mid] : null;
        return {
          ...row,
          memberDisplayName: row.memberName || enriched?.memberDisplayName || "",
          memberProfileId: row.memberProfileId || enriched?.memberProfileId || "",
        };
      }),
    [items, memberEnrichment],
  );

  useRegisterGridFilterRows(
    "JournalAdjustments",
    filterSourceItems,
    journalColumns,
  );

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
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="JournalAdjustments"
        enableRowSelection={false}
      />
    </div>
  );
};

export default JournalAdjustments;
