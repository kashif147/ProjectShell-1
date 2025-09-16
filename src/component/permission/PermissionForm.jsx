import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Switch,
  InputNumber,
} from "antd";
import { useAuthorization } from "../../context/AuthorizationContext";

const { Option } = Select;
const { TextArea } = Input;

const PermissionForm = ({ permission, onClose, onSubmit }) => {
  const { permissionDefinitions } = useAuthorization();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Backend schema categories
  const PERMISSION_CATEGORIES = [
    { value: "GENERAL", label: "General" },
    { value: "USER", label: "User" },
    { value: "ROLE", label: "Role" },
    { value: "TENANT", label: "Tenant" },
    { value: "ACCOUNT", label: "Account" },
    { value: "PORTAL", label: "Portal" },
    { value: "CRM", label: "CRM" },
    { value: "ADMIN", label: "Admin" },
    { value: "API", label: "API" },
    { value: "AUDIT", label: "Audit" },
    { value: "SUBSCRIPTION", label: "Subscription" },
    { value: "PROFILE", label: "Profile" },
    { value: "FINANCIAL", label: "Financial" },
    { value: "INVOICE", label: "Invoice" },
    { value: "RECEIPT", label: "Receipt" },
  ];

  const PERMISSION_ACTIONS = [
    { value: "all", label: "All Actions" },
    ...Array.from(new Set(permissionDefinitions.map((p) => p.action))).map(
      (action) => ({
        value: action,
        label: action.charAt(0).toUpperCase() + action.slice(1),
      })
    ),
  ];

  useEffect(() => {
    if (permission) {
      form.setFieldsValue({
        name: permission.name,
        code: permission.code,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        category: permission.category,
        level: permission.level,
        isSystemPermission: permission.isSystemPermission,
        isActive: permission.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [permission, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const permissionData = {
        name: values.name,
        code: values.code,
        description: values.description,
        resource: values.resource,
        action: values.action,
        category: values.category,
        level: values.level,
        isSystemPermission: values.isSystemPermission || false,
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

      await onSubmit(permissionData);
      message.success(
        permission
          ? "Permission updated successfully"
          : "Permission created successfully"
      );
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please fill in all required fields");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const generateCode = (category, action, resource) => {
    if (category && action && resource) {
      return `${category.toUpperCase()}_${resource.toUpperCase()}_${action.toUpperCase()}`;
    }
    return "";
  };

  const handleCategoryChange = (value) => {
    const currentAction = form.getFieldValue("action");
    const currentResource = form.getFieldValue("resource");
    if (currentAction && currentResource) {
      const generatedCode = generateCode(value, currentAction, currentResource);
      form.setFieldsValue({ code: generatedCode });
    }
  };

  const handleActionChange = (value) => {
    const currentCategory = form.getFieldValue("category");
    const currentResource = form.getFieldValue("resource");
    if (currentCategory && currentResource) {
      const generatedCode = generateCode(
        currentCategory,
        value,
        currentResource
      );
      form.setFieldsValue({ code: generatedCode });
    }
  };

  const handleResourceChange = (value) => {
    const currentCategory = form.getFieldValue("category");
    const currentAction = form.getFieldValue("action");
    if (currentCategory && currentAction) {
      const generatedCode = generateCode(currentCategory, currentAction, value);
      form.setFieldsValue({ code: generatedCode });
    }
  };

  return (
    <Drawer
      title={permission ? "Edit Permission" : "Add New Permission"}
      width="33%"
      placement="right"
      onClose={handleCancel}
      open={true}
      className="permission-form-drawer configuration-main"
      extra={
        <Space>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              borderRadius: "4px",
            }}
          >
            {permission ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <Form form={form} layout="vertical" className="permission-form">
          <Form.Item
            label="Permission Name"
            name="name"
            rules={[
              { required: true, message: "Please enter permission name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter permission name" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter permission code" },
              {
                pattern: /^[A-Z_]+$/,
                message: "Code must be uppercase letters and underscores only",
              },
            ]}
          >
            <Input
              placeholder="e.g., USER_READ"
              disabled={
                form.getFieldValue("category") &&
                form.getFieldValue("action") &&
                form.getFieldValue("resource")
              }
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select category"
              onChange={handleCategoryChange}
              allowClear
            >
              {PERMISSION_CATEGORIES.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Resource"
            name="resource"
            rules={[{ required: true, message: "Please enter resource" }]}
          >
            <Input
              placeholder="e.g., user, account, profile"
              onChange={(e) => handleResourceChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Action"
            name="action"
            rules={[{ required: true, message: "Please enter action" }]}
          >
            <Input
              placeholder="e.g., read, write, create, delete"
              onChange={(e) => handleActionChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[
              { required: true, message: "Please enter permission level" },
              {
                type: "number",
                min: 1,
                max: 100,
                message: "Level must be between 1 and 100",
              },
            ]}
          >
            <InputNumber
              placeholder="1-100"
              min={1}
              max={100}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              label="System Permission"
              name="isSystemPermission"
              valuePropName="checked"
              style={{ flex: 1 }}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Active"
              name="isActive"
              valuePropName="checked"
              style={{ flex: 1 }}
            >
              <Switch />
            </Form.Item>
          </div>

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
              rows={4}
              placeholder="Enter permission description"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <div className="form-help">
            <h5>Permission Schema Guidelines:</h5>
            <ul>
              <li>
                Code Format: <code>CATEGORY_RESOURCE_ACTION</code>
              </li>
              <li>
                Examples: <code>USER_READ</code>, <code>ACCOUNT_WRITE</code>
              </li>
              <li>
                Code is auto-generated from category, resource, and action
              </li>
              <li>Level determines permission hierarchy (1-100)</li>
              <li>System permissions are protected from deletion</li>
            </ul>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default PermissionForm;
