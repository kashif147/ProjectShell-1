import React, { useEffect, useState } from "react";
import { Button, Space, Row, Col, Switch } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import MyInput from "../common/MyInput";

export const emptyContactForm = () => ({
  fullName: "",
  roleTitle: "",
  email: "",
  phone: "",
  mobile: "",
  displayOrder: 0,
  isPrimaryContact: false,
  isActive: true,
});

export const contactToForm = (contact) => ({
  fullName: contact?.fullName || "",
  roleTitle: contact?.roleTitle || "",
  email: contact?.email || "",
  phone: contact?.phone || "",
  mobile: contact?.mobile || "",
  displayOrder: contact?.displayOrder ?? 0,
  isPrimaryContact: contact?.isPrimaryContact === true,
  isActive: contact?.isActive !== false,
});

const TenantDepartmentContactForm = ({
  contact,
  onCancel,
  onSave,
  saving = false,
}) => {
  const [form, setForm] = useState(emptyContactForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(contact ? contactToForm(contact) : emptyContactForm());
    setErrors({});
  }, [contact]);

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
    if (!form.fullName?.trim()) {
      nextErrors.fullName = "Full name is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      fullName: form.fullName.trim(),
      roleTitle: form.roleTitle?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      mobile: form.mobile?.trim() || undefined,
      displayOrder: Number(form.displayOrder) || 0,
    });
  };

  const isEdit = Boolean(contact?._id);

  return (
    <div className="tenant-inline-form tenant-department-contact-inline-form">
      <div className="tenant-inline-form-header">
        <div>
          <div className="section-header mb-0">
            {isEdit ? "Edit contact" : "New contact"}
          </div>
          <p className="text-muted mb-0 tenant-inline-form-subtitle">
            {isEdit
              ? "Update details below. The list stays visible underneath."
              : "Add a contact without opening another drawer."}
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
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            hasError={Boolean(errors.fullName)}
            errorMessage={errors.fullName}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Role / title"
            value={form.roleTitle}
            onChange={(e) => handleChange("roleTitle", e.target.value)}
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
          <MyInput
            label="Mobile"
            value={form.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
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
          <div className="switch-field">
            <label className="my-input-label">Primary contact</label>
            <Switch
              className="tenant-active-switch"
              checked={form.isPrimaryContact}
              onChange={(checked) => handleChange("isPrimaryContact", checked)}
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
            {isEdit ? "Save changes" : "Add contact"}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default TenantDepartmentContactForm;
