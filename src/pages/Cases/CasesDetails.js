import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Row, Col, Tooltip, Dropdown, Input } from 'antd';
import {
  ArrowLeftOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  DownloadOutlined,
  MessageOutlined,
  UserAddOutlined,
  CloseOutlined,
  FolderOpenOutlined,
  DownOutlined
} from '@ant-design/icons';
import "../../styles/CasesDetails.css";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";

import MySearchInput from "../../component/common/MySearchInput";

function CasesDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const caseId = location.state?.caseId || "#8821";

  const [activeStep, setActiveStep] = useState('Intake');
  const [activeNav, setActiveNav] = useState('Summary');

  // Section Refs
  const summaryRef = useRef(null);
  const notesRef = useRef(null);
  const attachmentsRef = useRef(null);
  const historyRef = useRef(null);

  const [assignee, setAssignee] = useState({ name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex' });
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Sarah C.', avatar: 'https://i.pravatar.cc/150?u=sarah', active: true },
    { name: 'Michael S.', avatar: 'https://i.pravatar.cc/150?u=michael', active: false },
    { name: 'David W.', avatar: 'https://i.pravatar.cc/150?u=david', active: false },
  ]);

  const [caseType, setCaseType] = useState('Compliance');
  const [caseStatus, setCaseStatus] = useState('In Progress');

  const steps = ['Intake', 'Investigation', 'Review', 'Closed'];

  // Mock data for dropdowns
  const availableAssignees = [
    { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Mike Chen', avatar: 'https://i.pravatar.cc/150?u=number' },
  ];

  const availableTeamMembers = [
    { name: 'Emma W.', avatar: 'https://i.pravatar.cc/150?u=emma' },
    { name: 'James B.', avatar: 'https://i.pravatar.cc/150?u=james' },
    { name: 'Linda K.', avatar: 'https://i.pravatar.cc/150?u=linda' },
  ];

  const caseTypes = ['Compliance', 'Risk', 'Legal', 'General'];
  const caseStatuses = ['In Progress', 'Pending', 'Review', 'Closed'];

  const handleAssigneeChange = ({ key }) => {
    const selected = availableAssignees.find(a => a.name === key);
    if (selected) setAssignee(selected);
  };

  const handleAddTeamMember = ({ key }) => {
    const selected = availableTeamMembers.find(m => m.name === key);
    if (selected && !teamMembers.find(m => m.name === selected.name)) {
      setTeamMembers([...teamMembers, { ...selected, active: false }]);
    }
  };

  const handleCaseTypeChange = ({ key }) => setCaseType(key);
  const handleCaseStatusChange = ({ key }) => setCaseStatus(key);

  const scrollToSection = (sectionName) => {
    setActiveNav(sectionName);
    let ref = null;
    switch (sectionName) {
      case 'Summary': ref = summaryRef; break;
      case 'Activities': ref = notesRef; break;
      case 'Communications': ref = attachmentsRef; break;
      case 'History': ref = historyRef; break;
      default: return;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const assigneeMenu = {
    items: availableAssignees.map(a => ({
      key: a.name,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" src={a.avatar} />
          <span>{a.name}</span>
        </div>
      )
    })),
    onClick: handleAssigneeChange,
    style: { width: 160 }
  };

  const teamMemberMenu = {
    items: availableTeamMembers.map(m => ({
      key: m.name,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" src={m.avatar} />
          <span>{m.name}</span>
        </div>
      )
    })),
    onClick: handleAddTeamMember,
    style: { minWidth: 220 }
  };

  const caseTypeMenu = {
    items: caseTypes.map(t => ({ key: t, label: t })),
    onClick: handleCaseTypeChange
  };

  const caseStatusMenu = {
    items: caseStatuses.map(s => ({ key: s, label: s })),
    onClick: handleCaseStatusChange
  };


  const activities = [
    {
      title: 'Issue Updated: In Progress',
      time: '2 hours ago - Alex Rivera',
      icon: <FileTextOutlined />,
      color: 'var(--info-bg)',
      iconColor: 'var(--primary-blue)'
    },
    {
      title: 'New Internal Note Added',
      time: '4 hours ago - Sarah Chen',
      icon: <MessageOutlined />,
      color: 'var(--warning-bg)',
      iconColor: 'var(--warning-color)'
    },
    {
      title: 'David Wu Assigned',
      time: 'Yesterday - System',
      icon: <UserAddOutlined />,
      color: 'var(--success-bg)',
      iconColor: 'var(--success-color)'
    }
  ];

  const [caseTitle, setCaseTitle] = useState('Critical AML Indicator Flag');

  const renderSummary = () => (
    <div className="summary-content">
      <div className="summary-grid">
        <span className="summary-label">Title</span>
        <span className="summary-value" style={{ textAlign: 'right' }}>{caseTitle}</span>

        <span className="summary-label">Assign To</span>
        <div className="owner-value">
          <Dropdown menu={assigneeMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <span className="summary-value">{assignee.name}</span>
              <Avatar size="small" src={assignee.avatar} />
            </div>
          </Dropdown>
        </div>

        <span className="summary-label">Created Date</span>
        <span className="summary-value" style={{ textAlign: 'right' }}>Oct 24, 2023</span>

        <span className="summary-label">Case Type</span>
        <div className="owner-value">
          <Dropdown menu={caseTypeMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span className="summary-value">{caseType}</span>
              <DownOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
            </div>
          </Dropdown>
        </div>

        <span className="summary-label">Case Status</span>
        <div className="owner-value">
          <Dropdown menu={caseStatusMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span className="summary-value">{caseStatus}</span>
              <DownOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
            </div>
          </Dropdown>
        </div>

        <span className="summary-label">Department</span>
        <span className="summary-value" style={{ textAlign: 'right' }}>Global Risk (GRA)</span>
      </div>

      <div className="description-section">
        <span className="summary-label">Description</span>
        <div className="description-box">
          Initial flagged transaction originating from region 4. Potential anti-money laundering (AML) indicators detected. Requires manual cross-verification with external vendor logs.
        </div>
      </div>

      <div className="team-member-section">
        <div className="section-title">
          <h3>Active Team Members</h3>
          <CloseOutlined className="close-section-icon" />
        </div>
        <div className="avatar-list">
          {teamMembers.map((member, index) => (
            <div key={index} className="avatar-info">
              <Avatar
                src={member.avatar}
                style={{ border: member.active ? '2px solid #52c41a' : 'none' }}
              />
              <span>{member.name}</span>
            </div>
          ))}
          <Dropdown menu={teamMemberMenu} trigger={['click']}>
            <div className="add-member-btn">
              <PlusOutlined />
            </div>
          </Dropdown>
        </div>
      </div>


    </div >
  );

  const historyData = [
    {
      actor: { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah', title: 'STATUS CHANGE' },
      time: '2m ago',
      type: 'status',
      label: 'Modified Issue Status',
      from: 'Draft',
      to: 'Review',
      fromColor: 'var(--error-bg)',
      fromTxt: 'var(--error-color)',
      toColor: 'var(--success-bg)',
      toTxt: 'var(--success-color)'
    },
    {
      actor: { name: 'Admin System', avatar: '', icon: <UserAddOutlined />, title: 'METADATA EDIT' },
      time: '18m ago',
      type: 'meta',
      label: 'Updated Priority Level',
      old: 'Medium Priority',
      new: 'Critical Priority',
      oldTxt: '#8c8c8c',
      newTxt: 'var(--primary-blue)'
    },
    {
      actor: { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=michael', title: 'FILE UPLOAD' },
      time: '1h ago',
      type: 'file',
      label: 'Added Supporting Doc',
      fileName: 'case_evidence_v2.pdf',
      fileSize: '1.2 MB - PDF Document'
    },
    {
      actor: { name: 'John Doe', avatar: '', icon: <UserAddOutlined />, title: 'CONTENT EDIT' },
      time: '3h ago',
      type: 'diff',
      label: 'Modified Issue Summary',
      oldText: 'Initial assessment complete, pending further files...',
      newText: 'Comprehensive review finished, evidence cross-referenced with regional guidelines...'
    }
  ];

  const attachmentsData = [
    {
      name: 'Case_Summary_V2.pdf',
      date: 'Oct 24, 2023',
      version: 'v2.1',
      modifiedBy: 'J. DOE',
      type: 'pdf',
      icon: <FileTextOutlined style={{ color: '#ff4d4f' }} />
    },
    {
      name: 'Witness_Testimony_Correspondence.msg',
      date: 'Oct 22, 2023',
      version: 'v1.0',
      modifiedBy: 'R. SMITH',
      type: 'msg',
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />
    },
    {
      name: 'Evidence_Photo_001.jpg',
      date: 'Oct 21, 2023',
      version: 'v3.4',
      modifiedBy: 'S. AGENT',
      type: 'image',
      icon: <FileTextOutlined style={{ color: 'var(--success-color)' }} />,
      thumb: 'https://i.pravatar.cc/150?u=evidence'
    },
    {
      name: 'Internal_Review_Notes.docx',
      date: 'Oct 19, 2023',
      version: 'v1.2',
      modifiedBy: 'M. LEGAL',
      type: 'doc',
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />
    }
  ];

  const renderAttachments = () => (
    <div className="attachments-tab-content">
      <div className="attachments-header">
        <div className="header-actions-left">
          {/* Global Buttons Removed */}
        </div>
        <Button type="primary" className="upload-new-btn" icon={<PlusOutlined />}>Upload New</Button>
      </div>

      <div className="attachments-list">
        {attachmentsData.map((file, index) => (
          <div key={index} className="attachment-item">
            <div className="attachment-info-main">
              <div className={`file-type-icon ${file.type}`}>
                {file.thumb ? (
                  <img src={file.thumb} alt="thumb" style={{ width: '100%', height: '100%', borderRadius: 4, objectFit: 'cover' }} />
                ) : (
                  file.icon
                )}
              </div>
              <div className="file-meta-info">
                <h4>{file.name}</h4>
                <div className="file-sub-meta">
                  <span>{file.date}</span>
                  <span className="meta-dot">•</span>
                  <span>{file.version}</span>
                </div>
                <div className="modified-by">
                  MODIFIED BY: {file.modifiedBy}
                </div>
              </div>
            </div>
            <div className="attachment-actions">
              <DownloadOutlined style={{ fontSize: 18, color: '#bfbfbf', cursor: 'pointer' }} />
              <ShareAltOutlined style={{ fontSize: 18, color: '#bfbfbf', cursor: 'pointer' }} />
              <EllipsisOutlined style={{ fontSize: 20, color: '#bfbfbf', cursor: 'pointer' }} />
            </div>
          </div>
        ))}
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
          <div className="filter-badge">Edits <ArrowLeftOutlined rotate={-90} style={{ fontSize: 10, marginLeft: 4 }} /></div>
          <div className="filter-badge">Status <ArrowLeftOutlined rotate={-90} style={{ fontSize: 10, marginLeft: 4 }} /></div>
          <div className="filter-badge">Uploads <ArrowLeftOutlined rotate={-90} style={{ fontSize: 10, marginLeft: 4 }} /></div>
        </div>
      </div>

      <div className="history-count-row">
        <span>SHOWING 124 RECORDS</span>
        <EllipsisOutlined style={{ color: '#bfbfbf', cursor: 'pointer' }} />
      </div>

      <div className="history-timeline">
        {historyData.map((item, index) => (
          <div key={index} className="history-card">
            <div className="history-card-header">
              <div className="actor-info">
                {item.actor.avatar ? (
                  <Avatar src={item.actor.avatar} />
                ) : (
                  <Avatar icon={item.actor.icon} style={{ backgroundColor: 'var(--info-bg)', color: 'var(--primary-blue)' }} />
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

              {item.type === 'status' && (
                <div className="status-change-wrapper">
                  <div className="status-pill" style={{ backgroundColor: item.fromColor, color: item.fromTxt }}>{item.from}</div>
                  <ArrowLeftOutlined rotate={180} style={{ color: '#bfbfbf' }} />
                  <div className="status-pill" style={{ backgroundColor: item.toColor, color: item.toTxt }}>{item.to}</div>
                </div>
              )}

              {item.type === 'meta' && (
                <div className="meta-change-wrapper">
                  <div className="meta-row">
                    <span className="meta-label">Old:</span>
                    <span className="meta-val" style={{ color: item.oldTxt }}>{item.old}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">New:</span>
                    <span className="meta-val" style={{ color: item.newTxt }}>{item.new}</span>
                  </div>
                </div>
              )}

              {item.type === 'file' && (
                <div className="file-box">
                  <div className="file-info-main">
                    <div className="file-icon-wrapper">
                      <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                    </div>
                    <div className="file-details">
                      <h4>{item.fileName}</h4>
                      <span>{item.fileSize}</span>
                    </div>
                  </div>
                  <ShareAltOutlined style={{ color: '#bfbfbf', cursor: 'pointer' }} />
                </div>
              )}

              {item.type === 'diff' && (
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
        <Button type="link" className="load-more-btn">Load more records</Button>
        <p className="footer-range">Oct 24, 2023 - 10:30 AM to Current</p>
      </div>
    </div>
  );

  const [notes, setNotes] = useState([
    {
      id: 1,
      user: 'Sarah C.',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      text: 'Initial review of the transaction logs shows some inconsistencies with the reported timeline.',
      time: 'Oct 24, 10:30 AM'
    },
    {
      id: 2,
      user: 'Michael S.',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      text: 'I have requested the external vendor logs to cross-verify. Should have them by EOD.',
      time: 'Oct 24, 11:15 AM'
    }
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now(),
      user: 'Alex Rivera', // Current user
      avatar: 'https://i.pravatar.cc/150?u=alex',
      text: newNote,
      time: 'Just now'
    };
    setNotes([...notes, note]);
    setNewNote('');
  };

  const loadPreviousNotes = () => {
    const olderNotes = [
      {
        id: 99,
        user: 'System',
        avatar: '',
        text: 'Case created automatically by Risk Engine Rule #442.',
        time: 'Oct 23, 09:00 PM'
      }
    ];
    setNotes([...olderNotes, ...notes]);
  };

  const renderIssueNotes = () => (
    <div className="issue-notes-container" style={{ padding: '0' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <button className="custom-action-btn custom-secondary-btn" onClick={loadPreviousNotes}>
          Load previous comments
        </button>
      </div>

      <div className="notes-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
        {notes.map(note => (
          <div key={note.id} className="note-item" style={{ display: 'flex', gap: '16px' }}>
            <Avatar src={note.avatar} icon={<UserAddOutlined />} />
            <div className="note-content" style={{ flex: 1 }}>
              <div className="note-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#212529', fontSize: '14px' }}>{note.user}</span>
                <span style={{ color: '#bfbfbf', fontSize: '12px' }}>{note.time}</span>
              </div>
              <div
                className="note-text"
                style={{ background: '#f8faff', padding: '12px', borderRadius: '8px', color: '#595959', fontSize: '14px' }}
                dangerouslySetInnerHTML={{ __html: note.text }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="add-note-section" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Avatar src="https://i.pravatar.cc/150?u=alex" />
        <div style={{ flex: 1 }}>
          <div className="rich-text-editor-wrapper" style={{ marginBottom: '12px' }}>
            <ReactQuill
              theme="snow"
              value={newNote}
              onChange={setNewNote}
              placeholder="Add a comment..."
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
              style={{
                borderRadius: '8px',
                background: '#fff'
              }}
            />
          </div>
          <button className="custom-action-btn custom-primary-btn" onClick={handleAddNote}>
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cases-details-container">
      {/* Header */}


      {/* Anchor Navigation Bar */}
      <div className="anchor-nav-header">
        {['Summary', 'Activities', 'Communications', 'History'].map((item) => (
          <div
            key={item}
            className={`anchor-nav-item ${activeNav === item ? 'active' : ''}`}
            onClick={() => scrollToSection(item)}
          >
            {item.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Scrollable Content Body */}
      <div className="cases-content-body">
        <div className="section-container" ref={summaryRef}>
          {renderSummary()}
        </div>

        <div className="section-container" ref={notesRef}>
          {renderIssueNotes()}
        </div>

        <div className="section-container" ref={attachmentsRef}>
          {renderAttachments()}
        </div>

        <div className="section-container" ref={historyRef}>
          {renderHistory()}
        </div>
        <div className="activity-section">
          <div className="section-title">
            <h3>Recent Activity</h3>
          </div>
          {activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div
                className="activity-icon-wrapper"
                style={{ background: activity.color, color: activity.iconColor }}
              >
                {activity.icon}
              </div>
              <div className="activity-content">
                <h4>{activity.title}</h4>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
          <Button className="view-history-btn" onClick={() => scrollToSection('History')}>VIEW FULL HISTORY</Button>
        </div>
      </div>


      {/* Floating Action Button */}
      <div className="fab-btn">
        <EditOutlined />
      </div>

      {/* Page Progress Indicator dots at the bottom */}
      <div className="bottom-dots">
        <div className="dot"></div>
        <div className="dot-active"></div>
        <div className="dot"></div>
      </div>
    </div >
  );
}

export default CasesDetails;
