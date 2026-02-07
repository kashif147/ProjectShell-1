import { useState, useContext, useEffect } from "react";
import { Row, Col, Button, Tabs, Table, message, Tag, Space, Card, Input as AntInput } from "antd";
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
import Breadcrumb from "../../component/common/Breadcrumb";
import UnifiedPagination from "../../component/common/UnifiedPagination";
import moment from 'moment';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  RiseOutlined,
  CarryOutOutlined,
  UnorderedListOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  ThunderboltFilled,
  MoonOutlined,
  FolderOpenOutlined,
  CalculatorOutlined
} from "@ant-design/icons";

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

const cardStyle = {
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  height: '100%',
  border: '1px solid #e2e8f0',
};

const SummaryCard = ({ title, value, icon, color, iconBg }) => (
  <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.025em' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{value}</div>
      </div>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: iconBg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: color,
        fontSize: '16px'
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

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
      title: "REF NO",
      dataIndex: "Membership No",
      key: "refNo",
      ellipsis: true,
      width: 150,
    },
    {
      title: "FULL NAME",
      dataIndex: "Full name",
      key: "fullName",
      ellipsis: true,
      width: 180,
      render: (text, record) => text || `${record["First name"] || ''} ${record["Last name"] || ''}`.trim(),
    },
    {
      title: "AMOUNT",
      dataIndex: "Value for Periods Selected",
      key: "amount",
      ellipsis: true,
      width: 120,
      render: (value) => formatCurrency(value || 0),
    },
    {
      title: "MEMBERSHIP NO",
      dataIndex: "systemMembershipNo",
      key: "systemMembershipNo",
      ellipsis: true,
      width: 180,
    },
    {
      title: "PAYROLL NO",
      dataIndex: "Payroll No",
      key: "payrollNo",
      ellipsis: true,
      width: 120,
    },
    {
      title: "BATCH REF",
      key: "batchRefNo",
      ellipsis: true,
      width: 150,
      render: () => batchInfo.batchRef || "",
    },
    {
      title: "DESCRIPTION",
      key: "description",
      ellipsis: true,
      width: 250,
      render: () => batchInfo.description || batchInfo.comments || "",
    },
  ];

  const onChange = (key) => setActiveKey(key);

  // Get display values with fallbacks
  const displayBatchDate = getSafeDate(batchInfo.batchDate);
  const displayPaymentType = batchInfo.PaymentType || batchInfo.batchType;
  const displayComments = batchInfo.Comments || batchInfo.comments;
  const displayArrears = batchInfo.arrears || batchTotals?.arrears || 0;
  const displayAdvance = batchInfo.advance || batchTotals?.advance || 0;
  const displayTotalCurrent = batchInfo.totalCurrent || batchTotals?.totalCurrent || totalValueState;
  const displayTotal = batchInfo.total || batchTotals?.total || totalValueState;
  const displayRecords = batchInfo.Count || members?.length || 0;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '15px' }}>

      {/* Absolute Top Unified Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        // padding: '5px 10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Breadcrumb />
          {/* <Tag color="orange" style={{
            borderRadius: '12px',
            fontWeight: '700',
            padding: '2px 12px',
          }}>
            PENDING
          </Tag> */}
        </div>
        <Button
          className="butn primary-btn"
          icon={<ThunderboltFilled />}
          onClick={() => message.success("Batch Triggered Successfully")}
        >
          Trigger Batch
        </Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={4.8} style={{ width: '20%' }}>
          <SummaryCard
            title="TOTAL ARREARS"
            value={formatCurrency(displayArrears)}
            icon={<HistoryOutlined />}
            color="#ef4444"
            iconBg="#fee2e2"
          />
        </Col>
        <Col span={4.8} style={{ width: '20%' }}>
          <SummaryCard
            title="TOTAL CURRENT"
            value={formatCurrency(displayTotalCurrent)}
            icon={<FolderOpenOutlined />}
            color="#3b82f6"
            iconBg="#dbeafe"
          />
        </Col>
        <Col span={4.8} style={{ width: '20%' }}>
          <SummaryCard
            title="TOTAL ADVANCE"
            value={formatCurrency(displayAdvance)}
            icon={<RiseOutlined />}
            color="#22c55e"
            iconBg="#dcfce7"
          />
        </Col>
        <Col span={4.8} style={{ width: '20%' }}>
          <SummaryCard
            title="BATCH TOTAL"
            value={formatCurrency(displayTotal)}
            icon={<CalculatorOutlined />}
            color="#3b82f6"
            iconBg="#dbeafe"
          />
        </Col>
        <Col span={4.8} style={{ width: '20%' }}>
          <SummaryCard
            title="TOTAL RECORDS"
            value={displayRecords}
            icon={<UnorderedListOutlined />}
            color="#64748b"
            iconBg="#f1f5f9"
          />
        </Col>
      </Row>

      {/* Batch Details Card */}
      <Card
        style={{ ...cardStyle, marginBottom: '16px' }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={[20, 20]}>
          <Col span={6}>
            <CustomSelect
              label="Batch Type"
              value={displayPaymentType || ""}
              disabled
              options={(paymentTypes || []).map((p) => ({ value: p.value || p, label: p.label || p }))}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={6}>
            <MyDatePicker
              label="Payment Date"
              value={displayBatchDate}
              disabled
              picker="month"
              format="MM/YYYY"
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={6}>
            <MyInput
              label="Work Location"
              value={batchInfo.workLocation || ""}
              placeholder="Enter location..."
              disabled
            />
          </Col>
          <Col span={6}>
            <MyInput
              label="Batch Ref No"
              value={batchInfo.batchRef || ""}
              placeholder="REF-0000"
              disabled
            />
          </Col>
          <Col span={18}>
            <MyInput
              label="Comments"
              value={displayComments || ""}
              placeholder="Add optional internal comments..."
              disabled
            />
          </Col>
          <Col span={6}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Source</span>
              <div style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#64748b',
                fontSize: '13px'
              }}>
                <CloudUploadOutlined style={{ fontSize: '18px' }} />
                {uploadedFile ? (
                  <a href={fileUrl} download={uploadedFile.name} style={{ color: '#2563eb', fontWeight: '500' }}>
                    {uploadedFile.name}
                  </a>
                ) : (
                  <span>No file uploaded</span>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Unified Action Bar, Tabs and Table section */}
      <Card style={cardStyle} bodyStyle={{ padding: '0px' }}>
        <div style={{
          padding: '8px 34px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          gap: '20px',
          backgroundColor: 'rgba(9, 30, 66, 0.04)'
        }}>
          {/* Left: Tabs */}
          <div style={{ flex: '0 0 auto' }}>
            <Tabs
              activeKey={activeKey}
              onChange={onChange}
              className="batch-tabs-new"
              style={{ marginBottom: '-9px' }}
              items={[
                { key: "1", label: <span style={{ fontWeight: '600' }}>Batch Payments</span> },
                { key: "2", label: <span style={{ fontWeight: '600' }}>Exceptions <Tag style={{ borderRadius: '10px', backgroundColor: '#fee2e2', border: 'none', color: '#ef4444', marginLeft: '4px' }}>9</Tag></span> }
              ]}
            />
          </div>

          {/* Center: Search */}
          <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center' }}>
            <AntInput
              placeholder="Search records..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              style={{
                maxWidth: '400px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                height: '36px'
              }}
            />
          </div>

          {/* Right: Actions */}
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              icon={<FilterOutlined />}
              style={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
            />
            <Space size="small">
              <Button
                icon={<PlusOutlined />}
                style={{
                  borderRadius: '8px',
                  fontWeight: '600',
                  height: '36px',
                  padding: '0 12px'
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
                  danger
                  icon={<MinusCircleOutlined />}
                  style={{
                    borderRadius: '8px',
                    fontWeight: '600',
                    height: '36px',
                    padding: '0 12px',
                    backgroundColor: 'transparent',
                    borderColor: '#fee2e2',
                    color: '#ef4444'
                  }}
                >
                  Exclude Members
                </Button>
              </CommonPopConfirm>
            </Space>
          </div>
        </div>

        <div className="common-table" style={{ padding: '0px', paddingLeft: '34px', paddingRight: '34px' }}>
          <Table
            bordered={true}
            rowClassName={() => ""}
            scroll={{ x: 1200 }}
            size="middle"
            columns={columns}
            dataSource={activeKey === "1" ? members : []}
            rowSelection={rowSelection}
            rowKey={(record, index) => record.id || index}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ padding: '60px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto 16px',
                    color: '#94a3b8',
                    fontSize: '24px'
                  }}>
                    <UnorderedListOutlined />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>No data available</div>
                  <div style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                    No payment records found for this batch. Add members to start processing.
                  </div>
                  <Button
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                    onClick={() => message.info("Reloading...")}
                  >
                    Reload Data
                  </Button>
                </div>
              )
            }}
          />
          <div
            className="d-flex justify-content-center align-items-center tbl-footer"
            style={{
              marginTop: "10px",
              padding: "8px 0",
              backgroundColor: "#fafafa",
              borderTop: "none",
              position: "relative",
              zIndex: 10
            }}
          >
            <UnifiedPagination
              total={members?.length || 0}
              current={1}
              pageSize={10}
              itemName="items"
              showTotalFormatter={(total, range) => (
                <span style={{ fontSize: "14px" }}>
                  {`${range[0]}-${range[1]} of ${total} items`}
                </span>
              )}
            />
          </div>
        </div>
      </Card>

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