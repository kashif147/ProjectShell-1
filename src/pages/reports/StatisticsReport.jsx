import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Spin } from "antd";
import { message } from "antd";
import { useAuthorization } from "../../context/AuthorizationContext";
import { useSelector } from "react-redux";
import { useFilters } from "../../context/FilterContext";
import {
  registerReportExport,
  unregisterReportExport,
} from "../../utils/reportExportBridge";
import reportingApi from "../../services/reportingApi";
import { fetchTenantRecord } from "../../services/tenantBrandingService";
import {
  buildMembershipStatisticsRequest,
  statisticsRequestHasActiveFilters,
  subscribeMembershipStatisticsReportReload,
} from "../../utils/membershipStatisticsReportWorkspace";
import { useDebouncedReportFetch } from "../../hooks/useDebouncedReportFetch";
import { parseMembershipCategoryOptionLabels } from "../membership/executive/executiveDashboardUtils";
import StatisticsReportHeader from "./StatisticsReportHeader";
import StatisticsReportTables from "./StatisticsReportTables";
import {
  buildReportMeta,
  filterEmptyCategoryRows,
  filterEmptyLocationHierarchy,
  flattenLocationGroupsForExport,
  normalizeStatisticsCategoryRow,
  sortStatisticsLocationHierarchy,
  sortStatisticsRows,
  STATISTICS_REPORT_TITLE,
} from "./statisticsReportUtils";
import {
  buildStatisticsExportSnapshot,
} from "./statisticsReportExport";
import {
  buildSampleStatisticsReport,
  withSampleStatisticsReportIfEmpty,
} from "./statisticsReportSampleData";
import "../../styles/MembershipReportPrint.css";
import "./StatisticsReport.css";

const REPORT_TITLE = STATISTICS_REPORT_TITLE;

export default function StatisticsReport() {
  const { user } = useAuthorization();
  const {
    filtersState,
    filterOptions,
    membershipDashboardHeader,
  } = useFilters();

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [organisationName, setOrganisationName] = useState("");

  const includeBreakdown = membershipDashboardHeader.includeBreakdown !== false;
  const includeEmptyRows = membershipDashboardHeader.includeEmptyRows === true;

  const filtersStateRef = useRef(filtersState);
  const headerRef = useRef(membershipDashboardHeader);
  const categoryLabelsRef = useRef([]);
  const ensureSnapshotsOnFirstFetchRef = useRef(true);
  filtersStateRef.current = filtersState;
  headerRef.current = membershipDashboardHeader;

  const categoryLabels = useMemo(
    () =>
      parseMembershipCategoryOptionLabels(
        filterOptions["Membership Category"] || [],
      ),
    [filterOptions],
  );
  categoryLabelsRef.current = categoryLabels;

  const categorySource = useMemo(() => {
    const rows = report?.breakdowns?.byMembershipCategory?.rows || [];
    return sortStatisticsRows(
      rows.map(normalizeStatisticsCategoryRow),
      "name",
    );
  }, [report]);

  const filteredCategoryRows = useMemo(
    () => filterEmptyCategoryRows(categorySource, { includeEmptyRows }),
    [categorySource, includeEmptyRows],
  );

  const locationHierarchy = useMemo(() => {
    const sorted = sortStatisticsLocationHierarchy(report?.breakdowns?.byLocation);
    return filterEmptyLocationHierarchy(sorted, { includeEmptyRows });
  }, [report?.breakdowns?.byLocation, includeEmptyRows]);

  const reportMeta = useMemo(
    () =>
      report
        ? buildReportMeta({
            report,
            filtersState,
            membershipDashboardHeader,
            organisationName,
            operatorUser: user,
          })
        : null,
    [report, filtersState, membershipDashboardHeader, organisationName, user],
  );

  const statisticsSnapshot = useMemo(
    () =>
      report && reportMeta
        ? buildStatisticsExportSnapshot({
            reportMeta,
            categoryRows: filteredCategoryRows,
            locationHierarchy,
            includeBreakdown,
          })
        : null,
    [
      report,
      reportMeta,
      filteredCategoryRows,
      locationHierarchy,
      includeBreakdown,
      includeEmptyRows,
    ],
  );

  const exportRows = useMemo(() => {
    const locationRows = flattenLocationGroupsForExport(
      locationHierarchy?.groups || [],
    ).map((r) => ({ ...r, breakdownGroup: "Location" }));
    return [
      ...filteredCategoryRows.map((r) => ({
        ...r,
        breakdownGroup: "Membership category",
      })),
      ...locationRows,
    ];
  }, [filteredCategoryRows, locationHierarchy]);

  const fetchStatistics = useCallback(async ({ isStale } = {}) => {
    setLoading(true);
    try {
      const ensureSnapshots = ensureSnapshotsOnFirstFetchRef.current;
      if (ensureSnapshots) {
        ensureSnapshotsOnFirstFetchRef.current = false;
      }
      const body = buildMembershipStatisticsRequest(
        filtersStateRef.current,
        headerRef.current,
        categoryLabelsRef.current,
        { ensureSnapshots },
      );
      const data = await reportingApi.getMembershipStatistics(body);
      if (isStale?.()) return;
      setReport(
        withSampleStatisticsReportIfEmpty(data, {
          year: body.year,
          throughMonth: body.throughMonth,
          categoryLabels: categoryLabelsRef.current,
          skipSampleMerge: statisticsRequestHasActiveFilters(
            body,
            headerRef.current,
          ),
        }),
      );
    } catch (error) {
      if (isStale?.()) return;
      console.error("Statistics report:", error);
      const header = headerRef.current;
      const sample = buildSampleStatisticsReport({
        year: header.year,
        throughMonth: header.month,
        categoryLabels: categoryLabelsRef.current,
      });
      setReport(sample);
      message.warning(
        "Reporting service unavailable — showing sample data for preview.",
      );
    } finally {
      if (!isStale?.()) setLoading(false);
    }
  }, []);

  const reportReady = isInitialized && !templatesFetching;
  const { reloadNow } = useDebouncedReportFetch({
    enabled: reportReady,
    fetchFn: fetchStatistics,
    deps: [activeTemplateId],
    debounceMs: 450,
  });

  useEffect(() => {
    return subscribeMembershipStatisticsReportReload(reloadNow);
  }, [reloadNow]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tenant = await fetchTenantRecord();
        if (cancelled) return;
        const org = tenant?.organisationProfile || {};
        const name =
          org.legalName ||
          org.tradingName ||
          tenant?.name ||
          tenant?.tenantName ||
          "";
        if (name) setOrganisationName(name);
      } catch {
        /* optional branding */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    registerReportExport({
      reportTitle: REPORT_TITLE,
      getPayload: () => ({
        exportKind: "statistics",
        reportTitle: REPORT_TITLE,
        statisticsSnapshot,
        data: exportRows,
        screenCols: [],
        filtersState,
        disabled: loading || !statisticsSnapshot,
      }),
    });
    return () => unregisterReportExport();
  }, [exportRows, filtersState, loading, statisticsSnapshot]);

  if (!isInitialized || templatesFetching) {
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
    <div
      id="statistics-report-print-root"
      className="membership-statistics-report statistics-report-print-root"
      style={{ width: "100%", padding: "0 8px 24px" }}
    >
      {loading && !report && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" tip="Loading report…" />
        </div>
      )}

      {report && reportMeta && (
        <>
          {report.isSampleData && (
            <p className="stats-report__sample-note no-print">
              Sample data shown for preview. Live figures appear when reporting
              snapshots and aggregates are available.
            </p>
          )}
          <StatisticsReportHeader meta={reportMeta} />
          <StatisticsReportTables
            categoryRows={filteredCategoryRows}
            locationHierarchy={locationHierarchy}
            includeBreakdown={includeBreakdown}
            period={reportMeta.period}
          />
        </>
      )}

      {!loading && !report && (
        <Alert
          type="info"
          showIcon
          message="No data"
          description="Choose year and month in the toolbar, set filters, then click Filter."
        />
      )}
    </div>
  );
}
