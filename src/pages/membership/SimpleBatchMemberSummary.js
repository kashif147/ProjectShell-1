import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Button, Space, Tabs, Table } from "antd";
import moment from "moment";
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

const buttonStyle = {
  backgroundColor: "#215e97",
  color: "white",
  borderRadius: "3px",
  minWidth: "150px",
};

// Table columns configuration
const columns = [
  {
    title: "First name",
    dataIndex: "First name",
    ellipsis: true,
    width: 150,
    render: (_, record) =>
      `${record["First name"] || ""} ${record["Last name"] || ""}`.trim(),
  },
  {
    dataIndex: "Last name",
    title: "Last name",
    ellipsis: true,
    width: 150,
  },
  {
    dataIndex: "Membership No",
    title: "Membership No",
    ellipsis: true,
    width: 150,
  },
  {
    dataIndex: "Value for Periods Selected",
    title: "Value for Periods Selected",
    ellipsis: true,
    width: 150,
  },
  {
    dataIndex: "Arrears",
    title: "Arrears",
    ellipsis: true,
    width: 150,
  },
  {
    dataIndex: "Comments",
    title: "Comments",
    ellipsis: true,
    width: 150,
  },
  {
    dataIndex: "Advance",
    title: "Advance",
    ellipsis: true,
    width: 100,
  },
  {
    dataIndex: "Total Amount",
    title: "Total Amount",
    ellipsis: true,
    width: 100,
  },
];

function SimpleBatchMemberSummary() {
  const location = useLocation();
  const { batchName, batchId } = location.state || {};
  const [activeKey, setActiveKey] = useState("1");

  // Find the current batch data
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
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Table
            columns={columns}
            dataSource={members}
            className="mt-2"
            rowKey={(record) => record.id || record["Membership No"]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 'max-content' }}
            bordered
            size="middle"
          />
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
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Table
            columns={columns}
              className="mt-2"
            dataSource={[]}
            rowKey={(record) => record.id || record["Membership No"]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 'max-content' }}
            bordered
            size="middle"
            locale={{ emptyText: "No exceptions found" }}
          />
        </div>
      ),
    },
  ];

  const onChange = (key) => {
    setActiveKey(key);
  };

  const handleTrigger = () => {
    // Add your trigger button logic here
    console.log("Trigger button clicked");
  };

  return (
    <div>
      {/* Trigger Button Row - Placed ABOVE the header fields */}
      <Row
        style={{
     padding: "5px 35px 0px 35px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Col span={24} style={{ textAlign: "right" }}>
          <Button
            onClick={handleTrigger}
            style={{
              backgroundColor: "#215e97",
              color: "white",
              borderRadius: "6px",
              padding: "6px 20px",
              height: "auto",
              fontWeight: "500",
              border: "1px solid #215e97",
              minWidth: "120px",
            }}
          >
            Trigger
          </Button>
        </Col>
      </Row>

      {/* Header Info - BELOW the trigger button */}
      <Row
        gutter={[16, 16]}
        style={{
          padding: "0px 35px 20px 35px",
          alignItems: "flex-end",
        }}
      >
        <Col span={6}>
          <label>Batch Name</label>
          <input
            value={batchInfo.batchName || ""}
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Batch Date</label>
          <input
            value={
              displayBatchDate ? displayBatchDate.format("DD/MM/YYYY") : ""
            }
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Batch Status</label>
          <input
            value={batchInfo.batchStatus || ""}
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={6}>
          <label>Created By</label>
          <input
            value={batchInfo.createdBy || ""}
            disabled
            style={inputStyle}
          />
        </Col>
      </Row>

      {/* Buttons */}
      <Row
        style={{
          paddingLeft: "35px",
          paddingRight: "35px",
          paddingBottom: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Col span={24}>
          <Space size="middle">
            <Button style={buttonStyle}>
              Include
            </Button>
            <CommonPopConfirm title="Do you want to exclude member?">
              <Button style={buttonStyle}>Exclude Members</Button>
            </CommonPopConfirm>
          </Space>
        </Col>
      </Row>

      {/* Tabs */}
      <div style={{ padding: "0 35px" }}>
        <Tabs
          activeKey={activeKey}
          items={items}
          onChange={onChange}
          className="batch-tabs"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export default SimpleBatchMemberSummary;