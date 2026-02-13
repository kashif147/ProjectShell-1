import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Row,
  Col,
  Tooltip,
  Dropdown,
  Input,
  DatePicker,
  Switch,
  Select,
} from "antd";
import dayjs from "dayjs";
import {
  ArrowLeftOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  PlusOutlined,
  FileTextOutlined,
  DownloadOutlined,
  MessageOutlined,
  UserAddOutlined,
  CloseOutlined,
  FolderOpenOutlined,
  DownOutlined,
  UpOutlined,
  PrinterOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "../../styles/CasesDetails.css";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";

import MySearchInput from "../../component/common/MySearchInput";

function CasesDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const caseId = location.state?.caseId || "#8821";

  const [activeStep, setActiveStep] = useState("Intake");
  const [activeNav, setActiveNav] = useState("Summary");

  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState({
    Attachments: false,
    Activities: false,
    History: false,
  });
  const [descriptionCollapsed, setDescriptionCollapsed] = useState(false);

  // Section Refs
  const summaryRef = useRef(null);
  const notesRef = useRef(null);
  const attachmentsRef = useRef(null);
  const historyRef = useRef(null);

  const [assignee, setAssignee] = useState({
    name: "Alex Rivera",
    avatar: "https://i.pravatar.cc/150?u=alex",
  });
  const [teamMembers, setTeamMembers] = useState([
    {
      name: "Sarah C.",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      active: true,
    },
    {
      name: "Michael S.",
      avatar: "https://i.pravatar.cc/150?u=michael",
      active: false,
    },
    {
      name: "David W.",
      avatar: "https://i.pravatar.cc/150?u=david",
      active: false,
    },
  ]);

  const [caseType, setCaseType] = useState("Compliance");
  const [caseStatus, setCaseStatus] = useState("In Progress");

  const steps = ["Intake", "Investigation", "Review", "Closed"];

  // Mock data for dropdowns
  // Mock current user - replace with actual user from auth context
  const currentUser = {
    name: "Alex Rivera",
    avatar: "https://i.pravatar.cc/150?u=alex",
  };

  const availableAssignees = [
    { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?u=alex" },
    { name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?u=number" },
  ];

  const availableTeamMembers = [
    { name: "Emma W.", avatar: "https://i.pravatar.cc/150?u=emma" },
    { name: "James B.", avatar: "https://i.pravatar.cc/150?u=james" },
    { name: "Linda K.", avatar: "https://i.pravatar.cc/150?u=linda" },
  ];

  const caseTypes = ["Compliance", "Risk", "Legal", "General"];
  const caseStatuses = ["In Progress", "Pending", "Review", "Closed"];
  const categories = ["Compliance", "Risk", "Legal", "General"];
  const priorities = ["Critical", "High", "Medium", "Low"];

  const handleAssigneeChange = ({ key }) => {
    const selected = availableAssignees.find((a) => a.name === key);
    if (selected) setAssignee(selected);
  };

  const handleAddTeamMember = ({ key }) => {
    const selected = availableTeamMembers.find((m) => m.name === key);
    if (selected && !teamMembers.find((m) => m.name === selected.name)) {
      setTeamMembers([...teamMembers, { ...selected, active: false }]);
    }
  };

  const handleCaseTypeChange = ({ key }) => setCaseType(key);
  const handleCaseStatusChange = ({ key }) => setCaseStatus(key);

  const scrollToSection = (sectionName) => {
    setActiveNav(sectionName);
    let ref = null;
    switch (sectionName) {
      case "Summary":
        ref = summaryRef;
        break;
      case "Activities":
        ref = notesRef;
        break;
      case "Communications":
        ref = attachmentsRef;
        break;
      case "History":
        ref = historyRef;
        break;
      default:
        return;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleSection = (sectionName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const assigneeMenu = {
    items: availableAssignees.map((a) => ({
      key: a.name,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={a.avatar} />
          <span>{a.name}</span>
        </div>
      ),
    })),
    onClick: handleAssigneeChange,
    style: { width: 160 },
  };

  const teamMemberMenu = {
    items: availableTeamMembers.map((m) => ({
      key: m.name,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={m.avatar} />
          <span>{m.name}</span>
        </div>
      ),
    })),
    onClick: handleAddTeamMember,
    style: { minWidth: 220 },
  };

  const caseTypeMenu = {
    items: caseTypes.map((t) => ({ key: t, label: t })),
    onClick: handleCaseTypeChange,
  };

  const caseStatusMenu = {
    items: caseStatuses.map((s) => ({ key: s, label: s })),
    onClick: handleCaseStatusChange,
  };

  const activities = [
    {
      title: "Issue Updated: In Progress",
      time: "2 hours ago - Alex Rivera",
      icon: <FileTextOutlined />,
      color: "var(--info-bg)",
      iconColor: "var(--primary-blue)",
    },
    {
      title: "New Internal Note Added",
      time: "4 hours ago - Sarah Chen",
      icon: <MessageOutlined />,
      color: "var(--warning-bg)",
      iconColor: "var(--warning-color)",
    },
    {
      title: "David Wu Assigned",
      time: "Yesterday - System",
      icon: <UserAddOutlined />,
      color: "var(--success-bg)",
      iconColor: "var(--success-color)",
    },
  ];

  const [caseTitle, setCaseTitle] = useState("Critical AML Indicator Flag");
  const [caseDate, setCaseDate] = useState(dayjs("2023-10-24"));
  const [caseLocation, setCaseLocation] = useState("Region 4");
  const [caseCategory, setCaseCategory] = useState("Compliance");
  const [casePriority, setCasePriority] = useState("High");
  const [caseDeadline, setCaseDeadline] = useState(dayjs("2023-11-15"));
  const [fileNumber, setFileNumber] = useState("CFN-88210");
  const [pertinentToFileReview, setPertinentToFileReview] = useState(true);
  const [stakeholders, setStakeholders] = useState(["Emma W.", "James B."]);

  const issueDescription =
    "Initial flagged transaction originating from region 4. Potential anti-money laundering (AML) indicators detected. Requires manual cross-verification with external vendor logs.";

  const getFirstNWords = (text, n) => {
    if (!text || !n) return "";
    const stripped = String(text)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = stripped.split(/\s+/).filter(Boolean);
    const slice = words.slice(0, n).join(" ");
    return words.length > n ? `${slice}...` : slice;
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
  };

  const handlePrint = () => window.print();

  const allSectionsCollapsed =
    descriptionCollapsed &&
    collapsedSections.Attachments &&
    collapsedSections.Activities &&
    collapsedSections.History;

  const handleCollapseExpandToggle = () => {
    if (allSectionsCollapsed) {
      setDescriptionCollapsed(false);
      setCollapsedSections({
        Attachments: false,
        Activities: false,
        History: false,
      });
    } else {
      setDescriptionCollapsed(true);
      setCollapsedSections({
        Attachments: true,
        Activities: true,
        History: true,
      });
    }
  };

  const renderSummary = () => (
    <div className="summary-content">
      <div className="summary-title-description-full">
        <div className="summary-title-row">
          <div className="summary-title-wrapper">
            <h2 className="summary-title">{caseTitle}</h2>
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
                  — {getFirstNWords(issueDescription, 20)}
                </span>
              )}
            </h3>
            <div className="section-header-actions">
              <span
                className="section-toggle-btn"
                onClick={() => setDescriptionCollapsed(!descriptionCollapsed)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setDescriptionCollapsed((c) => !c)
                }
                aria-expanded={!descriptionCollapsed}
              >
                {descriptionCollapsed ? <DownOutlined /> : <UpOutlined />}
              </span>
            </div>
          </div>
          {!descriptionCollapsed && (
            <div className="description-box">{issueDescription}</div>
          )}
        </div>
      </div>
    </div>
  );

  const historyData = [
    {
      actor: {
        name: "Sarah Johnson",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        title: "STATUS CHANGE",
      },
      time: "2m ago",
      type: "status",
      label: "Modified Issue Status",
      from: "Draft",
      to: "Review",
      fromColor: "var(--error-bg)",
      fromTxt: "var(--error-color)",
      toColor: "var(--success-bg)",
      toTxt: "var(--success-color)",
    },
    {
      actor: {
        name: "Admin System",
        avatar: "",
        icon: <UserAddOutlined />,
        title: "METADATA EDIT",
      },
      time: "18m ago",
      type: "meta",
      label: "Updated Priority Level",
      old: "Medium Priority",
      new: "Critical Priority",
      oldTxt: "#8c8c8c",
      newTxt: "var(--primary-blue)",
    },
    {
      actor: {
        name: "Michael Chen",
        avatar: "https://i.pravatar.cc/150?u=michael",
        title: "FILE UPLOAD",
      },
      time: "1h ago",
      type: "file",
      label: "Added Supporting Doc",
      fileName: "case_evidence_v2.pdf",
      fileSize: "1.2 MB - PDF Document",
    },
    {
      actor: {
        name: "John Doe",
        avatar: "",
        icon: <UserAddOutlined />,
        title: "CONTENT EDIT",
      },
      time: "3h ago",
      type: "diff",
      label: "Modified Issue Summary",
      oldText: "Initial assessment complete, pending further files...",
      newText:
        "Comprehensive review finished, evidence cross-referenced with regional guidelines...",
    },
  ];

  const attachmentsData = [
    {
      name: "Case_Summary_V2.pdf",
      date: "Oct 24, 2023",
      time: "10:30 AM",
      version: "v2.1",
      modifiedBy: "J. DOE",
      type: "pdf",
      icon: <FileTextOutlined style={{ color: "#ff4d4f" }} />,
      printContent:
        "Case Summary – Region 4 AML Indicator\n\nInitial assessment dated Oct 24, 2023. This document summarizes the flagged transaction and recommended actions. Key findings: potential AML indicators detected; cross-verification with external vendor logs required. Status: Under review. Prepared by J. DOE.",
    },
    {
      name: "Witness_Testimony_Correspondence.msg",
      date: "Oct 22, 2023",
      time: "02:15 PM",
      version: "v1.0",
      modifiedBy: "R. SMITH",
      type: "msg",
      icon: <FileTextOutlined style={{ color: "#1890ff" }} />,
      printContent:
        "Subject: Witness Testimony – Case Reference\nFrom: R. SMITH\nDate: Oct 22, 2023\n\nSummary of correspondence regarding witness testimony. Key points documented for case file. Follow-up required with legal team.",
    },
    {
      name: "Evidence_Photo_001.jpg",
      date: "Oct 21, 2023",
      time: "09:45 AM",
      version: "v3.4",
      modifiedBy: "S. AGENT",
      type: "image",
      icon: <FileTextOutlined style={{ color: "var(--success-color)" }} />,
      thumb: "https://i.pravatar.cc/150?u=evidence",
    },
    {
      name: "Internal_Review_Notes.docx",
      date: "Oct 19, 2023",
      time: "04:20 PM",
      version: "v1.2",
      modifiedBy: "M. LEGAL",
      type: "doc",
      icon: <FileTextOutlined style={{ color: "#1890ff" }} />,
      printContent:
        "Internal Review Notes\n\nReview completed by M. LEGAL. Recommendations: proceed with cross-verification; escalate if further indicators found. Next steps documented in case workflow.",
    },
  ];

  const renderAttachments = () => (
    <div className="attachments-tab-content">
      <div className="attachments-icons-grid">
        {attachmentsData.map((file, index) => (
          <div key={index} className="attachment-icon-item" title={file.name}>
            <div className={`file-type-icon ${file.type}`}>
              {file.thumb ? (
                <img
                  src={file.thumb}
                  alt="thumb"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
              ) : (
                file.icon
              )}
            </div>
            <div className="file-name-tooltip">{file.name}</div>
            <div className="file-upload-date">
              {file.date} {file.time}
            </div>
            <div className="attachment-item-actions">
              <Tooltip title="View">
                <span
                  className="attachment-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewFile(file);
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFile(file);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleDownloadFile(file)
                  }
                >
                  <DownloadOutlined />
                </span>
              </Tooltip>
            </div>
          </div>
        ))}
        <div
          className="attachment-icon-item upload-icon-item"
          onClick={handleUploadFile}
        >
          <Avatar
            className="upload-new-avatar"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "var(--primary-blue)",
              cursor: "pointer",
            }}
          />
          <div className="file-name-tooltip">Upload New</div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="history-tab-content">
      <div className="history-header">
        <div className="history-search-wrapper">
          <MySearchInput placeholder="Search by actor or field..." />
        </div>
        <div className="history-filters">
          <div className="filter-badge active">All</div>
          <div className="filter-badge">
            Edits{" "}
            <ArrowLeftOutlined
              rotate={-90}
              style={{ fontSize: 10, marginLeft: 4 }}
            />
          </div>
          <div className="filter-badge">
            Status{" "}
            <ArrowLeftOutlined
              rotate={-90}
              style={{ fontSize: 10, marginLeft: 4 }}
            />
          </div>
          <div className="filter-badge">
            Uploads{" "}
            <ArrowLeftOutlined
              rotate={-90}
              style={{ fontSize: 10, marginLeft: 4 }}
            />
          </div>
        </div>
      </div>

      <div className="history-count-row">
        <span>SHOWING 124 RECORDS</span>
        <EllipsisOutlined style={{ color: "#bfbfbf", cursor: "pointer" }} />
      </div>

      <div className="history-timeline">
        {historyData.map((item, index) => (
          <div key={index} className="history-card">
            <div className="history-card-header">
              <div className="actor-info">
                {item.actor.avatar ? (
                  <Avatar src={item.actor.avatar} />
                ) : (
                  <Avatar
                    icon={item.actor.icon}
                    style={{
                      backgroundColor: "var(--info-bg)",
                      color: "var(--primary-blue)",
                    }}
                  />
                )}
                <div className="actor-text">
                  <h4>{item.actor.name}</h4>
                  <span className="actor-title">{item.actor.title}</span>
                </div>
              </div>
              <span className="time-stamp">{item.time}</span>
            </div>

            <div className="history-card-body">
              <p className="change-label">{item.label}</p>

              {item.type === "status" && (
                <div className="status-change-wrapper">
                  <div
                    className="status-pill"
                    style={{
                      backgroundColor: item.fromColor,
                      color: item.fromTxt,
                    }}
                  >
                    {item.from}
                  </div>
                  <ArrowLeftOutlined
                    rotate={180}
                    style={{ color: "#bfbfbf" }}
                  />
                  <div
                    className="status-pill"
                    style={{ backgroundColor: item.toColor, color: item.toTxt }}
                  >
                    {item.to}
                  </div>
                </div>
              )}

              {item.type === "meta" && (
                <div className="meta-change-wrapper">
                  <div className="meta-row">
                    <span className="meta-label">Old:</span>
                    <span className="meta-val" style={{ color: item.oldTxt }}>
                      {item.old}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">New:</span>
                    <span className="meta-val" style={{ color: item.newTxt }}>
                      {item.new}
                    </span>
                  </div>
                </div>
              )}

              {item.type === "file" && (
                <div className="file-box">
                  <div className="file-info-main">
                    <div className="file-icon-wrapper">
                      <FileTextOutlined
                        style={{ color: "#1890ff", fontSize: 20 }}
                      />
                    </div>
                    <div className="file-details">
                      <h4>{item.fileName}</h4>
                      <span>{item.fileSize}</span>
                    </div>
                  </div>
                  <ShareAltOutlined
                    style={{ color: "#bfbfbf", cursor: "pointer" }}
                  />
                </div>
              )}

              {item.type === "diff" && (
                <div className="diff-wrapper">
                  <div className="diff-box old">{item.oldText}</div>
                  <div className="diff-box new">{item.newText}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="history-footer">
        <Button type="link" className="load-more-btn">
          Load more records
        </Button>
        <p className="footer-range">Oct 24, 2023 - 10:30 AM to Current</p>
      </div>
    </div>
  );

  const [notes, setNotes] = useState([
    {
      id: 1,
      user: "Sarah C.",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      text: "Initial review of the transaction logs shows some inconsistencies with the reported timeline.",
      time: "Oct 24, 10:30 AM",
    },
    {
      id: 2,
      user: "Michael S.",
      avatar: "https://i.pravatar.cc/150?u=michael",
      text: "I have requested the external vendor logs to cross-verify. Should have them by EOD.",
      time: "Oct 24, 11:15 AM",
    },
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now(),
      user: "Alex Rivera", // Current user
      avatar: "https://i.pravatar.cc/150?u=alex",
      text: newNote,
      time: "Just now",
    };
    setNotes([...notes, note]);
    setNewNote("");
  };

  const loadPreviousNotes = () => {
    const olderNotes = [
      {
        id: 99,
        user: "System",
        avatar: "",
        text: "Case created automatically by Risk Engine Rule #442.",
        time: "Oct 23, 09:00 PM",
      },
    ];
    setNotes([...olderNotes, ...notes]);
  };

  const handleUploadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      console.log("Files selected:", files);
    };
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
    if (
      file.thumb &&
      (file.type === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
    ) {
      window.open(file.thumb, "_blank");
    } else {
      const w = window.open("", "_blank");
      if (w)
        w.document.write(
          `<html><body style="font-family:sans-serif;padding:24px"><h2>${file.name}</h2><p>Preview not available for this file type. Use Download to save.</p></body></html>`,
        );
    }
  };

  const handleDownloadAll = () => {
    attachmentsData.forEach((file, i) => {
      setTimeout(() => handleDownloadFile(file), i * 200);
    });
  };

  const renderIssueNotes = () => (
    <div className="issue-notes-container" style={{ padding: "0" }}>
      <div
        className="add-note-section"
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <Avatar src="https://i.pravatar.cc/150?u=alex" />
        <div style={{ flex: 1 }}>
          <div
            className="rich-text-editor-wrapper"
            style={{ marginBottom: "12px" }}
          >
            <ReactQuill
              theme="snow"
              value={newNote}
              onChange={setNewNote}
              placeholder="Add a comment..."
              modules={{
                toolbar: [
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"],
                ],
              }}
            
            />
          </div>
          <button
            className="custom-action-btn custom-primary-btn"
            onClick={handleAddNote}
          >
            Add Comment
          </button>
        </div>
      </div>

      <div
        className="notes-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-item"
            style={{ display: "flex", gap: "16px" }}
          >
            <Avatar src={note.avatar} icon={<UserAddOutlined />} />
            <div className="note-content" style={{ flex: 1 }}>
              <div
                className="note-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#212529",
                    fontSize: "14px",
                  }}
                >
                  {note.user}
                </span>
                <span style={{ color: "#bfbfbf", fontSize: "12px" }}>
                  {note.time}
                </span>
              </div>
              <div
                className="note-text"
                style={{
                  background: "#f8faff",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#595959",
                  fontSize: "14px",
                }}
                dangerouslySetInnerHTML={{ __html: note.text }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button
          className="custom-action-btn custom-secondary-btn"
          onClick={loadPreviousNotes}
        >
          Load previous comments
        </button>
      </div>
    </div>
  );

  return (
    <div className="cases-details-container">
      {/* Scrollable Content Body */}
      <div className="cases-content-body">
        <div className="sections-wrapper">
          <div className="main-content-layout">
            <div className="left-column-sections">
              <div className="section-container" ref={summaryRef}>
                <div className="summary-wrapper">{renderSummary()}</div>
              </div>

              <div className="section-container" ref={attachmentsRef}>
                <div className="section-header-collapsible">
                  <h3>
                    Attachments
                    {collapsedSections.Attachments &&
                      attachmentsData.length > 0 && (
                        <span className="section-count">
                          {" "}
                          ({attachmentsData.length} document
                          {attachmentsData.length !== 1 ? "s" : ""})
                        </span>
                      )}
                  </h3>
                  <div className="section-header-actions">
                    <Tooltip title="Download all">
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadAll}
                        size="small"
                        disabled={attachmentsData.length === 0}
                        className="attachments-download-all-btn"
                      />
                    </Tooltip>
                    <span
                      className="section-toggle-btn"
                      onClick={() => toggleSection("Attachments")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && toggleSection("Attachments")
                      }
                      aria-expanded={!collapsedSections.Attachments}
                    >
                      {collapsedSections.Attachments ? (
                        <DownOutlined />
                      ) : (
                        <UpOutlined />
                      )}
                    </span>
                  </div>
                </div>
                {!collapsedSections.Attachments && renderAttachments()}
              </div>

              <div className="section-container" ref={notesRef}>
                <div className="section-header-collapsible">
                  <h3>
                    Activities
                    {collapsedSections.Activities &&
                      notes.length > 0 &&
                      (() => {
                        const latest = notes[notes.length - 1];
                        const previewText = stripHtml(latest.text);
                        const short =
                          previewText.length > 60
                            ? `${previewText.slice(0, 60)}...`
                            : previewText;
                        return (
                          <span className="section-preview-inline">
                            {" "}
                            — {latest.user} · {latest.time}: {short}
                          </span>
                        );
                      })()}
                  </h3>
                  <div className="section-header-actions">
                    <span
                      className="section-toggle-btn"
                      onClick={() => toggleSection("Activities")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && toggleSection("Activities")
                      }
                      aria-expanded={!collapsedSections.Activities}
                    >
                      {collapsedSections.Activities ? (
                        <DownOutlined />
                      ) : (
                        <UpOutlined />
                      )}
                    </span>
                  </div>
                </div>
                {!collapsedSections.Activities && renderIssueNotes()}
              </div>

              <div className="section-container" ref={historyRef}>
                <div className="section-header-collapsible">
                  <h3>
                    History
                    {collapsedSections.History && historyData.length > 0 && (
                      <>
                        <span className="section-count">
                          {" "}
                          ({historyData.length} record
                          {historyData.length !== 1 ? "s" : ""})
                        </span>
                        {historyData[0] &&
                          (() => {
                            const recent = historyData[0];
                            const labelShort =
                              recent.label.length > 50
                                ? `${recent.label.slice(0, 50)}...`
                                : recent.label;
                            return (
                              <span className="section-preview-inline">
                                {" "}
                                — {recent.actor.name} · {recent.time}:{" "}
                                {labelShort}
                              </span>
                            );
                          })()}
                      </>
                    )}
                  </h3>
                  <div className="section-header-actions">
                    <span
                      className="section-toggle-btn"
                      onClick={() => toggleSection("History")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && toggleSection("History")
                      }
                      aria-expanded={!collapsedSections.History}
                    >
                      {collapsedSections.History ? (
                        <DownOutlined />
                      ) : (
                        <UpOutlined />
                      )}
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
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "print",
                          icon: <PrinterOutlined />,
                          label: "Print",
                          onClick: handlePrint,
                        },
                      ],
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <span className="issue-details-actions-trigger">
                      <EllipsisOutlined />
                    </span>
                  </Dropdown>
                </div>
                <div className="summary-right-column-sticky">
                  <div className="summary-field-single">
                    <span className="summary-label">Incident Date</span>
                    <DatePicker
                      value={caseDate}
                      onChange={(date) => setCaseDate(date)}
                      format="MMM DD, YYYY"
                      bordered={false}
                      allowClear={false}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Location</span>
                    <Input
                      value={caseLocation}
                      onChange={(e) => setCaseLocation(e.target.value)}
                      className="summary-input"
                      bordered={false}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Category</span>
                    <Select
                      value={caseCategory}
                      onChange={setCaseCategory}
                      className="summary-input"
                      bordered={false}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={categories.map((cat) => ({
                        value: cat,
                        label: cat,
                      }))}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label summary-label-case-type">
                      Case Type
                    </span>
                    <Select
                      value={caseType}
                      onChange={setCaseType}
                      className="summary-input"
                      bordered={false}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={caseTypes.map((type) => ({
                        value: type,
                        label: type,
                      }))}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Status</span>
                    <Select
                      value={caseStatus}
                      onChange={setCaseStatus}
                      className="summary-input"
                      bordered={false}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={caseStatuses.map((status) => ({
                        value: status,
                        label: status,
                      }))}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Priority</span>
                    <Select
                      value={casePriority}
                      onChange={setCasePriority}
                      className="summary-input"
                      bordered={false}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={priorities.map((priority) => ({
                        value: priority,
                        label: priority,
                      }))}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Due Date</span>
                    <DatePicker
                      value={caseDeadline}
                      onChange={(date) => setCaseDeadline(date)}
                      format="MMM DD, YYYY"
                      bordered={false}
                      allowClear={false}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label summary-label-pertinent">
                      Pertinent to File Review
                    </span>
                    <Switch
                      checked={pertinentToFileReview}
                      onChange={setPertinentToFileReview}
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">File Number</span>
                    <Input
                      value={fileNumber}
                      onChange={(e) => setFileNumber(e.target.value)}
                      className="summary-input"
                      bordered={false}
                      disabled={pertinentToFileReview}
                      placeholder="e.g. CFN-88210"
                    />
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Assignee</span>
                    <Select
                      value={assignee.name}
                      onChange={(value) => {
                        const selected = availableAssignees.find(
                          (a) => a.name === value,
                        );
                        if (selected) setAssignee(selected);
                      }}
                      className="summary-input"
                      bordered={false}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={availableAssignees.map((assignee) => ({
                        value: assignee.name,
                        label: assignee.name,
                      }))}
                    />
                  </div>
                  <div style={{ marginLeft: "240px" }}>
                    <a
                      onClick={() => setAssignee(currentUser)}
                      style={{
                        cursor: "pointer",
                        color: "var(--primary-blue)",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Assign to me
                    </a>
                  </div>

                  <div className="summary-field-single">
                    <span className="summary-label">Related Member(s)</span>
                    <Select
                      mode="multiple"
                      value={stakeholders}
                      onChange={setStakeholders}
                      className="summary-input"
                      bordered={false}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={availableTeamMembers.map((member) => ({
                        value: member.name,
                        label: member.name,
                      }))}
                      maxTagCount={1}
                      maxTagPlaceholder={(omittedValues) =>
                        `+${omittedValues.length}`
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only content: Issue ID + Title, Issue details, Description, Attachments, Comments */}
      <div className="issue-print-area" aria-hidden="true">
        <div className="issue-print-header">
          <div className="issue-print-id">Issue ID: {caseId}</div>
          <h1 className="issue-print-title">{caseTitle}</h1>
        </div>

        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Issue Details</h2>
          <div className="issue-print-details-grid">
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Incident Date</span>
              <span className="issue-print-value">
                {caseDate ? dayjs(caseDate).format("MMM DD, YYYY") : "—"}
              </span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Location</span>
              <span className="issue-print-value">{caseLocation || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Category</span>
              <span className="issue-print-value">{caseCategory || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Case Type</span>
              <span className="issue-print-value">{caseType || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Status</span>
              <span className="issue-print-value">{caseStatus || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Priority</span>
              <span className="issue-print-value">{casePriority || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Due Date</span>
              <span className="issue-print-value">
                {caseDeadline
                  ? dayjs(caseDeadline).format("MMM DD, YYYY")
                  : "—"}
              </span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">
                Pertinent to File Review
              </span>
              <span className="issue-print-value">
                {pertinentToFileReview ? "Yes" : "No"}
              </span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">File Number</span>
              <span className="issue-print-value">{fileNumber || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Assignee</span>
              <span className="issue-print-value">{assignee?.name || "—"}</span>
            </div>
            <div className="issue-print-detail-item">
              <span className="issue-print-label">Related Member(s)</span>
              <span className="issue-print-value">
                {Array.isArray(stakeholders) ? stakeholders.join(", ") : "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Description</h2>
          <div className="issue-print-description">{issueDescription}</div>
        </section>

        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Attachments</h2>
          {attachmentsData.map((file, index) => (
            <div key={index} className="issue-print-attachment-doc">
              <div className="issue-print-attachment-header">
                <strong>{file.name}</strong>
                {file.date && file.time && (
                  <span className="issue-print-meta">
                    {" "}
                    — {file.date} {file.time}
                  </span>
                )}
                {file.modifiedBy && (
                  <span className="issue-print-meta"> · {file.modifiedBy}</span>
                )}
              </div>
              {file.thumb &&
              (file.type === "image" ||
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) ? (
                <div className="issue-print-attachment-image">
                  <img src={file.thumb} alt={file.name} />
                </div>
              ) : file.printContent ? (
                <div className="issue-print-attachment-content">
                  {file.printContent.split("\n").map((line, i) => (
                    <p key={i}>{line || " "}</p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </section>

        <section className="issue-print-section">
          <h2 className="issue-print-section-title">Comments</h2>
          <div className="issue-print-comments">
            {notes.map((note) => (
              <div key={note.id} className="issue-print-comment">
                <div className="issue-print-comment-header">
                  <strong>{note.user}</strong>
                  <span className="issue-print-comment-time">{note.time}</span>
                </div>
                <div
                  className="issue-print-comment-text"
                  dangerouslySetInnerHTML={{ __html: note.text }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CasesDetails;
