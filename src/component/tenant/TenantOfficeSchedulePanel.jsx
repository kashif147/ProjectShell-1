import React, { useEffect, useState, useCallback } from "react";
import { Button, Space, Row, Col, Switch, TimePicker, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import { updateFtn } from "../../utils/Utilities";
import { baseURL } from "../../utils/Utilities";
import {
  emptyHolidayDraft,
  officeToForm,
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

const TenantOfficeSchedulePanel = ({
  office,
  officesPath,
  canWrite,
  onSaved,
}) => {
  const [form, setForm] = useState(() => officeToForm(office));
  const [holidayDraft, setHolidayDraft] = useState(emptyHolidayDraft());
  const [holidayErrors, setHolidayErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (office) {
      setForm(officeToForm(office));
      setHolidayDraft(emptyHolidayDraft());
      setHolidayErrors({});
    }
  }, [office]);

  const updateDayHours = useCallback((day, updates) => {
    setForm((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((row) =>
        row.day === day ? { ...row, ...updates } : row
      ),
    }));
  }, []);

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
    if (!canWrite || !validateHolidayDraft()) return;

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
    if (!canWrite) return;
    setForm((prev) => ({
      ...prev,
      nonWorkingDays: prev.nonWorkingDays.filter(
        (row) => row.clientId !== clientId && row._id !== clientId
      ),
    }));
  };

  const handleSaveSchedule = async () => {
    if (!canWrite || !office?._id) return;
    setSaving(true);
    try {
      await updateFtn(
        baseURL,
        `${officesPath}/${office._id}`,
        {
          openingHours: form.openingHours,
          nonWorkingDays: serializeNonWorkingDaysForApi(form.nonWorkingDays),
        },
        async () => {
          if (onSaved) await onSaved();
        },
        "Schedule updated successfully"
      );
    } finally {
      setSaving(false);
    }
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
    ...(canWrite
      ? [
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
        ]
      : []),
  ];

  const openingHoursColumns = [
    {
      title: "Day",
      dataIndex: "day",
      width: 130,
      render: (day) => (
        <span className="office-hours-day">{getDayLabel(day)}</span>
      ),
    },
    {
      title: "Open",
      dataIndex: "isClosed",
      width: 90,
      align: "center",
      render: (isClosed, record) => (
        <Switch
          className="tenant-active-switch"
          checked={!isClosed}
          disabled={!canWrite}
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
      ),
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
            disabled={record.isClosed || !canWrite}
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
            disabled={record.isClosed || !canWrite}
            value={parseTime(record.closeTime)}
            onChange={(time) =>
              updateDayHours(record.day, { closeTime: formatTime(time) })
            }
          />
        </div>
      ),
    },
  ];

  if (!office?._id) {
    return (
      <p className="text-muted">
        Save the office first, then configure opening hours and closures.
      </p>
    );
  }

  return (
    <div className="tenant-office-schedule-panel">
      <div className="drawer-tab-content tenant-office-schedule-section">
        <div className="section-header">Opening hours</div>
        <p className="text-muted tenant-office-hours-hint">
          Turn on working days to set hours. Non-working days stay off and times
          are disabled.
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

      <div className="drawer-tab-content tenant-office-schedule-section">
        <div className="section-header">Public holidays &amp; closures</div>
        <p className="text-muted tenant-office-hours-hint">
          Add bank holidays, Christmas, Easter, or other closures. Single days or
          date ranges are supported.
        </p>
        {canWrite && (
          <>
            <Row gutter={[12, 4]} align="bottom">
              <Col xs={24} md={8}>
                <CustomSelect
                  label="Type"
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
                  placeholder="e.g. St. Patrick's Day"
                  value={holidayDraft.name}
                  onChange={(e) =>
                    handleHolidayDraftChange("name", e.target.value)
                  }
                  hasError={Boolean(holidayErrors.name)}
                  errorMessage={holidayErrors.name}
                />
              </Col>
              <Col xs={24} md={8}>
                <MyDatePicker1
                  label="From"
                  value={holidayDraft.startDate}
                  onChange={(d) => handleHolidayDraftChange("startDate", d)}
                  hasError={Boolean(holidayErrors.startDate)}
                  errorMessage={holidayErrors.startDate}
                />
              </Col>
              <Col xs={24} md={8}>
                <MyDatePicker1
                  label="To (optional)"
                  value={holidayDraft.endDate}
                  onChange={(d) => handleHolidayDraftChange("endDate", d)}
                  hasError={Boolean(holidayErrors.endDate)}
                  errorMessage={holidayErrors.endDate}
                  placeholder="Same day if empty"
                />
              </Col>
              <Col xs={24} md={8}>
                <MyInput
                  label="Notes"
                  value={holidayDraft.notes}
                  onChange={(e) =>
                    handleHolidayDraftChange("notes", e.target.value)
                  }
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
          </>
        )}

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

      {canWrite && (
        <div className="tenant-office-schedule-actions">
          <Button
            type="primary"
            className="butn primary-btn"
            loading={saving}
            onClick={handleSaveSchedule}
          >
            Save schedule
          </Button>
        </div>
      )}
    </div>
  );
};

export default TenantOfficeSchedulePanel;
