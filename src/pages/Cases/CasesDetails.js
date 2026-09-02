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
  fetchIssueAttachments,
  uploadIssueAttachment,
  getAttachmentDownloadUrl,
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
  useIssueStatusOptions,
  useIssueDropdownLookups,
  useResolutionOptions,
} from "../../hooks/useIssueLookups";
import { useTeamUserOptions } from "../../hooks/useTeamUsers";
import {
  ISSUE_TYPE_LABELS,
  ISSUE_TYPE_TO_TEAM_RESOURCE,
  toFormValues,
  buildIssueUpdatePayload,
  buildIssueStatusPayload,
  enumLabel,
} from "../../component/cases/issueOptions";
import { fetchProfilesBatchLookup } from "../../services/profileSearchApi";

const TYPE_FIELDS_COMPONENT = {
  COMPLAINT: ComplaintFields,
  FTP: FtpFields,
  IR: IrFields,
  DP: DataProtectionFields,
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
    // Default unchecked, matching Activity.visibleToMember's schema default (false) - an
    // internal note/call stays internal unless a staffer explicitly opts it into the
    // member's portal activity view (controllers/issuePortal.controller.js's
    // portalListMyIssueActivities only returns visibleToMember:true entries).
    visibleToMember: false,
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

  // Issue Status/Resolution options are scoped to the case's (fixed, non-editable-post-create)
  // Issue Type - see hooks/useIssueLookups.js.
  const { options: issueStatusOptions } = useIssueStatusOptions(activeIssue?.issueType);
  const { options: resolutionOptions } = useResolutionOptions(activeIssue?.issueType);
  const { options: ownerOptions } = useTeamUserOptions(
    ISSUE_TYPE_TO_TEAM_RESOURCE[activeIssue?.issueType],
  );
  const {
    originOptions,
    issueSourceOptions,
    priorityOptions,
    complaintTypeOptions,
    criteriaLetterStatusOptions,
    legislationOptions,
    caseTypeOptions,
  } = useIssueDropdownLookups();

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

  const memberDisplayLabel = (memberData) =>
    `${memberData?.personalInfo?.forename || ""} ${memberData?.personalInfo?.surname || ""}`.trim() ||
    memberData?.membershipNumber ||
    memberData?._id;

  const handleAddMember = async (memberData) => {
    const id = memberData?._id;
    if (!id || memberIds.includes(id)) return;
    setMemberLabels((prev) => ({ ...prev, [id]: memberDisplayLabel(memberData) }));
    await persistMemberIds([...memberIds, id]);
  };

  // Complaint Type "Member On Member" only - moves the selected complainant to memberIds[0]
  // specifically rather than just appending, since the backend derives the auto-generated
  // complainant label from memberIds[0] (issue-service's assignAutoTitles/resolveContactName).
  // Same persistImmediately behavior as handleAddMember - also satisfies "auto-added as a
  // Related Member" since memberIds is the same array Related Member(s) renders below.
  const handleSelectComplainant = async (memberData) => {
    const id = memberData?._id;
    if (!id) return;
    setMemberLabels((prev) => ({ ...prev, [id]: memberDisplayLabel(memberData) }));
    await persistMemberIds([id, ...memberIds.filter((m) => m !== id)]);
  };

  // Complaint Type "Member On Member" only - the person the complaint is *about*.
  // issue-service never auto-matches this when the complaint comes in via the member
  // portal (see controllers/issuePortal.controller.js#requireRelatedMemberDescription) - it
  // only stores the free-text name the member typed in respondents[0].name. A CRM staffer
  // searches for and attaches the real profile here, which lands at memberIds[1]
  // specifically (memberIds[0] stays the complainant) - keeps the two roles from
  // colliding if a staffer links them in either order.
  const handleSelectRelatedMember = async (memberData) => {
    const id = memberData?._id;
    if (!id) return;
    setMemberLabels((prev) => ({ ...prev, [id]: memberDisplayLabel(memberData) }));
    const withoutId = memberIds.filter((m) => m !== id);
    const next = withoutId.length > 0 ? [withoutId[0], id, ...withoutId.slice(1)] : [id];
    await persistMemberIds(next);
  };

  const handleRemoveMember = (id) => {
    persistMemberIds(memberIds.filter((m) => m !== id));
  };

  // Hydrate memberLabels for memberIds the page loaded with (e.g. a portal-submitted
  // complaint's complainant, or any pre-existing linked member) - memberLabels otherwise
  // only gets populated in-session via handleAddMember/handleSelectComplainant/
  // handleSelectRelatedMember, so a freshly-opened case would show raw profile ids in the
  // "Related Member(s)" tags and the Complainant/Related Member fields above until someone
  // happened to re-search the same person this session.
  useEffect(() => {
    const unresolved = memberIds.filter((id) => id && !memberLabels[id]);
    if (unresolved.length === 0) return;
    let cancelled = false;
    fetchProfilesBatchLookup(unresolved)
      .then((profiles) => {
        if (cancelled || !Array.isArray(profiles) || profiles.length === 0) return;
        setMemberLabels((prev) => {
          const next = { ...prev };
          profiles.forEach((profile) => {
            const id = String(profile?._id || "");
            if (!id) return;
            next[id] =
              profile?.personalInfo?.fullName ||
              memberDisplayLabel(profile) ||
              id;
          });
          return next;
        });
      })
      .catch(() => {
        // Best-effort - a lookup failure just leaves those tags showing raw ids, same as
        // today's behavior, rather than blocking the page.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberIds.join(",")]);

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

  // Mirrors issue-service's server-side rule (controllers/issueActivity.controller.js's
  // assertIssueNotClosed / issuePortal.controller.js's portalAddIssueComment) - a closed
  // issue is done, so neither activities nor attachments should be addable to it. This is
  // the UX-side guard (disable the controls); the backend still enforces it independently.
  const isIssueClosed = formValues.issueStatus === "CLOSED";

  const handlePostActivity = async () => {
    if (!issueId) return;
    if (isIssueClosed) {
      message.error("Cannot add an activity to a closed issue");
      return;
    }
    if (!activityForm.activityType) {
      message.error("Activity type is required");
      return;
    }
    // ReactQuill's empty state is HTML like "<p><br></p>", not "" - stripHtml (already used
    // elsewhere in this file for displaying logged activities) extracts the actual text so
    // whitespace-only/formatting-only input doesn't slip past as "has content".
    if (!stripHtml(activityForm.body)) {
      message.error("Activity text is required");
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
        visibleToMember: !!activityForm.visibleToMember,
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

  // ---- Attachments: real data, backed by issue-service's
  // GET/POST /issues/:id/attachments (issueActivity.controller.js's listIssueAttachments/
  // uploadIssueAttachment) - each entry stores an {activityId, index} pair since attachments
  // live on an Activity, not a separate Issue-level document model (see that controller's
  // doc comment for why).
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const loadAttachments = useCallback(async () => {
    if (!issueId) return;
    setAttachmentsLoading(true);
    try {
      const data = await fetchIssueAttachments(issueId);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (error) {
      // Best-effort - a listing failure shouldn't block the rest of the page.
      setAttachments([]);
    } finally {
      setAttachmentsLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleUploadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.webp";
    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      setUploadingAttachment(true);
      try {
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          await uploadIssueAttachment(issueId, file);
        }
        message.success(files.length > 1 ? "Files uploaded" : "File uploaded");
        loadAttachments();
      } catch (error) {
        message.error(
          error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to upload attachment",
        );
      } finally {
        setUploadingAttachment(false);
      }
    };
    input.click();
  };

  const openAttachment = async (file) => {
    try {
      const { url } = await getAttachmentDownloadUrl(file.activityId, file.index);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to open attachment",
      );
    }
  };

  const handleDownloadAll = () => {
    attachments.forEach((file, i) => setTimeout(() => openAttachment(file), i * 200));
  };

  const fileIconFor = (filename = "") => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileTextOutlined style={{ color: "#ff4d4f" }} />;
    if (["doc", "docx"].includes(ext)) {
      return <FileTextOutlined style={{ color: "var(--app-brand-accent)" }} />;
    }
    return <FileTextOutlined style={{ color: "var(--theme-text-muted, #8c8c8c)" }} />;
  };

  const renderAttachments = () => (
    <div className="attachments-tab-content">
      <div className="attachments-icons-grid">
        {attachmentsLoading && (
          <div style={{ color: "var(--theme-text-muted)", fontSize: 13, padding: "8px 0" }}>
            Loading attachments...
          </div>
        )}
        {!attachmentsLoading && attachments.length === 0 && (
          <div style={{ color: "var(--theme-text-muted)", fontSize: 13, padding: "8px 0" }}>
            No attachments yet.
          </div>
        )}
        {attachments.map((file) => (
          <div
            key={`${file.activityId}-${file.index}`}
            className="attachment-icon-item"
            title={file.filename}
          >
            <div className="file-type-icon">{fileIconFor(file.filename)}</div>
            <div className="file-name-tooltip">{file.filename}</div>
            <div className="file-upload-date">{formatDate(file.uploadedAt, true)}</div>
            <div className="attachment-item-actions">
              <Tooltip title="View">
                <span
                  className="attachment-action-btn"
                  onClick={() => openAttachment(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openAttachment(file)}
                >
                  <EyeOutlined />
                </span>
              </Tooltip>
              <Tooltip title="Download">
                <span
                  className="attachment-action-btn"
                  onClick={() => openAttachment(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openAttachment(file)}
                >
                  <DownloadOutlined />
                </span>
              </Tooltip>
            </div>
          </div>
        ))}
        {!isIssueClosed && (
          <div
            className="attachment-icon-item upload-icon-item"
            onClick={uploadingAttachment ? undefined : handleUploadFile}
          >
            <Avatar
              className="upload-new-avatar"
              icon={<PlusOutlined />}
              style={{ backgroundColor: "var(--primary-blue)", cursor: uploadingAttachment ? "wait" : "pointer" }}
            />
            <div className="file-name-tooltip">{uploadingAttachment ? "Uploading..." : "Upload New"}</div>
          </div>
        )}
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
          {isIssueClosed && (
            <div style={{ marginBottom: 12, color: "var(--theme-text-muted)", fontSize: 13 }}>
              This issue is closed - activities can no longer be added.
            </div>
          )}
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={8}>
              <Select
                value={activityForm.activityType}
                onChange={(v) => handleActivityFieldChange("activityType", v)}
                style={{ width: "100%" }}
                options={ACTIVITY_TYPE_OPTIONS.map((v) => ({ value: v, label: enumLabel(v) }))}
                disabled={isIssueClosed}
              />
            </Col>
            <Col span={8}>
              <DatePicker
                value={activityForm.interactionDate}
                onChange={(d) => handleActivityFieldChange("interactionDate", d)}
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                showTime
                disabled={isIssueClosed}
              />
            </Col>
            <Col span={8}>
              <Input
                placeholder="Subject"
                value={activityForm.subject}
                onChange={(e) => handleActivityFieldChange("subject", e.target.value)}
                disabled={isIssueClosed}
              />
            </Col>
          </Row>
          <div className="rich-text-editor-wrapper" style={{ marginBottom: 12 }}>
            <ReactQuill
              theme="snow"
              value={activityForm.body}
              onChange={(v) => handleActivityFieldChange("body", v)}
              placeholder="Add activity details..."
              readOnly={isIssueClosed}
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
            <Col span={8}>
              <Checkbox
                checked={activityForm.pertinentToFileReview}
                onChange={(e) =>
                  handleActivityFieldChange("pertinentToFileReview", e.target.checked)
                }
                disabled={isIssueClosed}
              >
                Pertinent to File Review
              </Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox
                checked={activityForm.sendNotification}
                onChange={(e) => handleActivityFieldChange("sendNotification", e.target.checked)}
                disabled={isIssueClosed}
              >
                Notify owner
              </Checkbox>
            </Col>
            <Col span={8}>
              <Tooltip title="Members can only see activities marked visible here - internal notes/calls stay hidden by default.">
                <Checkbox
                  checked={activityForm.visibleToMember}
                  onChange={(e) => handleActivityFieldChange("visibleToMember", e.target.checked)}
                  disabled={isIssueClosed}
                >
                  Visible to member
                </Checkbox>
              </Tooltip>
            </Col>
          </Row>
          <button
            className="custom-action-btn custom-primary-btn"
            onClick={handlePostActivity}
            disabled={postingActivity || isIssueClosed}
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
                  {activity.visibleToMember && (
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      Visible to member
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

        {/* Base Issue schema field (issue.model.js), common to all 4 issue types - same
            pattern as Description above, minus the collapse chrome (kept simple since it
            wasn't asked for here). */}
        <div className="description-section">
          <h3>Availability</h3>
          <Input.TextArea
            value={formValues.availability || ""}
            onChange={(e) => handleFieldChange("availability", e.target.value)}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="Availability notes..."
          />
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
                    complaintTypeOptions={complaintTypeOptions}
                    criteriaLetterStatusOptions={criteriaLetterStatusOptions}
                    legislationOptions={legislationOptions}
                    caseTypeOptions={caseTypeOptions}
                    memberIds={memberIds}
                    memberLabels={memberLabels}
                    onSelectComplainant={handleSelectComplainant}
                    onSelectRelatedMember={handleSelectRelatedMember}
                  />
                </div>
              )}

              <div className="section-container" ref={attachmentsRef}>
                <div className="section-header-collapsible">
                  <h3>
                    Attachments
                    {collapsedSections.Attachments && attachments.length > 0 && (
                      <span className="section-count"> ({attachments.length} documents)</span>
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
                    <span className="summary-label">Last Updated</span>
                    <Input
                      value={formatDate(activeIssue.updatedAt, true)}
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
                      options={issueSourceOptions}
                    />
                  </div>
                  {formValues.issueSource === "OTHR-IS" && (
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
                      options={originOptions}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Priority</span>
                    <Select
                      value={formValues.priority || "MEDIUM"}
                      onChange={(v) => handleFieldChange("priority", v)}
                      className="summary-input"
                      bordered={false}
                      options={priorityOptions}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Owner Team</span>
                    <Input value={enumLabel(activeIssue.owner?.team) || "-"} bordered={false} disabled />
                  </div>
                  <div className="summary-field-single">
                    <span className="summary-label">Owner (User Id)</span>
                    <Select
                      value={formValues.owner?.userId || undefined}
                      onChange={(v) => handleOwnerUserIdChange(v)}
                      className="summary-input"
                      bordered={false}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      placeholder="Select owner"
                      options={ownerOptions}
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
                      options={issueStatusOptions}
                    />
                  </div>
                  {formValues.issueStatus === "OTHER" && (
                    <div className="summary-field-single">
                      <span className="summary-label">
                        Issue Status (Other){" "}
                        <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>
                          (Max 45 characters)
                        </span>
                      </span>
                      <Input
                        value={formValues.issueStatusOther || ""}
                        onChange={(e) => handleFieldChange("issueStatusOther", e.target.value)}
                        className="summary-input"
                        bordered={false}
                        maxLength={45}
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
                      options={resolutionOptions}
                    />
                  </div>
                  {formValues.resolution === "OTHR" && (
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
