import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, Col, Row, Table, Switch, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomSelect from "../common/CustomSelect";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import { baseURL } from "../../utils/Utilities";
import {
  emptyHolidayDraft,
  formatNonWorkingDayRange,
  getHolidayCategoryLabel,
  HOLIDAY_CATEGORIES,
  serializeNonWorkingDaysForApi,
} from "../../constants/tenantOfficeDefaults";

const TenantPublicHolidaysPanel = ({ tenantId, canWrite = true }) => {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(emptyHolidayDraft());
  const [loading, setLoading] = useState(false);

  const path = tenantId
    ? `/tenants/${tenantId}/public-holidays`
    : "/tenant/public-holidays";

  const load = useCallback(async () => {
    if (!baseURL || (!tenantId && !path)) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      message.error("Failed to load public holidays.");
    } finally {
      setLoading(false);
    }
  }, [path, tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveDraft = async () => {
    const payload = serializeNonWorkingDaysForApi([draft])[0];
    if (!payload) {
      message.warning("Enter a holiday name and date.");
      return;
    }
    const token = localStorage.getItem("token");
    await axios.post(`${baseURL}${path}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDraft(emptyHolidayDraft());
    await load();
    message.success("Public holiday added.");
  };

  const toggleActive = async (row, isActive) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${baseURL}${path}/${row._id}`,
      { ...row, isActive },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await load();
  };

  const deactivate = async (row) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${baseURL}${path}/${row._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
    message.success("Public holiday deactivated.");
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "category",
      width: 150,
      render: (value) => getHolidayCategoryLabel(value),
    },
    { title: "Name", dataIndex: "name", ellipsis: true },
    {
      title: "Dates",
      width: 190,
      render: (_, row) => formatNonWorkingDayRange(row.startDate, row.endDate),
    },
    { title: "Notes", dataIndex: "notes", ellipsis: true, render: (v) => v || "—" },
    {
      title: "Active",
      dataIndex: "isActive",
      width: 90,
      render: (value, row) => (
        <Switch
          checked={value !== false}
          disabled={!canWrite}
          onChange={(checked) => toggleActive(row, checked)}
        />
      ),
    },
    ...(canWrite
      ? [
          {
            title: "",
            key: "actions",
            width: 56,
            render: (_, row) => (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deactivate(row)}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="drawer-tab-content tenant-office-schedule-section">
      <div className="section-header">Public holidays</div>
      {canWrite && (
        <Row gutter={[12, 4]} align="bottom">
          <Col xs={24} md={8}>
            <CustomSelect
              label="Type"
              value={draft.category}
              isIDs
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, category: e.target.value }))
              }
              options={HOLIDAY_CATEGORIES.map((o) => ({
                key: o.value,
                label: o.label,
              }))}
            />
          </Col>
          <Col xs={24} md={16}>
            <MyInput
              label="Name"
              value={draft.name}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Col>
          <Col xs={24} md={8}>
            <MyDatePicker1
              label="From"
              value={draft.startDate}
              onChange={(d) => setDraft((prev) => ({ ...prev, startDate: d }))}
            />
          </Col>
          <Col xs={24} md={8}>
            <MyDatePicker1
              label="To"
              value={draft.endDate}
              onChange={(d) => setDraft((prev) => ({ ...prev, endDate: d }))}
            />
          </Col>
          <Col xs={24} md={8}>
            <MyInput
              label="Notes"
              value={draft.notes}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </Col>
          <Col xs={24}>
            <Button icon={<PlusOutlined />} className="butn" onClick={saveDraft}>
              Add public holiday
            </Button>
          </Col>
        </Row>
      )}
      <Table
        className="drawer-tbl office-holidays-table office-holidays-table-spacer"
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="_id"
        pagination={false}
        bordered
        size="small"
      />
    </div>
  );
};

export default TenantPublicHolidaysPanel;
