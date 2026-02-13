import React, { useState, useEffect } from "react";
import { Dropdown, Button, Spin, message, Popconfirm, Modal, Input, Divider } from "antd";
import {
  SettingOutlined,
  StarOutlined,
  StarFilled,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getGridTemplates, deleteGridTemplate, saveGridTemplate } from "../../features/templete/templetefiltrsclumnapi";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useLocation } from "react-router-dom";

const SaveViewMenu = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { templates, loading } = useSelector((state) => state.templetefiltrsclumnapi);
  const { columns, applyTemplate } = useTableColumns();
  const [activeView, setActiveView] = useState("Default View");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewName, setViewName] = useState("");

  // Determine screen name for filtering templates
  const rawScreenName = location.pathname.split("/").pop() || "application";
  const screenNameForApi = rawScreenName.toLowerCase(); // API uses 'application'

  // Application screens map to 'application' templateType
  const screenMapping = {
    'applications': 'application',
    'members': 'member',
    // add more mappings as needed
  };

  const targetTemplateType = screenMapping[screenNameForApi] || screenNameForApi;

  useEffect(() => {
    dispatch(getGridTemplates());
  }, [dispatch]);

  // Set initial active view from system default when templates load
  useEffect(() => {
    if (!loading && templates) {
      const systemView = templates.systemDefault?.templateType === targetTemplateType ? templates.systemDefault : null;
      const userViews = templates.userTemplates?.filter(t => t.templateType === targetTemplateType) || [];

      if (systemView) {
        setActiveView(systemView.name);
      } else if (userViews.length > 0) {
        setActiveView(userViews[0].name);
      } else {
        setActiveView("No View in this Screen");
      }
    }
  }, [templates, loading, targetTemplateType]);

  const handleApplyView = (template) => {
    const tableScreenName = location.pathname.includes('Applications') ? "Applications" : "members";
    applyTemplate(tableScreenName, template.columns);
    setActiveView(template.name);
    message.success(`View "${template.name}" applied`);
  };

  const handleSaveView = () => {
    // Visual only for now as requested
    setIsModalVisible(false);
    setViewName("");
    message.info("Save view is currently visual only");
  };

  const renderTemplateItem = (template, isPinned = false) => (
    <div
      key={template._id}
      style={{
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        background: activeView === template.name ? "#f0f7ff" : "transparent",
      }}
      onClick={() => handleApplyView(template)}
    >
      <span style={{ fontSize: 14, color: "#333" }}>{template.name}</span>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
        {isPinned ? (
          <StarFilled style={{ color: "#1890ff", fontSize: 16 }} />
        ) : (
          <StarOutlined style={{ color: "#555", fontSize: 16 }} />
        )}
        {!template.systemDefault && (
          <CloseOutlined style={{ color: "#555", fontSize: 16 }} />
        )}
      </div>
    </div>
  );

  const menu = (
    <div style={{ minWidth: 240, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}><Spin size="small" /></div>
      ) : (
        <>
          {/* Select View Header */}
          <div style={{ padding: "8px 12px", fontSize: 13, color: "#999", fontWeight: 500 }}>
            Select View
          </div>

          {/* System Default */}
          {templates?.systemDefault && templates.systemDefault.templateType === targetTemplateType &&
            renderTemplateItem(templates.systemDefault, templates.systemDefault.pinned)
          }

          <Divider style={{ margin: "4px 0" }} />

          {/* Manage Views Header */}
          <div style={{ padding: "8px 12px", fontSize: 13, color: "#999", fontWeight: 500 }}>
            Manage Views
          </div>

          {/* Save Current View Action */}
          <div
            style={{
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "#555",
              fontSize: 14
            }}
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined style={{ marginRight: 8, fontSize: 16 }} /> Save Current View
          </div>

          {/* User Templates */}
          {templates?.userTemplates?.filter(t => t.templateType === targetTemplateType).map(template =>
            renderTemplateItem(template, template.pinned)
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
        <Button onClick={(e) => e.preventDefault()} className="butn gray-btm ms-2">
          <SettingOutlined style={{ fontSize: 18, cursor: "pointer" }} />
          {activeView}
        </Button>
      </Dropdown>

      <Modal
        title="Save Current View"
        open={isModalVisible}
        onOk={handleSaveView}
        onCancel={() => setIsModalVisible(false)}
        closable={false}
        maskClosable={false}
        footer={[
          <Button key="submit" className="butn primary-btn" onClick={handleSaveView}>
            Save
          </Button>,
        ]}
      >
        <div style={{ margin: 4 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>View Name</label>
          <Input
            placeholder="Enter view name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SaveViewMenu;
