import { useState, useContext, useEffect } from "react";
import { Form, Row, Col, Typography, Drawer, Button } from "antd";
import "../../styles/CreateBatchPayment.css";
import { useTableColumns } from "../../context/TableColumnsContext ";
// import { ExcelContext } from "../../context/ExcelContext";
import { ExcelContext } from "../../context/ExcelContext";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import { paymentTypes } from "../../Data";

const { Text } = Typography;

const ManualPaymentEntry = ({ open, onClose, batchSummryData }) => {
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
    arrears: "",
    current: "",
    advance: "",
    comments: "",
    totalAmount: ""
  });

  const [loading, setLoading] = useState(false);

  console.log('select', selectedMember);

  const handleMemberChange = (value) => {
    const found = memberData.find((m) => m.membershipNumber === value.target.value);
    setSelectedMember(found || null);
    setFormData(prev => ({
      ...prev,
      memberNo: value.target.value
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
      
      // Validate required fields
      // if (!formData.memberNo) {
      //   console.error("Member No is required");
      //   return;
      // }

      const submissionData = {
        ...formData,
        memberName: selectedMember?.name || "",
        bankAccount: selectedMember?.accountNumber || "",
        payrollNo: selectedMember?.payrollNo || "",
        batchRefNo: "B001",
        paymentType: batchSummryData?.PaymentType || ""
      };
      
      console.log("Form Submitted:", submissionData);
      
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful submission
      setFormData({
        memberNo: "",
        arrears: "",
        current: "",
        advance: "",
        comments: "",
        totalAmount: ""
      });
      setSelectedMember(null);
      
      // Close drawer
      onClose();
      
    } catch (error) {
      console.error("Submission error:", error);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Manual Payment Entry</span>
          <Button 
            className="btn primary-btn" 
            onClick={handleSubmit}
            loading={loading}
            disabled={!formData.memberNo || !formData.totalAmount}
          >
            Submit
          </Button>
        </div>
      }
      width={800}
      headerStyle={{ padding: '16px 24px' }}
    >
      <div className="drawer-main-cntainer p-4 me-2 ms-2">
        <Form layout="vertical" form={form}>
          {/* Member Selection */}
          <Row gutter={16}>
            <Col span={24}>
              <CustomSelect
                label="Member No"
                value={formData.memberNo}
                placeholder="Select Member"
                options={memberData.map((m) => ({
                  value: m.membershipNumber,
                  label: m.membershipNumber,
                }))}
                onChange={(val) => handleMemberChange(val)}
              />
            </Col>
          </Row>

          {/* Auto populated fields */}
          <Row gutter={16}>
            <Col span={12}>
              <MyInput
                label="Member Name"
                name="memberName"
                value={selectedMember?.name}
                disabled
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Bank Account"
                name="bankAccount"
                value={selectedMember?.accountNumber}
                disabled
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <MyInput
                label="Payroll No"
                name="payrollNo"
                value={selectedMember?.payrollNo}
                disabled
              />
            </Col>
          </Row>

          {/* Batch Ref */}
          <Row>
            <Col span={24}>
              <div className="detail-item" style={{ marginTop: "20px" }}>
                <Text strong>Batch Ref No</Text>
              </div>
              <MyInput value="B001" disabled />
            </Col>
          </Row>

          {/* Payment Type */}
          <Row gutter={16}>
            <Col span={24}>
              <div
                className="detail-item"
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <label style={{ fontWeight: 500 }}></label>
              </div>
              <CustomSelect
                label="Payment Type"
                value={batchSummryData?.PaymentType || ""}
                options={(paymentTypes || []).map((p) => ({ value: p.value || p, label: p.label || p }))}
                disabled
              />
            </Col>
          </Row>

          {/* Amounts */}
          <Row gutter={16} style={{ marginTop: "16px" }}>
            <Col span={8}>
              <MyInput 
                label="Arrears (€)" 
                value={formData.arrears}
                onChange={(e) => handleInputChange("arrears", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <MyInput 
                label="Current (€)" 
                value={formData.current}
                onChange={(e) => handleInputChange("current", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <MyInput 
                label="Advance (€)" 
                value={formData.advance}
                onChange={(e) => handleInputChange("advance", e.target.value)}
              />
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <MyInput 
                label="Total Amount (€)" 
                value={formData.totalAmount}
                disabled
              />
            </Col>
          </Row>

          {/* Comments */}
          <Row gutter={16} style={{ marginBottom: "30px" }}>
            <Col span={24}>
              <MyInput
                label="Comments"
                type="textarea"
                placeholder="Enter comments here..."
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
              />
            </Col>
          </Row>

          {/* Totals */}
          <Row gutter={16}>
            <Col span={12}>
              <div className="summary-item">
                <Text>Batch Total:</Text>
                <Text strong className="summary-value">
                  €{batchSummryData?.total?.toLocaleString() || "0.00"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="summary-item">
                <Text>Total Arrears:</Text>
                <Text strong className="summary-value">
                  €{batchTotals?.arrears || "0.00"}
                </Text>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div className="summary-item">
                <Text>Total Current:</Text>
                <Text strong className="summary-value">
                  €{batchSummryData?.total?.toLocaleString() || "0.00"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="summary-item">
                <Text>Total Advance:</Text>
                <Text strong className="summary-value">
                  €{batchTotals?.advance || "0.00"}
                </Text>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </Drawer>
  );
};

export default ManualPaymentEntry;