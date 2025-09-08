import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Select, Button, Space, message } from "antd";
import {
  PERMISSION_CATEGORIES,
  PERMISSION_ACTIONS,
} from "../../constants/Permissions";

const { Option } = Select;
const { TextArea } = Input;

const PermissionForm = ({ permission, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission) {
      form.setFieldsValue({
        name: permission.name,
        permission: permission.permission,
        category: permission.category.toLowerCase(),
        action: permission.action.toLowerCase(),
        description: permission.description,
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
        permission: values.permission,
        category:
          values.category.charAt(0).toUpperCase() + values.category.slice(1),
        action: values.action.toLowerCase(),
        description: values.description,
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

  const generatePermissionString = (category, action) => {
    if (category && action) {
      return `${category.toLowerCase()}:${action.toLowerCase()}`;
    }
    return "";
  };

  const handleCategoryChange = (value) => {
    const currentAction = form.getFieldValue("action");
    if (currentAction) {
      const generatedPermission = generatePermissionString(
        value,
        currentAction
      );
      form.setFieldsValue({ permission: generatedPermission });
    }
  };

  const handleActionChange = (value) => {
    const currentCategory = form.getFieldValue("category");
    if (currentCategory) {
      const generatedPermission = generatePermissionString(
        currentCategory,
        value
      );
      form.setFieldsValue({ permission: generatedPermission });
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
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select category"
              onChange={handleCategoryChange}
              allowClear
            >
              {PERMISSION_CATEGORIES.filter((cat) => cat.value !== "all").map(
                (category) => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
                  </Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Action"
            name="action"
            rules={[{ required: true, message: "Please select an action" }]}
          >
            <Select
              placeholder="Select action"
              onChange={handleActionChange}
              allowClear
            >
              {PERMISSION_ACTIONS.filter(
                (action) => action.value !== "all"
              ).map((action) => (
                <Option key={action.value} value={action.value}>
                  {action.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Permission String"
            name="permission"
            rules={[
              { required: true, message: "Please enter permission string" },
              {
                pattern: /^[a-z]+:[a-z_]+$/,
                message: "Permission must follow format: category:action",
              },
            ]}
          >
            <Input
              placeholder="e.g., user:read"
              disabled={
                form.getFieldValue("category") && form.getFieldValue("action")
              }
            />
          </Form.Item>

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
            <h5>Permission Format Guidelines:</h5>
            <ul>
              <li>
                Format: <code>category:action</code>
              </li>
              <li>
                Examples: <code>user:read</code>, <code>account:write</code>
              </li>
              <li>Use lowercase letters and underscores only</li>
              <li>Be descriptive and consistent</li>
            </ul>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default PermissionForm;
