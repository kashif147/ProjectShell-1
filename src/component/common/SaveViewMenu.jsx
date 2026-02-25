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
import { getGridTemplates, deleteGridTemplate, setDefaultGridTemplate } from "../../features/templete/templetefiltrsclumnapi";
import { getApplicationsWithFilter } from "../../features/applicationwithfilterslice";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import MyAlert from "./MyAlert";
import MyInput from "./MyInput";
import { getLabelToKeyMap, transformFiltersForApi } from "../../utils/filterUtils";
import { setTemplateId, setInitialized, initializeWithTemplate, resetInitialization } from "../../features/applicationwithfilterslice";

const SaveViewMenu = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { templates, loading } = useSelector((state) => state.templetefiltrsclumnapi);
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const { columns, applyTemplate, selectedTemplates, updateSelectedTemplate } = useTableColumns();
  const { filtersState, applyTemplateFilters } = useFilters();
  const [activeView, setActiveView] = useState("Default View");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewName, setViewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to get screen from path (consistent with FilterContext and Toolbar)
  const getScreenFromPath = () => {
    const pathMap = {
      '/applications': 'Applications',
      '/Summary': 'Profile',
      '/membership': 'members',
      "/members": "members",
      "/onlinePayment": "onlinePayment",
      "/CommunicationBatchDetail": "Correspondence",
      "/CasesSummary": "Cases",
      "/EventsSummary": "Events"
    };
    return pathMap[location.pathname] || 'Applications';
  };

  // Determine screen name for filtering templates
  const rawScreenName = location.pathname.split("/").pop() || "application";
  const screenNameForApi = rawScreenName.toLowerCase(); // API uses 'application'

  // Application screens map to 'application' templateType
  const screenMapping = {
    'applications': 'application',
    'members': 'member',
    'summary': 'Profile',
    // add more mappings as needed
  };

  const activeScreen = getScreenFromPath();
  const targetTemplateType = screenMapping[screenNameForApi] || screenNameForApi;

  const transformFiltersForApply = (apiFilters) => {
    const labelMap = getLabelToKeyMap(columns[activeScreen] || []);
    // Reverse the map for loading
    const keyToLabel = {};
    Object.keys(labelMap).forEach(label => {
      keyToLabel[labelMap[label]] = label;
    });

    const transformed = {};
    Object.keys(apiFilters).forEach(key => {
      const filter = apiFilters[key];
      const label = keyToLabel[key] || key;
      transformed[label] = {
        operator: filter.operator === 'equal_to' ? '==' : '!=',
        selectedValues: filter.values || filter.selectedValues || []
      };
    });
    return transformed;
  };

  useEffect(() => {
    dispatch(getGridTemplates());
  }, [dispatch]);

  // Reset initialization when screen changes to prevent data loading with wrong/old templateId
  useEffect(() => {
    dispatch(resetInitialization());
  }, [dispatch, targetTemplateType]);

  // Set initial active view from system default when templates load
  useEffect(() => {
    if (!loading && templates) {
      // 1. Check if we have a persisted view in context for this screen
      const persistedTemplate = selectedTemplates[targetTemplateType];

      if (persistedTemplate) {
        handleApplyView(persistedTemplate, false); // false to avoid redundant context update
        return;
      }

      // 2. Fall back to user default or system default
      const systemView =
        templates.systemDefault?.templateType === targetTemplateType
          ? templates.systemDefault
          : null;
      const userViews =
        templates.userTemplates?.filter(
          (t) => t.templateType === targetTemplateType
        ) || [];

      const defaultView = userViews.find((t) => t.isDefault);

      if (defaultView) {
        handleApplyView(defaultView);
      } else if (systemView) {
        handleApplyView(systemView);
      } else {
        setActiveView("No View in this Screen");
        if (location.pathname === "/applications") {
          dispatch(initializeWithTemplate(""));
        }
      }
    }
  }, [templates, loading, targetTemplateType]);

  const handleApplyView = (template, shouldPersist = true) => {
    const colScreen = activeScreen;
    const transformedFilters = transformFiltersForApply(template.filters || {});

    applyTemplate(colScreen, template.columns);
    applyTemplateFilters(transformedFilters);
    setActiveView(template.name);

    // Update context persistence
    if (shouldPersist) {
      updateSelectedTemplate(targetTemplateType, template);
    }

    dispatch(initializeWithTemplate(template._id || ""));
  };

  const handleSetDefaultView = (templateId) => {
    dispatch(setDefaultGridTemplate(templateId))
      .unwrap()
      .then(() => MyAlert("success", "Success", "Default view set successfully"))
      .catch((error) => {
        console.error("Error setting default view:", error);
        MyAlert("error", "Error", error?.message || "Failed to set default view");
      });
  };

  const handleDeleteView = (id) => {
    dispatch(deleteGridTemplate(id))
      .unwrap()
      .then(() => {
        MyAlert("success", "Success", "View deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting view:", error);
        MyAlert("error", "Error", error?.message || "Failed to delete view");
      });
  };

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      message.error("Please enter a view name");
      return;
    }

    setSaving(true);
    try {
      // 1. Gather and transform filters
      const activeFilters = transformFiltersForApi(filtersState, columns[activeScreen] || []);

      // 2. Gather visible columns
      const screenColumns = columns[activeScreen] || [];
      const visibleColumns = screenColumns
        .filter(col => col.isGride === true)
        .map(col => Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : col.dataIndex);

      // 3. Construct payload
      const payload = {
        name: viewName,
        templateType: targetTemplateType,
        filters: activeFilters,
        columns: visibleColumns,
        isDefault: false,
      };

      const token = localStorage.getItem("token");
      const API_URL = `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      MyAlert("success", "Success", `View "${viewName}" saved successfully`);
      setIsModalVisible(false);
      setViewName("");
      dispatch(getGridTemplates()); // Refresh the list
    } catch (error) {
      console.error("Error saving template:", error);
      MyAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to save template"
      );
    } finally {
      setSaving(false);
    }
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
      <div
        style={{ display: "flex", gap: 12, alignItems: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        {isPinned ? (
          <StarFilled
            style={{ color: "#1890ff", fontSize: 16, cursor: "pointer" }}
          />
        ) : (
          <StarOutlined
            style={{ color: "#555", fontSize: 16, cursor: "pointer" }}
            onClick={() => handleSetDefaultView(template._id)}
          />
        )}
        {!template.systemDefault && (
          <Popconfirm
            title="Delete this view?"
            onConfirm={() => handleDeleteView(template._id)}
            okText="Yes"
            cancelText="No"
          >
            <CloseOutlined
              style={{ color: "#555", fontSize: 16, cursor: "pointer" }}
            />
          </Popconfirm>
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
            renderTemplateItem(templates.systemDefault, templates.systemDefault.isDefault)
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
            renderTemplateItem(template, template.isDefault)
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomLeft"
        open={menuOpen}
        onOpenChange={setMenuOpen}
      >
        <Button
          onClick={(e) => e.preventDefault()}
          className="butn gray-btm ms-2"
        >
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
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button className="butn primary-btn" style={{ marginRight: 4 }} onClick={handleSaveView} loading={saving}>
            Save
          </Button>,
        ]}
      >
        <div style={{ margin: 16 }}>
          {/* <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>View Name</label>
          <Input
            placeholder="Enter view name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
          /> */}
          <MyInput label="View Name" value={viewName} onChange={(e) => setViewName(e.target.value)} />

        </div>
      </Modal>
    </div>
  );
};

export default SaveViewMenu;
