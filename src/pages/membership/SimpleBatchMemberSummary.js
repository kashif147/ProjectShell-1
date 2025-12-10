import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Button, Space, Tabs } from "antd";
import moment from "moment";
import TableComponent from "../../component/common/TableComponent";
import { tableData } from "../../Data"; // Assuming batch data comes from here
import CommonPopConfirm from "../../component/common/CommonPopConfirm";

const inputStyle = {
  width: "100%",
  padding: "6px 11px",
  borderRadius: "6px",
  border: "1px solid #d9d9d9",
  backgroundColor: "#f5f5f5",
  color: "rgba(0, 0, 0, 0.85)",
  display: "block",
  marginTop: "4px",
};

function SimpleBatchMemberSummary() {
  const location = useLocation();
  const { batchName, batchId } = location.state || {};
  const [activeKey, setActiveKey] = useState("1");

  // Find the current batch data. In a real app, this would be an API call.
  const currentBatch = tableData.find(
    (b) => b.id === batchId || b.batchName === batchName
  );

  const batchInfo = currentBatch || {};
  const members = Array.isArray(batchInfo.members) ? batchInfo.members : [];

  const getSafeDate = (dateValue) => {
    if (!dateValue) return null;
    if (moment.isMoment(dateValue)) return dateValue;
    return moment(dateValue);
  };

  const displayBatchDate = getSafeDate(batchInfo.batchDate);

  const items = [
    {
      key: "1",
      label: "Batch Payments",
      children: (
        <div
          className="common-table"
          style={{
            paddingLeft: "34px",
            paddingRight: "34px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <TableComponent data={members} screenName="BatchMemberSummary" />
        </div>
      ),
    },
    {
      key: "2",
      label: "Exceptions",
      children: (
        <div
          className="common-table"
          style={{
            paddingLeft: "34px",
            paddingRight: "34px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <TableComponent data={[]} screenName="BatchMemberSummary" />
        </div>
      ),
    },
  ];

  const onChange = (key) => {
    setActiveKey(key);
  };

  const buttonStyle = {
    backgroundColor: "#215e97",
    color: "white",
    borderRadius: "3px",
    width: "100%",
  };

  return (
    <div>
      {/* Header Info */}
      <Row
        gutter={[16, 16]}
        style={{
          padding: "20px 35px",
        }}
      >
        <Col span={6}>
          <label>Batch Name</label>
          <input value={batchInfo.batchName || ""} disabled style={inputStyle} />
        </Col>
        <Col span={6}>
          <label>Batch Date</label>
          <input
            value={displayBatchDate ? displayBatchDate.format("DD/MM/YYYY") : ""}
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Batch Status</label>
          <input value={batchInfo.batchStatus || ""} disabled style={inputStyle} />
        </Col>
        <Col span={6}>
          <label>Created By</label>
          <input value={batchInfo.createdBy || ""} disabled style={inputStyle} />
        </Col>
      </Row>

      {/* Buttons */}
      <Row
        gutter={[16, 16]}
        style={{ paddingLeft: "35px", paddingRight: "35px", paddingBottom: "20px" }}
      >
        <Col span={4}>
          <Space>
            <Button style={buttonStyle}>
              Include
            </Button>
            <CommonPopConfirm
              title="Do you want to exclude member?"
            >
              <Button style={buttonStyle}>Exclude Members</Button>
            </CommonPopConfirm>
          </Space>
        </Col>
      </Row>
      <Tabs activeKey={activeKey} items={items} onChange={onChange} className="batch-tabs" />
    </div>
  );
}

export default SimpleBatchMemberSummary;