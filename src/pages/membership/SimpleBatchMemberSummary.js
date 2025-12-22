import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Button, Space, Tabs, Table } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
import moment from "moment";
import { tableData } from "../../Data"; // Assuming batch data comes from here
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { useEffect } from "react";

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


const columns = [
  {
    title: "Full Name",
    dataIndex: "fullName",
    key: "fullName",
    ellipsis: true,
    width: 180,
  },
  {
    title: "Membership No",
    dataIndex: "membershipNo",
    key: "membershipNo",
    ellipsis: true,
    width: 140,
  },
  {
    title: "Address",
    key: "address",
    ellipsis: true,
    width: 300,
    render: (_, record) => (
      <>
        {[
          record.addressLine1,
          record.addressLine2,
          record.addressLine3,
          record.addressCity,
          record.addressCounty,
          record.addressPostcode,
        ]
          .filter(Boolean)
          .join(", ")}
      </>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    ellipsis: true,
    width: 200,
  },
  {
    title: "Mobile",
    dataIndex: "mobileNumber",
    key: "mobileNumber",
    ellipsis: true,
    width: 150,
  },
];


function SimpleBatchMemberSummary() {
  const location = useLocation();
  const dispatch = useDispatch();
  const exportToExcel = () => {
    if (!members.length) return;

    const excelData = members.map((m) => ({
      "Full Name": m.fullName,
      "Membership No": m.membershipNo,
      "Address": [
        m.addressLine1,
        m.addressLine2,
        m.addressLine3,
        m.addressCity,
        m.addressCounty,
        m.addressPostcode,
      ].filter(Boolean).join(", "),
      "Email": m.email,
      "Mobile": m.mobileNumber,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Batch Members");

    // Create a binary array
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // Create a Blob
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Create a temporary <a> element
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Batch_Members_${batchInfo.batchName || "Data"}.xlsx`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const {
    loadingBatches,
    batchesData,
    batchesError
  } = useSelector((state) => state.batchMember);

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
  useEffect(() => {
    dispatch(fetchBatchesByType({
      type: 'new',
      page: 1,
      limit: 500
    }))
  }, [batchesData])
  useEffect(() => {

  }, [batchesData])
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
      {/* <Row
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
      </Row> */}

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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side Buttons */}
        <Col>
          <Space size="middle">
            <Button style={buttonStyle}>Include</Button>
            <CommonPopConfirm title="Do you want to exclude member?">
              <Button style={buttonStyle}>Exclude Members</Button>
            </CommonPopConfirm>
          </Space>
        </Col>

        {/* Right Side Export Button */}
        <Col>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={exportToExcel}
            style={{
              backgroundColor: "#3b7ddd", // slightly different shade from other buttons
              borderColor: "#3b7ddd",
              color: "white",
              borderRadius: "6px",
              minWidth: "120px",
              fontWeight: "500",
            }}
          >
            Export XLS
          </Button>
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