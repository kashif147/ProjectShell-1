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
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPermissions,
  deletePermission,
  addPermission,
  updatePermission,
  setSearchQuery,
  setSelectedCategory,
  setSelectedAction,
} from "../../features/PermissionSlice";
import {
  getAllPermissionsList,
  PERMISSION_CATEGORIES,
  PERMISSION_ACTIONS,
} from "../../constants/Permissions";
import MyConfirm from "../common/MyConfirm";
import PermissionForm from "./PermissionForm";
import "../../styles/PermissionManagement.css";

const { Option } = Select;

const PermissionManagement = ({ onClose }) => {
  const dispatch = useDispatch();
  const {
    permissions,
    permissionsLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedAction,
  } = useSelector((state) => state.permissions);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Initialize with sample data if no permissions exist
  useEffect(() => {
    if (permissions.length === 0) {
      const samplePermissions = getAllPermissionsList();
      // Initialize Redux state with sample data for demo purposes
      dispatch({
        type: "permissions/getAllPermissions/fulfilled",
        payload: samplePermissions,
      });
    }
  }, [dispatch, permissions.length]);

  // Filter permissions based on search query and filters
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.permission.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      permission.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAction =
      selectedAction === "all" ||
      permission.action.toLowerCase() === selectedAction.toLowerCase();

    return matchesSearch && matchesCategory && matchesAction;
  });

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setIsFormOpen(true);
  };

  const handleDelete = (permissionId) => {
    MyConfirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this permission? This action cannot be undone.",
      onConfirm: async () => {
        await dispatch(deletePermission(permissionId));
      },
    });
  };

  const handleAddNew = () => {
    setEditingPermission(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPermission(null);
  };

  const handleFormSubmit = async (permissionData) => {
    try {
      if (editingPermission) {
        await dispatch(
          updatePermission({
            id: editingPermission.id,
            updatedPermission: permissionData,
          })
        );
      } else {
        await dispatch(addPermission(permissionData));
      }
      handleFormClose();
    } catch (error) {
      console.error("Error saving permission:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    dispatch(setSearchQuery(value));
  };

  const handleCategoryChange = (value) => {
    dispatch(setSelectedCategory(value));
  };

  const handleActionChange = (value) => {
    dispatch(setSelectedAction(value));
  };

  const getCategoryColor = (category) => {
    const colors = {
      General: "blue",
      User: "green",
      Role: "purple",
      Account: "orange",
      Portal: "cyan",
      CRM: "magenta",
      Audit: "red",
      Subscription: "gold",
      Profile: "lime",
    };
    return colors[category] || "default";
  };

  const getActionColor = (action) => {
    const colors = {
      read: "blue",
      write: "green",
      create: "purple",
      update: "orange",
      delete: "red",
      access: "cyan",
      manage: "magenta",
      assign: "gold",
      remove: "volcano",
      cancel: "red",
      renew: "green",
      upload: "blue",
      download: "green",
      payment: "gold",
    };
    return colors[action] || "default";
  };

  const columns = [
    {
      title: "Permission Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Permission String",
      dataIndex: "permission",
      key: "permission",
      sorter: (a, b) => a.permission.localeCompare(b.permission),
      render: (text) => <code className="permission-string">{text}</code>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      render: (category) => (
        <Tag color={getCategoryColor(category)} className="category-tag">
          {category}
        </Tag>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      sorter: (a, b) => a.action.localeCompare(b.action),
      render: (action) => (
        <Tag color={getActionColor(action)} className="action-tag">
          {action.toUpperCase()}
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
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Permission">
            <FaEdit
              size={16}
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Permission">
            <AiFillDelete
              size={16}
              style={{ cursor: "pointer", color: "#ff4d4f" }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="permission-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Permission Management</h4>
          <p className="text-muted mb-0">
            Manage system permissions and access controls
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-center">
            <div className="fw-bold text-primary">
              {filteredPermissions.length}
            </div>
            <div className="text-muted small">Total Permissions</div>
          </div>
          <div className="text-center">
            <div className="fw-bold text-success">
              {new Set(filteredPermissions.map((p) => p.category)).size}
            </div>
            <div className="text-muted small">Categories</div>
          </div>
          <div className="text-center">
            <div className="fw-bold text-info">
              {new Set(filteredPermissions.map((p) => p.action)).size}
            </div>
            <div className="text-muted small">Actions</div>
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
            Add Permission
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
                placeholder="Search permissions..."
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
              <label className="filter-label">Category</label>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-100"
                placeholder="Select category"
              >
                {PERMISSION_CATEGORIES.map((category) => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="filter-item">
              <label className="filter-label">Action</label>
              <Select
                value={selectedAction}
                onChange={handleActionChange}
                className="w-100"
                placeholder="Select action"
              >
                {PERMISSION_ACTIONS.map((action) => (
                  <Option key={action.value} value={action.value}>
                    {action.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <div className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-number">{filteredPermissions.length}</div>
                <div className="stat-label">Total Permissions</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-number">
                  {new Set(filteredPermissions.map((p) => p.category)).size}
                </div>
                <div className="stat-label">Categories</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-number">
                  {new Set(filteredPermissions.map((p) => p.action)).size}
                </div>
                <div className="stat-label">Actions</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredPermissions}
          loading={permissionsLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} permissions`,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
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

      {/* Permission Form Drawer */}
      {isFormOpen && (
        <PermissionForm
          permission={editingPermission}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default PermissionManagement;
