import React, { useState, useRef } from "react";
import { Progress, Radio, Upload, Button, Checkbox, Row, Col } from "antd";
import {
  InboxOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  LinkOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import CustomSelect from "../common/CustomSelect";
import "../../styles/CreateCasesDrawer.css";

const { Dragger } = Upload;

const CreateCasesDrawer = ({ open, onClose }) => {
  const [priority, setPriority] = useState("Medium");
  const [caseTitle, setCaseTitle] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [caseType, setCaseType] = useState("");
  const [status, setStatus] = useState("Draft");
  const [caseFileNumber, setCaseFileNumber] = useState("");
  const [assignedLead, setAssignedLead] = useState("");
  const [deadline, setDeadline] = useState(null);

  // Refs for scroll navigation if needed in future
  const issueRef = useRef(null);
  const incidentRef = useRef(null);
  const classificationRef = useRef(null);
  const referenceRef = useRef(null);
  const ownershipRef = useRef(null);
  const documentationRef = useRef(null);
  const workflowRef = useRef(null);

  const headerActions = (
    <div className="case-drawer-header-actions">
      <Button className="header-discard-btn" onClick={onClose}>
        Discard
      </Button>
      <Button className="header-save-draft-btn">Save Draft</Button>
      <Button className="header-finalize-btn" type="primary">
        Finalize Case
      </Button>
      <a href="#" className="header-help-btn">
        Help
      </a>
    </div>
  );

  const renderIssueOverview = () => (
    <div className="form-section issue-overview-section" ref={issueRef}>
      <div className="section-header-row">
        <h3 className="section-title">Issue Overview</h3>
        <Checkbox className="pertinent-checkbox">
          Pertinent to File Review
        </Checkbox>
      </div>
      <MyInput
        label="Title"
        name="caseTitle"
        value={caseTitle}
        onChange={(e) => setCaseTitle(e.target.value)}
        placeholder="Enter descriptive title"
      />
      <MyInput
        label="Description"
        name="incidentDescription"
        value={incidentDescription}
        onChange={(e) => setIncidentDescription(e.target.value)}
        placeholder="Detailed description of the incident..."
        type="textarea"
        rows={2}
      />
    </div>
  );

  const renderIncidentDetails = () => (
    <div className="form-section" ref={incidentRef}>
      <h3 className="section-title">Incident Details</h3>
      <Row gutter={16}>
        <Col span={8}>
          <MyDatePicker1
            label="Date"
            name="incidentDate"
            value={incidentDate}
            onChange={setIncidentDate}
            placeholder="DD/MM/YYYY"
            format="DD/MM/YYYY"
          />
        </Col>
        <Col span={16}>
          <MyInput
            label="Location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Region or Branch"
          />
        </Col>
      </Row>
    </div>
  );

  const renderClassification = () => (
    <div className="form-section" ref={classificationRef}>
      <h3 className="section-title">Classification</h3>
      <Row gutter={16}>
        <Col span={8}>
          <CustomSelect
            label="Category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Select Category"
            options={[
              { label: "Misconduct", value: "misconduct" },
              { label: "Harassment", value: "harassment" },
            ]}
          />
        </Col>
        <Col span={8}>
          <CustomSelect
            label="Case Type"
            name="caseType"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            placeholder="Select Type"
            options={[
              { label: "Internal", value: "internal" },
              { label: "External", value: "external" },
            ]}
          />
        </Col>
        <Col span={8}>
          <CustomSelect
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Select Status"
            options={[
              { label: "Draft", value: "Draft" },
              { label: "Active", value: "Active" },
            ]}
          />
        </Col>
      </Row>
    </div>
  );

  const renderCaseReference = () => (
    <div className="form-section" ref={referenceRef}>
      <h3 className="section-title">Case Reference</h3>
      <Row gutter={16}>
        <Col span={12}>
          <MyInput
            label="Case File Number"
            name="caseFileNumber"
            value={caseFileNumber}
            onChange={(e) => setCaseFileNumber(e.target.value)}
            placeholder="e.g. CFN-88210"
          />
        </Col>
        <Col span={12}>
          <MyInput
            label="Case ID (Auto-generated)"
            name="caseId"
            value="GRA-2023-9892"
            disabled={true}
          />
        </Col>
      </Row>
    </div>
  );

  const renderOwnership = () => (
    <div className="form-section" ref={ownershipRef}>
      <h3 className="section-title">Ownership</h3>
      <Row gutter={16}>
        <Col span={8}>
          <CustomSelect
            label="Assigned to"
            name="assignedLead"
            value={assignedLead}
            onChange={(e) => setAssignedLead(e.target.value)}
            placeholder="Select Lead Counsel"
            options={[
              { label: "Alex Rivera", value: "alex" },
              { label: "John Smith", value: "john" },
              { label: "Sarah Johnson", value: "sarah" },
            ]}
          />
        </Col>
        <Col span={16}>
          <MyInput
            label="Internal Stakeholders"
            name="stakeholders"
            value="Legal Dept, HR Compliance"
            placeholder="Enter stakeholders"
            disabled={true}
          />
        </Col>
      </Row>
    </div>
  );

  const renderDocumentation = () => (
    <div className="form-section" ref={documentationRef}>
      <h3 className="section-title">Documentation</h3>
      <label className="form-label">Initial Documentation</label>
      <Dragger className="case-upload-dragger">
        <p className="upload-icon-wrapper">
          <InboxOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
        </p>
        <p className="upload-hint">
          Drag & drop or tap to select PDFs, PNGs, or DOCX
        </p>
      </Dragger>
    </div>
  );

  const renderWorkflow = () => (
    <div className="form-section" ref={workflowRef}>
      <h3 className="section-title">Workflow</h3>
      <Row gutter={16}>
        <Col span={16}>
          <div className="case-input-container">
            <label className="form-label">Priority Level</label>
            <div className="priority-control-container">
              <Radio.Group
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                buttonStyle="solid"
                className="priority-group"
              >
                <Radio.Button value="Low" className="priority-btn">
                  Low
                </Radio.Button>
                <Radio.Button value="Medium" className="priority-btn">
                  Medium
                </Radio.Button>
                <Radio.Button value="High" className="priority-btn">
                  High
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <MyDatePicker1
            label="Deadline"
            name="deadline"
            value={deadline}
            onChange={setDeadline}
            placeholder="DD/MM/YYYY"
            format="DD/MM/YYYY"
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <MyDrawer
      title="Create issue"
      open={open}
      onClose={onClose}
      width={900}
      isPagination={false}
      extra={headerActions}
      className="create-case-drawer"
    >
      <div className="create-case-drawer-content">
        {/* Progress Bar */}
        <div className="completion-progress-container">
          <div className="progress-header">
            <span className="progress-title">FORM COMPLETION</span>
            <span className="progress-percentage">25%</span>
          </div>
          <Progress
            percent={25}
            showInfo={false}
            strokeWidth={4}
            strokeColor="#1890ff"
            trailColor="#d9d9d9"
          />
        </div>

        {/* Scrollable Sections */}
        <div className="case-form-scroll-container">
          {renderIssueOverview()}
          {renderIncidentDetails()}
          {renderClassification()}
          {renderCaseReference()}
          {renderOwnership()}
          {renderDocumentation()}
          {renderWorkflow()}
        </div>
      </div>
    </MyDrawer>
  );
};

export default CreateCasesDrawer;
