import {
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  message,
  Button,
} from "antd";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { ExcelContext } from "../../context/ExcelContext";
import { UploadOutlined } from "@ant-design/icons";
import { paymentTypes } from "../../Data";
import "../../styles/CreateBatchPayment.css";
import MyDatePicker from "./MyDatePicker";
import MyInput from "./MyInput";
import CustomSelect from "./CustomSelect";
import { useLocation } from "react-router-dom";
import { addBatchWithMember } from "../../features/BatchesSlice"; // Import the Redux action
import { updateBatchDetail } from "../../features/profiles/BatchDetailsSlice";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { TextArea } = Input;
const { Title, Text } = Typography;

const requiredBatchColumns = ["Membership No", "Value for Periods Selected"];

const CreateBatchPayment = forwardRef((props, ref) => {
  const { editBatchId = null, editSource = null } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize Redux dispatch
  const { workLocationOptions, branchOptions } = useSelector(
    (state) => state.lookups,
  );

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
  const {
    excelData,
    setExcelData,
    setBatchTotals,
    batchTotals,
    setUploadedFile,
    uploadedFile,
  } = useContext(ExcelContext);
  console.log("uploadedFile", excelData);

  const [isSpecialPath, setIsSpecialPath] = useState(false);
  const [autoBatchType, setAutoBatchType] = useState("");

  const [formValues, setFormValues] = useState({
    batchType: "",
    batchDate: "",
    paymentDate: "",
    batchRef: "",
    description: "",
    comments: "",
    workLocation: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Check current path and set batch type accordingly
  useEffect(() => {
    const currentPath = location.pathname;
    let batchType = "";
    let isSpecial = false;

    switch (currentPath) {
      case "/StandingOrders":
        batchType = "Standing Order";
        isSpecial = true;
        break;
      case "/Deductions":
        batchType = "deduction";
        isSpecial = true;
        break;
      case "/onlinePayment":
        batchType = "Online Payment";
        isSpecial = true;
        break;
      case "/Cheque":
        batchType = "Cheque";
        isSpecial = true;
        break;
      default:
        batchType = "";
        isSpecial = false;
    }

    setIsSpecialPath(isSpecial);
    setAutoBatchType(batchType);

    // If it's a special path, automatically set batchType
    if (isSpecial && batchType) {
      setFormValues((prev) => ({
        ...prev,
        batchType: batchType,
      }));
    }

    // Cleanup function - reset form values when component unmounts
    return () => {
      setFormValues({
        batchType: "",
        batchDate: "",
        batchRef: "",
        description: "",
        comments: "",
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
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        message.error("Excel file is empty.");
        if (event.target) event.target.value = "";
        return;
      }

      const uploadedColumns = Object.keys(json[0]);
      const missingColumns = requiredBatchColumns.filter(
        (col) => !uploadedColumns.includes(col),
      );

      if (missingColumns.length > 0) {
        message.error(`Missing required columns: ${missingColumns.join(", ")}`);
        // Reset the input so the user can try again after fixing the file
        if (event.target) event.target.value = "";
        setUploadedFile(null);
        setExcelData([]);
      } else {
        message.success("All required columns are present.");
        setUploadedFile(file); // Only set file on success
        setExcelData(json);

        // Utility function to clean and parse dollar values
        const cleanValue = (val) => {
          if (!val) return 0;
          return parseFloat(val.toString().replace(/[^0-9.-]+/g, ""));
        };

        const totalCurrent = json.reduce((sum, row) => {
          // Use specific column name from user template if present for calculations
          return (
            sum +
            cleanValue(row["Value for Periods Selected"] || row["Amount"] || 0)
          );
        }, 0);

        const totalAdvance = json.reduce((sum, row) => {
          return sum + cleanValue(row["Advance"] || 0);
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
    if (name === "batchType" && isSpecialPath) {
      return;
    }

    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const buildBatchDetailsFormData = () => {
    const formData = new FormData();
    const isStandingOrder =
      formValues.batchType?.toLowerCase() === "standing order";
    const isDeduction = formValues.batchType?.toLowerCase() === "deduction";

    const formattedBatchDate = dayjs(
      formValues.batchDate,
      "MM/YYYY",
    ).format("YYYY-MM-DD");
    const formattedPaymentDate = dayjs(
      formValues.paymentDate,
      "DD/MM/YYYY",
    ).format("YYYY-MM-DD");

    const apiType = isStandingOrder
      ? "Standing Order"
      : isDeduction
        ? "deduction"
        : formValues.batchType || "";

    formData.append("type", apiType);
    formData.append("date", formattedPaymentDate);
    formData.append("batchDate", formattedBatchDate);
    formData.append("paymentDate", formattedPaymentDate);

    if (isStandingOrder) {
      formData.append("bankName", formValues.workLocation);
    } else {
      formData.append("workLocation", formValues.workLocation);
    }

    formData.append("referenceNumber", formValues.batchRef);
    formData.append("description", formValues.description);
    formData.append("comments", formValues.comments || "");
    if (uploadedFile) {
      formData.append("file", uploadedFile);
    }
    return formData;
  };

  const handleSubmit = async () => {
    const required = [
      "batchType",
      "batchDate",
      "paymentDate",
      "batchRef",
      "workLocation",
    ];
    const nextErrors = {};
    required.forEach((key) => {
      if (!formValues[key] || String(formValues[key]).trim() === "") {
        nextErrors[key] = true;
      }
    });
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      message.error("Please fill all required fields.");
      return null;
    }

    if (editBatchId) {
      const editStatus = String(editSource?.batchStatus || "")
        .trim()
        .toLowerCase();
      if (editStatus && editStatus !== "pending") {
        message.error("Batch can only be edited while status is pending");
        return null;
      }
      try {
        const formData = buildBatchDetailsFormData();
        await dispatch(
          updateBatchDetail({ batchDetailId: editBatchId, formData }),
        ).unwrap();
        message.success("Batch updated successfully");
        return { _id: editBatchId };
      } catch (error) {
        message.error(
          typeof error === "string"
            ? error
            : error?.message || "Failed to update batch",
        );
        return null;
      }
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
      batchStatus: "Pending",
      comments: formValues.comments,
      createdBy: "Super User",
      members: members,
    };

    // If it's a deduction or standing order batch, call the API
    if (
      formValues.batchType?.toLowerCase() === "deduction" ||
      formValues.batchType?.toLowerCase() === "standing order"
    ) {
      try {
        const formData = buildBatchDetailsFormData();
        const isStandingOrder =
          formValues.batchType?.toLowerCase() === "standing order";

        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${process.env.REACT_APP_ACCOUNT_SERVICE_URL}/batch-details`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200 || response.status === 201) {
          message.success(
            `${
              isStandingOrder ? "Standing Order" : "Deduction"
            } batch created successfully`,
          );
          const batchId = response?.data?.data?._id;
          // Merge the API response ID into the batch object if needed
          const finalBatchObject = { ...batchObject, _id: batchId };
          setExcelData(finalBatchObject);
          return finalBatchObject;
        }
      } catch (error) {
        console.error("Error creating batch:", error);
        message.error(
          `Failed to create ${
            formValues.batchType?.toLowerCase() === "standing order"
              ? "Standing Order"
              : "Deduction"
          } batch`,
        );
        return null; // Stop navigation if API call fails
      }
    }

    setExcelData(batchObject);
    message.success("Batch data prepared successfully");
    return batchObject;
  };

  // Add a reset function that can be called from parent
  const resetForm = () => {
    form.resetFields();
    setFormValues({
      batchType: isSpecialPath ? autoBatchType : "",
      batchDate: "",
      paymentDate: "",
      batchRef: "",
      description: "",
      comments: "",
      workLocation: "",
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
      fileInput.value = "";
    }
  };

  useEffect(() => {
    if (
      !editBatchId ||
      !editSource?._id ||
      String(editSource._id) !== String(editBatchId)
    ) {
      return;
    }

    const batchDateVal = editSource.batchDate
      ? dayjs(editSource.batchDate).format("MM/YYYY")
      : "";
    const paymentDateVal = editSource.paymentDate
      ? dayjs(editSource.paymentDate).format("DD/MM/YYYY")
      : "";

    setFormValues({
      batchType: editSource.type || "",
      batchDate: batchDateVal,
      paymentDate: paymentDateVal,
      batchRef: editSource.referenceNumber || "",
      description: editSource.description || editSource.name || "",
      comments: editSource.comments || "",
      workLocation: editSource.workLocation || editSource.bankName || "",
    });
    setFormErrors({});

    const count = Array.isArray(editSource.batchPayments)
      ? editSource.batchPayments.length
      : 0;
    setBatchTotals((prev) => ({
      ...prev,
      records: count,
    }));
  }, [editBatchId, editSource]);

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
        <Title level={3} className="page-title">
          {getPageTitle()}
        </Title>
        <Text type="secondary">{getBreadcrumbText()}</Text>
      </div>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={14}>
          <Card className="batch-card" styles={{ body: { padding: "24px" } }}>
            <Title level={4} className="section-title">
              Batch Details
            </Title>
            <Form layout="vertical" form={form} requiredMark={false}>
              <div className="d-flex w-100" style={{ gap: "5px" }}>
                <div className="w-50">
                  <CustomSelect
                    label="Batch Type"
                    name="batchType"
                    required
                    disabled={isSpecialPath} // Disable if special path
                    hasError={!!formErrors.batchType}
                    errorMessage="Please select batch type"
                    options={(paymentTypes || []).map((p) => ({
                      value: p.value || p,
                      label: p.label || p,
                    }))}
                    value={formValues.batchType}
                    onChange={(e) => setField("batchType", e.target.value)}
                  />
                </div>
                <div className="w-50">
                  <MyDatePicker
                    label="Batch Date"
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
              <div className="w-100">
                <MyDatePicker
                  label="Payment Date"
                  name="paymentDate"
                  required
                  hasError={!!formErrors.paymentDate}
                  errorMessage="Please select payment date"
                  value={formValues.paymentDate}
                  onChange={(dateString) => setField("paymentDate", dateString)}
                  format="DD/MM/YYYY"
                />
              </div>

              <div className="w-100 mb-3">
                <CustomSelect
                  label={
                    location.pathname === "/StandingOrders"
                      ? "Bank Name"
                      : "Work Location"
                  }
                  name="workLocation"
                  required
                  hasError={!!formErrors.workLocation}
                  errorMessage={`Please select ${location.pathname === "/StandingOrders" ? "bank name" : "work location"}`}
                  options={
                    location.pathname === "/StandingOrders"
                      ? branchOptions
                      : workLocationOptions
                  }
                  value={formValues.workLocation}
                  onChange={(e) => setField("workLocation", e.target.value)}
                />
              </div>

              <MyInput
                label="Batch Ref No."
                name="batchRef"
                required
                hasError={!!formErrors.batchRef}
                errorMessage="Please enter batch reference number"
                value={formValues.batchRef}
                onChange={(e) => setField("batchRef", e.target.value)}
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
                onChange={(e) => setField("description", e.target.value)}
              />

              <MyInput
                label="Comments"
                name="comments"
                type="textarea"
                rows={3}
                value={formValues.comments}
                onChange={(e) => setField("comments", e.target.value)}
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
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", marginTop: "4px" }}
                >
                  Excel file is optional. If no file is uploaded, an empty batch
                  will be created.
                </Text>
              )}
            </Form>
          </Card>
        </Col>

        <Col span={10}>
          <Card className="batch-card" styles={{ body: { padding: "24px" } }}>
            <Title level={4} className="section-title">
              Batch Summary
            </Title>
            <div className="summary-line">
              <Text>Total Arrears (€):</Text>{" "}
              <Text strong>€{batchTotals?.arrears?.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text>Total Current (€):</Text>{" "}
              <Text strong>€{batchTotals?.totalCurrent?.toLocaleString()}</Text>
            </div>
            <div className="summary-line">
              <Text>Total Advance (€):</Text>{" "}
              <Text strong>€{batchTotals?.advance?.toLocaleString()}</Text>
            </div>
            {/* <div className="summary-line">
              <Text>Exception Total :</Text> <Text strong>{batchTotals?.exceptionTotal?.toLocaleString()}</Text>
            </div> */}

            <Divider style={{ margin: "16px 0" }} />

            <div className="summary-line total">
              <Text strong>Batch Total (€):</Text>{" "}
              <Text strong style={{ color: "#1677ff" }}>
                €{batchTotals?.totalCurrent?.toLocaleString()}
              </Text>
            </div>
            <div className="summary-line">
              <Text strong>Total Records:</Text>{" "}
              <Text>{batchTotals?.records}</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default CreateBatchPayment;
