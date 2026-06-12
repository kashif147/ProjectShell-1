import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message, Spin } from "antd";
import { useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { useFilters } from "../../context/FilterContext";
import {
  registerReportExport,
  unregisterReportExport,
} from "../../utils/reportExportBridge";
import { useTableColumns } from "../../context/TableColumnsContext ";
import reportingApi from "../../services/reportingApi";
import {
  buildDebtorsListRequest,
  formatDebtorsReportPeriodLabel,
  subscribeDebtorsListReportReload,
} from "../../utils/debtorsListReportWorkspace";
import {
  clearReportGridSearchQuery,
  filterRowsByMembershipNoOrName,
  getReportGridSearchQuery,
  subscribeReportGridSearch,
} from "../../utils/reportGridSearchBridge";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { useDebouncedReportFetch } from "../../hooks/useDebouncedReportFetch";
import "../../styles/MembershipReportPrint.css";

const REPORT_TITLE = "Debtors List Report";

function mapDebtorRow(row, index) {
  const id = row.id || row.memberId || `debtor-${index}`;
  return {
    key: id,
    id,
    membershipNo: row.membershipNo || "—",
    fullName: row.fullName || "—",
    fullAddress: row.fullAddress || "—",
    grade: row.grade || "—",
    workLocation: row.workLocation || "—",
    amount: row.amount ?? null,
    current: row.current ?? null,
    days30: row.days30 ?? null,
    days60: row.days60 ?? null,
    days90: row.days90 ?? null,
    over90: row.over90 ?? null,
  };
}

export default function DebtorsListReport() {
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const screenCols = columns.DebtorsListReport || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [sourceRows, setSourceRows] = useState([]);
  const [reportMeta, setReportMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() =>
    getReportGridSearchQuery(),
  );

  const filtersStateRef = useRef(filtersState);
  filtersStateRef.current = filtersState;

  const filteredRows = useMemo(
    () => applyClientSideRowFilters(sourceRows, filtersState, screenCols),
    [sourceRows, filtersState, screenCols],
  );

  const displayRows = useMemo(
    () => filterRowsByMembershipNoOrName(filteredRows, searchQuery),
    [filteredRows, searchQuery],
  );

  useRegisterGridFilterRows("DebtorsListReport", sourceRows, screenCols);

  const fetchReport = useCallback(async ({ isStale } = {}) => {
    setLoading(true);
    try {
      const body = buildDebtorsListRequest(filtersStateRef.current, {
        offset: 0,
        limit: 5000,
        search: getReportGridSearchQuery(),
      });
      const data = await reportingApi.getDebtorsList(body);
      if (isStale?.()) return;
      const rawRows = Array.isArray(data?.rows) ? data.rows : [];
      setSourceRows(rawRows.map(mapDebtorRow));
      setReportMeta({
        asOfDate: data?.asOfDate,
      });
    } catch (error) {
      if (isStale?.()) return;
      console.error("Debtors list report:", error);
      message.error(error?.message || "Failed to load debtors list");
      setSourceRows([]);
      setReportMeta(null);
    } finally {
      if (!isStale?.()) setLoading(false);
    }
  }, []);

  const reportReady = isInitialized && !templatesLoading;
  const { reloadNow } = useDebouncedReportFetch({
    enabled: reportReady,
    fetchFn: fetchReport,
    deps: [activeTemplateId],
    debounceMs: 450,
  });

  useEffect(() => {
    return subscribeDebtorsListReportReload(reloadNow);
  }, [reloadNow]);

  useEffect(() => subscribeReportGridSearch(setSearchQuery), []);

  useEffect(() => {
    return () => clearReportGridSearchQuery();
  }, []);

  const periodSummary = formatDebtorsReportPeriodLabel(
    filtersState,
    reportMeta || {},
  );

  useEffect(() => {
    registerReportExport({
      reportTitle: REPORT_TITLE,
      getPayload: () => ({
        reportTitle: periodSummary
          ? `${REPORT_TITLE} — ${periodSummary}`
          : REPORT_TITLE,
        data: displayRows,
        screenCols,
        filtersState,
        disabled: loading,
      }),
    });
    return () => unregisterReportExport();
  }, [displayRows, screenCols, filtersState, loading, periodSummary]);

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
    <div className="debtors-list-report" style={{ width: "100%" }}>
      {periodSummary ? (
        <p
          className="no-print"
          style={{ margin: "0 0 8px 0", color: "#595959", fontSize: 13 }}
        >
          Balances as at: {periodSummary}
        </p>
      ) : null}
      <TableComponent
        data={displayRows}
        isGrideLoading={loading}
        screenName="DebtorsListReport"
        enableRowSelection={false}
        hideLegacyRowChrome
        disableDefaultRowClick
      />
    </div>
  );
}
