import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Empty,
  Row,
  Col,
  Tooltip,
  Dropdown,
  Input,
  DatePicker,
  Select,
  Checkbox,
  Tag,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  EllipsisOutlined,
  PlusOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserAddOutlined,
  DownOutlined,
  UpOutlined,
  PrinterOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "../../styles/CasesDetails.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import MySearchInput from "../../component/common/MySearchInput";
import MemberSearch from "../../component/profile/MemberSearch";
import { useTableColumns } from "../../context/TableColumnsContext ";
import {
  fetchActivities,
  createActivity,
  updateIssue,
  updateIssueStatus,
} from "../../services/issuesApi";
import {
  getIssueById,
  clearActiveIssue,
  setActivities,
} from "../../features/issues/issuesSlice";
import ComplaintFields from "../../component/cases/ComplaintFields";
import FtpFields from "../../component/cases/FtpFields";
import IrFields from "../../component/cases/IrFields";
import DataProtectionFields from "../../component/cases/DataProtectionFields";
import GroupPicker from "../../component/cases/GroupPicker";
import LinkedCasesPicker from "../../component/cases/LinkedCasesPicker";
import {
  ISSUE_STATUSES,
  ISSUE_SOURCES,
  ORIGINS,
  RESOLUTIONS,
  PRIORITIES,
  ISSUE_TYPE_LABELS,
  toFormValues,
  buildIssueUpdatePayload,
  buildIssueStatusPayload,
  enumLabel,
} from "../../component/cases/issueOptions";

const TYPE_FIELDS_COMPONENT = {
  COMPLAINT: ComplaintFields,
  FTP: FtpFields,
  IR: IrFields,
  DATA_PROTECTION: DataProtectionFields,
};

const ACTIVITY_TYPE_OPTIONS = [
  "EMAIL",
  "CALL",
  "LETTER",
  "TASK",
  "NOTE",
  "APPOINTMENT",
  "SMS",
  "SOCIAL_MEDIA_QUERY",
  "FAX",
  "ADVICE_GIVEN",
];

function formatDate(value, withTime = false) {
  if (!value) return "-";
  const d = dayjs(value);
  if (!d.isValid()) return "-";
  return d.format(withTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY");
}

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

// Function, not a static object - interactionDate must be "now" each time the form is
// reset (after posting), not frozen at module-load time.
function emptyActivityForm() {
  return {
    activityType: "NOTE",
    subject: "",
    body: "",
    interactionDate: dayjs(),
    pertinentToFileReview: false,
    // Default checked per the plan/backend model default (Activity.sendNotification
    // defaults true unless explicitly opted out).
    sendNotification: true,
  };
}

function CasesDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tableColumnsCtx = useTableColumns();

  // The Issues grid's "Issue" column link passes {issueId, recordName} via route state (see
  // context/TableColumnsContext .js's staticColumns.Issues render()), and the prev/next
  // arrows (same context file's profilNextBtnFtn/profilPrevBtnFtn, Issues-specific branch)
  // navigate the same way while also updating a ?issueId= query param so a refresh/direct
  // link still works - read state first, query param as the fallback, matching how
  // EventDetails.jsx / EventsSummary.js do it for /EventDetails.
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const issueId = location.state?.issueId || searchParams.get("issueId") || null;

  const { activeIssue, activities, loading } = useSelector((state) => state.issues);

  const [formValues, setFormValues] = useState({});
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [memberLabels, setMemberLabels] = useState({});
  const [memberBusy, setMemberBusy] = useState(false);

  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityForm, setActivityForm] = useState(emptyActivityForm);
  const [postingActivity, setPostingActivity] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState({
    Attachments: false,
    Activities: false,
    History: false,
  });
  const [descriptionCollapsed, setDescriptionCollapsed] = useState(false);

  const summaryRef = useRef(null);
  const typeFieldsRef = useRef(null);
  const notesRef = useRef(null);
  const attachmentsRef = useRef(null);
  const historyRef = useRef(null);

  const loadActivities = useCallback(
    (id) => {
      if (!id) return;
      setActivitiesLoading(true);
      fetchActivities(id)
        .then((data) => {
          dispatch(setActivities(Array.isArray(data) ? data : []));
        })
        .catch(() => {
          dispatch(setActivities([]));
        })
        .finally(() => setActivitiesLoading(false));
    },
    [dispatch],
  );

  // Re-load whenever issueId changes (direct nav, prev/next, or a fresh mount) - clear the
  // previous issue's data first so a stale record never flashes while the new one loads.
  useEffect(() => {
    if (!issueId) return;
    dispatch(clearActiveIssue());
    dispatch(getIssueById(issueId));
    loadActivities(issueId);
  }, [issueId, dispatch, loadActivities]);

  // Sync local editable form state whenever a (new) issue finishes loading.
  useEffect(() => {
    if (activeIssue && activeIssue._id === issueId) {
      setFormValues(toFormValues(activeIssue));
    }
  }, [activeIssue, issueId]);

  // Self-heal the breadcrumb (Breadcrumb.jsx reads location.state.caseId for /CasesDetails,
  // falling back to recordName) in case the referring page didn't already pass it, mirroring
  // EventDetails.jsx's identical self-heal effect for /EventDetails.
  useEffect(() => {
    if (!activeIssue || activeIssue._id !== issueId) return;
    const recordName = activeIssue.caseTitle || activeIssue.internalReferenceNumber;
    if (location.state?.recordName === recordName && location.state?.caseId === activeIssue.internalReferenceNumber) {
      return;
    }
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: {
          ...location.state,
          issueId,
          recordName,
          caseId: activeIssue.internalReferenceNumber,
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIssue, issueId]);

  // Keep the shared grid-navigation context (prev/next arrows in HeaderDetails.jsx) in sync
  // with whichever issue is currently open, so resolveGridNavigationIndex can find this row
  // inside whatever `gridData` the Issues grid last registered (see
  // TableColumnsContext .js's Issues-specific branch in profilNextBtnFtn/profilPrevBtnFtn).
  useEffect(() => {
    if (!activeIssue?._id || typeof tableColumnsCtx?.getProfile !== "function") return;
    tableColumnsCtx.getProfile(
      {
        issueId: activeIssue._id,
        key: activeIssue._id,
        caseTitle: activeIssue.caseTitle,
        internalReferenceNumber: activeIssue.internalReferenceNumber,
      },
      0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIssue?._id]);

  const handleFieldChange = useCallback((field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOwnerUserIdChange = useCallback((value) => {
    setFormValues((prev) => ({ ...prev, owner: { ...(prev.owner || {}), userId: value } }));
  }, []);

  const refreshIssue = useCallback(() => {
    if (issueId) dispatch(getIssueById(issueId));
  }, [issueId, dispatch]);

  const handleSaveGeneral = async () => {
    if (!issueId || !activeIssue) return;
    setSavingGeneral(true);
    try {
      const payload = buildIssueUpdatePayload(formValues, activeIssue.issueType);
      await updateIssue(issueId, payload);
      message.success("Issue updated");
      refreshIssue();
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save issue",
      );
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!issueId) return;
    setSavingStatus(true);
    try {
      const payload = buildIssueStatusPayload(formValues);
      await updateIssueStatus(issueId, payload);
      message.success("Status updated");
      refreshIssue();
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update status",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  // Member linking - replaces the old fake hardcoded multi-select with the generic,
  // reusable MemberSearch component. Persists immediately (rather than waiting for the
  // general Save button) so the link survives even if the user navigates away without
  // clicking Save, per the task's "must actually persist" requirement.
  const memberIds = Array.isArray(formValues.memberIds) ? formValues.memberIds : [];

  const persistMemberIds = async (nextIds) => {
    if (!issueId) return;
    setMemberBusy(true);
    try {
      await updateIssue(issueId, { memberIds: nextIds });
      setFormValues((prev) => ({ ...prev, memberIds: nextIds }));
      message.success("Member linked members updated");
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update linked members",
      );
    } finally {
      setMemberBusy(false);
    }
  };

  const handleAddMember = async (memberData) => {
    const id = memberData?._id;
    if (!id || memberIds.includes(id)) return;
    setMemberLabels((prev) => ({
      ...prev,
      [id]: `${memberData?.personalInfo?.forename || ""} ${memberData?.personalInfo?.surname || ""}`.trim() ||
        memberData?.membershipNumber ||
        id,
    }));
    await persistMemberIds([...memberIds, id]);
  };

  const handleRemoveMember = (id) => {
    persistMemberIds(memberIds.filter((m) => m !== id));
  };

  // Group linking (profile-service's Group feature, GroupPicker.jsx) - persists immediately
  // on select/create/clear, same "must survive navigating away without Save" reasoning as
  // persistMemberIds above. Suppressed in the sidebar for IR Group/National cases, where
  // IrFields.jsx already renders this same control prominently (Case Type-driven "Members:
  // Grid of contacts" requirement) bound to the same formValues.groupId - see IrFields.jsx's
  // header comment.
  const [groupBusy, setGroupBusy] = useState(false);
  const isIrGroupCase =
    activeIssue?.issueType === "IR" &&
    (formValues.caseType === "GROUP" || formValues.caseType === "NATIONAL");

  const persistGroupId = async (nextGroupId) => {
    if (!issueId) return;
    setGroupBusy(true);
    try {
      await updateIssue(issueId, { groupId: nextGroupId });
      setFormValues((prev) => ({ ...prev, groupId: nextGroupId }));
      message.success(nextGroupId ? "Group linked" : "Group unlinked");
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update linked group",
      );
    } finally {
      setGroupBusy(false);
    }
  };

  // Linked Cases (common field across all 4 issue types) - persists immediately via
  // updateIssue, same pattern as member/group linking above.
  const [linkedCasesBusy, setLinkedCasesBusy] = useState(false);
  const linkedIssueIds = Array.isArray(formValues.linkedIssueIds) ? formValues.linkedIssueIds : [];

  const persistLinkedIssueIds = async (nextIds) => {
    if (!issueId) return;
    setLinkedCasesBusy(true);
    try {
      await updateIssue(issueId, { linkedIssueIds: nextIds });
      setFormValues((prev) => ({ ...prev, linkedIssueIds: nextIds }));
      message.success("Linked cases updated");
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update linked cases",
      );
    } finally {
      setLinkedCasesBusy(false);
    }
  };

  const handleAddLinkedIssue = (id) => {
    if (!id || linkedIssueIds.includes(id)) return;
    persistLinkedIssueIds([...linkedIssueIds, id]);
  };

  const handleRemoveLinkedIssue = (id) => {
    persistLinkedIssueIds(linkedIssueIds.filter((x) => x !== id));
  };

  // Activities
  const handleActivityFieldChange = (field, value) => {
    setActivityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostActivity = async () => {
    if (!issueId) return;
    if (!activityForm.activityType) {
      message.error("Activity type is required");
      return;
    }
    setPostingActivity(true);
    try {
      await createActivity(issueId, {
        activityType: activityForm.activityType,
        subject: activityForm.subject || null,
        body: activityForm.body || null,
        interactionDate: activityForm.interactionDate
          ? activityForm.interactionDate.toISOString()
          : new Date().toISOString(),
        pertinentToFileReview: !!activityForm.pertinentToFileReview,
        sendNotification: activityForm.sendNotification !== false,
      });
      message.success("Activity logged");
      setActivityForm(emptyActivityForm());
      loadActivities(issueId);
      refreshIssue();
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to log activity",
      );
    } finally {
      setPostingActivity(false);
    }
  };

  const allSectionsCollapsed =
    descriptionCollapsed &&
    collapsedSections.Attachments &&
    collapsedSections.Activities &&
    collapsedSections.History;

  const handleCollapseExpandToggle = () => {
    if (allSectionsCollapsed) {
      setDescriptionCollapsed(false);
      setCollapsedSections({ Attachments: false, Activities: false, History: false });
    } else {
      setDescriptionCollapsed(true);
      setCollapsedSections({ Attachments: true, Activities: true, History: true });
    }
  };

  const toggleSection = (sectionName) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handlePrint = () => window.print();

  // ---- Attachments: purely presentational mock, no issue-service backend counterpart
  // (issue-service has no attachments endpoints) - left as-is per the task's scope, not
  // wired to any real data and not removed.
  const attachmentsData = [
    {
      name: "Case_Summary_V2.pdf",
      date: "Oct 24, 2023",
      time: "10:30 AM",
      modifiedBy: "J. DOE",
      type: "pdf",
      icon: <FileTextOutlined style={{ color: "#ff4d4f" }} />,
    },
    {
      name: "Internal_Review_Notes.docx",
      date: "Oct 19, 2023",
      time: "04:20 PM",
      modifiedBy: "M. LEGAL",
      type: "doc",
      icon: <FileTextOutlined style={{ color: "var(--app-brand-accent)" }} />,
    },
  ];

  const handleUploadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {};
    input.click();
  };
  const handleDownloadFile = (file) => {
    const blob = new Blob([`Placeholder content for ${file.name}`], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleViewFile = (file) => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(
        `<html><body style="font-family:sans-serif;padding:24px"><h2>${file.name}</h2><p>Preview not available for this file type.</p></body></html>`,
      );
    }
  };
  const handleDownloadAll = () => {
    attachmentsData.forEach((file, i) => setTimeout(() => handleDownloadFile(file), i * 200));
  };

  const renderAttachments = () => (
    <div className="attachments-tab-content">
      <div className="attachments-icons-grid">
        {attachmentsData.map((file, index) => (
          <div key={index} className="attachment-icon-item" title={file.name}>
            <div className={`file-type-icon ${file.type}`}>{file.icon}</div>
            <div className="file-name-tooltip">{file.name}</div>
            <div className="file-upload-date">
              {file.date} {file.time}
            </div>
            <div className="attachment-item-actions">
              <Tooltip title="View">
                <span
                  className="attachment-action-btn"
                  onClick={() => handleViewFile(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleViewFile(file)}
                >
                  <EyeOutlined />
                </span>
              </Tooltip>
              <Tooltip title="Download">
                <span
                  className="attachment-action-btn"
                  onClick={() => handleDownloadFile(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleDownloadFile(file)}
                >
                  <DownloadOutlined />
                </span>
              </Tooltip>
            </div>
          </div>
        ))}
        <div className="attachment-icon-item upload-icon-item" onClick={handleUploadFile}>
          <Avatar
            className="upload-new-avatar"
            icon={<PlusOutlined />}
            style={{ backgroundColor: "var(--primary-blue)", cursor: "pointer" }}
          />
          <div className="file-name-tooltip">Upload New</div>
        </div>
      </div>
    </div>
  );

  // ---- History timeline: purely presentational mock, no issue-service backend counterpart
  // either (no audit/history-timeline endpoint on this service) - left as-is per the task's
  // scope. audit-service does receive issues.issue.audit.v1 events, but exposing a grid over
  // that is out of scope here (see TEMPLATE_IMPLEMENTATION_PLAYBOOK.md's note that
  // audit-service has no Template/grid support yet for any service).
  const historyData = [
    {
      actor: { name: "System", title: "STATUS CHANGE" },
      time: "-",
      label: "Issue created",
    },
  ];

  const renderHistory = () => (
    <div className="history-tab-content">
      <div className="history-header">
        <div className="history-search-wrapper">
          <MySearchInput placeholder="Search by actor or field..." />
        </div>
      </div>
      <div className="history-timeline">
        {historyData.map((item, index) => (
          <div key={index} className="history-card">
            <div className="history-card-header">
              <div className="actor-info">
                <Avatar icon={<UserAddOutlined />} />
                <div className="actor-text">
                  <h4>{item.actor.name}</h4>
                  <span className="actor-title">{item.actor.title}</span>
                </div>
              </div>
              <span className="time-stamp">{item.time}</span>
            </div>
            <div className="history-card-body">
              <p className="change-label">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivities = () => (
    <div className="issue-notes-container" style={{ padding: 0 }}>
      <div
        className="add-note-section"
        style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}
      >
        <Avatar icon={<UserAddOutlined />} />
        <div style={{ flex: 1 }}>
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={8}>
              <Select
                value={activityForm.activityType}
                onChange={(v) => handleActivityFieldChange("activityType", v)}
                style={{ width: "100%" }}
                options={ACTIVITY_TYPE_OPTIONS.map((v) => ({ value: v, label: enumLabel(v) }))}
              />
            </Col>
            <Col span={8}>
              <DatePicker
                value={activityForm.interactionDate}
                onChange={(d) => handleActivityFieldChange("interactionDate", d)}
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                showTime
              />
            </Col>
            <Col span={8}>
              <Input
                placeholder="Subject"
                value={activityForm.subject}
                onChange={(e) => handleActivityFieldChange("subject", e.target.value)}
              />
            </Col>
          </Row>
          <div className="rich-text-editor-wrapper" style={{ marginBottom: 12 }}>
            <ReactQuill
              theme="snow"
              value={activityForm.body}
              onChange={(v) => handleActivityFieldChange("body", v)}
              placeholder="Add activity details..."
              modules={{
                toolbar: [
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"],
                ],
              }}
            />
          </div>
          <Row style={{ marginBottom: 12 }} align="middle">
            <Col span={12}>
              <Checkbox
                checked={activityForm.pertinentToFileReview}
                onChange={(e) =>
                  handleActivityFieldChange("pertinentToFileReview", e.target.checked)
                }
              >
                Pertinent to File Review
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox
                checked={activityForm.sendNotification}
                onChange={(e) => handleActivityFieldChange("sendNotification", e.target.checked)}
              >
                Notify owner
              </Checkbox>
            </Col>
          </Row>
          <button
            className="custom-action-btn custom-primary-btn"
            onClick={handlePostActivity}
            disabled={postingActivity}
          >
            {postingActivity ? "Logging..." : "Log Activity"}
          </button>
        </div>
      </div>

      <div className="notes-list" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {activitiesLoading && <Spin size="small" />}
        {!activitiesLoading && activities.length === 0 && (
          <div style={{ color: "var(--theme-text-muted)" }}>No activities logged yet.</div>
        )}
        {activities.map((activity) => (
          <div key={activity._id} className="note-item" style={{ display: "flex", gap: 16 }}>
            <Avatar icon={<UserAddOutlined />} />
            <div className="note-content" style={{ flex: 1 }}>
              <div
                className="note-header"
                style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {enumLabel(activity.activityType)}
                  {activity.subject ? ` — ${activity.subject}` : ""}
                  {activity.pertinentToFileReview && (
                    <Tag color="gold" style={{ marginLeft: 8 }}>
                      File Review
                    </Tag>
                  )}
                </span>
                <span style={{ color: "#bfbfbf", fontSize: 12 }}>
                  {formatDate(activity.interactionDate, true)}
                </span>
              </div>
              {activity.body && (
                <div
                  className="note-text"
                  style={{
                    background: "#f8faff",
                    padding: 12,
                    borderRadius: 8,
                    color: "var(--theme-text-muted)",
                    fontSize: 14,
                  }}
                  dangerouslySetInnerHTML={{ __html: activity.body }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="summary-content">
      <div className="summary-title-description-full">
        <div className="summary-title-row">
          <div className="summary-title-wrapper">
            <h2 className="summary-title">
              {activeIssue?.caseTitle || activeIssue?.internalReferenceNumber || "-"}
            </h2>
          </div>
          <div className="summary-title-actions">
            <Button
              type="link"
              onClick={handleCollapseExpandToggle}
              className="summary-expand-collapse-btn"
            >
              {allSectionsCollapsed ? "Expand all" : "Collapse all"}
            </Button>
          </div>
        </div>

        <div className="description-section">
          <div className="section-header-collapsible">
            <h3>
              Description
              {descriptionCollapsed && (
                <span className="section-preview-inline">
                  {" "}
                  — {stripHtml(formValues.description).slice(0, 120)}
                </span>
              )}
            </h3>
            <div className="section-header-actions">
              <span
                className="section-toggle-btn"
                onClick={() => setDescriptionCollapsed((c) => !c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setDescriptionCollapsed((c) => !c)}
              >
                {descriptionCollapsed ? <DownOutlined /> : <UpOutlined />}
              </span>
            </div>
          </div>
          {!descriptionCollapsed && (
            <Input.TextArea
              value={formValues.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              autoSize={{ minRows: 3, maxRows: 8 }}
              placeholder="Description of the issue..."
            />
          )}
        </div>
      </div>
    </div>
  );

  if (!issueId) {
    return (
      <div className="cases-details-container">
        <Empty description="No issue selected" style={{ marginTop: 80 }} />
      </div>
    );
  }

  if ((loading || !activeIssue) && activeIssue?._id !== issueId) {
    return (
      <div className="cases-details-container" style={{ padding: 60, textAlign: "center" }}>
        <Spin tip="Loading issue..." />
      </div>
    );
  }

  const TypeFieldsComponent = TYPE_FIELDS_COMPONENT[activeIssue.issueType];

  return (
    <div className="cases-details-container">
      <div className="cases-content-body">
        <div className="sections-wrapper">
          <div className="main-content-layout">
            <div className="left-column-sections">
              <div className="section-container" ref={summaryRef}>
                <div className="summary-wrapper">{renderSummary()}</div>
              </div>

              {TypeFieldsComponent && (
                <div className="section-container" ref={typeFieldsRef}>
                  <TypeFieldsComponent
                    values={formValues}
                    onChange={handleFieldChange}
                  />
                </div>
              )}

              <div className="section-container" ref={attachmentsRef}>
                <div className="section-header-collapsible">
                  <h3>
                    Attachments
                    {collapsedSections.Attachments && attachmentsData.length > 0 && (
                      <span className="section-count"> ({attachmentsData.length} documents)</span>
                    )}
                  </h3>
                  <div className="section-header-actions">
                    <Tooltip title="Download all">
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadAll}
                        size="small"
                      />
                    </Tooltip>
                    <span
                      className="section-toggle-btn"
                      onClick={() => toggleSection("Attachments")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && toggleSection("Attachments")}
                    >
                      {collapsedSections.Attachments ? <DownOutlined /> : <UpOutlined />}
                    </span>
                  </div>
                </div>
                {!collapsedSections.Attachments && renderAttachments()}
              </div>

              <div className="section-container" ref={notesRef}>
                <div className="section-header-collapsible">
                  <h3>
                    Activities
                    {collapsedSections.Activities && activities.length > 0 && (
                      <span className="section-count"> ({activities.length})</span>
                    )}
                  </h3>
                  <div className="section-header-actions">
                    <span
                      className="section-toggle-btn"
                      onClick={() => toggleSection("Activities")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && toggleSection("Activities")}
                    >
                      {collapsedSections.Activities ? <DownOutlined /> : <UpOutlined />}
                    </span>
                  </div>
                </div>
                {!collapsedSections.Activities && renderActivities()}
              </div>

              <div className="section-container" ref={historyRef}>
                <div className="section-header-collapsible">
                  <h3>History</h3>
                  <div className="section-header-actions">
                    <span
                      className="section-toggle-btn"
                      onClick={() => toggleSection("History")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && toggleSection("History")}
                    >
                      {collapsedSections.History ? <DownOutlined /> : <UpOutlined />}
                    </span>
                  </div>
                </div>
                {!collapsedSections.History && renderHistory()}
              </div>
            </div>

            <div className="right-column-panels">
              <div className="section-container issue-details-section">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <h3 className="section-title-static" style={{ margin: 0 }}>
                    Issue Details
                  </h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SaveOutlined />}
                      loading={savingGeneral}
                      onClick={handleSaveGeneral}
                    >
                      Save
                    </Button>
                    <Dropdown
                      menu={{
                        items: [{ key: "print", icon: <PrinterOutlined />, label: "Print", onClick: handlePrint }],
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <span className="issue-details-actions-trigger">
                        <EllipsisOutlined />
                      </span>
                    </Dropdown>
                  </div>
                </div>

                <div className="summary-right-column-sticky">
                  <div className="summary-field-single">
                    <span className="summary-label">Internal Reference No</span>
                    <Input value={activeIssue.internalReferenceNumber || "-"} bordered={false} disabled />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Created By / On</span>
                    <Input
                      value={`${activeIssue.createdBy || "-"} · ${formatDate(activeIssue.createdOn, true)}`}
                      bordered={false}
                      disabled
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Date Received</span>
                    <DatePicker
                      value={formValues.dateReceived}
                      onChange={(d) => handleFieldChange("dateReceived", d)}
                      format="DD/MM/YYYY"
                      bordered={false}
                      allowClear
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Issue Source</span>
                    <Select
                      value={formValues.issueSource || undefined}
                      onChange={(v) => handleFieldChange("issueSource", v)}
                      className="summary-input"
                      bordered={false}
                      placeholder="Select source"
                      allowClear
                      options={ISSUE_SOURCES.map((v) => ({ value: v, label: enumLabel(v) }))}
                    />
                  </div>
                  {formValues.issueSource === "OTHER" && (
                    <div className="summary-field-single">
                      <span className="summary-label">Issue Source (Other)</span>
                      <Input
                        value={formValues.issueSourceOther || ""}
                        onChange={(e) => handleFieldChange("issueSourceOther", e.target.value)}
                        className="summary-input"
                        bordered={false}
                      />
                    </div>
                  )}

                  <div className="summary-field-single">
                    <span className="summary-label">Origin</span>
                    <Select
                      value={formValues.origin || undefined}
                      onChange={(v) => handleFieldChange("origin", v)}
                      className="summary-input"
                      bordered={false}
                      placeholder="Select origin"
                      allowClear
                      options={ORIGINS.map((v) => ({ value: v, label: enumLabel(v) }))}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Priority</span>
                    <Select
                      value={formValues.priority || "MEDIUM"}
                      onChange={(v) => handleFieldChange("priority", v)}
                      className="summary-input"
                      bordered={false}
                      options={PRIORITIES.map((v) => ({ value: v, label: enumLabel(v) }))}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Owner Team</span>
                    <Input value={enumLabel(activeIssue.owner?.team) || "-"} bordered={false} disabled />
                  </div>
                  <div className="summary-field-single">
                    <span className="summary-label">Owner (User Id)</span>
                    <Input
                      value={formValues.owner?.userId || ""}
                      onChange={(e) => handleOwnerUserIdChange(e.target.value)}
                      className="summary-input"
                      bordered={false}
                      placeholder="userId"
                    />
                  </div>

                  <div
                    className="summary-field-single"
                    style={{ flexDirection: "column", alignItems: "stretch" }}
                  >
                    <span className="summary-label">Linked Cases</span>
                    <LinkedCasesPicker
                      issueId={issueId}
                      linkedIssueIds={linkedIssueIds}
                      onAdd={handleAddLinkedIssue}
                      onRemove={handleRemoveLinkedIssue}
                      disabled={linkedCasesBusy}
                    />
                  </div>

                  <div
                    className="summary-field-single"
                    style={{ flexDirection: "column", alignItems: "stretch" }}
                  >
                    <span className="summary-label">Linked Group</span>
                    {isIrGroupCase ? (
                      <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>
                        Managed in the Industrial Relations Details section (Case Type ={" "}
                        {formValues.caseType === "NATIONAL" ? "National" : "Group"}).
                      </span>
                    ) : (
                      <GroupPicker
                        value={formValues.groupId || null}
                        onChange={(groupId) => persistGroupId(groupId)}
                        disabled={groupBusy}
                      />
                    )}
                  </div>

                  <div
                    className="summary-field-single"
                    style={{ borderTop: "1px solid var(--theme-border-color, #eee)", paddingTop: 12, marginTop: 8 }}
                  >
                    <span className="summary-label" style={{ fontWeight: 600 }}>
                      Status &amp; Resolution
                    </span>
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Issue Status</span>
                    <Select
                      value={formValues.issueStatus || "ACTIVE"}
                      onChange={(v) => handleFieldChange("issueStatus", v)}
                      className="summary-input"
                      bordered={false}
                      options={ISSUE_STATUSES.map((v) => ({ value: v, label: enumLabel(v) }))}
                    />
                  </div>
                  {formValues.issueStatus === "OTHER" && (
                    <div className="summary-field-single">
                      <span className="summary-label">Issue Status (Other)</span>
                      <Input
                        value={formValues.issueStatusOther || ""}
                        onChange={(e) => handleFieldChange("issueStatusOther", e.target.value)}
                        className="summary-input"
                        bordered={false}
                      />
                    </div>
                  )}

                  <div className="summary-field-single">
                    <span className="summary-label">Resolution</span>
                    <Select
                      value={formValues.resolution || undefined}
                      onChange={(v) => handleFieldChange("resolution", v)}
                      className="summary-input"
                      bordered={false}
                      placeholder="Select resolution"
                      allowClear
                      options={RESOLUTIONS.map((v) => ({ value: v, label: enumLabel(v) }))}
                    />
                  </div>
                  {formValues.resolution === "OTHER" && (
                    <div className="summary-field-single">
                      <span className="summary-label">Resolution (Other)</span>
                      <Input
                        value={formValues.resolutionOther || ""}
                        onChange={(e) => handleFieldChange("resolutionOther", e.target.value)}
                        className="summary-input"
                        bordered={false}
                      />
                    </div>
                  )}

                  <div className="summary-field-single">
                    <span className="summary-label">Date Resolved</span>
                    <DatePicker
                      value={formValues.dateResolved}
                      onChange={(d) => handleFieldChange("dateResolved", d)}
                      format="DD/MM/YYYY"
                      bordered={false}
                      allowClear
                    />
                  </div>

                  <div style={{ marginLeft: "auto", marginTop: 4 }}>
                    <Button size="small" loading={savingStatus} onClick={handleUpdateStatus}>
                      Update Status
                    </Button>
                  </div>

                  <div
                    className="summary-field-single"
                    style={{ borderTop: "1px solid var(--theme-border-color, #eee)", paddingTop: 12, marginTop: 8, flexDirection: "column", alignItems: "stretch" }}
                  >
                    <span className="summary-label">Related Member(s)</span>
                    <MemberSearch
                      onSelectBehavior="callback"
                      onSelectCallback={handleAddMember}
                      fullWidth
                      compact
                      showStatus={false}
                      disable={memberBusy}
                    />
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {memberIds.length === 0 && (
                        <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>
                          No members linked.
                        </span>
                      )}
                      {memberIds.map((id) => (
                        <Tag
                          key={id}
                          closable
                          onClose={() => handleRemoveMember(id)}
                          closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                        >
                          {memberLabels[id] || id}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only content */}
      <div className="issue-print-area" aria-hidden="true">
        <div className="issue-print-header">
          <div className="issue-print-id">
            {ISSUE_TYPE_LABELS[activeIssue.issueType] || activeIssue.issueType}: {activeIssue.internalReferenceNumber}
          </div>
          <h1 className="issue-print-title">{activeIssue.caseTitle}</h1>
        </div>
        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Issue Details</h2>
          <div className="issue-print-details-grid">
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Status</span>
              <span className="issue-print-value">{enumLabel(activeIssue.issueStatus)}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Priority</span>
              <span className="issue-print-value">{enumLabel(activeIssue.priority)}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Date Received</span>
              <span className="issue-print-value">{formatDate(activeIssue.dateReceived)}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Date Resolved</span>
              <span className="issue-print-value">{formatDate(activeIssue.dateResolved)}</span>
            </div>
          </div>
        </section>
        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Description</h2>
          <div className="issue-print-description">{activeIssue.description}</div>
        </section>
        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Activity Log</h2>
          <div className="issue-print-comments">
            {activities.map((activity) => (
              <div key={activity._id} className="issue-print-comment">
                <div className="issue-print-comment-header">
                  <strong>{enumLabel(activity.activityType)}</strong>
                  <span className="issue-print-comment-time">
                    {formatDate(activity.interactionDate, true)}
                  </span>
                </div>
                {activity.body && (
                  <div
                    className="issue-print-comment-text"
                    dangerouslySetInnerHTML={{ __html: activity.body }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CasesDetails;
