import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, message, Space, Spin } from "antd";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import {
  buildCreditNoteApiParams,
  clearCreditNoteListActions,
  registerCreditNoteListActions,
  subscribeCreditNotesReload,
} from "../../utils/creditNotesWorkspace";
import { resolveCreditNoteAmountEuro } from "../../utils/creditNoteAmount";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";

const CreditNotesSummary = () => {
  const location = useLocation();
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const creditNoteColumns = columns.CreditNotes || [];
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const filterMemberId = String(location.state?.memberId || "").trim();

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [rows, setRows] = useState([]);
  const [filterSourceRows, setFilterSourceRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCreditNotes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = buildCreditNoteApiParams(filtersState, {
        memberIdFromNav: filterMemberId,
      });
      const response = await axios.get(
        `${getAccountServiceBaseUrl()}/journal/credit-notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params,
        },
      );

      const payload = response?.data?.data ?? response?.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const mappedRows = items.map((item, index) => {
        const docNo = item?.docNo || "";
        return {
          key: item?._id || docNo || `credit-note-${index}`,
          _id: item?._id,
          docNo,
          invoiceDocNo: item?.invoiceDocNo || "—",
          memberId: item?.memberId || "",
          amount: item?.amount ?? "-",
          amountEuro: resolveCreditNoteAmountEuro(item),
          status: item?.status || "—",
          effectiveDate: item?.effectiveDate || item?.date || null,
          reason: item?.reason || "",
          createdBy: item?.createdBy || "System",
          createdAt: item?.createdAt || null,
          highlight:
            Boolean(highlightDocNo) && String(docNo).trim() === highlightDocNo,
        };
      });

      setFilterSourceRows(mappedRows);
      setRows(
        applyClientSideRowFilters(mappedRows, filtersState, creditNoteColumns),
      );
    } catch (error) {
      console.error("Failed to fetch credit notes:", error);
      message.error("Failed to load credit notes");
      setFilterSourceRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [creditNoteColumns, filterMemberId, filtersState, highlightDocNo]);

  const approveCreditNote = useCallback(
    async (docNo) => {
      const ref = String(docNo || "").trim();
      if (!ref) return;
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${getAccountServiceBaseUrl()}/journal/credit-notes/${encodeURIComponent(ref)}/approve`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        message.success(`Credit note ${ref} approved`);
        await fetchCreditNotes();
      } catch (error) {
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not approve credit note",
        );
      }
    },
    [fetchCreditNotes],
  );

  const cancelCreditNote = useCallback(
    async (docNo) => {
      const ref = String(docNo || "").trim();
      if (!ref) return;
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${getAccountServiceBaseUrl()}/journal/credit-notes/${encodeURIComponent(ref)}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        message.success(`Credit note ${ref} cancelled`);
        await fetchCreditNotes();
      } catch (error) {
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not cancel credit note",
        );
      }
    },
    [fetchCreditNotes],
  );

  useEffect(() => {
    registerCreditNoteListActions({
      onApprove: approveCreditNote,
      onCancel: cancelCreditNote,
    });
    return () => clearCreditNoteListActions();
  }, [approveCreditNote, cancelCreditNote]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    fetchCreditNotes();
  }, [
    activeTemplateId,
    fetchCreditNotes,
    isInitialized,
    templatesLoading,
  ]);

  useEffect(() => {
    return subscribeCreditNotesReload(() => {
      fetchCreditNotes();
    });
  }, [fetchCreditNotes]);

  const memberBanner = useMemo(() => {
    if (!filterMemberId) return null;
    return (
      <Alert
        type="info"
        showIcon
        banner
        style={{ marginBottom: 8 }}
        message={
          <Space wrap>
            <span>
              Showing credit notes for member <strong>{filterMemberId}</strong>
            </span>
            <Link
              to="/Details"
              state={{ memberId: filterMemberId, activeTab: "2" }}
            >
              Open member finance
            </Link>
          </Space>
        }
      />
    );
  }, [filterMemberId]);

  useRegisterGridFilterRows("CreditNotes", filterSourceRows, creditNoteColumns);

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
    <div style={{ width: "100%", padding: "0" }}>
      {memberBanner}
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="CreditNotes"
      />
    </div>
  );
};

export default CreditNotesSummary;
