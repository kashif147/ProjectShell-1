import React, { useEffect, useState, useCallback } from "react";
import { Button, Space, Row, Col, Switch, TimePicker, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import {
  emptyOfficeForm,
  emptyHolidayDraft,
  officeToForm,
  OFFICE_TYPES,
  HOLIDAY_CATEGORIES,
  getDayLabel,
  getDefaultDayHours,
  getHolidayCategoryLabel,
  formatNonWorkingDayRange,
  serializeNonWorkingDaysForApi,
} from "../../constants/tenantOfficeDefaults";
import "../../styles/TenantManagement.css";

dayjs.extend(customParseFormat);

const TIME_FORMAT = "HH:mm";

const parseTime = (value) => {
  if (!value) return null;
  const parsed = dayjs(value, TIME_FORMAT);
  return parsed.isValid() ? parsed : null;
};

const formatTime = (value) => (value ? value.format(TIME_FORMAT) : "");

const TenantOfficeDrawer = ({ open, office, onClose, onSave, saving }) => {
  const [form, setForm] = useState(emptyOfficeForm());
  const [errors, setErrors] = useState({});
  const [holidayDraft, setHolidayDraft] = useState(emptyHolidayDraft());
  const [holidayErrors, setHolidayErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(office ? officeToForm(office) : emptyOfficeForm());
      setErrors({});
      setHolidayDraft(emptyHolidayDraft());
      setHolidayErrors({});
    }
  }, [open, office]);

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

  const updateDayHours = useCallback((day, updates) => {
    setForm((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((row) =>
        row.day === day ? { ...row, ...updates } : row
      ),
    }));
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.name?.trim()) {
      nextErrors.name = "Office name is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      nonWorkingDays: serializeNonWorkingDaysForApi(form.nonWorkingDays),
    });
  };

  const handleHolidayDraftChange = (field, value) => {
    setHolidayDraft((prev) => ({ ...prev, [field]: value }));
    if (holidayErrors[field]) {
      setHolidayErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateHolidayDraft = () => {
    const next = {};
    if (!holidayDraft.name?.trim()) next.name = "Name is required";
    if (!holidayDraft.startDate) next.startDate = "Start date is required";
    if (
      holidayDraft.startDate &&
      holidayDraft.endDate &&
      holidayDraft.endDate.isBefore(holidayDraft.startDate, "day")
    ) {
      next.endDate = "End date cannot be before start date";
    }
    setHolidayErrors(next);
    return Object.keys(next).length === 0;
  };

  const addNonWorkingDay = () => {
    if (!validateHolidayDraft()) return;

    const entry = {
      clientId: `temp-${Date.now()}`,
      name: holidayDraft.name.trim(),
      category: holidayDraft.category,
      startDate: holidayDraft.startDate,
      endDate: holidayDraft.endDate || holidayDraft.startDate,
      notes: holidayDraft.notes?.trim() || "",
    };

    setForm((prev) => ({
      ...prev,
      nonWorkingDays: [...prev.nonWorkingDays, entry].sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return a.startDate.valueOf() - b.startDate.valueOf();
      }),
    }));
    setHolidayDraft(emptyHolidayDraft());
    setHolidayErrors({});
  };

  const removeNonWorkingDay = (clientId) => {
    setForm((prev) => ({
      ...prev,
      nonWorkingDays: prev.nonWorkingDays.filter(
        (row) => row.clientId !== clientId && row._id !== clientId
      ),
    }));
  };

  const nonWorkingDayColumns = [
    {
      title: "Type",
      dataIndex: "category",
      width: 130,
      render: (category) => getHolidayCategoryLabel(category),
    },
    {
      title: "Name",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Dates",
      key: "dates",
      width: 200,
      render: (_, record) =>
        formatNonWorkingDayRange(record.startDate, record.endDate),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      ellipsis: true,
      render: (notes) => notes || "—",
    },
    {
      title: "",
      key: "action",
      width: 56,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() =>
            removeNonWorkingDay(record.clientId || record._id)
          }
          aria-label="Remove"
        />
      ),
    },
  ];

  const openingHoursColumns = [
    {
      title: "Day",
      dataIndex: "day",
      width: 130,
      render: (day) => <span className="office-hours-day">{getDayLabel(day)}</span>,
    },
    {
      title: "Open",
      dataIndex: "isClosed",
      width: 90,
      align: "center",
      render: (isClosed, record) => {
        const isWorkingDay = !isClosed;
        return (
          <Switch
            className="tenant-active-switch"
            checked={isWorkingDay}
            onChange={(open) => {
              if (open) {
                const defaults = getDefaultDayHours(record.day);
                updateDayHours(record.day, {
                  isClosed: false,
                  openTime: defaults.openTime,
                  closeTime: defaults.closeTime,
                });
              } else {
                updateDayHours(record.day, {
                  isClosed: true,
                  openTime: "",
                  closeTime: "",
                });
              }
            }}
          />
        );
      },
    },
    {
      title: "Hours",
      key: "hours",
      render: (_, record) => (
        <div className="office-hours-time-inline">
          <TimePicker
            className="office-hours-time-picker"
            size="small"
            format={TIME_FORMAT}
            minuteStep={15}
            placeholder="Open"
            disabled={record.isClosed}
            value={parseTime(record.openTime)}
            onChange={(time) =>
              updateDayHours(record.day, { openTime: formatTime(time) })
            }
          />
          <span className="office-hours-time-sep">–</span>
          <TimePicker
            className="office-hours-time-picker"
            size="small"
            format={TIME_FORMAT}
            minuteStep={15}
            placeholder="Close"
            disabled={record.isClosed}
            value={parseTime(record.closeTime)}
            onChange={(time) =>
              updateDayHours(record.day, { closeTime: formatTime(time) })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <MyDrawer
      title={office ? "Edit Office" : "Add Office"}
      open={open}
      onClose={onClose}
      width={900}
      isPagination={false}
      className="tenant-form-drawer tenant-office-drawer"
      extra={
        <Space>
          <Button onClick={onClose} className="butn secoundry-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            className="butn primary-btn"
            loading={saving}
            onClick={handleSubmit}
          >
            {office ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-tab-content">
        <div className="section-header">Office Details</div>
        <Row gutter={[12, 4]}>
          <Col xs={24} md={12}>
            <MyInput
              label="Office Name"
              name="name"
              value={form.name}
              onChange={(e) => handleRootChange("name", e.target.value)}
              hasError={errors.name}
              required
            />
          </Col>
          <Col xs={24} md={12}>
            <CustomSelect
              label="Office Type"
              name="officeType"
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
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => handleRootChange("email", e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={(e) => handleRootChange("phone", e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div className="switch-field">
              <label className="my-input-label">Primary Office</label>
              <Switch
                className="tenant-active-switch"
                checked={form.isPrimary}
                onChange={(val) => handleRootChange("isPrimary", val)}
              />
            </div>
          </Col>
          <Col xs={24} sm={12}>
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
      </div>

      <div className="drawer-tab-content office-section-gap">
        <div className="section-header">Address</div>
        <Row gutter={[12, 4]}>
          <Col xs={24} md={12}>
            <MyInput
              label="Address Line 1 (Building or House)"
              name="buildingOrHouse"
              value={form.address.buildingOrHouse}
              onChange={(e) =>
                handleAddressChange("buildingOrHouse", e.target.value)
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Address Line 2 (Street or Road)"
              name="streetOrRoad"
              value={form.address.streetOrRoad}
              onChange={(e) =>
                handleAddressChange("streetOrRoad", e.target.value)
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Address Line 3 (Area or Town)"
              name="areaOrTown"
              value={form.address.areaOrTown}
              onChange={(e) => handleAddressChange("areaOrTown", e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Address Line 4 (County, City or Postcode)"
              name="countyCityOrPostCode"
              value={form.address.countyCityOrPostCode}
              onChange={(e) =>
                handleAddressChange("countyCityOrPostCode", e.target.value)
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Eircode"
              name="eircode"
              placeholder="e.g. D01X4X0"
              value={form.address.eircode}
              onChange={(e) => handleAddressChange("eircode", e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <MyInput
              label="Country"
              name="country"
              value={form.address.country}
              onChange={(e) => handleAddressChange("country", e.target.value)}
            />
          </Col>
        </Row>
      </div>

      <div className="drawer-tab-content office-section-gap">
        <div className="section-header">Opening Hours</div>
        <p className="text-muted tenant-office-hours-hint">
          Turn on working days to set hours (Mon–Thu 9:00–17:00, Fri 8:30–16:30
          by default). Non-working days stay off and times are disabled.
        </p>
        <Table
          className="drawer-tbl office-hours-table"
          columns={openingHoursColumns}
          dataSource={form.openingHours}
          rowKey="day"
          pagination={false}
          size="small"
          bordered
          rowClassName={(record) =>
            record.isClosed ? "office-hours-row-closed" : "office-hours-row-open"
          }
        />
      </div>

      <div className="drawer-tab-content office-section-gap">
        <div className="section-header">Public holidays &amp; closures</div>
        <p className="text-muted tenant-office-hours-hint">
          Add extra non-working days (bank holidays, Christmas, Easter, etc.).
          Single days or date ranges are supported.
        </p>
        <Row gutter={[12, 4]} align="bottom">
          <Col xs={24} md={8}>
            <CustomSelect
              label="Type"
              name="holidayCategory"
              value={holidayDraft.category}
              isIDs
              onChange={(e) =>
                handleHolidayDraftChange("category", e.target.value)
              }
              options={HOLIDAY_CATEGORIES.map((o) => ({
                label: o.label,
                key: o.value,
              }))}
            />
          </Col>
          <Col xs={24} md={16}>
            <MyInput
              label="Name"
              name="holidayName"
              placeholder="e.g. St. Patrick's Day, Christmas closure"
              value={holidayDraft.name}
              onChange={(e) => handleHolidayDraftChange("name", e.target.value)}
              hasError={holidayErrors.name}
              required
            />
          </Col>
          <Col xs={24} md={8}>
            <MyDatePicker1
              label="From"
              value={holidayDraft.startDate}
              onChange={(d) => handleHolidayDraftChange("startDate", d)}
              hasError={holidayErrors.startDate}
              required
            />
          </Col>
          <Col xs={24} md={8}>
            <MyDatePicker1
              label="To (optional)"
              value={holidayDraft.endDate}
              onChange={(d) => handleHolidayDraftChange("endDate", d)}
              hasError={holidayErrors.endDate}
              placeholder="Same day if empty"
            />
          </Col>
          <Col xs={24} md={8}>
            <MyInput
              label="Notes"
              name="holidayNotes"
              value={holidayDraft.notes}
              onChange={(e) => handleHolidayDraftChange("notes", e.target.value)}
            />
          </Col>
          <Col xs={24}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              className="butn"
              onClick={addNonWorkingDay}
            >
              Add non-working day
            </Button>
          </Col>
        </Row>

        <Table
          className="drawer-tbl office-holidays-table office-holidays-table-spacer"
          columns={nonWorkingDayColumns}
          dataSource={form.nonWorkingDays}
          rowKey={(row) => row.clientId || row._id}
          pagination={false}
          size="small"
          bordered
          locale={{ emptyText: "No public holidays or closures added yet" }}
        />
      </div>
    </MyDrawer>
  );
};

export default TenantOfficeDrawer;
