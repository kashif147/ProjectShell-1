import React, { useState, useEffect, useRef } from "react";
import { Drawer, Button, Row, Col, Space } from "antd";
import MyInput from "../../component/common/MyInput";
import MyDatePicker1 from "../../component/common/MyDatePicker1";
import axios from "axios";
import { useLocation } from "react-router-dom";
import MyAlert from "../../component/common/MyAlert";

const SimpleBatch = ({ open, onClose, onSubmit }) => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    date: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [batchType, setBatchType] = useState("");
  const batchTypeRef = useRef("");
  const lastPathRef = useRef("");

  // Determine batch type based on URL path - with better logic
  useEffect(() => {
    const path = location.pathname;
    
    // Skip if path hasn't changed
    if (path === lastPathRef.current) {
      return;
    }
    
    lastPathRef.current = path;
    console.log("🔄 useEffect triggered with path:", path);

    let determinedType = "";
    
    // More specific matching
    if (path.toLowerCase().includes("newgraduate")) {
      determinedType = "new-graduate";
    } else if (path.toLowerCase().includes("cornmarketrewards")) {
      determinedType = "inmo-rewards";
    } else if (path.toLowerCase().includes("recruitafriend")) {
      determinedType = "recruit-friend";
    } else {
      determinedType = "";
      console.warn("⚠️ Could not determine batch type from path:", path);
    }
    
    console.log("🎯 Determined batch type:", determinedType);
    
    // Update both state and ref
    setBatchType(determinedType);
    batchTypeRef.current = determinedType;
    
    // Force a re-render to ensure UI updates
    setFormData(prev => ({...prev}));
  }, [location.pathname]);

  // Debug log when batchType changes
  useEffect(() => {
    console.log("📊 batchType state updated to:", batchType);
  }, [batchType]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Batch name is required";
    }

    // Date validation
    if (!formData.date || !formData.date.isValid()) {
      newErrors.date = "Valid start date is required";
    }

    // Batch type validation - using ref for latest value
    const currentType = batchTypeRef.current;
    console.log("🔍 Validating form - current batch type:", currentType);
    
    if (!currentType) {
      console.error("❌ Batch type could not be determined from URL");
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
    console.log("=".repeat(50));
    console.log("🚀 SUBMIT STARTED");
    console.log("=".repeat(50));
    
    console.log("📍 Current pathname:", location.pathname);
    console.log("📋 batchType from state:", batchType);
    console.log("📋 batchType from ref:", batchTypeRef.current);
    
    // DIRECT HARDCODED CHECK - This will show exactly what value we're working with
    let hardcodedType = "";
    if (location.pathname.toLowerCase().includes("newgraduate")) {
      hardcodedType = "new-graduate";
    } else if (location.pathname.toLowerCase().includes("cornmarketrewards")) {
      hardcodedType = "inmo-rewards";
    } else if (location.pathname.toLowerCase().includes("recruitafriend")) {
      hardcodedType = "recruit-friend";
    }
    
    console.log("🎯 Hardcoded type from path analysis:", hardcodedType);
    
    if (!validateForm()) {
      MyAlert("error", "Validation Error", "Please fix the form errors before submitting");
      return;
    }

    const formattedDate = formatDateForAPI(formData.date);
    if (!formattedDate) {
      MyAlert("error", "Invalid Date", "Please select a valid start date");
      return;
    }

    // FORCE THE CORRECT VALUE - Let's override with direct path analysis
    let apiType = hardcodedType; // Use the hardcoded analysis
    
    // If hardcodedType is empty, use ref as fallback
    if (!apiType) {
      apiType = batchTypeRef.current;
    }
    
    // If still empty, use state as last resort
    if (!apiType) {
      apiType = batchType;
    }
    
    console.log("🎯 Final apiType to be sent:", apiType);

    const apiData = {
      name: formData.name.trim(),
      type: apiType, // Use the determined type
      date: formattedDate,
    };

    console.log("📤 FINAL Payload to be sent:", JSON.stringify(apiData, null, 2));
    console.log("Expected for /CornMarketRewards: type should be 'inmo-rewards'");
    console.log("=".repeat(50));

    // TEST: Let's also log what would happen with different logic
    console.log("🧪 Testing alternative determinations:");
    console.log("1. State-based:", batchType);
    console.log("2. Ref-based:", batchTypeRef.current);
    console.log("3. Direct path analysis:", hardcodedType);
    console.log("4. Using includes '/NewGraduate':", location.pathname.includes("/NewGraduate"));
    console.log("5. Using includes '/CornMarketRewards':", location.pathname.includes("/CornMarketRewards"));
    console.log("6. Using includes '/RecruitAFriend':", location.pathname.includes("/RecruitAFriend"));

    const token = localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      MyAlert("error", "Authentication Failed", "Authentication token not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      console.log("🌐 Making API request...");
      
      const response = await axios.post(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/batches`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      console.log("✅ API Response:", response.data);

      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(response.data);
      }

      MyAlert("success", "Success", "Batch created successfully!");

      setFormData({
        name: "",
        date: null,
      });
      setErrors({});

      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error("❌ Error creating batch:", error);

      let errorMessage = "Failed to create batch";
      let errorDescription = "An unexpected error occurred";

      if (error.response) {
        console.error("📊 Error response data:", error.response.data);
        console.error("📊 Error response status:", error.response.status);
        
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
      case "new-graduate":
        return "New Graduate";
      case "inmo-rewards":
        return "Inmo Rewards";
      case "recruit-friend":
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
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#fff0f0",
                borderRadius: "4px",
                borderLeft: "4px solid #ff4d4f"
              }}>
                <strong style={{ color: "#ff4d4f" }}>DEBUG PANEL - Current State:</strong>
                <div><strong>Path:</strong> {location.pathname}</div>
                <div><strong>Batch Type (UI):</strong> {batchType}</div>
                <div><strong>Batch Type (Ref):</strong> {batchTypeRef.current}</div>
                <div><strong>Display Title:</strong> {getBatchTypeDisplay()}</div>
                <div><strong>Expected API Type:</strong> {
                  location.pathname.toLowerCase().includes("cornmarketrewards") ? "inmo-rewards" :
                  location.pathname.toLowerCase().includes("newgraduate") ? "new-graduate" :
                  location.pathname.toLowerCase().includes("recruitafriend") ? "recruit-friend" : "unknown"
                }</div>
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
      </div>
    </Drawer>
  );
};

export default SimpleBatch;