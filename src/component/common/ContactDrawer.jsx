// ContactDrawer.jsx
import React, { useEffect, useState } from "react";
import { Drawer, Table, Button, Card, Typography, Space, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { UserPlus, MapPin } from "lucide-react";

const { Text } = Typography;

const USER_SERVICE_URL = process.env.REACT_APP_POLICY_SERVICE_URL;
// Role ID for IRO — update if needed
const IRO_ROLE_ID = "68c6b4d1e42306a6836622c7";

function ContactDrawer({ open, onClose, title = "Contacts", onAssign }) {
  const dispatch = useDispatch();
  const { selectedWorkLocations } = useSelector((state) => state.lookups);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchIROUsers();
    }
  }, [open]);

  const fetchIROUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${USER_SERVICE_URL}/roles/${IRO_ROLE_ID}/users`,
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
      console.error("Failed to fetch IRO users:", err);
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<UserPlus size={14} />}
          onClick={() => {
            if (onAssign) onAssign(record, selectedWorkLocations);
          }}
          style={{
            backgroundColor: "#45669d",
            borderColor: "#45669d",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Assign
        </Button>
      ),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} width={1040} title={title}>
      <Card
        bordered={false}
        className="drawer-main-cntainer"
        bodyStyle={{ padding: "10px" }}
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
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <MapPin size={16} color="#1890ff" />
              <Text strong style={{ color: "#1890ff" }}>
                Selected Work Locations to Assign:
              </Text>
            </div>
            <Space size={[0, 8]} wrap>
              {selectedWorkLocations.map((location) => (
                <Tag color="geekblue" key={location._id || location.code}>
                  {location.lookupname || location.DisplayName || location.code}
                </Tag>
              ))}
            </Space>
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
