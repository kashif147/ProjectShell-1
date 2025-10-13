import { useState, useContext } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Card, Typography, Divider, message } from 'antd';
import * as XLSX from 'xlsx';
import { ExcelContext } from '../../context/ExcelContext';
import { UploadOutlined } from '@ant-design/icons';
import '../../styles/CreateBatchPayment.css';

const { TextArea } = Input;
const { Title, Text } = Typography;


const requiredColumns = [
  "Member Name",
  "Bank Account",
  "Payroll No",
  "Arrears",
  "Comments",
  "Advance",
  "Total Amount"
];

const CreateBatchPayment = () => {
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
  const [form] = Form.useForm();
  const { excelData, setExcelData, setBatchTotals, batchTotals, setUploadedFile, uploadedFile } = useContext(ExcelContext);
  console.log("uploadedFile", uploadedFile);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        message.error("Excel file is empty.");
        return;
      }

      const requiredColumns = ['Membership No', 'Last name', 'First name', 'Full name', 'Value for Periods Selected']; // Customize if needed
      const uploadedColumns = Object.keys(json[0]);
      const missingColumns = requiredColumns.filter(
        (col) => !uploadedColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        message.error(`Missing required columns: ${missingColumns.join(', ')}`);
      } else {
        message.success("All required columns are present.");
        setExcelData(json);

        // Utility function to clean and parse dollar values
        const cleanValue = (val) => {
          if (!val) return 0;
          return parseFloat(val.toString().replace(/[^0-9.-]+/g, ""));
        };

        const totalArrears = json.reduce((sum, row) => {
          return sum + cleanValue(row["Arrears"]);
        }, 0);

        const totalAdvance = json.reduce((sum, row) => {
          return sum + cleanValue(row["Advance"]);
        }, 0);

        const batchTotal = totalArrears + totalAdvance;

        setBatchTotals({
          arrears: totalArrears,
          advance: totalAdvance,
          total: batchTotal,

          records: json.length,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

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
            <Form layout="vertical" form={form} requiredMark={false}>
              <div className='d-flex w-100' style={{ gap: '5px' }}>
                <div className='w-50'>
                  <Form.Item
                    label={<span>Batch Type <span style={{ color: 'red' }}>*</span></span>}
                    name="batchType"
                    rules={[{ required: true, message: 'Please select batch type' }]}
                  >
                    <Select style={{ height: '40px' }} placeholder="Select batch type" className="custom-input" />
                  </Form.Item>
                </div>
                <div className='w-50'>
                  <Form.Item
                    label={<span>Batch Date <span style={{ color: 'red' }}>*</span></span>}
                    name="batchDate"
                    rules={[{ required: true, message: 'Please select batch date' }]}
                  >
                    <DatePicker format="DD/MM/YYYY" className="custom-input" style={{ height: '40px', width: '100%' }} />
                  </Form.Item>
                </div>
              </div>

              <Form.Item
                label={<span>Batch Ref No. <span style={{ color: 'red' }}>*</span></span>}
                name="batchRef"
                rules={[{ required: true, message: 'Please enter batch reference number' }]}
              >
                <Input className="custom-input" />
              </Form.Item>

              <Form.Item
                label={<span>Description <span style={{ color: 'red' }}>*</span></span>}
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} className="custom-input" />
              </Form.Item>

              <Form.Item label="Comments" name="comments">
                <TextArea rows={3} className="custom-input" />
              </Form.Item>

              <Form.Item label="Upload Excel File (optional)" name="file">
                <Input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="custom-input"
                  style={{ height: '40px', width: '100%' }}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={10}>
          <Card className="batch-card" bodyStyle={{ padding: '24px' }}>
            <Title level={4} className="section-title">Batch Summary</Title>
            <div className="summary-line">
              <Text>Total Arrears (€):</Text> <Text strong>€{batchTotals.arrears.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text>Total Current (€):</Text> <Text strong>€0</Text>
            </div>
            <div className="summary-line">
              <Text>Total Advance (€):</Text> <Text strong>€{batchTotals.advance.toLocaleString()}</Text>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="summary-line total">
              <Text strong>Batch Total (€):</Text> <Text strong style={{ color: '#1677ff' }}>€{batchTotals.total.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text strong>Total Records:</Text> <Text>{batchTotals.records}</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateBatchPayment;
