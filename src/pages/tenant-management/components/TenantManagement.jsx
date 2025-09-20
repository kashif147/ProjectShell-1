import React, { useState, useEffect } from "react";
import { Input, Table, Space, Button, Tag, Tooltip } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllTenants,
  deleteTenant,
  addTenant,
  updateTenant,
} from "../../../features/TenantSlice";
import { insertDataFtn, deleteFtn, baseURL } from "../../../utils/Utilities";
import MyConfirm from "../../../component/common/MyConfirm";
// import TenantForm from "./TenantForm";
import TenantForm from "../../../component/tenant/TenantForm";
import "../../../styles/TenantManagement.css";

const TenantManagement = ({ onClose }) => {
  const dispatch = useDispatch();
  const { tenants, tenantsLoading, error } = useSelector(
    (state) => state.tenants
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  useEffect(() => {
    dispatch(getAllTenants());
  }, [dispatch]);

  const filteredTenants = tenants?.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setIsFormOpen(true);
  };

  const handleDelete = (tenantId) => {
    MyConfirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this tenant? This action cannot be undone.",
      onConfirm: async () => {
        await dispatch(deleteTenant(tenantId));
      },
    });
  };

  const handleAddNew = () => {
    setEditingTenant(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTenant(null);
  };

  const handleFormSubmit = async (tenantData) => {
    try {
      if (editingTenant) {
        // Update existing tenant
        await dispatch(
          updateTenant({ id: editingTenant._id, updatedTenant: tenantData })
        );
      } else {
        // Add new tenant
        await dispatch(addTenant(tenantData));
      }
      handleFormClose();
    } catch (error) {
      console.error("Error saving tenant:", error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
      sorter: (a, b) => a.domain.localeCompare(b.domain),
      render: (text) => <span className="text-muted">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        const colorMap = {
          ACTIVE: "green",
          INACTIVE: "red",
          SUSPENDED: "orange",
          PENDING: "blue",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Plan",
      dataIndex: ["subscription", "plan"],
      key: "plan",
      sorter: (a, b) =>
        a.subscription?.plan?.localeCompare(b.subscription?.plan),
      render: (plan) => {
        const colorMap = {
          FREE: "default",
          BASIC: "blue",
          PREMIUM: "purple",
          ENTERPRISE: "gold",
        };
        return <Tag color={colorMap[plan] || "default"}>{plan}</Tag>;
      },
    },
    {
      title: "Max Users",
      dataIndex: ["settings", "maxUsers"],
      key: "maxUsers",
      sorter: (a, b) =>
        (a.settings?.maxUsers || 0) - (b.settings?.maxUsers || 0),
      render: (maxUsers) => <span>{maxUsers || 100}</span>,
    },
    {
      title: "Auth Connections",
      dataIndex: "authenticationConnections",
      key: "authenticationConnections",
      render: (connections) => (
        <div>
          {connections?.map((conn, index) => (
            <Tag
              key={index}
              color={
                conn.connectionType === "Entra ID (Azure AD)"
                  ? "green"
                  : "orange"
              }
              className="mb-1"
            >
              {conn.connectionType === "Entra ID (Azure AD)" ? "Entra" : "B2C"}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Contact Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
      render: (email) => <span className="text-muted">{email}</span>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Actions
        </div>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Tenant">
            <FaEdit
              size={16}
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Tenant">
            <AiFillDelete
              size={16}
              style={{ cursor: "pointer", color: "#ff4d4f" }}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="tenant-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Tenant Management</h4>
          <p className="text-muted mb-0">
            Manage organizations and their authentication settings
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          className="butn primary-btn"
        >
          Add Tenant
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search tenants by name, code, domain, or email..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            height: "40px",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredTenants}
          loading={tenantsLoading}
          rowKey="_id"
          pagination={{
            pageSize: 100,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tenants`,
            pageSizeOptions: ["50", "100", "200", "500"],
            defaultPageSize: 100,
            position: ["bottomCenter"],
            size: "default",
          }}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          scroll={{ x: 1400, y: 600 }}
        />
      </div>

      {/* Tenant Form Drawer */}
      {isFormOpen && (
        <TenantForm
          tenant={editingTenant}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          open={isFormOpen}
        />
      )}
    </div>
  );
};

export default TenantManagement;
