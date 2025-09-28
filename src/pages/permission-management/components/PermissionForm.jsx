import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
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
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAuthorization } from "../../../context/AuthorizationContext";
import { useDispatch } from "react-redux";
import { assignPermissionsToRole } from "../../../features/RoleSlice";

const { Search } = Input;

const RolePermissions = ({ role, onClose }) => {
  const dispatch = useDispatch();
  const { permissionDefinitions = [] } = useAuthorization() || {};

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 👉 Always pre-select role’s current permissions
  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions || []);
    }
  }, [role]);

  // Normalize API permissions
  const allPermissions = useMemo(() => {
    return (permissionDefinitions || []).map((p) => ({
      id: p.key ?? p.id,
      name: p.name ?? p.key,
      category: p.category ?? "Uncategorized",
      description: p.description ?? "",
      permission: p.key ?? p.permission ?? "",
    }));
  }, [permissionDefinitions]);

  // Group by category
  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce((acc, permission) => {
      const category = permission.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(permission);
      return acc;
    }, {});
  }, [allPermissions]);

  // Filtered by search (but keep all if query is empty)
  const filteredPermissions = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return groupedPermissions;

    return Object.keys(groupedPermissions).reduce((acc, category) => {
      const categoryPermissions = groupedPermissions[category].filter((p) => {
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.permission || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
        );
      });
      if (categoryPermissions.length > 0) acc[category] = categoryPermissions;
      return acc;
    }, {});
  }, [groupedPermissions, searchQuery]);

  // Helpers
  const isCategoryFullySelected = (categoryPermissions) =>
    categoryPermissions.every((p) => selectedPermissions.includes(p.id));

  const isCategoryPartiallySelected = (categoryPermissions) => {
    const selectedCount = categoryPermissions.filter((p) =>
      selectedPermissions.includes(p.id)
    ).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  const handlePermissionToggle = (permissionId, checked) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, permissionId] : prev.filter((id) => id !== permissionId)
    );
  };

  const handleSelectAll = (categoryPermissions, checked) => {
    const ids = categoryPermissions.map((p) => p.id);
    setSelectedPermissions((prev) =>
      checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await dispatch(
        assignPermissionsToRole({
          roleId: role.id,
          permissionIds: selectedPermissions,
        })
      );
      message.success("Permissions updated successfully");
      onClose();
    } catch (error) {
      message.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
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

  return (
    <Drawer
      title={`Manage Permissions 2 - ${role?.name ?? "Role"}`}
      width="50%"
      placement="right"
      onClose={onClose}
      open={true}
      className="role-permissions-drawer configuration-main"
      extra={
        <Space>
          <Button onClick={onClose}>Close</Button>
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
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <div className="role-permissions-content">
          {/* Search */}
          <div className="mb-4">
            <Search
              placeholder="Search permissions..."
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

          {/* Selected Count */}
          <div className="mb-4">
            <Card className="selected-permissions-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">Selected Permissions</h5>
                  <p className="text-muted mb-0">
                    {selectedPermissions.length} of {allPermissions.length} permissions selected
                  </p>
                </div>
                <Badge
                  count={selectedPermissions.length}
                  showZero
                  color="var(--primary-color)"
                >
                  <Tag color="var(--primary-color)" className="permission-count-tag">
                    {selectedPermissions.length}
                  </Tag>
                </Badge>
              </div>
            </Card>
          </div>

          {/* Permissions by Category */}
          <div className="permissions-categories">
            {Object.keys(filteredPermissions).map((category) => {
              const categoryPermissions = filteredPermissions[category];
              return (
                <Card key={category} className="permission-category-card mb-3">
                  <div className="category-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Checkbox
                          checked={isCategoryFullySelected(categoryPermissions)}
                          indeterminate={isCategoryPartiallySelected(categoryPermissions)}
                          onChange={(e) => handleSelectAll(categoryPermissions, e.target.checked)}
                        />
                        <Tag color={getCategoryColor(category)} className="category-tag ml-2">
                          {category}
                        </Tag>
                        <span className="ml-2 text-muted">
                          ({categoryPermissions.length} permissions)
                        </span>
                      </div>
                      <Badge
                        count={categoryPermissions.filter((p) =>
                          selectedPermissions.includes(p.id)
                        ).length}
                        showZero
                        color="var(--primary-color)"
                      />
                    </div>
                  </div>

                  <Divider className="my-3" />

                  <div className="permissions-list">
                    <Row gutter={[16, 16]}>
                      {categoryPermissions.map((permission) => (
                        <Col xs={24} sm={12} md={8} key={permission.id}>
                          <div className="permission-item">
                            <Checkbox
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={(e) =>
                                handlePermissionToggle(permission.id, e.target.checked)
                              }
                            >
                              <div className="permission-content">
                                <div className="permission-name">{permission.name}</div>
                                <div className="permission-string">
                                  <code>{permission.permission}</code>
                                </div>
                                <div className="permission-description">
                                  {permission.description}
                                </div>
                              </div>
                            </Checkbox>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default RolePermissions;
