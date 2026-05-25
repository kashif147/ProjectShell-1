import React, { useState, useEffect, useCallback } from "react";
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
import {
  isBankSectionComplete,
  isBicFieldComplete,
  isIbanFieldComplete,
} from "../../utils/iban";
import CustomSelect from "../common/CustomSelect";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
  getAllTenants,
  updateOrganisationProfile,
  updateBranding,
  updateRegionalSettings,
} from "../../features/TenantSlice";
import { updateFtn } from "../../utils/Utilities";
import { insertDataFtn } from "../../utils/Utilities";
import "../../styles/TenantManagement.css";
import { useDispatch } from "react-redux";
import MyAlert from "../common/MyAlert";
import MyInput from "../common/MyInput";
import { mergeTenantFormData } from "../../constants/tenantDefaults";
import TenantBrandingAssetUpload from "./TenantBrandingAssetUpload";
import TenantOfficesPanel from "./TenantOfficesPanel";
import TenantDepartmentsPanel from "./TenantDepartmentsPanel";
import { notifyBrandingRefresh } from "../../context/TenantBrandingContext";
import {
  clearTenantBrandingCache,
  resolveTenantId,
} from "../../services/tenantBrandingService";
const { TabPane } = Tabs;

const TENANT_TAB_KEYS = [
  "details",
  "organisation",
  "branding",
  "departments",
  "offices",
];

const getChangedFields = (current, original) =>
  Object.keys(current).reduce((acc, key) => {
    if (JSON.stringify(current[key]) !== JSON.stringify(original?.[key])) {
      acc[key] = current[key];
    }
    return acc;
  }, {});

const TenantForm = ({ tenant, onClose }) => {
  const dispatch = useDispatch();
  const [originalTenant, setOriginalTenant] = useState(null);
  const [iData, setIData] = useState(mergeTenantFormData(null));

  const [errors, setErrors] = useState({});
  const [activeTabKey, setActiveTabKey] = useState("details");

  useEffect(() => {
    setActiveTabKey("details");
  }, [tenant?._id]);

  const handleTabChange = useCallback((key) => {
    if (TENANT_TAB_KEYS.includes(key)) {
      setActiveTabKey(key);
    }
  }, []);

  useEffect(() => {
    if (tenant) {
      const formData = mergeTenantFormData(tenant);
      setIData(formData);
      setOriginalTenant(formData);
    } else {
      const emptyForm = mergeTenantFormData(null);
      setIData(emptyForm);
      setOriginalTenant(null);
    }
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
    if (!iData.name?.trim()) newErrors.name = "Tenant name is required";
    if (!iData.code?.trim()) newErrors.code = "Tenant code is required";
    if (!iData.description?.trim())
      newErrors.description = "Description is required";
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
      } else if (section === "organisationProfileBankAddress") {
        updated.organisationProfile = {
          ...prev.organisationProfile,
          bankAddress: {
            ...(prev.organisationProfile?.bankAddress || {}),
            [field]: value,
          },
        };
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
      const changedFields = getChangedFields(iData, originalTenant);

      if (Object.keys(changedFields).length === 0) {
        MyAlert("error", "No changes detected for tenant");
        return;
      }

      const changedKeys = Object.keys(changedFields);
      const isOnlyChange = (key) =>
        changedKeys.length === 1 && changedKeys[0] === key;

      const afterUpdate = async () => {
        onClose();
        setErrors({});
        if (changedFields.branding) {
          clearTenantBrandingCache(tenant._id);
          const sessionTenantId = resolveTenantId();
          if (sessionTenantId) clearTenantBrandingCache(sessionTenantId);
          notifyBrandingRefresh();
        }
        await dispatch(getAllTenants());
      };

      try {
        if (isOnlyChange("organisationProfile")) {
          await dispatch(
            updateOrganisationProfile({
              id: tenant._id,
              organisationProfile: changedFields.organisationProfile,
            }),
          ).unwrap();
        } else if (isOnlyChange("branding")) {
          await dispatch(
            updateBranding({
              id: tenant._id,
              branding: changedFields.branding,
            }),
          ).unwrap();
        } else if (isOnlyChange("regionalSettings")) {
          await dispatch(
            updateRegionalSettings({
              id: tenant._id,
              regionalSettings: changedFields.regionalSettings,
            }),
          ).unwrap();
        } else {
          await updateFtn(
            process.env.REACT_APP_POLICY_SERVICE_URL,
            `/tenants/${tenant?._id}`,
            { ...changedFields },
            null,
            "Tenant updated successfully",
          );
          await afterUpdate();
          return;
        }

        MyAlert("success", "Tenant updated successfully");
        await afterUpdate();
      } catch (err) {
        console.error("Update failed:", err);
        MyAlert(
          "error",
          err?.message || "Failed to update tenant. Please try again.",
        );
      }
      return;
    } else
      insertDataFtn(
        process.env.REACT_APP_POLICY_SERVICE_URL,
        "/tenants", // API endpoint
        iData, // Payload
        "Tenant created successfully", // Success message
        "Error creating tenant", // Error message
        () => {
          // 🔥 Callback after success
          onClose(); // close drawer/modal if applicable
          setErrors({}); // clear errors
          setIData({}); // reset form state
        },
      );
  };
  const ColorField = ({ label, value, onChange }) => (
    <div className="color-field">
      <MyInput
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="color"
        className="color-picker-input"
        value={value || "#1E40AF"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} picker`}
      />
    </div>
  );

  return (
    <Drawer
      className="tenant-form-drawer"
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
        <Tabs
          className="tenant-form-tabs"
          activeKey={activeTabKey}
          onChange={handleTabChange}
          destroyInactiveTabPane
          size="small"
        >
          <TabPane tab="Tenant Details" key="details">
            <div className="drawer-tab-content pt-2">
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Tenant Name"
                    value={iData.name}
                    onChange={(e) =>
                      handleChange("root", "name", e.target.value, null)
                    }
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
                    onChange={(e) =>
                      handleChange("root", "description", e.target.value, null)
                    }
                    hasError={errors.description}
                    required
                    textarea
                  />
                </Col>
              </Row>

              <Row gutter={16} align="middle">
                <Col span={12}>
                  <MyInput
                    label="Domain"
                    value={iData.domain}
                    onChange={(e) =>
                      handleChange("root", "domain", e.target.value, null)
                    }
                    hasError={errors?.domain}
                  />
                </Col>
                <Col span={12}>
                  <div className="switch-field">
                    <label className="my-input-label">Active</label>
                    <Switch
                      className="tenant-active-switch"
                      checked={iData.isActive}
                      onChange={(val) => handleChange("root", "isActive", val)}
                    />
                  </div>
                </Col>
              </Row>

              <div className="section-header">Regional Settings</div>
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Timezone"
                    value={iData.regionalSettings.timezone}
                    onChange={(e) =>
                      handleChange(
                        "regionalSettings",
                        "timezone",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Locale"
                    value={iData.regionalSettings.locale}
                    onChange={(e) =>
                      handleChange(
                        "regionalSettings",
                        "locale",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <CustomSelect
                    label="Currency"
                    value={iData.regionalSettings.currency}
                    onChange={(val) =>
                      handleChange(
                        "regionalSettings",
                        "currency",
                        val?.target?.value || val,
                        null,
                      )
                    }
                    options={[
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                      { value: "USD", label: "USD ($)" },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <CustomSelect
                    label="Date Format"
                    value={iData.regionalSettings.dateFormat}
                    onChange={(val) =>
                      handleChange(
                        "regionalSettings",
                        "dateFormat",
                        val?.target?.value || val,
                        null,
                      )
                    }
                    options={[
                      { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                      { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                      { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                    ]}
                  />
                </Col>
              </Row>

              <div className="section-header">Settings & Subscription</div>
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
                  <label className="switch-label">
                    Allow Self Registration{" "}
                    <Switch
                      checked={iData.settings.allowSelfRegistration}
                      onChange={(val) =>
                        handleChange(
                          "settings",
                          "allowSelfRegistration",
                          val,
                          null,
                        )
                      }
                    />
                  </label>
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
                <Col span={18} className="switch-inline-group">
                  <label className="switch-label">
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
                  <label className="switch-label">
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
                  <label className="switch-label">
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
                  <label className="switch-label">
                    Special Chars{" "}
                    <Switch
                      checked={
                        iData.settings.passwordPolicy.requireSpecialChars
                      }
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
                      { value: "BASIC", label: "Basic" },
                      { value: "PREMIUM", label: "Premium" },
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
                  <label className="switch-label">
                    Auto Renew{" "}
                    <Switch
                      checked={iData.subscription.autoRenew}
                      onChange={(val) =>
                        handleChange("subscription", "autoRenew", val)
                      }
                    />
                  </label>
                </Col>
              </Row>

              <div className="section-header">Authentication Connections</div>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  setIData((prev) => ({
                    ...prev,
                    authenticationConnections: [
                      ...(prev.authenticationConnections || []),
                      {
                        connectionType: "",
                        issuerUrl: "",
                        directoryId: "",
                        audience: "",
                        isActive: true,
                      },
                    ],
                  }))
                }
                className="tenant-add-connection-btn"
              >
                Add Connection
              </Button>

              {(iData.authenticationConnections?.length
                ? iData.authenticationConnections
                : [{}]
              ).map((conn, idx) => {
                const connection = {
                  connectionType: "",
                  issuerUrl: "",
                  directoryId: "",
                  audience: "",
                  isActive: true,
                  ...conn,
                };

                return (
                  <div key={idx} className="auth-connection-card">
                    <div className="d-flex justify-content-end align-items-center mb-2 auth-connection-actions">
                      {iData.authenticationConnections?.length > 0 && (
                        <Button
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() =>
                            setIData((prev) => ({
                              ...prev,
                              authenticationConnections:
                                prev.authenticationConnections.filter(
                                  (_, i) => i !== idx,
                                ),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      )}

                      <Switch
                        checked={connection.isActive}
                        onChange={(val) => {
                          const newCons = [
                            ...(iData.authenticationConnections || []),
                          ];
                          newCons[idx] = { ...connection, isActive: val };
                          setIData((prev) => ({
                            ...prev,
                            authenticationConnections: newCons,
                          }));
                        }}
                      />
                    </div>

                    <Row gutter={[16, 8]}>
                      <Col span={12}>
                        <CustomSelect
                          label="Connection Type"
                          value={connection.connectionType}
                          onChange={(value) => {
                            const newCons = [
                              ...(iData.authenticationConnections || []),
                            ];
                            newCons[idx] = {
                              ...connection,
                              connectionType: value?.target.value,
                            };
                            setIData((prev) => ({
                              ...prev,
                              authenticationConnections: newCons,
                            }));
                          }}
                          options={[
                            {
                              label: "Entra ID (Azure AD)",
                              value: "Entra ID (Azure AD)",
                            },
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
                            const newCons = [
                              ...(iData.authenticationConnections || []),
                            ];
                            newCons[idx] = {
                              ...connection,
                              issuerUrl: e.target.value,
                            };
                            setIData((prev) => ({
                              ...prev,
                              authenticationConnections: newCons,
                            }));
                          }}
                        />
                      </Col>

                      <Col span={12}>
                        <MyInput
                          label="Directory Id"
                          value={connection.directoryId}
                          onChange={(e) => {
                            const newCons = [
                              ...(iData.authenticationConnections || []),
                            ];
                            newCons[idx] = {
                              ...connection,
                              directoryId: e.target.value,
                            };
                            setIData((prev) => ({
                              ...prev,
                              authenticationConnections: newCons,
                            }));
                          }}
                        />
                      </Col>

                      <Col span={12}>
                        <MyInput
                          label="Audience"
                          value={connection.audience}
                          placeholder="{clientId}"
                          onChange={(e) => {
                            const newCons = [
                              ...(iData.authenticationConnections || []),
                            ];
                            newCons[idx] = {
                              ...connection,
                              audience: e.target.value,
                            };
                            setIData((prev) => ({
                              ...prev,
                              authenticationConnections: newCons,
                            }));
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          </TabPane>

          <TabPane tab="Organisation Profile" key="organisation">
            <div className="drawer-tab-content pt-2">
              <div className="section-header">Legal & Registration</div>
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Legal Name"
                    value={iData.organisationProfile.legalName}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "legalName",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Trading Name"
                    value={iData.organisationProfile.tradingName}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "tradingName",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <MyInput
                    label="Registration Number"
                    value={iData.organisationProfile.registrationNumber}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "registrationNumber",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
                <Col span={8}>
                  <MyInput
                    label="VAT Number"
                    value={iData.organisationProfile.vatNumber}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "vatNumber",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
                <Col span={8}>
                  <MyInput
                    label="Charity Number"
                    value={iData.organisationProfile.charityNumber}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "charityNumber",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>

              <div className="section-header">Contact</div>
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Website"
                    value={iData.organisationProfile.website}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "website",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Email"
                    type="email"
                    value={iData.organisationProfile.email}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "email",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Contact Number"
                    type="mobile"
                    value={iData.organisationProfile.contactNumber}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "contactNumber",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>

              <div className="section-header">Bank Details</div>
              <Row gutter={[12, 4]}>
                <Col span={24}>
                  <MyInput
                    label="Account Name"
                    value={iData.organisationProfile.bankName}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "bankName",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <Row
                gutter={[12, 4]}
                className={
                  isBankSectionComplete(
                    iData.organisationProfile.iban,
                    iData.organisationProfile.bic,
                  )
                    ? "tenant-form__bank-row--valid"
                    : undefined
                }
              >
                <Col xs={24} md={12}>
                  <MyInput
                    label="IBAN"
                    type="iban"
                    success={isIbanFieldComplete(iData.organisationProfile.iban)}
                    value={iData.organisationProfile.iban}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "iban",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
                <Col xs={24} md={12}>
                  <MyInput
                    label="BIC"
                    type="bic"
                    success={isBicFieldComplete(iData.organisationProfile.bic)}
                    value={iData.organisationProfile.bic}
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "bic",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <Row gutter={[12, 4]}>
                <Col xs={24} md={12}>
                  <MyInput
                    label="SEPA Originator Identification Number (OIN)"
                    value={
                      iData.organisationProfile
                        .sepaOriginatorIdentificationNumber
                    }
                    onChange={(e) =>
                      handleChange(
                        "organisationProfile",
                        "sepaOriginatorIdentificationNumber",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <div className="tenant-org-bank-address">
                <div className="section-header">Bank Address</div>
                <Row gutter={[12, 4]}>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Building or house"
                      value={
                        iData.organisationProfile.bankAddress?.buildingOrHouse
                      }
                      onChange={(e) =>
                        handleChange(
                          "organisationProfileBankAddress",
                          "buildingOrHouse",
                          e.target.value,
                          null,
                        )
                      }
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Street or road"
                      value={
                        iData.organisationProfile.bankAddress?.streetOrRoad
                      }
                      onChange={(e) =>
                        handleChange(
                          "organisationProfileBankAddress",
                          "streetOrRoad",
                          e.target.value,
                          null,
                        )
                      }
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Area or town"
                      value={iData.organisationProfile.bankAddress?.areaOrTown}
                      onChange={(e) =>
                        handleChange(
                          "organisationProfileBankAddress",
                          "areaOrTown",
                          e.target.value,
                          null,
                        )
                      }
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="County, city or postcode"
                      value={
                        iData.organisationProfile.bankAddress
                          ?.countyCityOrPostCode
                      }
                      onChange={(e) =>
                        handleChange(
                          "organisationProfileBankAddress",
                          "countyCityOrPostCode",
                          e.target.value,
                          null,
                        )
                      }
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Eircode"
                      placeholder="e.g. D01X4X0"
                      value={iData.organisationProfile.bankAddress?.eircode}
                      onChange={(e) =>
                        handleChange(
                          "organisationProfileBankAddress",
                          "eircode",
                          e.target.value,
                          null,
                        )
                      }
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Country"
                      value={iData.organisationProfile.bankAddress?.country}
                      onChange={(e) =>
                        handleChange(
                          "organisationProfileBankAddress",
                          "country",
                          e.target.value,
                          null,
                        )
                      }
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </TabPane>

          <TabPane tab="Branding" key="branding">
            <div className="drawer-tab-content pt-2">
              <div className="section-header">Logos & Assets</div>
              <p className="text-muted tenant-branding-hint mb-3">
                Default membership branding is shown until you upload your own
                assets to Azure Blob Storage.
              </p>
              <Row gutter={16}>
                <Col span={8}>
                  <TenantBrandingAssetUpload
                    label="Logo"
                    assetType="logo"
                    value={iData.branding.logoUrl}
                    tenantId={tenant?._id}
                    onChange={(url) =>
                      handleChange("branding", "logoUrl", url, null)
                    }
                    previewHeight={56}
                  />
                </Col>
                <Col span={8}>
                  <TenantBrandingAssetUpload
                    label="Dark Logo"
                    assetType="logoDark"
                    value={iData.branding.logoDarkUrl}
                    tenantId={tenant?._id}
                    onChange={(url) =>
                      handleChange("branding", "logoDarkUrl", url, null)
                    }
                    previewHeight={56}
                  />
                </Col>
                <Col span={8}>
                  <TenantBrandingAssetUpload
                    label="Favicon"
                    assetType="favicon"
                    value={iData.branding.faviconUrl}
                    tenantId={tenant?._id}
                    onChange={(url) =>
                      handleChange("branding", "faviconUrl", url, null)
                    }
                    previewHeight={40}
                  />
                </Col>
              </Row>

              <div className="section-header">Colours</div>
              <p className="text-muted tenant-branding-hint mb-2">
                Matches Project Shell defaults (Utilites.css). Used for letters
                and exports; the live app sidebar keeps existing CSS.
              </p>
              <Row gutter={16}>
                <Col span={8}>
                  <ColorField
                    label="Primary Colour"
                    value={iData.branding.primaryColor}
                    onChange={(val) =>
                      handleChange("branding", "primaryColor", val, null)
                    }
                  />
                </Col>
                <Col span={8}>
                  <ColorField
                    label="Secondary Colour"
                    value={iData.branding.secondaryColor}
                    onChange={(val) =>
                      handleChange("branding", "secondaryColor", val, null)
                    }
                  />
                </Col>
                <Col span={8}>
                  <ColorField
                    label="Accent Colour"
                    value={iData.branding.accentColor}
                    onChange={(val) =>
                      handleChange("branding", "accentColor", val, null)
                    }
                  />
                </Col>
              </Row>

              <div className="section-header">Portal & Communications</div>
              <Row gutter={16}>
                <Col span={12}>
                  <MyInput
                    label="Portal Title"
                    value={iData.branding.portalTitle}
                    onChange={(e) =>
                      handleChange(
                        "branding",
                        "portalTitle",
                        e.target.value,
                        null,
                      )
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <MyInput
                    label="Email Footer Text"
                    value={iData.branding.emailFooterText}
                    onChange={(e) =>
                      handleChange(
                        "branding",
                        "emailFooterText",
                        e.target.value,
                        null,
                      )
                    }
                    textarea
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <TenantBrandingAssetUpload
                    label="Letter Header"
                    assetType="letterHeader"
                    value={iData.branding.letterHeaderUrl}
                    tenantId={tenant?._id}
                    onChange={(url) =>
                      handleChange("branding", "letterHeaderUrl", url, null)
                    }
                    previewHeight={48}
                  />
                </Col>
                <Col span={12}>
                  <TenantBrandingAssetUpload
                    label="Letter Footer"
                    assetType="letterFooter"
                    value={iData.branding.letterFooterUrl}
                    tenantId={tenant?._id}
                    onChange={(url) =>
                      handleChange("branding", "letterFooterUrl", url, null)
                    }
                    previewHeight={48}
                  />
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane tab="Departments" key="departments" disabled={!tenant?._id}>
            <div className="drawer-tab-content pt-2">
              {tenant?._id ? (
                <TenantDepartmentsPanel tenantId={tenant._id} />
              ) : (
                <p className="text-muted mb-0">
                  Save the tenant first to manage departments.
                </p>
              )}
            </div>
          </TabPane>

          <TabPane tab="Offices" key="offices" disabled={!tenant?._id}>
            <div className="drawer-tab-content pt-2">
              {tenant?._id ? (
                <TenantOfficesPanel tenantId={tenant._id} />
              ) : (
                <p className="text-muted mb-0">
                  Save the tenant first to manage offices.
                </p>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Drawer>
  );
};

export default TenantForm;
