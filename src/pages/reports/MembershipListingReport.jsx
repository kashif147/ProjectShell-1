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
  buildMembershipListingRequest,
  subscribeMembershipListingReportReload,
} from "../../utils/membershipListingReportWorkspace";
import {
  clearReportGridSearchQuery,
  filterRowsByMembershipNoOrName,
  getReportGridSearchQuery,
  subscribeReportGridSearch,
} from "../../utils/reportGridSearchBridge";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "../../styles/MembershipReportPrint.css";

dayjs.extend(utc);

const REPORT_TITLE = "Membership Listing Report";

function mapListingRow(row, index) {
  const id = row.subscriptionId || row.id || `listing-${index}`;
  return {
    key: id,
    id,
    membershipNo: row.membershipNo || "—",
    fullName: row.fullName || "—",
    membershipCategory: row.membershipCategory || "—",
    grade: row.grade || "—",
    workLocation: row.workLocation || "—",
    branch: row.branch || "—",
    region: row.region || "—",
    section: row.section || "—",
    subscriptionYear: row.subscriptionYear ?? "—",
    isCurrent:
      row.isCurrent === true ? "Yes" : row.isCurrent === false ? "No" : "—",
    startDate: row.startDate,
    expiryDate: row.expiryDate,
    cancelledAt: row.cancelledAt,
    resignedAt: row.resignedAt,
    processedAt: row.processedAt,
    renewalDate: row.renewalDate || null,
    paymentDate: row.paymentDate || null,
    membershipStatus: row.membershipStatus || "—",
    membershipMovement: row.membershipMovement || "—",
    paymentType: row.paymentType || "—",
    paymentFrequency: row.paymentFrequency || "—",
    invoiceAmount: row.invoiceAmount ?? null,
    arrearsAmount: row.arrearsAmount ?? null,
    deferredAmount: row.deferredAmount ?? null,
    balance: row.balance ?? null,
  };
}

export default function MembershipListingReport() {
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const screenCols = columns.MembershipListingReport || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [sourceRows, setSourceRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() =>
    getReportGridSearchQuery(),
  );

  /** Live toolbar filters — client-side only until user clicks Filter (reload event). */
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

  useRegisterGridFilterRows(
    "MembershipListingReport",
    sourceRows,
    screenCols,
  );

  const fetchListing = useCallback(async () => {
    setLoading(true);
    try {
      const body = buildMembershipListingRequest(filtersStateRef.current, {
        offset: 0,
        limit: 5000,
        search: getReportGridSearchQuery(),
      });
      const data = await reportingApi.getMembershipListing(body);
      const rawRows = Array.isArray(data?.rows) ? data.rows : [];
      setSourceRows(rawRows.map(mapListingRow));
    } catch (error) {
      console.error("Membership listing report:", error);
      message.error(error?.message || "Failed to load membership listing");
      setSourceRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    fetchListing();
  }, [activeTemplateId, fetchListing, isInitialized, templatesLoading]);

  useEffect(() => {
    return subscribeMembershipListingReportReload(() => {
      fetchListing();
    });
  }, [fetchListing]);

  useEffect(() => subscribeReportGridSearch(setSearchQuery), []);

  useEffect(() => {
    return () => clearReportGridSearchQuery();
  }, []);

  useEffect(() => {
    registerReportExport({
      reportTitle: REPORT_TITLE,
      getPayload: () => ({
        reportTitle: REPORT_TITLE,
        data: displayRows,
        screenCols,
        filtersState,
        disabled: loading,
      }),
    });
    return () => unregisterReportExport();
  }, [displayRows, screenCols, filtersState, loading]);

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
    <div className="membership-listing-report" style={{ width: "100%" }}>
      <TableComponent
        data={displayRows}
        isGrideLoading={loading}
        screenName="MembershipListingReport"
        enableRowSelection={false}
        hideLegacyRowChrome
        disableDefaultRowClick
      />
    </div>
  );
}
