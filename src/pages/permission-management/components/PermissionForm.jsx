import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
} from "antd";
import { useAuthorization } from "../../../context/AuthorizationContext";
import "../../../styles/PermissionManagement.css";

const { Option } = Select;
const { TextArea } = Input;

const PermissionForm = ({ permission, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { permissionDefinitions } = useAuthorization();

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
    "read",
    "write",
    "create",
    "update",
    "delete",
    "access",
    "manage",
    "assign",
    "remove",
    "cancel",
    "renew",
    "upload",
    "download",
    "payment",
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
        isActive: permission.isActive !== undefined ? permission.isActive : true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        level: 0,
      });
    }
  }, [permission, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const cleanedValues = {
        ...values,
        name: values.name?.trim(),
        code: values.code?.trim().toUpperCase(),
        description: values.description?.trim(),
        resource: values.resource?.trim(),
        action: values.action?.toLowerCase(), // 确保 action 是小写
        category: values.category?.toUpperCase(), // 确保 category 是大写
        level: Number(values.level) || 0,
        isActive: Boolean(values.isActive)
      };

      await onSubmit(cleanedValues);
      message.success(
        permission
          ? "Permission updated successfully"
          : "Permission added successfully"
      );
      form.resetFields();
    } catch (error) {
      if (error.errorFields) {
        message.error("Please fill in all required fields");
      } else {
        console.error("Submit error:", error);
        message.error("Failed to save permission");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={permission ? "Edit Permission" : "Add New Permission"}
      width="33%"
      placement="right"
      onClose={handleClose}
      open={true}
      className="permission-form-drawer configuration-main"
      extra={
        <Space>
          <Button onClick={handleClose}>Cancel</Button>
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
        <Form
          form={form}
          layout="vertical"
          className="permission-form"
          initialValues={{
            isActive: true,
            level: 0,
          }}
        >
          <Form.Item
            label="Permission Name"
            name="name"
            rules={[
              { required: true, message: "Please enter permission name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="e.g., View Users" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter permission code" },
              {
                pattern: /^[A-Z_]+$/,
                message: "Code must be uppercase with underscores only",
              },
            ]}
          >
            <Input placeholder="e.g., USER_VIEW" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter description" },
              { min: 5, message: "Description must be at least 5 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter a detailed description of this permission"
            />
          </Form.Item>

          <Form.Item
            label="Resource"
            name="resource"
            rules={[
              { required: true, message: "Please enter resource" },
            ]}
          >
            <Input placeholder="e.g., users, roles, accounts" />
          </Form.Item>

          <Form.Item
            label="Action"
            name="action"
            rules={[
              { required: true, message: "Please select action" },
            ]}
          >
            <Select placeholder="Select action">
              {PERMISSION_ACTIONS.map((action) => (
                <Option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[
              { required: true, message: "Please select category" },
            ]}
          >
            <Select placeholder="Select category">
              {PERMISSION_CATEGORIES.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[
              { required: true, message: "Please enter level" },
              { type: "number", min: 0, max: 100, message: "Level must be between 0 and 100" },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: "100%" }}
              placeholder="0-100"
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="isActive"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          {/* Permission Guidelines */}
          <div className="form-help">
            <h5>Permission Guidelines:</h5>
            <ul>
              <li>
                Enter a unique permission code using uppercase letters and underscores only (e.g., USER_VIEW, ROLE_CREATE)
              </li>
              <li>
                Choose a descriptive name that clearly identifies what the permission allows
              </li>
              <li>
                Set permission level (0-100) to determine access hierarchy:
                <ul>
                  <li>Level 100: System/Admin permissions (Highest authority)</li>
                  <li>Level 80-99: Executive/Management permissions</li>
                  <li>Level 50-79: Department-level permissions</li>
                  <li>Level 30-49: Team-level permissions</li>
                  <li>Level 10-29: Standard user permissions</li>
                  <li>Level 0-9: Basic/Read-only permissions</li>
                </ul>
              </li>
              <li>
                Select the appropriate category that best describes the permission's domain
              </li>
              <li>
                Choose the action type (read, write, create, update, delete, etc.) that defines what can be done
              </li>
              <li>
                Specify the resource (e.g., users, roles, accounts) that this permission applies to
              </li>
              <li>
                Provide a detailed description explaining when and why this permission should be used
              </li>
              <li>
                Set the initial status - Active permissions are immediately available for assignment
              </li>
            </ul>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default PermissionForm;
