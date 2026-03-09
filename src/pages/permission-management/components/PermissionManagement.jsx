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
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getUnifiedPaginationConfig } from "../../../component/common/UnifiedPagination";
import {
  getAllPermissions,
  addPermission,
  updatePermission,
  setSearchQuery,
  setSelectedCategory,
  setSelectedAction,
} from "../../../features/PermissionSlice";
import { useAuthorization } from "../../../context/AuthorizationContext";
import MyConfirm from "../../../component/common/MyConfirm";
import PermissionForm from "./PermissionForm";
import "../../../styles/PermissionManagement.css";
import { deleteFtn } from "../../../utils/Utilities";

const { Option } = Select;

const PermissionManagement = () => {
  const dispatch = useDispatch();

  const { permissionDefinitions } = useAuthorization();

  const {
    permissions,
    permissionsLoading,
    searchQuery,
    selectedCategory,
    selectedAction,
  } = useSelector((state) => state.permissions);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const PERMISSION_CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "GENERAL", label: "General" },
    { value: "USER", label: "User" },
    { value: "ROLE", label: "Role" },
    { value: "TENANT", label: "Tenant" },
    { value: "ACCOUNT", label: "Account" },
    { value: "PORTAL", label: "Portal" },
    { value: "CRM", label: "CRM" },
    { value: "ADMIN", label: "Admin" },
    { value: "API", label: "API" },
    { value: "AUDIT", label: "Audit" },
    { value: "SUBSCRIPTION", label: "Subscription" },
    { value: "PROFILE", label: "Profile" },
    { value: "FINANCIAL", label: "Financial" },
    { value: "INVOICE", label: "Invoice" },
    { value: "RECEIPT", label: "Receipt" },
  ];

  const PERMISSION_ACTIONS = [
    { value: "all", label: "All Actions" },
    ...Array.from(new Set(permissionDefinitions.map((p) => p.action))).map(
      (action) => ({
        value: action,
        label: action.charAt(0).toUpperCase() + action.slice(1),
      })
    ),
  ];

  useEffect(() => {
    dispatch(getAllPermissions());
  }, [dispatch]);

  const filteredPermissions = permissions?.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || permission.category === selectedCategory;

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
        await deleteFtn(
          `${process.env.REACT_APP_POLICY_SERVICE_URL}/permissions/${permissionId}`,
          () => {
            dispatch(getAllPermissions());
          }
        );
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
            id: editingPermission._id,
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
      GENERAL: "blue",
      USER: "green",
      ROLE: "purple",
      TENANT: "orange",
      ACCOUNT: "cyan",
      PORTAL: "magenta",
      CRM: "red",
      ADMIN: "gold",
      API: "lime",
      AUDIT: "volcano",
      SUBSCRIPTION: "geekblue",
      PROFILE: "purple",
      FINANCIAL: "green",
      INVOICE: "blue",
      RECEIPT: "orange",
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
      render: (text) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <code className="permission-string">{text}</code>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => (
        <Tag color={getActionColor(action)}>{action.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      render: (level) => (
        <Tag color={level >= 50 ? "red" : level >= 25 ? "orange" : "green"}>
          {level}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Space>
          {record.isSystemPermission && <Tag color="purple">System</Tag>}
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaRegCircleQuestion style={{ marginRight: 8 }} />
          Actions
        </div>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Permission">
            <FaEdit
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Delete Permission">
            <AiFillDelete
              style={{
                cursor: record.isSystemPermission ? "not-allowed" : "pointer",
                color: record.isSystemPermission ? "#ccc" : "#ff4d4f",
              }}
              onClick={() =>
                !record.isSystemPermission && handleDelete(record._id)
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="permission-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Permission Management</h4>
          <p className="text-muted mb-0">
            Manage system permissions and access controls
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
        >
          Add Permission
        </Button>
      </div>

      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Search permissions..."
              prefix={<SearchOutlined />}
              value={localSearchQuery}
              onChange={handleSearchChange}
            />
          </Col>

          <Col span={8}>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-100"
            >
              {PERMISSION_CATEGORIES.map((c) => (
                <Option key={c.value} value={c.value}>
                  {c.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={8}>
            <Select
              value={selectedAction}
              onChange={handleActionChange}
              className="w-100"
            >
              {PERMISSION_ACTIONS.map((a) => (
                <Option key={a.value} value={a.value}>
                  {a.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredPermissions || []}
        loading={permissionsLoading}
        rowKey="id"
        pagination={getUnifiedPaginationConfig({
          total: filteredPermissions.length,
          itemName: "permissions",
        })}
        size="small"
        scroll={{ x: 1000, y: "48vh" }}
      />

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