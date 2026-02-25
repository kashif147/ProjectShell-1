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
import { getAllApplications } from "../../features/ApplicationSlice";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import MyAlert from "./MyAlert";
import MyInput from "./MyInput";
import { getLabelToKeyMap, transformFiltersForApi, transformFiltersFromApi } from "../../utils/filterUtils";
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
    return transformFiltersFromApi(apiFilters, columns[activeScreen] || []);
  };

  useEffect(() => {
    dispatch(getGridTemplates());
  }, [dispatch]);

  // Consolidate Initialization Logic: Reset and Apply Template on Screen Change
  const lastScreen = React.useRef(null);
  useEffect(() => {
    // 🛡️ Always reset immediately IF AND ONLY IF the screen actually changed
    if (lastScreen.current !== targetTemplateType) {
      console.log("🔄 SaveViewMenu: Screen change detected, resetting initialization:", targetTemplateType);
      dispatch(resetInitialization());
      lastScreen.current = targetTemplateType;
    }

    // 🛡️ Guard: Wait until templates are loaded and ready
    if (loading || !templates) {
      console.log("⏳ SaveViewMenu: Waiting for templates to load for screen:", targetTemplateType);
      return;
    }

    console.log("🚀 SaveViewMenu: Initializing view for screen:", targetTemplateType);

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
        : templates.userTemplates?.find(
          (t) => t.systemDefault && t.templateType === targetTemplateType
        ) || null;

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
      setActiveView("System Template");
      // Always initialize data loading even if no explicitly saved view exists
      dispatch(initializeWithTemplate(""));
    }
  }, [dispatch, targetTemplateType, templates, loading]);

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

  const handleSetDefaultView = (template) => {
    dispatch(setDefaultGridTemplate(template._id))
      .unwrap()
      .then(() => {
        MyAlert("success", "Success", "Default view set successfully");
        handleApplyView(template); // Apply the view immediately
        dispatch(getGridTemplates()); // Refresh the list to show new default star
      })
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

      // 1. Refresh the templates list first and WAIT for it
      const templatesResponse = await dispatch(getGridTemplates()).unwrap();

      // 2. Find the newly saved template in the refreshed list
      const savedTemplate = templatesResponse.userTemplates?.find(t => t.name === viewName && t.templateType === targetTemplateType);

      if (savedTemplate) {
        handleApplyView(savedTemplate); // This will update context and filters
      }

      // 3. Refresh the grid data
      if (location.pathname.toLowerCase() === "/applications") {
        dispatch(getApplicationsWithFilter({
          templateId: savedTemplate?._id || currentTemplateId || "",
          page: 1,
          limit: 10
        }));
      } else {
        dispatch(getAllApplications());
      }
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
            onClick={() => handleSetDefaultView(template)}
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
