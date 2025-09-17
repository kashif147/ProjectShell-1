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
  Switch,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  SettingOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  updateUserStatus,
  setSearchQuery,
  setSelectedTenant,
  setSelectedUserType,
  setSelectedStatus,
  setSelectedRole,
} from "../../../features/UserSlice";
import {
  getAllUsersList,
  getTenantsList,
  USER_TYPES,
  USER_STATUSES,
  getUserStatusBadge,
  formatLastLogin,
} from "../../../constants/Users";
import MyConfirm from "../../../component/common/MyConfirm";
import UserRoleAssignment from "../../../component/user/UserRoleAssignment";
import UserDetails from "./UserDetails";
import "../../../styles/UserManagement.css";

const { Option } = Select;

const UserManagement = ({ onClose }) => {
  const dispatch = useDispatch();
  const {
    users,
    usersLoading,
    error,
    searchQuery,
    selectedTenant,
    selectedUserType,
    selectedStatus,
    selectedRole,
  } = useSelector((state) => state.users);

  const [isRoleAssignmentOpen, setIsRoleAssignmentOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Initialize with sample data if no users exist
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userMemberNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTenant =
      selectedTenant === "all" || user.tenantId === selectedTenant;

    const matchesUserType =
      selectedUserType === "all" || user.userType === selectedUserType;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && user.isActive) ||
      (selectedStatus === "inactive" && !user.isActive);

    const matchesRole =
      selectedRole === "all" ||
      user.roles.some((role) => role._id === selectedRole);

    return (
      matchesSearch &&
      matchesTenant &&
      matchesUserType &&
      matchesStatus &&
      matchesRole
    );
  });

  const handleStatusToggle = (user) => {
    const newStatus = !user.isActive;
    MyConfirm({
      title: `Confirm ${newStatus ? "Activation" : "Deactivation"}`,
      message: `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } ${user.userFullName}?`,
      onConfirm: async () => {
        await dispatch(
          updateUserStatus({ userId: user._id, isActive: newStatus })
        );
      },
    });
  };

  const handleAssignRoles = (user) => {
    setSelectedUser(user);
    setIsRoleAssignmentOpen(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleRoleAssignmentClose = () => {
    setIsRoleAssignmentOpen(false);
    setSelectedUser(null);
  };

  const handleUserDetailsClose = () => {
    setIsUserDetailsOpen(false);
    setSelectedUser(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    dispatch(setSearchQuery(value));
  };

  const handleTenantChange = (value) => {
    dispatch(setSelectedTenant(value));
  };

  const handleUserTypeChange = (value) => {
    dispatch(setSelectedUserType(value));
  };

  const handleStatusChange = (value) => {
    dispatch(setSelectedStatus(value));
  };

  const handleRoleChange = (value) => {
    dispatch(setSelectedRole(value));
  };

  const getUserInitials = (user) => {
    return `${user.userFirstName?.[0] || ""}${
      user.userLastName?.[0] || ""
    }`.toUpperCase();
  };

  const getUserTypeColor = (userType) => {
    return userType === "CRM" ? "blue" : "green";
  };

  const getRoleTags = (roles) => {
    if (!roles || roles.length === 0) {
      return <Tag color="default">No Roles</Tag>;
    }

    return roles.slice(0, 2).map((role) => (
      <Tag key={role._id} color="purple" className="role-tag">
        {role.name}
      </Tag>
    ));
  };

  const columns = [
    {
      title: "User12",
      key: "user",
      width: 180,
      render: (_, record) => (
        <div className="user-info">
          <Avatar
            size={40}
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {getUserInitials(record)}
          </Avatar>
          <div className="user-details">
            <div className="user-name">{record.userFullName}</div>
            <div className="user-email">{record.userEmail}</div>
            <div className="user-member-number">{record.userMemberNumber}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "userType",
      key: "userType",
      width: 80,
      render: (userType) => (
        <Tag color={getUserTypeColor(userType)} className="user-type-tag">
          {userType}
        </Tag>
      ),
    },
    {
      title: "Tenant",
      dataIndex: "tenantId",
      key: "tenantId",
      width: 120,
      render: (tenantId) => {
        const tenant = getTenantsList().find((t) => t.id === tenantId);
        return (
          <Tag color="blue" className="tenant-tag">
            {tenant ? tenant.name : tenantId}
          </Tag>
        );
      },
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      width: 150,
      render: (roles) => (
        <div className="roles-container">
          {getRoleTags(roles)}
          {roles && roles.length > 2 && (
            <Tag color="default" className="more-roles-tag">
              +{roles.length - 2} more
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "userLastLogin",
      key: "userLastLogin",
      width: 100,
      render: (lastLogin) => (
        <span className="last-login">{formatLastLogin(lastLogin)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive) => {
        const badgeConfig = getUserStatusBadge(isActive);
        return <Badge status={badgeConfig.status} text={badgeConfig.text} />;
      },
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
          <Tooltip title="View Details">
            <EyeOutlined
              style={{ cursor: "pointer", color: "#1890ff", fontSize: "16px" }}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Assign Roles">
            <SettingOutlined
              style={{ cursor: "pointer", color: "#52c41a", fontSize: "16px" }}
              onClick={() => handleAssignRoles(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            {record.isActive ? (
              <PoweroffOutlined
                style={{
                  cursor: "pointer",
                  color: "#ff4d4f",
                  fontSize: "16px",
                }}
                onClick={() => handleStatusToggle(record)}
              />
            ) : (
              <CheckCircleOutlined
                style={{
                  cursor: "pointer",
                  color: "#52c41a",
                  fontSize: "16px",
                }}
                onClick={() => handleStatusToggle(record)}
              />
            )}
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tenants = getTenantsList();
  const allRoles = [
    { _id: "role1", name: "General Secretary" },
    { _id: "role2", name: "Super User" },
    { _id: "role3", name: "Membership Officer" },
    { _id: "role4", name: "Member" },
    { _id: "role5", name: "Accounts Manager" },
    { _id: "role6", name: "Deputy General Secretary" },
    { _id: "role7", name: "Industrial Relations Officer" },
    { _id: "role8", name: "Read Only" },
    { _id: "role9", name: "Head Library Services" },
    { _id: "role10", name: "Librarian" },
    { _id: "role11", name: "Non-Member" },
  ];

  return (
    <div className="user-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">User Management</h4>
          <p className="text-muted mb-0">
            Manage users, assign roles, and control access across tenants001
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-center">
            <div className="fw-bold text-primary">{filteredUsers.length}</div>
            <div className="text-muted small">Total Users</div>
          </div>
          <div className="text-center">
            <div className="fw-bold text-success">
              {filteredUsers.filter((u) => u.isActive).length}
            </div>
            <div className="text-muted small">Active</div>
          </div>
          <div className="text-center">
            <div className="fw-bold text-info">
              {new Set(filteredUsers.map((u) => u.tenantId)).size}
            </div>
            <div className="text-muted small">Tenants</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">Search</label>
              <Input
                placeholder="Search users..."
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
          <Col xs={24} sm={12} md={6}>
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
              <label className="filter-label">User Type</label>
              <Select
                value={selectedUserType}
                onChange={handleUserTypeChange}
                className="w-100"
                placeholder="Select user type"
              >
                {USER_TYPES.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
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
                {USER_STATUSES.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-3">
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">Role</label>
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-100"
                placeholder="Select role"
              >
                <Option value="all">All Roles</Option>
                {allRoles.map((role) => (
                  <Option key={role._id} value={role._id}>
                    {role.name}
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
          dataSource={filteredUsers}
          loading={usersLoading}
          rowKey="_id"
          pagination={{
            pageSize: 100,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
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

      {/* Role Assignment Drawer */}
      {isRoleAssignmentOpen && (
        <UserRoleAssignment
          user={selectedUser}
          onClose={handleRoleAssignmentClose}
        />
      )}

      {/* User Details Drawer */}
      {isUserDetailsOpen && (
        <UserDetails user={selectedUser} onClose={handleUserDetailsClose} />
      )}
    </div>
  );
};

export default UserManagement;
