import React, { useState } from "react";
import { Card, Select, Button, Space } from "antd";
import ReportViewer from "./ReportViewer";
import "./ReportViewer.css";

const { Option } = Select;

const ReportViewerDemo = () => {
  const [selectedReport, setSelectedReport] = useState("payments");
  const [filters, setFilters] = useState({});

  const reportTypes = [
    { value: "payments", label: "Payments Report" },
    { value: "members", label: "Members Report" },
    { value: "revenue", label: "Revenue Report" },
    { value: "cancelled-members", label: "Cancelled Members" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Space style={{ marginBottom: "24px" }}>
          <span>Select Report Type:</span>
          <Select
            style={{ width: 200 }}
            value={selectedReport}
            onChange={setSelectedReport}
          >
            {reportTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Space>

        <ReportViewer reportType={selectedReport} filters={filters} />
      </Card>
    </div>
  );
};

export default ReportViewerDemo;

