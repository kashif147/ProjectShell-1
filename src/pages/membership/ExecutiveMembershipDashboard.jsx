import React, { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Spin } from "antd";
import membershipDashboardAPI from "../../services/membershipDashboardAPI";
import { useFilters } from "../../context/FilterContext";
import ExecutiveKpiStrip from "./executive/ExecutiveKpiStrip";
import ExecutiveMiddleRow from "./executive/ExecutiveMiddleRow";
import ExecutiveAnalyticsPanel from "./executive/ExecutiveAnalyticsPanel";
import ExecutiveComparisonPanel from "./executive/ExecutiveComparisonPanel";
import ExecutiveDashboardSection from "./executive/ExecutiveDashboardSection";
import useExecDashboardPrint from "./executive/useExecDashboardPrint";
import {
  EMPTY_DASHBOARD_DATA,
  normalizeDashboardStats,
  buildMembershipDashboardFilters,
} from "./executive/executiveDashboardUtils";
import "../../styles/ExecutiveDashboard.css";

export default function ExecutiveMembershipDashboard() {
  const {
    membershipDashboardApplyTick,
    membershipDashboardHeader,
    filtersState,
  } = useFilters();
  const filtersStateRef = useRef(filtersState);
  const membershipHeaderRef = useRef(membershipDashboardHeader);
  filtersStateRef.current = filtersState;
  membershipHeaderRef.current = membershipDashboardHeader;

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD_DATA);

  useExecDashboardPrint();

  useEffect(() => {
    document.body.classList.add("exec-membership-dashboard");
    return () => document.body.classList.remove("exec-membership-dashboard");
  }, []);

  const fetchDashboard = useCallback(async (filterPayload = {}) => {
    setLoading(true);
    setFetchError(null);
    try {
      const stats =
        await membershipDashboardAPI.getDashboardStats(filterPayload);
      setDashboardData(normalizeDashboardStats(stats));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setFetchError(error?.message || "Failed to load dashboard");
      setDashboardData(EMPTY_DASHBOARD_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildPayload = useCallback(
    () =>
      buildMembershipDashboardFilters(
        filtersStateRef.current,
        membershipHeaderRef.current,
      ),
    [],
  );

  useEffect(() => {
    fetchDashboard(buildPayload());
  }, [
    fetchDashboard,
    buildPayload,
    membershipDashboardApplyTick,
    membershipDashboardHeader.year,
    membershipDashboardHeader.month,
    membershipDashboardHeader.includeStudents,
    membershipDashboardHeader.includeHonorary,
  ]);

  if (loading && !dashboardData.totalActive && !fetchError) {
    return (
      <div className="exec-dashboard exec-dashboard--loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="exec-dashboard exec-dashboard--printable">
      <div className="exec-dashboard__inner">
        {fetchError ? (
          <Alert
            type="error"
            message={fetchError}
            showIcon
            className="exec-alert"
          />
        ) : null}

        <ExecutiveDashboardSection
          sectionKey="overview"
          title="Overview"
          subtitle="Headline KPIs and summary charts for the selected month"
          defaultOpen
        >
          <ExecutiveKpiStrip data={dashboardData} />
          <ExecutiveMiddleRow data={dashboardData} />
        </ExecutiveDashboardSection>

        <ExecutiveDashboardSection
          sectionKey="comparison"
          title="Membership Comparison"
          subtitle="Same month year-on-year and year-end vs selected month-end"
          defaultOpen
        >
          <ExecutiveComparisonPanel
            refreshToken={membershipDashboardApplyTick}
          />
        </ExecutiveDashboardSection>

        <ExecutiveDashboardSection
          sectionKey="analytics"
          title="Membership Analytics"
          subtitle="Movement breakdown, trends, and active members by dimension"
          defaultOpen
        >
          <ExecutiveAnalyticsPanel data={dashboardData} />
        </ExecutiveDashboardSection>
      </div>
    </div>
  );
}
