import React, { useEffect, useState } from "react";
import { Button, Space, Row, Col, Switch } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import {
  emptyOfficeDetailsForm,
  officeToDetailsForm,
  serializeOfficeDetailsForApi,
  OFFICE_TYPES,
} from "../../constants/tenantOfficeDefaults";

const TenantOfficeForm = ({ office, onCancel, onSave, saving = false }) => {
  const [form, setForm] = useState(emptyOfficeDetailsForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(office ? officeToDetailsForm(office) : emptyOfficeDetailsForm());
    setErrors({});
  }, [office]);

  const handleRootChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddressChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Office name is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(serializeOfficeDetailsForApi(form));
  };

  const isEdit = Boolean(office?._id);

  return (
    <div className="tenant-inline-form tenant-office-inline-form">
      <div className="tenant-inline-form-header">
        <div>
          <div className="section-header mb-0">
            {isEdit ? "Edit office" : "New office"}
          </div>
          <p className="text-muted mb-0 tenant-inline-form-subtitle">
            {isEdit
              ? "Update details and address below. Use the schedule action for hours and closures."
              : "Default hours apply until you configure the schedule (Mon–Thu 9:00–17:00, Fri 8:30–16:30)."}
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
            label="Office name"
            required
            value={form.name}
            onChange={(e) => handleRootChange("name", e.target.value)}
            hasError={Boolean(errors.name)}
            errorMessage={errors.name}
          />
        </Col>
        <Col xs={24} md={12}>
          <CustomSelect
            label="Office type"
            value={form.officeType}
            isIDs
            onChange={(e) => handleRootChange("officeType", e.target.value)}
            options={OFFICE_TYPES.map((o) => ({
              label: o.label,
              key: o.value,
            }))}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleRootChange("email", e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <MyInput
            label="Phone"
            value={form.phone}
            onChange={(e) => handleRootChange("phone", e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <div className="switch-field">
            <label className="my-input-label">Primary office</label>
            <Switch
              className="tenant-active-switch"
              checked={form.isPrimary}
              onChange={(val) => handleRootChange("isPrimary", val)}
            />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="switch-field">
            <label className="my-input-label">Active</label>
            <Switch
              className="tenant-active-switch"
              checked={form.isActive}
              onChange={(val) => handleRootChange("isActive", val)}
            />
          </div>
        </Col>
      </Row>

      <div className="tenant-office-inline-address">
        <div className="section-header">Address</div>
        <Row gutter={[12, 4]}>
          <Col xs={24} md={12}>
            <MyInput
              label="Building or house"
              value={form.address.buildingOrHouse}
              onChange={(e) =>
                handleAddressChange("buildingOrHouse", e.target.value)
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Street or road"
              value={form.address.streetOrRoad}
              onChange={(e) =>
                handleAddressChange("streetOrRoad", e.target.value)
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Area or town"
              value={form.address.areaOrTown}
              onChange={(e) => handleAddressChange("areaOrTown", e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="County, city or postcode"
              value={form.address.countyCityOrPostCode}
              onChange={(e) =>
                handleAddressChange("countyCityOrPostCode", e.target.value)
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Eircode"
              placeholder="e.g. D01X4X0"
              value={form.address.eircode}
              onChange={(e) => handleAddressChange("eircode", e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Country"
              value={form.address.country}
              onChange={(e) => handleAddressChange("country", e.target.value)}
            />
          </Col>
        </Row>
      </div>

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
            {isEdit ? "Save changes" : "Add office"}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default TenantOfficeForm;
