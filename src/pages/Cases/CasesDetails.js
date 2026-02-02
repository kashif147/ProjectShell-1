import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Avatar, Button, Row, Col, Tooltip } from 'antd';
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
  FolderOpenOutlined
} from '@ant-design/icons';
import "../../styles/CasesDetails.css";

import MySearchInput from "../../component/common/MySearchInput";

function CasesDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const caseId = location.state?.caseId || "#8821";

  const [activeTabKey, setActiveTabKey] = useState('1');
  const [activeStep, setActiveStep] = useState('Intake');

  const steps = ['Intake', 'Investigation', 'Review', 'Closed'];

  const teamMembers = [
    { name: 'Sarah C.', avatar: 'https://i.pravatar.cc/150?u=sarah', active: true },
    { name: 'Michael S.', avatar: 'https://i.pravatar.cc/150?u=michael', active: false },
    { name: 'David W.', avatar: 'https://i.pravatar.cc/150?u=david', active: false },
  ];

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

  const renderSummary = () => (
    <div className="summary-content">
      <div className="summary-grid">
        <span className="summary-label">Assigne</span>
        <div className="owner-value">
          <span className="summary-value">Alex Rivera</span>
          <Avatar size="small" src="https://i.pravatar.cc/150?u=alex" />
        </div>

        <span className="summary-label">Created Date</span>
        <span className="summary-value" style={{ textAlign: 'right' }}>Oct 24, 2023</span>

        <span className="summary-label">Type</span>
        <span className="summary-value" style={{ textAlign: 'right' }}>Compliance</span>

        <span className="summary-label">Department</span>
        <span className="summary-value" style={{ textAlign: 'right' }}>Global Risk (GRA)</span>
      </div>

      <div className="description-section">
        <span className="summary-label">Internal Description</span>
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
          <div className="add-member-btn">
            <PlusOutlined />
          </div>
        </div>
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
        <Button className="view-history-btn" onClick={() => setActiveTabKey('4')}>VIEW FULL HISTORY</Button>
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
          <Button type="text" icon={<DownloadOutlined style={{ fontSize: 18 }} />} />
          <Button type="text" icon={<ShareAltOutlined style={{ fontSize: 18 }} />} />
        </div>
        <Button type="primary" className="upload-new-btn" icon={<PlusOutlined />}>Upload New</Button>
      </div>

      <div className="attachments-sub-tabs">
        <div className="sub-tab active">ALL FILES</div>
        <div className="sub-tab">RECENT</div>
        <div className="sub-tab">STARRED</div>
      </div>

      <div className="attachments-breadcrumb">
        <FolderOpenOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />
        <span className="breadcrumb-item">Case #4492</span>
        <span className="breadcrumb-sep">{'>'}</span>
        <span className="breadcrumb-item active">Legal Documents</span>
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
            <EllipsisOutlined style={{ fontSize: 20, color: '#bfbfbf', cursor: 'pointer' }} />
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

  const tabItems = [
    {
      key: '1',
      label: 'SUMMARY',
      children: renderSummary(),
    },
    {
      key: '2',
      label: 'ISSUE NOTES',
      children: <div style={{ padding: 20 }}>Case notes content...</div>,
    },
    {
      key: '3',
      label: 'EMAILS AND ATTACHMENTS',
      children: renderAttachments(),
    },
    {
      key: '4',
      label: 'HISTORY',
      children: renderHistory(),
    },
  ];

  return (
    <div className="cases-details-container">
      {/* Header */}
      <div className="case-header">
        <div className="case-header-left">
          <ArrowLeftOutlined style={{ cursor: 'pointer', fontSize: '18px' }} onClick={() => navigate(-1)} />
          <div className="tag-container">
            <span className="theme-status theme-status-info">IN PROGRESS</span>
            <span className="theme-status theme-status-error">HIGH PRIORITY</span>
          </div>
        </div>
        <div className="case-header-right">
          <ShareAltOutlined style={{ marginRight: 16, cursor: 'pointer', fontSize: '18px' }} />
          <EllipsisOutlined style={{ cursor: 'pointer', fontSize: '18px' }} />
        </div>
      </div>

      {/* Stepper */}
      <div className="workflow-stepper">
        {steps.map((step) => (
          <div
            key={step}
            className={`stepper-item ${activeStep === step ? 'active' : ''}`}
            onClick={() => setActiveStep(step)}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        className="custom-tabs"
        items={tabItems}
      />

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
