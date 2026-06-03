import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { baseURL, insertDataFtn, updateFtn } from "../../utils/Utilities";
import MyConfirm from "../common/MyConfirm";
import TenantDepartmentForm from "./TenantDepartmentForm";
import TenantDepartmentContactsDrawer from "./TenantDepartmentContactsDrawer";
import { useAuthorization } from "../../context/AuthorizationContext";

const TenantDepartmentsPanel = ({
  tenantId,
  useCurrentTenant = false,
  showInactive = false,
}) => {
  const { hasPermission } = useAuthorization();
  const canRead = hasPermission("tenant:read");
  const canWrite =
    hasPermission("tenant:update") || hasPermission("tenant:write");
  const canDelete = hasPermission("tenant:delete");

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [contactsDrawerOpen, setContactsDrawerOpen] = useState(false);
  const [contactsDepartment, setContactsDepartment] = useState(null);
  const formSectionRef = useRef(null);

  const departmentsPath = useCurrentTenant
    ? "/tenant/departments"
    : `/tenants/${tenantId}/departments`;

  const canLoad = useCurrentTenant || Boolean(tenantId);

  const fetchDepartments = useCallback(async () => {
    if (!canLoad) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = showInactive ? { includeInactive: "true" } : {};
      const response = await axios.get(`${baseURL}${departmentsPath}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [canLoad, departmentsPath, showInactive]);

  useEffect(() => {
    if (canLoad) {
      fetchDepartments();
    }
  }, [canLoad, fetchDepartments]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingDepartment(null);
  }, []);

  const openForm = useCallback((department = null) => {
    setEditingDepartment(department);
    setFormOpen(true);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const handleAdd = () => {
    if (formOpen && !editingDepartment) {
      closeForm();
      return;
    }
    openForm(null);
  };

  const handleEdit = (department) => {
    openForm(department);
  };

  const handleManageContacts = (department) => {
    setContactsDepartment(department);
    setContactsDrawerOpen(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingDepartment?._id) {
        await updateFtn(
          baseURL,
          `${departmentsPath}/${editingDepartment._id}`,
          formData,
          async () => {
            closeForm();
            await fetchDepartments();
          },
          "Department updated successfully"
        );
      } else {
        await insertDataFtn(
          baseURL,
          departmentsPath,
          formData,
          "Department created successfully",
          "Failed to create department",
          async () => {
            closeForm();
            await fetchDepartments();
          }
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (department) => {
    MyConfirm({
      title: "Deactivate Department",
      message: `Deactivate "${department.name}"? It will no longer appear in active lists.`,
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${baseURL}${departmentsPath}/${department._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (editingDepartment?._id === department._id) {
          closeForm();
        }
        await fetchDepartments();
      },
    });
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 72,
      sorter: (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <span>{name}</span>
          {!record.isActive && <Tag>Inactive</Tag>}
          {record.isPublic === false && <Tag color="default">Internal</Tag>}
        </Space>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || "—",
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
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 130,
      render: (_, record) =>
        canRead || canWrite || canDelete ? (
          <Space size="small" className="tenant-table-actions">
            {canRead && (
              <Tooltip title="Manage contacts">
                <Button
                  type="text"
                  icon={<TeamOutlined />}
                  onClick={() => handleManageContacts(record)}
                  aria-label="Manage department contacts"
                />
              </Tooltip>
            )}
            {canWrite && (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  aria-label="Edit department"
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
                  aria-label="Deactivate department"
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
        Save the tenant first to manage departments for this organisation.
      </p>
    );
  }

  return (
    <div className="tenant-departments-panel">
      <div className="tenant-departments-content">
        <div className="tenant-departments-toolbar">
          <p className="text-muted mb-0 tenant-departments-hint">
            Configure departments for this tenant. Add or edit in place — codes
            must be unique.
          </p>
          {canWrite && (
            <Button
              type={formOpen && !editingDepartment ? "default" : "primary"}
              icon={<PlusOutlined />}
              className={
                formOpen && !editingDepartment
                  ? "butn secoundry-btn"
                  : "butn primary-btn"
              }
              onClick={handleAdd}
            >
              {formOpen && !editingDepartment ? "Cancel" : "Add Department"}
            </Button>
          )}
        </div>

        {formOpen && canWrite && (
          <div ref={formSectionRef} className="tenant-inline-form-wrap">
            <TenantDepartmentForm
              department={editingDepartment}
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
            dataSource={departments}
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

      <TenantDepartmentContactsDrawer
        open={contactsDrawerOpen}
        onClose={() => {
          setContactsDrawerOpen(false);
          setContactsDepartment(null);
        }}
        tenantId={tenantId}
        department={contactsDepartment}
        useCurrentTenant={useCurrentTenant}
        showInactive={showInactive}
      />
    </div>
  );
};

export default TenantDepartmentsPanel;
