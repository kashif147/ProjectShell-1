import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import TableComponent from "../../component/common/TableComponent";
import { fetchIssues } from "../../services/issuesApi";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";

// Real, issue-service-backed rewrite of the Issues ("Cases") grid, off
// src/pages/events/EventsSummary.js's compliant TableComponent + Save-View
// pattern - replaces the previous 100%-mocked version that used MyTable and
// bypassed the shared toolbar/Save-View/export machinery entirely.
//
// Member name / Membership no / Location aren't resolvable from the Issue
// payload alone (they live on the linked member's Profile in profile-service)
// - a profile-batch-lookup feature is explicitly out of scope for this task,
// so those columns show the raw linked profileId(s) or a "-" placeholder for
// now (see the matching column render()s in TableColumnsContext .js's
// `staticColumns.Issues`). A later task (the CasesDetails.js rewrite) is
// expected to add real member-name resolution.
function CasesSummary() {
  const location = useLocation();
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const issuesColumns = columns.Issues || [];
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching: templatesLoading } = useSelector(
    (state) => state.templateFiltersColumnApi,
  );
  const [issues, setIssues] = useState([]);
  const [issuesSourceRows, setIssuesSourceRows] = useState([]);
  const [loading, setLoading] = useState(true);

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
          membershipNo: null,
          caseFileNumber: iss.caseFileNumber || null,
          nmbiReference: iss.nmbiReference || null,
          location: null,
          dateReceived: iss.dateReceived,
          criteriaLetterStatus: iss.criteriaLetterStatus || null,
          legislation: iss.legislation || null,
          issueStatus: iss.issueStatus,
          priority: iss.priority,
          ownerTeam: iss.owner?.team || null,
        }));
        setIssuesSourceRows(mapped);
        setIssues(applyClientSideRowFilters(mapped, filtersState, issuesColumns));
      })
      .catch(() => {
        if (!cancelled) {
          setIssuesSourceRows([]);
          setIssues([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState, issuesColumns]);

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
