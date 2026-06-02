import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message, Spin } from "antd";
import { useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { useFilters } from "../../context/FilterContext";
import reportingApi from "../../services/reportingApi";
import {
  buildMembershipListingRequest,
  subscribeMembershipListingReportReload,
} from "../../utils/membershipListingReportWorkspace";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const formatDate = (value) =>
  value ? dayjs.utc(value).local().format("DD/MM/YYYY") : "—";

function mapListingRow(row, index) {
  const id = row.subscriptionId || row.id || `listing-${index}`;
  return {
    key: id,
    id,
    fullName: row.fullName || "—",
    membershipNo: row.membershipNo || "—",
    membershipCategory: row.membershipCategory || "—",
    grade: row.grade || "—",
    workLocation: row.workLocation || "—",
    branch: row.branch || "—",
    region: row.region || "—",
    section: row.section || "—",
    startDate: row.startDate,
    expiryDate: row.expiryDate,
    cancelledAt: row.cancelledAt,
    resignedAt: row.resignedAt,
    processedAt: row.processedAt,
    membershipStatus: row.membershipStatus || "—",
    subscriptionYear: row.subscriptionYear ?? "—",
    isCurrent:
      row.isCurrent === true ? "Yes" : row.isCurrent === false ? "No" : "—",
  };
}

export default function MembershipListingReport() {
  const { filtersState } = useFilters();

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchListing = useCallback(async () => {
    setLoading(true);
    try {
      const body = buildMembershipListingRequest(filtersState, {
        offset: 0,
        limit: 500,
      });
      const data = await reportingApi.getMembershipListing(body);
      const rawRows = Array.isArray(data?.rows) ? data.rows : [];
      setRows(rawRows.map(mapListingRow));
    } catch (error) {
      console.error("Membership listing report:", error);
      message.error(error?.message || "Failed to load membership listing");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filtersState]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    fetchListing();
  }, [
    activeTemplateId,
    fetchListing,
    isInitialized,
    templatesLoading,
  ]);

  useEffect(() => {
    return subscribeMembershipListingReportReload(() => {
      fetchListing();
    });
  }, [fetchListing]);

  const tableData = useMemo(() => rows, [rows]);

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
    <div style={{ width: "100%" }}>
      <TableComponent
        data={tableData}
        isGrideLoading={loading}
        screenName="MembershipListingReport"
      />
    </div>
  );
}
