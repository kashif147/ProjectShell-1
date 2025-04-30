import React from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Card,
} from "antd";
import '../../styles/CreateBatchPayment.css'; // Ensure this CSS file includes your provided styles
// Ensure this CSS file includes your provided styles

const { Title, Text } = Typography;
const { Option } = Select;

const ManualPaymentEntry = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Form Submitted:", values);
  };

  return (
    <div className="create-batch-container">
      <Card className="batch-card">
        <div className="header">
          <Title level={4} className="page-title">
            Manual Payment Entry
          </Title>
        </div>

        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            paymentType: "Credit",
            totalAmount: "500.00",
            arrears: "300.00",
            advance: "100.00",
            batchRef: "B001",
            description: "Monthly payments",
          }}
        >
          <Form.Item
            label="Member No *"
            name="memberNo"
            rules={[{ required: true, message: "Please select a Member No" }]}
          >
            <Select
              placeholder="Select Member No"
              showSearch
              optionFilterProp="children"
              className="custom-input"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="M12345">M12345</Option>
              <Option value="M67890">M67890</Option>
              <Option value="M54321">M54321</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Member Name</Text>
              <div>Ann Brown</div>
            </Col>
            <Col span={12}>
              <Text strong>Bank Account</Text>
              <div>12345678</div>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Text strong>Payroll No</Text>
              <div>1001</div>
            </Col>
            <Col span={12}>
              <Text strong>Outstanding: 1,200.00</Text>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item label="Payment Type" name="paymentType">
                <Select className="custom-input">
                  <Option value="Credit">Credit</Option>
                  <Option value="Debit">Debit</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Total Amount (€)" name="totalAmount">
                <Input className="custom-input" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Arrears (€)" name="arrears">
                <Input className="custom-input" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Advance (€)" name="advance">
                <Input className="custom-input" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Current (€)" name="current">
                <Input className="custom-input" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Batch Ref No. *"
                name="batchRef"
                rules={[{ required: true, message: "Enter Batch Ref No" }]}
              >
                <Input className="custom-input" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description *"
            name="description"
            rules={[{ required: true, message: "Enter Description" }]}
          >
            <Input className="custom-input" />
          </Form.Item>

          <Divider />

          <Row className="summary-line">
            <Col span={12}>
              <Text>
                Batch Total (€): <strong>4,500.00</strong>
              </Text>
            </Col>
            <Col span={12}>
              <Text>
                Total Arrears (€): <strong>450.00</strong>
              </Text>
            </Col>
          </Row>

          <Row className="summary-line">
            <Col span={12}>
              <Text>
                Total Current (€): <strong>3,550.00</strong>
              </Text>
            </Col>
            <Col span={12}>
              <Text>
                Total Advance (€): <strong>500.00</strong>
              </Text>
            </Col>
          </Row>

          <Row justify="end" gutter={12} style={{ marginTop: 24 }}>
            <Col>
              <Button className="cancel-button" danger>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" className="create-button">
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default ManualPaymentEntry;
