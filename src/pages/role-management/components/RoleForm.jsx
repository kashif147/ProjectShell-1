import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Select, Button, Space, message } from "antd";
import { getTenantsList, ROLE_CATEGORIES } from "../../../constants/Roles";

const { Option } = Select;
const { TextArea } = Input;

const RoleForm = ({ role, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        name: role.name,
        code: role.code,
        description: role.description,
        tenantId: role.tenantId,
        category: role.category,
        status: role.status,
      });
    } else {
      form.resetFields();
    }
  }, [role, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const roleData = {
        name: values.name,
        code: values.code,
        description: values.description,
        tenantId: values.tenantId,
        tenantName: tenants.find((t) => t.id === values.tenantId)?.name || "",
        category: values.category,
        status: values.status,
        permissions: role?.permissions || [],
      };

      await onSubmit(roleData);
      message.success(
        role ? "Role updated successfully" : "Role created successfully"
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

  const tenants = getTenantsList();

  return (
    <Drawer
      title={role ? "Edit Role" : "Add New Role"}
      width="33%"
      placement="right"
      onClose={handleCancel}
      open={true}
      className="role-form-drawer configuration-main"
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
            {role ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <Form form={form} layout="vertical" className="role-form">
          <Form.Item
            label="Role Name"
            name="name"
            rules={[
              { required: true, message: "Please enter role name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          <Form.Item
            label="Role Code"
            name="code"
            rules={[
              { required: true, message: "Please enter role code" },
              { min: 2, message: "Code must be at least 2 characters" },
              { max: 10, message: "Code must not exceed 10 characters" },
              {
                pattern: /^[A-Z0-9_-]+$/,
                message:
                  "Code must contain only uppercase letters, numbers, underscores, and hyphens",
              },
            ]}
          >
            <Input placeholder="Enter role code (e.g., SU, MO, GS)" />
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
              placeholder="Enter role description"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Role Category"
            name="category"
            rules={[
              { required: true, message: "Please select a role category" },
            ]}
          >
            <Select placeholder="Select role category" allowClear>
              {ROLE_CATEGORIES.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tenant"
            name="tenantId"
            rules={[{ required: true, message: "Please select a tenant" }]}
          >
            <Select placeholder="Select tenant" allowClear>
              {tenants.map((tenant) => (
                <Option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a status" }]}
            initialValue="active"
          >
            <Select placeholder="Select status" allowClear>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Form.Item>

          <div className="form-help">
            <h5>Role Guidelines:</h5>
            <ul>
              <li>
                Enter a unique role code (2-10 characters, uppercase letters,
                numbers, underscores, hyphens)
              </li>
              <li>
                Choose a descriptive name that clearly identifies the role's
                purpose
              </li>
              <li>
                Provide a detailed description of what this role is intended for
              </li>
              <li>Select the appropriate tenant for this role</li>
              <li>Set the initial status (Active, Inactive, or Suspended)</li>
              <li>Permissions can be assigned after creating the role</li>
            </ul>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default RoleForm;
