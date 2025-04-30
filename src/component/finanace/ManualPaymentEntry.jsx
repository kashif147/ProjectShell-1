import React from "react";
import { Form, Input, Select, Row, Col, Typography, Button, Divider } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const ManualPaymentEntry = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Form Submitted:", values);
  };

  return (
    <div style={{  }} className="create-batch-container">
      {/* <Title level={4}>Manual Payment Entry</Title> */}
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Row gutter={16}>
  <Col span={24}>
    <Form.Item label="Member No *" name="memberNo" rules={[{ required: true }]}>
      <Select
        placeholder="Select Member No"
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
      >
        <Select.Option value="M12345">M12345</Select.Option>
        <Select.Option value="M67890">M67890</Select.Option>
        <Select.Option value="M54321">M54321</Select.Option>
      </Select>
    </Form.Item>
  </Col>
</Row>

        <Row gutter={16}>
          <Col span={12}>
            <Text>Member Name</Text>
            <div>Ann Brown</div>
          </Col>
          <Col span={12}>
            <Text>Bank Account</Text>
            <div>12345678</div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Text>Payroll No</Text>
            <div>1001</div>
          </Col>
          <Col span={12}>
            <Text>Outstanding: 1,200.00</Text>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Form.Item label="Payment Type" name="paymentType" initialValue="Credit">
              <Select>
                <Option value="Credit">Credit</Option>
                <Option value="Debit">Debit</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Total Amount (€)" name="totalAmount" initialValue="500.00">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Arrears (€)" name="arrears" initialValue="300.00">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Advance (€)" name="advance" initialValue="100.00">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Current (€)" name="current">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Batch Ref No. *" name="batchRef"  initialValue="B001">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Description *" name="description"  initialValue="Monthly payments">
          <Input />
        </Form.Item>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Text>Batch Total (€): <strong>4,500.00</strong></Text>
          </Col>
          <Col span={12}>
            <Text>Total Arrears (€): <strong>450.00</strong></Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Text>Total Current (€): <strong>3,550.00</strong></Text>
          </Col>
          <Col span={12}>
            <Text>Total Advance (€): <strong>500.00</strong></Text>
          </Col>
        </Row>

        {/* <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit">Save</Button>
        </Form.Item> */}
      </Form>
    </div>
  );
};

export default ManualPaymentEntry;
