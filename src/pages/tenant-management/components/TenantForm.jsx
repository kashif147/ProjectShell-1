import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Select,
  Card,
  Divider,
  message,
  Switch,
  InputNumber,
  Row,
  Col,
  Tabs,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { addTenant, updateTenant } from "../../../features/TenantSlice";
import "../../../styles/TenantManagement.css";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TenantForm = ({ tenant, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [authenticationConnections, setAuthenticationConnections] = useState(
    []
  );

  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        name: tenant.name,
        code: tenant.code,
        description: tenant.description,
        domain: tenant.domain,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        "address.street": tenant.address?.street,
        "address.city": tenant.address?.city,
        "address.state": tenant.address?.state,
        "address.zipCode": tenant.address?.zipCode,
        "address.country": tenant.address?.country || "IE",
        "settings.maxUsers": tenant.settings?.maxUsers || 100,
        "settings.allowSelfRegistration":
          tenant.settings?.allowSelfRegistration ?? true,
        "settings.sessionTimeout": tenant.settings?.sessionTimeout || 24,
        "settings.passwordPolicy.minLength":
          tenant.settings?.passwordPolicy?.minLength || 8,
        "settings.passwordPolicy.requireUppercase":
          tenant.settings?.passwordPolicy?.requireUppercase ?? true,
        "settings.passwordPolicy.requireLowercase":
          tenant.settings?.passwordPolicy?.requireLowercase ?? true,
        "settings.passwordPolicy.requireNumbers":
          tenant.settings?.passwordPolicy?.requireNumbers ?? true,
        "settings.passwordPolicy.requireSpecialChars":
          tenant.settings?.passwordPolicy?.requireSpecialChars ?? true,
        status: tenant.status || "PENDING",
        "subscription.plan": tenant.subscription?.plan || "FREE",
        "subscription.startDate": tenant.subscription?.startDate,
        "subscription.endDate": tenant.subscription?.endDate,
        "subscription.autoRenew": tenant.subscription?.autoRenew ?? true,
        isActive: tenant.isActive ?? true,
      });
      setAuthenticationConnections(tenant.authenticationConnections || []);
    } else {
      form.resetFields();
      setAuthenticationConnections([]);
    }
  }, [tenant, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const tenantData = {
        name: values.name,
        code: values.code?.toUpperCase(),
        description: values.description,
        domain: values.domain?.toLowerCase(),
        contactEmail: values.contactEmail?.toLowerCase(),
        contactPhone: values.contactPhone,
        address: {
          street: values["address.street"],
          city: values["address.city"],
          state: values["address.state"],
          zipCode: values["address.zipCode"],
          country: values["address.country"] || "IE",
        },
        settings: {
          maxUsers: values["settings.maxUsers"],
          allowSelfRegistration: values["settings.allowSelfRegistration"],
          sessionTimeout: values["settings.sessionTimeout"],
          passwordPolicy: {
            minLength: values["settings.passwordPolicy.minLength"],
            requireUppercase:
              values["settings.passwordPolicy.requireUppercase"],
            requireLowercase:
              values["settings.passwordPolicy.requireLowercase"],
            requireNumbers: values["settings.passwordPolicy.requireNumbers"],
            requireSpecialChars:
              values["settings.passwordPolicy.requireSpecialChars"],
          },
        },
        status: values.status,
        subscription: {
          plan: values["subscription.plan"],
          startDate: values["subscription.startDate"],
          endDate: values["subscription.endDate"],
          autoRenew: values["subscription.autoRenew"],
        },
        isActive: values.isActive,
        authenticationConnections: authenticationConnections,
        createdAt: tenant ? tenant.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: tenant ? tenant.createdBy : null,
        updatedBy: tenant ? tenant.updatedBy : null,
      };

      if (tenant) {
        await dispatch(
          updateTenant({ id: tenant._id, updatedTenant: tenantData })
        );
        message.success("Tenant updated successfully");
      } else {
        await dispatch(addTenant(tenantData));
        message.success("Tenant created successfully");
      }

      onSubmit(tenantData);
    } catch (error) {
      message.error("Failed to save tenant");
      console.error("Error saving tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  const addConnection = () => {
    setAuthenticationConnections([
      ...authenticationConnections,
      {
        connectionType: "Entra ID (Azure AD)",
        issuerUrl: "",
        directoryId: "",
        audience: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const removeConnection = (index) => {
    setAuthenticationConnections(
      authenticationConnections.filter((_, i) => i !== index)
    );
  };

  const updateConnection = (index, field, value) => {
    const updatedConnections = [...authenticationConnections];
    updatedConnections[index] = {
      ...updatedConnections[index],
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setAuthenticationConnections(updatedConnections);
  };

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
            onClick={() => form.submit()}
            loading={loading}
            className="butn primary-btn"
          >
            {tenant ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="tenant-form"
        >
          <div style={{ paddingTop: "16px" }}>
            <Tabs defaultActiveKey="basic" size="small">
              {/* Basic Information & Contact Tab */}
              <TabPane tab="Basic Info & Contact" key="basic">
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Form.Item
                      label="Organization Name"
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter organization name",
                        },
                        {
                          min: 2,
                          message: "Name must be at least 2 characters",
                        },
                      ]}
                    >
                      <Input placeholder="Enter organization name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Tenant Code"
                      name="code"
                      rules={[
                        { required: true, message: "Please enter tenant code" },
                        {
                          min: 2,
                          message: "Code must be at least 2 characters",
                        },
                        {
                          pattern: /^[A-Z0-9]+$/,
                          message:
                            "Code must contain only uppercase letters and numbers",
                        },
                      ]}
                    >
                      <Input placeholder="TENANT_CODE" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: "Please enter description" },
                    {
                      min: 10,
                      message: "Description must be at least 10 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Enter organization description"
                  />
                </Form.Item>

                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Form.Item
                      label="Domain"
                      name="domain"
                      rules={[
                        { required: true, message: "Please enter domain" },
                        {
                          type: "email",
                          message: "Please enter a valid domain",
                        },
                      ]}
                    >
                      <Input placeholder="example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Status"
                      name="status"
                      rules={[
                        { required: true, message: "Please select status" },
                      ]}
                    >
                      <Select placeholder="Select status">
                        <Option value="ACTIVE">Active</Option>
                        <Option value="INACTIVE">Inactive</Option>
                        <Option value="SUSPENDED">Suspended</Option>
                        <Option value="PENDING">Pending</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Active"
                      name="isActive"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }}>
                  Contact Information
                </Divider>

                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Form.Item
                      label="Contact Email"
                      name="contactEmail"
                      rules={[
                        {
                          required: true,
                          message: "Please enter contact email",
                        },
                        {
                          type: "email",
                          message: "Please enter a valid email",
                        },
                      ]}
                    >
                      <Input placeholder="contact@example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Contact Phone" name="contactPhone">
                      <Input placeholder="+1 (555) 123-4567" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }}>
                  Address Information
                </Divider>

                <Form.Item label="Street Address" name="address.street">
                  <Input placeholder="123 Main Street" />
                </Form.Item>

                <Row gutter={[16, 8]}>
                  <Col span={6}>
                    <Form.Item label="Area or Town" name="address.city">
                      <Input placeholder="Dublin" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="City, County or Postcode"
                      name="address.state"
                    >
                      <Input placeholder="Dublin" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Eircode" name="address.zipCode">
                      <Input placeholder="D02 XY00" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Country" name="address.country">
                      <Select placeholder="Select country">
                        <Option value="IE">Ireland</Option>
                        <Option value="US">United States</Option>
                        <Option value="CA">Canada</Option>
                        <Option value="UK">United Kingdom</Option>
                        <Option value="AU">Australia</Option>
                        <Option value="DE">Germany</Option>
                        <Option value="FR">France</Option>
                        <Option value="JP">Japan</Option>
                        <Option value="IN">India</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* Settings & Subscription Tab */}
              <TabPane tab="Settings & Subscription" key="settings">
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Form.Item
                      label="Max Users"
                      name="settings.maxUsers"
                      rules={[
                        { required: true, message: "Please enter max users" },
                        {
                          type: "number",
                          min: 1,
                          message: "Must be at least 1",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={10000}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Session Timeout (hours)"
                      name="settings.sessionTimeout"
                      rules={[
                        {
                          required: true,
                          message: "Please enter session timeout",
                        },
                        {
                          type: "number",
                          min: 1,
                          max: 168,
                          message: "Must be between 1 and 168 hours",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={168}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Allow Self Registration"
                      name="settings.allowSelfRegistration"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }}>Password Policy</Divider>

                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Form.Item
                      label="Minimum Length"
                      name="settings.passwordPolicy.minLength"
                      rules={[
                        {
                          required: true,
                          message: "Please enter minimum length",
                        },
                        {
                          type: "number",
                          min: 6,
                          max: 32,
                          message: "Must be between 6 and 32",
                        },
                      ]}
                    >
                      <InputNumber min={6} max={32} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 8]}>
                  <Col span={6}>
                    <Form.Item
                      label="Require Uppercase"
                      name="settings.passwordPolicy.requireUppercase"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Require Lowercase"
                      name="settings.passwordPolicy.requireLowercase"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Require Numbers"
                      name="settings.passwordPolicy.requireNumbers"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Require Special Chars"
                      name="settings.passwordPolicy.requireSpecialChars"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }}>Subscription</Divider>

                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Form.Item
                      label="Plan"
                      name="subscription.plan"
                      rules={[
                        { required: true, message: "Please select plan" },
                      ]}
                    >
                      <Select placeholder="Select plan">
                        <Option value="FREE">Free</Option>
                        <Option value="BASIC">Basic</Option>
                        <Option value="PREMIUM">Premium</Option>
                        <Option value="ENTERPRISE">Enterprise</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Start Date" name="subscription.startDate">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="End Date" name="subscription.endDate">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Form.Item
                      label="Auto Renew"
                      name="subscription.autoRenew"
                      valuePropName="checked"
                      style={{ marginTop: 30 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* Authentication Connections Tab */}
              <TabPane tab="Auth Connections" key="auth">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Authentication Connections</h6>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addConnection}
                    size="small"
                  >
                    Add Connection
                  </Button>
                </div>

                {authenticationConnections.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <p>No authentication connections configured</p>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addConnection}
                    >
                      Add First Connection
                    </Button>
                  </div>
                ) : (
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {authenticationConnections.map((connection, index) => (
                      <Card
                        key={index}
                        size="small"
                        className="mb-2"
                        extra={
                          <Space>
                            <Switch
                              size="small"
                              checked={connection.isActive}
                              onChange={(checked) =>
                                updateConnection(index, "isActive", checked)
                              }
                            />
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => removeConnection(index)}
                              size="small"
                            />
                          </Space>
                        }
                      >
                        <Row gutter={[12, 8]}>
                          <Col span={12}>
                            <Form.Item
                              label="Connection Type"
                              style={{ marginBottom: 8 }}
                            >
                              <Select
                                value={connection.connectionType}
                                onChange={(value) =>
                                  updateConnection(
                                    index,
                                    "connectionType",
                                    value
                                  )
                                }
                                size="small"
                              >
                                <Option value="Entra ID (Azure AD)">
                                  Entra ID (Azure AD)
                                </Option>
                                <Option value="Azure B2C">Azure B2C</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Issuer URL"
                              style={{ marginBottom: 8 }}
                            >
                              <Input
                                value={connection.issuerUrl}
                                onChange={(e) =>
                                  updateConnection(
                                    index,
                                    "issuerUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="https://login.microsoftonline.com/{tid}/v2.0"
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[12, 8]}>
                          <Col span={12}>
                            <Form.Item
                              label="Directory ID"
                              style={{ marginBottom: 8 }}
                            >
                              <Input
                                value={connection.directoryId}
                                onChange={(e) =>
                                  updateConnection(
                                    index,
                                    "directoryId",
                                    e.target.value
                                  )
                                }
                                placeholder="{tid}"
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Audience"
                              style={{ marginBottom: 8 }}
                            >
                              <Input
                                value={connection.audience}
                                onChange={(e) =>
                                  updateConnection(
                                    index,
                                    "audience",
                                    e.target.value
                                  )
                                }
                                placeholder="{clientId}"
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                )}
              </TabPane>
            </Tabs>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default TenantForm;
