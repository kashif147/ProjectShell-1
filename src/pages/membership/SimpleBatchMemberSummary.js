import React from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Typography } from "antd";
import moment from "moment";
import TableComponent from "../../component/common/TableComponent";
import { tableData } from "../../Data"; // Assuming batch data comes from here

const { Title, Text } = Typography;

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

      <TableComponent data={members} screenName="BatchMemberSummary" />
    </div>
  );
}

export default SimpleBatchMemberSummary;