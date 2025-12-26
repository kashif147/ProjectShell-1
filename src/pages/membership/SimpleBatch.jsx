import React, { useState, useEffect } from "react";
import { Drawer, Button, Row, Col, Space } from "antd";
import MyInput from "../../component/common/MyInput";
import MyDatePicker1 from "../../component/common/MyDatePicker1";
import axios from "axios";
import { useLocation } from "react-router-dom";
import MyAlert from "../../component/common/MyAlert"; // Import your MyAlert component

const SimpleBatch = ({ open, onClose, onSubmit }) => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    date: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [batchType, setBatchType] = useState("");

  // Determine batch type based on URL path
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/NewGraduate")) {
      setBatchType("new");
    } else if (path.includes("/CornMarketRewards")) {
      setBatchType("graduate");
    } else if (path.includes("/RecruitAFriend")) {
      setBatchType("recurit a frind");
    } else {
      setBatchType("");
    }
  }, [location.pathname]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};


    const nameInput = document.querySelector('[name="batchName"]');
    if (nameInput) {
      // Dispatch blur event to trigger MyInput's internal validation
      nameInput.dispatchEvent(new Event('blur', { bubbles: true }));

      // Also check for any validation error classes
      const hasError = nameInput.closest('.has-error') ||
        nameInput.classList.contains('error') ||
        nameInput.parentElement.classList.contains('ant-form-item-has-error');

      if (hasError) {
        newErrors.name = "Batch name validation failed";
      }
    }

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = "Batch name is required";
    }

    // Check if date is valid
    if (!formData.date || !formData.date.isValid()) {
      newErrors.date = "Valid start date is required";
    }

    // Check if batch type is determined
    if (!batchType) {
      console.error("Batch type could not be determined from URL");
      newErrors.batchType = "Could not determine batch type";
      MyAlert("error", "Configuration Error", "Could not determine batch type from URL");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForAPI = (momentDate) => {
    if (!momentDate || !momentDate.isValid()) {
      return null;
    }
    return momentDate.format("YYYY-MM-DD");
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");

    // Validate form
    if (!validateForm()) {
      MyAlert("error", "Validation Error", "Please fix the form errors before submitting");
      return;
    }

    // Prepare data for API
    const formattedDate = formatDateForAPI(formData.date);
    if (!formattedDate) {
      MyAlert("error", "Invalid Date", "Please select a valid start date");
      return;
    }

    const apiData = {
      name: formData.name.trim(),
      type: batchType,
      date: formattedDate,
    };

    console.log("Submitting batch:", apiData);

    // Get bearer token from localStorage
    const token = localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      MyAlert("error", "Authentication Failed", "Authentication token not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Make API call
      const response = await axios.post(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/batches`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      // Call parent onSubmit callback if provided
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(response.data);
      }

      // Show success message using MyAlert
      MyAlert("success", "Success", "Batch created successfully!");

      // Reset form
      setFormData({
        name: "",
        date: null,
      });
      setErrors({});

      // Close drawer
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error("Error creating batch:", error);

      let errorMessage = "Failed to create batch";
      let errorDescription = "An unexpected error occurred";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed";
          errorDescription = "Your session has expired. Please login again.";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid data";
          errorDescription = error.response.data?.message || "Please check the information you entered";
        } else if (error.response.status === 409) {
          errorMessage = "Duplicate entry";
          errorDescription = "Batch with this name already exists";
        } else if (error.response.status === 403) {
          errorMessage = "Permission denied";
          errorDescription = "You don't have permission to create batches";
        } else if (error.response.status === 500) {
          errorMessage = "Server error";
          errorDescription = "Internal server error. Please try again later.";
        } else {
          errorMessage = `Server error: ${error.response.status}`;
          errorDescription = error.response.data?.message || "Please contact support";
        }
      } else if (error.request) {
        errorMessage = "Network error";
        errorDescription = "Unable to connect to server. Please check your internet connection.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout";
        errorDescription = "The request took too long. Please try again.";
      } else {
        errorMessage = "Unknown error";
        errorDescription = error.message || "Please check console for details";
      }

      MyAlert("error", errorMessage, errorDescription);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    handleChange("date", date);
  };

  // Function to get display name for batch type
  const getBatchTypeDisplay = () => {
    switch (batchType) {
      case "new":
        return "New Graduate";
      case "corn market":
        return "Corn Market Rewards";
      case "recurit a frind":
        return "Recruit A Friend";
      default:
        return "Batch";
    }
  };

  return (
    <Drawer
      title={`Create ${getBatchTypeDisplay()} Batch`}
      placement="right"
      onClose={onClose}
      open={open}
      width={800}
      extra={
        <Space>
          <Button
            className="butn secoundry-btn"
            onClick={onClose}
            style={{ color: "#215E97", borderColor: "#215E97" }}
          >
            Close
          </Button>
          <Button
            className="butn primary-btn"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
          >
            Create
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-container" style={{
        padding: "16px",
        backgroundColor: "#f6f9fc",
        height: "100%"
      }}>
        <div style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e8e8e8"
        }}>
          <Row gutter={[16, 16]}>
            {/* <Col span={24}>
              <div style={{ 
                padding: "12px",
                backgroundColor: "#f0f7ff",
                borderRadius: "4px",
                borderLeft: "4px solid #215E97"
              }}>
                <strong style={{ color: "#215E97" }}>Batch Type:</strong> 
                <span style={{ marginLeft: "8px" }}>{getBatchTypeDisplay()}</span>
              </div>
            </Col> */}

            <Col span={24}>
              <MyInput
                label="Batch Name:"
                name="batchName"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                error={errors.name}
                validateOnBlur={true}
                placeholder={`Enter ${getBatchTypeDisplay()} batch name`}
              />
            </Col>

            <Col span={24}>
              <MyDatePicker1
                label="Creation Date:"
                value={formData.date}
                onChange={handleDateChange}
                required
                error={errors.date}
                placeholder="Select start date"
              />
            </Col>
          </Row>
        </div>

        {/* Additional info or instructions if needed */}
        {/* <div style={{ 
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#fff9e6",
          borderRadius: "4px",
          border: "1px solid #ffd591",
          fontSize: "14px",
          color: "#d46b08"
        }}>
          <strong>Note:</strong> Batch name should be unique. Start date determines when the batch becomes active.
        </div> */}
      </div>
    </Drawer>
  );
};

export default SimpleBatch;