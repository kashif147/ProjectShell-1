import { useState, useContext, useEffect } from "react";
import { Form, Row, Col, Typography, Drawer, Button, message } from "antd";
import axios from "axios";
import "../../styles/CreateBatchPayment.css";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { ExcelContext } from "../../context/ExcelContext";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import { paymentTypes } from "../../Data";
import MemberSearch from "../profile/MemberSearch";

const { Text } = Typography;

const ManualPaymentEntry = ({ open, onClose, batchSummryData, batchId, onSuccess }) => {
  const [form] = Form.useForm();
  const { ProfileDetails } = useTableColumns();
  const { batchTotals } = useContext(ExcelContext);

  const memberData = [
    {
      membershipNumber: "M12345",
      name: "Ali Raza",
      accountNumber: "IE29AIBK93115212345678",
      payrollNo: "PR12345",
    },
    {
      membershipNumber: "M67890",
      name: "Sara Khan",
      accountNumber: "IE64IRCE92050112345678",
      payrollNo: "PR67890",
    },
    {
      membershipNumber: "M54321",
      name: "Ahmed Noor",
      accountNumber: "IE12BOFI90001712345678",
      payrollNo: "PR54321",
    },
  ];

  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    memberNo: "",
    membershipNumber: "", // Added
    memberName: "", // Added
    arrears: "",
    current: "",
    advance: "",
    comments: "",
    totalAmount: "",
  });

  const [loading, setLoading] = useState(false);

  console.log('select', selectedMember);

  const handleMemberSelect = (memberData) => {
    setSelectedMember(memberData);
    setFormData((prev) => ({
      ...prev,
      memberNo: memberData.membershipNumber,
      membershipNumber: memberData.membershipNumber,
      memberName: `${memberData.personalInfo?.forename || ""} ${memberData.personalInfo?.surname || ""
        }`.trim(),
    }));
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Auto-calculate total amount when arrears, current, or advance changes
    if (fieldName === 'arrears' || fieldName === 'current' || fieldName === 'advance') {
      calculateTotalAmount(fieldName, value);
    }
  };

  const calculateTotalAmount = (changedField, changedValue) => {
    const arrearsValue = parseFloat(changedField === 'arrears' ? changedValue : formData.arrears) || 0;
    const currentValue = parseFloat(changedField === 'current' ? changedValue : formData.current) || 0;
    const advanceValue = parseFloat(changedField === 'advance' ? changedValue : formData.advance) || 0;

    const total = arrearsValue + currentValue + advanceValue;

    setFormData(prev => ({
      ...prev,
      totalAmount: total > 0 ? total.toString() : ""
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        membershipNumber: formData.membershipNumber,
        memberName: formData.memberName,
        badgeReferenceNumber: batchSummryData?.batchRef || "",
        amount: parseFloat(formData.totalAmount) * 100, // Convert to cents as per requirement
      };

      console.log("Form Submitted Payload:", payload);

      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/batch-details/add-profile/${batchId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      message.success("Payment added successfully");

      if (onSuccess) {
        onSuccess();
      }

      // Reset form after successful submission
      setFormData({
        memberNo: "",
        membershipNumber: "",
        memberName: "",
        arrears: "",
        current: "",
        advance: "",
        comments: "",
        totalAmount: "",
      });
      setSelectedMember(null);

      // Close drawer
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      message.error(
        error.response?.data?.message || "Failed to add payment entry"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      memberNo: "",
      arrears: "",
      current: "",
      advance: "",
      comments: "",
      totalAmount: ""
    });
    setSelectedMember(null);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '4px 0' }}>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Manual Payment Entry</span>
          <Button
            className="btn primary-btn"
            onClick={handleSubmit}
            loading={loading}
            style={{ height: '36px', borderRadius: '6px' }}
          >
            Submit
          </Button>
        </div>
      }
      width={720}
      styles={{
        header: { borderBottom: '1px solid #e2e8f0', padding: '16px 24px' },
        body: { padding: '0', backgroundColor: '#ffffff' }
      }}
    >
      <div className="p-4">
        <Form layout="vertical" form={form}>
          {/* Member Selection */}
          <div style={{ marginBottom: '24px' }}>
            <MemberSearch
              key={open ? (selectedMember?._id || "open") : "closed"}
              fullWidth
              onSelectBehavior="callback"
              onSelectCallback={handleMemberSelect}
              onClear={() => {
                setSelectedMember(null);
                setFormData(prev => ({
                  ...prev,
                  memberNo: "",
                  membershipNumber: "",
                  memberName: ""
                }));
              }}
            />
          </div>

          {/* Member Details Card */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <Row gutter={16}>
              <Col span={8}>
                <MyInput
                  label="Member Name"
                  name="memberName"
                  value={formData.memberName}
                  placeholder="Member Name"
                  disabled
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Member No"
                  name="memberNo"
                  value={formData.membershipNumber}
                  placeholder="B00000"
                  disabled
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Payroll No"
                  name="payrollNo"
                  placeholder="Enter payroll number"
                  value={selectedMember?.professionalDetails?.payrollNo}
                  disabled
                />
              </Col>
            </Row>
          </div>

          {/* Batch & Payment Info */}
          <Row gutter={24} style={{ marginBottom: '24px' }}>
            <Col span={12}>
              <MyInput
                label="Batch Ref No"
                name="batchRefNo"
                value={batchSummryData?.batchRef || "BATCH-000"}
                disabled
                prefix={<div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', marginRight: '10px' }} />}
              />
            </Col>
            <Col span={12}>
              <CustomSelect
                label="Payment Type"
                value={batchSummryData?.PaymentType || "Deduction"}
                options={[{ value: "Deduction", label: "Deduction" }]}
                disabled
              />
            </Col>
          </Row>

          <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }} />

          {/* Amounts Section */}
          <Row gutter={24} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <MyInput
                label="Arrears (€)"
                value={formData.arrears}
                placeholder="0.00"
                onChange={(e) => handleInputChange("arrears", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <MyInput
                label="Current (€)"
                value={formData.current}
                placeholder="0.00"
                onChange={(e) => handleInputChange("current", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <MyInput
                label="Advance (€)"
                value={formData.advance}
                placeholder="0.00"
                onChange={(e) => handleInputChange("advance", e.target.value)}
              />
            </Col>
          </Row>

          {/* Total Amount Display Center */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '20px 60px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              minWidth: '320px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', letterSpacing: '1px', marginBottom: '8px' }}>TOTAL AMOUNT (€)</div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>{parseFloat(formData.totalAmount || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Comments */}
          <div style={{ marginBottom: '32px' }}>
            <MyInput
              label="Comments / Remarks"
              type="textarea"
              placeholder="Add any additional notes here..."
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
            />
          </div>

          <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }} />

          {/* Bottom KPIs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Batch Total</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>€{batchSummryData?.total?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Total Arrears</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>€{batchTotals?.arrears || "0.00"}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Total Current</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>€{batchSummryData?.total?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Total Advance</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>€{batchTotals?.advance || "0.00"}</div>
            </div>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default ManualPaymentEntry;