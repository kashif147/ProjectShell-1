import { useState, useContext, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Select, DatePicker, Row, Col, Card, Typography, Divider, message, Button } from 'antd';
import * as XLSX from 'xlsx';
import { ExcelContext } from '../../context/ExcelContext';
import { UploadOutlined } from '@ant-design/icons';
import { paymentTypes } from '../../Data';
import '../../styles/CreateBatchPayment.css';
import MyDatePicker from './MyDatePicker';
import MyInput from './MyInput';
import CustomSelect from './CustomSelect';
import { useLocation } from 'react-router-dom';
import { addBatchWithMember } from '../../features/BatchesSlice'; // Import the Redux action
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

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
  const location = useLocation();
  const navigate = useNavigate()
  const dispatch = useDispatch(); // Initialize Redux dispatch
  const { workLocationOptions } = useSelector((state) => state.lookups);

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
  console.log("uploadedFile", excelData);

  const [isSpecialPath, setIsSpecialPath] = useState(false);
  const [autoBatchType, setAutoBatchType] = useState('');

  const [formValues, setFormValues] = useState({
    batchType: '',
    batchDate: '',
    batchRef: '',
    description: '',
    comments: '',
    workLocation: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Check current path and set batch type accordingly
  useEffect(() => {
    const currentPath = location.pathname;
    let batchType = '';
    let isSpecial = false;

    switch (currentPath) {
      case "/StandingOrders":
        batchType = 'Standing Order';
        isSpecial = true;
        break;
      case "/Deductions":
        batchType = 'Deduction';
        isSpecial = true;
        break;
      case "/onlinePayment":
        batchType = 'Online Payment';
        isSpecial = true;
        break;
      case "/Cheque":
        batchType = 'Cheque';
        isSpecial = true;
        break;
      default:
        batchType = '';
        isSpecial = false;
    }

    setIsSpecialPath(isSpecial);
    setAutoBatchType(batchType);

    // If it's a special path, automatically set batchType
    if (isSpecial && batchType) {
      setFormValues(prev => ({
        ...prev,
        batchType: batchType
      }));
    }

    // Cleanup function - reset form values when component unmounts
    return () => {
      setFormValues({
        batchType: '',
        batchDate: '',
        batchRef: '',
        description: '',
        comments: '',
      });
      setFormErrors({});
      // Also clear Excel context data if needed
      setExcelData([]);
      setBatchTotals({
        arrears: 0,
        advance: 0,
        totalCurrent: 0,
        total: 0,
        records: 0,
      });
      setUploadedFile(null);
    };
  }, [location.pathname]);

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

      const requiredColumns = ['Membership No', 'Last name', 'First name', 'Full name', 'Value for Periods Selected'];
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

        const batchTotal = totalCurrent;
        setBatchTotals({
          arrears: 0,
          advance: totalAdvance,
          totalCurrent,
          total: batchTotal,
          records: json.length,
          exceptionTotal: 0,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const setField = (name, value) => {
    // Don't allow changing batchType if it's a special path
    if (name === 'batchType' && isSpecialPath) {
      return;
    }

    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = () => {
    const required = ['batchType', 'batchDate', 'batchRef', 'workLocation'];
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

    const currentPath = window.location.pathname;
    if (currentPath === "/Import") {
      if (!uploadedFile || !excelData || excelData.length === 0) {
        message.error("Excel file is mandatory for Import path.");
        return null;
      }
    }

    const members = Array.isArray(excelData) ? excelData : [];
    const batchObject = {
      batchType: formValues.batchType,
      batchDate: formValues.batchDate,
      batchRef: formValues.batchRef,
      workLocation: formValues.workLocation,
      description: formValues.description,
      batchStatus: 'Pending',
      comments: formValues.comments,
      createdBy: "Super User",
      members: members,
    };

    setExcelData(batchObject);
    message.success('Batch data prepared successfully');
    return batchObject;
  };


  // Add a reset function that can be called from parent
  const resetForm = () => {
    setFormValues({
      batchType: '',
      batchDate: '',
      batchRef: '',
      description: '',
      comments: '',
    });
    setFormErrors({});
    setExcelData([]);
    setBatchTotals({
      arrears: 0,
      advance: 0,
      totalCurrent: 0,
      total: 0,
      records: 0,
    });
    setUploadedFile(null);

    // Also reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: resetForm,
  }));

  // Get page title based on path
  const getPageTitle = () => {
    const currentPath = location.pathname;
    switch (currentPath) {
      case "/StandingOrders":
        return "Standing Orders Batch Payment Details";
      case "/Deductions":
        return "Deductions Batch Payment Details";
      case "/onlinePayment":
        return "Online Payment Batch Details";
      case "/Cheque":
        return "Cheque Batch Payment Details";
      default:
        return "Batch Payment Details";
    }
  };

  // Get breadcrumb text based on path
  const getBreadcrumbText = () => {
    const currentPath = window.location.pathname;
    switch (currentPath) {
      case "/StandingOrders":
        return "Payments > Standing Orders Batch";
      case "/Deductions":
        return "Payments > Deductions Batch";
      case "/onlinePayment":
        return "Payments > Online Payment Batch";
      case "/Cheque":
        return "Payments > Cheque Batch";
      default:
        return "Payments > Create Batch";
    }
  };

  return (
    <div className="create-batch-container drwer-bg-clr">
      <div className="header">
        <Title level={3} className="page-title">{getPageTitle()}</Title>
        <Text type="secondary">{getBreadcrumbText()}</Text>
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
                    disabled={isSpecialPath} // Disable if special path
                    hasError={!!formErrors.batchType}
                    errorMessage="Please select batch type"
                    options={(paymentTypes || []).map((p) => ({ value: p.value || p, label: p.label || p }))}
                    value={formValues.batchType}
                    onChange={(e) => setField('batchType', e.target.value)}
                  />
                  {isSpecialPath && (
                    <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                      Payment type is automatically set to {autoBatchType}
                    </Text>
                  )}
                </div>
                <div className='w-50'>
                  <MyDatePicker
                    label="Payment Date"
                    name="batchDate"
                    required
                    hasError={!!formErrors.batchDate}
                    errorMessage="Please select payment date"
                    value={formValues.batchDate}
                    onChange={(dateString) => setField("batchDate", dateString)}
                    picker="month"
                    format="MM/YYYY"
                  />
                </div>
              </div>

              <div className='w-100 mb-3'>
                <CustomSelect
                  label="Work Location"
                  name="workLocation"
                  required
                  hasError={!!formErrors.workLocation}
                  errorMessage="Please select work location"
                  options={workLocationOptions}
                  value={formValues.workLocation}
                  onChange={(e) => setField('workLocation', e.target.value)}
                />
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

              <MyInput
                label="Upload Excel File"
                name="file"
                type="file"
                accept=".xlsx, .xls"
                required={window.location.pathname === "/Import"}
                hasError={!!formErrors.file}
                errorMessage="Please upload Excel file"
                onChange={handleFileUpload}
              />
              {window.location.pathname !== "/Import" && (
                <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Excel file is optional. If no file is uploaded, an empty batch will be created.
                </Text>
              )}
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
            <div className="summary-line">
              <Text>Exception Total :</Text> <Text strong>{batchTotals?.exceptionTotal?.toLocaleString()}</Text>
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