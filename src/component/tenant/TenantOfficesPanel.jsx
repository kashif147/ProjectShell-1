import React, { useCallback, useEffect, useState } from "react";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import axios from "axios";
import { baseURL, insertDataFtn, updateFtn } from "../../utils/Utilities";
import MyConfirm from "../common/MyConfirm";
import TenantOfficeDrawer from "./TenantOfficeDrawer";
import {
  OFFICE_TYPES,
  formatOfficeAddress,
  getDayLabel,
} from "../../constants/tenantOfficeDefaults";

const holidayCountLabel = (office) => {
  const n = office?.nonWorkingDays?.length || 0;
  if (!n) return "—";
  return n === 1 ? "1 closure" : `${n} closures`;
};
import { useAuthorization } from "../../context/AuthorizationContext";

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
  const canWrite = hasPermission("tenant:update") || hasPermission("tenant:write");
  const canDelete = hasPermission("tenant:delete");

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const handleAdd = () => {
    setEditingOffice(null);
    setDrawerOpen(true);
  };

  const handleEdit = (office) => {
    setEditingOffice(office);
    setDrawerOpen(true);
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
            setDrawerOpen(false);
            await fetchOffices();
          },
          "Office updated successfully"
        );
      } else {
        await insertDataFtn(
          baseURL,
          officesPath,
          formData,
          "Office created successfully",
          "Failed to create office",
          async () => {
            setDrawerOpen(false);
            await fetchOffices();
          }
        );
      }
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
        await fetchOffices();
      },
    });
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
      width: 140,
      render: (_, record) =>
        canWrite ? (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            {!record.isPrimary && record.isActive && (
              <Tooltip title="Set as primary">
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  onClick={() => handleSetPrimary(record)}
                />
              </Tooltip>
            )}
            {record.isPrimary && (
              <StarFilled style={{ color: "#1677ff", marginLeft: 4 }} />
            )}
            {canDelete && record.isActive && (
              <Button type="link" danger onClick={() => handleDeactivate(record)}>
                Deactivate
              </Button>
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Manage branch and regional offices. Default hours: Mon–Thu 9:00–17:00,
          Fri 8:30–16:30.
        </p>
        {canWrite && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="butn primary-btn"
            onClick={handleAdd}
          >
            Add Office
          </Button>
        )}
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={offices}
        pagination={false}
        size="small"
      />

      <TenantOfficeDrawer
        open={drawerOpen}
        office={editingOffice}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
};

export default TenantOfficesPanel;
