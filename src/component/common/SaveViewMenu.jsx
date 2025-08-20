import React from "react";
import { Dropdown, Divider, Button } from "antd";
import {
  SettingOutlined,
  StarOutlined,
  StarFilled,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const SaveViewMenu = () => {
  const menu = (
    <div style={{ minWidth: 220, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      {/* Select View */}
      <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#999" }}>
        Select View
      </div>
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span>All Applications</span>
        <StarFilled style={{ color: "#1890ff" }} />
      </div>

      <Divider style={{ margin: "4px 0" }} />

      {/* Manage Views */}
      <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#999" }}>
        Manage Views
      </div>
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <PlusOutlined style={{ marginRight: 6 }} /> Save Current View
      </div>

      {/* Pending Applications */}
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span>Pending Applications</span>
        <div style={{ display: "flex", gap: 8 }}>
          <StarOutlined />
          <CloseOutlined style={{ color: "red" }} />
        </div>
      </div>

      {/* Recent Applications */}
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span>Recent Applications</span>
        <div style={{ display: "flex", gap: 8 }}>
          <StarOutlined />
          <CloseOutlined style={{ color: "red" }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
        <Button onClick={(e) => e.preventDefault()} className="butn gray-btm ms-2">
          <SettingOutlined style={{ fontSize: 18, cursor: "pointer" }} />
          Recent Applications
        </Button>
      </Dropdown>
    </div>
  );
};

export default SaveViewMenu;
