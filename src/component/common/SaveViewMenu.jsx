import React, { useState, useEffect } from "react";
import {
  Dropdown,
  Button,
  Spin,
  message,
  Popconfirm,
  Modal,
  Input,
  Divider,
} from "antd";
import {
  SettingOutlined,
  StarOutlined,
  StarFilled,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getGridTemplates,
  deleteGridTemplate,
  setDefaultGridTemplate,
} from "../../features/templete/templetefiltrsclumnapi";
import { getViewById } from "../../features/views/ViewByIdSlice";
import {
  setActiveTemplateId,
  clearActiveTemplateId,
} from "../../features/views/ActiveTemplateSlice";
import { getApplicationsWithFilter } from "../../features/applicationwithfilterslice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { getSubscriptionsWithTemplate } from "../../features/subscription/subscriptionSlice";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useFilters } from "../../context/FilterContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import MyAlert from "./MyAlert";
import MyInput from "./MyInput";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";
import {
  getLabelToKeyMap,
  transformFiltersForApi,
  transformFiltersFromApi,
} from "../../utils/filterUtils";
import {
  setTemplateId,
  setInitialized,
  initializeWithTemplate,
  resetInitialization,
} from "../../features/applicationwithfilterslice";

const SaveViewMenu = ({ className, style }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { templates, loading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );
  const { currentTemplateId } = useSelector(
    (state) => state.applicationWithFilter,
  );
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { selectedView, loading: viewLoading } = useSelector(
    (state) => state.viewById,
  );
  const { columns, applyTemplate, selectedTemplates, updateSelectedTemplate } =
    useTableColumns();
  const { filtersState, applyTemplateFilters } = useFilters();
  const [activeView, setActiveView] = useState("Default View");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewName, setViewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to get screen from path (consistent with FilterContext and Toolbar)
  const getScreenFromPath = () => {
    const pathMap = {
      "/applications": "Applications",
      "/Summary": "Profile",
      "/membership": "members",
      "/members": "members",
      "/onlinePayment": "onlinePayment",
      "/CommunicationBatchDetail": "Correspondence",
      "/CasesSummary": "Cases",
      "/EventsSummary": "Events",
      "/EventsDashboard": "Events",
    };
    return pathMap[location.pathname] || "Applications";
  };

  // Determine screen name for filtering templates
  const rawScreenName = location.pathname.split("/").pop() || "application";
  const screenNameForApi = rawScreenName.toLowerCase(); // API uses 'application'

  // Application screens map to 'application' templateType
  const screenMapping = {
    applications: "application",
    members: "member",
    summary: "profile",
    eventsdashboard: "eventsdashboard",
  };

  const activeScreen = getScreenFromPath();
  const normalizeTemplateType = (type) =>
    String(type || "")
      .trim()
      .toLowerCase();
  const targetTemplateType =
    screenMapping[screenNameForApi] || screenNameForApi;
  const isMembersTemplateType =
    normalizeTemplateType(targetTemplateType) === "member" ||
    normalizeTemplateType(targetTemplateType) === "members";
  const isTemplateForCurrentType = (template) =>
    normalizeTemplateType(template?.templateType) ===
    normalizeTemplateType(targetTemplateType);

  const transformFiltersForApply = (apiFilters) => {
    return transformFiltersFromApi(apiFilters, columns[activeScreen] || []);
  };

  useEffect(() => {
    dispatch(getGridTemplates({ type: targetTemplateType }));
  }, [dispatch, targetTemplateType]);

  // Consolidate Initialization Logic: Reset and Apply Template on Screen Change
  const lastScreen = React.useRef(null);
  useEffect(() => {
    // 🛡️ Always reset immediately IF AND ONLY IF the screen actually changed
    if (lastScreen.current !== targetTemplateType) {
      console.log(
        "🔄 SaveViewMenu: Screen change detected, resetting initialization:",
        targetTemplateType,
      );
      dispatch(resetInitialization());
      dispatch(clearActiveTemplateId()); // 🛡️ Clear any active template from the previous screen
      lastScreen.current = targetTemplateType;
    }

    // 🛡️ Guard: Wait until templates are loaded and ready
    if (loading || !templates) {
      console.log(
        "⏳ SaveViewMenu: Waiting for templates to load for screen:",
        targetTemplateType,
      );
      return;
    }

    console.log(
      "🚀 SaveViewMenu: Initializing view for screen:",
      targetTemplateType,
    );

    // 1. Check if we have a persisted view in context for this screen
    const persistedTemplate = selectedTemplates[targetTemplateType];

    if (persistedTemplate) {
      handleApplyView(persistedTemplate, false); // false to avoid redundant context update
      return;
    }

    // 2. Fall back to user default or system default
    const systemView = isTemplateForCurrentType(templates.systemDefault)
      ? templates.systemDefault
      : templates.userTemplates?.find(
          (t) => t.systemDefault && isTemplateForCurrentType(t),
        ) || null;

    const userViews =
      templates.userTemplates?.filter((t) => isTemplateForCurrentType(t)) || [];

    const defaultView = userViews.find((t) => t.isDefault);

    if (defaultView) {
      dispatch(setActiveTemplateId(defaultView._id));
      handleApplyView(defaultView);
    } else if (systemView) {
      dispatch(setActiveTemplateId(systemView._id));
      handleApplyView(systemView);
    } else {
      setActiveView("System Template");
      dispatch(setActiveTemplateId(null));
      // Always initialize data loading even if no explicitly saved view exists
      dispatch(initializeWithTemplate(""));
      if (isMembersTemplateType) {
        dispatch(
          getSubscriptionsWithTemplate({
            page: 1,
            limit: 10,
          }),
        );
      }
    }
  }, [dispatch, targetTemplateType, templates, loading, isMembersTemplateType]);

  useEffect(() => {
    if (activeTemplateId) {
      dispatch(getViewById({ id: activeTemplateId, type: targetTemplateType }));
    }
  }, [dispatch, activeTemplateId, targetTemplateType]);

  // Apply template settings when view details are fetched
  useEffect(() => {
    if (selectedView && selectedView._id === activeTemplateId) {
      console.log(
        "✅ SaveViewMenu: Applying view details from viewById slice:",
        selectedView.name,
      );

      const colScreen = activeScreen;
      const transformedFilters = transformFiltersForApply(
        selectedView.filters || {},
      );

      applyTemplate(colScreen, selectedView.columns);
      applyTemplateFilters(transformedFilters);
      setActiveView(selectedView.name);

      // Initialize data loading with the template
      dispatch(initializeWithTemplate(selectedView._id || ""));
      if (isMembersTemplateType) {
        dispatch(
          getSubscriptionsWithTemplate({
            templateId: selectedView._id || "",
            page: 1,
            limit: 10,
          }),
        );
      }
    }
  }, [selectedView, activeTemplateId, isMembersTemplateType, dispatch]);

  const handleApplyView = (template, shouldPersist = true) => {
    // Just set the active ID; the useEffect above will handle the application of details
    dispatch(setActiveTemplateId(template._id || null));

    // Update context persistence
    if (shouldPersist) {
      updateSelectedTemplate(targetTemplateType, template);
    }
  };

  const handleSetDefaultView = (id, isDefault) => {
    dispatch(setDefaultGridTemplate({ id, isDefault, type: targetTemplateType }))
      .unwrap()
      .then(() => {
        MyAlert(
          "success",
          "Success",
          `Default view ${isDefault ? "set" : "removed"} successfully`,
        );
        dispatch(getGridTemplates({ type: targetTemplateType })); // Refresh the list to show new default star
      })
      .catch((error) => {
        console.error("Error setting default view:", error);
        MyAlert(
          "error",
          "Error",
          error?.message || "Failed to update default view",
        );
      });
  };

  const handleDeleteView = (id) => {
    dispatch(deleteGridTemplate({ id, type: targetTemplateType }))
      .unwrap()
      .then(() => {
        MyAlert("success", "Success", "View deleted successfully");

        // If the deleted view was active, we need to clear it so initialization can reset to system default
        if (id === activeTemplateId) {
          dispatch(setActiveTemplateId(null));
          updateSelectedTemplate(targetTemplateType, null);
        }

        dispatch(getGridTemplates({ type: targetTemplateType })); // This will trigger the useEffect initialization
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
      const activeFilters = transformFiltersForApi(
        filtersState,
        columns[activeScreen] || [],
      );

      // 2. Gather visible columns
      const screenColumns = columns[activeScreen] || [];
      const visibleColumns = screenColumns
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex)
            ? col.dataIndex.join(".")
            : col.dataIndex,
        );

      // 3. Construct payload
      const payload = {
        name: viewName,
        templateType: targetTemplateType,
        filters: activeFilters,
        columns: visibleColumns,
        isDefault: false,
      };

      const token = localStorage.getItem("token");
      const API_URL = isMembersTemplateType
        ? `${getSubscriptionServiceBaseUrl().replace(/\/v1$/, "")}/templates`
        : `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      MyAlert("success", "Success", `View "${viewName}" saved successfully`);
      setIsModalVisible(false);
      setViewName("");

      // 1. Refresh the templates list first and WAIT for it
      const templatesResponse = await dispatch(
        getGridTemplates({ type: targetTemplateType }),
      ).unwrap();

      // 2. Find the newly saved template in the refreshed list
      const savedTemplate = templatesResponse.userTemplates?.find(
        (t) => t.name === viewName && isTemplateForCurrentType(t),
      );

      if (savedTemplate) {
        handleApplyView(savedTemplate); // This will update context and filters
      }

      // 3. Refresh the grid data
      if (location.pathname.toLowerCase() === "/applications") {
        dispatch(
          getApplicationsWithFilter({
            templateId: savedTemplate?._id || currentTemplateId || "",
            page: 1,
            limit: 10,
          }),
        );
      } else if (isMembersTemplateType) {
        dispatch(
          getSubscriptionsWithTemplate({
            templateId: savedTemplate?._id || currentTemplateId || "",
            page: 1,
            limit: 10,
          }),
        );
      } else {
        dispatch(getAllApplications());
      }
    } catch (error) {
      console.error("Error saving template:", error);
      MyAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to save template",
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
            onClick={() => handleSetDefaultView(template._id, false)}
          />
        ) : (
          <StarOutlined
            style={{ color: "#555", fontSize: 16, cursor: "pointer" }}
            onClick={() => handleSetDefaultView(template._id, true)}
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
    <div
      style={{
        minWidth: 240,
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin size="small" />
        </div>
      ) : (
        <>
          {/* Select View Header */}
          <div
            style={{
              padding: "8px 12px",
              fontSize: 13,
              color: "#999",
              fontWeight: 500,
            }}
          >
            Select View
          </div>

          {/* System Default */}
          {(() => {
            const userViews =
              templates?.userTemplates?.filter((t) =>
                isTemplateForCurrentType(t),
              ) || [];
            const hasUserDefault = userViews.some((t) => t.isDefault);

            return (
              templates?.systemDefault &&
              isTemplateForCurrentType(templates.systemDefault) &&
              renderTemplateItem(
                templates.systemDefault,
                templates.systemDefault.isDefault || !hasUserDefault,
              )
            );
          })()}

          <Divider style={{ margin: "4px 0" }} />

          {/* Manage Views Header */}
          <div
            style={{
              padding: "8px 12px",
              fontSize: 13,
              color: "#999",
              fontWeight: 500,
            }}
          >
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
              fontSize: 14,
            }}
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined style={{ marginRight: 8, fontSize: 16 }} /> Save
            Current View
          </div>

          {/* User Templates */}
          {templates?.userTemplates
            ?.filter((t) => isTemplateForCurrentType(t))
            .map((template) =>
              renderTemplateItem(template, template.isDefault),
            )}
        </>
      )}
    </div>
  );

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: "8px", ...style }}
    >
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
          <Button
            className="butn primary-btn"
            style={{ marginRight: 4 }}
            onClick={handleSaveView}
            loading={saving}
          >
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
          <MyInput
            label="View Name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SaveViewMenu;
