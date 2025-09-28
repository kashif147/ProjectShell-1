import React, { useState, useEffect } from "react";
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
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useAuthorization } from "../../context/AuthorizationContext";
import { useDispatch } from "react-redux";
import { assignPermissionsToRole } from "../../features/RoleSlice";
import { getAllPermissions } from "../../features/PermissionSlice";

const { Search } = Input;

const RolePermissions = ({ role, onClose }) => {
  const dispatch = useDispatch();

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      debugger
      setSelectedPermissions(role.permissions || []);
    }
  }, [role]);
  useEffect(() => {
    dispatch(getAllPermissions())
  }, [dispatch])

  const allPermissions = permissions.map((permission) => ({
    id: permission.key,
    name: permission.name,
    category: permission.category,
    action: permission.action,
    description: permission.description,
    permission: permission.key,
  }));
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = permission.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  const filteredPermissions = Object.keys(groupedPermissions).reduce(
    (acc, category) => {
      const categoryPermissions = groupedPermissions[category].filter(
        (permission) =>
          permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permission.permission
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          permission.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      if (categoryPermissions.length > 0) {
        acc[category] = categoryPermissions;
      }
      return acc;
    },
    {}
  );

  const handlePermissionToggle = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId)
      );
    }
  };

  const handleSelectAll = (categoryPermissions, checked) => {
    const permissionIds = categoryPermissions.map((p) => p.id);
    if (checked) {
      const newPermissions = [
        ...new Set([...selectedPermissions, ...permissionIds]),
      ];
      setSelectedPermissions(newPermissions);
    } else {
      const newPermissions = selectedPermissions.filter(
        (id) => !permissionIds.includes(id)
      );
      setSelectedPermissions(newPermissions);
    }
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

  const isCategoryFullySelected = (categoryPermissions) => {
    return categoryPermissions.every((p) => selectedPermissions.includes(p.id));
  };

  const isCategoryPartiallySelected = (categoryPermissions) => {
    const selectedCount = categoryPermissions.filter((p) =>
      selectedPermissions.includes(p.id)
    ).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  return (
    <Drawer
      title={`Manage Permissions 001- ${role?.name}`}
      width="50%"
      placement="right"
      onClose={onClose}
      open={true}
      className="role-permissions-drawer configuration-main"
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
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

          {/* Permissions by Category */}
          <div className="permissions-categories">
            {Object.keys(filteredPermissions).map((category) => {
              const categoryPermissions = filteredPermissions[category];
              const isFullySelected =
                isCategoryFullySelected(categoryPermissions);
              const isPartiallySelected =
                isCategoryPartiallySelected(categoryPermissions);

              return (
                <Card key={category} className="permission-category-card mb-3">
                  <div className="category-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Checkbox
                          checked={isFullySelected}
                          indeterminate={isPartiallySelected}
                          onChange={(e) =>
                            handleSelectAll(
                              categoryPermissions,
                              e.target.checked
                            )
                          }
                        />
                        <Tag
                          color={getCategoryColor(category)}
                          className="category-tag ml-2"
                        >
                          {category}
                        </Tag>
                        <span className="ml-2 text-muted">
                          ({categoryPermissions.length} permissions)
                        </span>
                      </div>
                      <Badge
                        count={
                          categoryPermissions.filter((p) =>
                            selectedPermissions.includes(p.id)
                          ).length
                        }
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
                              checked={selectedPermissions.includes(
                                permission.id
                              )}
                              onChange={(e) =>
                                handlePermissionToggle(
                                  permission.id,
                                  e.target.checked
                                )
                              }
                            >
                              <div className="permission-content">
                                <div className="permission-name">
                                  {permission.name}
                                </div>
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

          {Object.keys(filteredPermissions).length === 0 && (
            <Card className="text-center">
              <p className="text-muted">
                No permissions found matching your search.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default RolePermissions;
