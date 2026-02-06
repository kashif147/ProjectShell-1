import { useState, useContext, useEffect } from "react";
import { Row, Col, Button, Tabs, Table, message } from "antd";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import TrigerBatchMemberDrawer from "../../component/finanace/TrigerBatchMemberDrawer";
import { ExcelContext } from "../../context/ExcelContext";
import "../../styles/ManualEntry.css";
import ManualPaymentEntryDrawer from "../../component/finanace/ManualPaymentEntryDrawer";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { formatCurrency } from "../../utils/Utilities";
import { paymentTypes } from "../../Data";
import CustomSelect from "../../component/common/CustomSelect";
import MyDatePicker from "../../component/common/MyDatePicker";
import MyInput from "../../component/common/MyInput";
import moment from 'moment';

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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { batchId } = useParams();
  const location = useLocation();

  const batches = useSelector(state => state.batches.batches);
  const { excelData, uploadedFile, batchTotals } = useContext(ExcelContext);

  // Find the current batch with proper date handling
  const locationBatchData = location.state?.batchData;
  const batchFromRedux = batchId ? batches.find(batch => batch.id === parseInt(batchId)) : null;

  const currentBatch = locationBatchData || batchFromRedux || excelData;
  const batchInfo = currentBatch || {};

  // Helper function to safely parse dates
  const getSafeDate = (dateValue) => {
    if (!dateValue) return null;
    if (moment.isMoment(dateValue)) return dateValue;
    return moment(dateValue);
  };

  const members = Array.isArray(batchInfo?.members) ? batchInfo.members : [];

  const onSelectAll = (checked) => {
    if (checked) {
      const allKeys = members.map((item, index) => item.id || index);
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const onSelectSingle = (record, selected) => {
    if (selected) {
      onSelectAll(true);
    } else {
      onSelectAll(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onSelect: onSelectSingle,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // Calculate totals
  const totalValue = members.reduce((sum, member) => {
    const value = parseFloat(member["Value for Periods Selected"]) || 0;
    return sum + value;
  }, 0);

  const [totalValueState, setTotalValueState] = useState(0);
  const [manualPayment, setManualPayment] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [isBatchmemberOpen, setIsBatchmemberOpen] = useState(false);
  const [activeKey, setActiveKey] = useState("1");

  useEffect(() => {
    const total = members.reduce((sum, member) => {
      const value = parseFloat(member["Value for Periods Selected"]) || 0;
      return sum + value;
    }, 0);
    setTotalValueState(total);
  }, [members]);

  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);

  const columns = [
    {
      title: "Ref No (membership no on file)",
      dataIndex: "Membership No",
      key: "refNo",
      ellipsis: true,
      width: 180,
    },
    {
      title: "Full Name",
      dataIndex: "Full name",
      key: "fullName",
      ellipsis: true,
      width: 150,
      render: (text, record) => text || `${record["First name"] || ''} ${record["Last name"] || ''}`.trim(),
    },
    {
      title: "Amount",
      dataIndex: "Value for Periods Selected",
      key: "amount",
      ellipsis: true,
      width: 120,
      render: (value) => formatCurrency(value || 0),
    },
    {
      title: "Membership No (in system)",
      dataIndex: "systemMembershipNo",
      key: "systemMembershipNo",
      ellipsis: true,
      width: 180,
    },
    {
      title: "Member Name",
      dataIndex: "systemMemberName",
      key: "systemMemberName",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Payroll No",
      dataIndex: "Payroll No",
      key: "payrollNo",
      ellipsis: true,
      width: 120,
    },
    {
      title: "Batch Ref No",
      key: "batchRefNo",
      ellipsis: true,
      width: 150,
      render: () => batchInfo.batchRef || "",
    },
    {
      title: "Description",
      key: "description",
      ellipsis: true,
      width: 200,
      render: () => batchInfo.description || batchInfo.comments || "",
    },
    {
      title: "Comments",
      dataIndex: "Comments",
      key: "comments",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Payment Date",
      key: "paymentDateColumn",
      ellipsis: true,
      width: 130,
      render: () => displayBatchDate ? displayBatchDate.format("MM/YYYY") : "",
    },
    {
      title: "Work Location",
      key: "workLocationColumn",
      ellipsis: true,
      width: 150,
      render: () => batchInfo.workLocation || "",
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
            rowSelection={rowSelection}
            rowKey={(record, index) => record.id || index}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
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
            dataSource={[]}
            pagination={false}
          />
        </div>
      ),
    },
  ];

  const onChange = (key) => setActiveKey(key);

  // Get display values with fallbacks
  const displayBatchDate = getSafeDate(batchInfo.batchDate);
  const displayCreatedAt = getSafeDate(batchInfo.createdAt);
  const displayPaymentType = batchInfo.PaymentType || batchInfo.batchType;
  const displayComments = batchInfo.Comments || batchInfo.comments;
  const displayArrears = batchInfo.arrears || batchTotals?.arrears || 0;
  const displayAdvance = batchInfo.advance || batchTotals?.advance || 0;
  const displayTotalCurrent = batchInfo.totalCurrent || batchTotals?.totalCurrent || totalValueState;
  const displayTotal = batchInfo.total || batchTotals?.total || totalValueState;
  const displayRecords = batchInfo.Count || members?.length || 0;

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
        <Col span={3}>
          <CustomSelect
            label="Batch Type"
            value={displayPaymentType || ""}
            disabled
            options={(paymentTypes || []).map((p) => ({ value: p.value || p, label: p.label || p }))}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={3}>
          <MyDatePicker
            label="Payment Date"
            value={displayBatchDate}
            disabled
            picker="month"
            format="MM/YYYY"
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={4}>
          <MyInput
            label="Work Location"
            value={batchInfo.workLocation || ""}
            disabled
          />
        </Col>
        <Col span={4}>
          <label>Batch Ref No</label>
          <input value={batchInfo.batchRef || ""} disabled style={inputStyle} />
        </Col>
        <Col span={7}>
          <label>Comments</label>
          <input value={displayComments || ""} disabled style={inputStyle} />
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
          <input value={formatCurrency(displayArrears)} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <MyInput
            label="Total Current (€)"
            value={formatCurrency(displayTotalCurrent)}
            disabled
          />
        </Col>
        <Col span={4}>
          <label>Total Advance (€)</label>
          <input value={formatCurrency(displayAdvance)} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Batch Total (€)</label>
          <input value={formatCurrency(displayTotal)} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Total Records</label>
          <input value={displayRecords} disabled style={inputStyle} />
        </Col>
      </Row>

      {/* Batch Info Display */}
      {batchInfo.batchName && (
        <Row
          gutter={[16, 16]}
          style={{ paddingLeft: "35px", paddingRight: "35px", paddingBottom: "10px" }}
        >
          <Col span={24}>
            <div style={{
              background: "#f0f8ff",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #d6e9ff"
            }}>
              <strong>Batch: </strong>{batchInfo.batchName} |
              <strong> Status: </strong>{batchInfo.batchStatus} |
              <strong> Created By: </strong>{batchInfo.createdBy} |
              <strong> Created At: </strong>{displayCreatedAt ? displayCreatedAt.format('DD/MM/YYYY HH:mm') : 'N/A'}
            </div>
          </Col>
        </Row>
      )}

      {/* Buttons */}
      <Row
        gutter={[16, 16]}
        style={{ paddingLeft: "35px", paddingRight: "35px", paddingBottom: "20px" }}
      >
        <Col span={8}>
          <div className="d-flex gap-2">
            <Button
              style={{
                backgroundColor: "#215e97",
                color: "white",
                borderRadius: "3px",
                width: "100%",
              }}
              onClick={() => setManualPayment(true)}
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
        <Col span={4} offset={12}>
          <Button
            style={{
              backgroundColor: "#215e97",
              color: "white",
              borderRadius: "3px",
              width: "100%",
            }}
            onClick={() => message.success("Batch Triggered Successfully")}
          >
            Trigger Batch
          </Button>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeKey} items={items} onChange={onChange} className="batch-tabs" />

      {/* Drawers */}
      <TrigerBatchMemberDrawer
        isOpen={isBatchmemberOpen}
        onClose={() => setIsBatchmemberOpen(!isBatchmemberOpen)}
      />

      <ManualPaymentEntryDrawer
        open={manualPayment}
        onClose={() => setManualPayment(!manualPayment)}
        batchSummryData={{
          PaymentType: displayPaymentType,
          total: displayTotalCurrent,
          batchRef: batchInfo?.batchRef
        }}
      />
    </div>
  );
}

export default BatchMemberSummary;