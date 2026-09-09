import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Col, Row, Tag, Button, Table, Segmented, Alert } from "antd";
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchIssues } from "../../services/issuesApi";
import { buildIssueDetailsSearch } from "../../utils/detailsRoute";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters, translateIssueFilterLabelsToCodes } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { useAuthorization } from "../../context/AuthorizationContext";
import "../../styles/EventsDashboard.css";

// Real, issue-service-backed rewrite of the Issues Management dashboard - replaces the
// previous 100%-mocked version (hardcoded PRIORITY_MIX/ISSUE_TREND/RECENT_ISSUES/kpis).
// Data source: issue-service's live GET /api/issues (same fetchIssues() the Issues grid
// uses), filtered/derived client-side - the same "filterableX -> applyClientSideRowFilters
// -> visibleX" pattern EventsDashboard.jsx uses for events/registrations. reporting-service
// already ingests issue reporting-snapshot events into Postgres (issueListing.repository.js /
// issuesIngest.service.js), but has no HTTP route exposing that data yet - building one just
// for this dashboard would mean designing + shipping a brand-new read endpoint in a second
// backend repo. The live list already answers every KPI/chart this page needs (current
// open/resolved/priority/owner state plus createdOn/dateResolved for a real, if
// current-state-only, trend), so this rewrite drives entirely off issue-service, matching
// EventsDashboard.jsx's own precedent of not routing dashboard KPIs through reporting-service.

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_KEYS = ["1M", "3M", "YTD", "ALL"];
const PRIORITY_TAG_COLORS = { HIGH: "red", MEDIUM: "gold", LOW: "green" };
const PRIORITY_CHART_COLORS = { HIGH: "#dc2626", MEDIUM: "var(--app-brand-primary)", LOW: "#94a3b8" };

function statusTagColor(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "CLOSED") return "default";
  if (normalized.startsWith("PENDING") || normalized === "AWAITING_OUTCOME_THIRD_PARTY") return "gold";
  if (normalized.startsWith("ACTIVE")) return "green";
  if (normalized === "FOR_REVIEW_BY_OFFICIAL") return "blue";
  return "default";
}

// issue-service enums are SCREAMING_SNAKE_CASE (e.g. "PENDING_RESPONSE_MEMBER") - render Title Case.
// Duplicated from TableColumnsContext's own (unexported) formatIssueEnumLabel/tag-color
// helpers rather than importing - that file doesn't export them.
function formatEnumLabel(value) {
  if (!value) return "-";
  return String(value)
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatCountShort(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  if (x >= 1000) {
    const k = x / 1000;
    const s = Number.isInteger(k) ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
    return `${s}k`;
  }
  return String(Math.round(x));
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Year-over-year % change label, e.g. "+18%" / "-6%" / "0%". prev === 0 is treated as
// "no baseline" (+100% if curr > 0, else flat) rather than dividing by zero.
function pctChangeLabel(curr, prev) {
  if (!prev) return curr ? "+100%" : "0%";
  const delta = ((curr - prev) / prev) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${Math.round(delta)}%`;
}

function computeRangeStart(rangeKey) {
  const now = new Date();
  if (rangeKey === "1M") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  if (rangeKey === "3M") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 3);
    return d;
  }
  if (rangeKey === "YTD") {
    return new Date(now.getFullYear(), 0, 1);
  }
  return null; // ALL
}

function priorityTag(priority) {
  if (!priority) return <Tag>Unset</Tag>;
  return <Tag color={PRIORITY_TAG_COLORS[priority] || "default"}>{formatEnumLabel(priority)}</Tag>;
}

function statusTag(status) {
  if (!status) return <Tag>-</Tag>;
  return <Tag color={statusTagColor(status)}>{formatEnumLabel(status)}</Tag>;
}

function issueIcon(priority) {
  const sz = 16;
  if (priority === "HIGH") {
    return <WarningOutlined style={{ color: "#dc2626", fontSize: sz }} />;
  }
  return <ExclamationCircleOutlined style={{ color: "var(--app-brand-primary)", fontSize: sz }} />;
}

function IssuesManagementDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filtersState, issueFilterCodeMaps } = useFilters();
  const { columns: tableColumnsMap } = useTableColumns();
  const { hasPermission } = useAuthorization();
  // Own FilterContext screen ("IssuesDashboard") so its filter chips are independent of
  // both CasesSummary's grid screen ("Issues") and each other - reusing either would make
  // the dashboard's filter state literally the same object as the grid's, the exact mistake
  // EventsDashboard made and had to fix afterward (see TEMPLATE_IMPLEMENTATION_PLAYBOOK.md's
  // 2026-07-21 entries).
  const issuesColumns = tableColumnsMap.IssuesDashboard || [];

  const canViewDataProtection = hasPermission("issues-dataprotection:read");
  const [dpOnly, setDpOnly] = useState(false);

  // Local chart drill-down (doc: "I should be able to filter the list of issue by drilling
  // down to the charts"). Deliberately a *local* filter on top of the existing
  // filtersState-derived chain, not a navigation to the main Issues grid - clicking a
  // priority-pie slice or a trend-chart point narrows KPIs/recent-issues below to just that
  // segment, with a visible banner + clear action. The charts themselves (priorityMix/
  // issueTrend) keep rendering the undrilled scopedIssues so the chart doesn't collapse to
  // a single slice/point once you've clicked it - only the "view" below the charts narrows.
  const [drillFilter, setDrillFilter] = useState(null); // { type: "priority"|"month", value, label } | null

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchIssues()
      .then((data) => {
        if (cancelled) return;
        setIssues(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setIssues([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Same dataIndex shape as the Issues grid (staticColumns.Issues, aliased onto
  // staticColumns.IssuesDashboard) so the shared Toolbar filters - Priority, Issue Type,
  // Case Status, Owner - apply here too.
  const filterableIssues = useMemo(
    () =>
      issues.map((iss) => ({
        issueId: iss._id,
        caseTitle: iss.caseTitle || iss.internalReferenceNumber || "-",
        issueType: iss.issueType,
        priority: iss.priority,
        issueStatus: iss.issueStatus,
        ownerTeam: iss.owner?.team || null,
        dateReceived: iss.dateReceived,
        createdOn: iss.createdOn || iss.createdAt,
        dateResolved: iss.dateResolved,
      })),
    [issues],
  );

  useRegisterGridFilterRows("IssuesDashboard", filterableIssues, issuesColumns);

  const filteredIssueIds = useMemo(() => {
    const codedFiltersState = translateIssueFilterLabelsToCodes(filtersState, issueFilterCodeMaps);
    const filtered = applyClientSideRowFilters(filterableIssues, codedFiltersState, issuesColumns);
    return new Set(filtered.map((row) => row.issueId));
  }, [filterableIssues, filtersState, issuesColumns, issueFilterCodeMaps]);

  const visibleIssues = useMemo(
    () => issues.filter((iss) => filteredIssueIds.has(iss._id)),
    [issues, filteredIssueIds],
  );

  // Data-Protection-Officer-scoped view, gated on `issues-dataprotection:read` (the toggle
  // itself is only rendered when the permission is present - see below). This is purely a
  // client-side narrowing convenience: the backend's GET /issues already scopes the returned
  // list to the caller's granted `issues-<team>:read` resources, so a user without DP
  // visibility never receives DP-typed issues in `issues` to begin with.
  const scopedIssues = useMemo(
    () => (dpOnly ? visibleIssues.filter((iss) => iss.issueType === "DP") : visibleIssues),
    [visibleIssues, dpOnly],
  );

  // Drill-down applied on top of the DPO-scoped list. Everything below the charts (KPIs,
  // recent-issues table, focus issue, member-vs-other split) reads from `drilledIssues`;
  // the charts themselves (priorityMix/issueTrend) and the new YoY/resolved-by-owner
  // sections deliberately keep reading `scopedIssues` so they still show the full picture
  // to drill down from/into rather than shrinking to match their own selection.
  const drilledIssues = useMemo(() => {
    if (!drillFilter) return scopedIssues;
    if (drillFilter.type === "priority") {
      return scopedIssues.filter((iss) => iss.priority === drillFilter.value);
    }
    if (drillFilter.type === "month") {
      return scopedIssues.filter((iss) => {
        const created = iss.createdOn ? new Date(iss.createdOn) : null;
        if (!created || Number.isNaN(created.getTime())) return false;
        return `${created.getFullYear()}-${created.getMonth()}` === drillFilter.value;
      });
    }
    return scopedIssues;
  }, [scopedIssues, drillFilter]);

  const openIssues = useMemo(
    () => drilledIssues.filter((iss) => iss.issueStatus !== "CLOSED"),
    [drilledIssues],
  );

  // Header's global 1M/3M/YTD/ALL range toggle (HeaderDetails.jsx's HEADER_DASHBOARD_RANGE_NAVS
  // already includes this route) - read directly off the `?range=` URL param the same way
  // HeaderDetails.jsx itself does. Note: EventsDashboard.jsx (the pattern this page otherwise
  // follows) doesn't actually consume this param at all despite also being in that Set - there
  // is no existing consumption pattern to mirror. Wired here for the one KPI it's genuinely
  // meaningful for (issues resolved in the selected period).
  const activeRange = useMemo(() => {
    const r = searchParams.get("range");
    return RANGE_KEYS.includes(r) ? r : "YTD";
  }, [searchParams]);
  const rangeStart = useMemo(() => computeRangeStart(activeRange), [activeRange]);

  const kpis = useMemo(() => {
    const now = Date.now();
    const openCount = openIssues.length;

    // "At risk": HIGH priority, or (for COMPLAINT/DP, the only two issue types
    // with a `dueDate` field) a due date within 7 days or already overdue.
    const atRiskCount = openIssues.filter((iss) => {
      if (iss.priority === "HIGH") return true;
      if (iss.dueDate) {
        const due = new Date(iss.dueDate).getTime();
        if (!Number.isNaN(due) && due - now <= 7 * DAY_MS) return true;
      }
      return false;
    }).length;

    const resolvedInPeriod = drilledIssues.filter((iss) => {
      if (!iss.dateResolved) return false;
      if (!rangeStart) return true;
      const resolved = new Date(iss.dateResolved).getTime();
      return !Number.isNaN(resolved) && resolved >= rangeStart.getTime();
    }).length;

    const avgAgeDays = openCount
      ? openIssues.reduce((sum, iss) => {
          const created = new Date(iss.createdOn || iss.createdAt).getTime();
          if (Number.isNaN(created)) return sum;
          return sum + (now - created) / DAY_MS;
        }, 0) / openCount
      : 0;

    return [
      {
        label: drillFilter ? "Open issues (filtered)" : "Open issues",
        value: String(openCount),
        trend: "",
        trendMuted: true,
        barColor: "var(--app-brand-primary)",
        barPercent: Math.min(100, openCount * 5),
      },
      {
        label: `Resolved (${activeRange})`,
        value: String(resolvedInPeriod),
        trend: "",
        trendMuted: true,
        barColor: "#10b981",
        barPercent: Math.min(100, resolvedInPeriod * 5),
      },
      {
        label: "Avg. age (open)",
        value: `${avgAgeDays.toFixed(1)}d`,
        trend: "",
        trendMuted: true,
        barColor: "#7c3aed",
        barPercent: Math.min(100, avgAgeDays),
      },
      {
        label: "High priority / at risk",
        value: String(atRiskCount),
        trend: openCount ? `${Math.round((atRiskCount / openCount) * 100)}% of open` : "",
        trendMuted: true,
        barColor: "#dc2626",
        barPercent: openCount ? Math.min(100, Math.round((atRiskCount / openCount) * 100)) : 0,
      },
    ];
  }, [openIssues, drilledIssues, rangeStart, activeRange, drillFilter]);

  // Undrilled open-issue count, feeding the priority pie *chart itself* - kept separate from
  // the `openIssues` used by the KPI cards so clicking a slice narrows the KPIs/table below
  // without the pie collapsing to a single 100% slice of itself.
  const priorityMix = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    scopedIssues
      .filter((iss) => iss.issueStatus !== "CLOSED")
      .forEach((iss) => {
        if (Object.prototype.hasOwnProperty.call(counts, iss.priority)) counts[iss.priority] += 1;
      });
    const total = counts.HIGH + counts.MEDIUM + counts.LOW || 1;
    return ["HIGH", "MEDIUM", "LOW"].map((p) => ({
      name: formatEnumLabel(p),
      priorityKey: p,
      value: counts[p],
      pct: Math.round((counts[p] / total) * 100),
      color: PRIORITY_CHART_COLORS[p],
    }));
  }, [scopedIssues]);

  // Chart drill-down handlers - toggle off if the same segment is clicked again.
  const handlePrioritySliceClick = (entry) => {
    const key = entry && entry.priorityKey;
    if (!key) return;
    setDrillFilter((prev) =>
      prev && prev.type === "priority" && prev.value === key
        ? null
        : { type: "priority", value: key, label: `Priority: ${formatEnumLabel(key)}` },
    );
  };

  const handleTrendPointClick = (state) => {
    const payload = state && state.activePayload && state.activePayload[0] && state.activePayload[0].payload;
    if (!payload || !payload.key) return;
    setDrillFilter((prev) =>
      prev && prev.type === "month" && prev.value === payload.key
        ? null
        : {
            type: "month",
            value: payload.key,
            label: `Created in ${payload.month} ${payload.year}`,
          },
    );
  };

  // Approximate, and deliberately kept simple rather than faked: derived from
  // issue-service's current-state list (GET /api/issues), not a time-series/append-log
  // source. A soft-deleted issue (meta.deleted) silently drops out of every past month's
  // counts once deleted, and an "escalated" series (priority-change history) genuinely isn't
  // derivable from current state at all, so - unlike the original mock - that line is
  // dropped rather than invented. Same tolerance the plan grants EventsDashboard.jsx's own
  // mock revenue-trend widget (see TEMPLATE_IMPLEMENTATION_PLAYBOOK.md's 2026-07-21 entry).
  const issueTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString("en", { month: "short" }),
        year: d.getFullYear(),
        opened: 0,
        closed: 0,
      });
    }
    const indexByKey = new Map(months.map((m, idx) => [m.key, idx]));
    scopedIssues.forEach((iss) => {
      const created = iss.createdOn ? new Date(iss.createdOn) : null;
      if (created && !Number.isNaN(created.getTime())) {
        const idx = indexByKey.get(`${created.getFullYear()}-${created.getMonth()}`);
        if (idx !== undefined) months[idx].opened += 1;
      }
      const resolved = iss.dateResolved ? new Date(iss.dateResolved) : null;
      if (resolved && !Number.isNaN(resolved.getTime())) {
        const idx = indexByKey.get(`${resolved.getFullYear()}-${resolved.getMonth()}`);
        if (idx !== undefined) months[idx].closed += 1;
      }
    });
    return months;
  }, [scopedIssues]);

  const trendNote = useMemo(() => {
    const opened = issueTrend.reduce((s, m) => s + m.opened, 0);
    const closed = issueTrend.reduce((s, m) => s + m.closed, 0);
    if (!opened && !closed) return "No issue activity in the last 6 months";
    if (closed >= opened) return "↗ Closures keeping pace with new issues";
    return "↘ Opens outpacing closures";
  }, [issueTrend]);

  const recentIssues = useMemo(
    () =>
      [...drilledIssues]
        .sort((a, b) => {
          const at = new Date(a.lastActivityAt || a.updatedAt || a.createdOn || 0).getTime();
          const bt = new Date(b.lastActivityAt || b.updatedAt || b.createdOn || 0).getTime();
          return bt - at;
        })
        .slice(0, 8)
        .map((iss) => ({
          key: iss._id,
          issueId: iss._id,
          title: iss.caseTitle || iss.internalReferenceNumber || "Untitled issue",
          reference: iss.internalReferenceNumber || "-",
          priority: iss.priority,
          status: iss.issueStatus,
          ownerTeam: iss.owner?.team || null,
          updated: iss.lastActivityAt || iss.updatedAt || iss.createdOn,
        })),
    [drilledIssues],
  );

  // Real (not fabricated) member-vs-other split - issueSource is a base-schema field on
  // every issue type.
  const sourceSplit = useMemo(() => {
    const total = drilledIssues.length || 1;
    const memberCount = drilledIssues.filter((iss) => iss.issueSource === "MEMBER-IS").length;
    const otherCount = drilledIssues.length - memberCount;
    return {
      memberPct: Math.round((memberCount / total) * 100),
      otherPct: Math.round((otherCount / total) * 100),
      memberCount,
      otherCount,
    };
  }, [drilledIssues]);

  const focusIssue = useMemo(() => {
    const pool = openIssues.length ? openIssues : drilledIssues;
    if (!pool.length) return null;
    const weight = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...pool].sort((a, b) => {
      const wa = weight[a.priority] ?? 3;
      const wb = weight[b.priority] ?? 3;
      if (wa !== wb) return wa - wb;
      return new Date(b.createdOn || 0).getTime() - new Date(a.createdOn || 0).getTime();
    })[0];
  }, [openIssues, drilledIssues]);

  const focusDaysOpen = focusIssue
    ? Math.max(0, Math.floor((Date.now() - new Date(focusIssue.createdOn || focusIssue.createdAt).getTime()) / DAY_MS))
    : null;

  // Year-over-year (doc: "I should be able to see year on year comparison of the issues").
  // Honest limitation: the data source is issue-service's live current-state list
  // (GET /api/issues), not a point-in-time snapshot, so a genuine "issues that existed as
  // of last year" comparison isn't derivable from it - that would need reporting-service's
  // ingested snapshot events, which have no HTTP route yet (see file-header comment/
  // TEMPLATE_IMPLEMENTATION_PLAYBOOK.md). What IS honestly derivable from current state:
  // createdOn grouped by year (issue-creation volume, unaffected by later status changes)
  // and dateResolved grouped by year (resolution volume) - both computed here, month by
  // month, for the current year vs the prior year. A soft-deleted issue (meta.deleted)
  // still drops out of these counts once deleted, same caveat as the 6-month trend above.
  const yearOverYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const prevYear = currentYear - 1;
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString("en", { month: "short" }),
    );

    function monthlyCountsByYear(dateField) {
      const rows = monthNames.map((month) => ({ month, [prevYear]: 0, [currentYear]: 0 }));
      scopedIssues.forEach((iss) => {
        const raw = iss[dateField];
        if (!raw) return;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return;
        const y = d.getFullYear();
        if (y !== prevYear && y !== currentYear) return;
        rows[d.getMonth()][y] += 1;
      });
      return rows;
    }

    const createdByMonth = monthlyCountsByYear("createdOn");
    const resolvedByMonth = monthlyCountsByYear("dateResolved");

    const sumYear = (rows, year) => rows.reduce((sum, r) => sum + r[year], 0);

    return {
      prevYear,
      currentYear,
      createdByMonth,
      resolvedByMonth,
      createdTotals: { [prevYear]: sumYear(createdByMonth, prevYear), [currentYear]: sumYear(createdByMonth, currentYear) },
      resolvedTotals: { [prevYear]: sumYear(resolvedByMonth, prevYear), [currentYear]: sumYear(resolvedByMonth, currentYear) },
    };
  }, [scopedIssues]);

  // Resolved-by-user/team breakdown (doc: "I should be able to see no of issues resolved by
  // a user or team on closed issues"). resolvedByUserId only exists on the Complaint/IR/
  // DataProtection discriminators (models/issue.complaint.model.js, issue.ir.model.js,
  // issue.dataprotection.model.js) - FTP has no such field (models/issue.ftp.model.js) - so
  // fall back to the base schema's owner.userId (present on every issue type) when it's
  // unset. No user-directory lookup is wired into the frontend yet (a separate, parallel
  // task is building one), so the raw userId is shown as-is for now; swap this label for a
  // real display-name lookup once that lands.
  const resolvedBreakdown = useMemo(() => {
    const closedIssues = scopedIssues.filter((iss) => iss.issueStatus === "CLOSED");
    const byUser = new Map();
    const byTeam = new Map();
    closedIssues.forEach((iss) => {
      const userId = iss.resolvedByUserId || iss.owner?.userId || null;
      const userKey = userId || "__unassigned__";
      byUser.set(userKey, (byUser.get(userKey) || 0) + 1);

      const team = iss.owner?.team || null;
      const teamKey = team || "__unassigned__";
      byTeam.set(teamKey, (byTeam.get(teamKey) || 0) + 1);
    });

    const userRows = Array.from(byUser.entries())
      .map(([key, count]) => ({
        key,
        // TODO: replace with a real display-name lookup once the user-directory work lands.
        label: key === "__unassigned__" ? "Unassigned" : key,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const teamRows = Array.from(byTeam.entries())
      .map(([key, count]) => ({
        key,
        label: key === "__unassigned__" ? "Unassigned" : formatEnumLabel(key),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return { totalClosed: closedIssues.length, userRows, teamRows };
  }, [scopedIssues]);

  const columns = [
    {
      dataIndex: "title",
      title: "ISSUE",
      width: 340,
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "var(--app-brand-bg)",
              color: "var(--app-brand-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {issueIcon(record.priority)}
          </div>
          <div>
            <div className="events-dashboard__event-name">{text}</div>
            <div className="events-dashboard__event-loc">
              {record.reference} · {record.ownerTeam ? formatEnumLabel(record.ownerTeam) : "Unassigned"}
            </div>
          </div>
        </div>
      ),
    },
    {
      dataIndex: "priority",
      title: "PRIORITY",
      width: 112,
      render: (p) => priorityTag(p),
    },
    {
      dataIndex: "status",
      title: "STATUS",
      width: 150,
      render: (s) => statusTag(s),
    },
    {
      dataIndex: "updated",
      title: "UPDATED",
      width: 180,
      render: (value) => (
        <span className="events-dashboard__count-cell" style={{ fontWeight: 500 }}>
          {formatDateTime(value)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 48,
      align: "right",
      render: () => (
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <div className="events-dashboard">
      {canViewDataProtection && (
        <Row style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Segmented
              value={dpOnly ? "dp" : "all"}
              onChange={(value) => setDpOnly(value === "dp")}
              options={[
                { label: "All Issues", value: "all" },
                { label: "Data Protection Only", value: "dp" },
              ]}
            />
          </Col>
        </Row>
      )}

      {drillFilter && (
        <Row style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Alert
              type="info"
              showIcon
              closable
              onClose={() => setDrillFilter(null)}
              message={`Drilled down to: ${drillFilter.label}`}
              description="KPIs and Recent Issues below reflect this selection only - the charts above still show the full picture."
              action={
                <Button size="small" onClick={() => setDrillFilter(null)}>
                  Clear drill-down
                </Button>
              }
            />
          </Col>
        </Row>
      )}

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {kpis.map((k) => (
          <Col xs={24} sm={12} lg={6} key={k.label}>
            <Card className="events-dashboard__card events-dashboard__kpi" bordered={false} loading={loading}>
              <div className="events-dashboard__kpi-label">{k.label}</div>
              <div
                className={
                  k.trendMuted
                    ? "events-dashboard__kpi-trend events-dashboard__kpi-trend--muted"
                    : "events-dashboard__kpi-trend"
                }
              >
                {k.trend}
              </div>
              <div className="events-dashboard__kpi-value">{k.value}</div>
              <div className="events-dashboard__kpi-bar">
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "#e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${k.barPercent}%`,
                      height: "100%",
                      background: k.barColor,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} lg={14}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">ISSUE FLOW (last 6 months)</p>
            <div className="events-dashboard__section-note">{trendNote}</div>
            {/* Chart drill-down: click a point on the "Opened" line to filter the KPIs/
                recent-issues table below to issues created that month. */}
            <div style={{ height: 196, cursor: "pointer" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={issueTrend}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  onClick={handleTrendPointClick}
                >
                  <defs>
                    <linearGradient id="issuesOpenedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--app-brand-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--app-brand-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatCountShort(v)}
                    allowDecimals={false}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v, name) => [formatCountShort(v), name]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                    iconType="line"
                    verticalAlign="bottom"
                    height={28}
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    name="Opened"
                    stroke="var(--app-brand-primary)"
                    strokeWidth={2}
                    fill="url(#issuesOpenedFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="closed"
                    name="Closed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">OPEN ISSUES BY PRIORITY</p>
            {/* Chart drill-down: click a slice to filter the KPIs/recent-issues table below
                to that priority. */}
            <div style={{ height: 168, cursor: "pointer" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityMix}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    onClick={handlePrioritySliceClick}
                  >
                    {priorityMix.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke={drillFilter?.type === "priority" && drillFilter.value === entry.priorityKey ? "#0f172a" : "none"}
                        strokeWidth={drillFilter?.type === "priority" && drillFilter.value === entry.priorityKey ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry) => (
                      <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>
                        {value}{" "}
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>
                          {entry.payload.pct}%
                        </span>
                      </span>
                    )}
                  />
                  <Tooltip formatter={(v, _n, item) => [`${v} (${item?.payload?.pct ?? 0}%)`, item?.payload?.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={14}>
          <Card className="events-dashboard__card" bordered={false}>
            <div className="events-dashboard__table-head">
              <p className="events-dashboard__section-title" style={{ margin: 0 }}>
                RECENT ISSUES
              </p>
              <button
                type="button"
                className="events-dashboard__link"
                onClick={() => navigate("/CasesSummary")}
              >
                View all &gt;
              </button>
            </div>
            <div className="events-dashboard__dash-table-wrap">
              <Table
                columns={columns}
                dataSource={recentIssues}
                pagination={false}
                size="small"
                rowKey="key"
                loading={loading}
                showHeader
                onRow={(record) => ({
                  onClick: () =>
                    navigate(
                      { pathname: "/CasesDetails", search: buildIssueDetailsSearch(record.issueId) },
                      { state: { issueId: record.issueId } },
                    ),
                })}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__drill-title">
              {focusIssue
                ? `FOCUS ISSUE: ${focusIssue.internalReferenceNumber || focusIssue.caseTitle}`
                : "FOCUS ISSUE: none open"}
            </p>
            <div className="events-dashboard__metric-grid">
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">DAYS OPEN</div>
                <div className="events-dashboard__metric-value">
                  {focusDaysOpen === null ? "-" : focusDaysOpen}
                </div>
              </div>
              <div className="events-dashboard__metric-box">
                <div className="events-dashboard__metric-label">PRIORITY</div>
                <div className="events-dashboard__metric-value">
                  {focusIssue ? formatEnumLabel(focusIssue.priority) : "-"}
                </div>
              </div>
            </div>
            <div className="events-dashboard__sentiment-label">DUE DATE</div>
            <div className="events-dashboard__sentiment-score">
              {focusIssue?.dueDate ? formatDateTime(focusIssue.dueDate) : "Not tracked"}
            </div>
            <p className="events-dashboard__sentiment-caption">
              {focusIssue
                ? `Owner: ${focusIssue.owner?.team ? formatEnumLabel(focusIssue.owner.team) : "Unassigned"}`
                : "No open issues match the current filters."}
            </p>
            <div className="events-dashboard__ticket-label">MEMBER-REPORTED VS OTHER</div>
            <div
              className="events-dashboard__ticket-bars"
              title="Member-reported vs other sources (issueSource)"
            >
              <span aria-label="Member-reported" style={{ flex: sourceSplit.memberPct || 1, background: "var(--app-brand-primary)" }} />
              <span aria-label="Other sources" style={{ flex: sourceSplit.otherPct || 1, background: "#94a3b8" }} />
            </div>
            <div className="events-dashboard__ticket-legend">
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--members" />
                Member {sourceSplit.memberPct}%
              </span>
              <span>
                <i className="events-dashboard__ticket-swatch events-dashboard__ticket-swatch--nonmembers" />
                Other {sourceSplit.otherPct}%
              </span>
            </div>
            <button
              type="button"
              className="events-dashboard__report-btn"
              disabled={!focusIssue}
              onClick={() =>
                focusIssue &&
                navigate(
                  { pathname: "/CasesDetails", search: buildIssueDetailsSearch(focusIssue._id) },
                  { state: { issueId: focusIssue._id } },
                )
              }
            >
              Open issue
            </button>
          </Card>
        </Col>
      </Row>

      {/* Year-over-year (doc: "I should be able to see year on year comparison of the
          issues"). Built from createdOn/dateResolved on the live current-state list - see
          the yearOverYear useMemo above for why a true point-in-time "issues that existed
          as of last year" comparison isn't possible from this data source. */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">
              ISSUES CREATED - YEAR OVER YEAR
            </p>
            <div className="events-dashboard__section-note">
              {yearOverYear.currentYear}: {yearOverYear.createdTotals[yearOverYear.currentYear]} (
              {pctChangeLabel(
                yearOverYear.createdTotals[yearOverYear.currentYear],
                yearOverYear.createdTotals[yearOverYear.prevYear],
              )}{" "}
              vs {yearOverYear.prevYear})
            </div>
            <div style={{ height: 196 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearOverYear.createdByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tickFormatter={(v) => formatCountShort(v)}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} verticalAlign="bottom" height={28} />
                  <Bar dataKey={String(yearOverYear.prevYear)} name={String(yearOverYear.prevYear)} fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey={String(yearOverYear.currentYear)} name={String(yearOverYear.currentYear)} fill="var(--app-brand-primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">
              ISSUES RESOLVED - YEAR OVER YEAR
            </p>
            <div className="events-dashboard__section-note">
              {yearOverYear.currentYear}: {yearOverYear.resolvedTotals[yearOverYear.currentYear]} (
              {pctChangeLabel(
                yearOverYear.resolvedTotals[yearOverYear.currentYear],
                yearOverYear.resolvedTotals[yearOverYear.prevYear],
              )}{" "}
              vs {yearOverYear.prevYear})
            </div>
            <div style={{ height: 196 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearOverYear.resolvedByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tickFormatter={(v) => formatCountShort(v)}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} verticalAlign="bottom" height={28} />
                  <Bar dataKey={String(yearOverYear.prevYear)} name={String(yearOverYear.prevYear)} fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey={String(yearOverYear.currentYear)} name={String(yearOverYear.currentYear)} fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Doc: "I should be able to see no of issues resolved by a user or team on closed
          issues." userId is shown raw - see the resolvedBreakdown useMemo above for why. */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">
              CLOSED ISSUES RESOLVED BY USER ({resolvedBreakdown.totalClosed} total)
            </p>
            <Table
              size="small"
              pagination={false}
              rowKey="key"
              dataSource={resolvedBreakdown.userRows}
              locale={{ emptyText: "No closed issues match the current filters" }}
              columns={[
                { title: "USER ID", dataIndex: "label", ellipsis: true },
                { title: "CLOSED ISSUES", dataIndex: "count", width: 130, align: "right" },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="events-dashboard__card" bordered={false}>
            <p className="events-dashboard__section-title">
              CLOSED ISSUES RESOLVED BY TEAM ({resolvedBreakdown.totalClosed} total)
            </p>
            <Table
              size="small"
              pagination={false}
              rowKey="key"
              dataSource={resolvedBreakdown.teamRows}
              locale={{ emptyText: "No closed issues match the current filters" }}
              columns={[
                { title: "TEAM", dataIndex: "label" },
                { title: "CLOSED ISSUES", dataIndex: "count", width: 130, align: "right" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default IssuesManagementDashboard;
