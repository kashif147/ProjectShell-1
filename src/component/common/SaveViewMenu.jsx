import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { useAuthorization } from "../../context/AuthorizationContext";
import { getViewById, clearSelectedView } from "../../features/views/ViewByIdSlice";
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
import { getSubscriptionFilterTemplatesBaseUrl } from "../../config/serviceUrls";
import {
  getLabelToKeyMap,
  normalizeViewTemplatePayload,
  transformFiltersForApi,
  transformFiltersFromApi,
} from "../../utils/filterUtils";
import {
  setTemplateId,
  setInitialized,
  initializeWithTemplate,
  resetInitialization,
} from "../../features/applicationwithfilterslice";
import { resetScreenChanged } from "../../features/views/ScreenFilterChangSlice";

const SaveViewMenu = ({ className, style }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { hasAnyRole } = useAuthorization();
  const canEditGridTemplates = hasAnyRole(["SU", "ASU"]);
  const { templates, loading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  /** Bust Dropdown cache + drive re-render when any template’s isDefault changes after API refresh */
  const templateListRenderKey = useMemo(() => {
    if (!templates) return "none";
    const sys = templates.systemDefault
      ? `${String(templates.systemDefault._id)}:${
          templates.systemDefault.isDefault ? 1 : 0
        }`
      : "nosys";
    const user =
      (templates.userTemplates || [])
        .map(
          (t) =>
            `${String(t._id)}:${
              t && (t.isDefault === true || t.isDefault === "true")
                ? 1
                : 0
            }`,
        )
        .join(",") || "";
    return `${sys}|${user}`;
  }, [templates]);
  const { currentTemplateId } = useSelector(
    (state) => state.applicationWithFilter,
  );
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { selectedView, loading: viewLoading } = useSelector(
    (state) => state.viewById,
  );
  /** Re-run apply when getViewById content changes (application templates often need full detail for filters). */
  const keyForView = (v) =>
    v
      ? `${String(v._id)}|${JSON.stringify(v?.filters)}|${JSON.stringify(
          v?.columns,
        )}`
      : "";
  const viewTemplateDetailKey = useMemo(
    () => keyForView(selectedView),
    [selectedView],
  );
  const { columns, applyTemplate, selectedTemplates, updateSelectedTemplate } =
    useTableColumns();
  const {
    activePage,
    filtersState,
    applyTemplateFilters,
    acknowledgeUserChoseNewTemplate,
    hasUserOverriddenTemplateFilters,
  } = useFilters();
  /**
   * TableColumnsContext uses "Members" for the grid; FilterContext activePage for /membership
   * is "Membership". Column defs must use "Members" for transforms + applyTemplate.
   */
  const tableColumnScreen =
    activePage === "Membership" ? "Members" : activePage;
  const [activeView, setActiveView] = useState("Default View");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewName, setViewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Screen key for columns/filters must match FilterContext `activePage` (not a separate path map).

  // Determine screen name for filtering templates
  const rawScreenName = location.pathname.split("/").pop() || "application";
  const screenNameForApi = rawScreenName.toLowerCase(); // API uses 'application'

  // Application screens map to 'application' templateType
  const screenMapping = {
    applications: "application",
    members: "members",
    membership: "members",
    summary: "profile",
    eventsdashboard: "eventsdashboard",
  };

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
      normalizeTemplateType(targetTemplateType) ||
    (normalizeTemplateType(targetTemplateType) === "members" &&
      normalizeTemplateType(template?.templateType) === "subscription");

  const transformFiltersForApply = useCallback(
    (apiFilters) => {
      return transformFiltersFromApi(
        apiFilters,
        columns[tableColumnScreen] || [],
      );
    },
    [columns, tableColumnScreen],
  );

  /** Apply a template (list item or getViewById detail) to columns + filter chips + fetches. */
  const applyViewPayloadToState = useCallback(
    (t) => {
      t = normalizeViewTemplatePayload(t);
      if (!t) return;
      const colScreen = tableColumnScreen;
      let rawFilters = t.filters || {};
      if (typeof rawFilters === "string") {
        try {
          rawFilters = JSON.parse(rawFilters);
        } catch {
          rawFilters = {};
        }
      }
      const transformedFilters = transformFiltersForApply(rawFilters);

      applyTemplate(
        colScreen,
        t.columns || [],
        templates?.systemDefault?.columns || [],
        t.columnLabels || {},
        templates?.systemDefault?.columnLabels || {},
      );
      applyTemplateFilters(transformedFilters);
      setActiveView(t.name);
      dispatch(initializeWithTemplate(t._id || ""));

      if (isMembersTemplateType) {
        dispatch(
          getSubscriptionsWithTemplate({
            templateId: t._id || "",
            page: 1,
            limit: 10,
          }),
        );
      } else if (activePage === "Applications" && t._id) {
        dispatch(
          getApplicationsWithFilter({
            templateId: t._id,
            page: 1,
            limit: 10,
          }),
        );
      }
      dispatch(resetScreenChanged({ screen: activePage }));
    },
    [
      tableColumnScreen,
      applyTemplate,
      applyTemplateFilters,
      activePage,
      columns,
      dispatch,
      isMembersTemplateType,
      templates,
      transformFiltersForApply,
    ],
  );

  const buildColumnLabelsMap = (screenColumns = []) =>
    screenColumns.reduce((acc, col) => {
      const key = Array.isArray(col?.dataIndex)
        ? col.dataIndex.join(".")
        : col?.dataIndex;
      if (key) acc[String(key)] = String(col?.title || key);
      return acc;
    }, {});

  useEffect(() => {
    dispatch(getGridTemplates({ type: targetTemplateType }));
  }, [dispatch, targetTemplateType]);

  // Consolidate Initialization Logic: Reset and Apply Template on Screen Change
  const lastScreen = React.useRef(null);
  /** Only run full applyTemplate/applyTemplateFilters when switching to a new template id — not on getViewById refetch of the same view (that was stomping user edits and hiding Save). */
  const lastAppliedTemplateIdRef = React.useRef(null);
  /** When user picks a view from the menu, allow one effect run even if hasUserOverridden is true (races with other updates). */
  const viewMenuPickForceApplyRef = React.useRef(false);
  useEffect(() => {
    // 🛡️ Always reset immediately IF AND ONLY IF the screen actually changed
    if (lastScreen.current !== targetTemplateType) {
      lastAppliedTemplateIdRef.current = null;
      dispatch(resetScreenChanged({}));
      dispatch(resetInitialization());
      dispatch(clearActiveTemplateId());
      lastScreen.current = targetTemplateType;
    }

    if (loading || !templates) {
      return;
    }

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
      dispatch(initializeWithTemplate(""));
      dispatch(resetScreenChanged({ screen: activePage }));
    }
  }, [dispatch, targetTemplateType, templates, loading, isMembersTemplateType, activePage]);

  useEffect(() => {
    if (activeTemplateId) {
      dispatch(getViewById({ id: activeTemplateId, type: targetTemplateType }));
    }
  }, [dispatch, activeTemplateId, targetTemplateType]);

  // Apply template settings when view details are fetched (once per active template id)
  useEffect(() => {
    if (!activeTemplateId) {
      lastAppliedTemplateIdRef.current = null;
      return;
    }
    if (!selectedView || String(selectedView._id) !== String(activeTemplateId)) {
      return;
    }
    if (viewTemplateDetailKey) {
      if (lastAppliedTemplateIdRef.current === viewTemplateDetailKey) {
        viewMenuPickForceApplyRef.current = false;
        return;
      }
    }
    const forceFromViewMenu = viewMenuPickForceApplyRef.current;
    viewMenuPickForceApplyRef.current = false;
    if (hasUserOverriddenTemplateFilters() && !forceFromViewMenu) {
      // Do not set lastAppliedTemplateIdRef — we did not apply; a later run or save flow may apply
      return;
    }
    lastAppliedTemplateIdRef.current = viewTemplateDetailKey;

    applyViewPayloadToState(
      normalizeViewTemplatePayload(selectedView),
    );
  }, [
    viewTemplateDetailKey,
    activeTemplateId,
    applyViewPayloadToState,
    hasUserOverriddenTemplateFilters,
  ]);

  const handleApplyView = (
    template,
    shouldPersist = true,
    { userPickedView = false } = {},
  ) => {
    if (userPickedView) {
      acknowledgeUserChoseNewTemplate();
      viewMenuPickForceApplyRef.current = true;
      // Reset so the getViewById follow-up is allowed to run (list payloads often
      // omit or shallow-copy filters; the detail response is the source of truth).
      lastAppliedTemplateIdRef.current = null;
      dispatch(clearSelectedView());
      // Best-effort UI while the detail request is in flight (if list has columns/filters).
      applyViewPayloadToState(template);
      // Do NOT set lastAppliedTemplateIdRef to the new id here — if we did, the
      // effect would hit lastApplied===id and skip applying selectedView from the API.
    }
    dispatch(setActiveTemplateId(template._id || null));

    // Update context persistence
    if (shouldPersist) {
      updateSelectedTemplate(targetTemplateType, template);
    }
  };

  /** Star sets this view as the default. It is not a toggle: the filled star is informational only. */
  const handleSetAsDefaultView = (id) => {
    dispatch(
      setDefaultGridTemplate({ id, isDefault: true, type: targetTemplateType }),
    )
      .unwrap()
      .then((result) => {
        const templatesData = result?.templates;
        MyAlert("success", "Success", "Default view set successfully");
        acknowledgeUserChoseNewTemplate();
        const t =
          templatesData?.userTemplates?.find(
            (x) => String(x._id) === String(id),
          ) ||
          (templatesData?.systemDefault &&
          String(templatesData.systemDefault._id) === String(id)
            ? templatesData.systemDefault
            : null);
        if (t) {
          updateSelectedTemplate(targetTemplateType, t);
        }
        dispatch(setActiveTemplateId(id));
        if (activePage === "Applications") {
          dispatch(
            getApplicationsWithFilter({
              templateId: id,
              page: 1,
              limit: 10,
            }),
          );
        } else if (isMembersTemplateType) {
          dispatch(
            getSubscriptionsWithTemplate({
              templateId: id,
              page: 1,
              limit: 10,
            }),
          );
        }
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

    const savedViewName = viewName.trim();
    setSaving(true);
    try {
      // 1. Gather and transform filters
      const activeFilters = transformFiltersForApi(
        filtersState,
        columns[tableColumnScreen] || [],
      );

      // 2. Gather visible columns
      const screenColumns = columns[tableColumnScreen] || [];
      const visibleColumns = screenColumns
        .filter((col) => col.isGride === true)
        .map((col) =>
          Array.isArray(col.dataIndex)
            ? col.dataIndex.join(".")
            : col.dataIndex,
        );

      // 3. Construct payload
      const payload = {
        name: savedViewName,
        templateType: targetTemplateType,
        filters: activeFilters,
        columns: visibleColumns,
        columnLabels: buildColumnLabelsMap(screenColumns),
        isDefault: false,
      };

      const token = localStorage.getItem("token");
      const API_URL = isMembersTemplateType
        ? getSubscriptionFilterTemplatesBaseUrl()
        : `${process.env.REACT_APP_PROFILE_SERVICE_URL}/templates`;

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      MyAlert("success", "Success", `View "${savedViewName}" saved successfully`);
      setIsModalVisible(false);
      setViewName("");

      // 1. Refresh the templates list first and WAIT for it
      const templatesResponse = await dispatch(
        getGridTemplates({ type: targetTemplateType }),
      ).unwrap();

      // 2. Find the newly saved template in the refreshed list
      const savedTemplate = templatesResponse.userTemplates?.find(
        (t) => t.name === savedViewName && isTemplateForCurrentType(t),
      );

      if (savedTemplate) {
        handleApplyView(savedTemplate, true, { userPickedView: true });
        // Re-apply from the template payload: getViewById effect can skip when
        // hasUserOverriddenTemplateFilters is still true, leaving the chip UI out of sync.
        const tFilters = transformFiltersForApply(savedTemplate.filters || {});
        const colScreen = tableColumnScreen;
        applyTemplate(
          colScreen,
          savedTemplate.columns || [],
          templatesResponse?.systemDefault?.columns || [],
          savedTemplate.columnLabels || {},
          templatesResponse?.systemDefault?.columnLabels || {},
        );
        applyTemplateFilters(tFilters);
        setActiveView(savedViewName);
        lastAppliedTemplateIdRef.current = keyForView(savedTemplate);
        dispatch(initializeWithTemplate(savedTemplate._id || ""));
        dispatch(resetScreenChanged({ screen: activePage }));
      }

      // 3. Refresh the grid data
      if (activePage === "Applications") {
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
      onClick={() => handleApplyView(template, true, { userPickedView: true })}
    >
      <span style={{ fontSize: 14, color: "#333" }}>{template.name}</span>
      <div
        style={{ display: "flex", gap: 12, alignItems: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        {isPinned ? (
          <StarFilled
            style={{ color: "#1890ff", fontSize: 16, cursor: "default" }}
            title="This is your default view. Star another view to change it."
            aria-label="This is your default view"
            role="img"
          />
        ) : (
          <StarOutlined
            style={{ color: "#555", fontSize: 16, cursor: "pointer" }}
            title="Set as default view"
            onClick={() => handleSetAsDefaultView(template._id)}
            aria-label="Set as default view"
            role="button"
          />
        )}
        {canEditGridTemplates && !template.systemDefault && (
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
        (() => {
          const userViews =
            templates?.userTemplates?.filter((t) =>
              isTemplateForCurrentType(t),
            ) || [];
          const hasUserDefault = userViews.some(
            (t) => t.isDefault === true || t.isDefault === "true",
          );
          /** Only one filled star: user default wins over system; first user default wins if API returns duplicates */
          const defaultUserTemplate = userViews.find(
            (t) => t.isDefault === true || t.isDefault === "true",
          );
          const isSystemDefaultPinned = !hasUserDefault;

          return (
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

              {templates?.systemDefault &&
                isTemplateForCurrentType(templates.systemDefault) &&
                renderTemplateItem(
                  templates.systemDefault,
                  isSystemDefaultPinned,
                )}

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

              {canEditGridTemplates && (
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
              )}

              {userViews.map((template) =>
                renderTemplateItem(
                  template,
                  !!(
                    defaultUserTemplate &&
                    String(template._id) ===
                      String(defaultUserTemplate._id)
                  ),
                ),
              )}
            </>
          );
        })()
      )}
    </div>
  );

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: "8px", ...style }}
    >
      <Dropdown
        key={templateListRenderKey}
        trigger={["click"]}
        placement="bottomLeft"
        open={menuOpen}
        onOpenChange={setMenuOpen}
        dropdownRender={() => menu}
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
