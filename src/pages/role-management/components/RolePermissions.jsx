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
  Collapse,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { assignPermissionsToRole } from "../../../features/RoleSlice";
import insertDataFtn from "../../../utils/Utilities";
import { getAllPermissions } from "../../../features/PermissionSlice";

const { Search } = Input;
const { Panel } = Collapse;

const RolePermissions = ({ role, onClose }) => {
  const dispatch = useDispatch();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState([]); // 👈 define it here

  const [loading, setLoading] = useState(false);

  const { permissions, searchQuery } = useSelector((state) => state.permissions);

  // Load role’s current permissions
  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions || []);
      setInitialPermissions(role.permissions || []);
    }
  }, [role]);

  // Fetch all permissions
  useEffect(() => {
    dispatch(getAllPermissions());
  }, [dispatch]);

  // Normalize permissions (always use _id)
  const allPermissions = useMemo(() => {
    return (Array.isArray(permissions) ? permissions : []).map((p) => ({
      id: p._id,
      name: p.name ?? p.displayName ?? p.key ?? "Unnamed",
      category: p.category ?? "Uncategorized",
      description: p.description ?? "",
      permission: p._id,
    }));
  }, [permissions]);

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
  const filteredPermissions = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return groupedPermissions;

    return Object.keys(groupedPermissions).reduce((acc, category) => {
      const categoryPermissions = groupedPermissions[category].filter(
        (permission) => {
          const name = (permission.name || "").toLowerCase();
          const perm = (permission.permission || "").toLowerCase();
          const desc = (permission.description || "").toLowerCase();
          return name.includes(q) || perm.includes(q) || desc.includes(q);
        }
      );
      if (categoryPermissions.length > 0) acc[category] = categoryPermissions;
      return acc;
    }, {});
  }, [groupedPermissions, searchQuery]);

  // Toggle single permission
  const handlePermissionToggle = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions((prev) => [...new Set([...prev, permissionId])]);
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId));
    }
  };

  // Toggle all in category
  const handleCategoryToggle = (perms) => {
    const ids = perms.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissions.includes(id));

    setSelectedPermissions((prev) =>
      allSelected
        ? prev.filter((id) => !ids.includes(id)) // uncheck all
        : [...new Set([...prev, ...ids])] // check all
    );
  };

const userdata = JSON.parse(localStorage.getItem("userData"));
const handleSave = async () => {
  debugger
  try {
    setLoading(true);

    // Compare differences
    const added = selectedPermissions.filter(
      (id) => !initialPermissions.includes(id)
    );
    debugger
    const removed = initialPermissions.filter(
      (id) => !selectedPermissions.includes(id)
    );
debugger
    // 🔹 Assign new permissions
    if (added.length > 0) {
      for (const permissionId of added) {
        await insertDataFtn(
          process.env.REACT_APP_POLICY_SERVICE_URL,
          "/api/users/assign-role",
          { userId: userdata?.id, roleId: role._id },
          () => {}
        );
      }
    }
debugger
    // 🔹 Remove unselected permissions
    if (removed.length > 0) {
      for (const permissionId of removed) {
        await insertDataFtn(
          "/api/users/remove-role",
          { userId: permissionId, roleId: role._id },
          () => {}
        );
      }
    }
debugger
    // ✅ Show single success message after both loops
    if (added.length > 0 || removed.length > 0) {
      message.success("Permissions updated successfully");
    } else {
      message.info("No changes made");
    }
debugger
    onClose();
  } catch (error) {
    console.error("Error updating role permissions", error);
    message.error("Failed to update permissions");
  } finally {
    setLoading(false);
  }
};


  // Colors by category
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
      title={`Manage Permissions 1- ${role?.name ?? "Role"}`}
      width="70%"
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
        {/* Search */}
        <div className="mb-4">
          <Search
            placeholder="Search permissions..."
            prefix={<SearchOutlined />}
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
        <Collapse accordion>
          {Object.keys(filteredPermissions).map((category) => {
            const categoryPermissions = filteredPermissions[category] || [];
            const allChecked = categoryPermissions.every((p) =>
              selectedPermissions.includes(p.id)
            );
            const partiallyChecked =
              categoryPermissions.some((p) =>
                selectedPermissions.includes(p.id)
              ) && !allChecked;

            return (
              <Panel
                key={category}
                header={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Tag color={getCategoryColor(category)}>{category}</Tag>
                      <span style={{ marginLeft: 8 }}>
                        ({categoryPermissions.length} permissions)
                      </span>
                    </div>
                    <Checkbox
                      indeterminate={partiallyChecked}
                      checked={allChecked}
                      onChange={() => handleCategoryToggle(categoryPermissions)}
                    >
                      Select All
                    </Checkbox>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  {categoryPermissions.map((permission) => {
                    const checked = selectedPermissions.includes(permission.id);
                    return (
                      <Col xs={24} sm={12} md={8} key={permission.id}>
                        <div className="permission-item">
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionToggle(permission.id, e.target.checked)
                            }
                          >
                            <div className="permission-content">
                              <div className="permission-name">{permission.name}</div>
                              <div className="permission-string">
                                <code style={{ fontSize: 12 }}>
                                  {permission.permission}
                                </code>
                              </div>
                              <div className="permission-description">
                                {permission.description}
                              </div>
                            </div>
                          </Checkbox>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Panel>
            );
          })}
        </Collapse>

        {Object.keys(filteredPermissions).length === 0 && (
          <Card className="text-center">
            <p className="text-muted">No permissions found matching your search.</p>
          </Card>
        )}
      </div>
    </Drawer>
  );
};

export default RolePermissions;
