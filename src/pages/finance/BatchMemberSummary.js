import { useState, useContext, useEffect } from "react";
import { Row, Col, Button, Tabs, Table, message } from "antd";
import TrigerBatchMemberDrawer from "../../component/finanace/TrigerBatchMemberDrawer";
import { ExcelContext } from "../../context/ExcelContext";
import "../../styles/ManualEntry.css";
import ManualPaymentEntry from "../../component/finanace/ManualPaymentEntry";
import MyDrawer from "../../component/common/MyDrawer";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { formatCurrency } from "../../utils/Utilities";
import { paymentTypes } from "../../Data";
import CustomSelect from "../../component/common/CustomSelect";
import MyDatePicker from "../../component/common/MyDatePicker";
import MyInput from "../../component/common/MyInput";
import moment from 'moment'
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

function BatchMemberSummary() {
  const { excelData, uploadedFile, batchTotals } = useContext(ExcelContext);
  const batchInfo = excelData || {};
  const members = Array.isArray(batchInfo?.members)
    ? batchInfo.members
    : Array.isArray(excelData)
      ? excelData
      : [];
  const totalValue = members.reduce((sum, member) => {
    const value = parseFloat(member["Value for Periods Selected"]) || 0;
    return sum + value;
  }, 0);
  const [totalValueState, setTotalValueState] = useState(0);
  useEffect(() => {
  const total = members.reduce((sum, member) => {
    const value = parseFloat(member["Value for Periods Selected"]) || 0;
    return sum + value;
  }, 0);
  setTotalValueState(total);
}, [members]);
  debugger

  const [manualPayment, setmanualPayment] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [isBatchmemberOpen, setIsBatchmemberOpen] = useState(false);
  const [activeKey, setactiveKey] = useState("1");

  const columns = [
    {
      title: "Full Name",
      dataIndex: "Full name",
      key: "Full name",
      ellipsis: true,
      width: 150,
      render: (_, record) => record["Full name"] || "",
    },
    {
      title: "Member Name",
      dataIndex: "Member Name",
      key: "Member Name",
      ellipsis: true,
      width: 150,
      render: (_, record) => record["Full name"] || "",
    },
    {
      title: "Bank Account",
      dataIndex: "Bank Account",
      key: "Bank Account",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Payroll No",
      dataIndex: "Payroll No",
      key: "Payroll No",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Arrears",
      dataIndex: "Arrears",
      key: "Arrears",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Comments",
      dataIndex: "Comments",
      key: "Comments",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Advance",
      dataIndex: "Advance",
      key: "Advance",
      ellipsis: true,
      width: 100,
    },
    {
      title: "Total Amount",
      dataIndex: "Total Amount",
      key: "Total Amount",
      ellipsis: true,
      width: 100,
      render: (_, record) => formatCurrency(record["Value for Periods Selected"]),
    },
  ];

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
          <Table
            style={{ tableLayout: "fixed" }}
            bordered
            rowClassName={() => ""}
            scroll={{ x: 1500, y: 800 }}
            size="small"
            columns={columns}
            dataSource={members}
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
            paddingLeft: "34px",
            paddingRight: "34px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Table
            style={{ tableLayout: "fixed" }}
            bordered
            rowClassName={() => ""}
            scroll={{ x: 1500, y: 800 }}
            size="small"
            columns={columns}
            dataSource={members}
          />
        </div>
      ),
    },
  ];

  const onChange = (key) => setactiveKey(key);

  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);

  return (
    <div>
      {/* Header Info */}
      <Row
        gutter={[16, 16]}
        style={{
          paddingLeft: "35px",
          paddingRight: "35px",
          paddingBottom: "20px",
          paddingTop: "20px",
        }}
      >
        <Col span={4}>
          <CustomSelect
            label="Batch Type"
            value={batchInfo.PaymentType || ""}
            disabled
            options={(paymentTypes || []).map((p) => ({ value: p.value || p, label: p.label || p }))}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={4}>
          <MyDatePicker
            label="Batch Date"
            value={batchInfo.batchDate || ""}
            disabled
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={6}>
          <label>Batch Ref No</label>
          <input value={batchInfo.batchRef || ""} disabled style={inputStyle} />
        </Col>
        <Col span={7}>
          <label>Comments</label>
          <input value={batchInfo.Comments || ""} disabled style={inputStyle} />
        </Col>
        <Col span={3}>
          <label>Source</label>
          <br />
          {uploadedFile ? (
            <a href={fileUrl} download={uploadedFile.name} style={{ color: "#215e97" }}>
              {uploadedFile.name}
            </a>
          ) : (
            <span style={{ color: "#888" }}>No file uploaded</span>
          )}
        </Col>
      </Row>

      {/* Totals */}
      <Row
        gutter={[16, 16]}
        style={{ paddingLeft: "35px", paddingRight: "35px", paddingBottom: "20px" }}
      >
        <Col span={4}>
          <label>Total Arrears (€)</label>
          <input value={`€0.00`} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          {/* <label></label> */}
          <MyInput label="Total Current (€)" value={`€${totalValueState || 0}`} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Total Advance</label>
          <input value={`€0.00`} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Batch Total (€)</label>
          <input value={`€${totalValueState?.toLocaleString() || 0}`} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Total Records</label>
          <input value={members?.length || 0} disabled style={inputStyle} />
        </Col>
      </Row>

      {/* Buttons */}
      <Row
        gutter={[16, 16]}
        style={{ paddingLeft: "35px", paddingRight: "35px", paddingBottom: "20px" }}
      >
        <Col span={4}>
          <div className="d-flex gap-2">
            <Button
              style={{
                backgroundColor: "#215e97",
                color: "white",
                borderRadius: "3px",
                width: "100%",
              }}
              onClick={() => setmanualPayment(true)}
            >
              Add Members
            </Button>
            <CommonPopConfirm
              title="Do you want to exclude member?"
              onConfirm={() => message.info("Member excluded")}
            >
              <Button
                style={{
                  backgroundColor: "#215e97",
                  color: "white",
                  borderRadius: "3px",
                  width: "100%",
                }}
              >
                Exclude Members
              </Button>
            </CommonPopConfirm>
          </div>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeKey} items={items} onChange={onChange} className="batch-tabs" />

      {/* Drawers */}
      <TrigerBatchMemberDrawer
        isOpen={isBatchmemberOpen}
        onClose={() => setIsBatchmemberOpen(!isBatchmemberOpen)}
      />
      <MyDrawer
        open={manualPayment}
        onClose={() => setmanualPayment(!manualPayment)}
        title={"Manual Payment Entry"}
        width={760}
        isManual={true}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">

          <ManualPaymentEntry />
        </div>
      </MyDrawer>
    </div>
  );
}

export default BatchMemberSummary;
