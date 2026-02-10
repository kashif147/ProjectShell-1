import { useState, useEffect } from "react";
import { Row, Col, Button, Tabs, Table, message, Tag, Space, Card, Input as AntInput, Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import TrigerBatchMemberDrawer from "../../component/finanace/TrigerBatchMemberDrawer";
import "../../styles/ManualEntry.css";
import ManualPaymentEntryDrawer from "../../component/finanace/ManualPaymentEntryDrawer";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { formatCurrency } from "../../utils/Utilities";
import { paymentTypes } from "../../Data";
import { getBatchDetailsById, clearBatchDetails } from "../../features/profiles/BatchDetailsSlice";
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
  ThunderboltFilled,
  FolderOpenOutlined,
  CalculatorOutlined
} from "@ant-design/icons";

const cardStyle = {
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const SummaryCard = ({ title, value, icon, color, iconBg }) => (
  <Card style={cardStyle} bodyStyle={{ padding: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.025em' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{value}</div>
      </div>
      <div style={{
        width: '32px',
        height: '24px',
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
  const dispatch = useDispatch();

  const { data: batchDetails, loading } = useSelector(state => state.batchDetails);

  // Fetch batch details if batchId is available
  useEffect(() => {
    if (batchId) {
      dispatch(getBatchDetailsById(batchId));
    }
    return () => {
      dispatch(clearBatchDetails());
    };
  }, [batchId, dispatch]);

  // Strict Data Source: Only use data from Redux
  const batchInfo = batchDetails || {};

  // Helper function to safely parse dates
  const getSafeDate = (dateValue) => {
    if (!dateValue) return null;
    if (moment.isMoment(dateValue)) return dateValue;
    return moment(dateValue);
  };

  const members = Array.isArray(batchInfo?.batchPayments) ? batchInfo.batchPayments : [];
  const exceptions = Array.isArray(batchInfo?.batchExceptions) ? batchInfo.batchExceptions : [];

  const onSelectAll = (checked) => {
    const dataSource = activeKey === "1" ? members : exceptions;
    if (checked) {
      const allKeys = dataSource.map((item, index) => item._id || item.id || index);
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const onSelectSingle = (record, selected) => {
    if (selected) {
      setSelectedRowKeys(prev => [...prev, record._id || record.id]);
    } else {
      setSelectedRowKeys(prev => prev.filter(key => key !== (record._id || record.id)));
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onSelect: onSelectSingle,
    onSelectAll: (selected, selectedRows) => {
      if (selected) {
        const dataSource = activeKey === "1" ? members : exceptions;
        const allKeys = dataSource.map(row => row._id || row.id);
        setSelectedRowKeys(allKeys);
      } else {
        setSelectedRowKeys([]);
      }
    },
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const [isBatchmemberOpen, setIsBatchmemberOpen] = useState(false);
  const [activeKey, setActiveKey] = useState("1");
  const [manualPayment, setManualPayment] = useState(false);

  const columns = [
    {
      title: "FILE REF NO",
      dataIndex: "", // Updated to match API field
      key: "refNo",
      ellipsis: true,
      width: 150,
      render: (text, record) => text || record["Membership No"] || "-",
    },
    {
      title: "FULL NAME",
      dataIndex: "fullName", // Updated to match API field
      key: "fullName",
      ellipsis: true,
      width: 180,
      render: (text, record) => text || record["Full name"] || `${record["forename"] || ''} ${record["surname"] || ''}`.trim() || "-",
    },
    {
      title: "AMOUNT",
      dataIndex: "amount", // Updated to match API field
      key: "amount",
      ellipsis: true,
      width: 120,
      render: (value) => formatCurrency(value || 0),
    },
    {
      title: "MEMBERSHIP NO",
      dataIndex: "membershipNumber",
      key: "membershipNumber",
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
      render: () => batchInfo.referenceNumber || "",
    },
    {
      title: "DESCRIPTION",
      key: "description",
      ellipsis: true,
      width: 250,
      render: () => batchInfo.description || "",
    },
  ];

  const exceptionColumns = [
    {
      title: "FILE REF NO",
      dataIndex: "membershipNumber",
      key: "refNo",
      ellipsis: true,
      width: 150,
    },
    {
      title: "FULL NAME",
      dataIndex: "fullName",
      key: "fullName",
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
      title: "AMOUNT",
      dataIndex: "valueForPeriodSelected",
      key: "amount",
      ellipsis: true,
      width: 120,
      // render: (value) => formatCurrency(value || ""),
    },
    {
      title: "BATH REF",
      key: "batchRefNo",
      render: () => batchInfo.referenceNumber || "",
    },
    {
      title: "DESCRIPTION",
      key: "description",
      ellipsis: true,
      width: 250,
      render: () => batchInfo.description || "",
    }
  ];

  const onChange = (key) => setActiveKey(key);

  // Get display values from Redux state
  const displayBatchDate = getSafeDate(batchInfo.date);
  const displayPaymentType = batchInfo.type;
  const displayComments = batchInfo.comments;

  // Calculate totals strictly from the Redux lists
  const calcTotalCurrent = members.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const calcTotalExceptions = exceptions.reduce((sum, e) => sum + (parseFloat(e.valueForPeriodSelected) || 0), 0);
  const calcTotalRecords = members.length + exceptions.length;

  const displayArrears = 0;
  const displayTotalCurrent = calcTotalExceptions;
  const displayTotal = displayTotalCurrent + displayArrears;
  const displayRecords = calcTotalRecords;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '15px' }}>

      {/* Absolute Top Unified Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Breadcrumb />
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
            value={formatCurrency(0)} // Resetting/fallback for now as not in API schema
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
              placeholder="-"
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
                {batchInfo.fileName ? (
                  <span style={{ color: '#2563eb', fontWeight: '500' }}>
                    {batchInfo.fileName}
                  </span>
                ) : (
                  <span>No file metadata</span>
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
                { key: "2", label: <span style={{ fontWeight: '600' }}>Exceptions <Tag style={{ borderRadius: '10px', backgroundColor: '#fee2e2', border: 'none', color: '#ef4444', marginLeft: '4px' }}>{exceptions.length}</Tag></span> }
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
            columns={activeKey === "1" ? columns : exceptionColumns}
            dataSource={activeKey === "1" ? members : exceptions}
            rowSelection={rowSelection}
            rowKey={(record, index) => record._id || record.id || index}
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
                    No payment records found for this batch in the system.
                  </div>
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
          batchRef: batchInfo?.referenceNumber
        }}
      />
    </div>
  );
}

export default BatchMemberSummary;