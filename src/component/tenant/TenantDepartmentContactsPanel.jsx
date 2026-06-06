import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import axios from "axios";
import { baseURL, insertDataFtn, updateFtn } from "../../utils/Utilities";
import MyConfirm from "../common/MyConfirm";
import TenantDepartmentContactForm from "./TenantDepartmentContactForm";
import { useAuthorization } from "../../context/AuthorizationContext";

const TenantDepartmentContactsPanel = ({
  tenantId,
  departmentId,
  departmentName,
  useCurrentTenant = false,
  showInactive = false,
}) => {
  const { hasPermission } = useAuthorization();
  const canWrite =
    hasPermission("tenant:update") || hasPermission("tenant:write");
  const canDelete = hasPermission("tenant:delete");

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [saving, setSaving] = useState(false);
  const formSectionRef = useRef(null);

  const contactsPath = useCurrentTenant
    ? `/tenant/departments/${departmentId}/contacts`
    : `/tenants/${tenantId}/departments/${departmentId}/contacts`;

  const canLoad =
    Boolean(departmentId) && (useCurrentTenant || Boolean(tenantId));

  const fetchContacts = useCallback(async () => {
    if (!canLoad) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = showInactive ? { includeInactive: "true" } : {};
      const response = await axios.get(`${baseURL}${contactsPath}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setContacts(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load department contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [canLoad, contactsPath, showInactive]);

  useEffect(() => {
    if (canLoad) {
      fetchContacts();
    }
  }, [canLoad, fetchContacts]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingContact(null);
  }, []);

  const openForm = useCallback((contact = null) => {
    setEditingContact(contact);
    setFormOpen(true);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const handleAdd = () => {
    if (formOpen && !editingContact) {
      closeForm();
      return;
    }
    openForm(null);
  };

  const handleEdit = (contact) => {
    openForm(contact);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingContact?._id) {
        await updateFtn(
          baseURL,
          `${contactsPath}/${editingContact._id}`,
          formData,
          async () => {
            closeForm();
            await fetchContacts();
          },
          "Contact updated successfully"
        );
      } else {
        await insertDataFtn(
          baseURL,
          contactsPath,
          formData,
          "Contact created successfully",
          "Failed to create contact",
          async () => {
            closeForm();
            await fetchContacts();
          }
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (contact) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${baseURL}${contactsPath}/${contact._id}/primary`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchContacts();
    } catch (error) {
      console.error("Failed to set primary contact:", error);
    }
  };

  const handleDeactivate = (contact) => {
    MyConfirm({
      title: "Deactivate Contact",
      message: `Deactivate "${contact.fullName}"? They will no longer appear in active lists.`,
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        await axios.delete(`${baseURL}${contactsPath}/${contact._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (editingContact?._id === contact._id) {
          closeForm();
        }
        await fetchContacts();
      },
    });
  };

  const formatPhoneLine = (record) =>
    [record.phone, record.mobile].filter(Boolean).join(" · ") || "—";

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
      dataIndex: "fullName",
      key: "fullName",
      render: (fullName, record) => (
        <Space>
          <span>{fullName}</span>
          {record.isPrimaryContact && <Tag color="blue">Primary</Tag>}
          {!record.isActive && <Tag>Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "roleTitle",
      key: "roleTitle",
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "Phone",
      key: "phone",
      render: (_, record) => formatPhoneLine(record),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 130,
      render: (_, record) =>
        canWrite || canDelete ? (
          <Space size="small" className="tenant-table-actions">
            {canWrite && (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  aria-label="Edit contact"
                />
              </Tooltip>
            )}
            {canWrite && !record.isPrimaryContact && record.isActive && (
              <Tooltip title="Set as primary">
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  onClick={() => handleSetPrimary(record)}
                  aria-label="Set as primary contact"
                />
              </Tooltip>
            )}
            {canWrite && record.isPrimaryContact && (
              <Tooltip title="Primary contact">
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
                  aria-label="Deactivate contact"
                />
              </Tooltip>
            )}
          </Space>
        ) : null,
    },
  ];

  if (!canLoad) {
    return (
      <p className="text-muted">Select a department to manage its contacts.</p>
    );
  }

  return (
    <div className="tenant-department-contacts-panel">
      <div className="drawer-tab-content tenant-department-contacts-content">
        <div className="tenant-department-contacts-toolbar">
          <p className="text-muted mb-0 tenant-department-contacts-hint">
            {departmentName
              ? `People listed under ${departmentName}. Add or edit in place — no extra drawer.`
              : "Department contacts."}
          </p>
          {canWrite && (
            <Button
              type={formOpen && !editingContact ? "default" : "primary"}
              icon={<PlusOutlined />}
              className={
                formOpen && !editingContact
                  ? "butn secoundry-btn"
                  : "butn primary-btn"
              }
              onClick={handleAdd}
            >
              {formOpen && !editingContact ? "Cancel" : "Add Contact"}
            </Button>
          )}
        </div>

        {formOpen && canWrite && (
          <div ref={formSectionRef} className="tenant-inline-form-wrap">
            <TenantDepartmentContactForm
              contact={editingContact}
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
            dataSource={contacts}
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
    </div>
  );
};

export default TenantDepartmentContactsPanel;
