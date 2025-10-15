import { useState, useContext, forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Card, Typography, Divider, message, Button } from 'antd';
import * as XLSX from 'xlsx';
import { ExcelContext } from '../../context/ExcelContext';
import { UploadOutlined } from '@ant-design/icons';
import { paymentTypes } from '../../Data';
import '../../styles/CreateBatchPayment.css';
import MyDatePicker from './MyDatePicker';
import MyInput from './MyInput';
import CustomSelect from './CustomSelect';

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

const CreateBatchPayment = forwardRef((props, ref) => {

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
  console.log("uploadedFile", batchTotals);
  const [formValues, setFormValues] = useState({
    batchType: '',
    batchDate: '',
    batchRef: '',
    description: '',
    comments: '',
  });
  const [formErrors, setFormErrors] = useState({});
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

        const totalCurrent = json.reduce((sum, row) => {
          return sum + cleanValue(row["Value for Periods Selected"]);
        }, 0);

        const totalAdvance = json.reduce((sum, row) => {
          return sum + cleanValue(row["Advance"]);
        }, 0);

        const batchTotal =totalCurrent;
        setBatchTotals({
          arrears: 0,
          advance: totalAdvance,
          totalCurrent,
          total: batchTotal,

          records: json.length,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const setField = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = () => {
    const required = ['batchType', 'batchDate', 'batchRef', 'description'];
    const nextErrors = {};
    required.forEach((key) => {
      if (!formValues[key] || String(formValues[key]).trim() === '') {
        nextErrors[key] = true;
      }
    });
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      message.error('Please fill all required fields.');
      return null;
    }

    // ✅ Check current path to enforce Excel requirement only for /Import
    const currentPath = window.location.pathname;
    if (currentPath === "/Import") {
      if (!uploadedFile || !excelData || excelData.length === 0) {
        message.error("Excel file is mandatory for Import path.");
        return null;
      }
    }

    // Ensure excelData is a valid array
    const members = Array.isArray(excelData) ? excelData : [];

    // Create the new structured object
    const batchObject = {
      batchType: formValues.batchType,
      batchDate: formValues.batchDate,
      batchRef: formValues.batchRef,
      description: formValues.description,
      comments: formValues.comments,
      excelData: members,
    };

    // Save the object in context
    setExcelData(batchObject);

    message.success('Batch data prepared successfully');
    return batchObject;
  };


  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

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
                  <CustomSelect
                    label="Batch Type"
                    name="batchType"
                    required
                    hasError={!!formErrors.batchType}
                    errorMessage="Please select batch type"
                    options={(paymentTypes || []).map((p) => ({ value: p.value || p, label: p.label || p }))}
                    value={formValues.batchType}
                    onChange={(e) => setField('batchType', e.target.value)}
                  />
                </div>
                <div className='w-50'>
                  <MyDatePicker
                    label="Batch Date"
                    name="batchDate"
                    required
                    hasError={!!formErrors.batchDate}
                    errorMessage="Please select batch date"
                    value={formValues.batchDate}
                    onChange={(dateString) => setField("batchDate", dateString)}
                  />
                </div>
              </div>

              <MyInput
                label="Batch Ref No."
                name="batchRef"
                required
                hasError={!!formErrors.batchRef}
                errorMessage="Please enter batch reference number"
                value={formValues.batchRef}
                onChange={(e) => setField('batchRef', e.target.value)}
              />

              <MyInput
                label="Description"
                name="description"
                required
                hasError={!!formErrors.description}
                errorMessage="Please enter description"
                type="textarea"
                rows={3}
                value={formValues.description}
                onChange={(e) => setField('description', e.target.value)}
              />

              <MyInput
                label="Comments"
                name="comments"
                type="textarea"
                rows={3}
                value={formValues.comments}
                onChange={(e) => setField('comments', e.target.value)}
              />

              {/* <Form.Item label="Upload Excel File" name="file">
                <Input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="custom-input"
                  style={{ height: '40px', width: '100%' }}
                />
              </Form.Item> */}
              <MyInput
                label="Upload Excel Fil111e"
                name="file"
                type="file"
                accept=".xlsx, .xls"
                required={window.location.pathname === "/Import"} // only required on /Import
                hasError={!!formErrors.file}
                errorMessage="Please upload Excel file"
                onChange={handleFileUpload}
              />
              {/* <div className='d-flex justify-content-end'>
                <Button type="primary" onClick={handleSubmit}>Save Batch</Button>
              </div> */}
            </Form>
          </Card>
        </Col>

        <Col span={10}>
          <Card className="batch-card" bodyStyle={{ padding: '24px' }}>
            <Title level={4} className="section-title">Batch Summary</Title>
            <div className="summary-line">
              <Text>Total Arrears (€):</Text> <Text strong>€{batchTotals?.arrears?.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text>Total Current (€):</Text> <Text strong>€{batchTotals?.totalCurrent?.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text>Total Advance (€):</Text> <Text strong>€{batchTotals?.advance?.toLocaleString()}</Text>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="summary-line total">
              <Text strong>Batch Total (€):</Text> <Text strong style={{ color: '#1677ff' }}>€{batchTotals?.totalCurrent?.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text strong>Total Records:</Text> <Text>{batchTotals?.records}</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default CreateBatchPayment;
