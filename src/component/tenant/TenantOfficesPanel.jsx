import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { baseURL, insertDataFtn, updateFtn } from "../../utils/Utilities";
import MyConfirm from "../common/MyConfirm";
import MyAlert from "../common/MyAlert";
import TenantOfficeForm from "./TenantOfficeForm";
import TenantOfficeScheduleDrawer from "./TenantOfficeScheduleDrawer";
import {
  OFFICE_TYPES,
  formatOfficeAddress,
  getDayLabel,
} from "../../constants/tenantOfficeDefaults";
import { useAuthorization } from "../../context/AuthorizationContext";

const holidayCountLabel = (office) => {
  const n = office?.nonWorkingDays?.length || 0;
  if (!n) return "—";
  return n === 1 ? "1 closure" : `${n} closures`;
};

const officeTypeLabel = (type) =>
  OFFICE_TYPES.find((o) => o.value === type)?.label || type;

const formatHoursSummary = (openingHours = []) => {
  const openDays = openingHours.filter((d) => !d.isClosed);
  if (!openDays.length) return "Closed all week";
  const first = openDays[0];
  const sameHours = openDays.every(
    (d) => d.openTime === first.openTime && d.closeTime === first.closeTime
  );
  if (sameHours && openDays.length > 1) {
    const days = openDays.map((d) => getDayLabel(d.day).slice(0, 3)).join(", ");
    return `${days}: ${first.openTime}–${first.closeTime}`;
  }
  return `${openDays.length} day(s) configured`;
};

const TenantOfficesPanel = ({
  tenantId,
  useCurrentTenant = false,
  showInactive = false,
}) => {
  const { hasPermission } = useAuthorization();
  const canRead = hasPermission("tenant:read");
  const canWrite =
    hasPermission("tenant:update") || hasPermission("tenant:write");
  const canDelete = hasPermission("tenant:delete");

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [scheduleOffice, setScheduleOffice] = useState(null);
  const formSectionRef = useRef(null);

  const officesPath = useCurrentTenant
    ? "/tenant/offices"
    : `/tenants/${tenantId}/offices`;

  const canLoad = useCurrentTenant || Boolean(tenantId);

  const fetchOffices = useCallback(async () => {
    if (!canLoad) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = showInactive ? { includeInactive: "true" } : {};
      const response = await axios.get(`${baseURL}${officesPath}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setOffices(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load offices:", error);
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }, [canLoad, officesPath, showInactive]);

  useEffect(() => {
    if (canLoad) {
      fetchOffices();
    }
  }, [canLoad, fetchOffices]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingOffice(null);
  }, []);

  const openForm = useCallback((office = null) => {
    setEditingOffice(office);
    setFormOpen(true);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const handleAdd = () => {
    if (formOpen && !editingOffice) {
      closeForm();
      return;
    }
    openForm(null);
  };

  const handleEdit = (office) => {
    openForm(office);
  };

  const openSchedule = (office) => {
    if (!office?._id) return;
    setScheduleOffice(office);
    setScheduleDrawerOpen(true);
  };

  const handleManageSchedule = (office) => {
    openSchedule(office);
  };

  const promptScheduleAfterCreate = (created) => {
    if (!created?._id || !canWrite) return;
    MyConfirm({
      title: "Configure schedule?",
      message: `"${created.name}" was created with default hours. Set opening hours and closures now?`,
      onConfirm: () => openSchedule(created),
    });
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingOffice?._id) {
        await updateFtn(
          baseURL,
          `${officesPath}/${editingOffice._id}`,
          formData,
          async () => {
            closeForm();
            await fetchOffices();
          },
          "Office updated successfully"
        );
      } else {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${baseURL}${officesPath}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200 || response.status === 201) {
          MyAlert("success", "Office created successfully");
          closeForm();
          await fetchOffices();
          promptScheduleAfterCreate(response.data?.data);
        }
      }
    } catch (error) {
      console.error("Failed to save office:", error);
      MyAlert(
        "error",
        error.response?.data?.message || "Failed to create office"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (office) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${baseURL}${officesPath}/${office._id}/primary`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOffices();
    } catch (error) {
      console.error("Failed to set primary office:", error);
    }
  };

  const handleDeactivate = (office) => {
    MyConfirm({
      title: "Deactivate Office",
      message: `Deactivate "${office.name}"? It will no longer appear in active lists.`,
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        await axios.delete(`${baseURL}${officesPath}/${office._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (editingOffice?._id === office._id) {
          closeForm();
        }
        if (scheduleOffice?._id === office._id) {
          setScheduleDrawerOpen(false);
          setScheduleOffice(null);
        }
        await fetchOffices();
      },
    });
  };

  const handleScheduleSaved = async () => {
    await fetchOffices();
    if (scheduleOffice?._id) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${baseURL}${officesPath}/${scheduleOffice._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fresh = response.data?.data;
        if (fresh) setScheduleOffice(fresh);
      } catch {
        /* list refresh is enough */
      }
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <span>{name}</span>
          {record.isPrimary && <Tag color="blue">Primary</Tag>}
          {!record.isActive && <Tag>Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "officeType",
      key: "officeType",
      render: (type) => officeTypeLabel(type),
    },
    {
      title: "Address",
      key: "address",
      render: (_, record) => formatOfficeAddress(record.address),
      ellipsis: true,
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <span>
          {[record.email, record.phone].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      title: "Hours",
      key: "hours",
      render: (_, record) => formatHoursSummary(record.openingHours),
    },
    {
      title: "Closures",
      key: "closures",
      width: 100,
      render: (_, record) => holidayCountLabel(record),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 160,
      render: (_, record) =>
        canRead || canWrite || canDelete ? (
          <Space size="small" className="tenant-table-actions">
            {canRead && record._id && (
              <Tooltip title="Opening hours & closures">
                <Button
                  type="text"
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleManageSchedule(record)}
                  aria-label="Manage office schedule"
                />
              </Tooltip>
            )}
            {canWrite && (
              <Tooltip title="Edit details">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  aria-label="Edit office"
                />
              </Tooltip>
            )}
            {canWrite && !record.isPrimary && record.isActive && (
              <Tooltip title="Set as primary">
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  onClick={() => handleSetPrimary(record)}
                  aria-label="Set as primary office"
                />
              </Tooltip>
            )}
            {canWrite && record.isPrimary && (
              <Tooltip title="Primary office">
                <StarFilled
                  style={{
                    color: "#1677ff",
                    fontSize: 16,
                    verticalAlign: "middle",
                  }}
                  aria-hidden
                />
              </Tooltip>
            )}
            {canDelete && record.isActive && (
              <Tooltip title="Deactivate">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeactivate(record)}
                  aria-label="Deactivate office"
                />
              </Tooltip>
            )}
          </Space>
        ) : null,
    },
  ];

  if (!canLoad) {
    return (
      <p className="text-muted">
        Save the tenant first to manage offices for this organisation.
      </p>
    );
  }

  return (
    <div className="tenant-offices-panel">
      <div className="tenant-offices-content">
        <div className="tenant-offices-toolbar">
          <p className="text-muted mb-0 tenant-offices-hint">
            Manage offices in place. Default hours apply until you open the
            schedule for each office.
          </p>
          {canWrite && (
            <Button
              type={formOpen && !editingOffice ? "default" : "primary"}
              icon={<PlusOutlined />}
              className={
                formOpen && !editingOffice
                  ? "butn secoundry-btn"
                  : "butn primary-btn"
              }
              onClick={handleAdd}
            >
              {formOpen && !editingOffice ? "Cancel" : "Add Office"}
            </Button>
          )}
        </div>

        {formOpen && canWrite && (
          <div ref={formSectionRef} className="tenant-inline-form-wrap">
            <TenantOfficeForm
              office={editingOffice}
              onCancel={closeForm}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}

        <div className="tenant-panel-table-wrap">
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={offices}
            pagination={false}
            size="small"
            className="drawer-tbl"
            scroll={{ x: "max-content" }}
            rowClassName={(_record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            locale={{ emptyText: "No Data" }}
          />
        </div>
      </div>

      <TenantOfficeScheduleDrawer
        open={scheduleDrawerOpen}
        onClose={() => {
          setScheduleDrawerOpen(false);
          setScheduleOffice(null);
        }}
        tenantId={tenantId}
        office={scheduleOffice}
        useCurrentTenant={useCurrentTenant}
        onSaved={handleScheduleSaved}
      />
    </div>
  );
};

export default TenantOfficesPanel;
