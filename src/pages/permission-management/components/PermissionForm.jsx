import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Switch,
  InputNumber,
} from "antd";
import { useAuthorization } from "../../../context/AuthorizationContext";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import { insertDataFtn } from "../../../utils/Utilities";
import { getAllPermissions } from "../../../features/PermissionSlice";

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
  const [data, setData] = useState({
    isSystemPermission: false,
    tenantId: "39866a06-30bc-4a89-80c6-9dd9357dd453",
  });
  const [errors, setErrors] = useState({});
  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // clear error on change
  };
  const validate = () => {
    let newErrors = {};

    if (!data.name?.trim()) newErrors.name = true;

    if (!data.code?.trim()) newErrors.code = true;

    if (!data.category) newErrors.category = true;
    if (!data.resource?.trim()) newErrors.resource = true;
    if (!data.action?.trim()) newErrors.action = true;
    if (!data.description?.trim()) newErrors.description = true;

    if (!data.level) newErrors.level = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const url = process.env.REACT_APP_POLICY_SERVICE_URL;
  const handleSubmit = () => {
    if (!validate()) return;
    console.log("✅ Valid Permission Data:", data);
    insertDataFtn(
      url,
      "/api/permissions",
      data,
      "Data inserted successfully",
      "Error inserting data",
      () => {
        getAllPermissions();
        onClose();
        setErrors({});
        setData({});
      }
    );
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
          {/* <Button onClick={handleCancel}>Cancel</Button> */}
          <Button
            className="btun primary-btn"
            // type="primary"
            onClick={handleSubmit}
            loading={loading}
            // style={{
            //   backgroundColor: "var(--primary-color)",
            //   borderColor: "var(--primary-color)",
            //   borderRadius: "4px",
            // }}
          >
            {permission ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <MyInput
          label="Permission Name"
          placeholder="Enter permission name"
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          hasError={errors.name}
        />

        <MyInput
          label="Code"
          placeholder="e.g., USER_READ"
          value={data.code}
          onChange={(e) => handleChange("code", e.target.value)}
          required
          hasError={errors.code}
        />

        <CustomSelect
          label="Category"
          placeholder="Select category"
          options={PERMISSION_CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          value={data.category}
          onChange={(val) => handleChange("category", val.target.value)}
          allowClear
          required
          hasError={errors.category}
        />

        <MyInput
          label="Resource"
          placeholder="e.g., user, account, profile"
          value={data.resource}
          onChange={(e) => handleChange("resource", e.target.value)}
          required
          hasError={errors.resource}
        />

        <MyInput
          label="Action"
          placeholder="e.g., read, write, create, delete"
          value={data.action}
          onChange={(e) => handleChange("action", e.target.value)}
          required
          hasError={errors.action}
        />

        <MyInput
          label="Level"
          type="number"
          placeholder="1-100"
          value={data.level}
          min={1}
          max={100}
          onChange={(e) => handleChange("level", e.target.value)}
          required
          hasError={errors.level}
        />
        <Row className="mb-3">
          <Col span={12}>
            <label className="my-input-label mb-2">System Permission</label>
            <Switch
              checked={data?.isSystemPermission}
              onChange={(checked) =>
                handleChange("isSystemPermission", checked)
              }
            />
          </Col>
          <Col span={12}>
            <label className="my-input-label mb-2">Active</label>
            <Switch
            // checked={data.isActive}
            // onChange={(checked) => handleChange("isActive", checked)}
            />
          </Col>
        </Row>
        <MyInput
          label="Description"
          name="           "
          placeholder="Enter permission description"
          type="textarea"
          rows={4}
          maxLength={200}
          required
          value={data?.description}
          onChange={(e) => handleChange("description", e.target.value)}
          showCount
          rules={[
            { required: true, message: "Please enter description" },
            { min: 10, message: "Description must be at least 10 characters" },
          ]}
          hasError={errors.description}
        />

        <div className="form-help">
          <h5>Permission Schema Guidelines:</h5>
          <ul>
            <li>
              Code Format: <code>CATEGORY_RESOURCE_ACTION</code>
            </li>
            <li>
              Examples: <code>USER_READ</code>, <code>ACCOUNT_WRITE</code>
            </li>
            <li>Code is auto-generated from category, resource, and action</li>
            <li>Level determines permission hierarchy (1-100) </li>
            <ul>
              <li>Level 1-10: Basic read permissions (low sensitivity)</li>
              <li>
                Level 30-50: Write/update permissions (medium sensitivity)
              </li>
              <li>
                Level 60-80: Administrative permissions (high sensitivity)
              </li>
              <li>Level 90-100: Critical permissions (maximum sensitivity)</li>
            </ul>
            <li>System permissions are protected from deletion</li>
          </ul>
        </div>
      </div>
    </Drawer>
  );
};

export default PermissionForm;
