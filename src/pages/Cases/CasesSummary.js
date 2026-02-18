import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Statistic, Tag, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import MyTable from "../../component/common/MyTable";
import { useCasesEdit } from "../../context/CasesEditContext";
import { useSelectedIds } from "../../context/SelectedIdsContext";

const initialGridData = [
    {
      key: "1",
      "Issue ID": "C-001",
      Title: "Critical AML Indicator Flag",
      "Incident Date": "2024-03-05",
      Location: "Region 4",
      Category: "Compliance",
      "Case Type": "Compliance",
      Status: "Open",
      Priority: "High",
      "Due Date": "2024-03-20",
      "Pertinent to File Review": true,
      "File Number": "CFN-88210",
      Assignee: "Legal Team",
      "Related Member(s)": "Sarah C., Michael S., David W.",
    },
    {
      key: "2",
      "Issue ID": "C-002",
      Title: "Suspicious Transaction Pattern Detected",
      "Incident Date": "2024-03-04",
      Location: "Region 2",
      Category: "Risk",
      "Case Type": "Risk",
      Status: "Pending",
      Priority: "Medium",
      "Due Date": "2024-03-18",
      "Pertinent to File Review": false,
      "File Number": "CFN-88211",
      Assignee: "Support Team",
      "Related Member(s)": "Emma W., James B.",
    },
    {
      key: "3",
      "Issue ID": "C-003",
      Title: "Compliance Review Required",
      "Incident Date": "2024-03-02",
      Location: "Region 1",
      Category: "Legal",
      "Case Type": "Legal",
      Status: "Closed",
      Priority: "Low",
      "Due Date": "2024-03-15",
      "Pertinent to File Review": true,
      "File Number": "CFN-88212",
      Assignee: "HR Team",
      "Related Member(s)": "Linda K., Sarah C.",
    },
    {
      key: "4",
      "Issue ID": "C-004",
      Title: "Security Breach Investigation",
      "Incident Date": "2024-03-01",
      Location: "Region 3",
      Category: "General",
      "Case Type": "General",
      Status: "Open",
      Priority: "Critical",
      "Due Date": "2024-03-10",
      "Pertinent to File Review": false,
      "File Number": "CFN-88213",
      Assignee: "IT Team",
      "Related Member(s)": "Michael S., David W., Emma W.",
    },
  ];

function CasesSummary() {
  const navigate = useNavigate();
  const [gridData, setGridData] = useState(initialGridData);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { setSelectedCaseRows, applyCasesUpdateRef } = useCasesEdit();
  const { setSelectedIds } = useSelectedIds();

  useEffect(() => {
    applyCasesUpdateRef.current = (keys, payload) => {
      setGridData((prev) =>
        prev.map((row) => (keys.includes(row.key) ? { ...row, ...payload } : row))
      );
    };
  }, [applyCasesUpdateRef]);

  const handleSelectionChange = (keys, rows) => {
    setSelectedRowKeys(keys);
    setSelectedCaseRows(rows);
    setSelectedIds(keys);
  };

  // Status tag colors matching existing application style
  const getStatusTag = (status) => {
    const statusConfig = {
      Open: { color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f" },
      Pending: { color: "#faad14", bg: "#fffbe6", border: "#ffe58f" },
      Closed: { color: "#8c8c8c", bg: "#fafafa", border: "#d9d9d9" },
    };
    const config = statusConfig[status] || statusConfig["Pending"];
    return (
      <Tag
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: "4px",
          fontWeight: 500,
        }}
      >
        {status}
      </Tag>
    );
  };

  // Priority tag colors
  const getPriorityTag = (priority) => {
    const priorityConfig = {
      Critical: { color: "#ff4d4f", bg: "#fff2f0", border: "#ffccc7" },
      High: { color: "#fa8c16", bg: "#fff7e6", border: "#ffd591" },
      Medium: { color: "#1890ff", bg: "#e6f7ff", border: "#91d5ff" },
      Low: { color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f" },
    };
    const config = priorityConfig[priority] || priorityConfig["Medium"];
    return (
      <Tag
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: "4px",
          fontWeight: 500,
        }}
      >
        {priority}
      </Tag>
    );
  };

  const columns = [
    {
      title: "ISSUE ID",
      dataIndex: "Issue ID",
      key: "Issue ID",
      render: (text, record) => (
        <a
          style={{
            color: "#0000FF",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/CasesDetails", { state: { caseId: text } });
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "TITLE",
      dataIndex: "Title",
      key: "Title",
    },
    {
      title: "RELATED MEMBER(S)",
      dataIndex: "Related Member(s)",
      key: "Related Member(s)",
    },
    {
      title: "INCIDENT DATE",
      dataIndex: "Incident Date",
      key: "Incident Date",
    },
    {
      title: "LOCATION",
      dataIndex: "Location",
      key: "Location",
    },
    {
      title: "CATEGORY",
      dataIndex: "Category",
      key: "Category",
    },
    {
      title: "CASE TYPE",
      dataIndex: "Case Type",
      key: "Case Type",
    },
    {
      title: "STATUS",
      dataIndex: "Status",
      key: "Status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "PRIORITY",
      dataIndex: "Priority",
      key: "Priority",
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: "DUE DATE",
      dataIndex: "Due Date",
      key: "Due Date",
    },
    {
      title: "REVIEW",
      dataIndex: "Pertinent to File Review",
      key: "Pertinent to File Review",
      width: 120,
      render: (value) => <Switch checked={value} disabled size="small" />,
    },
    {
      title: "FILE NUMBER",
      dataIndex: "File Number",
      key: "File Number",
    },
    {
      title: "ASSIGNEE",
      dataIndex: "Assignee",
      key: "Assignee",
    },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, padding: "0 34px" }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stats-card">
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Open Issues
                </span>
              }
              value={124}
              valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
              suffix={
                <span
                  style={{
                    color: "#52c41a",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  (+5%)
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stats-card">
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Critical Issues
                </span>
              }
              value={12}
              valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
              suffix={
                <span
                  style={{
                    color: "#52c41a",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  (+2%)
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stats-card">
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                  Pending Review
                </span>
              }
              value={45}
              valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
              suffix={
                <span
                  style={{
                    color: "#ff4d4f",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  (-1%)
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <MyTable
        dataSource={gridData}
        columns={columns}
        selection={true}
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectionChange,
        }}
        onRowClick={(record) =>
          navigate("/CasesDetails", { state: { caseId: record["Issue ID"] } })
        }
      />
    </div>
  );
}

export default CasesSummary;
