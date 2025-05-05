import React from "react";
import { Form, Input, Select, Row, Col, Typography, Button, Divider, Card } from "antd";
import {
  FaAngleLeft,
  FaAngleRight,
  FaUser,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaInfoCircle
} from "react-icons/fa";
import '../../styles/CreateBatchPayment.css'// Create this CSS file
import { useTableColumns } from "../../context/TableColumnsContext ";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ManualPaymentEntry = () => {
  const [form] = Form.useForm();
const {ProfileDetails}= useTableColumns()
console.log(ProfileDetails[0]?.PaymentType,"ProfileDetails")
  const handleSubmit = (values) => {
    console.log("Form Submitted:", values);
  };

  return (
    <div className="">
      <div style={{ padding: "0px" }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          {/* Member Selection Section */}
          <div className="">
              <Row gutter={16} >
                <Col span={24}>
                  <Form.Item label="Member No *" name="memberNo">
                    <Select
                      className="custom-input"
                      style={{ height: '40px', }}
                      placeholder="Select Member No"
                      suffixIcon={<FaUser />}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      <Option value="M12345">M12345</Option>
                      <Option value="M67890">M67890</Option>
                      <Option value="M54321">M54321</Option>
                    </Select>
                  </Form.Item>
                </Col>
                {/* <Col span={5}>
                  <div
                    className="member-nav"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '40px',
                      marginTop: '32px' // Adjust this to match select box alignment
                    }}
                  >
                    <Button className="me-1 gray-btn butn">
                      <FaAngleLeft className="deatil-header-icon" />
                    </Button>
                    <p style={{ fontSize: "14px", margin: "0 4px" }}>15 of 30</p>
                    <Button className="me-1 gray-btn butn">
                      <FaAngleRight className="deatil-header-icon" />
                    </Button>
                  </div>
                </Col> */}
              </Row>
              <Row gutter={16} className="">
                <Col span={12}>
                  <div className="detail-item">
                    <Text strong>Member Name</Text><br />
                    <Text type="secondary">Ann Brown</Text>
                    {/* <div className="detail-value">Ann Brown</div> */}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <Text strong>Bank Account</Text><br />
                    <Text type="secondary">12345678</Text>
                    {/* <div className="detail-value">12345678</div> */}
                  </div>
                </Col>
              </Row>

              <Row gutter={16} className="member-details">
                <Col span={12}>
                  <div className="detail-item">
                    <Text strong>Payroll No</Text><br />
                    <Text type="secondary">1001</Text>
                    {/* <div className="detail-value">1001</div> */}
                  </div>
                </Col>
              </Row>
              
            

          </div>
          <Row>
          <Col span={24}>
                  <div className="detail-item" style={{ marginTop: '20px', }}>
                    <Text strong >Batch Ref No</Text><br />
                    {/* <Text type="secondary">b155Xa</Text> */}
                    {/* <div className="outstanding-value">b155Xa</div> */}
                  </div>
                    <Input size="Large" className="custom-input" disabled={true} value="B001" />
                </Col>
          </Row>
          {/* Payment Details Section */}
         
              <Row gutter={16}>
                <Col span={24}>
                  <div className="detail-item"  style={{marginTop:'16px', display: 'flex', justifyContent: 'space-between', }}>
                    <label style={{ fontWeight: 500 }}>Payment Type</label>
                    {/* <Input className="custom-input" size="large" /> */}
                  </div>
                  <Form.Item
                    name="paymentType"
                    className="custom-input"
                    style={{ marginBottom: 0, }} // Remove default spacing
                  >

                    <Select className="custom-input" disabled={true} value={ProfileDetails?.[0]?.PaymentType || undefined} >
                      <Option value="Credit">Credit</Option>
                      <Option value="Debit">Debit</Option>
                    </Select>

                  </Form.Item>
                </Col>
              
              </Row>
                 

              <Row gutter={16} style={{ marginTop: '16px' }}>

                <Col span={12}>
                  
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "5px" }}>
                      <label style={{ fontWeight: 500 }}>Arrears (€)</label>
                      <Text type="secondary">300.00</Text>
                    </div>
                    <Input className="custom-input" size="large" />
                 
                </Col>
                <Col span={12}>
                  
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "5px" }}>
                      <label style={{ fontWeight: 500 }}>Advance (€)</label>
                      <Text type="secondary">300.00</Text>
                    </div>
                    <Input className="custom-input" size="large" />
                  
                </Col>
                {/* <Col span={8}>
                <Form.Item label="Advance" name="advance" initialValue="100.00">
                  <Input prefix="€" className="amount-input" />
                </Form.Item>
              </Col> */}
              </Row>
              <Row>
                <Col span={12}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "5px", marginTop:'16px' }}>
                      <label style={{ fontWeight: 500 }}>Total Amount (€)</label>
                      <Text type="secondary">500.00</Text>
                    </div>
                    <Input className="custom-input" size="large" />
                
                </Col>
                </Row>

        
          {
            ProfileDetails[0]?.PaymentType === 'Credit Card' &&(
              <div className="">  
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Card Holder Name"
                      name="cardHolderName"
                      initialValue="John Doe"
                    >
                      <Input
                        className="custom-input"
                        size="large"
                        disabled
                        placeholder="Enter card holder name"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Card Number"
                      name="cardNumber"
                      initialValue="1234 5678 9012 3456"
                    >
                      <Input
                        className="custom-input"
                        size="large"
                        disabled
                        placeholder="XXXX XXXX XXXX XXXX"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Expiry Date"
                      name="expiryDate"
                      initialValue="12/26"
                    >
                      <Input
                        className="custom-input"
                        size="large"
                        disabled
                        placeholder="MM/YY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="CVC Code"
                      name="cvc"
                      initialValue="123"
                    >
                      <Input
                        className="custom-input"
                        size="large"
                        disabled
                        placeholder="XXX"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Reference No"
                      name="referenceNo"
                      initialValue="REF-001"
                    >
                      <Input
                        className="custom-input"
                        size="large"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Country"
                      name="country"
                      initialValue="Germany"
                    >
                      <Select
                        className="custom-input"
                        size="large"
                        disabled
                        placeholder="Select country"
                      >
                        <Option value="Germany">Germany</Option>
                        <Option value="France">France</Option>
                        <Option value="Netherlands">Netherlands</Option>
                        <Option value="Italy">Italy</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
            </div>
            )
          }
       



          {/* Batch Information Section */}
          {/* <div className="section-container">
            <div className="section-title">
              <FaFileInvoiceDollar className="section-icon" />
              <span>Batch Information</span>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Batch Ref No. *" name="batchRef" initialValue="B001">
                  <Input className="custom-input" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Description *" name="description" initialValue="Monthly payments">
              <Input.TextArea rows={3} className="custom-textarea" />
            </Form.Item>
          </div> */}
 <Row gutter={16} style={{ marginBottom: '30px' }}>
                <Col span={24}>
                  <div className="detail-item"  style={{marginTop:'12px', display: 'flex', justifyContent: 'space-between', }}>
                    <label style={{ fontWeight: 500 }}>Comments</label>
                    {/* <Input className="custom-input" size="large" /> */}
                  </div>
                 <TextArea rows={3}  placeholder="Enter comments here..." />
                </Col>
              
              </Row>
          {/* Summary Section */}

            <Row gutter={16} >
              <Col span={12}>
                <div className="summary-item">
                  <Text>Batch Total:</Text>
                  <Text strong className="summary-value">€4,500.00</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="summary-item">
                  <Text>Total Arrears:</Text>
                  <Text strong className="summary-value">€450.00</Text>
                </div>
              </Col>
            </Row>
           
            <Row gutter={16}>
              <Col span={12}>
                <div className="summary-item">
                  <Text>Total Current:</Text>
                  <Text strong className="summary-value">€3,550.00</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="summary-item">
                  <Text>Total Advance:</Text>
                  <Text strong className="summary-value">€500.00</Text>
                </div>
              </Col>
            </Row>
        

          {/* Action Buttons */}
          {/* <div className="action-buttons">
            <Button type="default" size="large" className="cancel-btn">
              Cancel
            </Button>
            <Button type="primary" size="large" htmlType="submit" className="submit-btn">
              Submit Payment
            </Button>
          </div> */}
        </Form>
      </div>
    </div>
  );
};

export default ManualPaymentEntry;