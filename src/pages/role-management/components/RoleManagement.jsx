import React, { useState, useEffect } from "react";
import {
  Input,
  Table,
  Space,
  Button,
  Tag,
  Tooltip,
  Select,
  Row,
  Col,
  Card,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { getRoleById } from "../../../features/RolesPermission/roleByIdSlice";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllRoles,
  deleteRole,
  addRole,
  updateRole,
  setSearchQuery,
  setSelectedTenant,
  setSelectedStatus,
  setSelectedCategory,
} from "../../../features/RoleSlice";
import {
  // getAllRolesList,
  getTenantsList,
  ROLE_STATUSES,
  ROLE_CATEGORIES,
} from "../../../constants/Roles";
import MyConfirm from "../../../component/common/MyConfirm";
import RoleForm from "../../../component/role/RoleForm";
import RolePermissions from "./RolePermissions";
import "../../../styles/RoleManagement.css";
import { deleteFtn } from "../../../utils/Utilities";

const { Option } = Select;

const RoleManagement = ({ onClose }) => {
  const dispatch = useDispatch();
  const baseURL = process.env.REACT_APP_POLICY_SERVICE_URL;
  const {
    roles,
    rolesLoading,
    error,
    searchQuery,
    selectedTenant,
    selectedStatus,
    selectedCategory,
  } = useSelector((state) => state.roles);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [role, setRole] = useState({});
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Fetch roles from API on component mount
  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);


  // Filter roles based on search query and filters
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.tenantName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTenant =
      selectedTenant === "all" || role.tenantId === selectedTenant;

    const matchesCategory =
      selectedCategory === "all" || role.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" ||
      role.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesTenant && matchesCategory && matchesStatus;
  });

  const handleEdit = (data) => {
    if (!data) return;
    // dispatch(getRoleById(id))
    setIsFormOpen(true);
    setIsEdit(true);
    setRole(data);
  };

  const handleDelete = (roleId) => {
    MyConfirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this role? This action cannot be undone.",
      onConfirm: () => {
        if (!roleId) return;
        deleteFtn(`${baseURL}/api/roles/${roleId}`, () => {
          dispatch(getAllRoles());
        });
      },
    });
  };
  const [isEdit, setIsEdit] = useState(false);
  const handleAddNew = () => {
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  const handleFormSubmit = async (roleData) => {
    try {
      if (editingRole) {
        await dispatch(
          updateRole({
            id: editingRole.id,
            updatedRole: roleData,
          })
        );
      } else {
        await dispatch(addRole(roleData));
      }
      handleFormClose();
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleManagePermissions = (role) => {
    setEditingRole(role);
    setIsPermissionsOpen(true);
  };

  const handlePermissionsClose = () => {
    setIsPermissionsOpen(false);
    setEditingRole(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    dispatch(setSearchQuery(value));
  };

  const handleTenantChange = (value) => {
    dispatch(setSelectedTenant(value));
  };

  const handleCategoryChange = (value) => {
    dispatch(setSelectedCategory(value));
  };

  const handleStatusChange = (value) => {
    dispatch(setSelectedStatus(value));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      inactive: "gray",
      suspended: "red",
    };
    return colors[status] || "default";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { status: "success", text: "Active" },
      inactive: { status: "default", text: "Inactive" },
      suspended: { status: "error", text: "Suspended" },
    };
    return statusConfig[status] || { status: "default", text: status };
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 80,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (text) => (
        <Tag color="orange" className="code-tag">
          {text}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      render: (category) => {
        const categoryConfig = ROLE_CATEGORIES.find(
          (c) => c.value === category
        );
        return (
          <Tag color="purple" className="category-tag">
            {categoryConfig ? categoryConfig.label : category}
          </Tag>
        );
      },
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      sorter: (a, b) => a.level - b.level,
      render: (level) => (
        <Tag color={level >= 50 ? "red" : level >= 25 ? "orange" : "green"}>
          {level}
        </Tag>
      ),
    },
    {
      title: "Tenant",
      dataIndex: "tenantName",
      key: "tenantName",
      sorter: (a, b) => a.tenantName.localeCompare(b.tenantName),
      render: (text) => (
        <Tag color="blue" className="tenant-tag">
          {text}
        </Tag>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => (
        <div>
          <Badge
            count={permissions.length}
            showZero
            color="var(--primary-color)"
          >
            <Tag color="var(--primary-color)" className="permission-count-tag">
              {permissions.length} Permissions
            </Tag>
          </Badge>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        const badgeConfig = getStatusBadge(status);
        return <Badge status={badgeConfig.status} text={badgeConfig.text} />;
      },
    },
    {
      title: "Created",
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
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Role">
            <FaEdit
              size={16}
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Manage Permissions">
            <SettingOutlined
              style={{ cursor: "pointer", color: "#52c41a", fontSize: "16px" }}
              onClick={() => handleManagePermissions(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Role">
            <AiFillDelete
              size={16}
              style={{ cursor: "pointer", color: "#ff4d4f" }}
              onClick={() => handleDelete(record?._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tenants = getTenantsList();

  return (
    <div className="role-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Role Management</h4>
          <p className="text-muted mb-0">
            Manage user roles and their permissions across tenants
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-center">
            <div className="fw-bold text-primary">{filteredRoles.length}</div>
            <div className="text-muted small">Total Roles</div>
          </div>
          <div className="text-center">
            <div className="fw-bold text-success">
              {filteredRoles.filter((r) => r.status === "active").length}
            </div>
            <div className="text-muted small">Active</div>
          </div>
          <div className="text-center">
            <div className="fw-bold text-info">
              {new Set(filteredRoles.map((r) => r.category)).size}
            </div>
            <div className="text-muted small">Categories</div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            style={{
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              borderRadius: "4px",
            }}
          >
            Add Role
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className="filter-item">
              <label className="filter-label">Search</label>
              <Input
                placeholder="Search roles by name, code, description..."
                prefix={<SearchOutlined />}
                value={localSearchQuery}
                onChange={handleSearchChange}
                style={{
                  height: "40px",
                  borderRadius: "4px",
                  border: "1px solid #d9d9d9",
                }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="filter-item">
              <label className="filter-label">Tenant</label>
              <Select
                value={selectedTenant}
                onChange={handleTenantChange}
                className="w-100"
                placeholder="Select tenant"
              >
                <Option value="all">All Tenants</Option>
                {tenants.map((tenant) => (
                  <Option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">Category</label>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-100"
                placeholder="Select category"
              >
                <Option value="all">All Categories</Option>
                {ROLE_CATEGORIES.map((category) => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">Status</label>
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-100"
                placeholder="Select status"
              >
                {ROLE_STATUSES.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <div className="bg-white rounded shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredRoles}
          loading={rolesLoading}
          rowKey="id"
          pagination={{
            pageSize: 100,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} roles`,
            pageSizeOptions: ["50", "100", "200", "500"],
            defaultPageSize: 100,
            position: ["bottomCenter"],
            size: "default",
          }}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          scroll={{ x: 1000, y: 600 }}
        />
      </div>

      {/* Role Form Drawer */}
      {isFormOpen && (
        <RoleForm
          isEdit={isEdit}
          onClose={handleFormClose}
          role={role}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Role Permissions Drawer */}
      {isPermissionsOpen && (
        <RolePermissions role={editingRole} onClose={handlePermissionsClose} />
      )}
    </div>
  );
};

export default RoleManagement;
