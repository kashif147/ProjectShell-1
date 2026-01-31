import React from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Statistic } from "antd";
import { tableData } from "../../Data";
import { useNavigate } from "react-router-dom";
import MyTable from "../../component/common/MyTable";


function CasesSummary() {
  const navigate = useNavigate();

  const gridData = [
    {
      key: "1",
      "Case ID": "C-001",
      "case Status": "Open",
      Priority: "High",
      Assignee: "Legal Team",
      "Incident Date": "2024-03-05",
    },
    {
      key: "2",
      "Case ID": "C-002",
      "case Status": "Pending",
      Priority: "Medium",
      Assignee: "Support Team",
      "Incident Date": "2024-03-04",
    },
    {
      key: "3",
      "Case ID": "C-003",
      "case Status": "Closed",
      Priority: "Low",
      Assignee: "HR Team",
      "Incident Date": "2024-03-02",
    },
    {
      key: "4",
      "Case ID": "C-004",
      "case Status": "Open",
      Priority: "Critical",
      Assignee: "IT Team",
      "Incident Date": "2024-03-01",
    },
  ];

  const columns = [
    {
      title: "CASE ID",
      dataIndex: "Case ID",
      key: "Case ID",
      render: (text, record) => (
        <span
          style={{ color: '#1890ff', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/CasesDetails", { state: { caseId: text } });
          }}
        >
          {text}
        </span>
      )
    },
    {
      title: "STATUS",
      dataIndex: "case Status",
      key: "case Status",
      render: (status) => (
        <span style={{
          color: status === 'Open' ? 'green' : status === 'Pending' ? 'orange' : 'gray',
          fontWeight: 500
        }}>
          {status}
        </span>
      )
    },
    {
      title: "PRIORITY",
      dataIndex: "Priority",
      key: "Priority",
      render: (priority) => (
        <span style={{
          color: priority === 'Critical' ? 'red' : priority === 'High' ? 'orange' : 'blue'
        }}>
          {priority}
        </span>
      )
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
              title={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>Open Cases</span>}
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
        onRowClick={(record) => navigate("/CasesDetails", { state: { caseId: record["Case ID"] } })}
      />
    </div>
  );
}

export default CasesSummary;
