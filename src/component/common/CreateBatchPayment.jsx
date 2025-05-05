import React from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col, Card, Typography, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import '../../styles/CreateBatchPayment.css'; // You can inline this if needed

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreateBatchPayment = () => {
  const [form] = Form.useForm();

  return (
    <div className="create-batch-container">
      <div className="header">
        <Title level={3} className="page-title">Batch Payment Details</Title>
        <Text type="secondary">Payments &gt; Create Batch</Text>
      </div>
      <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={14}>
            <Card className="batch-card" bodyStyle={{ padding: '24px' }}>
              <Title level={4} className="section-title">Batch Details</Title>
              <Form layout="vertical" form={form}>
                <div className='d-flex w-100' style={{ gap: '5px' }}>
            <div className='w-50'>
              <Form.Item label="Batch Type *" name="batchType" >
                <Select style={{height:'40px'}} placeholder="Select batch type" className="custom-input" />
              </Form.Item>
            </div>
            <div className='w-50'>
              <Form.Item label="Batch Date *" name="batchDate" >
                <DatePicker format="DD/MM/YYYY" className="custom-input" style={{ height: '40px', width:'100%'}} />
              </Form.Item>
            </div>
                </div>


                <Form.Item label="Batch Ref No. *" name="batchRef" >
            <Input className="custom-input" />
                </Form.Item>

                <Form.Item label="Description *" name="description" >
            <TextArea rows={3} className="custom-input" />
                </Form.Item>

                <Form.Item label="Comments" name="comments">
            <TextArea rows={3} className="custom-input" />
                </Form.Item>

                <Form.Item label="Upload Excel File (optional)" name="file">
            <Input type="file" className="custom-input" style={{ height: '40px', width:'100%'}} />
                </Form.Item>

                {/* <Form.Item>
            <Row justify="end" gutter={12}>
              <Col>
                <Button className="cancel-button">Cancel</Button>
              </Col>
              <Col>
                <Button type="primary" className="create-button">Create Batch</Button>
              </Col>
            </Row>
                </Form.Item> */}
            </Form>
          </Card>
        </Col>

        {/* Right Side - Summary */}
        <Col span={10}>
          <Card className="batch-card" bodyStyle={{ padding: '24px' }}>
            <Title level={4} className="section-title">Batch Summary</Title>
            <div className="summary-line">
              <Text>Total Arrears (€):</Text> <Text strong>€1,500</Text>
            </div>
            <div className="summary-line">
              <Text>Total Current (€):</Text> <Text strong>€2,000</Text>
            </div>
            <div className="summary-line">
              <Text>Total Advance (€):</Text> <Text strong>€500</Text>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="summary-line total">
              <Text strong>Batch Total (€):</Text> <Text strong style={{ color: '#1677ff' }}>€4,000</Text>
            </div>
            <div className="summary-line">
              <Text strong>Total Records:</Text> <Text>50</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateBatchPayment;
