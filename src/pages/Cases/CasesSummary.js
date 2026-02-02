import React from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Statistic, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import MyTable from "../../component/common/MyTable";

function CasesSummary() {
  const navigate = useNavigate();

  const gridData = [
    {
      key: "1",
      "Issue ID": "C-001",
      "Status": "Open",
      Priority: "High",
      Assignee: "Legal Team",
      "Incident Date": "2024-03-05",
    },
    {
      key: "2",
      "Issue ID": "C-002",
      "Status": "Pending",
      Priority: "Medium",
      Assignee: "Support Team",
      "Incident Date": "2024-03-04",
    },
    {
      key: "3",
      "Issue ID": "C-003",
      "Status": "Closed",
      Priority: "Low",
      Assignee: "HR Team",
      "Incident Date": "2024-03-02",
    },
    {
      key: "4",
      "Issue ID": "C-004",
      "Status": "Open",
      Priority: "Critical",
      Assignee: "IT Team",
      "Incident Date": "2024-03-01",
    },
  ];

  // Status tag colors matching existing application style
  const getStatusTag = (status) => {
    const statusConfig = {
      'Open': { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
      'Pending': { color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
      'Closed': { color: '#8c8c8c', bg: '#fafafa', border: '#d9d9d9' },
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <Tag style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '4px',
        fontWeight: 500,
      }}>
        {status}
      </Tag>
    );
  };

  // Priority tag colors
  const getPriorityTag = (priority) => {
    const priorityConfig = {
      'Critical': { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7' },
      'High': { color: '#fa8c16', bg: '#fff7e6', border: '#ffd591' },
      'Medium': { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
      'Low': { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
    };
    const config = priorityConfig[priority] || priorityConfig['Medium'];
    return (
      <Tag style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '4px',
        fontWeight: 500,
      }}>
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
            color: '#0000FF',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/CasesDetails", { state: { caseId: text } });
          }}
        >
          {text}
        </a>
      )
    },
    {
      title: "STATUS",
      dataIndex: "Status",
      key: "Status",
      render: (status) => getStatusTag(status)
    },
    {
      title: "PRIORITY",
      dataIndex: "Priority",
      key: "Priority",
      render: (priority) => getPriorityTag(priority)
    },
    {
      title: "ASSIGNED TEAM",
      dataIndex: "Assignee",
      key: "Assignee",
    },
    {
      title: "LAST UPDATED",
      dataIndex: "Incident Date",
      key: "Incident Date",
    },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, padding: "0 34px" }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stats-card">
            <Statistic
              title={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>Open Issues</span>}
              value={124}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              suffix={<span style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'normal' }}>(+5%)</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stats-card">
            <Statistic
              title={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>Critical Issues</span>}
              value={12}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              suffix={<span style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'normal' }}>(+2%)</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stats-card">
            <Statistic
              title={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>Pending Review</span>}
              value={45}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              suffix={<span style={{ color: '#ff4d4f', fontSize: '14px', fontWeight: 'normal' }}>(-1%)</span>}
            />
          </Card>
        </Col>
      </Row>

      <MyTable
        dataSource={gridData}
        columns={columns}
        onRowClick={(record) => navigate("/CasesDetails", { state: { caseId: record["Issue ID"] } })}
      />
    </div>
  );
}

export default CasesSummary;
