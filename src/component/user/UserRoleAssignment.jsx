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
  Avatar,
  Tooltip
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { getAllRolesList } from "../../constants/Roles";
import { useDispatch, useSelector } from "react-redux";
import { assignRolesToUser } from "../../features/UserSlice";
import { getAllRoles } from "../../features/RoleSlice";


const { Search } = Input;

const UserRoleAssignment = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const {
    roles,
    rolesLoading,
    error,
    // searchQuery,
    selectedTenant,
    selectedStatus,
    selectedCategory,
  } = useSelector((state) => state.roles);

  const [selectedRoles, setSelectedRoles] = useState([]);
  console.log("User in Drawer:", selectedRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialPermissions, setInitialPermissions] = useState([]);
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles?.map((role) => role._id) || []);
      setInitialPermissions(user.roles?.map((role) => role._id) || []);
    }
  }, [user]);
  console.log("Selected Roles:", selectedRoles);
  useEffect(() => {
    dispatch(getAllRoles())
  }, [dispatch])

  const allRoles = roles;
  debugger

  const groupedRoles = allRoles.reduce((acc, role) => {
    const category = role.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(role);
    return acc;
  }, {});
  debugger
  const filteredRoles = Object.keys(groupedRoles).reduce((acc, category) => {

    const categoryRoles = groupedRoles[category].filter(
      (role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (categoryRoles.length > 0) {
      acc[category] = categoryRoles;
    }
    return acc;
  }, {});
  debugger
  const handleRoleToggle = (roleId, checked) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    }
  };

  const handleSelectAll = (categoryRoles, checked) => {
    const roleIds = categoryRoles.map((r) => r._id);
    if (checked) {
      const newRoles = [...new Set([...selectedRoles, ...roleIds])];
      setSelectedRoles(newRoles);
    } else {
      const newRoles = selectedRoles.filter((id) => !roleIds.includes(id));
      setSelectedRoles(newRoles);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await dispatch(
        assignRolesToUser({
          userId: user._id,
          roleIds: selectedRoles,
        })
      );
      message.success("Roles updated successfully");
      onClose();
    } catch (error) {
      message.error("Failed to update roles");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      SYSTEM: "red",
      PORTAL: "green",
      CRM_MANAGEMENT: "purple",
      CRM_OFFICERS: "blue",
      CRM_SPECIALIZED: "orange",
      CRM_ACCESS: "gray",
    };
    return colors[category] || "default";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      SYSTEM: "System Roles",
      PORTAL: "Portal Roles",
      CRM_MANAGEMENT: "CRM Management",
      CRM_OFFICERS: "CRM Officers",
      CRM_SPECIALIZED: "CRM Specialized",
      CRM_ACCESS: "CRM Access",
    };
    return labels[category] || category;
  };

  const isCategoryFullySelected = (categoryRoles) => {
    return categoryRoles.every((r) => selectedRoles.includes(r.id));
  };

  const isCategoryPartiallySelected = (categoryRoles) => {
    const selectedCount = categoryRoles.filter((r) =>
      selectedRoles.includes(r.id)
    ).length;
    return selectedCount > 0 && selectedCount < categoryRoles.length;
  };

  const getUserInitials = (user) => {
    return `${user.userFirstName?.[0] || ""}${user.userLastName?.[0] || ""
      }`.toUpperCase();
  };

  return (
    <Drawer
      title={`Assign Roles - ${user?.userFullName}`}
      width="50%"
      placement="right"
      onClose={onClose}
      open={true}
      className="user-role-assignment-drawer configuration-main"
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
            Save Roles
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <div className="user-role-assignment-content">
          {/* User Info */}
          <Card className="user-info-card mb-4">
            <div className="d-flex align-items-center">
              <Avatar
                size={60}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                {getUserInitials(user)}

              </Avatar>
              <div className="ml-3">
                <h5 className="mb-1">{user?.userFullName}</h5>
                <p className="text-muted mb-1">{user?.userEmail}</p>
                <p className="text-muted mb-0">
                  Member: {user?.userMemberNumber}
                </p>
              </div>
            </div>
          </Card>

          {/* Search */}
          <div className="mb-4">
            <Search
              placeholder="Search roles..."
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
            <Card className="selected-roles-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">Selected Roles</h5>
                  <p className="text-muted mb-0">
                    {selectedRoles.length} of {allRoles.length} roles selected
                  </p>
                </div>
                <Badge
                  count={selectedRoles.length}
                  showZero
                  color="var(--primary-color)"
                >
                  <Tag color="var(--primary-color)" className="role-count-tag">
                    {selectedRoles.length}
                  </Tag>
                </Badge>
              </div>
            </Card>
          </div>

          {/* Roles by Category */}
          <div className="roles-categories">
            {Object.keys(filteredRoles).map((category) => {
              const categoryRoles = filteredRoles[category];
              const isFullySelected = isCategoryFullySelected(categoryRoles);
              debugger
              const isPartiallySelected =
                isCategoryPartiallySelected(categoryRoles);

              return (
                <Card key={category} className="role-category-card mb-3">
                  <div className="category-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Checkbox
                          checked={isFullySelected}
                          indeterminate={isPartiallySelected}
                          onChange={(e) =>
                            handleSelectAll(categoryRoles, e.target.checked)
                          }
                        />
                        <Tag
                          color={getCategoryColor(category)}
                          className="category-tag ml-2"
                        >
                          {getCategoryLabel(category)}
                        </Tag>
                        <span className="ml-2 text-muted">
                          ({categoryRoles.length} roles)
                        </span>
                      </div>
                      <Badge
                        count={
                          categoryRoles.filter((r) =>
                            selectedRoles.includes(r.id)
                          ).length
                        }
                        showZero
                        color="var(--primary-color)"
                      />
                    </div>
                  </div>

                  <Divider className="my-3" />

                  <div className="roles-list">
                    <Row gutter={[16, 16]}>
                      {categoryRoles.map((role) => (
                        <Col xs={24} sm={12} md={8} key={role.id}>
                          <div className="role-item">
                            <Checkbox
                              checked={selectedRoles.includes(role._id)}
                              onChange={(e) => {
                                debugger
                                handleRoleToggle(role._id, e.target.checked)
                              }
                              }
                            >
                              <div className="role-content">
                                <div className="role-name">{role.name}</div>
                                <div className="role-description">
                                  {role.description}
                                </div>
                                <div className="role-permissions">
                                  <Tooltip
                                    title={
                                      <div style={{ maxWidth: 300, maxHeight: 200, overflowY: "auto" }}>
                                        {role.permissions?.length > 0 ? (
                                          role.permissions.map((perm) => (
                                            <div key={perm._id}>{perm.name}</div>
                                          ))
                                        ) : (
                                          "No permissions assigned"
                                        )}
                                      </div>
                                    }
                                  >
                                    <Tag color="blue" size="small" style={{ cursor: "pointer" }}>
                                      {role.permissions?.length || 0} permissions
                                    </Tag>
                                  </Tooltip>
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

          {Object.keys(filteredRoles).length === 0 && (
            <Card className="text-center">
              <p className="text-muted">No roles found matching your search.</p>
            </Card>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default UserRoleAssignment;
