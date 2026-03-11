import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Checkbox,
  Button,
  Space,
  message,
  Card,
  Row,
  Col,
  Input,
  Tag,
  Divider,
  Badge,
  Collapse,
  Tooltip,
  Drawer,
} from "antd";
import { SearchOutlined, QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { getUnifiedPaginationConfig } from "../../../component/common/UnifiedPagination";
import { useDispatch, useSelector } from "react-redux";
import { getAllRoles } from "../../../features/RoleSlice";
import insertDataFtn, { updateFtn } from "../../../utils/Utilities";
import { getAllPermissions, setSearchQuery } from "../../../features/PermissionSlice";
import { useAuthorization } from "../../../context/AuthorizationContext";
import MyAlert from "../../../component/common/MyAlert";
import axios from "axios";


const { Search } = Input;
const { Panel } = Collapse;

const RolePermissions = ({ role, onClose }) => {
  const dispatch = useDispatch();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState([]); // 👈 define it here

  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuthorization();
  const canAssignPermissions = hasPermission("role:permission_assign");

  const { permissions, permissionsLoading, searchQuery } = useSelector(
    (state) => state.permissions
  );



  // Fetch all permissions
  useEffect(() => {
    dispatch(getAllPermissions());
  }, [dispatch]);

  // Clear search query on unmount
  useEffect(() => {
    return () => {
      dispatch(setSearchQuery(""));
    };
  }, [dispatch]);

  // Normalize permissions (always use _id)
  const allPermissions = useMemo(() => {
    return (Array.isArray(permissions) ? permissions : []).map((p) => ({
      ...p,
      id: p._id,
      name: p.name ?? p.displayName ?? p.key ?? "Unnamed",
      category: p.category ?? "Uncategorized",
      description: p.description ?? "",
      permission: p._id,
      code: p.code, 
      resource: p.resource ?? "",
      action: p.action ?? "",
      level: p.level ?? 1,
    }));
  }, [permissions]);

  const [isInitialized, setIsInitialized] = useState(false);

  // Load role’s current permissions and normalize to IDs
  useEffect(() => {
    if (role && allPermissions.length > 0 && !isInitialized) {
      const perms = role.permissions || [];
      // Normalize to IDs by checking against allPermissions (supports both IDs and Codes in input)
      const normalizedIds = perms
        .map((p) => {
          const id = typeof p === "object" ? p._id || p.id : p;
          const matched = allPermissions.find(
            (ap) => ap.id === id || ap.code === id
          );
          return matched ? matched.id : id;
        })
        .filter(Boolean);

      const uniqueIds = [...new Set(normalizedIds)];

      console.log(
        `Normalizing permissions for ${role.name}: Initial count: ${perms.length}, Unique IDs count: ${uniqueIds.length}`
      );

      setSelectedPermissions(uniqueIds);
      setInitialPermissions(uniqueIds);
      setIsInitialized(true);
    }
  }, [role, allPermissions, isInitialized]);

  // Group by category
  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce((acc, permission) => {
      const category = permission.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(permission);
      return acc;
    }, {});
  }, [allPermissions]);

  // Search filter
  const filteredPermissionsList = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return allPermissions;

    return allPermissions.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const code = (p.code || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const resource = (p.resource || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        desc.includes(q) ||
        resource.includes(q) ||
        category.includes(q)
      );
    });
  }, [allPermissions, searchQuery]);

  // Row selection handler
  const rowSelection = {
    selectedRowKeys: selectedPermissions,
    onChange: (selectedRowKeys) => {
      setSelectedPermissions(selectedRowKeys);
    },
    preserveSelectedRowKeys: true,
  };

  const userdata = JSON.parse(localStorage.getItem("userData"));
  const handleSave = async () => {
    try {
      setLoading(true);

      // Map IDs to Codes
      const idToCodeMap = {};
      allPermissions.forEach((p) => {
        idToCodeMap[p.id] = p.code;
      });

      const selectedCodes = selectedPermissions
        .map((id) => idToCodeMap[id])
        .filter(Boolean);

      // Call the role permissions API via PUT
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/roles/${role._id}/permissions`,
        { permissions: selectedCodes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        message.success("Permissions updated successfully");
        dispatch(getAllRoles()); // Refresh the roles table in the parent component
        onClose();
      } else {
        throw new Error("Failed to update permissions");
      }
    } catch (error) {
      console.error("Error updating role permissions", error);
      // message.error is already handled by insertDataFtn (via MyAlert)
    } finally {
      setLoading(false);
    }
  };

  // Tag Colors & Labels (matching PermissionManagement)
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
    return colors[category?.toUpperCase()] || "default";
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
    return colors[action?.toLowerCase()] || "default";
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
  ];

  return (
    <Drawer
      title={`Manage Permissions 1- ${role?.name ?? "Role"}`}
      width="70%"
      placement="right"
      onClose={onClose}
      open={true}
      className="role-permissions-drawer configuration-main"
      extra={
        <Space>
          <Button onClick={onClose}>Close</Button>
          {canAssignPermissions && (
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              style={{
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                borderRadius: "4px",
              }}
            >
              Save Permissions
            </Button>
          )}
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        {/* Search */}
        <div className="mb-4">
          <Search
            placeholder="Search permissions..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            style={{
              height: "40px",
              borderRadius: "4px",
              border: "1px solid #d9d9d9",
            }}
            allowClear
          />
        </div>

        {/* Selected Count */}
        <div className="mb-4">
          <Card className="selected-permissions-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Selected Permissions</h5>
                <p className="text-muted mb-0">
                  {selectedPermissions.length} of {allPermissions.length}{" "}
                  permissions selected
                </p>
              </div>
              <Badge
                count={selectedPermissions.length}
                showZero
                color="var(--primary-color)"
              >
                <Tag
                  color="var(--primary-color)"
                  className="permission-count-tag"
                >
                  {selectedPermissions.length}
                </Tag>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Permissions Table */}
        <div className="bg-white rounded shadow-sm mt-3">
          <Table
            columns={columns}
            dataSource={filteredPermissionsList || []}
            loading={permissionsLoading}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={getUnifiedPaginationConfig({
              total: filteredPermissionsList.length,
              itemName: "permissions",
            })}
            className="drawer-tbl"
            size="small"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            scroll={{ x: 1000, y: "48vh" }}
            locale={{
              emptyText: "No Permissions Found",
            }}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default RolePermissions;
