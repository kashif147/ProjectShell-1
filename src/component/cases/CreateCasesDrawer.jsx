import React, { useState, useRef } from 'react';
import {
    Progress,
    Row,
    Col,
    Input,
    Select,
    DatePicker,
    Radio,
    Tag,
    Upload,
    Button
} from 'antd';
import {
    InboxOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    LinkOutlined,
    PlusOutlined
} from '@ant-design/icons';
import MyDrawer from '../common/MyDrawer';
import "../../styles/CreateCasesDrawer.css";

const { Dragger } = Upload;
const { TextArea } = Input;

const CreateCasesDrawer = ({ open, onClose }) => {
    const [activeNav, setActiveNav] = useState('1');
    const [priority, setPriority] = useState('Medium');

    // Refs for scroll navigation
    const caseInfoRef = useRef(null);
    const incidentRef = useRef(null);
    const legalRef = useRef(null);
    const workflowRef = useRef(null);

    const scrollToSection = (ref, navId) => {
        setActiveNav(navId);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const headerActions = (
        <div className="case-drawer-header-actions">
            <Button className="header-discard-btn" onClick={onClose}>Discard</Button>
            <Button className="header-save-draft-btn">Save Draft</Button>
            <Button className="header-finalize-btn" type="primary">Finalize Case</Button>
            <a href="#" className="header-help-btn">Help</a>
        </div>
    );

    const renderCaseInfo = () => (
        <div className="form-section" ref={caseInfoRef}>
            <h3 className="section-title">Case Info</h3>
            <Row gutter={24}>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Case Title</label>
                        <Input placeholder="Enter descriptive title" />
                    </div>
                </Col>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Assigned Lead</label>
                        <Select
                            placeholder="Select Lead Counsel"
                            style={{ width: '100%' }}
                            options={[{ value: 'alex', label: 'Alex Rivera' }]}
                        />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Case ID (Auto-generated)</label>
                        <Input value="IRA - 2024 - 00012" disabled />
                    </div>
                </Col>
            </Row>
        </div>
    );

    const renderIncidentDetails = () => (
        <div className="form-section" ref={incidentRef}>
            <h3 className="section-title">Incident Details</h3>
            <Row gutter={24}>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Incident Date</label>
                        <DatePicker style={{ width: '100%' }} format="MM/DD/YYYY" placeholder="mm/dd/yyyy" />
                    </div>
                </Col>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Location</label>
                        <Input placeholder="City, Region or Branch" />
                    </div>
                </Col>
            </Row>
            <div className="case-input-container">
                <label className="form-label">Incident Description</label>
                <div className="description-rich-editor">
                    <div className="description-toolbar">
                        <BoldOutlined className="toolbar-icon" style={{ marginRight: 12 }} />
                        <ItalicOutlined className="toolbar-icon" style={{ marginRight: 12 }} />
                        <UnderlineOutlined className="toolbar-icon" style={{ marginRight: 12 }} />
                        <LinkOutlined className="toolbar-icon" />
                    </div>
                    <TextArea
                        rows={4}
                        placeholder="Describe the incident in detail..."
                        className="description-textarea"
                    />
                </div>
            </div>
        </div>
    );

    const renderLegalTeam = () => (
        <div className="form-section" ref={legalRef}>
            <h3 className="section-title">Legal Team</h3>
            <div className="case-input-container">
                <label className="form-label">Internal Stakeholders</label>
                <div className="stakeholders-container">
                    <Tag closable className="stakeholder-tag">Legal Dept</Tag>
                    <Tag closable className="stakeholder-tag">HR Compliance</Tag>
                    <span className="add-member-btn"><PlusOutlined /> Add Member</span>
                </div>
            </div>
            <div className="case-input-container">
                <label className="form-label">Initial Documentation</label>
                <Dragger className="case-upload-dragger">
                    <div className="upload-icon-container">
                        <InboxOutlined className="upload-icon" />
                    </div>
                    <p className="upload-text">Upload files</p>
                    <p className="upload-hint">Drag & drop your legal relevant PDFs, Photos, or Scans</p>
                </Dragger>
            </div>
        </div>
    );

    const renderWorkflow = () => (
        <div className="form-section" ref={workflowRef}>
            <h3 className="section-title">WorkFlow</h3>
            <Row gutter={24}>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Priority Level</label>
                        <Radio.Group
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="priority-group"
                        >
                            <Radio.Button value="Low" className="priority-btn">Low</Radio.Button>
                            <Radio.Button value="Medium" className="priority-btn">Medium</Radio.Button>
                            <Radio.Button value="High" className="priority-btn">High</Radio.Button>
                        </Radio.Group>
                    </div>
                </Col>
                <Col span={12}>
                    <div className="case-input-container">
                        <label className="form-label">Deadline</label>
                        <DatePicker style={{ width: '100%' }} format="MM/DD/YYYY" placeholder="mm/dd/yyyy" />
                    </div>
                </Col>
            </Row>
        </div>
    );

    return (
        <MyDrawer
            title="New Case Entry"
            open={open}
            onClose={onClose}
            width={700}
            isPagination={false}
            extra={headerActions}
        >
            <div className="create-case-drawer-content">
                {/* Progress Bar */}
                <div className="completion-progress-container">
                    <div className="progress-header">
                        <span className="progress-title">COMPLETION PROGRESS</span>
                        <span className="progress-percentage">45%</span>
                    </div>
                    <Progress percent={45} showInfo={false} strokeWidth={8} />
                </div>

                {/* Anchor Navigation */}
                <div className="case-anchor-nav">
                    <div
                        className={`anchor-nav-item ${activeNav === '1' ? 'active' : ''}`}
                        onClick={() => scrollToSection(caseInfoRef, '1')}
                    >
                        Case Info
                    </div>
                    <div
                        className={`anchor-nav-item ${activeNav === '2' ? 'active' : ''}`}
                        onClick={() => scrollToSection(incidentRef, '2')}
                    >
                        Incident
                    </div>
                    <div
                        className={`anchor-nav-item ${activeNav === '3' ? 'active' : ''}`}
                        onClick={() => scrollToSection(legalRef, '3')}
                    >
                        Legal
                    </div>
                    <div
                        className={`anchor-nav-item ${activeNav === '4' ? 'active' : ''}`}
                        onClick={() => scrollToSection(workflowRef, '4')}
                    >
                        WorkFlow
                    </div>
                </div>

                {/* Scrollable Sections */}
                <div className="case-form-scroll-container">
                    {renderCaseInfo()}
                    {renderIncidentDetails()}
                    {renderLegalTeam()}
                    {renderWorkflow()}
                </div>
            </div>
        </MyDrawer>
    );
};

export default CreateCasesDrawer;
