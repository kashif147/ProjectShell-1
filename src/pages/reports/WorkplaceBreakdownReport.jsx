import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Spin, message } from "antd";
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
  buildWorkplaceBreakdownRequest,
  consumeWorkplaceBreakdownEnsureSnapshots,
  subscribeWorkplaceBreakdownReportReload,
  WORKPLACE_BREAKDOWN_REPORT_TITLE,
} from "../../utils/workplaceBreakdownReportWorkspace";
import { useDebouncedReportFetch } from "../../hooks/useDebouncedReportFetch";
import WorkplaceBreakdownReportHeader from "./WorkplaceBreakdownReportHeader";
import WorkplaceBreakdownSummary from "./WorkplaceBreakdownSummary";
import WorkplaceBreakdownCharts from "./WorkplaceBreakdownCharts";
import WorkplaceBreakdownOfficialSummary from "./WorkplaceBreakdownOfficialSummary";
import WorkplaceBreakdownReportTables from "./WorkplaceBreakdownReportTables";
import {
  applyClientWorkplaceFilters,
  buildWorkplaceBreakdownReportMeta,
  filterEmptyWorkplaceRows,
} from "./workplaceBreakdownReportUtils";
import {
  buildOfficialSummaryFromRegions,
  buildTrendSeriesFromRegions,
} from "./workplaceBreakdownReportAggregations";
import { buildWorkplaceBreakdownExportSnapshot } from "./workplaceBreakdownReportExport";
import "../../styles/MembershipReportPrint.css";
import "./WorkplaceBreakdownReport.css";

const REPORT_TITLE = WORKPLACE_BREAKDOWN_REPORT_TITLE;

export default function WorkplaceBreakdownReport() {
  const { user } = useAuthorization();
  const { filtersState, membershipDashboardHeader } = useFilters();

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { templatesFetching } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [organisationName, setOrganisationName] = useState("");

  const includeEmptyRows = membershipDashboardHeader.includeEmptyRows === true;

  const filtersStateRef = useRef(filtersState);
  const headerRef = useRef(membershipDashboardHeader);
  const userRef = useRef(user);
  filtersStateRef.current = filtersState;
  headerRef.current = membershipDashboardHeader;
  userRef.current = user;

  const displayRegions = useMemo(() => {
    if (!report?.regions) return [];
    let regions = report.regions.map((section) => ({
      ...section,
      rows: filterEmptyWorkplaceRows(section.rows, { includeEmptyRows }),
    }));
    regions = applyClientWorkplaceFilters(regions, filtersState);
    return regions.filter((section) => section.rows?.length);
  }, [report, filtersState, includeEmptyRows]);

  const officialSummary = useMemo(() => {
    if (report?.officialSummary?.length) return report.officialSummary;
    return buildOfficialSummaryFromRegions(displayRegions);
  }, [report?.officialSummary, displayRegions]);

  const trendSeries = useMemo(() => {
    if (report?.trendSeries) return report.trendSeries;
    if (!displayRegions.length || !report?.period?.columns?.length) return null;
    return buildTrendSeriesFromRegions(displayRegions, report.period.columns);
  }, [report?.trendSeries, report?.period?.columns, displayRegions]);

  const reportMeta = useMemo(
    () =>
      report
        ? buildWorkplaceBreakdownReportMeta({
            report,
            filtersState,
            membershipDashboardHeader,
            organisationName,
            operatorUser: user,
          })
        : null,
    [report, filtersState, membershipDashboardHeader, organisationName, user],
  );

  const exportSnapshot = useMemo(
    () =>
      report && reportMeta
        ? buildWorkplaceBreakdownExportSnapshot({
            reportMeta,
            regions: displayRegions,
            officialSummary,
            trendSeries,
            periodColumns: report.period?.columns || [],
            momColumnLabel: report.period?.momColumn?.label || "MoM",
            yoyColumnLabel: report.period?.yoyColumn?.label || "YoY",
          })
        : null,
    [report, reportMeta, displayRegions, officialSummary, trendSeries],
  );

  const fetchReport = useCallback(async ({ isStale } = {}) => {
    setLoading(true);
    try {
      const ensureSnapshots = consumeWorkplaceBreakdownEnsureSnapshots();
      const body = buildWorkplaceBreakdownRequest(
        filtersStateRef.current,
        headerRef.current,
        { ensureSnapshots, user: userRef.current },
      );
      const data = await reportingApi.getWorkplaceBreakdown(body);
      if (isStale?.()) return;
      setReport(data);
    } catch (error) {
      if (isStale?.()) return;
      console.error("Workplace breakdown report:", error);
      setReport(null);
      const msg = String(error?.message || "");
      if (msg.includes("504") || /gateway time-out/i.test(msg)) {
        message.error(
          "Report timed out at the gateway. Try fewer rolling months, or run snapshot build separately then Filter again.",
          8,
        );
      } else {
        message.error(msg || "Failed to load workplace breakdown report.");
      }
    } finally {
      if (!isStale?.()) setLoading(false);
    }
  }, []);

  const { reloadNow } = useDebouncedReportFetch({
    enabled: false,
    fetchFn: fetchReport,
    deps: [],
    debounceMs: 450,
  });

  useEffect(() => {
    return subscribeWorkplaceBreakdownReportReload(reloadNow);
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
        exportKind: "workplaceBreakdown",
        reportTitle: REPORT_TITLE,
        workplaceBreakdownSnapshot: exportSnapshot,
        data: [],
        screenCols: [],
        filtersState,
        disabled: loading || !exportSnapshot,
      }),
    });
    return () => unregisterReportExport();
  }, [exportSnapshot, filtersState, loading]);

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
        <Spin size="large" />
        <span style={{ marginLeft: 12 }}>Initializing Template...</span>
      </div>
    );
  }

  const momColumnLabel = report?.period?.momColumn?.label || "MoM";
  const yoyColumnLabel = report?.period?.yoyColumn?.label || "YoY";

  return (
    <div
      id="workplace-breakdown-report-print-root"
      className="workplace-breakdown-report wp-breakdown-report-print-root"
      style={{ width: "100%", padding: "0 8px 24px" }}
    >
      {loading && !report && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 48,
            gap: 12,
          }}
        >
          <Spin size="large" />
          <span>Loading report…</span>
        </div>
      )}

      {report && reportMeta && (
        <>
          {report.notes?.length > 0 && (
            <Alert
              type="info"
              showIcon
              className="no-print"
              style={{ marginBottom: 16 }}
              message={report.notes.join(" ")}
            />
          )}
          <WorkplaceBreakdownReportHeader meta={reportMeta} />
          <WorkplaceBreakdownSummary
            summary={report.summary}
            period={report.period}
          />
          <WorkplaceBreakdownCharts trendSeries={trendSeries} />
          <WorkplaceBreakdownOfficialSummary
            officialSummary={officialSummary}
            momColumnLabel={momColumnLabel}
            yoyColumnLabel={yoyColumnLabel}
          />
          <WorkplaceBreakdownReportTables
            regions={displayRegions}
            periodColumns={report.period?.columns || []}
            momColumnLabel={momColumnLabel}
            yoyColumnLabel={yoyColumnLabel}
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
