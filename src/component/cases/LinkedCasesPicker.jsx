import React, { useEffect, useRef, useState } from "react";
import { Select, Tag, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchIssueById, searchIssues } from "../../services/issuesApi";

/**
 * "Linked Cases" common field UI - previously just a raw `linkedIssueIds` ObjectId array
 * with a freeform Select(mode="tags") for pasting ids by hand, no search/display. Reuses
 * issuesApi.js's searchIssues (GET /issues/search?q=, already built for the grid's "Find
 * Issues" feature) to search by reference number/case title, and fetchIssueById to resolve
 * display labels for ids already on the issue.
 *
 * Controlled by the parent (CasesDetails.js only, per the plan - linking to other issues
 * before the current one is saved doesn't make sense for the create drawer): `linkedIssueIds`
 * is the current list, `onAdd(id)`/`onRemove(id)` request a change: CasesDetails.js persists
 * immediately via updateIssue, same pattern as its own memberIds handling.
 */
function LinkedCasesPicker({ issueId, linkedIssueIds = [], onAdd, onRemove, disabled = false }) {
  const navigate = useNavigate();
  const [labels, setLabels] = useState({});
  const [searchOptions, setSearchOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    },
    [],
  );

  // Resolve case titles for any linked id we haven't seen a label for yet (e.g. loaded from
  // an existing issue - GET /issues/:id only returns the raw id list).
  useEffect(() => {
    const missing = linkedIssueIds.filter((id) => id && !labels[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map((id) =>
        fetchIssueById(id)
          .then((issue) => [id, issue])
          .catch(() => [id, null]),
      ),
    ).then((pairs) => {
      if (cancelled) return;
      setLabels((prev) => {
        const next = { ...prev };
        pairs.forEach(([id, issue]) => {
          next[id] = {
            caseTitle: issue?.caseTitle || issue?.internalReferenceNumber || id,
            internalReferenceNumber: issue?.internalReferenceNumber || null,
          };
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedIssueIds]);

  const runSearch = (query) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query || !query.trim()) {
      setSearchOptions([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setSearching(true);
      try {
        const results = await searchIssues(query);
        if (requestId !== requestIdRef.current) return;
        const rows = Array.isArray(results) ? results : [];
        setSearchOptions(
          rows
            .filter(
              (row) => String(row._id) !== String(issueId) && !linkedIssueIds.includes(row._id),
            )
            .map((row) => ({
              value: row._id,
              label: `${row.caseTitle || row.internalReferenceNumber || row._id} (${row.internalReferenceNumber || "-"})`,
              issue: row,
            })),
        );
      } catch {
        if (requestId === requestIdRef.current) setSearchOptions([]);
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 300);
  };

  const handleSelect = (id, option) => {
    if (!id) return;
    if (option?.issue) {
      setLabels((prev) => ({
        ...prev,
        [id]: {
          caseTitle: option.issue.caseTitle || option.issue.internalReferenceNumber || id,
          internalReferenceNumber: option.issue.internalReferenceNumber || null,
        },
      }));
    }
    onAdd(id);
    setSearchOptions([]);
  };

  const openIssue = (id) => {
    navigate(
      { pathname: "/CasesDetails", search: `?issueId=${id}` },
      {
        state: {
          issueId: id,
          recordName: labels[id]?.caseTitle,
          caseId: labels[id]?.internalReferenceNumber,
        },
      },
    );
  };

  return (
    <div className="linked-cases-picker">
      <Select
        showSearch
        allowClear={false}
        disabled={disabled}
        placeholder="Search case by reference or title..."
        value={undefined}
        filterOption={false}
        notFoundContent={searching ? <Spin size="small" /> : null}
        onSearch={runSearch}
        onChange={handleSelect}
        options={searchOptions}
        style={{ width: "100%" }}
      />
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {linkedIssueIds.length === 0 && (
          <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>
            No linked cases.
          </span>
        )}
        {linkedIssueIds.map((id) => (
          <Tag
            key={id}
            closable={!disabled}
            onClose={() => onRemove(id)}
            closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
            onClick={() => openIssue(id)}
            style={{ cursor: "pointer" }}
            title="Open case"
          >
            {labels[id]?.caseTitle || id}
          </Tag>
        ))}
      </div>
    </div>
  );
}

export default LinkedCasesPicker;
