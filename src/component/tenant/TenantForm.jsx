import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Divider,
  Switch,
  message,
} from "antd";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { getAllTenants, updateTenant } from "../../features/TenantSlice";
import { updateFtn } from "../../utils/Utilities";
import { insertDataFtn } from "../../utils/Utilities";
// import "../../../styles/TenantManagement.css";
import "../../styles/TenantManagement.css"
import { useDispatch } from "react-redux";
import { json } from "react-router-dom";
import MyAlert from "../common/MyAlert";

const { TabPane } = Tabs;

const TenantForm = ({ tenant, onClose }) => {
  const dispatch = useDispatch
  const [originalTenant, setOriginalTenant] = useState(null);
  const [iData, setIData] = useState({
    name: "",
    code: "",
    description: "",
    domain: "",
    contactEmail: "",
    contactPhone: "",
    status: "PENDING",
    isActive: true,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "IE",
    },
    settings: {
      maxUsers: 100,
      allowSelfRegistration: true,
      sessionTimeout: 24,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    subscription: {
      plan: "FREE",
      startDate: "",
      endDate: "",
      autoRenew: true,
    },
    authenticationConnections: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tenant) {
      setIData(tenant);         // populate form
      setOriginalTenant(tenant); // keep original copy for comparison
    }
    // eslint-disable-next-line
  }, [tenant]);

  // const handleChange = (section, field, value) => {
  //   setIData((prev) => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       [field]: value,
  //     },
  //   }));
  // };

  const validate = () => {
    let newErrors = {};
    if (!iData.name?.trim()) newErrors.name = "Organization name is required";
    if (!iData.code?.trim()) newErrors.code = "Tenant code is required";
    if (!iData.description?.trim())
      newErrors.description = "Description is required";
    if (!iData.contactEmail?.trim())
      newErrors.contactEmail = "Contact email is required";
    if (!iData.subscription.plan)
      newErrors.subscriptionPlan = "Plan is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (section, field, value, index = null) => {

    setIData((prev) => {
      let updated = { ...prev };

      if (section === "root") {
        updated[field] = value;
      } else if (section === "passwordPolicy") {
        updated.settings = {
          ...prev.settings,
          passwordPolicy: {
            ...prev.settings.passwordPolicy,
            [field]: value,
          },
        };
      } else if (section === "authenticationConnections" && index !== null) {
        const connections = [...prev.authenticationConnections];
        connections[index] = {
          ...connections[index],
          [field]: value,
        };
        updated.authenticationConnections = connections;
      } else {
        updated[section] = {
          ...prev[section],
          [field]: value,
        };
      }

      return updated;
    });
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      // if field has any value, remove error
      if (value && newErrors[field]) {
        delete newErrors[field];
      }

      return newErrors;
    });
  };



  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    if (tenant) {
      // compare iData vs originalTenant
      const changedData = {};
      Object.keys(iData).forEach((key) => {
        if (JSON.stringify(iData[key]) !== JSON.stringify(originalTenant[key])) {
          changedData[key] = iData[key];
        }
      });
      if (tenant) {
        // ✅ Find differences
        const changedFields = Object.keys(iData).reduce((acc, key) => {
          if (iData[key] !== tenant[key]) {
            acc[key] = iData[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedFields).length === 0) {
          MyAlert("error", 'No changes detected for tenant')
          return;
        }
        try {
          await updateFtn(
            process.env.REACT_APP_POLICY_SERVICE_URL,
            `/api/tenants/${tenant?._id}`,
            // { id: tenant?._id, ...changedFields },
            { ...changedFields },
            async () => {
              onClose();
              setErrors({});
              const res = await dispatch(getAllTenants());
              console.log("after dispatch", res);
            },
            "Tenant updated successfully"
          );
        } catch (err) {
          console.error("Update failed:", err);
        }
        return;
      }
      return;
    }
    else
      insertDataFtn(
        process.env.REACT_APP_POLICY_SERVICE_URL,
        "/api/tenants",      // API endpoint
        iData,               // Payload
        "Tenant created successfully",   // Success message
        "Error creating tenant",         // Error message
        () => {
          // 🔥 Callback after success
          onClose();          // close drawer/modal if applicable
          setErrors({});      // clear errors
          setIData({});       // reset form state
        }
      );

  };
  console.log(errors, "yrs")

  return (
    <Drawer
      title={tenant ? "Edit Tenant" : "Add New Tenant"}
      width={1000}
      open={true}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose} className="butn secoundry-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            className="butn primary-btn"
          >
            {tenant ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <Tabs defaultActiveKey="basic" size="small">
          {/* 1️⃣ Basic Info & Contact */}
          <TabPane tab="Basic Info & Contact" key="basic">
            <div className="drawer-tab-content pt-2">

              {/* ================= Organization Info ================= */}
              {/* <div className="section-header">🏢 Organization Info</div> */}
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Organization Name"
                    value={iData.name}
                    onChange={(e) => handleChange("root", "name", e.target.value, null)}
                    hasError={errors.name}
                    required
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Tenant Code"
                    value={iData.code}
                    onChange={(e) =>
                      handleChange("root", "code", e.target.value.toUpperCase())
                    }
                    hasError={errors.code}
                    required
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <MyInput
                    label="Description"
                    value={iData.description}
                    onChange={(e) => handleChange("root", "description", e.target.value, null)}
                    hasError={errors.description}
                    required
                    textarea
                  />
                </Col>
              </Row>

              <Row gutter={16} align="middle">
                <Col span={8}>
                  <MyInput
                    label="Domain"
                    value={iData.domain}
                    onChange={(e) => handleChange("root", "domain", e.target.value, null)}
                    hasError={errors?.domain}
                  />
                </Col>
                {/* <Col span={8}>
        <CustomSelect
          label="Status"
          value={iData.status}
          onChange={(val) => handleChange("status", val)}
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "PENDING", label: "Pending" },
          ]}
        />
      </Col> */}
                <Col span={8} className="flex items-center gap-2 flex-row">
                  <label className="switch-label">Active</label>
                  <Switch
                    checked={iData.isActive}
                    onChange={(val) => handleChange("isActive", val)}
                  />
                </Col>
              </Row>

              {/* ================= Contact Info ================= */}
              <div className="section-header">📞 Contact Information</div>
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Contact Email"
                    value={iData.contactEmail}
                    onChange={(e) => handleChange("root", "contactEmail", e.target.value, null)}
                    hasError={errors.contactEmail}
                    type="email"
                    required
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Contact Phone"
                    value={iData.contactPhone}
                    onChange={(e) => handleChange("root", "contactPhone", e.target.value, null)}
                    type='mobile'
                  />
                </Col>
              </Row>

              {/* ================= Address Info ================= */}
              <div className="section-header">🏠 Address Information</div>
              <Row gutter={16}>
                <Col span={24}>
                  <MyInput
                    label="Street Address"
                    value={iData.address.street}
                    onChange={(e) =>
                      handleChange("address", "street", e.target.value, null)
                    }
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <MyInput
                    label="Area or Town"
                    value={iData.address.city}
                    onChange={(e) =>
                      handleChange("address", "city", e.target.value, null)
                    }
                  />
                </Col>
                <Col span={6}>
                  <MyInput
                    label="City, County or Postcode"
                    value={iData.address.state}
                    onChange={(e) =>
                      handleChange("address", "state", e.target.value, null)
                    }
                  />
                </Col>
                <Col span={6}>
                  <MyInput
                    label="Eircode"
                    value={iData.address.zipCode}
                    onChange={(e) =>
                      handleChange("address", "zipCode", e.target.value, null)
                    }
                  />
                </Col>
                <Col span={6}>
                  <CustomSelect
                    label="Country"
                    value={iData.address.country}
                    onChange={(val) => handleChange("address", "country", val?.target.value, null)}
                    options={[
                      { value: "IE", label: "Ireland" },
                      { value: "US", label: "United States" },
                      { value: "CA", label: "Canada" },
                      { value: "UK", label: "United Kingdom" },
                      { value: "AU", label: "Australia" },
                    ]}
                  />
                </Col>
              </Row>
            </div>
          </TabPane>



          {/* 2️⃣ Settings & Subscription */}
          <TabPane tab="Settings & Subscription" key="settings">
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <MyInput
                  label="Max Users"
                  type="number"
                  value={iData.settings.maxUsers}
                  onChange={(e) =>
                    handleChange("settings", "maxUsers", e.target.value, null)
                  }
                />
              </Col>
              <Col span={8}>
                <label>Allow Self Registration</label>
                <Switch
                  checked={iData.settings.allowSelfRegistration}
                  onChange={(val) =>
                    handleChange("settings", "allowSelfRegistration", val, null)
                  }
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Session Timeout (hrs)"
                  type="number"
                  value={iData.settings.sessionTimeout}
                  onChange={(e) =>
                    handleChange("settings", "sessionTimeout", e.target.value)
                  }
                />
              </Col>
            </Row>

            <Divider>Password Policy</Divider>
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <MyInput
                  label="Min Length"
                  type="number"
                  value={iData.settings.passwordPolicy.minLength}
                  onChange={(e) =>
                    setIData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        passwordPolicy: {
                          ...prev.settings.passwordPolicy,
                          minLength: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </Col>
              <Col span={18} style={{ display: "flex", gap: 20 }}>
                <label>
                  Uppercase{" "}
                  <Switch
                    checked={iData.settings.passwordPolicy.requireUppercase}
                    onChange={(val) =>
                      setIData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          passwordPolicy: {
                            ...prev.settings.passwordPolicy,
                            requireUppercase: val,
                          },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  Lowercase{" "}
                  <Switch
                    checked={iData.settings.passwordPolicy.requireLowercase}
                    onChange={(val) =>
                      setIData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          passwordPolicy: {
                            ...prev.settings.passwordPolicy,
                            requireLowercase: val,
                          },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  Numbers{" "}
                  <Switch
                    checked={iData.settings.passwordPolicy.requireNumbers}
                    onChange={(val) =>
                      setIData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          passwordPolicy: {
                            ...prev.settings.passwordPolicy,
                            requireNumbers: val,
                          },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  Special Chars{" "}
                  <Switch
                    checked={iData.settings.passwordPolicy.requireSpecialChars}
                    onChange={(val) =>
                      setIData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          passwordPolicy: {
                            ...prev.settings.passwordPolicy,
                            requireSpecialChars: val,
                          },
                        },
                      }))
                    }
                  />
                </label>
              </Col>
            </Row>

            <Divider>Subscription</Divider>
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <CustomSelect
                  label="Plan"
                  value={iData.subscription.plan}
                  onChange={(val) =>
                    handleChange("subscription", "plan", val?.target.value)
                  }
                  options={[
                    { value: "FREE", label: "Free" },
                    { value: "PRO", label: "Pro" },
                    { value: "ENTERPRISE", label: "Enterprise" },
                  ]}
                  error={errors.subscriptionPlan}
                  required
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Start Date"
                  type="date"
                  value={iData.subscription.startDate}
                  onChange={(e) =>
                    handleChange("subscription", "startDate", e.target.value)
                  }
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="End Date"
                  type="date"
                  value={iData.subscription.endDate}
                  onChange={(e) =>
                    handleChange("subscription", "endDate", e.target.value)
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <label>Auto Renew</label>
                <Switch
                  checked={iData.subscription.autoRenew}
                  onChange={(val) =>
                    handleChange("subscription", "autoRenew", val)
                  }
                />
              </Col>
            </Row>
          </TabPane>

          {/* 3️⃣ Auth Connections */}
          <TabPane tab="Auth Connections" key="auth">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                setIData((prev) => ({
                  ...prev,
                  authenticationConnections: [
                    ...(prev.authenticationConnections || []),
                    { connectionType: "", issuerUrl: "", directoryId: "", audience: "", isActive: true },
                  ],
                }))
              }
              style={{ marginBottom: 12 }}
            >
              Add Connection
            </Button>

            {(iData.authenticationConnections?.length ? iData.authenticationConnections : [{}]).map((conn, idx) => {
              const connection = {
                connectionType: "",
                issuerUrl: "",
                directoryId: "",
                audience: "",
                isActive: true,
                ...conn,
              };

              return (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #ddd",
                    padding: 12,
                    marginTop: 12,
                    borderRadius: 6,
                  }}
                >
                  <div
                    className="d-flex justify-content-end align-items-center mb-2"
                    style={{ gap: "8px" }}
                  >
                    {iData.authenticationConnections?.length > 0 && (
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() =>
                          setIData((prev) => ({
                            ...prev,
                            authenticationConnections: prev.authenticationConnections.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    )}

                    <Switch
                      checked={connection.isActive}
                      onChange={(val) => {
                        const newCons = [...(iData.authenticationConnections || [])];
                        newCons[idx] = { ...connection, isActive: val };
                        setIData((prev) => ({ ...prev, authenticationConnections: newCons }));
                      }}
                    />
                  </div>

                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <CustomSelect
                        label="Connection Type"
                        value={connection.connectionType}
                        onChange={(value) => {
                          const newCons = [...(iData.authenticationConnections || [])];
                          newCons[idx] = { ...connection, connectionType: value?.target.value };
                          setIData((prev) => ({ ...prev, authenticationConnections: newCons }));
                        }}
                        options={[
                          { label: "Entra ID (Azure AD)", value: "Entra ID (Azure AD)" },
                          { label: "Azure B2C", value: "Azure B2C" },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <MyInput
                        label="Issuer URL"
                        placeholder="https://login.microsoftonline.com/{tid}/v2.0"
                        value={connection.issuerUrl}
                        onChange={(e) => {
                          const newCons = [...(iData.authenticationConnections || [])];
                          newCons[idx] = { ...connection, issuerUrl: e.target.value };
                          setIData((prev) => ({ ...prev, authenticationConnections: newCons }));
                        }}
                      />
                    </Col>

                    <Col span={12}>
                      <MyInput
                        label="Directory Id"
                        value={connection.directoryId}
                        onChange={(e) => {
                          const newCons = [...(iData.authenticationConnections || [])];
                          newCons[idx] = { ...connection, directoryId: e.target.value };
                          setIData((prev) => ({ ...prev, authenticationConnections: newCons }));
                        }}
                      />
                    </Col>

                    <Col span={12}>
                      <MyInput
                        label="Audience"
                        value={connection.audience}
                        placeholder="{clientId}"
                        onChange={(e) => {
                          const newCons = [...(iData.authenticationConnections || [])];
                          newCons[idx] = { ...connection, audience: e.target.value };
                          setIData((prev) => ({ ...prev, authenticationConnections: newCons }));
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              );
            })}
          </TabPane>

        </Tabs>
      </div>
    </Drawer>
  );
};

export default TenantForm;
