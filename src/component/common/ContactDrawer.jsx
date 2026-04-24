// ContactDrawer.jsx
import React, { useEffect, useState } from "react";
import { Drawer, Table, Button, Card, Typography, Space, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { UserPlus, MapPin, Send, ChevronDown, ChevronRight } from "lucide-react";
import MyConfirm from "./MyConfirm";

const { Text } = Typography;

const USER_SERVICE_URL = process.env.REACT_APP_POLICY_SERVICE_URL;

// Role ID mapping
const ROLE_IDS = {
  BRANCH: "68c6b4d1e42306a6836622fd",
  REGION: "68c6b4d1e42306a6836622fa",
  IRO: "68c6b4d1e42306a6836622f1",
};

function ContactDrawer({ open, onClose, title = "Contacts", onAssign, onUnassign, type = "workLocation" }) {
  const dispatch = useDispatch();
  const { selectedWorkLocations } = useSelector((state) => state.lookups);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, type]);

  const fetchUsers = async () => {
    const roleId = type === "Branch" ? ROLE_IDS.BRANCH :
      type === "Region" ? ROLE_IDS.REGION :
        ROLE_IDS.IRO;
    setUsersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${USER_SERVICE_URL}/roles/${roleId}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Accept array directly or wrapped in data/users
      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      setUsers(userList);
    } catch (err) {
      console.error(`Failed to fetch users for role ${roleId}:`, err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const columns = [
    {
      title: "Forename",
      dataIndex: "userFirstName",
      key: "userFirstName",
      render: (val, record) => val || record.userFullName?.split(" ")?.[0] || "-",
    },
    {
      title: "Surname",
      dataIndex: "userLastName",
      key: "userLastName",
      render: (val, record) => val || record.userFullName?.split(" ")?.[1] || "-",
    },
    {
      title: "Phone",
      dataIndex: "userMobilePhone",
      key: "userMobilePhone",
      render: (val) => val || "-",
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      key: "userEmail",
      render: (val) => val || "-",
    },
    {
      title: "Address",
      key: "address",
      render: () => "-",
    },
  ];

  const isAssigning = selectedRowKeys.length > 0;

  const handleAssign = () => {
    if (selectedRowKeys.length === 0) return;
    const selectedUser = users.find((u) => (u._id || u.userEmail) === selectedRowKeys[0]);
    if (!selectedUser) return;

    MyConfirm({
      title: `Assign ${getOfficerLabel()}`,
      message: `Do you want to assign this ${getOfficerLabel()}?`,
      onConfirm: () => {
        if (onAssign) onAssign(selectedUser, selectedWorkLocations);
      },
    });
  };

  const handleUnassign = () => {
    MyConfirm({
      title: `Unassign ${getOfficerLabel()}`,
      message: `Do you want to unassign the ${getOfficerLabel()} from the selected ${getLabel()}?`,
      onConfirm: () => {
        if (onUnassign) {
          onUnassign(selectedWorkLocations);
        } else if (onAssign) {
          onAssign(null, selectedWorkLocations);
        }
      },
    });
  };

  const getLabel = () => {
    switch (type) {
      case "Branch": return "Branches";
      case "Region": return "Regions";
      default: return "Work Locations";
    }
  };

  const getOfficerLabel = () => {
    switch (type) {
      case "Branch": return "Branch Manager";
      case "Region": return "Region Officer";
      default: return "IRO";
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={1040}
      title={isAssigning
        ? `${getOfficerLabel()} Assignment`
        : `Unassign ${getOfficerLabel()}`
      }
      extra={
        <Button
          type="primary"
          icon={<Send size={16} />}
          onClick={isAssigning ? handleAssign : handleUnassign}
          style={{
            backgroundColor: isAssigning ? "#45669d" : "#ff4d4f",
            borderColor: isAssigning ? "#45669d" : "#ff4d4f",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isAssigning ? "Assign" : "Unassign"}
        </Button>
      }
    >
      <Card
        bordered={false}
        className="drawer-main-cntainer"
        styles={{ body: { padding: "10px" } }}
      >
        {/* Selection Indication */}
        {selectedWorkLocations && selectedWorkLocations.length > 0 && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#f0f5ff",
              borderRadius: "6px",
              border: "1px solid #d6e4ff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: isExpanded ? "8px" : "0",
                }}
              >
                <MapPin size={16} color="#1890ff" />
                <Text strong style={{ color: "#1890ff" }}>
                  Selected {getLabel()} to {isAssigning ? "Assign" : "Unassign"} {getOfficerLabel()}: ({selectedWorkLocations.length})
                </Text>
              </div>
              {isExpanded ? <ChevronDown size={18} color="#1890ff" /> : <ChevronRight size={18} color="#1890ff" />}
            </div>
            {isExpanded && (
              <Space size={[0, 8]} wrap>
                {selectedWorkLocations.map((location) => (
                  <Tag color="geekblue" key={location._id || location.code}>
                    {location.lookupname || location.DisplayName || location.code}
                  </Tag>
                ))}
              </Space>
            )}
          </div>
        )}

        <div
          className="common-table"
          style={{
            width: "100%",
            overflowX: "auto",
            paddingBottom: "20px",
          }}
        >
          <Table
            className="common-table"
            pagination={false}
            columns={columns}
            dataSource={users}
            loading={usersLoading}
            rowKey={(record) => record._id || record.userEmail}
            rowSelection={{
              type: "checkbox",
              selectedRowKeys,
              onChange: (keys) => {
                // Allow only one selection at a time — keep the latest
                if (keys.length > 1) {
                  setSelectedRowKeys([keys[keys.length - 1]]);
                } else {
                  setSelectedRowKeys(keys);
                }
              },
            }}
            rowClassName={(_, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            bordered
          />
        </div>
      </Card>
    </Drawer>
  );
}

export default ContactDrawer;
