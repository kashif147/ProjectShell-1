import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import TableComponent from "../../component/common/TableComponent";
import { fetchIssues } from "../../services/issuesApi";
import { fetchProfilesBatchLookup } from "../../services/profileSearchApi";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters, translateIssueFilterLabelsToCodes } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";

// Real, issue-service-backed rewrite of the Issues ("Cases") grid, off
// src/pages/events/EventsSummary.js's compliant TableComponent + Save-View
// pattern - replaces the previous 100%-mocked version that used MyTable and
// bypassed the shared toolbar/Save-View/export machinery entirely.
//
// One shared grid component reused across every /CasesSummary(/Open|/Closed),
// /Complaints, /FitnessToPractice, /IndustrialRelations, /DataProtection route
// (Entry.js), pre-filtered by the `defaultView` prop each route passes - not five/six
// near-duplicate pages. All of those routes share the same FilterContext screen key
// ("Issues") / SaveViewMenu templateType ("issuessummary"/"issuessummary" grid
// template), so the toolbar's Priority/Issue Type/Case Status/Owner filters, Save View
// templates, and column picker all behave identically no matter which route got you
// here - only the `defaultView` preset differs.
//
// DEFAULT_VIEW_FILTERS below is intentionally NOT layered into FilterContext's
// `filtersState` (e.g. via `updateFilter("Case Status", ...)` on mount). Two reasons:
// 1) `updateFilter` unconditionally flips FilterContext's
//    `userOverrodeTemplateFiltersRef` to true, which is the exact guard SaveViewMenu.jsx
//    uses to decide whether a late `getViewById` response is allowed to apply the
//    system-default/user-default template's filters (see its "Apply template settings
//    when view details are fetched" effect) - seeding a route preset that way on mount
//    would race with and can permanently block the very first template load.
// 2) The `issuessummary` system-default template's own `issueStatus` filter (see
//    grid-column-defaults.json - task: default view = outstanding/non-closed issues)
//    uses the *same* "Case Status" filter label as this page's Open/Closed presets. Once
//    that template loads, `filtersState["Case Status"]` is non-empty for every route, so
//    an "only inject the preset if this label is still empty" merge could never tell a
//    Closed-view visit apart from the shared template already having set the Open-view's
//    own default value - it would silently show the wrong rows on /CasesSummary/Closed.
// Applying the preset as its own always-on row filter - independent of, and layered on
// top of, `applyClientSideRowFilters(rows, filtersState, issuesColumns)` - sidesteps both
// problems entirely and needs no FilterContext changes. Every other filter (Priority,
// Owner, and even Case Status/Issue Type themselves, for narrowing further within a
// route's scope) stays fully toolbar-controlled, same as the plain "All" view always
// worked; only the one dimension that defines a given route's own identity is fixed for
// that route - switching scope is a side-nav click away (the "dedicated sections ... as a
// separate side navigation tab" requirement), not a toolbar chip to clear.
const DEFAULT_VIEW_FILTERS = {
  // "all" backs "/CasesSummary", relabeled "Open Issues" in the side nav - no separate
  // "/CasesSummary/Open" route/hard filter exists; the page's own default-filter template
  // (grid-column-defaults.json's issuessummary entry) already excludes CLOSED by default,
  // and it's still toolbar-clearable like every other filter on this page.
  all: () => true,
  closed: (row) => row.issueStatus === "CLOSED",
  complaints: (row) => row.issueType === "COMPLAINT",
  ftp: (row) => row.issueType === "FTP",
  ir: (row) => row.issueType === "IR",
  dataprotection: (row) => row.issueType === "DP",
};

function applyDefaultViewFilter(rows, defaultView) {
  const predicate = DEFAULT_VIEW_FILTERS[defaultView] || DEFAULT_VIEW_FILTERS.all;
  return rows.filter(predicate);
}

/** First linked member id (memberIds[0]) per row, deduped, for the batch-lookup call below. */
function collectMemberIdsToResolve(rows) {
  const ids = new Set();
  rows.forEach((row) => {
    const id = Array.isArray(row.memberIds) && row.memberIds.length ? row.memberIds[0] : null;
    if (id) ids.add(String(id));
  });
  return Array.from(ids);
}

/**
 * Merges profile-service batch-lookup results (member name / membership no / work location)
 * onto already-mapped issue rows, keyed by each row's first linked memberId. Best-effort: rows
 * with no match (or no linked member at all) keep their existing raw-id/"-" placeholders, same
 * as before this enrichment existed.
 */
function mergeProfileEnrichment(rows, profileById) {
  if (!profileById || !profileById.size) return rows;
  return rows.map((row) => {
    const id = Array.isArray(row.memberIds) && row.memberIds.length ? String(row.memberIds[0]) : null;
    const profile = id ? profileById.get(id) : null;
    if (!profile) return row;
    return {
      ...row,
      memberName: profile.personalInfo?.fullName || row.memberName || null,
      membershipNo: profile.membershipNumber || row.membershipNo,
      location: profile.professionalDetails?.workLocation || row.location,
    };
  });
}

function CasesSummary({ defaultView = "all" }) {
  const location = useLocation();
  const { filtersState, issueFilterCodeMaps } = useFilters();
  const { columns } = useTableColumns();
  const issuesColumns = columns.Issues || [];
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching: templatesLoading } = useSelector(
    (state) => state.templateFiltersColumnApi,
  );
  const [issuesSourceRows, setIssuesSourceRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetchIssues() takes no params - the server always returns the same full list regardless
  // of toolbar filters, so this callback must never depend on filtersState/
  // issueFilterCodeMaps/issuesColumns. Those are purely client-side filtering concerns
  // (applied below via the `issues` memo) - coupling them into the fetch trigger risks a
  // refetch loop if any of them turns out not to be perfectly stable across renders, for no
  // actual benefit (mirrors IssuesManagementDashboard.jsx's fetch-once/filter-via-memo split).
  const loadIssues = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchIssues()
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((iss) => ({
          key: iss._id,
          issueId: iss._id,
          internalReferenceNumber: iss.internalReferenceNumber || "-",
          caseTitle: iss.caseTitle || iss.internalReferenceNumber || "-",
          issueType: iss.issueType,
          memberIds: Array.isArray(iss.memberIds) ? iss.memberIds : [],
          memberName: null,
          membershipNo: null,
          caseFileNumber: iss.caseFileNumber || null,
          nmbiReference: iss.nmbiReference || null,
          location: null,
          groupId: iss.groupId || null,
          dateReceived: iss.dateReceived,
          criteriaLetterStatus: iss.criteriaLetterStatus || null,
          legislation: iss.legislation || null,
          issueStatus: iss.issueStatus,
          priority: iss.priority,
          ownerTeam: iss.owner?.team || null,
        }));
        const scoped = applyDefaultViewFilter(mapped, defaultView);
        setIssuesSourceRows(scoped);

        // Best-effort member-name/membership-no/location hydration via profile-service's
        // batch-lookup endpoint (see profileSearchApi.js's fetchProfilesBatchLookup) - fires
        // after the initial render so the grid isn't blocked on it; failures/empty results
        // just leave the raw-id/"-" placeholders in place.
        const memberIdsToResolve = collectMemberIdsToResolve(scoped);
        if (memberIdsToResolve.length) {
          fetchProfilesBatchLookup(memberIdsToResolve)
            .then((profiles) => {
              if (cancelled || !Array.isArray(profiles) || !profiles.length) return;
              const profileById = new Map(
                profiles.map((profile) => [String(profile._id), profile]),
              );
              setIssuesSourceRows((prev) => mergeProfileEnrichment(prev, profileById));
            })
            .catch(() => {
              /* best-effort - raw id / "-" placeholders remain */
            });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIssuesSourceRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [defaultView]);

  // Re-fetch every time this route is navigated to (not just first mount),
  // gated on template init - Save View filters/columns must resolve before
  // the first fetch. Mirrors EventsSummary.js's data-loading effect exactly.
  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    loadIssues();
  }, [
    loadIssues,
    location.key,
    activeTemplateId,
    isInitialized,
    templatesLoading,
  ]);

  // Client-side filtering only - never triggers a refetch, just re-derives from whatever
  // was last fetched.
  const issues = useMemo(() => {
    const codedFiltersState = translateIssueFilterLabelsToCodes(filtersState, issueFilterCodeMaps);
    return applyClientSideRowFilters(issuesSourceRows, codedFiltersState, issuesColumns);
  }, [issuesSourceRows, filtersState, issuesColumns, issueFilterCodeMaps]);

  useRegisterGridFilterRows("Issues", issuesSourceRows, issuesColumns);

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
    <div style={{ padding: "20px 0" }}>
      <TableComponent
        data={issues}
        screenName="Issues"
        isGrideLoading={loading}
        hideLegacyRowChrome
        rowActionsInGridmenu
      />
    </div>
  );
}

export default CasesSummary;
