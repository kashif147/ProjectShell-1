import React, { useEffect, useState } from "react";
import { Button, Space, Row, Col, Switch } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import MyInput from "../common/MyInput";

export const emptyDepartmentForm = () => ({
  name: "",
  code: "",
  description: "",
  email: "",
  phone: "",
  displayOrder: 0,
  isPublic: true,
  isActive: true,
});

export const departmentToForm = (department) => ({
  name: department?.name || "",
  code: department?.code || "",
  description: department?.description || "",
  email: department?.email || "",
  phone: department?.phone || "",
  displayOrder: department?.displayOrder ?? 0,
  isPublic: department?.isPublic !== false,
  isActive: department?.isActive !== false,
});

const TenantDepartmentForm = ({
  department,
  onCancel,
  onSave,
  saving = false,
}) => {
  const [form, setForm] = useState(emptyDepartmentForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(department ? departmentToForm(department) : emptyDepartmentForm());
    setErrors({});
  }, [department]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Department name is required";
    if (!form.code?.trim()) nextErrors.code = "Department code is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      displayOrder: Number(form.displayOrder) || 0,
    });
  };

  const isEdit = Boolean(department?._id);

  return (
    <div className="tenant-inline-form tenant-department-inline-form">
      <div className="tenant-inline-form-header">
        <div>
          <div className="section-header mb-0">
            {isEdit ? "Edit department" : "New department"}
          </div>
          <p className="text-muted mb-0 tenant-inline-form-subtitle">
            {isEdit
              ? "Update details below. The list stays visible underneath."
              : "Add a department without opening another drawer."}
          </p>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onCancel}
          aria-label="Close form"
        />
      </div>

      <Row gutter={[12, 4]} className="tenant-inline-form-fields">
        <Col xs={24} md={12}>
          <MyInput
            label="Name"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            hasError={Boolean(errors.name)}
            errorMessage={errors.name}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Code"
            required
            value={form.code}
            onChange={(e) =>
              handleChange("code", e.target.value.toUpperCase())
            }
            hasError={Boolean(errors.code)}
            errorMessage={errors.code}
            placeholder="e.g. MEMBERSHIP"
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Display order"
            type="number"
            value={form.displayOrder}
            onChange={(e) => handleChange("displayOrder", e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <div className="switch-field">
            <label className="my-input-label">Public contact list</label>
            <Switch
              className="tenant-active-switch"
              checked={form.isPublic}
              onChange={(checked) => handleChange("isPublic", checked)}
            />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="switch-field">
            <label className="my-input-label">Active</label>
            <Switch
              className="tenant-active-switch"
              checked={form.isActive}
              onChange={(checked) => handleChange("isActive", checked)}
            />
          </div>
        </Col>
      </Row>

      <div className="tenant-inline-form-actions">
        <Space>
          <Button onClick={onCancel} className="butn secoundry-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            className="butn primary-btn"
            loading={saving}
            onClick={handleSubmit}
          >
            {isEdit ? "Save changes" : "Add department"}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default TenantDepartmentForm;
