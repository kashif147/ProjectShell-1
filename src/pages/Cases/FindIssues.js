import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Table, Tag, Empty, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { searchIssues } from "../../services/issuesApi";
import { enumLabel, ISSUE_TYPE_LABELS } from "../../component/cases/issueOptions";

// Standalone "Find Issues" page - closes the requirements-doc gap ("User should be able to
// find a query or issue by a variety of criteria. Including Unique reference number,
// membership no, surname, mobile, email, NMBI, issue type, workplace, WRC case number").
// Deliberately a plain page, not a grid-with-Save-View: this is a one-off lookup tool, not
// a persistent listing (see TEMPLATE_IMPLEMENTATION_PLAYBOOK.md at the repo root for why
// grid pages carry Template/Save-View plumbing and this one intentionally doesn't).
//
// Hits GET /api/issues/search?q= (issue.controller.js's searchIssues) via
// services/issuesApi.js's searchIssues(). That endpoint matches internalReferenceNumber/
// caseFileNumber/wrcCaseNumber locally, issueType on exact match, and membership no/email/
// surname/forename/mobile via profile-service's member search - it does NOT match dob/NMBI/
// address, and does NOT match workplace at all (a documented backend gap, not something to
// work around here).
const DEBOUNCE_MS = 300;

function priorityColor(priority) {
  if (priority === "HIGH") return "red";
  if (priority === "MEDIUM") return "gold";
  if (priority === "LOW") return "green";
  return "default";
}

function statusColor(status) {
  if (status === "CLOSED") return "default";
  return "blue";
}

function FindIssues() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  // Debounce the raw input, same 300ms convention used by MemberSearch.jsx's search box.
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [query]);

  const runSearch = useCallback((q) => {
    if (!q) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setHasSearched(true);

    searchIssues(q)
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setResults(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        message.error(
          error?.response?.data?.message || error?.message || "Issue search failed",
        );
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const goToIssue = (issueId) => {
    if (!issueId) return;
    navigate("/CasesDetails", { state: { issueId } });
  };

  const columns = [
    {
      title: "Issue Type",
      dataIndex: "issueType",
      key: "issueType",
      width: 160,
      render: (value) => ISSUE_TYPE_LABELS[value] || enumLabel(value) || "-",
    },
    {
      title: "Case Title / Reference",
      key: "caseTitleOrReference",
      render: (_, record) => record.caseTitle || record.internalReferenceNumber || "-",
    },
    {
      title: "Reference Number",
      dataIndex: "internalReferenceNumber",
      key: "internalReferenceNumber",
      width: 180,
    },
    {
      title: "Case Status",
      dataIndex: "issueStatus",
      key: "issueStatus",
      width: 160,
      render: (value) =>
        value ? <Tag color={statusColor(value)}>{enumLabel(value)}</Tag> : "-",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (value) =>
        value ? <Tag color={priorityColor(value)}>{enumLabel(value)}</Tag> : "-",
    },
    {
      title: "Owner Team",
      key: "ownerTeam",
      width: 160,
      render: (_, record) =>
        record.owner?.team ? enumLabel(record.owner.team) : "Unassigned",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>Find Issues</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Search by unique reference number, membership number, surname, mobile, email, issue
        type or WRC case number.
      </p>

      <Input
        allowClear
        size="large"
        placeholder="Search issues..."
        prefix={<SearchOutlined />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ maxWidth: 480, marginBottom: 20 }}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={results}
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        locale={{
          emptyText: (
            <Empty
              description={
                !hasSearched
                  ? "Start typing to search issues"
                  : "No issues found"
              }
            />
          ),
        }}
        onRow={(record) => ({
          onClick: () => goToIssue(record._id),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
}

export default FindIssues;
